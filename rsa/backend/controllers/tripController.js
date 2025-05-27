const Trip = require('../models/Trip');
const Route = require('../models/Route');
// const User = require('../models/User'); // Removed unused User import
const Vehicle = require('../models/Vehicle'); // For assigning vehicle
const Driver = require('../models/Driver');   // For assigning driver
const Booking = require('../models/Booking'); // Trips are often linked to bookings
const { AppError, ValidationError, NotFoundError, AuthorizationError } = require('../middleware/errorHandler');
const { createLogger } = require('../utils/logger');
const APIFeatures = require('../utils/apiFeatures');
// const mongoose = require('mongoose'); // Removed unused mongoose import

const logger = createLogger('TripController');

/**
 * @desc    Create a new trip (often linked to a booking)
 * @route   POST /api/v1/trips
 * @access  Private (User or Admin, depending on logic)
 */
exports.createTrip = async (req, res, next) => {
  try {
    const { routeId, bookingId, scheduledDepartureTime, passengers, pickupLocation, dropoffLocation, specialRequirements } = req.body;
    const userId = req.user.id; // Assuming user is logged in

    if (!routeId || !scheduledDepartureTime) {
      return next(new ValidationError('Route ID and scheduled departure time are required.', 400));
    }

    const route = await Route.findById(routeId).where({ status: 'active' });
    if (!route) {
      return next(new NotFoundError(`Active route not found with ID: ${routeId}`, 404));
    }

    // Check route availability for the scheduled time (simplified)
    if (!route.isAvailable(new Date(scheduledDepartureTime))) {
        return next(new AppError('The selected route is not available at the scheduled time.', 400));
    }

    // If bookingId is provided, ensure it exists and belongs to the user (or admin creating)
    let booking;
    if (bookingId) {
        booking = await Booking.findById(bookingId);
        if (!booking) return next(new NotFoundError(`Booking not found with ID: ${bookingId}`));
        if (booking.user.toString() !== userId && req.user.role !== 'admin') {
            return next(new AuthorizationError('You are not authorized to create a trip for this booking.', 403));
        }
        if (booking.status !== 'confirmed' && booking.status !== 'pending_payment') { // Or other valid statuses
             return next(new AppError(`Booking status (${booking.status}) does not allow trip creation.`, 400));
        }
    }

    // Calculate price (can be from route or booking)
    const priceDetails = booking ? booking.pricing : await route.calculatePrice(passengers ? passengers.length + 1 : 1, new Date(scheduledDepartureTime));

    const newTrip = await Trip.create({
      user: userId,
      route: routeId,
      booking: bookingId || null,
      passengers: passengers || (booking ? booking.passengers : []),
      schedule: {
        scheduledDeparture: new Date(scheduledDepartureTime),
        // estimatedArrival will be calculated by pre-save hook or method
      },
      pickupLocation: pickupLocation || (booking ? booking.pickupLocation : route.originDetails()),
      dropoffLocation: dropoffLocation || (booking ? booking.dropoffLocation : route.destinationDetails()),
      pricing: {
        totalAmount: priceDetails.finalAmount || priceDetails.totalAmount,
        currency: priceDetails.currency,
        baseFare: priceDetails.baseFare,
        fees: priceDetails.fees,
        taxes: priceDetails.taxes,
        discount: priceDetails.discount
      },
      status: 'scheduled', // Initial status
      specialRequirements: specialRequirements || (booking ? booking.specialRequirements : ''),
      metadata: { createdBy: userId }
    });

    // Link trip to booking if bookingId was provided
    if (booking) {
        booking.trip = newTrip._id;
        booking.status = 'trip_scheduled'; // Update booking status
        await booking.save();
    }

    // TODO: Potentially assign vehicle and driver here or through a separate process/job
    // await newTrip.assignVehicleAndDriver();

    logger.info('Trip created successfully', { tripId: newTrip._id, userId, routeId, bookingId });
    res.status(201).json({
      success: true,
      message: 'Trip created successfully.',
      data: newTrip
    });

  } catch (error) {
    logger.error('Error creating trip', { error: error.message, stack: error.stack, body: req.body, userId: req.user.id });
    if (error.name === 'ValidationError') {
      return next(new ValidationError(error.message));
    }
    next(new AppError('Server error while creating trip.', 500));
  }
};

/**
 * @desc    Get all trips (for admin or user's own trips)
 * @route   GET /api/v1/trips
 * @access  Private
 */
