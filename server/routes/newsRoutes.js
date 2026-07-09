const express = require('express');
const router = express.Router();
const { authenticate } = require('../middleware/authMiddleware');
const newsController = require('../controllers/newsController');

// Public routes
router.get('/', newsController.getAllNews);
router.get('/:id', newsController.getNewsById);

// Private routes with auth + role control
router.use(authenticate);

router.post('/', newsController.createNews);
router.put('/:id', newsController.updateNews);
router.delete('/:id', newsController.deleteNews);

module.exports = router;
