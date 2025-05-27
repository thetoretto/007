const Driver = require('../models/Driver');
const User = require('../models/User'); // For linking Driver profile to a User account
const Vehicle = require('../models/Vehicle'); // For managing vehicle assignments
const { AppError, ValidationError, NotFoundError, AuthorizationError } = require('../middleware/errorHandler');
const { createLogger } = require('../utils/logger');
const APIFeatures = require('../utils/apiFeatures');

const logger = createLogger('DriverController');

/**
 * @desc    Register a new driver (creates/links to a User account)
 * @route   POST /api/v1/drivers
 * @access  Private (Admin)
 */
exports.createDriver = async (req, res, next) => {
  try {
    const {
        userId, // Optional: ID of an existing user to be upgraded to driver
        email, password, // Required if creating a new user for the driver
        personalDetails, licenseDetails, bankDetails, emergencyContacts, availability, vehiclePreferences
    } = req.body;

    let userForDriver;

    if (userId) {
        userForDriver = await User.findById(userId);
        if (!userForDriver) return next(new NotFoundError(`User not found with ID: ${userId} to associate with driver.`, 404));
        // Check if user already has a driver profile
        const existingDriverProfile = await Driver.findOne({ user: userId });
        if (existingDriverProfile) return next(new AppError(`User ${userId} already has an associated driver profile (ID: ${existingDriverProfile._id}).`, 400));
    } else {
        if (!email || !password) {
            return next(new ValidationError('Email and password are required to create a new user for the driver.', 400));
        }
        // Create a new user with role 'driver'
        userForDriver = await User.create({
            email,
            password, // Password will be hashed by User model's pre-save hook
            role: 'driver',
            profile: {
                firstName: personalDetails?.firstName,
                lastName: personalDetails?.lastName,
                phone: personalDetails?.phone
            },
            // Add other necessary user fields, e.g. isVerified if auto-verified
            'emailVerification.isVerified': true, // Or send verification email
            'emailVerification.verifiedAt': Date.now()
        });
    }

    // Update user role to 'driver' if not already set (e.g., if an existing user is upgraded)
    if (userForDriver.role !== 'driver') {
        userForDriver.role = 'driver';
        await userForDriver.save({ validateBeforeSave: false }); // Avoid re-hashing password if not changed
    }

    const newDriver = await Driver.create({
      user: userForDriver._id,
      personalDetails,
      licenseDetails,
      bankDetails,
      emergencyContacts,
      availability: availability || { status: 'inactive', schedule: [] },
      vehiclePreferences,
      status: 'pending_approval', // Initial status, admin to approve
      metadata: { createdBy: req.user.id }
    });

    logger.info('Driver profile created successfully', { driverId: newDriver._id, userId: userForDriver._id, adminUserId: req.user.id });
    res.status(201).json({
      success: true,
      message: 'Driver profile created successfully. Pending approval.',
      data: newDriver
    });

  } catch (error) {
    logger.error('Error creating driver profile', { error: error.message, stack: error.stack, body: req.body, adminUserId: req.user.id });
    if (error.name === 'ValidationError') {
      return next(new ValidationError(error.message));
    }
    if (error.code === 11000) { // Duplicate key error (e.g. license number)
        return next(new AppError(`A driver with similar unique details (e.g., license number) already exists. ${JSON.stringify(error.keyValue)}`, 400));
    }
    next(new AppError('Server error while creating driver profile.', 500));
  }
};

/**
 * @desc    Get all drivers
 * @route   GET /api/v1/drivers
 * @access  Private (Admin)
 */
exports.getAllDrivers = async (req, res, next) => {
  try {
    const features = new APIFeatures(Driver.find({ 'metadata.isDeleted': { $ne: true } })
        .populate('user', 'profile.firstName profile.lastName email profile.avatar status')
        .populate('assignedVehicle', 'registration.plateNumber make model'), 
        req.query)
      .filter()
      .sort()
      .limitFields()
      .paginate();

    const drivers = await features.query;
    const totalDrivers = await Driver.countDocuments({ ...features.getQuery()._conditions, 'metadata.isDeleted': { $ne: true } });

    logger.info('Retrieved all drivers', { count: drivers.length, adminUserId: req.user.id, query: req.query });
    res.status(200).json({
      success: true,
      count: drivers.length,
      total: totalDrivers,
      pagination: features.pagination,
      data: drivers
    });

  } catch (error) {
    logger.error('Error getting all drivers', { error: error.message, stack: error.stack, adminUserId: req.user.id });
    next(new AppError('Server error while retrieving drivers.', 500));
  }
};

/**
 * @desc    Get a single driver by ID
 * @route   GET /api/v1/drivers/:id
 * @access  Private (Admin, or the Driver themselves)
 */
