const multer = require('multer');
const { MAX_FILE_SIZE_MB, MAX_GALLERY_IMAGES } = require('../utils/cloudinary');

// แปลง error ของ multer ให้เป็น 4xx พร้อมข้อความที่บอกสาเหตุจริง (เดิมตอบ 500 ทั้งหมด)
const MULTER_ERRORS = {
  LIMIT_FILE_SIZE: [413, `Image is too large (max ${MAX_FILE_SIZE_MB}MB per image)`],
  LIMIT_UNEXPECTED_FILE: [400, `Too many images (max ${MAX_GALLERY_IMAGES} gallery images and 1 cover per upload)`],
  LIMIT_FILE_COUNT: [400, `Too many images (max ${MAX_GALLERY_IMAGES} per upload)`],
};

module.exports = (err, req, res, next) => {
  console.error('🔥 Error:', err.stack || err.message);

  if (res.headersSent) return next(err);

  let statusCode = err.statusCode || 500;
  let message = err.message || 'Internal Server Error';

  if (err instanceof multer.MulterError) {
    [statusCode, message] = MULTER_ERRORS[err.code] || [400, err.message];
  }

  res.status(statusCode).json({
    success: false,
    message,
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack }),
  });
};
