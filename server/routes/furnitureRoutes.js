const express = require('express');
const router = express.Router();
const { authenticate, authorize } = require('../middleware/authMiddleware');
const furnitureController = require('../controllers/furnitureController');

// Public routes (ไม่ต้อง login)
router.get('/', furnitureController.getAllFurniture);
router.get('/:id', furnitureController.getFurnitureById);

// Private routes (ต้อง login + เฉพาะแอดมิน)
router.use(authenticate, authorize('ADMIN'));

router.post('/', furnitureController.createFurniture);
router.put('/:id', furnitureController.updateFurniture);
router.delete('/:id', furnitureController.deleteFurniture);

module.exports = router;
