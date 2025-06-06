import express from "express";
import authMiddleware from "../../middleware/auth";
import prisma from "../../../prismaClient";
import archiver from "archiver";
import AWS from "aws-sdk";
import ApiError from "../../utils/ApiError";

const router = express.Router();
const s3 = new AWS.S3();

// POST /api/vault/export
router.post("/export", authMiddleware, async (req, res, next) => {
  try {
    const { fileIds } = req.body;
    if (!Array.isArray(fileIds)) throw new ApiError(400, "fileIds must be an array");

    const files = await prisma.vaultFile.findMany({
      where: { id: { in: fileIds } }
    });
    if (files.length === 0) throw new ApiError(404, "No files found");

    res.setHeader("Content-Type", "application/zip");
    res.setHeader("Content-Disposition", 'attachment; filename="vault_export.zip"');

    const archive = archiver("zip");
    archive.on("error", (err) => next(err));
    archive.pipe(res);

    for (const file of files) {
      const s3Stream = s3
        .getObject({ Bucket: process.env.S3_BUCKET_NAME!, Key: file.s3Key })
        .createReadStream();
      archive.append(s3Stream, { name: file.fileName });
    }

    await archive.finalize();
  } catch (err) {
    next(err);
  }
});

export default router;
