const { cloudinary, uploadNews, destroyMany, uploadedPublicIds, MAX_GALLERY_IMAGES } = require("../utils/cloudinary");
const prisma = require("../utils/prisma");
const { isValidId, buildUpdateData, parseDeleteIds } = require("../utils/helpers");

const clamp = (s, max = 65000) =>
  typeof s === "string" ? s.slice(0, max) : s == null ? null : String(s).slice(0, max);

// Create
exports.createNews = [
  uploadNews.fields([
    { name: "cover", maxCount: 1 },
    { name: "images", maxCount: MAX_GALLERY_IMAGES },
  ]),
  async (req, res) => {
    const { heading1, heading2, body, videoUrl } = req.body;

    if (!heading1 || !req.files?.cover?.length) {
      await destroyMany(uploadedPublicIds(req.files));
      return res.status(400).json({ message: "Missing heading1 or cover image" });
    }

    const coverFile = req.files.cover?.[0];
    const imageFiles = req.files.images || [];

    try {
      const created = await prisma.$transaction(async (tx) => {
        const news = await tx.news.create({
          data: {
            heading1,
            heading2: heading2 || null,
            body: clamp(body),                 // ← กันข้อความยาวเกิน
            videoUrl: videoUrl || null,
            coverUrl: coverFile.path,
            coverPublicId: coverFile.filename,
          },
        });

        if (imageFiles.length) {
          const data = imageFiles.map((file) => ({
            newsId: news.id,
            imageUrl: file.path,
            publicId: file.filename,
          }));
          await tx.newsImage.createMany({ data });
        }

        return news;
      });

      res.json({ message: "News created", id: created.id });
    } catch (err) {
      console.error("Create news error:", err);

      // cleanup รูปที่อัปโหลดแล้ว
      const toDelete = [
        coverFile?.filename,
        ...imageFiles.map((f) => f.filename),
      ].filter(Boolean);

      await Promise.allSettled(
        toDelete.map((pid) => cloudinary.uploader.destroy(pid))
      );

      res.status(500).json({ message: "Server error" });
    }
  },
];

// List + filter
exports.getAllNews = async (req, res) => {
  const { q, featured, limit } = req.query;

  try {
    const where = {
      ...(q
        ? {
            OR: [
              { heading1: { contains: q } },
              { heading2: { contains: q } },
              { body: { contains: q } },
            ],
          }
        : {}),
      ...(featured === "true" ? { isFeatured: true } : {}),
    };

    const take = isValidId(limit) || undefined;

    const data = await prisma.news.findMany({
      where,
      orderBy: { createdAt: "desc" },
      take,
      include: {
        images: { select: { id: true, imageUrl: true } },
      },
    });

    res.json(data);
  } catch (err) {
    console.error("Get news error:", err);
    res.status(500).json({ message: "Server error" });
  }
};

// Set/unset featured (multiple news can be featured at the same time)
exports.setFeaturedNews = async (req, res) => {
  const id = isValidId(req.params.id);
  if (!id) return res.status(400).json({ message: "Invalid ID" });

  const isFeatured = !!req.body.isFeatured;

  try {
    const exists = await prisma.news.findUnique({ where: { id } });
    if (!exists) return res.status(404).json({ message: "Not found" });

    await prisma.news.update({ where: { id }, data: { isFeatured } });

    res.json({ message: "News featured status updated", id, isFeatured });
  } catch (err) {
    console.error("Set featured news error:", err);
    res.status(500).json({ message: "Server error" });
  }
};

// Get by id
exports.getNewsById = async (req, res) => {
  const id = isValidId(req.params.id);
  if (!id) return res.status(400).json({ message: "Invalid ID" });

  try {
    const item = await prisma.news.findUnique({
      where: { id },
      include: {
        images: { select: { id: true, imageUrl: true, publicId: true } },
      },
    });
    if (!item) return res.status(404).json({ message: "Not found" });
    res.json(item);
  } catch (err) {
    console.error("Get news by id error:", err);
    res.status(500).json({ message: "Server error" });
  }
};

