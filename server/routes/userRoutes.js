const express = require('express');
const router = express.Router();
const { authenticate } = require('../middleware/authMiddleware');
const userController = require('../controllers/userController');

// ---------- 🔐 Protected Routes ----------
router.use(authenticate); // เช็ก JWT ทุก route ด้านล่างนี้

// 👤 ดึง users ทั้งหมด (เฉพาะแอดมินควรเห็นได้ทั้งหมด)
router.get('/', userController.getUsers);

// ✏️ แก้ไข user ตาม ID (ควรเช็กว่า user คือเจ้าของข้อมูลหรือเป็น admin)
router.put('/:id', userController.updateUser);

// 📸 อัปโหลด avatar ของ user ที่ล็อกอินอยู่ (ไม่ใช้ :id เพราะผูกกับ token)
router.put('/avatar/me', userController.uploadAvatar);

module.exports = router;
