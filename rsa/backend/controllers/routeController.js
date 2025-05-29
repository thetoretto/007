const Route = require('../models/Route');
const Hotpoint = require('../models/Hotpoint');
const { AppError, ValidationError, NotFoundError } = require('../middleware/errorHandler');
const { createLogger } = require('../utils/logger');
const APIFeatures = require('../utils/apiFeatures');

const logger = createLogger('RouteController');

/**
 * @desc    Create a new transportation route
 * @route   POST /api/v1/routes
 * @access  Private (Admin)
 */
exports.createRoute = async (req, res, next) => {
  try {
    const { name, description, origin, destination, waypoints, distance, duration, pricing, schedule, vehicleRequirements, status, tags } = req.body;

    if (!name || !origin || !destination || !pricing || !pricing.baseFare) {
      return next(new ValidationError('Name, origin, destination, and base fare are required.', 400));
    }

    // Validate origin, destination, and waypoints if they are Hotpoint IDs
    const locationIds = [origin, destination, ...(waypoints || []).map(wp => wp.hotpoint)].filter(id => id);
    if (locationIds.length > 0) {
        const validHotpoints = await Hotpoint.find({ _id: { $in: locationIds }, status: { $ne: 'deleted' } }).select('_id');
        if (validHotpoints.length !== new Set(locationIds).size) {
            return next(new ValidationError('One or more provided hotpoint IDs (origin, destination, waypoints) are invalid or not found.', 400));
        }
    }

    const newRoute = await Route.create({
      name,
      description,
      origin, // Assuming this is an ObjectId of a Hotpoint
      destination, // Assuming this is an ObjectId of a Hotpoint
      waypoints,
      distance,
      duration,
      pricing,
      schedule,
      vehicleRequirements,
      status: status || 'active',
      metadata: { createdBy: req.user.id, tags }
    });

    logger.info('Route created successfully', { routeId: newRoute._id, name: newRoute.name, adminUserId: req.user.id });
    res.status(201).json({
      success: true,
      message: 'Route created successfully.',
      data: newRoute
    });

  } catch (error) {
    logger.error('Error creating route', { error: error.message, stack: error.stack, body: req.body });
    if (error.name === 'ValidationError') {
      return next(new ValidationError(error.message));
    }
    next(new AppError('Server error while creating route.', 500));
  }
};

/**
 * @desc    Get all transportation routes
 * @route   GET /api/v1/routes
 * @access  Public
 */
exports.getAllRoutes = async (req, res, next) => {
  try {
    const features = new APIFeatures(Route.find({ status: { $ne: 'deleted' } }).populate('origin destination waypoints.hotpoint', 'name location.coordinates address'), req.query)
      .filter()
      .sort()
      .limitFields()
      .paginate();

    const routes = await features.query;
    const totalRoutes = await Route.countDocuments({ ...features.getQuery()._conditions, status: { $ne: 'deleted' } });

    logger.info('Retrieved all routes', { count: routes.length, query: req.query });
    res.status(200).json({
      success: true,
      count: routes.length,
      total: totalRoutes,
      pagination: features.pagination,
      data: routes
    });

  } catch (error) {
    logger.error('Error getting all routes', { error: error.message, stack: error.stack });
    next(new AppError('Server error while retrieving routes.', 500));
  }
};

/**
 * @desc    Get a single transportation route by ID
 * @route   GET /api/v1/routes/:id
 * @access  Public
 */
exports.getRouteById = async (req, res, next) => {
  try {
    const route = await Route.findById(req.params.id)
                        .where({ status: { $ne: 'deleted' } })
                        .populate('origin destination waypoints.hotpoint', 'name description location.coordinates address type category images');

    if (!route) {
      return next(new NotFoundError(`Route not found with ID: ${req.params.id}`, 404));
    }

    // route.updatePopularity(); // Example: Increment view count or recalculate popularity

    logger.info('Retrieved route by ID', { routeId: req.params.id });
    res.status(200).json({
      success: true,
      data: route
    });

  } catch (error) {
    logger.error('Error getting route by ID', { routeId: req.params.id, error: error.message, stack: error.stack });
    if (error.name === 'CastError') {
        return next(new NotFoundError(`Route not found with ID: ${req.params.id}`, 404));
    }
    next(new AppError('Server error while retrieving route.', 500));
  }
};

