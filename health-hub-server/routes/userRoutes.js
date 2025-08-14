const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const { authenticateToken, isAdmin, isDoctor } = require('../middleware/auth');
const { validateObjectId, validatePagination, validateSearchQuery } = require('../middleware/validation');

// @route   GET /api/users
// @desc    Get all users (with pagination and filtering)
// @access  Private (Admin only)
router.get('/', authenticateToken, isAdmin, validatePagination, validateSearchQuery, userController.getUsers);

// @route   GET /api/users/stats
// @desc    Get user statistics
// @access  Private (Admin only)
router.get('/stats', authenticateToken, isAdmin, userController.getUserStats);

// @route   GET /api/users/doctors
// @desc    Get all doctors
// @access  Private
router.get('/doctors', authenticateToken, validatePagination, validateSearchQuery, userController.getDoctors);

// @route   GET /api/users/patients
// @desc    Get all patients
// @access  Private (Doctors and Admins)
router.get('/patients', authenticateToken, isDoctor, validatePagination, validateSearchQuery, userController.getPatients);

// @route   GET /api/users/:id
// @desc    Get single user by ID
// @access  Private
router.get('/:id', authenticateToken, validateObjectId, userController.getUserById);

// @route   PUT /api/users/:id
// @desc    Update user profile
// @access  Private
router.put('/:id', authenticateToken, validateObjectId, userController.updateUser);

// @route   DELETE /api/users/:id
// @desc    Delete user
// @access  Private (Admin only)
router.delete('/:id', authenticateToken, isAdmin, validateObjectId, userController.deleteUser);

// @route   PUT /api/users/:id/role
// @desc    Update user role
// @access  Private (Admin only)
router.put('/:id/role', authenticateToken, isAdmin, validateObjectId, userController.updateUserRole);

// @route   PUT /api/users/:id/status
// @desc    Activate/Deactivate user
// @access  Private (Admin only)
router.put('/:id/status', authenticateToken, isAdmin, validateObjectId, userController.updateUserStatus);

module.exports = router;