exports.getAllTrips = async (req, res, next) => {
  try {
    let queryFilter = {};
    if (req.user.role !== 'admin' && req.user.role !== 'driver_admin' && req.user.role !== 'support_agent') {
      queryFilter.user = req.user.id; // Regular users see only their own trips
    } else if (req.user.role === 'driver') {
      queryFilter.driver = req.user.driverProfileId; // Drivers see trips assigned to them
    }
    // Admins can see all trips, potentially with more filters from req.query

    const features = new APIFeatures(Trip.find(queryFilter)
        .populate('user', 'profile.firstName profile.lastName email')
        .populate('route', 'name origin destination')
        .populate('vehicle', 'make model registration.plateNumber')
        .populate('driver', 'user') // Populate driver's user info
        .populate('booking', 'bookingId'), 
        req.query)
      .filter()
      .sort()
      .limitFields()
      .paginate();

    const trips = await features.query;
    const totalTrips = await Trip.countDocuments({ ...features.getQuery()._conditions, ...queryFilter });

    logger.info('Retrieved trips', { count: trips.length, userId: req.user.id, role: req.user.role, query: req.query });
    res.status(200).json({
      success: true,
      count: trips.length,
      total: totalTrips,
      pagination: features.pagination,
      data: trips
    });

  } catch (error) {
    logger.error('Error getting all trips', { error: error.message, stack: error.stack, userId: req.user.id });
    next(new AppError('Server error while retrieving trips.', 500));
  }
};

/**
 * @desc    Get a single trip by ID
 * @route   GET /api/v1/trips/:id
 * @access  Private
 */
exports.getTripById = async (req, res, next) => {
  try {
    const trip = await Trip.findById(req.params.id)
      .populate('user', 'profile.firstName profile.lastName email profile.phone')
      .populate({ path: 'route', populate: { path: 'origin destination', select: 'name location address' } })
      .populate('vehicle')
      .populate({ path: 'driver', populate: { path: 'user', select: 'profile.firstName profile.lastName email profile.phone profile.avatar' } })
      .populate('booking', 'bookingId paymentStatus');

    if (!trip) {
      return next(new NotFoundError(`Trip not found with ID: ${req.params.id}`, 404));
    }

    // Authorization: User can see their own trip, admin/driver can see assigned/all trips
    if (req.user.role !== 'admin' && 
        req.user.role !== 'driver_admin' && 
        req.user.role !== 'support_agent' && 
        trip.user.toString() !== req.user.id && 
        (req.user.role !== 'driver' || (trip.driver && trip.driver._id.toString() !== req.user.driverProfileId))) {
      return next(new AuthorizationError('You are not authorized to view this trip.', 403));
    }

    logger.info('Retrieved trip by ID', { tripId: req.params.id, userId: req.user.id });
    res.status(200).json({
      success: true,
      data: trip
    });

  } catch (error) {
    logger.error('Error getting trip by ID', { tripId: req.params.id, error: error.message, stack: error.stack, userId: req.user.id });
    if (error.name === 'CastError') {
        return next(new NotFoundError(`Trip not found with ID: ${req.params.id}`, 404));
    }
    next(new AppError('Server error while retrieving trip.', 500));
  }
};

/**
 * @desc    Update a trip by ID (e.g., assign driver/vehicle, change status)
 * @route   PUT /api/v1/trips/:id
 * @access  Private (Admin, or Driver for specific status updates)
 */
