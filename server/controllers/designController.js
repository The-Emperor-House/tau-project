const { cloudinary, uploadDesign } = require("../utils/cloudinary");
const prisma = require("../utils/prisma");
const { isValidId, buildUpdateData, parseDeleteIds } = require("../utils/helpers");
const { MAX_IMAGES, imageFields, destroyImages, discardUploads } = require("../utils/upload");

// Create Design
exports.createDesign = [
  uploadDesign.fields(imageFields),
  async (req, res) => {
    const { name, type } = req.body;
    const validTypes = ["ARCHITECTURAL", "INTERIOR"];

    if (!name || !req.files?.cover?.length) {
      await discardUploads(req);
      return res.status(400).json({ message: "Missing name or cover image" });
    }
    if (!validTypes.includes(type)) {
      await discardUploads(req);
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
      await discardUploads(req);

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
  uploadDesign.fields(imageFields),
  async (req, res) => {
    const id = isValidId(req.params.id);
    if (!id) {
      await discardUploads(req);
      return res.status(400).json({ message: "Invalid ID" });
    }

    const updateData = buildUpdateData(["name", "type"], req.body);
    const cover = req.files?.cover?.[0];
    const newImages = req.files?.images || [];

    try {
      const design = await prisma.design.findUnique({
        where: { id },
        include: { images: { select: { id: true, publicId: true } } },
      });
      if (!design) {
        await discardUploads(req);
        return res.status(404).json({ message: "Design not found" });
      }

      const idsToDelete = parseDeleteIds(req.body.deleteImageIds);
      const imagesToDelete = design.images.filter((img) => idsToDelete.includes(img.id));
      if (design.images.length - imagesToDelete.length + newImages.length > MAX_IMAGES) {
        await discardUploads(req);
        return res.status(400).json({ message: `Too many images. Each design can have up to ${MAX_IMAGES} gallery images.` });
      }

      if (cover) {
        updateData.coverUrl = cover.path;
        updateData.coverPublicId = cover.filename;
      }

      // Save everything together so a failure never leaves a half-updated design
      await prisma.$transaction(async (tx) => {
        await tx.design.update({ where: { id }, data: updateData });
        if (imagesToDelete.length) {
          await tx.designImage.deleteMany({ where: { id: { in: imagesToDelete.map((img) => img.id) } } });
        }
        if (newImages.length) {
          await tx.designImage.createMany({
            data: newImages.map((file) => ({
              designId: id,
              imageUrl: file.path,
              publicId: file.filename,
            })),
          });
        }
      });

      // DB is committed — now remove the replaced cover and deleted images from Cloudinary
      await destroyImages([
        cover && design.coverPublicId,
        ...imagesToDelete.map((img) => img.publicId),
      ]);

      res.json({ message: "Design updated", designId: id });
    } catch (err) {
      console.error("Update design error:", err);
      await discardUploads(req);
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
