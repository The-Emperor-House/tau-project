const multer = require('multer');
const { MAX_IMAGES, MAX_FILE_SIZE_MB } = require('../utils/upload');

// ข้อความ error จาก multer ที่ผู้ใช้อ่านเข้าใจได้
const MULTER_MESSAGES = {
  LIMIT_FILE_SIZE: `Each image must be ${MAX_FILE_SIZE_MB}MB or smaller.`,
  LIMIT_UNEXPECTED_FILE: `Too many images. You can upload up to ${MAX_IMAGES} gallery images and 1 cover.`,
  LIMIT_FILE_COUNT: `Too many images. You can upload up to ${MAX_IMAGES} gallery images and 1 cover.`,
};

module.exports = (err, req, res, next) => {
  console.error('🔥 Error:', err.stack || err.message);

  // ตอบไปแล้ว (เช่นโดน timeout) — ส่งต่อให้ Express ปิด connection เอง
  if (res.headersSent) return next(err);

  const isMulterError = err instanceof multer.MulterError;
  const statusCode = isMulterError ? 400 : err.statusCode || 500;
  const message = (isMulterError && MULTER_MESSAGES[err.code]) || err.message || 'Internal Server Error';

  res.status(statusCode).json({
    success: false,
    message,
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack }),
  });
};
