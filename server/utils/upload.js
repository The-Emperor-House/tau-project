const { cloudinary, MAX_FILE_SIZE_MB } = require('./cloudinary');

// จำนวนรูป gallery สูงสุดต่อ 1 รายการ (design / project / news / furniture)
const MAX_IMAGES = 20;

// field ที่รับจากฟอร์ม: cover 1 รูป + gallery ไม่เกิน MAX_IMAGES
const imageFields = [
  { name: 'cover', maxCount: 1 },
  { name: 'images', maxCount: MAX_IMAGES },
];

/**
 * ลบรูปบน Cloudinary ตาม publicId (ข้ามค่าว่าง, ไม่ throw ถ้าลบไม่สำเร็จ)
 * @param {Array<string|null|undefined>} publicIds
 */
const destroyImages = (publicIds) =>
  Promise.allSettled(
    publicIds.filter(Boolean).map((publicId) => cloudinary.uploader.destroy(publicId))
  );

/**
 * ลบไฟล์ที่ multer อัปโหลดขึ้น Cloudinary ไปแล้วใน request นี้
 * ใช้ตอน validate ไม่ผ่านหรือบันทึก DB ไม่สำเร็จ เพื่อไม่ให้มีรูปค้างบน Cloudinary
 */
const discardUploads = (req) =>
  destroyImages(Object.values(req.files || {}).flat().map((f) => f.filename));

module.exports = {
  MAX_IMAGES,
  MAX_FILE_SIZE_MB,
  imageFields,
  destroyImages,
  discardUploads,
};
