import express from "express";
import prisma from "../../../prismaClient";

const router = express.Router();

// GET /api/subscriptions/plans
router.get("/plans", async (req, res, next) => {
  try {
    const plans = await prisma.subscriptionPlan.findMany();
    res.json(plans);
  } catch (err) {
    next(err);
  }
});

export default router;
