import express from "express";
import authMiddleware from "../../middleware/auth";
import { v4 as uuidv4 } from "uuid";
import AWS from "aws-sdk";

const router = express.Router();
const s3 = new AWS.S3();

// POST /api/vault/upload-url
router.post("/upload-url", authMiddleware, async (req, res, next) => {
  try {
    const { fileName, fileType, size } = req.body;
    const key = \`vault/\${req.user.id}/\${uuidv4()}-\${fileName}\`;
    const url = s3.getSignedUrl("putObject", {
      Bucket: process.env.S3_BUCKET_NAME!,
      Key: key,
      ContentType: fileType,
      Expires: 300
    });
    res.json({ key, url });
  } catch (err) {
    next(err);
  }
});

export default router;
