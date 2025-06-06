import express from "express";
import clausesData from "../../../data/clauses.json";

const router = express.Router();

// GET /api/trusts/clauses?state=XX
router.get("/clauses", (req, res) => {
  const state = (req.query.state as string)?.toUpperCase();
  if (!state) return res.status(400).json({ error: "State parameter is required." });
  const clauses = clausesData[state] || [];
  res.json({ clauses });
});

export default router;
