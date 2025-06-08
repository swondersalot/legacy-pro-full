import express from "express";
import authMiddleware from "../../middleware/auth";
import prisma from "../../../prismaClient";
import OpenAI from "openai";
import ApiError from "../../utils/ApiError";

const router = express.Router();
const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

router.post("/compliance-check", authMiddleware, async (req, res, next) => {
  try {
    const { entityId } = req.body;
    const entity = await prisma.entity.findUnique({ where: { id: entityId } });
    if (!entity) throw new ApiError(404, "Entity not found");

    const prompt = `
You are ComplianceGPT, a corporate law expert. Review the following \${entity.type} formation document for \${entity.state} compliance. Return JSON: { "pass": boolean, "issues": string[] }.
Document:
\${(entity.data as any).text || ""}
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
