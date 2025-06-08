import express from "express";
import authMiddleware from "../../middleware/auth";
import prisma from "../../../prismaClient";
import OpenAI from "openai";
import ApiError from "../../utils/ApiError";

const router = express.Router();
const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

// POST /api/legacy-letter/compliance-check
router.post("/compliance-check", authMiddleware, async (req, res, next) => {
  try {
    const { letterId } = req.body;
    const letter = await prisma.legacyLetter.findUnique({ where: { id: letterId } });
    if (!letter) throw new ApiError(404, "Letter not found");

    const prompt = `
You are ComplianceGPT. Review this legacy letter for legal completeness and tone. Return JSON: { "pass": boolean, "issues": [string] }.
Letter:
\${letter.body}
`;

    const response = await openai.chat.completions.create({
      model: "gpt-4-turbo",
      messages: [
        { role: "system", content: "You are ComplianceGPT." },
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
