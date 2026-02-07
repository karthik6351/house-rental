const express = require('express');
const router = express.Router();
const { register, login, getMe, forgotPassword, verifyResetToken, resetPassword } = require('../controllers/authController');
const { authenticate } = require('../middleware/auth');
const { authLimiter } = require('../config/rateLimiter');

// Public routes (with rate limiting)
router.post('/register', authLimiter, register);
router.post('/login', authLimiter, login);

// Password reset routes (public, with rate limiting)
router.post('/forgot-password', authLimiter, forgotPassword);
router.get('/verify-reset-token/:token', verifyResetToken);
router.post('/reset-password/:token', authLimiter, resetPassword);

// Protected route
router.get('/me', authenticate, getMe);

module.exports = router;
