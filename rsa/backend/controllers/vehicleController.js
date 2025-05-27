const Vehicle = require('../models/Vehicle');
const Driver = require('../models/Driver'); // If linking vehicles to drivers
const { AppError, ValidationError, NotFoundError } = require('../middleware/errorHandler'); // Removed AuthorizationError
const { createLogger } = require('../utils/logger');
const APIFeatures = require('../utils/apiFeatures');

const logger = createLogger('VehicleController');

/**
 * @desc    Register a new vehicle
 * @route   POST /api/v1/vehicles
 * @access  Private (Admin, or Owner/Partner if applicable)
 */
exports.createVehicle = async (req, res, next) => {
  try {
    // Assuming req.user.id is the owner or an admin creating the vehicle
    const ownerId = req.user.role === 'admin' ? (req.body.owner || req.user.id) : req.user.id;

    const vehicleData = { ...req.body, owner: ownerId, 'metadata.createdBy': req.user.id };

    const newVehicle = await Vehicle.create(vehicleData);

    logger.info('Vehicle registered successfully', { vehicleId: newVehicle._id, registration: newVehicle.registration.plateNumber, adminUserId: req.user.id });
    res.status(201).json({
      success: true,
      message: 'Vehicle registered successfully.',
      data: newVehicle
    });

  } catch (error) {
    logger.error('Error registering vehicle', { error: error.message, stack: error.stack, body: req.body, userId: req.user.id });
    if (error.name === 'ValidationError') {
      return next(new ValidationError(error.message));
    }
    next(new AppError('Server error while registering vehicle.', 500));
  }
};

/**
 * @desc    Get all vehicles
 * @route   GET /api/v1/vehicles
 * @access  Private (Admin, or filtered for Owners)
 */
exports.getAllVehicles = async (req, res, next) => {
  try {
    let queryFilter = { status: { $ne: 'deleted' } }; // Exclude soft-deleted vehicles by default

    // If not admin, user might only see their own vehicles (if 'owner' role exists and is tied to vehicles)
    // Example: if (req.user.role === 'owner') queryFilter.owner = req.user.id;
    // For now, assuming admin access or specific roles for viewing all non-deleted vehicles.

    const features = new APIFeatures(Vehicle.find(queryFilter).populate('owner', 'profile.firstName profile.lastName'), req.query)
      .filter()
      .sort()
      .limitFields()
      .paginate();

    const vehicles = await features.query;
    const totalVehicles = await Vehicle.countDocuments({ ...features.getQuery()._conditions, ...queryFilter });

    logger.info('Retrieved all vehicles', { count: vehicles.length, userId: req.user.id, query: req.query });
    res.status(200).json({
      success: true,
      count: vehicles.length,
      total: totalVehicles,
      pagination: features.pagination,
      data: vehicles
    });

  } catch (error) {
    logger.error('Error getting all vehicles', { error: error.message, stack: error.stack, userId: req.user.id });
    next(new AppError('Server error while retrieving vehicles.', 500));
  }
};

/**
 * @desc    Get a single vehicle by ID
 * @route   GET /api/v1/vehicles/:id
 * @access  Private (Admin, or Owner of the vehicle)
 */
exports.getVehicleById = async (req, res, next) => {
  try {
    const vehicle = await Vehicle.findById(req.params.id)
                                .where({ status: { $ne: 'deleted' } })
                                .populate('owner', 'profile.firstName profile.lastName email')
                                .populate('currentDriver', 'user.firstName user.lastName'); // Assuming currentDriver stores Driver's ID

    if (!vehicle) {
      return next(new NotFoundError(`Vehicle not found with ID: ${req.params.id}`, 404));
    }

    // Authorization: Admin or owner of the vehicle
    // if (req.user.role !== 'admin' && vehicle.owner._id.toString() !== req.user.id) {
    //   return next(new AuthorizationError('You are not authorized to view this vehicle.', 403));
    // }

    logger.info('Retrieved vehicle by ID', { vehicleId: req.params.id, userId: req.user.id });
    res.status(200).json({
      success: true,
      data: vehicle
    });

  } catch (error) {
    logger.error('Error getting vehicle by ID', { vehicleId: req.params.id, error: error.message, stack: error.stack, userId: req.user.id });
    if (error.name === 'CastError') {
        return next(new NotFoundError(`Vehicle not found with ID: ${req.params.id}`, 404));
    }
    next(new AppError('Server error while retrieving vehicle.', 500));
  }
};

