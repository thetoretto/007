const express = require('express');
const router = express.Router();
const {
    createTrip,
    getAllTrips,
    getTripById,
    updateTrip,
    cancelTrip,
    getTripTrackingInfo, // Assuming this will be added to controller
    updateTripStatus,    // Assuming this will be added to controller (more granular than updateTrip)
    getTripPassengers,   // Assuming this will be added to controller
    addTripFeedback      // Assuming this will be added to controller
} = require('../controllers/tripController');
const { authenticate, authorize } = require('../middleware/auth');

// Create a new trip (user or admin)
router.post('/', authenticate, createTrip);

// Get all trips (user sees their own, admin/support sees all based on role)
router.get('/', authenticate, getAllTrips);

// Get a single trip by ID (user sees their own, admin/driver/support sees relevant)
router.get('/:id', authenticate, getTripById);

// Update a trip (admin for most, driver for specific status/tracking updates)
router.put('/:id', authenticate, authorize(['admin', 'driver_admin', 'support_agent', 'driver']), updateTrip);

// Cancel a trip (user who booked or admin)
router.put('/:id/cancel', authenticate, authorize(['admin', 'user']), cancelTrip);

// Update trip status (more granular, e.g., driver starts trip)
// Example: router.patch('/:id/status', authenticate, authorize(['admin', 'driver']), updateTripStatus);

// Get live tracking info for a trip
router.get('/:id/tracking', authenticate, getTripTrackingInfo);

// Get passenger list for a trip (driver or admin)
router.get('/:id/passengers', authenticate, authorize(['admin', 'driver', 'support_agent']), getTripPassengers);

// Add feedback for a completed trip (user)
router.post('/:id/feedback', authenticate, authorize(['user']), addTripFeedback);

module.exports = router;