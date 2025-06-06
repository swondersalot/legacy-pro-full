import express from "express";
import authMiddleware from "../../middleware/auth";
import prisma from "../../../prismaClient";
import logAudit from "../../middleware/auditLogger";
import ApiError from "../../utils/ApiError";

const router = express.Router();

// GET /api/vault/folders/:folderId/files
router.get("/folders/:folderId/files", authMiddleware, async (req, res, next) => {
  try {
    const files = await prisma.vaultFile.findMany({
      where: { folderId: req.params.folderId },
      orderBy: { createdAt: "desc" }
    });
    res.json(files);
  } catch (err) {
    next(err);
  }
});

// POST /api/vault/files (after S3 PUT)
router.post("/", authMiddleware, async (req, res, next) => {
  try {
    const { fileName, fileType, size, folderId, s3Key } = req.body;
    const file = await prisma.vaultFile.create({
      data: { userId: req.user.id, fileName, fileType, size, folderId, s3Key }
    });
    await logAudit({
      userId: req.user.id,
      resourceType: "VaultFile",
      resourceId: file.id,
      action: "uploaded",
      metadata: { folderId, fileName, size }
    });
    res.json(file);
  } catch (err) {
    next(err);
  }
});

// GET /api/vault/files/:fileId/download-url
router.get("/files/:fileId/download-url", authMiddleware, async (req, res, next) => {
  try {
    const file = await prisma.vaultFile.findUnique({
      where: { id: req.params.fileId }
    });
    if (!file) throw new ApiError(404, "File not found");
    const s3 = new (require("aws-sdk")).S3();
    const url = s3.getSignedUrl("getObject", {
      Bucket: process.env.S3_BUCKET_NAME!,
      Key: file.s3Key,
      Expires: 300
    });
    await logAudit({
      userId: req.user.id,
      resourceType: "VaultFile",
      resourceId: file.id,
      action: "downloaded",
      metadata: {}
    });
    res.json({ url });
  } catch (err) {
    next(err);
  }
});

// PATCH /api/vault/files/:fileId
router.patch("/files/:fileId", authMiddleware, async (req, res, next) => {
  try {
    const { fileName, folderId } = req.body;
    const file = await prisma.vaultFile.findUnique({
      where: { id: req.params.fileId }
    });
    if (!file) throw new ApiError(404, "File not found");

    const updated = await prisma.vaultFile.update({
      where: { id: file.id },
      data: {
        fileName: fileName || file.fileName,
        folderId: folderId || file.folderId
      }
    });

    await logAudit({
      userId: req.user.id,
      resourceType: "VaultFile",
      resourceId: file.id,
      action: folderId ? "moved" : "renamed",
      metadata: {
        oldFileName: file.fileName,
        newFileName: updated.fileName,
        newFolderId: folderId
      }
    });

    res.json(updated);
  } catch (err) {
    next(err);
  }
});

// DELETE /api/vault/files
router.delete("/files", authMiddleware, async (req, res, next) => {
  try {
    const { fileIds } = req.body; // array of IDs
    if (!Array.isArray(fileIds)) throw new ApiError(400, "fileIds must be an array");

    const files = await prisma.vaultFile.findMany({
      where: { id: { in: fileIds } }
    });
    if (files.length === 0) throw new ApiError(404, "No files found");

    // Delete from S3 and DB
    const s3 = new (require("aws-sdk")).S3();
    await Promise.all(
      files.map((f) =>
        s3.deleteObject({ Bucket: process.env.S3_BUCKET_NAME!, Key: f.s3Key }).promise()
      )
    );
    await prisma.vaultFile.deleteMany({ where: { id: { in: fileIds } } });

    await Promise.all(
      files.map((f) =>
        logAudit({
          userId: req.user.id,
          resourceType: "VaultFile",
          resourceId: f.id,
          action: "deleted",
          metadata: {}
        })
      )
    );

    res.json({ message: "Files deleted" });
  } catch (err) {
    next(err);
  }
});

export default router;
