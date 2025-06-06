import express from "express";
import authMiddleware from "../../middleware/auth";
import prisma from "../../../prismaClient";
import OpenAI from "openai";
import logAudit from "../../middleware/auditLogger";
import ApiError from "../../utils/ApiError";

const router = express.Router();
const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

// POST /api/ai/advisor
router.post("/", authMiddleware, async (req, res, next) => {
  try {
    const { message } = req.body;
    if (!message) throw new ApiError(400, "Message is required");

    // Check token quota for last 30 days
    const usage = await prisma.aIUsageLog.aggregate({
      where: { userId: req.user.id, feature: "Advisor", createdAt: { gt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) } },
      _sum: { tokensUsed: true }
    });
    const used = usage._sum.tokensUsed || 0;
    const plan = await prisma.userSubscription.findFirst({ where: { userId: req.user.id }, include: { plan: true } });
    const tokenLimit = plan?.plan.priceCents! * 100;
    if (used >= tokenLimit) throw new ApiError(402, "Quota exceeded");

    res.setHeader("Content-Type", "text/event-stream");
    res.setHeader("Cache-Control", "no-cache");

    let aiText = "";
    const completion = await openai.chat.completions.create({
      model: "gpt-4-turbo",
      messages: [
        { role: "system", content: "You are Ava, a friendly legal and legacy planning advisor." },
        { role: "user", content: message }
      ],
      stream: true
    });

    for await (const chunk of completion) {
      const text = chunk.choices[0].delta?.content || "";
      aiText += text;
      res.write(text);
    }
    res.end();

    await prisma.aIUsageLog.create({
      data: {
        userId: req.user.id,
        feature: "Advisor",
        tokensUsed: completion.usage.total_tokens,
        promptHash: hashPrompt(message) // implement hashPrompt separately
      }
    });

    await logAudit({
      userId: req.user.id,
      resourceType: "User",
      resourceId: req.user.id,
      action: "ai_advisor",
      metadata: { tokensUsed: completion.usage.total_tokens }
    });
  } catch (err) {
    next(err);
  }
});

export default router;
