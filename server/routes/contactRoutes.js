const express = require('express');
const router = express.Router();
const { authenticate } = require('../middleware/authMiddleware');
const rateLimit = require('express-rate-limit');
const contactController = require('../controllers/contactController');

const contactLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 5,
  message: 'Too many contact submissions, please try again later.',
});

// Public
router.post('/', contactLimiter, contactController.submitContact);

// Private
router.get('/', authenticate, contactController.getContacts);

module.exports = router;
