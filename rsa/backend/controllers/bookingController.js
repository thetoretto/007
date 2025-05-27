const Booking = require('../models/Booking');
const User = require('../models/User');
const Route = require('../models/Route');
const Trip = require('../models/Trip');
const Payment = require('../models/Payment'); // For payment integration
const { AppError, ValidationError, NotFoundError, AuthorizationError } = require('../middleware/errorHandler');
const { createLogger } = require('../utils/logger');
const APIFeatures = require('../utils/apiFeatures');
const mongoose = require('mongoose');

const logger = createLogger('BookingController');

/**
 * @desc    Create a new booking
 * @route   POST /api/v1/bookings
 * @access  Private (User)
 */
exports.createBooking = async (req, res, next) => {
  try {
    const {
      routeId,
      tripId, // Optional: if booking for a pre-existing specific trip instance
      passengers, // Array of passenger details
      scheduledDateTime, // If booking a route, not a specific trip instance
      pickupLocation, // Can override route's default
      dropoffLocation, // Can override route's default
      specialRequirements,
      paymentMethodDetails // e.g., { type: 'card', token: 'tok_xxxx' }
    } = req.body;
    const userId = req.user.id;

    if (!routeId && !tripId) {
      return next(new ValidationError('Either Route ID or Trip ID is required to make a booking.', 400));
    }
    if (tripId && routeId) {
        logger.warn('Both tripId and routeId provided for booking, tripId will take precedence for route info.', { tripId, routeId, userId });
    }

    let routeForBooking;
    let tripDetails = {};

    if (tripId) {
        const existingTrip = await Trip.findById(tripId).populate('route');
        if (!existingTrip) return next(new NotFoundError(`Trip not found with ID: ${tripId}`));
        if (existingTrip.status !== 'scheduled' && existingTrip.status !== 'pending_assignment') { // Or other bookable statuses
            return next(new AppError(`This trip (ID: ${tripId}) is not available for booking (status: ${existingTrip.status}).`, 400));
        }
        routeForBooking = existingTrip.route;
        tripDetails.id = existingTrip._id;
        tripDetails.scheduledDeparture = existingTrip.schedule.scheduledDeparture;
        // Potentially check seat availability on the specific trip instance
    } else {
        routeForBooking = await Route.findById(routeId).where({ status: 'active' });
        if (!routeForBooking) return next(new NotFoundError(`Active route not found with ID: ${routeId}`, 404));
        if (!scheduledDateTime) return next(new ValidationError('Scheduled date and time are required when booking a route directly.', 400));
        
        if (!routeForBooking.isAvailable(new Date(scheduledDateTime))) {
            return next(new AppError('The selected route is not available at the scheduled date/time.', 400));
        }
        tripDetails.scheduledDeparture = new Date(scheduledDateTime);
    }

    const numPassengers = (passengers ? passengers.length : 0) + 1; // +1 for the main user
    const calculatedPrice = await routeForBooking.calculatePrice(numPassengers, tripDetails.scheduledDeparture);

    const newBooking = new Booking({
      user: userId,
      route: routeForBooking._id,
      trip: tripDetails.id || null, // Will be null if booking a route, trip created later or on confirmation
      passengers: passengers || [],
      schedule: {
        requestedDateTime: tripDetails.scheduledDeparture,
      },
      pickupLocation: pickupLocation || routeForBooking.originDetails(),
      dropoffLocation: dropoffLocation || routeForBooking.destinationDetails(),
      pricing: {
        totalAmount: calculatedPrice.finalAmount,
        currency: calculatedPrice.currency,
        baseFare: calculatedPrice.baseFare,
        fees: calculatedPrice.fees,
        taxes: calculatedPrice.taxes,
        discount: calculatedPrice.discount,
        paymentBreakdown: calculatedPrice.breakdown
      },
      status: 'pending_payment', // Initial status, moves to 'confirmed' after payment
      specialRequirements,
      metadata: { createdBy: userId }
    });

    // --- Payment Processing Step (Simplified) ---
    // In a real app, you'd integrate with a payment gateway here.
    // For now, let's assume payment is successful if paymentMethodDetails are provided.
    let paymentRecord;
    if (paymentMethodDetails && paymentMethodDetails.type) {
        try {
            // Simulate payment processing
            paymentRecord = await Payment.create({
                user: userId,
                booking: newBooking._id, // Temporarily set, will be saved with booking
                amount: { value: newBooking.pricing.totalAmount, currency: newBooking.pricing.currency },
                paymentMethod: paymentMethodDetails,
                status: 'succeeded', // Assume success for now
                gateway: { name: 'mock_gateway', response: { simulated: true, transactionId: `MOCK_TRANS_${Date.now()}` } },
                transactionId: `MOCK_TRANS_${Date.now()}`
            });
            newBooking.payment = paymentRecord._id;
            newBooking.paymentStatus = 'paid';
            newBooking.status = 'confirmed'; // Update booking status to confirmed
            newBooking.confirmationId = `CONF-${Date.now().toString(36)}-${Math.random().toString(36).substr(2,7)}`.toUpperCase();
            newBooking.schedule.confirmedDateTime = new Date();

            logger.info('Simulated payment successful for booking', { bookingIdProvisional: newBooking.bookingId, paymentId: paymentRecord._id });
        } catch (paymentError) {
            logger.error('Simulated payment processing failed', { error: paymentError.message, userId, routeId: routeForBooking._id });
            newBooking.status = 'payment_failed';
            // Don't save booking if payment fails critically, or save with 'payment_failed'
            // For this example, we'll save it as payment_failed
        }
    }
    // --- End Payment Processing ---

    await newBooking.save();
    if (paymentRecord) {
        paymentRecord.booking = newBooking._id; // Ensure booking ID is correctly linked in payment
        await paymentRecord.save();
    }

    // If booking is confirmed and it was for a route (not a specific trip), a Trip record might be created now or by a background job.
    // For simplicity, we might create a basic Trip record here if status is confirmed.
    if (newBooking.status === 'confirmed' && !newBooking.trip) {
        const associatedTrip = await Trip.create({
            user: userId,
            route: newBooking.route,
            booking: newBooking._id,
            passengers: newBooking.passengers,
            schedule: {
                scheduledDeparture: newBooking.schedule.requestedDateTime,
            },
            pickupLocation: newBooking.pickupLocation,
            dropoffLocation: newBooking.dropoffLocation,
            pricing: newBooking.pricing,
            status: 'scheduled',
            specialRequirements: newBooking.specialRequirements,
            metadata: { createdBy: userId, autoCreatedFromBooking: true }
        });
        newBooking.trip = associatedTrip._id;
        await newBooking.save();
        logger.info('Trip auto-created from confirmed booking', { tripId: associatedTrip._id, bookingId: newBooking._id });
    }

    // TODO: Send booking confirmation email/SMS

    logger.info('Booking created', { bookingId: newBooking._id, userId, routeId: routeForBooking._id, status: newBooking.status });
    res.status(201).json({
      success: true,
      message: `Booking ${newBooking.status}. Confirmation ID: ${newBooking.confirmationId || 'N/A'}`,
      data: newBooking
    });

  } catch (error) {
    logger.error('Error creating booking', { error: error.message, stack: error.stack, body: req.body, userId: req.user.id });
    if (error.name === 'ValidationError') {
      return next(new ValidationError(error.message));
    }
    next(new AppError('Server error while creating booking.', 500));
  }
};

