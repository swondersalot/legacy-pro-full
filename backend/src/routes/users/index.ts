import express from "express";
import authMiddleware from "../../middleware/auth";
import prisma from "../../../prismaClient";
import bcrypt from "bcrypt";
import sendEmail from "../../config/email";
import sendSMS from "../../config/sms";
import ApiError from "../../utils/ApiError";

const router = express.Router();

// GET /api/users/me
router.get("/me", authMiddleware, async (req, res, next) => {
  try {
    const user = await prisma.user.findUnique({ where: { id: req.user.id } });
    if (!user) throw new ApiError(404, "User not found");
    res.json(user);
  } catch (err) {
    next(err);
  }
});

// PATCH /api/users/me
router.patch("/me", authMiddleware, async (req, res, next) => {
  try {
    const { name, locale } = req.body;
    const updated = await prisma.user.update({
      where: { id: req.user.id },
      data: { name, locale }
    });
    res.json(updated);
  } catch (err) {
    next(err);
  }
});

// POST /api/users/me/avatar
router.post("/me/avatar", authMiddleware, async (req, res, next) => {
  try {
    const { fileName, fileType, size } = req.body;
    // Generate presigned PUT URL for S3 (implement getPresignedPutUrl separately)
    const key = `avatars/${req.user.id}/${fileName}`;
    const putUrl = await getPresignedPutUrl(key, fileType);
    res.json({ key, url: putUrl });
  } catch (err) {
    next(err);
  }
});

// POST /api/users/me/password
router.post("/me/password", authMiddleware, async (req, res, next) => {
  try {
    const { currentPassword, newPassword } = req.body;
    const user = await prisma.user.findUnique({ where: { id: req.user.id } });
    if (!user?.passwordHash) throw new ApiError(400, "No password set");
    const match = await bcrypt.compare(currentPassword, user.passwordHash);
    if (!match) throw new ApiError(400, "Current password incorrect");
    const hash = await bcrypt.hash(newPassword, 10);
    await prisma.user.update({
      where: { id: req.user.id },
      data: { passwordHash: hash }
    });
    res.json({ message: "Password updated" });
  } catch (err) {
    next(err);
  }
});

// POST /api/users/me/2fa/setup
router.post("/me/2fa/setup", authMiddleware, async (req, res, next) => {
  try {
    const secret = generateTOTPSecret(); // implement separately
    const qrCodeDataURL = await generateQRCodeDataURL(secret); // implement separately
    await prisma.user.update({
      where: { id: req.user.id },
      data: { twoFASecret: encrypt(secret) } // implement encrypt separately
    });
    res.json({ qrCodeDataURL });
  } catch (err) {
    next(err);
  }
});

// POST /api/users/me/2fa/verify
router.post("/me/2fa/verify", authMiddleware, async (req, res, next) => {
  try {
    const { token } = req.body;
    const user = await prisma.user.findUnique({ where: { id: req.user.id } });
    const secret = decrypt(user?.twoFASecret!); // implement decrypt separately
    const valid = verifyTOTPToken(secret, token); // implement verify separately
    if (!valid) throw new ApiError(400, "Invalid token");
    await prisma.user.update({
      where: { id: req.user.id },
      data: { twoFAEnabled: true }
    });
    res.json({ message: "2FA enabled" });
  } catch (err) {
    next(err);
  }
});

// DELETE /api/users/me/2fa
router.delete("/me/2fa", authMiddleware, async (req, res, next) => {
  try {
    await prisma.user.update({
      where: { id: req.user.id },
      data: { twoFAEnabled: false, twoFASecret: null }
    });
    res.json({ message: "2FA disabled" });
  } catch (err) {
    next(err);
  }
});

// GET /api/users/checkins
router.get("/checkins", authMiddleware, async (req, res, next) => {
  try {
    const checkIns = await prisma.userCheckIn.findMany({ where: { userId: req.user.id } });
    res.json(checkIns);
  } catch (err) {
    next(err);
  }
});

// POST /api/users/checkins
router.post("/checkins", authMiddleware, async (req, res, next) => {
  try {
    const { frequency, nextDate } = req.body;
    const newCheckIn = await prisma.userCheckIn.create({
      data: { userId: req.user.id, frequency, nextDate: new Date(nextDate) }
    });
    res.json(newCheckIn);
  } catch (err) {
    next(err);
  }
});

// PATCH /api/users/checkins/:id
router.patch("/checkins/:id", authMiddleware, async (req, res, next) => {
  try {
    const { frequency, nextDate } = req.body;
    const updated = await prisma.userCheckIn.update({
      where: { id: req.params.id },
      data: { frequency, nextDate: new Date(nextDate) }
    });
    res.json(updated);
  } catch (err) {
    next(err);
  }
});

// DELETE /api/users/checkins/:id
router.delete("/checkins/:id", authMiddleware, async (req, res, next) => {
  try {
    await prisma.userCheckIn.delete({ where: { id: req.params.id } });
    res.json({ message: "Deleted" });
  } catch (err) {
    next(err);
  }
});

// GET /api/users/notifications
router.get("/notifications", authMiddleware, async (req, res, next) => {
  try {
    const notifications = await prisma.notification.findMany({
      where: { userId: req.user.id },
      orderBy: { createdAt: "desc" }
    });
    res.json(notifications);
  } catch (err) {
    next(err);
  }
});

// PATCH /api/users/notifications/:id/mark-read
router.patch("/notifications/:id/mark-read", authMiddleware, async (req, res, next) => {
  try {
    const updated = await prisma.notification.update({
      where: { id: req.params.id },
      data: { read: true }
    });
    res.json(updated);
  } catch (err) {
    next(err);
  }
});

// PATCH /api/users/notifications (preferences)
router.patch("/notifications", authMiddleware, async (req, res, next) => {
  try {
    const { type, enabled } = req.body;
    const pref = await prisma.notificationPreference.upsert({
      where: { userId_type: { userId: req.user.id, type } },
      update: { enabled },
      create: { userId: req.user.id, type, enabled }
    });
    res.json(pref);
  } catch (err) {
    next(err);
  }
});

export default router;
