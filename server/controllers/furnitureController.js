const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();
const { cloudinary, uploadFurniture } = require("../utils/cloudinary");
const { isValidId, buildUpdateData, parseDeleteIds } = require("../utils/helpers");

// CREATE
exports.createFurniture = [
  uploadFurniture.fields([
    { name: "cover", maxCount: 1 },
    { name: "images", maxCount: 12 },
  ]),
  async (req, res) => {
    const { name, type, details, price, width, depth, height } = req.body;
    const valid = ["BUILT_IN", "LOOSE", "CUSTOM"];
    if (!name || !req.files?.cover?.length) {
      return res.status(400).json({ message: "Missing name or cover image" });
    }
    if (!valid.includes(type)) {
      return res.status(400).json({ message: "Invalid furniture type" });
    }

    const coverFile = req.files.cover[0];
    const imageFiles = req.files.images || [];
    try {
      const created = await prisma.$transaction(async (tx) => {
        const item = await tx.furniture.create({
          data: {
            name,
            type,
            details: details || null,
            price: isNaN(Number(price)) ? null : Number(price),
            width: isNaN(Number(width)) ? null : Number(width),
            depth: isNaN(Number(depth)) ? null : Number(depth),
            height: isNaN(Number(height)) ? null : Number(height),
            coverUrl: coverFile.path,
            coverPublicId: coverFile.filename,
          },
        });

        if (imageFiles.length) {
          await tx.furnitureImage.createMany({
            data: imageFiles.map((f) => ({
              furnitureId: item.id,
              imageUrl: f.path,
              publicId: f.filename,
            })),
          });
        }
        return item;
      });

      res.json({ message: "Furniture created", id: created.id });
    } catch (err) {
      console.error("Create furniture error:", err);
      const toDelete = [
        req.files?.cover?.[0]?.filename,
        ...(req.files?.images || []).map((f) => f.filename),
      ].filter(Boolean);
      await Promise.allSettled(toDelete.map((pid) => cloudinary.uploader.destroy(pid)));
      res.status(500).json({ message: "Server error" });
    }
  },
];

// LIST (filter by type/q)
exports.getAllFurniture = async (req, res) => {
  const { type, q } = req.query;
  try {
    const where = {
      AND: [
        type ? { type: String(type).toUpperCase() } : {},
        q
          ? {
              OR: [
                { name: { contains: q, mode: "insensitive" } },
                { details: { contains: q, mode: "insensitive" } },
              ],
            }
          : {},
      ],
    };

    const data = await prisma.furniture.findMany({
      where,
      orderBy: { createdAt: "desc" },
      include: { images: { select: { id: true, imageUrl: true } } },
    });
    res.json(data);
  } catch (err) {
    console.error("Get furniture error:", err);
    res.status(500).json({ message: "Server error" });
  }
};

// GET by id
exports.getFurnitureById = async (req, res) => {
  const id = isValidId(req.params.id);
  if (!id) return res.status(400).json({ message: "Invalid ID" });

  try {
    const item = await prisma.furniture.findUnique({
      where: { id },
      include: { images: { select: { id: true, imageUrl: true, publicId: true } } },
    });
    if (!item) return res.status(404).json({ message: "Not found" });
    res.json(item);
  } catch (err) {
    console.error("Get furniture by id error:", err);
    res.status(500).json({ message: "Server error" });
  }
};

// UPDATE
exports.updateFurniture = [
  uploadFurniture.fields([
    { name: "cover", maxCount: 1 },
    { name: "images", maxCount: 12 },
  ]),
  async (req, res) => {
    const id = isValidId(req.params.id);
    if (!id) return res.status(400).json({ message: "Invalid ID" });

    const updateData = buildUpdateData(["name", "type", "details", "price", "width", "depth", "height"], req.body);
    // cast number fields
    ["price", "width", "depth", "height"].forEach((k) => {
      if (k in updateData) {
        updateData[k] = updateData[k] === "" || isNaN(Number(updateData[k])) ? null : Number(updateData[k]);
      }
    });

    try {
      const old = await prisma.furniture.findUnique({ where: { id } });
      if (!old) return res.status(404).json({ message: "Not found" });

      if (req.files.cover?.[0]) {
        if (old.coverPublicId) await cloudinary.uploader.destroy(old.coverPublicId);
        const cover = req.files.cover[0];
        updateData.coverUrl = cover.path;
        updateData.coverPublicId = cover.filename;
      }

      const updated = await prisma.furniture.update({ where: { id }, data: updateData });

      // delete images
      if (req.body.deleteImageIds) {
        const idsToDelete = parseDeleteIds(req.body.deleteImageIds);
        if (idsToDelete.length) {
          const imgs = await prisma.furnitureImage.findMany({
            where: { id: { in: idsToDelete }, furnitureId: id },
          });
          for (const img of imgs) if (img.publicId) await cloudinary.uploader.destroy(img.publicId);
          await prisma.furnitureImage.deleteMany({ where: { id: { in: idsToDelete } } });
        }
      }

      // add new images
      if (req.files.images?.length) {
        await prisma.furnitureImage.createMany({
          data: req.files.images.map((f) => ({
            furnitureId: id,
            imageUrl: f.path,
            publicId: f.filename,
          })),
        });
      }

      res.json({ message: "Furniture updated", id: updated.id });
    } catch (err) {
      console.error("Update furniture error:", err);
      res.status(500).json({ message: "Server error" });
    }
  },
];

// DELETE
exports.deleteFurniture = async (req, res) => {
  const id = isValidId(req.params.id);
  if (!id) return res.status(400).json({ message: "Invalid ID" });

  try {
    const item = await prisma.furniture.findUnique({ where: { id } });
    if (!item) return res.status(404).json({ message: "Not found" });

    if (item.coverPublicId) await cloudinary.uploader.destroy(item.coverPublicId);

    const imgs = await prisma.furnitureImage.findMany({ where: { furnitureId: id } });
    await Promise.allSettled(imgs.map((img) => img.publicId && cloudinary.uploader.destroy(img.publicId)));

    await prisma.$transaction([
      prisma.furnitureImage.deleteMany({ where: { furnitureId: id } }),
      prisma.furniture.delete({ where: { id } }),
    ]);

    res.json({ message: "Furniture and related images deleted" });
  } catch (err) {
    console.error("Delete furniture error:", err);
    res.status(500).json({ message: "Server error" });
  }
};
