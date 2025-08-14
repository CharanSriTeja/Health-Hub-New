const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const { authenticateToken } = require('../middleware/auth');
const {
  validateUserRegistration,
  validateUserLogin
} = require('../middleware/validation');

// @route   POST /api/auth/register
// @desc    Register a new user
// @access  Public
router.post('/register', validateUserRegistration, authController.register);

// @route   POST /api/auth/login
// @desc    Login user
// @access  Public
router.post('/login', validateUserLogin, authController.login);

// @route   POST /api/auth/refresh
// @desc    Refresh access token
// @access  Public
router.post('/refresh', authController.refreshToken);

// @route   GET /api/auth/me
// @desc    Get current user profile
// @access  Private
router.get('/me', authenticateToken, authController.getMe);

// @route   POST /api/auth/logout
// @desc    Logout user
// @access  Private
router.post('/logout', authenticateToken, authController.logout);

// @route   PUT /api/auth/change-password
// @desc    Change password
// @access  Private
router.put('/change-password', authenticateToken, authController.changePassword);

// @route   POST /api/auth/forgot-password
// @desc    Forgot password
// @access  Public
router.post('/forgot-password', authController.forgotPassword);

// @route   POST /api/auth/reset-password
// @desc    Reset password
// @access  Public
router.post('/reset-password', authController.resetPassword);

module.exports = router;
