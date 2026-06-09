const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();
const { cloudinary, uploadNews } = require("../utils/cloudinary");
const { isValidId, buildUpdateData, parseDeleteIds } = require("../utils/helpers");

const clamp = (s, max = 65000) =>
  typeof s === "string" ? s.slice(0, max) : s == null ? null : String(s).slice(0, max);

// Create
exports.createNews = [
  uploadNews.fields([
    { name: "cover", maxCount: 1 },
    { name: "images", maxCount: 12 },
  ]),
  async (req, res) => {
    const { heading1, heading2, body, videoUrl } = req.body;

    if (!heading1 || !req.files?.cover?.length) {
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
  const { q } = req.query;

  try {
    const where = q
      ? {
          OR: [
            { heading1: { contains: q, mode: "insensitive" } },
            { heading2: { contains: q, mode: "insensitive" } },
            { body: { contains: q, mode: "insensitive" } },
          ],
        }
      : {};

    const data = await prisma.news.findMany({
      where,
      orderBy: { createdAt: "desc" },
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
    { name: "images", maxCount: 12 },
  ]),
  async (req, res) => {
    const id = isValidId(req.params.id);
    if (!id) return res.status(400).json({ message: "Invalid ID" });

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

    try {
      const old = await prisma.news.findUnique({
        where: { id },
        include: { images: { select: { id: true, publicId: true } } },
      });
      if (!old) return res.status(404).json({ message: "Not found" });

      // ----- เปลี่ยน cover: ถ้ามีไฟล์ใหม่ ให้อัปเดตและลบของเก่าใน Cloudinary -----
      if (req.files.cover?.[0]) {
        if (old.coverPublicId) {
          await cloudinary.uploader.destroy(old.coverPublicId).catch(() => {});
        }
        const cover = req.files.cover[0];
        updateData.coverUrl = cover.path;
        updateData.coverPublicId = cover.filename;
      } else if ("coverUrl" in updateData) {
        // ผู้ใช้ส่ง coverUrl (แก้หรือลบ)
        const newUrl = String(updateData.coverUrl ?? "").trim();
        if (newUrl === "") {
          // ล้าง coverUrl
          updateData.coverUrl = null;
          // ถ้าเดิมเป็นรูปจาก Cloudinary ให้ลบทิ้งและล้าง publicId
          if (old.coverPublicId) {
            await cloudinary.uploader.destroy(old.coverPublicId).catch(() => {});
          }
          updateData.coverPublicId = null;
        } else if (newUrl !== (old.coverUrl || "")) {
          // เปลี่ยนเป็น URL ใหม่ (ภายนอก) → ลบไฟล์เก่าใน Cloudinary และเคลียร์ publicId
          if (old.coverPublicId) {
            await cloudinary.uploader.destroy(old.coverPublicId).catch(() => {});
          }
          updateData.coverPublicId = null;
        }
      }

      // ----- อัปเดตฟิลด์ในตาราง news -----
      const updated = await prisma.news.update({
        where: { id },
        data: updateData,
      });

      // ----- ลบรูปย่อยตาม IDs ที่ส่งมา -----
      if (req.body.deleteImageIds) {
        const idsToDelete = parseDeleteIds(req.body.deleteImageIds);
        if (idsToDelete.length) {
          const imgs = await prisma.newsImage.findMany({
            where: { id: { in: idsToDelete }, newsId: id },
          });

          await Promise.all(
            imgs
              .filter((img) => !!img.publicId)
              .map((img) => cloudinary.uploader.destroy(img.publicId).catch(() => {}))
          );

          await prisma.newsImage.deleteMany({
            where: { id: { in: idsToDelete }, newsId: id },
          });
        }
      }

      // ----- เพิ่มรูปย่อยใหม่ -----
      if (req.files.images?.length) {
        const newImages = req.files.images.map((f) => ({
          newsId: id,
          imageUrl: f.path,
          publicId: f.filename,
        }));
        await prisma.newsImage.createMany({ data: newImages });
      }

      res.json({ message: "News updated", id: updated.id });
    } catch (err) {
      console.error("Update news error:", err);
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

    // destroy cover
    if (item.coverPublicId) await cloudinary.uploader.destroy(item.coverPublicId);

    // destroy images
    const images = await prisma.newsImage.findMany({ where: { newsId: id } });
    for (const img of images) await cloudinary.uploader.destroy(img.publicId);

    await prisma.$transaction([
      prisma.newsImage.deleteMany({ where: { newsId: id } }),
      prisma.news.delete({ where: { id } }),
    ]);

    res.json({ message: "News deleted" });
  } catch (err) {
    console.error("Delete news error:", err);
    res.status(500).json({ message: "Server error" });
  }
};
