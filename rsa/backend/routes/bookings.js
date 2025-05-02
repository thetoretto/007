const express = require('express');
const router = express.Router();
const { auth, checkRole } = require('../middleware/auth');
const bookingController = require('../controllers/bookingController');

// @route   POST /api/bookings
// @desc    Create a new booking
// @access  Private (Passenger)
router.post('/', auth, checkRole(['passenger']), bookingController.createBooking);

// @route   GET /api/bookings
// @desc    Get all bookings for a user
// @access  Private (Passenger)
router.get('/', auth, checkRole(['passenger']), bookingController.getUserBookings);

// @route   GET /api/bookings/:id
// @desc    Get booking by ID
// @access  Private (Passenger/Driver/Admin)
router.get('/:id', auth, bookingController.getBookingById);

// @route   PUT /api/bookings/:id
// @desc    Update booking
// @access  Private (Passenger)
router.put('/:id', auth, checkRole(['passenger']), bookingController.updateBooking);

// @route   DELETE /api/bookings/:id
// @desc    Cancel booking
// @access  Private (Passenger)
router.delete('/:id', auth, checkRole(['passenger']), bookingController.cancelBooking);

// @route   GET /api/bookings/trip/:tripId
// @desc    Get all bookings for a trip
// @access  Private (Driver/Admin)
router.get('/trip/:tripId', auth, checkRole(['driver', 'admin']), bookingController.getTripBookings);

// @route   PUT /api/bookings/:id/checkin
// @desc    Check in passenger
// @access  Private (Driver)
router.put('/:id/checkin', auth, checkRole(['driver']), bookingController.checkInPassenger);

module.exports = router;