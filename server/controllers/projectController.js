const { cloudinary, uploadProject } = require("../utils/cloudinary");
const prisma = require("../utils/prisma");
const { isValidId, buildUpdateData, parseDeleteIds } = require("../utils/helpers");
const { MAX_IMAGES, imageFields, destroyImages, discardUploads } = require("../utils/upload");

// util: ตรวจ enum type ให้ตรง schema
const VALID_TYPES = ["REBUILD", "RENOVATE", "REDESIGN"];
const isValidType = (t) => typeof t === "string" && VALID_TYPES.includes(t.toUpperCase());

// Create Project
exports.createProject = [
  uploadProject.fields(imageFields),
  async (req, res) => {
    const { name, type, details } = req.body;
    const areaSize = req.body.areaSize !== undefined && req.body.areaSize !== null
      ? Number(req.body.areaSize)
      : undefined;

    if (!name || !req.files?.cover?.length) {
      await discardUploads(req);
      return res.status(400).json({ message: "Missing name or cover image" });
    }
    if (!isValidType(type)) {
      await discardUploads(req);
      return res.status(400).json({ message: "Invalid project type" });
    }
    if (areaSize !== undefined && (Number.isNaN(areaSize) || areaSize < 0)) {
      await discardUploads(req);
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
      await discardUploads(req);

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
  uploadProject.fields(imageFields),
  async (req, res) => {
    const id = isValidId(req.params.id);
    if (!id) {
      await discardUploads(req);
      return res.status(400).json({ message: "Invalid ID" });
    }

    // อนุญาตอัปเดต name, type, details, areaSize
    const updateData = buildUpdateData(["name", "type", "details", "areaSize"], req.body);

    // normalize/validate type
    if (updateData.type !== undefined) {
      if (!isValidType(updateData.type)) {
        await discardUploads(req);
        return res.status(400).json({ message: "Invalid project type" });
      }
      updateData.type = updateData.type.toUpperCase();
    }

    // normalize/validate areaSize
    if (updateData.areaSize !== undefined) {
      const n = Number(updateData.areaSize);
      if (Number.isNaN(n) || n < 0) {
        await discardUploads(req);
        return res.status(400).json({ message: "Invalid areaSize" });
      }
      updateData.areaSize = n;
    }

    const cover = req.files?.cover?.[0];
    const newImages = req.files?.images || [];

    try {
      const project = await prisma.project.findUnique({
        where: { id },
        include: { images: { select: { id: true, publicId: true } } },
      });
      if (!project) {
        await discardUploads(req);
        return res.status(404).json({ message: "Project not found" });
      }

      const idsToDelete = parseDeleteIds(req.body.deleteImageIds);
      const imagesToDelete = project.images.filter((img) => idsToDelete.includes(img.id));
      if (project.images.length - imagesToDelete.length + newImages.length > MAX_IMAGES) {
        await discardUploads(req);
        return res.status(400).json({ message: `Too many images. Each project can have up to ${MAX_IMAGES} gallery images.` });
      }

      if (cover) {
        updateData.coverUrl = cover.path;
        updateData.coverPublicId = cover.filename;
      }

      // Save everything together so a failure never leaves a half-updated project
      await prisma.$transaction(async (tx) => {
        await tx.project.update({ where: { id }, data: updateData });
        if (imagesToDelete.length) {
          await tx.projectImage.deleteMany({ where: { id: { in: imagesToDelete.map((img) => img.id) } } });
        }
        if (newImages.length) {
          await tx.projectImage.createMany({
            data: newImages.map((file) => ({
              projectId: id,
              imageUrl: file.path,
              publicId: file.filename,
            })),
          });
        }
      });

      // DB is committed — now remove the replaced cover and deleted images from Cloudinary
      await destroyImages([
        cover && project.coverPublicId,
        ...imagesToDelete.map((img) => img.publicId),
      ]);

      res.json({ message: "Project updated", projectId: id });
    } catch (err) {
      console.error("Update project error:", err);
      await discardUploads(req);
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
