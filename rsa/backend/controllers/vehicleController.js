const Vehicle = require('../models/Vehicle');

/**
 * @desc    Create a new vehicle
 * @route   POST /api/vehicles
 * @access  Private (Driver)
 */
exports.createVehicle = async (req, res) => {
  try {
    const {
      model,
      licensePlate,
      capacity,
      luggageCapacity,
      comfortLevel,
      type,
      features,
      imageUrl,
      pricePerMile
    } = req.body;

    // Check if vehicle with same license plate already exists
    const existingVehicle = await Vehicle.findOne({ licensePlate });
    if (existingVehicle) {
      return res.status(400).json({
        success: false,
        message: 'Vehicle with this license plate already exists'
      });
    }

    // Create new vehicle
    const vehicle = new Vehicle({
      model,
      licensePlate,
      capacity,
      luggageCapacity,
      comfortLevel,
      type,
      features,
      imageUrl,
      pricePerMile,
      driverId: req.user.id
    });

    await vehicle.save();

    res.status(201).json({
      success: true,
      data: vehicle
    });
  } catch (error) {
    console.error('Create vehicle error:', error.message);
    res.status(500).json({
      success: false,
      message: 'Server Error',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

/**
 * @desc    Get all vehicles
 * @route   GET /api/vehicles
 * @access  Public
 */
exports.getVehicles = async (req, res) => {
  try {
    const { type, capacity, isActive } = req.query;
    
    // Build query object
    const query = {};
    
    // Filter by type
    if (type) {
      query.type = type;
    }
    
    // Filter by minimum capacity
    if (capacity) {
      query.capacity = { $gte: parseInt(capacity) };
    }
    
    // Filter by active status
    if (isActive !== undefined) {
      query.isActive = isActive === 'true';
    }

    const vehicles = await Vehicle.find(query)
      .populate('driverId', 'firstName lastName rating')
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: vehicles.length,
      data: vehicles
    });
  } catch (error) {
    console.error('Get vehicles error:', error.message);
    res.status(500).json({
      success: false,
      message: 'Server Error',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

/**
 * @desc    Get vehicle by ID
 * @route   GET /api/vehicles/:id
 * @access  Public
 */
exports.getVehicleById = async (req, res) => {
  try {
    const vehicle = await Vehicle.findById(req.params.id)
      .populate('driverId', 'firstName lastName rating');

    if (!vehicle) {
      return res.status(404).json({
        success: false,
        message: 'Vehicle not found'
      });
    }

    res.status(200).json({
      success: true,
      data: vehicle
    });
  } catch (error) {
    console.error('Get vehicle by ID error:', error.message);
    res.status(500).json({
      success: false,
      message: 'Server Error',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

/**
 * @desc    Update vehicle
 * @route   PUT /api/vehicles/:id
 * @access  Private (Driver)
 */
exports.updateVehicle = async (req, res) => {
  try {
    let vehicle = await Vehicle.findById(req.params.id);

    if (!vehicle) {
      return res.status(404).json({
        success: false,
        message: 'Vehicle not found'
      });
    }

    // Check if vehicle belongs to driver
    if (vehicle.driverId.toString() !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to update this vehicle'
      });
    }

    // If updating license plate, check if it already exists
    if (req.body.licensePlate && req.body.licensePlate !== vehicle.licensePlate) {
      const existingVehicle = await Vehicle.findOne({ licensePlate: req.body.licensePlate });
      if (existingVehicle) {
        return res.status(400).json({
          success: false,
          message: 'Vehicle with this license plate already exists'
        });
      }
    }

    // Update vehicle
    vehicle = await Vehicle.findByIdAndUpdate(
      req.params.id,
      { $set: req.body },
      { new: true, runValidators: true }
    );

    res.status(200).json({
      success: true,
      data: vehicle
    });
  } catch (error) {
    console.error('Update vehicle error:', error.message);
    res.status(500).json({
      success: false,
      message: 'Server Error',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

/**
 * @desc    Delete vehicle
 * @route   DELETE /api/vehicles/:id
 * @access  Private (Driver)
 */
exports.deleteVehicle = async (req, res) => {
  try {
    const vehicle = await Vehicle.findById(req.params.id);

    if (!vehicle) {
      return res.status(404).json({
        success: false,
        message: 'Vehicle not found'
      });
    }

    // Check if vehicle belongs to driver
    if (vehicle.driverId.toString() !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to delete this vehicle'
      });
    }

    // TODO: Check if vehicle is used in any active trips
    // If yes, don't allow deletion

    await vehicle.remove();

    res.status(200).json({
      success: true,
      data: {}
    });
  } catch (error) {
    console.error('Delete vehicle error:', error.message);
    res.status(500).json({
      success: false,
      message: 'Server Error',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

/**
 * @desc    Get driver's vehicles
 * @route   GET /api/vehicles/driver
 * @access  Private (Driver)
 */
exports.getDriverVehicles = async (req, res) => {
  try {
    const vehicles = await Vehicle.find({ driverId: req.user.id })
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: vehicles.length,
      data: vehicles
    });
  } catch (error) {
    console.error('Get driver vehicles error:', error.message);
    res.status(500).json({
      success: false,
      message: 'Server Error',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};