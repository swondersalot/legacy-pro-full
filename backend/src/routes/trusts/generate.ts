import express from "express";
import authMiddleware from "../../middleware/auth";
import prisma from "../../../prismaClient";
import { trustSchema } from "../../utils/validationSchemas";
import OpenAI from "openai";
import logAudit from "../../middleware/auditLogger";
import ApiError from "../../utils/ApiError";
import clausesData from "../../../data/clauses.json";

const router = express.Router();
const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

router.post("/generate", authMiddleware, async (req, res, next) => {
  try {
    const validation = trustSchema.validate(req.body);
    if (validation.error) throw new ApiError(400, validation.error.details[0].message);

    const input = req.body;
    const newTrust = await prisma.trust.create({
      data: {
        userId: req.user.id,
        trustName: input.trustName,
        type: input.type,
        grantor: input.grantor,
        trustees: input.trustees,
        successorTrustees: input.successorTrustees,
        beneficiaries: input.beneficiaries,
        state: input.state,
        assetsIncluded: input.assetsIncluded || [],
        additionalClauses: input.additionalClauses || [],
        data: {},
        status: "DRAFT"
      }
    });

    const clauseTexts = input.additionalClauses.map((id: string) => {
      const allClauses = clausesData[input.state];
      const clause = allClauses.find((c: any) => c.id === id);
      return clause ? clause.text : "";
    });

    const prompt = `
You are LegalGPT. Generate a \${input.type} Trust for \${input.state}.
Grantor: \${JSON.stringify(input.grantor)}.
Trustees: \${JSON.stringify(input.trustees)}.
Successor Trustees: \${JSON.stringify(input.successorTrustees)}.
Beneficiaries: \${JSON.stringify(input.beneficiaries)}.
Assets: \${JSON.stringify(input.assetsIncluded)}.
Include clauses: \${clauseTexts.join("\\n\\n")}.
Respond with final document text only.
`;

    res.setHeader("Content-Type", "text/event-stream");
    res.setHeader("Cache-Control", "no-cache");

    let documentText = "";
    const completion = await openai.chat.completions.create({
      model: "gpt-4-turbo",
      messages: [
        { role: "system", content: "You are LegalGPT, an estate planning AI." },
        { role: "user", content: prompt }
      ],
      stream: true
    });

    for await (const chunk of completion) {
      const text = chunk.choices[0].delta?.content || "";
      documentText += text;
      res.write(text);
    }
    res.end();

    await prisma.trust.update({
      where: { id: newTrust.id },
      data: { data: { text: documentText } }
    });

    await logAudit({
      userId: req.user.id,
      resourceType: "Trust",
      resourceId: newTrust.id,
      action: "generated_draft",
      metadata: { tokensUsed: completion.usage.total_tokens }
    });
  } catch (err) {
    next(err);
  }
});

export default router;
