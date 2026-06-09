const express = require('express');
const router = express.Router();
const { authenticate } = require('../middleware/authMiddleware');
const furnitureController = require('../controllers/furnitureController');

// Public routes (ไม่ต้อง login)
router.get('/', furnitureController.getAllFurniture);
router.get('/:id', furnitureController.getFurnitureById);

// Private routes (ต้อง login)
router.use(authenticate);

router.post('/', furnitureController.createFurniture);
router.put('/:id', furnitureController.updateFurniture);
router.delete('/:id', furnitureController.deleteFurniture);

module.exports = router;
