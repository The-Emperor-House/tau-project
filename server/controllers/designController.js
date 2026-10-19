const { cloudinary, uploadDesign, destroyMany, uploadedPublicIds } = require("../utils/cloudinary");
const prisma = require("../utils/prisma");
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
    const newUploads = uploadedPublicIds(req.files);
    const id = isValidId(req.params.id);
    if (!id) {
      await destroyMany(newUploads);
      return res.status(400).json({ message: "Invalid ID" });
    }

    const updateData = buildUpdateData(["name", "type"], req.body);
    const cover = req.files?.cover?.[0];
    const imageFiles = req.files?.images || [];
    const idsToDelete = parseDeleteIds(req.body.deleteImageIds);

    try {
      const design = await prisma.design.findUnique({ where: { id } });
      if (!design) {
        await destroyMany(newUploads);
        return res.status(404).json({ message: "Design not found" });
      }

      // Replace cover if uploaded
      if (cover) {
        updateData.coverUrl = cover.path;
        updateData.coverPublicId = cover.filename;
      }

      // เขียน DB ให้สำเร็จก่อน แล้วค่อยลบไฟล์เก่าบน Cloudinary — ถ้า DB fail ไฟล์เก่ายังอยู่ครบ
      const removedImages = await prisma.$transaction(async (tx) => {
        await tx.design.update({ where: { id }, data: updateData });

        // Delete images marked for removal (เฉพาะรูปของ design นี้)
        const removed = idsToDelete.length
          ? await tx.designImage.findMany({ where: { id: { in: idsToDelete }, designId: id } })
          : [];
        if (removed.length) {
          await tx.designImage.deleteMany({ where: { id: { in: removed.map((img) => img.id) } } });
        }

        // Add newly uploaded images
        if (imageFiles.length) {
          await tx.designImage.createMany({
            data: imageFiles.map((file) => ({
              designId: id,
              imageUrl: file.path,
              publicId: file.filename,
            })),
          });
        }

        return removed;
      });

      await destroyMany([
        cover && design.coverPublicId,
        ...removedImages.map((img) => img.publicId),
      ]);

      res.json({ message: "Design updated", designId: id });
    } catch (err) {
      console.error("Update design error:", err);
      await destroyMany(newUploads);
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

    const images = await prisma.designImage.findMany({ where: { designId: id } });

    // ลบใน DB ก่อน แล้วค่อยลบไฟล์บน Cloudinary
    await prisma.$transaction([
      prisma.designImage.deleteMany({ where: { designId: id } }),
      prisma.design.delete({ where: { id } }),
    ]);

    await destroyMany([design.coverPublicId, ...images.map((img) => img.publicId)]);

    res.json({ message: "Design and related images deleted" });
  } catch (err) {
    console.error("Delete design error:", err);
    res.status(500).json({ message: "Server error" });
  }
};
