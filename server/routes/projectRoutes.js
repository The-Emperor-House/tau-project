const express = require('express');
const router = express.Router();
const { authenticate } = require('../middleware/authMiddleware');
const projectController = require('../controllers/projectController');

// Public routes (ไม่ต้อง login)
router.get('/', projectController.getAllProjects);

// Private routes (ต้อง login)
router.use(authenticate);
router.post('/', projectController.createProject);
router.put('/:id', projectController.updateProject);
router.delete('/:id', projectController.deleteProject);

module.exports = router;
