const express = require('express');
const router = express.Router();
const prescriptionController = require('../controllers/prescriptionController');
const { authenticateToken } = require('../middleware/auth');

// Public routes (for authenticated users)
router.get('/', authenticateToken, prescriptionController.getAllPrescriptions);
router.get('/stats', authenticateToken, prescriptionController.getPrescriptionStats);
router.get('/export', authenticateToken, prescriptionController.exportPrescriptions);
router.get('/:id', authenticateToken, prescriptionController.getPrescriptionById);

// Protected routes
router.post('/', authenticateToken, prescriptionController.createPrescription);
router.put('/:id', authenticateToken, prescriptionController.updatePrescription);
router.delete('/:id', authenticateToken, prescriptionController.deletePrescription);
router.post('/:id/share', authenticateToken, prescriptionController.sharePrescription);

module.exports = router;