/**
 * @desc    Update a vehicle by ID
 * @route   PUT /api/v1/vehicles/:id
 * @access  Private (Admin, or Owner of the vehicle)
 */
exports.updateVehicle = async (req, res, next) => {
  try {
    const vehicleId = req.params.id;
    let vehicle = await Vehicle.findById(vehicleId).where({ status: { $ne: 'deleted' } });

    if (!vehicle) {
      return next(new NotFoundError(`Vehicle not found or has been deleted with ID: ${vehicleId}`, 404));
    }

    // Authorization: Admin or owner of the vehicle
    // if (req.user.role !== 'admin' && vehicle.owner.toString() !== req.user.id) {
    //   return next(new AuthorizationError('You are not authorized to update this vehicle.', 403));
    // }

    const updateData = { ...req.body };
    updateData['metadata.updatedBy'] = req.user.id;
    updateData['metadata.lastUpdatedAt'] = Date.now();

    // Specific logic for updating certain fields, e.g., status, currentDriver
    if (updateData.currentDriver === '') updateData.currentDriver = null; // Unassign driver

    const updatedVehicle = await Vehicle.findByIdAndUpdate(vehicleId, updateData, {
      new: true,
      runValidators: true
    }).populate('owner currentDriver');

    logger.info('Vehicle updated successfully', { vehicleId, userId: req.user.id, changes: updateData });
    res.status(200).json({
      success: true,
      message: 'Vehicle updated successfully.',
      data: updatedVehicle
    });

  } catch (error) {
    logger.error('Error updating vehicle', { vehicleId: req.params.id, error: error.message, stack: error.stack, userId: req.user.id });
    if (error.name === 'ValidationError') {
      return next(new ValidationError(error.message));
    }
    if (error.name === 'CastError') {
        return next(new NotFoundError(`Vehicle not found with ID: ${req.params.id}`, 404));
    }
    next(new AppError('Server error while updating vehicle.', 500));
  }
};

/**
 * @desc    Delete a vehicle by ID (Soft Delete)
 * @route   DELETE /api/v1/vehicles/:id
 * @access  Private (Admin, or Owner of the vehicle)
 */
exports.deleteVehicle = async (req, res, next) => {
  try {
    const vehicleId = req.params.id;
    const vehicle = await Vehicle.findById(vehicleId);

    if (!vehicle || vehicle.status === 'deleted') {
      return next(new NotFoundError(`Vehicle not found or already deleted with ID: ${vehicleId}`, 404));
    }

    // Authorization: Admin or owner of the vehicle
    // if (req.user.role !== 'admin' && vehicle.owner.toString() !== req.user.id) {
    //   return next(new AuthorizationError('You are not authorized to delete this vehicle.', 403));
    // }

    // Check if vehicle is currently assigned to an active trip - prevent deletion or handle reassignment
    // const activeTrips = await Trip.find({ vehicle: vehicleId, status: { $in: ['scheduled', 'in_progress'] } });
    // if (activeTrips.length > 0) {
    //   return next(new AppError('Cannot delete vehicle. It is currently assigned to active trips.', 400));
    // }

    vehicle.status = 'deleted';
    vehicle.availability.isAvailable = false;
    vehicle.metadata.deletedBy = req.user.id;
    vehicle.metadata.deletedAt = Date.now();
    await vehicle.save();

    logger.info('Vehicle (soft) deleted successfully', { vehicleId, userId: req.user.id });
    res.status(200).json({ 
        success: true, 
        message: 'Vehicle deleted successfully.',
        data: { id: vehicleId, status: 'deleted' }
    });

  } catch (error) {
    logger.error('Error deleting vehicle', { vehicleId: req.params.id, error: error.message, stack: error.stack, userId: req.user.id });
    if (error.name === 'CastError') {
        return next(new NotFoundError(`Vehicle not found with ID: ${req.params.id}`, 404));
    }
    next(new AppError('Server error while deleting vehicle.', 500));
  }
};

