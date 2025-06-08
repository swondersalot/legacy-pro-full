import express from "express";
import authMiddleware from "../../middleware/auth";
import prisma from "../../../prismaClient";

const router = express.Router();

// GET /api/dashboard/metrics/users
router.get("/metrics/users", authMiddleware, async (req, res, next) => {
  try {
    const growth = await prisma.$queryRaw`
      SELECT to_char("createdAt", 'YYYY-MM') AS month, COUNT(*) AS count
      FROM "User"
      GROUP BY month
      ORDER BY month DESC
      LIMIT 12;
    `;
    const totalUsers = await prisma.user.count();
    res.json({ growth, totalUsers });
  } catch (err) {
    next(err);
  }
});

// GET /api/dashboard/metrics/subscriptions
router.get("/metrics/subscriptions", authMiddleware, async (req, res, next) => {
  try {
    const byPlanRaw = await prisma.$queryRaw`
      SELECT "planId", COUNT(*) AS count
      FROM "UserSubscription"
      WHERE status = 'ACTIVE'
      GROUP BY "planId";
    `;
    const byPlan = {};
    for (const row of byPlanRaw as any[]) {
      const plan = await prisma.subscriptionPlan.findUnique({ where: { id: row.planId } });
      byPlan[plan!.name] = parseInt(row.count);
    }
    const lastMonth = new Date();
    lastMonth.setMonth(lastMonth.getMonth() - 1);
    const canceledLastMonth = await prisma.userSubscription.count({
      where: { status: "CANCELED", updatedAt: { gte: lastMonth } }
    });
    const activeAtStart = await prisma.userSubscription.count({
      where: { updatedAt: { lte: lastMonth }, status: "ACTIVE" }
    });
    const churnRate = activeAtStart ? canceledLastMonth / activeAtStart : 0;
    res.json({ byPlan, churnRate });
  } catch (err) {
    next(err);
  }
});

// GET /api/dashboard/metrics/vault
router.get("/metrics/vault", authMiddleware, async (req, res, next) => {
  try {
    const monthlyUsage = await prisma.$queryRaw`
      SELECT to_char("createdAt", 'YYYY-MM') AS month, SUM(size) AS bytes
      FROM "VaultFile"
      GROUP BY month
      ORDER BY month DESC
      LIMIT 12;
    `;
    res.json({ monthlyUsage });
  } catch (err) {
    next(err);
  }
});

// GET /api/dashboard/metrics/api-usage
router.get("/metrics/api-usage", authMiddleware, async (req, res, next) => {
  try {
    const usageRaw = await prisma.aIUsageLog.groupBy({
      by: ["feature"],
      _sum: { tokensUsed: true }
    });
    const callsByFeature = {};
    (usageRaw as any[]).forEach((u) => {
      callsByFeature[u.feature] = u._sum.tokensUsed;
    });
    const errorRate = 0.015;
    res.json({ callsByFeature, errorRate });
  } catch (err) {
    next(err);
  }
});

export default router;
