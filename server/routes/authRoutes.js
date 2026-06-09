const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const { authenticate } = require('../middleware/authMiddleware');

// ---------- 🟢 Public Routes (ไม่ต้อง login) ----------
router.post('/register', authController.register);
router.post('/login', authController.login);
router.post('/refresh-token', authController.refreshToken);
router.post('/logout', authController.logout); // อนุญาตให้เรียกได้โดยไม่ auth เผื่อ token หมด

// ---------- 🔐 Protected Routes (ต้อง login) ----------
router.use(authenticate); // Middleware เช็ก JWT
router.get('/me', authController.me);
router.put('/change-password', authController.changePassword);

module.exports = router;
