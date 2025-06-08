import express from "express";
import authMiddleware from "../../middleware/auth";
import prisma from "../../../prismaClient";
import stripe from "../../config/stripe";
import ApiError from "../../utils/ApiError";

const router = express.Router();

// POST /api/subscriptions/subscribe
router.post("/subscribe", authMiddleware, async (req, res, next) => {
  try {
    const { planId } = req.body;
    const user = await prisma.user.findUnique({ where: { id: req.user.id } });
    const plan = await prisma.subscriptionPlan.findUnique({ where: { id: planId } });
    if (!plan) throw new ApiError(404, "Plan not found");

    if (plan.priceCents === 0) {
      const subscription = await prisma.userSubscription.create({
        data: {
          userId: user!.id,
          planId: plan.id,
          status: "ACTIVE",
          startDate: new Date()
        }
      });
      return res.json({ subscription });
    }

    const session = await stripe.checkout.sessions.create({
      mode: "subscription",
      payment_method_types: ["card"],
      customer_email: user!.email!,
      line_items: [{ price: plan.stripePlanId, quantity: 1 }],
      success_url: `${process.env.FRONTEND_URL}/settings/plan?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${process.env.FRONTEND_URL}/settings/plan`
    });

    res.json({ sessionId: session.id, url: session.url });
  } catch (err) {
    next(err);
  }
});

export default router;