/**
 * @desc    Update a transportation route by ID
 * @route   PUT /api/v1/routes/:id
 * @access  Private (Admin)
 */
exports.updateRoute = async (req, res, next) => {
  try {
    const updateData = { ...req.body };
    updateData['metadata.updatedBy'] = req.user.id;
    updateData['metadata.lastUpdatedAt'] = Date.now();
    if(req.body.tags) updateData['metadata.tags'] = req.body.tags;

    // Validate hotpoint IDs if they are being updated
    const locationIdsToValidate = [];
    if (req.body.origin) locationIdsToValidate.push(req.body.origin);
    if (req.body.destination) locationIdsToValidate.push(req.body.destination);
    if (req.body.waypoints) req.body.waypoints.forEach(wp => { if(wp.hotpoint) locationIdsToValidate.push(wp.hotpoint); });

    if (locationIdsToValidate.length > 0) {
        const validHotpoints = await Hotpoint.find({ _id: { $in: locationIdsToValidate }, status: { $ne: 'deleted' } }).select('_id');
        if (validHotpoints.length !== new Set(locationIdsToValidate.filter(id => id)).size) {
            return next(new ValidationError('One or more provided hotpoint IDs for update are invalid or not found.', 400));
        }
    }

    const route = await Route.findByIdAndUpdate(req.params.id, updateData, {
      new: true,
      runValidators: true
    }).populate('origin destination waypoints.hotpoint', 'name location.coordinates');

    if (!route || route.status === 'deleted') {
      return next(new NotFoundError(`Route not found or has been deleted with ID: ${req.params.id}`, 404));
    }

    logger.info('Route updated successfully', { routeId: req.params.id, adminUserId: req.user.id });
    res.status(200).json({
      success: true,
      message: 'Route updated successfully.',
      data: route
    });

  } catch (error) {
    logger.error('Error updating route', { routeId: req.params.id, error: error.message, stack: error.stack, body: req.body });
    if (error.name === 'ValidationError') {
      return next(new ValidationError(error.message));
    }
    if (error.name === 'CastError') {
        return next(new NotFoundError(`Route not found with ID: ${req.params.id}`, 404));
    }
    next(new AppError('Server error while updating route.', 500));
  }
};

/**
 * @desc    Delete a transportation route by ID (Soft Delete)
 * @route   DELETE /api/v1/routes/:id
 * @access  Private (Admin)
 */
exports.deleteRoute = async (req, res, next) => {
  try {
    const route = await Route.findById(req.params.id);

    if (!route || route.status === 'deleted') {
      return next(new NotFoundError(`Route not found or already deleted with ID: ${req.params.id}`, 404));
    }

    route.status = 'deleted';
    route.metadata.deletedBy = req.user.id;
    route.metadata.deletedAt = Date.now();
    await route.save();

    logger.info('Route (soft) deleted successfully', { routeId: req.params.id, adminUserId: req.user.id });
    res.status(200).json({
      success: true,
      message: 'Route deleted successfully.',
      data: {} // Or return the soft-deleted route
    });

  } catch (error) {
    logger.error('Error deleting route', { routeId: req.params.id, error: error.message, stack: error.stack });
    if (error.name === 'CastError') {
        return next(new NotFoundError(`Route not found with ID: ${req.params.id}`, 404));
    }
    next(new AppError('Server error while deleting route.', 500));
  }
};

/**
 * @desc    Search for routes based on origin, destination, date, etc.
 * @route   GET /api/v1/routes/search
 * @access  Public
 * @query   originId, destinationId, date, minSeats, vehicleType, direct (boolean)
 */