exports.getDriverById = async (req, res, next) => {
  try {
    const driver = await Driver.findById(req.params.id)
        .where({ 'metadata.isDeleted': { $ne: true } })
        .populate('user', 'profile.firstName profile.lastName email profile.phone profile.avatar security.lastLoginAt')
        .populate('assignedVehicle', 'registration.plateNumber make model status');

    if (!driver) {
      return next(new NotFoundError(`Driver not found with ID: ${req.params.id}`, 404));
    }

    // Authorization: Admin or the driver themselves (checking against driver.user._id)
    if (req.user.role !== 'admin' && driver.user._id.toString() !== req.user.id) {
      return next(new AuthorizationError('You are not authorized to view this driver profile.', 403));
    }

    logger.info('Retrieved driver by ID', { driverId: req.params.id, userId: req.user.id });
    res.status(200).json({
      success: true,
      data: driver
    });

  } catch (error) {
    logger.error('Error getting driver by ID', { driverId: req.params.id, error: error.message, stack: error.stack, userId: req.user.id });
    if (error.name === 'CastError') {
        return next(new NotFoundError(`Driver not found with ID: ${req.params.id}`, 404));
    }
    next(new AppError('Server error while retrieving driver profile.', 500));
  }
};

/**
 * @desc    Update a driver's profile by ID
 * @route   PUT /api/v1/drivers/:id
 * @access  Private (Admin, or the Driver themselves for certain fields)
 */
exports.updateDriver = async (req, res, next) => {
  try {
    const driverId = req.params.id;
    let driver = await Driver.findById(driverId).where({ 'metadata.isDeleted': { $ne: true } });

    if (!driver) {
      return next(new NotFoundError(`Driver not found with ID: ${driverId}`, 404));
    }

    // Authorization: Admin can update anything. Driver can update specific fields.
    const isAdmin = req.user.role === 'admin';
    const isSelf = driver.user.toString() === req.user.id;

    if (!isAdmin && !isSelf) {
      return next(new AuthorizationError('You are not authorized to update this driver profile.', 403));
    }

    const updateData = { ...req.body };
    
    // Fields a driver can update themselves (example)
    const selfUpdatableFields = ['personalDetails.phone', 'personalDetails.address', 'emergencyContacts', 'availability', 'vehiclePreferences', 'bankDetails.accountHolderName']; // Be restrictive
    // Fields only admin can update (example)
    const adminOnlyFields = ['status', 'performanceMetrics.rating', 'licenseDetails.status'];

    if (!isAdmin) {
        for (const key in updateData) {
            if (!selfUpdatableFields.some(field => key.startsWith(field))) {
                // If trying to update a nested field, check its parent
                const parentKey = key.split('.')[0];
                if (!selfUpdatableFields.includes(parentKey)) {
                    delete updateData[key]; // Prevent unauthorized field updates
                }
            }
        }
    } else {
        // Admin can update adminOnlyFields
    }

    // Prevent direct update of 'user' field or critical User model fields via this endpoint
    delete updateData.user;
    if (updateData.personalDetails && (updateData.personalDetails.firstName || updateData.personalDetails.lastName || updateData.personalDetails.email)){
        // Update corresponding User model if these are changed
        const userToUpdate = await User.findById(driver.user);
        if(userToUpdate){
            if(updateData.personalDetails.firstName) userToUpdate.profile.firstName = updateData.personalDetails.firstName;
            if(updateData.personalDetails.lastName) userToUpdate.profile.lastName = updateData.personalDetails.lastName;
            // Email change should go through a verification process, not direct update here.
            await userToUpdate.save({ validateBeforeSave: false });
        }
    }

    updateData['metadata.updatedBy'] = req.user.id;
    updateData['metadata.lastUpdatedAt'] = Date.now();

    const updatedDriver = await Driver.findByIdAndUpdate(driverId, { $set: updateData }, {
      new: true,
      runValidators: true
    }).populate('user assignedVehicle');

    logger.info('Driver profile updated successfully', { driverId, userId: req.user.id, changes: updateData });
    res.status(200).json({
      success: true,
      message: 'Driver profile updated successfully.',
      data: updatedDriver
    });

  } catch (error) {
    logger.error('Error updating driver profile', { driverId: req.params.id, error: error.message, stack: error.stack, userId: req.user.id });
    if (error.name === 'ValidationError') {
      return next(new ValidationError(error.message));
    }
    if (error.name === 'CastError') {
        return next(new NotFoundError(`Driver not found with ID: ${req.params.id}`, 404));
    }
    if (error.code === 11000) {
        return next(new AppError(`Update failed due to duplicate unique field. ${JSON.stringify(error.keyValue)}`, 400));
    }
    next(new AppError('Server error while updating driver profile.', 500));
  }
};

/**
 * @desc    Delete a driver by ID (Soft Delete)
 * @route   DELETE /api/v1/drivers/:id
 * @access  Private (Admin)
 */
