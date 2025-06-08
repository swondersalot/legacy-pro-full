import express from "express";
import authMiddleware from "../../middleware/auth";
import prisma from "../../../prismaClient";
import ApiError from "../../utils/ApiError";

const router = express.Router();

// GET /api/vault/folders (get full tree)
router.get("/", authMiddleware, async (req, res, next) => {
  try {
    const folders = await prisma.vaultFolder.findMany({
      where: { userId: req.user.id },
      orderBy: { path: "asc" }
    });
    res.json(folders);
  } catch (err) {
    next(err);
  }
});

// POST /api/vault/folders (create new folder)
router.post("/", authMiddleware, async (req, res, next) => {
  try {
    const { name, parentId } = req.body;
    const parent = parentId
      ? await prisma.vaultFolder.findUnique({ where: { id: parentId } })
      : null;
    const path = parent ? `${parent.path}/${name}` : `/${name}`;
    const newFolder = await prisma.vaultFolder.create({
      data: {
        userId: req.user.id,
        parentId: parentId || null,
        name,
        path
      }
    });
    res.json(newFolder);
  } catch (err) {
    next(err);
  }
});

// PATCH /api/vault/folders/:id (rename/move)
router.patch("/:id", authMiddleware, async (req, res, next) => {
  try {
    const { name, parentId } = req.body;
    const folder = await prisma.vaultFolder.findUnique({
      where: { id: req.params.id }
    });
    if (!folder) throw new ApiError(404, "Folder not found");

    let newPath = `/${name}`;
    if (parentId) {
      const parent = await prisma.vaultFolder.findUnique({ where: { id: parentId } });
      if (!parent) throw new ApiError(404, "Parent not found");
      newPath = `${parent.path}/${name}`;
    }

    const updated = await prisma.vaultFolder.update({
      where: { id: folder.id },
      data: { name, parentId: parentId || null, path: newPath }
    });

    // Update paths of children recursively (implement updateChildrenPaths separately)
    await updateChildrenPaths(folder.id, newPath);

    res.json(updated);
  } catch (err) {
    next(err);
  }
});

// DELETE /api/vault/folders/:id
router.delete("/:id", authMiddleware, async (req, res, next) => {
  try {
    const folder = await prisma.vaultFolder.findUnique({ where: { id: req.params.id } });
    if (!folder) throw new ApiError(404, "Folder not found");
    // Recursively delete folder and contents (implement deleteFolderRecursively separately)
    await deleteFolderRecursively(folder.id);
    res.json({ message: "Folder deleted" });
  } catch (err) {
    next(err);
  }
});

export default router;