exports.updateTrip = async (req, res, next) => {
  try {
    const tripId = req.params.id;
    const { status, vehicleId, driverId, actualDepartureTime, actualArrivalTime, notes, trackingData } = req.body;

    const trip = await Trip.findById(tripId);
    if (!trip) {
      return next(new NotFoundError(`Trip not found with ID: ${tripId}`, 404));
    }

    // Authorization checks
    const isAdmin = req.user.role === 'admin' || req.user.role === 'driver_admin' || req.user.role === 'support_agent';
    const isDriverOfTrip = req.user.role === 'driver' && trip.driver && trip.driver.toString() === req.user.driverProfileId;

    if (!isAdmin && !isDriverOfTrip) {
        return next(new AuthorizationError('You are not authorized to update this trip.', 403));
    }
    
    // Specific updates allowed by driver
    if (isDriverOfTrip && !isAdmin) {
        if (status && !['started', 'completed', 'delayed', 'en_route'].includes(status)) {
            return next(new AuthorizationError(`Drivers can only update status to started, completed, delayed, or en_route.`, 403));
        }
        // Drivers can only update specific fields
        const allowedDriverUpdates = {};
        if (status) allowedDriverUpdates.status = status;
        if (actualDepartureTime) allowedDriverUpdates['schedule.actualDeparture'] = new Date(actualDepartureTime);
        if (actualArrivalTime) allowedDriverUpdates['schedule.actualArrival'] = new Date(actualArrivalTime);
        if (trackingData) allowedDriverUpdates.tracking = { ...trip.tracking, ...trackingData, lastUpdate: Date.now() };
        if (notes) allowedDriverUpdates['communication.internalNotes'] = (trip.communication.internalNotes || '') + `\nDriver Note: ${notes}`;
        
        const updatedTrip = await Trip.findByIdAndUpdate(tripId, { $set: allowedDriverUpdates }, { new: true, runValidators: true });
        logger.info('Trip updated by driver', { tripId, driverId: req.user.driverProfileId, changes: allowedDriverUpdates });
        return res.status(200).json({ success: true, message: 'Trip updated successfully.', data: updatedTrip });
    }

    // Admin updates
    if (isAdmin) {
        const updateData = { ...req.body };
        if (vehicleId) {
            const vehicle = await Vehicle.findById(vehicleId).where({ status: 'available' });
            if (!vehicle) return next(new NotFoundError(`Available vehicle not found or invalid: ${vehicleId}`, 400));
            updateData.vehicle = vehicleId;
        }
        if (driverId) {
            const driver = await Driver.findById(driverId).where({ status: 'active', 'availability.status': 'available' });
            if (!driver) return next(new NotFoundError(`Available driver not found or invalid: ${driverId}`, 400));
            updateData.driver = driverId;
        }
        if (actualDepartureTime) updateData['schedule.actualDeparture'] = new Date(actualDepartureTime);
        if (actualArrivalTime) updateData['schedule.actualArrival'] = new Date(actualArrivalTime);
        if (trackingData) updateData.tracking = { ...trip.tracking, ...trackingData, lastUpdate: Date.now() };

        updateData['metadata.updatedBy'] = req.user.id;
        updateData['metadata.lastUpdatedAt'] = Date.now();

        const updatedTrip = await Trip.findByIdAndUpdate(tripId, updateData, { new: true, runValidators: true });
        logger.info('Trip updated by admin', { tripId, adminUserId: req.user.id, changes: updateData });
        return res.status(200).json({ success: true, message: 'Trip updated successfully.', data: updatedTrip });
    }

  } catch (error) {
    logger.error('Error updating trip', { tripId: req.params.id, error: error.message, stack: error.stack, body: req.body, userId: req.user.id });
    if (error.name === 'ValidationError') {
      return next(new ValidationError(error.message));
    }
    if (error.name === 'CastError') {
        return next(new NotFoundError(`Invalid ID format for trip, vehicle, or driver.`, 400));
    }
    next(new AppError('Server error while updating trip.', 500));
  }
};

/**
 * @desc    Cancel a trip by ID
 * @route   PUT /api/v1/trips/:id/cancel
 * @access  Private (User who booked, or Admin)
 */
exports.cancelTrip = async (req, res, next) => {
  try {
    const tripId = req.params.id;
    const { reason, cancelledBy } = req.body; // cancelledBy could be 'user', 'driver', 'admin', 'system'

    const trip = await Trip.findById(tripId).populate('booking');
    if (!trip) {
      return next(new NotFoundError(`Trip not found with ID: ${tripId}`, 404));
    }

    // Authorization
    if (req.user.role !== 'admin' && trip.user.toString() !== req.user.id) {
      return next(new AuthorizationError('You are not authorized to cancel this trip.', 403));
    }

    if (trip.status === 'cancelled' || trip.status === 'completed') {
        return next(new AppError(`Trip is already ${trip.status} and cannot be cancelled.`, 400));
    }

    // Call instance method for cancellation logic (handles refunds, notifications etc.)
    await trip.cancel(reason || 'Cancelled by user/admin', cancelledBy || (req.user.role === 'admin' ? 'admin' : 'user'), req.user.id);

    logger.info('Trip cancelled successfully', { tripId, userId: req.user.id, reason });
    res.status(200).json({
      success: true,
      message: 'Trip cancelled successfully.',
      data: trip // Return updated trip
    });

  } catch (error) {
    logger.error('Error cancelling trip', { tripId: req.params.id, error: error.message, stack: error.stack, userId: req.user.id });
    if (error.message.includes('cancellation policy')) { // Custom error from model method
        return next(new AppError(error.message, 400));
    }
    next(new AppError('Server error while cancelling trip.', 500));
  }
};

