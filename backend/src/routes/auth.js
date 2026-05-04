// ─── routes/auth.js ───────────────────────────────────────────────────────────
const express = require('express');
const router = express.Router();
const ctrl = require('../controllers/authController');
const { protect, requireVerified } = require('../middleware/auth');
const { uploadProfilePhoto } = require('../middleware/upload');
const rateLimit = require('express-rate-limit');

const authLimiter = rateLimit({ windowMs: 15 * 60 * 1000, max: 20, message: 'Too many attempts.' });
const forgotLimiter = rateLimit({ windowMs: 60 * 60 * 1000, max: 5, message: 'Too many password reset attempts.' });

router.post('/register',        authLimiter,   ctrl.register);
router.post('/verify-otp',                     ctrl.verifyOtp);
router.post('/resend-otp',                     ctrl.resendOtp);
router.post('/login',           authLimiter,   ctrl.login);
router.post('/refresh',                        ctrl.refreshToken);
router.post('/forgot-password', forgotLimiter, ctrl.forgotPassword);
router.put('/reset-password/:token',           ctrl.resetPassword);
router.get('/me',               protect,       ctrl.getMe);
router.put('/update-profile',   protect, uploadProfilePhoto, ctrl.updateProfile);
router.put('/change-password',  protect, requireVerified,    ctrl.changePassword);
router.post('/logout',          protect,       ctrl.logout);

module.exports = router;