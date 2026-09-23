const { cloudinary, uploadFurniture } = require("../utils/cloudinary");
const prisma = require("../utils/prisma");
const { isValidId, buildUpdateData, parseDeleteIds } = require("../utils/helpers");
const { MAX_IMAGES, imageFields, destroyImages, discardUploads } = require("../utils/upload");

// CREATE
exports.createFurniture = [
  uploadFurniture.fields(imageFields),
  async (req, res) => {
    const { name, type, details, price, width, depth, height } = req.body;
    const valid = ["BUILT_IN", "LOOSE", "CUSTOM"];
    if (!name || !req.files?.cover?.length) {
      await discardUploads(req);
      return res.status(400).json({ message: "Missing name or cover image" });
    }
    if (!valid.includes(type)) {
      await discardUploads(req);
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
      await discardUploads(req);
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
  uploadFurniture.fields(imageFields),
  async (req, res) => {
    const id = isValidId(req.params.id);
    if (!id) {
      await discardUploads(req);
      return res.status(400).json({ message: "Invalid ID" });
    }

    const updateData = buildUpdateData(["name", "type", "details", "price", "width", "depth", "height"], req.body);
    // cast number fields
    ["price", "width", "depth", "height"].forEach((k) => {
      if (k in updateData) {
        updateData[k] = updateData[k] === "" || isNaN(Number(updateData[k])) ? null : Number(updateData[k]);
      }
    });

    const cover = req.files?.cover?.[0];
    const newImages = req.files?.images || [];

    try {
      const old = await prisma.furniture.findUnique({
        where: { id },
        include: { images: { select: { id: true, publicId: true } } },
      });
      if (!old) {
        await discardUploads(req);
        return res.status(404).json({ message: "Not found" });
      }

      const idsToDelete = parseDeleteIds(req.body.deleteImageIds);
      const imagesToDelete = old.images.filter((img) => idsToDelete.includes(img.id));
      if (old.images.length - imagesToDelete.length + newImages.length > MAX_IMAGES) {
        await discardUploads(req);
        return res.status(400).json({ message: `Too many images. Each item can have up to ${MAX_IMAGES} gallery images.` });
      }

      if (cover) {
        updateData.coverUrl = cover.path;
        updateData.coverPublicId = cover.filename;
      }

      // save everything together so a failure never leaves a half-updated item
      await prisma.$transaction(async (tx) => {
        await tx.furniture.update({ where: { id }, data: updateData });
        if (imagesToDelete.length) {
          await tx.furnitureImage.deleteMany({ where: { id: { in: imagesToDelete.map((img) => img.id) } } });
        }
        if (newImages.length) {
          await tx.furnitureImage.createMany({
            data: newImages.map((f) => ({
              furnitureId: id,
              imageUrl: f.path,
              publicId: f.filename,
            })),
          });
        }
      });

      // DB is committed — now remove the replaced cover and deleted images from Cloudinary
      await destroyImages([
        cover && old.coverPublicId,
        ...imagesToDelete.map((img) => img.publicId),
      ]);

      res.json({ message: "Furniture updated", id });
    } catch (err) {
      console.error("Update furniture error:", err);
      await discardUploads(req);
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
