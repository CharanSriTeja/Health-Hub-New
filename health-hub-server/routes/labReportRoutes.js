const express = require('express');
const router = express.Router();
const labReportController = require('../controllers/labReportController');
const { authenticateToken } = require('../middleware/auth');

// Public routes (for authenticated users)
router.get('/', authenticateToken, labReportController.getAllLabReports);
router.get('/stats', authenticateToken, labReportController.getLabReportStats);
router.get('/:id', authenticateToken, labReportController.getLabReportById);
router.get('/:id/download', authenticateToken, labReportController.downloadLabReport);
router.get('/:id/view', authenticateToken, labReportController.viewLabReport);

// Protected routes
router.post('/', authenticateToken, labReportController.createLabReport);
router.put('/:id', authenticateToken, labReportController.updateLabReport);
router.delete('/:id', authenticateToken, labReportController.deleteLabReport);
router.post('/:id/share', authenticateToken, labReportController.shareLabReport);

module.exports = router;
