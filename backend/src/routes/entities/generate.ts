import express from "express";
import authMiddleware from "../../middleware/auth";
import prisma from "../../../prismaClient";
import { z } from "zod";
import OpenAI from "openai";
import logAudit from "../../middleware/auditLogger";
import ApiError from "../../utils/ApiError";

const router = express.Router();
const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

const entitySchema = z.object({
  entityName: z.string().min(3),
  type: z.enum(["LLC", "S_CORP", "C_CORP", "DBA"]),
  owners: z.array(z.object({ name: z.string(), percentage: z.number().min(0).max(100) })).min(1)
    .refine(list => list.reduce((sum, o) => sum + o.percentage, 0) === 100, { message: "Percentages must sum to 100%" }),
  registeredAgent: z.object({ name: z.string(), address: z.string() }),
  state: z.string().length(2),
  purpose: z.string().optional(),
  capital: z.array(z.object({ amount: z.number().positive(), contributionDate: z.string().optional() })).optional(),
  additionalClauses: z.array(z.string()).optional()
});

router.post("/generate", authMiddleware, async (req, res, next) => {
  try {
    const validation = entitySchema.safeParse(req.body);
    if (!validation.success) throw new ApiError(400, validation.error.errors[0].message);

    const input = validation.data;
    const newEntity = await prisma.entity.create({
      data: {
        userId: req.user.id,
        entityName: input.entityName,
        type: input.type,
        owners: input.owners,
        state: input.state,
        purpose: input.purpose,
        capital: input.capital || [],
        additionalClauses: input.additionalClauses || [],
        data: {},
        status: "DRAFT"
      }
    });

    const prompt = `
You are a corporate attorney AI. Generate Articles of Organization for a \${input.type} named \${input.entityName} in \${input.state}, owned by \${JSON.stringify(input.owners)}, registered agent \${JSON.stringify(input.registeredAgent)}, purpose \${input.purpose || "N/A"}. Include any additional clauses: \${JSON.stringify(input.additionalClauses || [])}. Provide the final document text only.
`;

    res.setHeader("Content-Type", "text/event-stream");
    res.setHeader("Cache-Control", "no-cache");

    let documentText = "";
    const completion = await openai.chat.completions.create({
      model: "gpt-4-turbo",
      messages: [
        { role: "system", content: "You are ComplianceGPT, a corporate law expert." },
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

    await prisma.entity.update({
      where: { id: newEntity.id },
      data: { data: { text: documentText } }
    });

    await logAudit({
      userId: req.user.id,
      resourceType: "Entity",
      resourceId: newEntity.id,
      action: "generated_draft",
      metadata: { tokensUsed: completion.usage.total_tokens }
    });
  } catch (err) {
    next(err);
  }
});

export default router;
