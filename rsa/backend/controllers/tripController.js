const Trip = require('../models/Trip');
const Vehicle = require('../models/Vehicle');

/**
 * @desc    Create a new trip
 * @route   POST /api/trips
 * @access  Private (Driver)
 */
exports.createTrip = async (req, res) => {
  try {
    const {
      vehicleId,
      departureTime,
      arrivalTime,
      price,
      origin,
      destination,
      distance,
      duration,
      description
    } = req.body;

    // Check if vehicle exists and belongs to the driver
    const vehicle = await Vehicle.findOne({ 
      _id: vehicleId, 
      driverId: req.user.id 
    });

    if (!vehicle) {
      return res.status(404).json({
        success: false,
        message: 'Vehicle not found or does not belong to you'
      });
    }

    // Create new trip
    const trip = new Trip({
      vehicleId,
      driverId: req.user.id,
      departureTime,
      arrivalTime,
      availableSeats: vehicle.capacity,
      totalSeats: vehicle.capacity,
      price,
      origin,
      destination,
      distance,
      duration,
      description
    });

    await trip.save();

    res.status(201).json({
      success: true,
      data: trip
    });
  } catch (error) {
    console.error('Create trip error:', error.message);
    res.status(500).json({
      success: false,
      message: 'Server Error',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

/**
 * @desc    Get all trips (with filters)
 * @route   GET /api/trips
 * @access  Public
 */
exports.getTrips = async (req, res) => {
  try {
    const {
      origin,
      destination,
      date,
      minSeats,
      maxPrice
    } = req.query;

    // Build query object
    const query = {};

    // Filter by origin city
    if (origin) {
      query['origin.city'] = new RegExp(origin, 'i');
    }

    // Filter by destination city
    if (destination) {
      query['destination.city'] = new RegExp(destination, 'i');
    }

    // Filter by date (same day)
    if (date) {
      const searchDate = new Date(date);
      const nextDay = new Date(searchDate);
      nextDay.setDate(nextDay.getDate() + 1);

      query.departureTime = {
        $gte: searchDate,
        $lt: nextDay
      };
    }

    // Filter by available seats
    if (minSeats) {
      query.availableSeats = { $gte: parseInt(minSeats) };
    }

    // Filter by max price
    if (maxPrice) {
      query.price = { $lte: parseFloat(maxPrice) };
    }

    // Only show scheduled or in-progress trips
    query.status = { $in: ['scheduled', 'in-progress'] };

    // Execute query with pagination
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    const trips = await Trip.find(query)
      .populate('vehicleId', 'model imageUrl capacity comfortLevel')
      .populate('driverId', 'firstName lastName rating')
      .sort({ departureTime: 1 })
      .skip(skip)
      .limit(limit);

    const total = await Trip.countDocuments(query);

    res.status(200).json({
      success: true,
      count: trips.length,
      total,
      totalPages: Math.ceil(total / limit),
      currentPage: page,
      data: trips
    });
  } catch (error) {
    console.error('Get trips error:', error.message);
    res.status(500).json({
      success: false,
      message: 'Server Error',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

/**
 * @desc    Get trip by ID
 * @route   GET /api/trips/:id
 * @access  Public
 */
exports.getTripById = async (req, res) => {
  try {
    const trip = await Trip.findById(req.params.id)
      .populate('vehicleId', 'model imageUrl capacity luggageCapacity comfortLevel features')
      .populate('driverId', 'firstName lastName rating');

    if (!trip) {
      return res.status(404).json({
        success: false,
        message: 'Trip not found'
      });
    }

    res.status(200).json({
      success: true,
      data: trip
    });
  } catch (error) {
    console.error('Get trip by ID error:', error.message);
    res.status(500).json({
      success: false,
      message: 'Server Error',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

/**
 * @desc    Update trip
 * @route   PUT /api/trips/:id
 * @access  Private (Driver)
 */
exports.updateTrip = async (req, res) => {
  try {
    let trip = await Trip.findById(req.params.id);

    if (!trip) {
      return res.status(404).json({
        success: false,
        message: 'Trip not found'
      });
    }

    // Check if trip belongs to driver
    if (trip.driverId.toString() !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to update this trip'
      });
    }

    // Don't allow updates if trip is already completed or cancelled
    if (['completed', 'cancelled'].includes(trip.status)) {
      return res.status(400).json({
        success: false,
        message: `Cannot update a ${trip.status} trip`
      });
    }

    // Update trip
    trip = await Trip.findByIdAndUpdate(
      req.params.id,
      { $set: req.body },
      { new: true, runValidators: true }
    );

    res.status(200).json({
      success: true,
      data: trip
    });
  } catch (error) {
    console.error('Update trip error:', error.message);
    res.status(500).json({
      success: false,
      message: 'Server Error',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

/**
 * @desc    Cancel trip
 * @route   DELETE /api/trips/:id
 * @access  Private (Driver)
 */
exports.cancelTrip = async (req, res) => {
  try {
    const trip = await Trip.findById(req.params.id);

    if (!trip) {
      return res.status(404).json({
        success: false,
        message: 'Trip not found'
      });
    }

    // Check if trip belongs to driver
    if (trip.driverId.toString() !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to cancel this trip'
      });
    }

    // Don't allow cancellation if trip is already completed
    if (trip.status === 'completed') {
      return res.status(400).json({
        success: false,
        message: 'Cannot cancel a completed trip'
      });
    }

    // Update trip status to cancelled
    trip.status = 'cancelled';
    await trip.save();

    // TODO: Notify all passengers with bookings for this trip

    res.status(200).json({
      success: true,
      data: trip
    });
  } catch (error) {
    console.error('Cancel trip error:', error.message);
    res.status(500).json({
      success: false,
      message: 'Server Error',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

/**
 * @desc    Get driver's trips
 * @route   GET /api/trips/driver
 * @access  Private (Driver)
 */
exports.getDriverTrips = async (req, res) => {
  try {
    const { status } = req.query;
    
    const query = { driverId: req.user.id };
    
    // Filter by status if provided
    if (status && ['scheduled', 'in-progress', 'completed', 'cancelled'].includes(status)) {
      query.status = status;
    }

    const trips = await Trip.find(query)
      .populate('vehicleId', 'model imageUrl')
      .sort({ departureTime: 1 });

    res.status(200).json({
      success: true,
      count: trips.length,
      data: trips
    });
  } catch (error) {
    console.error('Get driver trips error:', error.message);
    res.status(500).json({
      success: false,
      message: 'Server Error',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

/**
 * @desc    Update trip status
 * @route   PUT /api/trips/:id/status
 * @access  Private (Driver)
 */
exports.updateTripStatus = async (req, res) => {
  try {
    const { status } = req.body;
    
    if (!status || !['scheduled', 'in-progress', 'completed', 'cancelled'].includes(status)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid status value'
      });
    }

    const trip = await Trip.findById(req.params.id);

    if (!trip) {
      return res.status(404).json({
        success: false,
        message: 'Trip not found'
      });
    }

    // Check if trip belongs to driver
    if (trip.driverId.toString() !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to update this trip'
      });
    }

    // Update trip status
    trip.status = status;
    await trip.save();

    res.status(200).json({
      success: true,
      data: trip
    });
  } catch (error) {
    console.error('Update trip status error:', error.message);
    res.status(500).json({
      success: false,
      message: 'Server Error',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};