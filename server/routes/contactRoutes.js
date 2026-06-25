const express = require('express');
const router = express.Router();
const { authenticate, authorize } = require('../middleware/authMiddleware');
const rateLimit = require('express-rate-limit');
const contactController = require('../controllers/contactController');

const contactLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 5,
  message: 'Too many contact submissions, please try again later.',
});

// Public
router.post('/', contactLimiter, contactController.submitContact);

// Private (เฉพาะแอดมิน — ข้อมูลลูกค้า)
router.get('/', authenticate, authorize('ADMIN'), contactController.getContacts);

module.exports = router;
