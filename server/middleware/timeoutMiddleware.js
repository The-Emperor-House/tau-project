// ป้องกัน request ค้างไม่มีที่สิ้นสุด — ถ้าเกิน timeout ให้ตอบ 503 และ log ไว้เพื่อ debug
// request อัปโหลดไฟล์ (multipart) ได้เวลามากกว่า เพราะต้องรอส่งรูปหลายรูปขึ้น Cloudinary
module.exports = function timeoutMiddleware(ms = 20000, { uploadMs = ms } = {}) {
  return (req, res, next) => {
    const limit = req.is('multipart/form-data') ? uploadMs : ms;
    const timer = setTimeout(() => {
      if (!res.headersSent) {
        console.error(`⏱️ Request timeout after ${limit}ms: ${req.method} ${req.originalUrl}`);
        res.status(503).json({ message: 'Request timed out. Please try again.' });
      }
    }, limit);

    res.on('finish', () => clearTimeout(timer));
    res.on('close', () => clearTimeout(timer));

    next();
  };
};