/**
 * @desc    Get all bookings (for admin or user's own bookings)
 * @route   GET /api/v1/bookings
 * @access  Private
 */
exports.getAllBookings = async (req, res, next) => {
  try {
    let queryFilter = {};
    if (req.user.role !== 'admin' && req.user.role !== 'support_agent') {
      queryFilter.user = req.user.id; // Regular users see only their own bookings
    }
    // Admins can see all bookings, potentially with more filters from req.query

    const features = new APIFeatures(Booking.find(queryFilter)
        .populate('user', 'profile.firstName profile.lastName email')
        .populate({ path: 'route', select: 'name origin destination', populate: { path: 'origin destination', select: 'name' } })
        .populate('trip', 'tripId status schedule.scheduledDeparture')
        .populate('payment', 'paymentId status amount'), 
        req.query)
      .filter()
      .sort()
      .limitFields()
      .paginate();

    const bookings = await features.query;
    const totalBookings = await Booking.countDocuments({ ...features.getQuery()._conditions, ...queryFilter });

    logger.info('Retrieved bookings', { count: bookings.length, userId: req.user.id, role: req.user.role, query: req.query });
    res.status(200).json({
      success: true,
      count: bookings.length,
      total: totalBookings,
      pagination: features.pagination,
      data: bookings
    });

  } catch (error) {
    logger.error('Error getting all bookings', { error: error.message, stack: error.stack, userId: req.user.id });
    next(new AppError('Server error while retrieving bookings.', 500));
  }
};

/**
 * @desc    Get a single booking by ID
 * @route   GET /api/v1/bookings/:id
 * @access  Private
 */
