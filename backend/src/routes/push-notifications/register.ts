import express from "express";
import authMiddleware from "../../middleware/auth";
import prisma from "../../../prismaClient";
import ApiError from "../../utils/ApiError";

const router = express.Router();

// POST /api/push-notifications/send-token
router.post("/send-token", authMiddleware, async (req, res, next) => {
  try {
    const { token } = req.body;
    if (!token) throw new ApiError(400, "Token is required");
    await prisma.pushToken.upsert({
      where: { userId_token: { userId: req.user.id, token } },
      update: {},
      create: { userId: req.user.id, token },
    });
    res.json({ message: "Token registered" });
  } catch (err) {
    next(err);
  }
});

export default router;
