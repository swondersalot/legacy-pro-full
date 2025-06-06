import express from "express";
import authMiddleware from "../../middleware/auth";
import prisma from "../../../prismaClient";

const router = express.Router();

// GET /api/subscriptions/status
router.get("/status", authMiddleware, async (req, res, next) => {
  try {
    const subscription = await prisma.userSubscription.findFirst({
      where: { userId: req.user.id },
      include: { plan: true }
    });
    if (!subscription) {
      return res.json({ planName: "None", status: "NONE", storageUsedMB: 0, storageLimitMB: 0 });
    }
    const storageUsedBytes = await prisma.vaultFile.aggregate({
      where: { userId: req.user.id },
      _sum: { size: true }
    });
    const storageUsedMB = Math.ceil((storageUsedBytes._sum.size || 0) / (1024 * 1024));
    res.json({
      planName: subscription.plan.name,
      status: subscription.status,
      storageUsedMB,
      storageLimitMB: subscription.plan.storageLimitMB,
      nextBillingDate: subscription.endDate
    });
  } catch (err) {
    next(err);
  }
});

export default router;
