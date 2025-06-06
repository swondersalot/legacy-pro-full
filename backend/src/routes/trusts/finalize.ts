import express from "express";
import authMiddleware from "../../middleware/auth";
import prisma from "../../../prismaClient";
import { PDFDocument } from "pdf-lib";
import AWS from "aws-sdk";
import logAudit from "../../middleware/auditLogger";
import ApiError from "../../utils/ApiError";

const router = express.Router();
const s3 = new AWS.S3();

router.post("/:id/finalize", authMiddleware, async (req, res, next) => {
  try {
    const trust = await prisma.trust.findUnique({ where: { id: req.params.id } });
    if (!trust) throw new ApiError(404, "Trust not found");

    # Generate PDF using PDFDocument from trust.data.text
    const doc = await PDFDocument.create();
    const page = doc.addPage();
    page.drawText((trust.data as any).text || "", { x: 50, y: 700, size: 12, maxWidth: 500 });
    const pdfBytes = await doc.save();

    const key = \`trusts/\${trust.id}.pdf\`;
    await s3
      .putObject({
        Bucket: process.env.S3_BUCKET_NAME!,
        Key: key,
        Body: Buffer.from(pdfBytes),
        ContentType: "application/pdf"
      })
      .promise();

    await prisma.trust.update({
      where: { id: trust.id },
      data: { status: "FINALIZED", pdfS3Key: key }
    });

    await prisma.vaultFile.create({
      data: {
        userId: req.user.id,
        folderId: await getTrustsFolderId(req.user.id), # implement helper
        fileName: \`\${trust.trustName}.pdf\`,
        fileType: "application/pdf",
        size: pdfBytes.length,
        s3Key: key
      }
    });

    await logAudit({
      userId: req.user.id,
      resourceType: "Trust",
      resourceId: trust.id,
      action: "finalized",
      metadata: {}
    });

    const presignedUrl = s3.getSignedUrl("getObject", {
      Bucket: process.env.S3_BUCKET_NAME!,
      Key: key,
      Expires: 60 * 5
    });

    res.json({ url: presignedUrl });
  } catch (err) {
    next(err);
  }
});

export default router;
