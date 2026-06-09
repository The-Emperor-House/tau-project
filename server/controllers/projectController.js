const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();
const { cloudinary, uploadProject } = require("../utils/cloudinary"); // ถ้ายังใช้ตัวอัปโหลดเดิม
const { isValidId, buildUpdateData, parseDeleteIds } = require("../utils/helpers");

// util: ตรวจ enum type ให้ตรง schema
const VALID_TYPES = ["REBUILD", "RENOVATE", "REDESIGN"];
const isValidType = (t) => typeof t === "string" && VALID_TYPES.includes(t.toUpperCase());

// Create Project
exports.createProject = [
  uploadProject.fields([
    { name: "cover", maxCount: 1 },
    { name: "images", maxCount: 10 },
  ]),
  async (req, res) => {
    const { name, type, details } = req.body;
    const areaSize = req.body.areaSize !== undefined && req.body.areaSize !== null
      ? Number(req.body.areaSize)
      : undefined;

    if (!name || !req.files?.cover?.length) {
      return res.status(400).json({ message: "Missing name or cover image" });
    }
    if (!isValidType(type)) {
      return res.status(400).json({ message: "Invalid project type" });
    }
    if (areaSize !== undefined && (Number.isNaN(areaSize) || areaSize < 0)) {
      return res.status(400).json({ message: "Invalid areaSize" });
    }

    const coverFile = req.files.cover[0];
    const imageFiles = req.files.images || [];

    try {
      const createdProject = await prisma.$transaction(async (tx) => {
        const project = await tx.project.create({
          data: {
            name,
            type: type.toUpperCase(),
            details: details || null,
            areaSize: areaSize ?? null,
            coverUrl: coverFile.path,
            coverPublicId: coverFile.filename,
          },
        });

        if (imageFiles.length > 0) {
          const imageData = imageFiles.map((file) => ({
            projectId: project.id,
            imageUrl: file.path,
            publicId: file.filename,
          }));
          await tx.projectImage.createMany({ data: imageData });
        }

        return project;
      });

      res.json({ message: "Project created", projectId: createdProject.id });
    } catch (err) {
      console.error("Create project error:", err);
      // Clean up uploaded images on error
      const toDelete = [
        coverFile?.filename,
        ...imageFiles.map((f) => f.filename),
      ].filter(Boolean);

      await Promise.allSettled(
        toDelete.map((publicId) => cloudinary.uploader.destroy(publicId))
      );

      res.status(500).json({ message: "Server error" });
    }
  },
];

// Get all projects (filter by type optional)
exports.getAllProjects = async (req, res) => {
  const { type } = req.query;
  try {
    const where = {};
    if (type) {
      if (!isValidType(type)) {
        return res.status(400).json({ message: "Invalid project type" });
      }
      where.type = type.toUpperCase();
    }

    const data = await prisma.project.findMany({
      where,
      orderBy: { createdAt: "desc" },
      include: {
        images: { select: { id: true, imageUrl: true } },
      },
    });
    res.json(data);
  } catch (err) {
    console.error("Get projects error:", err);
    res.status(500).json({ message: "Server error" });
  }
};

// Update project
exports.updateProject = [
  uploadProject.fields([
    { name: "cover", maxCount: 1 },
    { name: "images", maxCount: 10 },
  ]),
  async (req, res) => {
    const id = isValidId(req.params.id);
    if (!id) return res.status(400).json({ message: "Invalid ID" });

    // อนุญาตอัปเดต name, type, details, areaSize
    const updateData = buildUpdateData(["name", "type", "details", "areaSize"], req.body);

    // normalize/validate type
    if (updateData.type !== undefined) {
      if (!isValidType(updateData.type)) {
        return res.status(400).json({ message: "Invalid project type" });
      }
      updateData.type = updateData.type.toUpperCase();
    }

    // normalize/validate areaSize
    if (updateData.areaSize !== undefined) {
      const n = Number(updateData.areaSize);
      if (Number.isNaN(n) || n < 0) {
        return res.status(400).json({ message: "Invalid areaSize" });
      }
      updateData.areaSize = n;
    }

    try {
      const project = await prisma.project.findUnique({ where: { id } });
      if (!project) return res.status(404).json({ message: "Project not found" });

      // Replace cover if uploaded
      if (req.files.cover?.[0]) {
        if (project.coverPublicId) {
          await cloudinary.uploader.destroy(project.coverPublicId);
        }
        const cover = req.files.cover[0];
        updateData.coverUrl = cover.path;
        updateData.coverPublicId = cover.filename;
      }

      const updated = await prisma.project.update({
        where: { id },
        data: updateData,
      });

      // Delete images marked for removal
      if (req.body.deleteImageIds) {
        const idsToDelete = parseDeleteIds(req.body.deleteImageIds);
        if (idsToDelete.length) {
          const imagesToDelete = await prisma.projectImage.findMany({
            where: {
              id: { in: idsToDelete },
              projectId: id,
            },
          });

          for (const img of imagesToDelete) {
            await cloudinary.uploader.destroy(img.publicId);
          }

          await prisma.projectImage.deleteMany({
            where: { id: { in: idsToDelete } },
          });
        }
      }

      // Add newly uploaded images
      if (req.files.images?.length) {
        const newImages = req.files.images.map((file) => ({
          projectId: id,
          imageUrl: file.path,
          publicId: file.filename,
        }));
        await prisma.projectImage.createMany({ data: newImages });
      }

      res.json({ message: "Project updated", projectId: updated.id });
    } catch (err) {
      console.error("Update project error:", err);
      res.status(500).json({ message: "Server error" });
    }
  },
];

// Delete project + images
exports.deleteProject = async (req, res) => {
  const id = isValidId(req.params.id);
  if (!id) return res.status(400).json({ message: "Invalid ID" });

  try {
    const project = await prisma.project.findUnique({ where: { id } });
    if (!project) return res.status(404).json({ message: "Project not found" });

    if (project.coverPublicId) await cloudinary.uploader.destroy(project.coverPublicId);

    const images = await prisma.projectImage.findMany({ where: { projectId: id } });
    for (const img of images) await cloudinary.uploader.destroy(img.publicId);

    await prisma.$transaction([
      prisma.projectImage.deleteMany({ where: { projectId: id } }),
      prisma.project.delete({ where: { id } }),
    ]);

    res.json({ message: "Project and related images deleted" });
  } catch (err) {
    console.error("Delete project error:", err);
    res.status(500).json({ message: "Server error" });
  }
};
