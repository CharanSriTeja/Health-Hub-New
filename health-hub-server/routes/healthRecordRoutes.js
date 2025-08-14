const express = require('express');
const router = express.Router();
const healthRecordController = require('../controllers/healthRecordController');
const { authenticateToken } = require('../middleware/auth');

// Public routes (for authenticated users)
router.get('/', authenticateToken, healthRecordController.getAllHealthRecords);
router.get('/stats', authenticateToken, healthRecordController.getHealthRecordStats);
router.get('/export', authenticateToken, healthRecordController.exportHealthRecords);
router.get('/:id', authenticateToken, healthRecordController.getHealthRecordById);

// Protected routes
router.post('/', authenticateToken, healthRecordController.createHealthRecord);
router.put('/:id', authenticateToken, healthRecordController.updateHealthRecord);
router.delete('/:id', authenticateToken, healthRecordController.deleteHealthRecord);
router.post('/:id/share', authenticateToken, healthRecordController.shareHealthRecord);

module.exports = router;
