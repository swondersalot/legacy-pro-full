import express from "express";
import authMiddleware from "../../middleware/auth";
import prisma from "../../../prismaClient";

const router = express.Router();

// GET /api/protection-score
router.get("/", authMiddleware, async (req, res, next) => {
  try {
    const userId = req.user.id;
    let breakdown = { trust: 0, entity: 0, vault: 0, security: 0, financial: 0 };
    const suggestions: string[] = [];

    // Trust
    const trust = await prisma.trust.findFirst({ where: { userId, status: "FINALIZED" } });
    if (trust) {
      breakdown.trust += 10;
      const sectionsCompleted = [
        trust.trustName,
        trust.grantor,
        (trust.trustees as any[]).length > 0,
        (trust.beneficiaries as any[]).length > 0,
        trust.state,
        (trust.additionalClauses as string[]).length > 0,
        (trust.assetsIncluded as any[]).length > 0
      ].filter(Boolean).length;
      breakdown.trust += Math.min((sectionsCompleted - 1) * 5, 20);
    } else suggestions.push("Create and finalize a Trust.");

    // Entity
    const entity = await prisma.entity.findFirst({ where: { userId, status: "FINALIZED" } });
    if (entity) {
      breakdown.entity += 10;
      const entitySections = [
        entity.entityName,
        (entity.owners as any[]).length > 0,
        entity.registeredAgent,
        entity.state
      ].filter(Boolean).length;
      breakdown.entity += Math.min((entitySections - 1) * 2.5, 10);
    } else suggestions.push("Create and finalize an Entity.");

    // Vault Coverage
    const requiredDocs = ["Will", "Power of Attorney", "Advance Directives", "Guardianship", "Password Vault"];
    const userFiles = await prisma.vaultFile.findMany({ where: { userId } });
    requiredDocs.forEach((doc) => {
      const hasDoc = userFiles.some((f) => f.fileName.includes(doc));
      if (hasDoc) breakdown.vault += 5;
      else suggestions.push(`Upload your ${doc}.`);
    });

    // Security Settings
    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (user?.twoFAEnabled) breakdown.security += 5;
    else suggestions.push("Enable Two-Factor Authentication.");

    const checkIns = await prisma.userCheckIn.findMany({ where: { userId } });
    if (checkIns.length > 0) breakdown.security += 5;
    else suggestions.push("Set up a scheduled check-in.");

    const emergencyAccess = await prisma.emergencyAccess.findFirst({
      where: { folder: { userId } }
    });
    if (emergencyAccess) breakdown.security += 5;
    else suggestions.push("Grant emergency access.");

    // Financial Hub
    const finAccounts = await prisma.financialAccount.findMany({ where: { userId } });
    if (finAccounts.length > 0) breakdown.financial += 5;
    else suggestions.push("Connect a financial account.");

    const score = Object.values(breakdown).reduce((sum, val) => sum + val, 0);
    res.json({ score, breakdown, suggestions });
  } catch (err) {
    next(err);
  }
});

export default router;
