const { cloudinary, uploadNews } = require("../utils/cloudinary");
const prisma = require("../utils/prisma");
const { isValidId, buildUpdateData, parseDeleteIds } = require("../utils/helpers");
const { MAX_IMAGES, imageFields, destroyImages, discardUploads } = require("../utils/upload");

const clamp = (s, max = 65000) =>
  typeof s === "string" ? s.slice(0, max) : s == null ? null : String(s).slice(0, max);

// Create
exports.createNews = [
  uploadNews.fields(imageFields),
  async (req, res) => {
    const { heading1, heading2, body, videoUrl } = req.body;

    if (!heading1 || !req.files?.cover?.length) {
      await discardUploads(req);
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
      await discardUploads(req);

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
              { heading1: { contains: q, mode: "insensitive" } },
              { heading2: { contains: q, mode: "insensitive" } },
              { body: { contains: q, mode: "insensitive" } },
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
  uploadNews.fields(imageFields),
  async (req, res) => {
    const id = isValidId(req.params.id);
    if (!id) {
      await discardUploads(req);
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
    const newImages = req.files?.images || [];

    try {
      const old = await prisma.news.findUnique({
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
        return res.status(400).json({ message: `Too many images. Each news item can have up to ${MAX_IMAGES} gallery images.` });
      }

      // ----- เปลี่ยน cover: จำ publicId เก่าไว้ ลบจาก Cloudinary หลังบันทึก DB สำเร็จ -----
      let oldCoverToDestroy = null;
      if (cover) {
        updateData.coverUrl = cover.path;
        updateData.coverPublicId = cover.filename;
        oldCoverToDestroy = old.coverPublicId;
      } else if ("coverUrl" in updateData) {
        // ผู้ใช้ส่ง coverUrl (แก้หรือลบ)
        const newUrl = String(updateData.coverUrl ?? "").trim();
        if (newUrl === "") {
          // ล้าง coverUrl และ publicId (ถ้าเดิมเป็นรูปจาก Cloudinary จะถูกลบทิ้ง)
          updateData.coverUrl = null;
          updateData.coverPublicId = null;
          oldCoverToDestroy = old.coverPublicId;
        } else if (newUrl !== (old.coverUrl || "")) {
          // เปลี่ยนเป็น URL ใหม่ (ภายนอก) → ลบไฟล์เก่าใน Cloudinary และเคลียร์ publicId
          updateData.coverPublicId = null;
          oldCoverToDestroy = old.coverPublicId;
        }
      }

      // ----- บันทึกทั้งหมดใน transaction เดียว กันข้อมูลค้างครึ่ง ๆ -----
      await prisma.$transaction(async (tx) => {
        await tx.news.update({ where: { id }, data: updateData });
        if (imagesToDelete.length) {
          await tx.newsImage.deleteMany({ where: { id: { in: imagesToDelete.map((img) => img.id) } } });
        }
        if (newImages.length) {
          await tx.newsImage.createMany({
            data: newImages.map((f) => ({
              newsId: id,
              imageUrl: f.path,
              publicId: f.filename,
            })),
          });
        }
      });

      // ----- DB บันทึกแล้ว ค่อยลบ cover เก่าและรูปย่อยที่ถูกลบออกจาก Cloudinary -----
      await destroyImages([oldCoverToDestroy, ...imagesToDelete.map((img) => img.publicId)]);

      res.json({ message: "News updated", id });
    } catch (err) {
      console.error("Update news error:", err);
      await discardUploads(req);
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
