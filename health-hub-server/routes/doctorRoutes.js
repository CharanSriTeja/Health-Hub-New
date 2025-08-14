const express = require('express');
const router = express.Router();
const doctorController = require('../controllers/doctorController');
const { authenticateToken } = require('../middleware/auth');

// Public routes
router.get('/', doctorController.getAllDoctors);
router.get('/stats', doctorController.getDoctorStats);
router.get('/:id', doctorController.getDoctorById);
router.get('/hospital/:hospitalId', doctorController.getDoctorsByHospital);
router.get('/:doctorId/available-slots', doctorController.getAvailableSlots);

// Protected routes (admin only)
router.post('/', authenticateToken, doctorController.createDoctor);
router.put('/:id', authenticateToken, doctorController.updateDoctor);
router.delete('/:id', authenticateToken, doctorController.deleteDoctor);

module.exports = router;