/**
 * @desc    Assign a driver to a vehicle
 * @route   PUT /api/v1/vehicles/:id/assign-driver
 * @access  Private (Admin)
 */
exports.assignDriverToVehicle = async (req, res, next) => {
    try {
        const { vehicleId } = req.params; // Corrected to use vehicleId from params
        const { driverId } = req.body;

        const vehicle = await Vehicle.findById(vehicleId).where({ status: { $ne: 'deleted' } });
        if (!vehicle) return next(new NotFoundError(`Vehicle not found with ID: ${vehicleId}`, 404));

        const driver = await Driver.findById(driverId).where({ status: 'active' }); // Ensure driver is active
        if (!driver) return next(new NotFoundError(`Active driver not found with ID: ${driverId}`, 404));

        // Check if driver is already assigned to another active vehicle (optional, business logic)
        // const existingAssignment = await Vehicle.findOne({ currentDriver: driverId, _id: { $ne: vehicleId }, status: 'active' });
        // if (existingAssignment) return next(new AppError(`Driver ${driverId} is already assigned to vehicle ${existingAssignment.registration.plateNumber}.`, 400));

        vehicle.currentDriver = driverId;
        vehicle.availability.isAvailable = false; // Or based on driver's availability / vehicle status
        vehicle.metadata.updatedBy = req.user.id;
        vehicle.metadata.lastUpdatedAt = Date.now();
        await vehicle.save();

        // Update driver's assigned vehicle (if tracking this on Driver model)
        // driver.assignedVehicle = vehicleId;
        // await driver.save();

        logger.info('Driver assigned to vehicle', { vehicleId, driverId, adminUserId: req.user.id });
        res.status(200).json({
            success: true,
            message: `Driver ${driverId} assigned to vehicle ${vehicleId}.`,
            data: vehicle
        });
    } catch (error) {
        logger.error('Error assigning driver to vehicle', { vehicleId: req.params.id, driverId: req.body.driverId, error: error.message, stack: error.stack });
        next(new AppError('Server error while assigning driver.', 500));
    }
};

/**
 * @desc    Unassign a driver from a vehicle
 * @route   PUT /api/v1/vehicles/:id/unassign-driver
 * @access  Private (Admin)
 */
exports.unassignDriverFromVehicle = async (req, res, next) => {
    try {
        const { vehicleId } = req.params; // Corrected to use vehicleId from params
        const vehicle = await Vehicle.findById(vehicleId).where({ status: { $ne: 'deleted' } });
        if (!vehicle) return next(new NotFoundError(`Vehicle not found with ID: ${vehicleId}`, 404));

        if (!vehicle.currentDriver) {
            return next(new AppError('No driver is currently assigned to this vehicle.', 400));
        }
        
        // const driverId = vehicle.currentDriver;
        vehicle.currentDriver = null;
        vehicle.availability.isAvailable = true; // Or based on other factors
        vehicle.metadata.updatedBy = req.user.id;
        vehicle.metadata.lastUpdatedAt = Date.now();
        await vehicle.save();

        // Update driver's assigned vehicle to null (if tracking)
        // await Driver.findByIdAndUpdate(driverId, { assignedVehicle: null });

        logger.info('Driver unassigned from vehicle', { vehicleId, adminUserId: req.user.id });
        res.status(200).json({
            success: true,
            message: `Driver unassigned from vehicle ${vehicleId}.`,
            data: vehicle
        });
    } catch (error) {
        logger.error('Error unassigning driver from vehicle', { vehicleId: req.params.id, error: error.message, stack: error.stack });
        next(new AppError('Server error while unassigning driver.', 500));
    }
};

// TODO: Add endpoints for managing maintenance records, documents, etc.
// TODO: Add search/filter capabilities for vehicles (e.g., by type, capacity, availability, location)