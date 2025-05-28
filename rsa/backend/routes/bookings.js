const express = require('express');
const router = express.Router();
const {
    createBooking,
    getAllBookings,
    getBookingById,
    cancelBooking,
    updateBooking, // Admin update
    confirmBookingPayment // Assuming this will be added to controller
    // getBookingInvoice // Assuming this will be added to controller
} = require('../controllers/bookingController');
const { authenticate, authorize } = require('../middleware/auth');

// Create a new booking (User)
router.post('/', authenticate, authorize(['user', 'admin']), createBooking); // Admin might create on behalf of user

// Get all bookings (User sees their own, Admin/Support sees relevant/all)
router.get('/', authenticate, getAllBookings);

// Get a single booking by ID (User sees their own, Admin/Support sees relevant)
router.get('/:id', authenticate, getBookingById);

// Cancel a booking (User who made it, or Admin)
router.put('/:id/cancel', authenticate, authorize(['user', 'admin']), cancelBooking);

// Admin: Update booking details or status
router.put('/:id', authenticate, authorize(['admin', 'support_agent']), updateBooking);

// Confirm payment for a booking (could be a webhook or manual admin action)
// Example: router.post('/:id/confirm-payment', authenticate, authorize(['admin', 'system']), confirmBookingPayment);

// Get invoice for a booking
// Example: router.get('/:id/invoice', authenticate, authorize(['user', 'admin']), getBookingInvoice);


module.exports = router;