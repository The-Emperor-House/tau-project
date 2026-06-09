const express = require('express');
const router = express.Router();
const { authenticate } = require('../middleware/authMiddleware');
const userController = require('../controllers/userController');

// ---------- 🔐 Protected Routes ----------
router.use(authenticate); // เช็ก JWT ทุก route ด้านล่างนี้

// 👤 ดึง users ทั้งหมด (เฉพาะแอดมินควรเห็นได้ทั้งหมด)
router.get('/', userController.getUsers);

// 📸 อัปโหลด avatar ของ user ที่ล็อกอินอยู่ (ต้องมาก่อน /:id เพื่อไม่ให้ Express ตีความ "avatar" เป็น id)
router.put('/avatar/me', userController.uploadAvatar);

// ✏️ แก้ไข user ตาม ID (ควรเช็กว่า user คือเจ้าของข้อมูลหรือเป็น admin)
router.put('/:id', userController.updateUser);

module.exports = router;