exports.getBookingById = async (req, res, next) => {
  try {
    const booking = await Booking.findById(req.params.id)
      .populate('user', 'profile.firstName profile.lastName email profile.phone')
      .populate({ path: 'route', populate: { path: 'origin destination', select: 'name location address' } })
      .populate({ path: 'trip', populate: { path: 'driver vehicle', select: 'user make model registration' } })
      .populate('payment');

    if (!booking) {
      return next(new NotFoundError(`Booking not found with ID: ${req.params.id}`, 404));
    }

    // Authorization: User can see their own booking, admin can see all
    if (req.user.role !== 'admin' && req.user.role !== 'support_agent' && booking.user._id.toString() !== req.user.id) {
      return next(new AuthorizationError('You are not authorized to view this booking.', 403));
    }

    logger.info('Retrieved booking by ID', { bookingId: req.params.id, userId: req.user.id });
    res.status(200).json({
      success: true,
      data: booking
    });

  } catch (error) {
    logger.error('Error getting booking by ID', { bookingId: req.params.id, error: error.message, stack: error.stack, userId: req.user.id });
    if (error.name === 'CastError') {
        return next(new NotFoundError(`Booking not found with ID: ${req.params.id}`, 404));
    }
    next(new AppError('Server error while retrieving booking.', 500));
  }
};

/**
 * @desc    Cancel a booking by ID
 * @route   PUT /api/v1/bookings/:id/cancel
 * @access  Private (User who made booking, or Admin)
 */
exports.cancelBooking = async (req, res, next) => {
  try {
    const bookingId = req.params.id;
    const { reason } = req.body;

    const booking = await Booking.findById(bookingId).populate('trip payment');
    if (!booking) {
      return next(new NotFoundError(`Booking not found with ID: ${bookingId}`, 404));
    }

    // Authorization
    if (req.user.role !== 'admin' && booking.user.toString() !== req.user.id) {
      return next(new AuthorizationError('You are not authorized to cancel this booking.', 403));
    }

    if (['cancelled', 'completed', 'refunded'].includes(booking.status)) {
        return next(new AppError(`Booking is already ${booking.status} and cannot be cancelled.`, 400));
    }

    // Call instance method for cancellation logic (handles refunds, trip cancellation etc.)
    await booking.cancel(reason || 'Cancelled by user/admin', req.user.role === 'admin' ? 'admin' : 'user', req.user.id);

    logger.info('Booking cancelled successfully', { bookingId, userId: req.user.id, reason });
    res.status(200).json({
      success: true,
      message: 'Booking cancelled successfully.',
      data: booking // Return updated booking
    });

  } catch (error) {
    logger.error('Error cancelling booking', { bookingId: req.params.id, error: error.message, stack: error.stack, userId: req.user.id });
    if (error.message.includes('cancellation policy') || error.message.includes('Cannot cancel')) { // Custom error from model method
        return next(new AppError(error.message, 400));
    }
    next(new AppError('Server error while cancelling booking.', 500));
  }
};

/**
 * @desc    Admin: Update booking status or details
 * @route   PUT /api/v1/bookings/:id
 * @access  Private (Admin)
 */
exports.updateBooking = async (req, res, next) => {
    try {
        const bookingId = req.params.id;
        const updateData = req.body;

        // Ensure only admins can use this generic update endpoint for now
        if (req.user.role !== 'admin' && req.user.role !== 'support_agent') {
            return next(new AuthorizationError('You are not authorized to perform this update.', 403));
        }

        const booking = await Booking.findById(bookingId);
        if (!booking) {
            return next(new NotFoundError(`Booking not found with ID: ${bookingId}`, 404));
        }

        // Add any specific logic for allowed updates, e.g., changing status, adding notes
        // For example, prevent changing user, route, or core pricing details easily.
        const allowedFields = ['status', 'paymentStatus', 'specialRequirements', 'notes', 'passengers', 'pickupLocation', 'dropoffLocation'];
        const finalUpdateData = {};
        for (const key in updateData) {
            if (allowedFields.includes(key)) {
                finalUpdateData[key] = updateData[key];
            }
        }
        finalUpdateData['metadata.updatedBy'] = req.user.id;
        finalUpdateData['metadata.lastUpdatedAt'] = Date.now();

        if (Object.keys(finalUpdateData).length <= 2) { // only metadata fields
            return next(new ValidationError('No valid fields provided for update.', 400));
        }

        const updatedBooking = await Booking.findByIdAndUpdate(bookingId, { $set: finalUpdateData }, { new: true, runValidators: true });

        logger.info('Booking updated by admin', { bookingId, adminUserId: req.user.id, changes: finalUpdateData });
        res.status(200).json({
            success: true,
            message: 'Booking updated successfully.',
            data: updatedBooking
        });

    } catch (error) {
        logger.error('Error updating booking (admin)', { bookingId: req.params.id, error: error.message, stack: error.stack, userId: req.user.id });
        if (error.name === 'ValidationError') {
            return next(new ValidationError(error.message));
        }
        next(new AppError('Server error while updating booking.', 500));
    }
};