const User = require('../models/User');
const Trip = require('../models/Trip');
const Booking = require('../models/Booking');
const Vehicle = require('../models/Vehicle');

/**
 * @desc    Get all users
 * @route   GET /api/admin/users
 * @access  Private (Admin)
 */
exports.getUsers = async (req, res) => {
  try {
    const { role, search } = req.query;
    
    // Build query object
    const query = {};
    
    // Filter by role
    if (role && ['passenger', 'driver', 'admin'].includes(role)) {
      query.role = role;
    }
    
    // Search by name or email
    if (search) {
      query.$or = [
        { firstName: new RegExp(search, 'i') },
        { lastName: new RegExp(search, 'i') },
        { email: new RegExp(search, 'i') }
      ];
    }

    // Execute query with pagination
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    const users = await User.find(query)
      .select('-password')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    const total = await User.countDocuments(query);

    res.status(200).json({
      success: true,
      count: users.length,
      total,
      totalPages: Math.ceil(total / limit),
      currentPage: page,
      data: users
    });
  } catch (error) {
    console.error('Get users error:', error.message);
    res.status(500).json({
      success: false,
      message: 'Server Error',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

/**
 * @desc    Get all trips with advanced filters
 * @route   GET /api/admin/trips
 * @access  Private (Admin)
 */
exports.getTrips = async (req, res) => {
  try {
    const {
      driverId,
      status,
      startDate,
      endDate,
      origin,
      destination
    } = req.query;
    
    // Build query object
    const query = {};
    
    // Filter by driver
    if (driverId) {
      query.driverId = driverId;
    }
    
    // Filter by status
    if (status && ['scheduled', 'in-progress', 'completed', 'cancelled'].includes(status)) {
      query.status = status;
    }
    
    // Filter by date range
    if (startDate || endDate) {
      query.departureTime = {};
      
      if (startDate) {
        query.departureTime.$gte = new Date(startDate);
      }
      
      if (endDate) {
        query.departureTime.$lte = new Date(endDate);
      }
    }
    
    // Filter by origin city
    if (origin) {
      query['origin.city'] = new RegExp(origin, 'i');
    }
    
    // Filter by destination city
    if (destination) {
      query['destination.city'] = new RegExp(destination, 'i');
    }

    // Execute query with pagination
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    const trips = await Trip.find(query)
      .populate('vehicleId', 'model licensePlate')
      .populate('driverId', 'firstName lastName email')
      .sort({ departureTime: -1 })
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
 * @desc    Get all bookings with advanced filters
 * @route   GET /api/admin/bookings
 * @access  Private (Admin)
 */
exports.getBookings = async (req, res) => {
  try {
    const {
      passengerId,
      tripId,
      status,
      paymentStatus,
      startDate,
      endDate
    } = req.query;
    
    // Build query object
    const query = {};
    
    // Filter by passenger
    if (passengerId) {
      query.passengerId = passengerId;
    }
    
    // Filter by trip
    if (tripId) {
      query.tripId = tripId;
    }
    
    // Filter by status
    if (status && ['pending', 'confirmed', 'cancelled', 'completed'].includes(status)) {
      query.status = status;
    }
    
    // Filter by payment status
    if (paymentStatus && ['pending', 'paid', 'refunded'].includes(paymentStatus)) {
      query.paymentStatus = paymentStatus;
    }
    
    // Filter by date range
    if (startDate || endDate) {
      query.createdAt = {};
      
      if (startDate) {
        query.createdAt.$gte = new Date(startDate);
      }
      
      if (endDate) {
        query.createdAt.$lte = new Date(endDate);
      }
    }

    // Execute query with pagination
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    const bookings = await Booking.find(query)
      .populate('passengerId', 'firstName lastName email')
      .populate({
        path: 'tripId',
        select: 'departureTime origin destination',
        populate: {
          path: 'vehicleId',
          select: 'model licensePlate'
        }
      })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    const total = await Booking.countDocuments(query);

    res.status(200).json({
      success: true,
      count: bookings.length,
      total,
      totalPages: Math.ceil(total / limit),
      currentPage: page,
      data: bookings
    });
  } catch (error) {
    console.error('Get bookings error:', error.message);
    res.status(500).json({
      success: false,
      message: 'Server Error',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

/**
 * @desc    Get system statistics
 * @route   GET /api/admin/stats
 * @access  Private (Admin)
 */
exports.getStats = async (req, res) => {
  try {
    // Get user counts by role
    const userCounts = await User.aggregate([
      {
        $group: {
          _id: '$role',
          count: { $sum: 1 }
        }
      }
    ]);
    
    // Format user counts
    const userStats = {};
    userCounts.forEach(item => {
      userStats[item._id] = item.count;
    });
    userStats.total = await User.countDocuments();
    
    // Get trip counts by status
    const tripCounts = await Trip.aggregate([
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 }
        }
      }
    ]);
    
    // Format trip counts
    const tripStats = {};
    tripCounts.forEach(item => {
      tripStats[item._id] = item.count;
    });
    tripStats.total = await Trip.countDocuments();
    
    // Get booking counts by status
    const bookingCounts = await Booking.aggregate([
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 }
        }
      }
    ]);
    
    // Format booking counts
    const bookingStats = {};
    bookingCounts.forEach(item => {
      bookingStats[item._id] = item.count;
    });
    bookingStats.total = await Booking.countDocuments();
    
    // Get vehicle counts
    const vehicleStats = {
      total: await Vehicle.countDocuments(),
      active: await Vehicle.countDocuments({ isActive: true }),
      inactive: await Vehicle.countDocuments({ isActive: false })
    };
    
    // Get revenue statistics
    const revenueStats = await Booking.aggregate([
      {
        $match: {
          status: { $in: ['confirmed', 'completed'] },
          paymentStatus: 'paid'
        }
      },
      {
        $group: {
          _id: null,
          totalRevenue: { $sum: '$totalPrice' },
          averageBookingValue: { $avg: '$totalPrice' },
          count: { $sum: 1 }
        }
      }
    ]);
    
    res.status(200).json({
      success: true,
      data: {
        users: userStats,
        trips: tripStats,
        bookings: bookingStats,
        vehicles: vehicleStats,
        revenue: revenueStats.length > 0 ? revenueStats[0] : { totalRevenue: 0, averageBookingValue: 0, count: 0 }
      }
    });
  } catch (error) {
    console.error('Get stats error:', error.message);
    res.status(500).json({
      success: false,
      message: 'Server Error',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};