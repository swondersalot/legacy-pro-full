import express from "express";
import authMiddleware from "../../middleware/auth";
import prisma from "../../../prismaClient";
import admin from "firebase-admin";
import ApiError from "../../utils/ApiError";

const router = express.Router();

// Initialize Firebase Admin
if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert(JSON.parse(process.env.FCM_SERVICE_ACCOUNT!))
  });
}

// POST /api/push-notifications/send
router.post("/send", authMiddleware, async (req, res, next) => {
  try {
    const { title, body } = req.body;
    const tokens = await prisma.pushToken.findMany({ where: { userId: req.user.id } });
    if (tokens.length === 0) throw new ApiError(400, "No push tokens registered");

    const payload = { notification: { title, body } };
    const response = await admin.messaging().sendToDevice(tokens.map((t) => t.token), payload);
    res.json({ success: true, results: response.results });
  } catch (err) {
    next(err);
  }
});

export default router;
