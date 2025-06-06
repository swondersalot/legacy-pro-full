import express from "express";
import { buffer } from "micro";
import stripe from "../../config/stripe";
import prisma from "../../../prismaClient";

const router = express.Router();
const endpointSecret = process.env.STRIPE_WEBHOOK_SECRET!;

// Skip body parsing, use raw buffer
export const config = { api: { bodyParser: false } };

router.post("/webhook", async (req, res) => {
  const sig = req.headers["stripe-signature"]!;
  const buf = await buffer(req);
  let event;

  try {
    event = stripe.webhooks.constructEvent(buf, sig, endpointSecret);
  } catch (err) {
    return res.status(400).send(\`Webhook Error: \${err.message}\`);
  }

  switch (event.type) {
    case "checkout.session.completed": {
      const session = event.data.object;
      const user = await prisma.user.findUnique({
        where: { email: session.customer_email }
      });
      const plan = await prisma.subscriptionPlan.findUnique({
        where: { stripePlanId: session.display_items[0].price.id }
      });
      if (user && plan) {
        await prisma.userSubscription.upsert({
          where: { userId: user.id },
          update: {
            status: "ACTIVE",
            stripeSubId: session.subscription,
            startDate: new Date()
          },
          create: {
            userId: user.id,
            planId: plan.id,
            status: "ACTIVE",
            stripeSubId: session.subscription,
            startDate: new Date()
          }
        });
      }
      break;
    }
    case "invoice.payment_failed":
    case "customer.subscription.deleted": {
      const subscriptionId = event.data.object.id;
      await prisma.userSubscription.updateMany({
        where: { stripeSubId: subscriptionId },
        data: { status: "CANCELED", endDate: new Date() }
      });
      break;
    }
    default:
      break;
  }
  res.json({ received: true });
});

export default router;
