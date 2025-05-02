const Booking = require('../models/Booking');
const Trip = require('../models/Trip');

/**
 * @desc    Create a new booking
 * @route   POST /api/bookings
 * @access  Private (Passenger)
 */
exports.createBooking = async (req, res) => {
  try {
    const {
      tripId,
      seatNumber,
      doorstepPickup,
      pickupAddress,
      extras,
      specialRequests,
      paymentMethod
    } = req.body;

    // Check if trip exists
    const trip = await Trip.findById(tripId);

    if (!trip) {
      return res.status(404).json({
        success: false,
        message: 'Trip not found'
      });
    }

    // Check if trip is available for booking
    if (trip.status !== 'scheduled') {
      return res.status(400).json({
        success: false,
        message: `Cannot book a ${trip.status} trip`
      });
    }

    // Check if there are available seats
    if (trip.availableSeats <= 0) {
      return res.status(400).json({
        success: false,
        message: 'No available seats for this trip'
      });
    }

    // Check if seat is already booked
    const existingBooking = await Booking.findOne({
      tripId,
      seatNumber,
      status: { $in: ['pending', 'confirmed'] }
    });

    if (existingBooking) {
      return res.status(400).json({
        success: false,
        message: 'This seat is already booked'
      });
    }

    // Calculate booking price
    const baseFare = trip.price;
    let doorstepFee = 0;
    
    if (doorstepPickup) {
      doorstepFee = 5; // Fixed fee for doorstep pickup
    }

    // Create new booking
    const booking = new Booking({
      passengerId: req.user.id,
      tripId,
      seatNumber,
      doorstepPickup,
      pickupAddress,
      extras: extras || [],
      baseFare,
      doorstepFee,
      specialRequests,
      paymentMethod
    });

    // Calculate total price
    booking.calculateTotalPrice();

    await booking.save();

    // Update available seats in trip
    trip.availableSeats -= 1;
    await trip.save();

    res.status(201).json({
      success: true,
      data: booking
    });
  } catch (error) {
    console.error('Create booking error:', error.message);
    res.status(500).json({
      success: false,
      message: 'Server Error',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

/**
 * @desc    Get all bookings for a user
 * @route   GET /api/bookings
 * @access  Private (Passenger)
 */
exports.getUserBookings = async (req, res) => {
  try {
    const { status } = req.query;
    
    const query = { passengerId: req.user.id };
    
    // Filter by status if provided
    if (status && ['pending', 'confirmed', 'cancelled', 'completed'].includes(status)) {
      query.status = status;
    }

    const bookings = await Booking.find(query)
      .populate({
        path: 'tripId',
        select: 'departureTime arrivalTime origin destination status',
        populate: {
          path: 'vehicleId',
          select: 'model imageUrl'
        }
      })
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: bookings.length,
      data: bookings
    });
  } catch (error) {
    console.error('Get user bookings error:', error.message);
    res.status(500).json({
      success: false,
      message: 'Server Error',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

/**
 * @desc    Get booking by ID
 * @route   GET /api/bookings/:id
 * @access  Private (Passenger/Driver)
 */
exports.getBookingById = async (req, res) => {
  try {
    const booking = await Booking.findById(req.params.id)
      .populate({
        path: 'tripId',
        select: 'departureTime arrivalTime origin destination status driverId',
        populate: [
          {
            path: 'vehicleId',
            select: 'model imageUrl capacity comfortLevel'
          },
          {
            path: 'driverId',
            select: 'firstName lastName'
          }
        ]
      })
      .populate('passengerId', 'firstName lastName email');

    if (!booking) {
      return res.status(404).json({
        success: false,
        message: 'Booking not found'
      });
    }

    // Check if user is authorized to view this booking
    const isPassenger = booking.passengerId._id.toString() === req.user.id;
    const isDriver = booking.tripId.driverId._id.toString() === req.user.id;
    const isAdmin = req.user.role === 'admin';

    if (!isPassenger && !isDriver && !isAdmin) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to view this booking'
      });
    }

    res.status(200).json({
      success: true,
      data: booking
    });
  } catch (error) {
    console.error('Get booking by ID error:', error.message);
    res.status(500).json({
      success: false,
      message: 'Server Error',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

/**
 * @desc    Update booking
 * @route   PUT /api/bookings/:id
 * @access  Private (Passenger)
 */
exports.updateBooking = async (req, res) => {
  try {
    let booking = await Booking.findById(req.params.id);

    if (!booking) {
      return res.status(404).json({
        success: false,
        message: 'Booking not found'
      });
    }

    // Check if booking belongs to user
    if (booking.passengerId.toString() !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to update this booking'
      });
    }

    // Don't allow updates if booking is already completed or cancelled
    if (['completed', 'cancelled'].includes(booking.status)) {
      return res.status(400).json({
        success: false,
        message: `Cannot update a ${booking.status} booking`
      });
    }

    // Only allow updating certain fields
    const allowedUpdates = ['doorstepPickup', 'pickupAddress', 'extras', 'specialRequests'];
    const updates = {};

    Object.keys(req.body).forEach(key => {
      if (allowedUpdates.includes(key)) {
        updates[key] = req.body[key];
      }
    });

    // Update booking
    booking = await Booking.findByIdAndUpdate(
      req.params.id,
      { $set: updates },
      { new: true, runValidators: true }
    );

    // Recalculate total price if needed
    if (updates.doorstepPickup !== undefined || updates.extras) {
      booking.calculateTotalPrice();
      await booking.save();
    }

    res.status(200).json({
      success: true,
      data: booking
    });
  } catch (error) {
    console.error('Update booking error:', error.message);
    res.status(500).json({
      success: false,
      message: 'Server Error',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

/**
 * @desc    Cancel booking
 * @route   DELETE /api/bookings/:id
 * @access  Private (Passenger)
 */
exports.cancelBooking = async (req, res) => {
  try {
    const booking = await Booking.findById(req.params.id);

    if (!booking) {
      return res.status(404).json({
        success: false,
        message: 'Booking not found'
      });
    }

    // Check if booking belongs to user
    if (booking.passengerId.toString() !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to cancel this booking'
      });
    }

    // Don't allow cancellation if booking is already completed
    if (booking.status === 'completed') {
      return res.status(400).json({
        success: false,
        message: 'Cannot cancel a completed booking'
      });
    }

    // Update booking status to cancelled
    booking.status = 'cancelled';
    await booking.save();

    // Increase available seats in trip
    const trip = await Trip.findById(booking.tripId);
    if (trip && trip.status !== 'completed') {
      trip.availableSeats += 1;
      await trip.save();
    }

    res.status(200).json({
      success: true,
      data: booking
    });
  } catch (error) {
    console.error('Cancel booking error:', error.message);
    res.status(500).json({
      success: false,
      message: 'Server Error',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

/**
 * @desc    Get all bookings for a trip
 * @route   GET /api/bookings/trip/:tripId
 * @access  Private (Driver)
 */
exports.getTripBookings = async (req, res) => {
  try {
    const { tripId } = req.params;
    
    // Check if trip exists and belongs to driver
    const trip = await Trip.findById(tripId);
    
    if (!trip) {
      return res.status(404).json({
        success: false,
        message: 'Trip not found'
      });
    }
    
    if (trip.driverId.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to view bookings for this trip'
      });
    }

    const bookings = await Booking.find({ tripId })
      .populate('passengerId', 'firstName lastName email')
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: bookings.length,
      data: bookings
    });
  } catch (error) {
    console.error('Get trip bookings error:', error.message);
    res.status(500).json({
      success: false,
      message: 'Server Error',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

/**
 * @desc    Check in passenger
 * @route   PUT /api/bookings/:id/checkin
 * @access  Private (Driver)
 */
exports.checkInPassenger = async (req, res) => {
  try {
    const booking = await Booking.findById(req.params.id)
      .populate('tripId');

    if (!booking) {
      return res.status(404).json({
        success: false,
        message: 'Booking not found'
      });
    }

    // Check if trip belongs to driver
    if (booking.tripId.driverId.toString() !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to check in passengers for this trip'
      });
    }

    // Don't allow check-in if booking is not confirmed
    if (booking.status !== 'confirmed') {
      return res.status(400).json({
        success: false,
        message: `Cannot check in a ${booking.status} booking`
      });
    }

    // Update booking
    booking.checkedIn = true;
    booking.checkedInAt = new Date();
    await booking.save();

    res.status(200).json({
      success: true,
      data: booking
    });
  } catch (error) {
    console.error('Check in passenger error:', error.message);
    res.status(500).json({
      success: false,
      message: 'Server Error',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};