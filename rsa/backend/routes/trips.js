const express = require('express');
const router = express.Router();
const { auth, checkRole } = require('../middleware/auth');
const tripController = require('../controllers/tripController');

// @route   POST /api/trips
// @desc    Create a new trip
// @access  Private (Driver)
router.post('/', auth, checkRole(['driver']), tripController.createTrip);

// @route   GET /api/trips
// @desc    Get all trips (with filters)
// @access  Public
router.get('/', tripController.getTrips);

// @route   GET /api/trips/driver
// @desc    Get driver's trips
// @access  Private (Driver)
router.get('/driver', auth, checkRole(['driver']), tripController.getDriverTrips);

// @route   GET /api/trips/:id
// @desc    Get trip by ID
// @access  Public
router.get('/:id', tripController.getTripById);

// @route   PUT /api/trips/:id
// @desc    Update trip
// @access  Private (Driver)
router.put('/:id', auth, checkRole(['driver']), tripController.updateTrip);

// @route   DELETE /api/trips/:id
// @desc    Cancel trip
// @access  Private (Driver)
router.delete('/:id', auth, checkRole(['driver']), tripController.cancelTrip);

// @route   PUT /api/trips/:id/status
// @desc    Update trip status
// @access  Private (Driver)
router.put('/:id/status', auth, checkRole(['driver']), tripController.updateTripStatus);

module.exports = router;