// Update
exports.updateNews = [
  uploadNews.fields([
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

    // ✅ whitelist ฟิลด์ที่แก้ได้ + กัน body ยาวเกิน
    const updateData = buildUpdateData(
      ["heading1", "heading2", "body", "videoUrl", "coverUrl"],
      req.body
    );
    if ("body" in updateData) updateData.body = clamp(updateData.body);

    // ----- จัดการลบ/แก้ videoUrl -----
    const unsetList = []
      .concat(req.body.unset || []) // รองรับ unset[]=videoUrl
      .map(String);

    const hasVideoKey = Object.prototype.hasOwnProperty.call(req.body, "videoUrl");
    const shouldUnsetVideo = unsetList.includes("videoUrl");

    if (hasVideoKey || shouldUnsetVideo) {
      const v = hasVideoKey ? req.body.videoUrl : null;
      updateData.videoUrl =
        shouldUnsetVideo ||
        v === null ||
        (typeof v === "string" && v.trim() === "")
          ? null
          : String(v);
    }

    const cover = req.files?.cover?.[0];
    const imageFiles = req.files?.images || [];
    const idsToDelete = parseDeleteIds(req.body.deleteImageIds);

    // cover เป็นฟิลด์บังคับ — เปลี่ยนเป็นรูปใหม่หรือ URL ใหม่ได้ แต่ล้างให้ว่างไม่ได้
    if (!cover && "coverUrl" in updateData && String(updateData.coverUrl ?? "").trim() === "") {
      await destroyMany(newUploads);
      return res.status(400).json({ message: "Cover image is required" });
    }

    try {
      const old = await prisma.news.findUnique({ where: { id } });
      if (!old) {
        await destroyMany(newUploads);
        return res.status(404).json({ message: "Not found" });
      }

      // cover เก่าบน Cloudinary ที่ต้องลบ — ลบหลังเขียน DB สำเร็จแล้วเท่านั้น
      let oldCoverToDestroy = null;

      // ----- เปลี่ยน cover: ถ้ามีไฟล์ใหม่ ให้อัปเดตและลบของเก่าใน Cloudinary -----
      if (cover) {
        oldCoverToDestroy = old.coverPublicId;
        updateData.coverUrl = cover.path;
        updateData.coverPublicId = cover.filename;
      } else if ("coverUrl" in updateData) {
        // ผู้ใช้ส่ง coverUrl ใหม่ (ค่าว่างถูกปฏิเสธไปแล้วด้านบน)
        const newUrl = String(updateData.coverUrl).trim();
        updateData.coverUrl = newUrl;
        if (newUrl !== (old.coverUrl || "")) {
          // เปลี่ยนเป็น URL ใหม่ (ภายนอก) → ลบไฟล์เก่าใน Cloudinary และเคลียร์ publicId
          oldCoverToDestroy = old.coverPublicId;
          updateData.coverPublicId = null;
        }
      }

      const removedImages = await prisma.$transaction(async (tx) => {
        // ----- อัปเดตฟิลด์ในตาราง news -----
        await tx.news.update({ where: { id }, data: updateData });

        // ----- ลบรูปย่อยตาม IDs ที่ส่งมา -----
        const removed = idsToDelete.length
          ? await tx.newsImage.findMany({ where: { id: { in: idsToDelete }, newsId: id } })
          : [];
        if (removed.length) {
          await tx.newsImage.deleteMany({ where: { id: { in: removed.map((img) => img.id) } } });
        }

        // ----- เพิ่มรูปย่อยใหม่ -----
        if (imageFiles.length) {
          await tx.newsImage.createMany({
            data: imageFiles.map((f) => ({
              newsId: id,
              imageUrl: f.path,
              publicId: f.filename,
            })),
          });
        }

        return removed;
      });

      await destroyMany([oldCoverToDestroy, ...removedImages.map((img) => img.publicId)]);

      res.json({ message: "News updated", id });
    } catch (err) {
      console.error("Update news error:", err);
      await destroyMany(newUploads);
      res.status(500).json({ message: "Server error" });
    }
  },
];

// Delete
exports.deleteNews = async (req, res) => {
  const id = isValidId(req.params.id);
  if (!id) return res.status(400).json({ message: "Invalid ID" });

  try {
    const item = await prisma.news.findUnique({ where: { id } });
    if (!item) return res.status(404).json({ message: "Not found" });

    const images = await prisma.newsImage.findMany({ where: { newsId: id } });

    // ลบใน DB ก่อน แล้วค่อยลบ cover + รูปย่อยบน Cloudinary
    await prisma.$transaction([
      prisma.newsImage.deleteMany({ where: { newsId: id } }),
      prisma.news.delete({ where: { id } }),
    ]);

    await destroyMany([item.coverPublicId, ...images.map((img) => img.publicId)]);

    res.json({ message: "News deleted" });
  } catch (err) {
    console.error("Delete news error:", err);
    res.status(500).json({ message: "Server error" });
  }
};
