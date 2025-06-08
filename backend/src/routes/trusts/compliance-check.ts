import express from "express";
import authMiddleware from "../../middleware/auth";
import prisma from "../../../prismaClient";
import OpenAI from "openai";
import ApiError from "../../utils/ApiError";

const router = express.Router();
const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

router.post("/compliance-check", authMiddleware, async (req, res, next) => {
  try {
    const { trustId } = req.body;
    const trust = await prisma.trust.findUnique({ where: { id: trustId } });
    if (!trust) throw new ApiError(404, "Trust not found");

    const prompt = `
You are ComplianceGPT, an attorney AI. Review the following \${trust.type} Trust for \${trust.state} compliance. Identify missing required sections or issues. Return JSON: { "pass": boolean, "issues": string[] }.
Document:
\${(trust.data as any).text || ""}
    `;

    const response = await openai.chat.completions.create({
      model: "gpt-4-turbo",
      messages: [
        { role: "system", content: "You are ComplianceGPT, a corporate law expert." },
        { role: "user", content: prompt }
      ]
    });

    let json;
    try {
      json = JSON.parse(response.choices[0].message.content);
    } catch {
      throw new ApiError(500, "Invalid compliance response format");
    }

    res.json(json);
  } catch (err) {
    next(err);
  }
});

export default router;
