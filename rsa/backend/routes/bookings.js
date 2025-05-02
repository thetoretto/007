const express = require('express');
const router = express.Router();
// const { auth, checkRole } = require('../middleware/auth');
const bookingController = require('../controllers/bookingController');

// router.post('/', auth, checkRole(['passenger']), bookingController.createBooking);
// router.get('/', auth, checkRole(['passenger']), bookingController.getUserBookings);
// router.get('/:id', auth, bookingController.getBookingById);
// router.put('/:id', auth, checkRole(['passenger']), bookingController.updateBooking);
// router.delete('/:id', auth, checkRole(['passenger']), bookingController.cancelBooking);
// router.get('/trip/:tripId', auth, checkRole(['driver', 'admin']), bookingController.getTripBookings);
// router.put('/:id/checkin', auth, checkRole(['driver']), bookingController.checkInPassenger);

module.exports = router;