exports.searchRoutes = async (req, res, next) => {
  try {
    const { originId, destinationId, date, minSeats, vehicleType, direct } = req.query;
    let queryFilter = { status: 'active' }; // Only search active routes

    if (originId) queryFilter.origin = originId;
    if (destinationId) queryFilter.destination = destinationId;
    
    // Date-based filtering (complex, depends on how `schedule` is structured)
    // This is a simplified example. Real implementation would parse `date` and query `schedule.daysOfWeek`, `schedule.specificDates`, etc.
    if (date) {
      // Example: if schedule has `availableFrom` and `availableTo`
      // queryFilter['schedule.availableFrom'] = { $lte: new Date(date) };
      // queryFilter['schedule.availableTo'] = { $gte: new Date(date) };
      // Or match day of week if schedule.daysOfWeek is used
    }

    if (minSeats) queryFilter['vehicleRequirements.minCapacity'] = { $gte: parseInt(minSeats) };
    if (vehicleType) queryFilter['vehicleRequirements.type'] = vehicleType;
    if (direct === 'true') queryFilter.waypoints = { $size: 0 }; // No waypoints for direct routes

    const features = new APIFeatures(Route.find(queryFilter).populate('origin destination', 'name'), req.query)
      .sort()
      .limitFields()
      .paginate();

    const routes = await features.query;
    const totalRoutes = await Route.countDocuments(features.getQuery()._conditions);

    logger.info('Searched routes', { query: req.query, count: routes.length });
    res.status(200).json({
      success: true,
      count: routes.length,
      total: totalRoutes,
      pagination: features.pagination,
      data: routes
    });

  } catch (error) {
    logger.error('Error searching routes', { error: error.message, stack: error.stack, query: req.query });
    next(new AppError('Server error while searching routes.', 500));
  }
};

/**
 * @desc    Check route availability for a specific date/time
 * @route   GET /api/v1/routes/:id/availability
 * @access  Public
 * @query   dateTime (ISO string)
 */
exports.checkRouteAvailability = async (req, res, next) => {
  try {
    const route = await Route.findById(req.params.id).where({ status: 'active' });
    if (!route) {
      return next(new NotFoundError(`Route not found or is not active with ID: ${req.params.id}`, 404));
    }

    const requestedDateTimeString = req.query.dateTime; // Assuming dateTime is a query parameter
    if (!requestedDateTimeString) {
      return next(new ValidationError('dateTime query parameter is required.', 400));
    }

    const requestedDateTime = new Date(requestedDateTimeString);
    if (isNaN(requestedDateTime.getTime())) {
        return next(new ValidationError('Invalid dateTime format. Please use ISO 8601 format.', 400));
    }

    // Logic to check if the route operates on the requestedDateTime
    // This is highly dependent on how `route.schedule` is structured
    // For simplicity, let's assume a function `route.isOperatingAt(dateTime)` exists
    const { isAvailable, nextDeparture } = route.checkOperatingStatus(requestedDateTime);

    res.status(200).json({
      success: true,
      data: {
        routeId: route._id,
        isAvailable,
        requestedDateTime,
        nextDepartureTime: isAvailable ? null : nextDeparture, // Only show next if not available now
        // Potentially add info about available seats, vehicle types for that time, etc.
      }
    });

  } catch (error) {
    const dateTime = req.query.dateTime; // Define dateTime for logger
    logger.error('Error checking route availability', { routeId: req.params.id, dateTime, error: error.message, stack: error.stack });
    if (error.name === 'CastError') {
        return next(new NotFoundError(`Route not found with ID: ${req.params.id}`, 404));
    }
    next(new AppError('Server error while checking route availability.', 500));
  }
};

/**
 * @desc    Get pricing for a route (can include dynamic pricing logic)
 * @route   GET /api/v1/routes/:id/pricing
 * @access  Public
 * @query   passengers, date, promoCode
 */
exports.getRoutePricing = async (req, res, next) => {
    try {
        const route = await Route.findById(req.params.id).where({ status: 'active' });
        if (!route) {
            return next(new NotFoundError(`Route not found or is not active with ID: ${req.params.id}`, 404));
        }

        const { passengers = 1, date, promoCode } = req.query;
        const priceDetails = await route.calculatePrice(parseInt(passengers), date ? new Date(date) : new Date(), promoCode);

        logger.info('Retrieved route pricing', { routeId: req.params.id, query: req.query });
        res.status(200).json({
            success: true,
            data: priceDetails
        });

    } catch (error) {
        logger.error('Error getting route pricing', { routeId: req.params.id, error: error.message, stack: error.stack, query: req.query });
        if (error.name === 'CastError') {
            return next(new NotFoundError(`Route not found with ID: ${req.params.id}`, 404));
        }
        next(new AppError('Server error while calculating route price.', 500));
    }
};