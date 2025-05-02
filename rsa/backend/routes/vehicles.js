const express = require('express');
const router = express.Router();
const { auth, checkRole } = require('../middleware/auth');
const vehicleController = require('../controllers/vehicleController');

// @route   POST /api/vehicles
// @desc    Create a new vehicle
// @access  Private (Driver)
router.post('/', auth, checkRole(['driver']), vehicleController.createVehicle);

// @route   GET /api/vehicles
// @desc    Get all vehicles
// @access  Public
router.get('/', vehicleController.getVehicles);

// @route   GET /api/vehicles/driver
// @desc    Get driver's vehicles
// @access  Private (Driver)
router.get('/driver', auth, checkRole(['driver']), vehicleController.getDriverVehicles);

// @route   GET /api/vehicles/:id
// @desc    Get vehicle by ID
// @access  Public
router.get('/:id', vehicleController.getVehicleById);

// @route   PUT /api/vehicles/:id
// @desc    Update vehicle
// @access  Private (Driver)
router.put('/:id', auth, checkRole(['driver']), vehicleController.updateVehicle);

// @route   DELETE /api/vehicles/:id
// @desc    Delete vehicle
// @access  Private (Driver)
router.delete('/:id', auth, checkRole(['driver']), vehicleController.deleteVehicle);

module.exports = router;