exports.deleteDriver = async (req, res, next) => {
  try {
    const driverId = req.params.id;
    const driver = await Driver.findById(driverId);

    if (!driver || driver.metadata.isDeleted) {
      return next(new NotFoundError(`Driver not found or already deleted with ID: ${driverId}`, 404));
    }

    // Check if driver is assigned to active trips or vehicles - handle unassignment or prevent deletion
    // const activeAssignments = await Trip.find({ driver: driverId, status: { $in: ['scheduled', 'in_progress'] } });
    // if (activeAssignments.length > 0) {
    //   return next(new AppError('Cannot delete driver. Driver is currently assigned to active trips.', 400));
    // }
    // await Vehicle.updateMany({ currentDriver: driverId }, { $set: { currentDriver: null, 'availability.isAvailable': true } });

    driver.status = 'archived'; // Or 'deleted'
    driver.availability.status = 'inactive';
    driver.metadata.isDeleted = true;
    driver.metadata.deletedBy = req.user.id;
    driver.metadata.deletedAt = Date.now();
    await driver.save();

    // Optionally, deactivate the associated User account or change its role
    // const userAccount = await User.findById(driver.user);
    // if (userAccount) {
    //     userAccount.status = 'inactive'; // Or some other status
    //     await userAccount.save();
    // }

    logger.info('Driver (soft) deleted successfully', { driverId, adminUserId: req.user.id });
    res.status(200).json({ 
        success: true, 
        message: 'Driver profile deleted successfully.',
        data: { id: driverId, status: 'deleted' }
    });

  } catch (error) {
    logger.error('Error deleting driver', { driverId: req.params.id, error: error.message, stack: error.stack, adminUserId: req.user.id });
    if (error.name === 'CastError') {
        return next(new NotFoundError(`Driver not found with ID: ${req.params.id}`, 404));
    }
    next(new AppError('Server error while deleting driver profile.', 500));
  }
};

/**
 * @desc    Admin: Approve a pending driver registration
 * @route   PUT /api/v1/drivers/:id/approve
 * @access  Private (Admin)
 */
exports.approveDriver = async (req, res, next) => {
    try {
        const driver = await Driver.findById(req.params.id);
        if (!driver || driver.metadata.isDeleted) {
            return next(new NotFoundError(`Driver not found with ID: ${req.params.id}`, 404));
        }
        if (driver.status !== 'pending_approval') {
            return next(new AppError(`Driver is not pending approval (current status: ${driver.status}).`, 400));
        }

        driver.status = 'active';
        driver.availability.status = 'available'; // Or based on their provided schedule
        driver.metadata.approvedBy = req.user.id;
        driver.metadata.approvedAt = Date.now();
        driver.metadata.updatedBy = req.user.id;
        driver.metadata.lastUpdatedAt = Date.now();
        await driver.save();

        // TODO: Send notification to driver about approval

        logger.info('Driver approved successfully', { driverId: driver._id, adminUserId: req.user.id });
        res.status(200).json({
            success: true,
            message: 'Driver approved successfully.',
            data: driver
        });
    } catch (error) {
        logger.error('Error approving driver', { driverId: req.params.id, error: error.message, stack: error.stack, adminUserId: req.user.id });
        next(new AppError('Server error while approving driver.', 500));
    }
};

/**
 * @desc    Admin: Suspend a driver
 * @route   PUT /api/v1/drivers/:id/suspend
 * @access  Private (Admin)
 */
exports.suspendDriver = async (req, res, next) => {
    try {
        const { reason } = req.body;
        if (!reason) return next(new ValidationError('Suspension reason is required.', 400));

        const driver = await Driver.findById(req.params.id);
        if (!driver || driver.metadata.isDeleted) {
            return next(new NotFoundError(`Driver not found with ID: ${req.params.id}`, 404));
        }
        if (driver.status === 'suspended') {
            return next(new AppError('Driver is already suspended.', 400));
        }

        driver.status = 'suspended';
        driver.availability.status = 'inactive';
        driver.metadata.suspensionReason = reason;
        driver.metadata.suspendedBy = req.user.id;
        driver.metadata.suspendedAt = Date.now();
        driver.metadata.updatedBy = req.user.id;
        driver.metadata.lastUpdatedAt = Date.now();
        await driver.save();

        // TODO: Unassign from active trips/vehicles, notify driver

        logger.info('Driver suspended successfully', { driverId: driver._id, reason, adminUserId: req.user.id });
        res.status(200).json({
            success: true,
            message: 'Driver suspended successfully.',
            data: driver
        });
    } catch (error) {
        logger.error('Error suspending driver', { driverId: req.params.id, error: error.message, stack: error.stack, adminUserId: req.user.id });
        next(new AppError('Server error while suspending driver.', 500));
    }
};

// TODO: Endpoints for managing driver documents, performance reviews, assigned trips history etc.