import express from "express";
import authMiddleware from "../../middleware/auth";
import prisma from "../../../prismaClient";
import { v4 as uuidv4 } from "uuid";
import sendEmail from "../../config/email";
import ApiError from "../../utils/ApiError";

const router = express.Router();

// POST /api/vault/emergency
router.post("/", authMiddleware, async (req, res, next) => {
  try {
    const { folderId, granteeEmail, expiresAt } = req.body;
    const folder = await prisma.vaultFolder.findUnique({ where: { id: folderId } });
    if (!folder || folder.userId !== req.user.id) throw new ApiError(404, "Folder not found");

    const grantee = await prisma.user.findUnique({ where: { email: granteeEmail } });
    if (!grantee) throw new ApiError(400, "Grantee must have a Legacy Pro account");

    const code = uuidv4().slice(0, 8);
    const emergency = await prisma.emergencyAccess.create({
      data: {
        folderId,
        granteeUserId: grantee.id,
        expiresAt: new Date(expiresAt),
        code
      }
    });

    const link = `${process.env.FRONTEND_URL}/emergency/${code}`;
    await sendEmail({
      to: granteeEmail,
      subject: "Legacy Pro Emergency Access Granted",
      html: `<p>You have been granted emergency access to folder <strong>${folder.path}</strong>. View here: <a href="${link}">${link}</a>. This link expires on ${new Date(expiresAt).toDateString()}.</p>`
    });

    res.json({ message: "Emergency access granted" });
  } catch (err) {
    next(err);
  }
});

// GET /api/vault/emergency/:code
router.get("/:code", async (req, res, next) => {
  try {
    const access = await prisma.emergencyAccess.findUnique({ where: { code: req.params.code } });
    if (!access || new Date(access.expiresAt) < new Date()) {
      return res.status(410).json({ error: "Access expired or invalid" });
    }
    const files = await prisma.vaultFile.findMany({ where: { folderId: access.folderId } });
    const s3 = new (require("aws-sdk")).S3();
    const filesWithUrls = files.map((f) => {
      const url = s3.getSignedUrl("getObject", {
        Bucket: process.env.S3_BUCKET_NAME!,
        Key: f.s3Key,
        Expires: 300
      });
      return { id: f.id, fileName: f.fileName, url };
    });
    res.json({ files: filesWithUrls });
  } catch (err) {
    next(err);
  }
});

export default router;
