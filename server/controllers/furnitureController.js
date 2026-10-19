const { cloudinary, uploadFurniture, destroyMany, uploadedPublicIds, MAX_GALLERY_IMAGES } = require("../utils/cloudinary");
const prisma = require("../utils/prisma");
const { isValidId, buildUpdateData, parseDeleteIds } = require("../utils/helpers");

// CREATE
exports.createFurniture = [
  uploadFurniture.fields([
    { name: "cover", maxCount: 1 },
    { name: "images", maxCount: MAX_GALLERY_IMAGES },
  ]),
  async (req, res) => {
    const { name, type, details, price, width, depth, height } = req.body;
    const valid = ["BUILT_IN", "LOOSE", "CUSTOM"];
    // validation ไม่ผ่าน → ลบไฟล์ที่ multer อัปโหลดไปแล้วทิ้ง ไม่ให้ค้างบน Cloudinary
    const reject = async (message) => {
      await destroyMany(uploadedPublicIds(req.files));
      return res.status(400).json({ message });
    };

    if (!name || !req.files?.cover?.length) {
      return reject("Missing name or cover image");
    }
    if (!valid.includes(type)) {
      return reject("Invalid furniture type");
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
                { name: { contains: q } },
                { details: { contains: q } },
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
    { name: "images", maxCount: MAX_GALLERY_IMAGES },
  ]),
  async (req, res) => {
    const newUploads = uploadedPublicIds(req.files);
    const id = isValidId(req.params.id);
    if (!id) {
      await destroyMany(newUploads);
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
    const imageFiles = req.files?.images || [];
    const idsToDelete = parseDeleteIds(req.body.deleteImageIds);

    try {
      const old = await prisma.furniture.findUnique({ where: { id } });
      if (!old) {
        await destroyMany(newUploads);
        return res.status(404).json({ message: "Not found" });
      }

      if (cover) {
        updateData.coverUrl = cover.path;
        updateData.coverPublicId = cover.filename;
      }

      // เขียน DB ให้สำเร็จก่อน แล้วค่อยลบไฟล์เก่าบน Cloudinary — ถ้า DB fail ไฟล์เก่ายังอยู่ครบ
      const removedImages = await prisma.$transaction(async (tx) => {
        await tx.furniture.update({ where: { id }, data: updateData });

        // delete images (เฉพาะรูปของ furniture นี้)
        const removed = idsToDelete.length
          ? await tx.furnitureImage.findMany({ where: { id: { in: idsToDelete }, furnitureId: id } })
          : [];
        if (removed.length) {
          await tx.furnitureImage.deleteMany({ where: { id: { in: removed.map((img) => img.id) } } });
        }

        // add new images
        if (imageFiles.length) {
          await tx.furnitureImage.createMany({
            data: imageFiles.map((f) => ({
              furnitureId: id,
              imageUrl: f.path,
              publicId: f.filename,
            })),
          });
        }

        return removed;
      });

      await destroyMany([
        cover && old.coverPublicId,
        ...removedImages.map((img) => img.publicId),
      ]);

      res.json({ message: "Furniture updated", id });
    } catch (err) {
      console.error("Update furniture error:", err);
      await destroyMany(newUploads);
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

    const imgs = await prisma.furnitureImage.findMany({ where: { furnitureId: id } });

    // ลบใน DB ก่อน แล้วค่อยลบไฟล์บน Cloudinary
    await prisma.$transaction([
      prisma.furnitureImage.deleteMany({ where: { furnitureId: id } }),
      prisma.furniture.delete({ where: { id } }),
    ]);

    await destroyMany([item.coverPublicId, ...imgs.map((img) => img.publicId)]);

    res.json({ message: "Furniture and related images deleted" });
  } catch (err) {
    console.error("Delete furniture error:", err);
    res.status(500).json({ message: "Server error" });
  }
};
