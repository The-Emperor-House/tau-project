const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();
const { cloudinary, uploadDesign } = require("../utils/cloudinary");
const { isValidId, buildUpdateData, parseDeleteIds } = require("../utils/helpers");

// Create Design
exports.createDesign = [
  uploadDesign.fields([
    { name: "cover", maxCount: 1 },
    { name: "images", maxCount: 10 },
  ]),
  async (req, res) => {
    const { name, type } = req.body;
    const validTypes = ["ARCHITECTURAL", "INTERIOR"];

    if (!name || !req.files?.cover?.length) {
      return res.status(400).json({ message: "Missing name or cover image" });
    }
    if (!validTypes.includes(type)) {
      return res.status(400).json({ message: "Invalid design type" });
    }

    const coverFile = req.files.cover[0];
    const imageFiles = req.files.images || [];

    try {
      const createdDesign = await prisma.$transaction(async (tx) => {
        const design = await tx.design.create({
          data: {
            name,
            type,
            coverUrl: coverFile.path,
            coverPublicId: coverFile.filename,
          },
        });

        if (imageFiles.length > 0) {
          const imageData = imageFiles.map((file) => ({
            designId: design.id,
            imageUrl: file.path,
            publicId: file.filename,
          }));
          await tx.designImage.createMany({ data: imageData });
        }

        return design;
      });

      res.json({ message: "Design created", designId: createdDesign.id });
    } catch (err) {
      console.error("Create design error:", err);
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

// Get all designs
exports.getAllDesigns = async (req, res) => {
  const { type } = req.query;
  try {
    const where = type ? { type: type.toUpperCase() } : {};
    const data = await prisma.design.findMany({
      where,
      orderBy: { createdAt: "desc" },
      include: {
        images: {
          select: { id: true, imageUrl: true },
        },
      },
    });
    res.json(data);
  } catch (err) {
    console.error("Get designs error:", err);
    res.status(500).json({ message: "Server error" });
  }
};

// Update design
exports.updateDesign = [
  uploadDesign.fields([
    { name: "cover", maxCount: 1 },
    { name: "images", maxCount: 10 },
  ]),
  async (req, res) => {
    const id = isValidId(req.params.id);
    if (!id) return res.status(400).json({ message: "Invalid ID" });

    const updateData = buildUpdateData(["name", "type"], req.body);

    try {
      const design = await prisma.design.findUnique({ where: { id } });
      if (!design) return res.status(404).json({ message: "Design not found" });

      // Replace cover if uploaded
      if (req.files.cover?.[0]) {
        if (design.coverPublicId) {
          await cloudinary.uploader.destroy(design.coverPublicId);
        }
        const cover = req.files.cover[0];
        updateData.coverUrl = cover.path;
        updateData.coverPublicId = cover.filename;
      }

      const updated = await prisma.design.update({
        where: { id },
        data: updateData,
      });

      // Delete images marked for removal
      if (req.body.deleteImageIds) {
        const idsToDelete = parseDeleteIds(req.body.deleteImageIds);
        if (idsToDelete.length) {
          const imagesToDelete = await prisma.designImage.findMany({
            where: {
              id: { in: idsToDelete },
              designId: id,
            },
          });

          for (const img of imagesToDelete) {
            await cloudinary.uploader.destroy(img.publicId);
          }

          await prisma.designImage.deleteMany({
            where: { id: { in: idsToDelete } },
          });
        }
      }

      // Add newly uploaded images
      if (req.files.images?.length) {
        const newImages = req.files.images.map((file) => ({
          designId: id,
          imageUrl: file.path,
          publicId: file.filename,
        }));
        await prisma.designImage.createMany({ data: newImages });
      }

      res.json({ message: "Design updated", designId: updated.id });
    } catch (err) {
      console.error("Update design error:", err);
      res.status(500).json({ message: "Server error" });
    }
  },
];

// Delete design and images
exports.deleteDesign = async (req, res) => {
  const id = isValidId(req.params.id);
  if (!id) return res.status(400).json({ message: "Invalid ID" });

  try {
    const design = await prisma.design.findUnique({ where: { id } });
    if (!design) return res.status(404).json({ message: "Design not found" });

    if (design.coverPublicId) await cloudinary.uploader.destroy(design.coverPublicId);

    const images = await prisma.designImage.findMany({ where: { designId: id } });
    for (const img of images) await cloudinary.uploader.destroy(img.publicId);

    await prisma.$transaction([
      prisma.designImage.deleteMany({ where: { designId: id } }),
      prisma.design.delete({ where: { id } }),
    ]);

    res.json({ message: "Design and related images deleted" });
  } catch (err) {
    console.error("Delete design error:", err);
    res.status(500).json({ message: "Server error" });
  }
};
