const express = require('express');
const router = express.Router();
const { authenticate } = require('../middleware/authMiddleware');
const designController = require('../controllers/designController');

// Public routes (ไม่ต้อง login)
router.get('/', designController.getAllDesigns);

// Private routes (ต้อง login)
router.use(authenticate);

router.post('/', designController.createDesign);
router.put('/:id', designController.updateDesign);
router.delete('/:id', designController.deleteDesign);

module.exports = router;
