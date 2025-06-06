import express from "express";
import authMiddleware from "../../middleware/auth";
import prisma from "../../../prismaClient";

const router = express.Router();

// GET /api/notifications
router.get("/", authMiddleware, async (req, res, next) => {
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

export default router;
