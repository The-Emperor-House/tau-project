const express = require('express');
const router = express.Router();

// Import route modules
const authRoutes = require('./authRoutes');
const userRoutes = require('./userRoutes');
const contactRoutes = require('./contactRoutes');
const newsRoutes = require('./newsRoutes');
const projectRoutes = require('./projectRoutes');
const designRoutes = require('./designRoutes');
const furnitureRoutes = require('./furnitureRoutes');

// API Versioning prefix: /api/v1
router.use('/auth', authRoutes);
router.use('/users', userRoutes);
router.use('/contacts', contactRoutes);
router.use('/news', newsRoutes);
router.use('/projects', projectRoutes);
router.use('/designs', designRoutes);
router.use('/furniture', furnitureRoutes);

module.exports = router;
