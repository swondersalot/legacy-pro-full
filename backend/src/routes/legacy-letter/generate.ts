import express from "express";
import authMiddleware from "../../middleware/auth";
import prisma from "../../../prismaClient";
import OpenAI from "openai";
import logAudit from "../../middleware/auditLogger";
import ApiError from "../../utils/ApiError";

const router = express.Router();
const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

// POST /api/legacy-letter/generate
router.post("/generate", authMiddleware, async (req, res, next) => {
  try {
    const { tone, recipients, attachedDocs } = req.body;
    if (!tone || !recipients || !Array.isArray(recipients)) throw new ApiError(400, "Invalid input");

    const newLetter = await prisma.legacyLetter.create({
      data: {
        userId: req.user.id,
        tone,
        recipients,
        attachedDocs,
        status: "DRAFT"
      }
    });

    // Fetch summaries of attached documents (implement getDocSummary separately)
    const docsData = await Promise.all(
      attachedDocs.map(async (key: string) => {
        return await getDocSummary(key);
      })
    );

    const prompt = `
You are an estate planning advisor AI. Draft a \${tone} legacy letter addressed to \${recipients.join(", ")}. Summaries: \${JSON.stringify(docsData)}. Provide final letter text.
`;

    res.setHeader("Content-Type", "text/event-stream");
    res.setHeader("Cache-Control", "no-cache");

    let letterText = "";
    const completion = await openai.chat.completions.create({
      model: "gpt-4-turbo",
      messages: [
        { role: "system", content: "You are ComplianceGPT, a legal advisor." },
        { role: "user", content: prompt }
      ],
      stream: true
    });

    for await (const chunk of completion) {
      const text = chunk.choices[0].delta?.content || "";
      letterText += text;
      res.write(text);
    }
    res.end();

    await prisma.legacyLetter.update({
      where: { id: newLetter.id },
      data: { body: letterText }
    });

    await logAudit({
      userId: req.user.id,
      resourceType: "LegacyLetter",
      resourceId: newLetter.id,
      action: "generated_draft",
      metadata: { tokensUsed: completion.usage.total_tokens }
    });
  } catch (err) {
    next(err);
  }
});

export default router;
