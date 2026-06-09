const express = require('express');
const router = express.Router();
const { authenticate } = require('../middleware/authMiddleware');
const newsController = require('../controllers/newsController');

// Public routes
router.get('/', newsController.getAllNews);
router.get('/:id', newsController.getNewsById);

// Private routes with auth + role control
router.use(authenticate);

router.post('/', authenticate, newsController.createNews);
router.put('/:id', authenticate, newsController.updateNews);
router.delete('/:id', authenticate, newsController.deleteNews);

module.exports = router;
