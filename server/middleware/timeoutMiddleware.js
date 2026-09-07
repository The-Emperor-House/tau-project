// ป้องกัน request ค้างไม่มีที่สิ้นสุด — ถ้าเกิน timeout ให้ตอบ 503 และ log ไว้เพื่อ debug
module.exports = function timeoutMiddleware(ms = 20000) {
  return (req, res, next) => {
    const timer = setTimeout(() => {
      if (!res.headersSent) {
        console.error(`⏱️ Request timeout after ${ms}ms: ${req.method} ${req.originalUrl}`);
        res.status(503).json({ message: 'Request timed out. Please try again.' });
      }
    }, ms);

    res.on('finish', () => clearTimeout(timer));
    res.on('close', () => clearTimeout(timer));

    next();
  };
};
