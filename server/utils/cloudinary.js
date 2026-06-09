const { v2: cloudinary } = require('cloudinary');
const { CloudinaryStorage } = require('multer-storage-cloudinary');
const multer = require('multer');

// กำหนดค่าเชื่อมต่อ Cloudinary จาก environment variables
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

const ALLOWED_IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/webp'];

/**
 * สร้าง multer uploader สำหรับอัปโหลดไฟล์ไปยัง Cloudinary
 * @param {string} folder โฟลเดอร์บน Cloudinary ที่จะเก็บไฟล์
 * @param {Array} transformation การแปลงภาพ เช่น ขนาด crop คุณภาพ
 * @returns {multer.Instance} multer instance พร้อม storage ของ Cloudinary
 */
function createUploader(folder, transformation = [{ width: 1280, crop: 'limit', quality: 'auto' }], allowedTypes = ALLOWED_IMAGE_TYPES) {
  const storage = new CloudinaryStorage({
    cloudinary,
    params: {
      folder,
      allowed_formats: ['jpg', 'jpeg', 'png', 'webp'],
      transformation,
    },
  });

  const fileFilter = (req, file, cb) => {
    if (allowedTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error(`Invalid file type: ${file.mimetype}`));
    }
  };

  return multer({
    storage,
    fileFilter,
    limits: { 
      fileSize: 5 * 1024 * 1024, // จำกัดขนาดไฟล์สูงสุดที่ 5MB
    }
  });
}

// Uploader สำหรับอวาตาร์ ใช้ crop focus ที่ใบหน้าและขนาด 512px
const uploadAvatar = createUploader('taurus-uploads/avatar', [
  { width: 512, crop: 'thumb', gravity: 'face', quality: 'auto' },
]);

// Uploader สำหรับไฟล์รูปภาพ entity ต่าง ๆ
const uploadDesign = createUploader('taurus-uploads/design', [
  { width: 1280, crop: 'limit', quality: 'auto' },
  { width: 800, crop: 'limit', quality: 'auto' },
]);

const uploadProject = createUploader('taurus-uploads/project', [
  { width: 1280, crop: 'limit', quality: 'auto' },
]);

const uploadNews = createUploader('taurus-uploads/news', [
  { width: 1280, crop: 'limit', quality: 'auto' },
]);

const uploadFurniture = createUploader('taurus-uploads/furniture', [
  { width: 1280, crop: 'limit', quality: 'auto' },
]);

module.exports = {
  cloudinary,
  uploadAvatar,
  uploadDesign,
  uploadProject,
  uploadNews,
  uploadFurniture,
  createUploader,
};