/**
 * @desc    Get trip status updates (for live tracking - could be part of a more complex tracking system)
 * @route   GET /api/v1/trips/:id/status
 * @access  Private
 */
exports.getTripStatus = async (req, res, next) => {
    try {
        const trip = await Trip.findById(req.params.id).select('status tracking schedule.actualDeparture schedule.estimatedArrival schedule.actualArrival driver vehicle');

        if (!trip) {
            return next(new NotFoundError(`Trip not found with ID: ${req.params.id}`, 404));
        }

        // Authorization (similar to getTripById)
        if (req.user.role !== 'admin' && trip.user.toString() !== req.user.id && (req.user.role !== 'driver' || trip.driver?.toString() !== req.user.driverProfileId)) {
            return next(new AuthorizationError('You are not authorized to view this trip status.', 403));
        }

        logger.info('Retrieved trip status', { tripId: req.params.id });
        res.status(200).json({
            success: true,
            data: {
                status: trip.status,
                tracking: trip.tracking,
                schedule: trip.schedule,
                driverId: trip.driver,
                vehicleId: trip.vehicle
            }
        });
    } catch (error) {
        logger.error('Error getting trip status', { tripId: req.params.id, error: error.message, stack: error.stack });
        next(new AppError('Server error retrieving trip status.', 500));
    }
};

/**
 * @desc    Admin: Assign driver to a trip
 * @route   PUT /api/v1/trips/:id/assign-driver
 * @access  Private (Admin)
 */
exports.assignDriverToTrip = async (req, res, next) => {
    try {
        const { driverId } = req.body;
        if (!driverId) return next(new ValidationError('Driver ID is required.', 400));

        const trip = await Trip.findById(req.params.id);
        if (!trip) return next(new NotFoundError(`Trip not found with ID: ${req.params.id}`));
        if (trip.status !== 'scheduled' && trip.status !== 'pending_assignment') {
            return next(new AppError(`Trip status (${trip.status}) does not allow driver assignment.`, 400));
        }

        const driver = await Driver.findById(driverId).where({ status: 'active', 'availability.status': 'available' });
        if (!driver) return next(new NotFoundError(`Active and available driver not found with ID: ${driverId}`, 404));

        trip.driver = driverId;
        trip.status = 'driver_assigned'; // Or 'ready_for_pickup'
        // Potentially update driver's availability
        // driver.availability.status = 'on_trip_assigned';
        // await driver.save();
        await trip.save();

        // TODO: Notify driver

        logger.info('Driver assigned to trip', { tripId: trip._id, driverId, adminUserId: req.user.id });
        res.status(200).json({ success: true, message: 'Driver assigned successfully.', data: trip });

    } catch (error) {
        logger.error('Error assigning driver to trip', { tripId: req.params.id, driverId: req.body.driverId, error: error.message });
        next(new AppError('Server error assigning driver.', 500));
    }
};

/**
 * @desc    Admin: Assign vehicle to a trip
 * @route   PUT /api/v1/trips/:id/assign-vehicle
 * @access  Private (Admin)
 */
exports.assignVehicleToTrip = async (req, res, next) => {
    try {
        const { vehicleId } = req.body;
        if (!vehicleId) return next(new ValidationError('Vehicle ID is required.', 400));

        const trip = await Trip.findById(req.params.id);
        if (!trip) return next(new NotFoundError(`Trip not found with ID: ${req.params.id}`));
         if (trip.status !== 'scheduled' && trip.status !== 'pending_assignment' && trip.status !== 'driver_assigned') {
            return next(new AppError(`Trip status (${trip.status}) does not allow vehicle assignment.`, 400));
        }

        const vehicle = await Vehicle.findById(vehicleId).where({ status: 'available' });
        if (!vehicle) return next(new NotFoundError(`Available vehicle not found with ID: ${vehicleId}`, 404));

        trip.vehicle = vehicleId;
        // Potentially update vehicle's availability
        // vehicle.availability.status = 'assigned_to_trip';
        // await vehicle.save();
        await trip.save();

        // TODO: Notify relevant parties

        logger.info('Vehicle assigned to trip', { tripId: trip._id, vehicleId, adminUserId: req.user.id });
        res.status(200).json({ success: true, message: 'Vehicle assigned successfully.', data: trip });

    } catch (error) {
        logger.error('Error assigning vehicle to trip', { tripId: req.params.id, vehicleId: req.body.vehicleId, error: error.message });
        next(new AppError('Server error assigning vehicle.', 500));
    }
};