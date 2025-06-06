import express from "express";
import authMiddleware from "../../middleware/auth";
import prisma from "../../../prismaClient";
import { PDFDocument } from "pdf-lib";
import AWS from "aws-sdk";
import logAudit from "../../middleware/auditLogger";
import ApiError from "../../utils/ApiError";

const router = express.Router();
const s3 = new AWS.S3();

// POST /api/legacy-letter/:id/finalize
router.post("/:id/finalize", authMiddleware, async (req, res, next) => {
  try {
    const letter = await prisma.legacyLetter.findUnique({ where: { id: req.params.id } });
    if (!letter) throw new ApiError(404, "Letter not found");

    const doc = await PDFDocument.create();
    const page = doc.addPage();
    page.drawText(letter.body, { x: 50, y: 700, size: 12, maxWidth: 500 });
    const pdfBytes = await doc.save();

    const key = \`legacy-letters/\${letter.id}.pdf\`;
    await s3.putObject({
      Bucket: process.env.S3_BUCKET_NAME!,
      Key: key,
      Body: Buffer.from(pdfBytes),
      ContentType: "application/pdf"
    }).promise();

    await prisma.legacyLetter.update({
      where: { id: letter.id },
      data: { status: "FINALIZED", pdfS3Key: key }
    });

    await prisma.vaultFile.create({
      data: {
        userId: req.user.id,
        folderId: await getLegacyLettersFolderId(req.user.id), # implement helper
        fileName: \`LegacyLetter_\${letter.id}.pdf\`,
        fileType: "application/pdf",
        size: pdfBytes.length,
        s3Key: key
      }
    });

    await logAudit({
      userId: req.user.id,
      resourceType: "LegacyLetter",
      resourceId: letter.id,
      action: "finalized",
      metadata: {}
    });

    const presignedUrl = s3.getSignedUrl("getObject", {
      Bucket: process.env.S3_BUCKET_NAME!,
      Key: key,
      Expires: 300
    });

    res.json({ url: presignedUrl });
  } catch (err) {
    next(err);
  }
});

export default router;
