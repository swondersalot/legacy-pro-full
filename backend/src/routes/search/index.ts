import express from "express";
import authMiddleware from "../../middleware/auth";
import prisma from "../../../prismaClient";

const router = express.Router();

// GET /api/search?q=...
router.get("/", authMiddleware, async (req, res, next) => {
  try {
    const { q } = req.query;
    if (!q || typeof q !== "string") return res.status(400).json({ error: "Query is required." });
    const formattedQuery = q.trim().replace(/[^a-zA-Z0-9 ]/g, "");
    const tsQuery = formattedQuery.split(" ").join(" & ");

    const trusts = await prisma.$queryRaw\`
      SELECT id, "trustName" AS title, 'Trust' AS type
      FROM "Trust"
      WHERE to_tsvector("textSearch") @@ plainto_tsquery(\${tsQuery})
      LIMIT 5;
    \`;
    const entities = await prisma.$queryRaw\`
      SELECT id, "entityName" AS title, 'Entity' AS type
      FROM "Entity"
      WHERE to_tsvector("textSearch") @@ plainto_tsquery(\${tsQuery})
      LIMIT 5;
    \`;
    const files = await prisma.$queryRaw\`
      SELECT id, "fileName" AS title, 'VaultFile' AS type
      FROM "VaultFile"
      WHERE to_tsvector("fileName") @@ plainto_tsquery(\${tsQuery})
      LIMIT 5;
    \`;

    res.json({ results: [...trusts, ...entities, ...files] });
  } catch (err) {
    next(err);
  }
});

export default router;
