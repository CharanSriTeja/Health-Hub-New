const express = require('express');
const router = express.Router();
const hospitalController = require('../controllers/hospitalController');
const { authenticateToken } = require('../middleware/auth');

// Public routes
router.get('/', hospitalController.getAllHospitals);
router.get('/stats', hospitalController.getHospitalStats);
router.get('/search-nearby', hospitalController.searchNearby);
router.get('/:id', hospitalController.getHospitalById);

// Protected routes (admin only)
router.post('/', authenticateToken, hospitalController.createHospital);
router.put('/:id', authenticateToken, hospitalController.updateHospital);
router.delete('/:id', authenticateToken, hospitalController.deleteHospital);

module.exports = router;
