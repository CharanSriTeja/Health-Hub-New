const express = require('express');
const router = express.Router();
const appointmentController = require('../controllers/appointmentController');
const { authenticateToken } = require('../middleware/auth');
const { 
  validateAppointmentCreation, 
  validateObjectId, 
  validatePagination, 
  validateSearchQuery 
} = require('../middleware/validation');

// @route   POST /api/appointments
// @desc    Create new appointment
// @access  Private
router.post('/', authenticateToken, validateAppointmentCreation, appointmentController.createAppointment);

// @route   GET /api/appointments
// @desc    Get all appointments (with filtering and pagination)
// @access  Private
router.get('/', authenticateToken, validatePagination, validateSearchQuery, appointmentController.getAppointments);

// @route   GET /api/appointments/stats
// @desc    Get appointment statistics
// @access  Private
router.get('/stats', authenticateToken, appointmentController.getAppointmentStats);

// @route   GET /api/appointments/available-slots
// @desc    Get available time slots
// @access  Private
router.get('/available-slots', authenticateToken, appointmentController.getAvailableSlots);

// @route   GET /api/appointments/:id
// @desc    Get single appointment by ID
// @access  Private
router.get('/:id', authenticateToken, validateObjectId, appointmentController.getAppointmentById);

// @route   PUT /api/appointments/:id
// @desc    Update appointment
// @access  Private
router.put('/:id', authenticateToken, validateObjectId, appointmentController.updateAppointment);

// @route   DELETE /api/appointments/:id
// @desc    Delete appointment
// @access  Private
router.delete('/:id', authenticateToken, validateObjectId, appointmentController.deleteAppointment);

module.exports = router;
