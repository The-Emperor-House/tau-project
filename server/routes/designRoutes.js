const express = require('express');
const router = express.Router();
const { authenticate, authorize } = require('../middleware/authMiddleware');
const designController = require('../controllers/designController');

// Public routes (ไม่ต้อง login)
router.get('/', designController.getAllDesigns);

// Private routes (ต้อง login + เฉพาะแอดมิน)
router.use(authenticate, authorize('ADMIN'));

router.post('/', designController.createDesign);
router.put('/:id', designController.updateDesign);
router.delete('/:id', designController.deleteDesign);

module.exports = router;
