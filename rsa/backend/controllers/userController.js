const User = require('../models/User');
const Driver = require('../models/Driver'); // To populate driver specific details if user is a driver
const Booking = require('../models/Booking'); // To get user's booking history
const { AppError, ValidationError, NotFoundError, AuthorizationError, AuthenticationError } = require('../middleware/errorHandler');
const { createLogger } = require('../utils/logger');
const APIFeatures = require('../utils/apiFeatures');
// const crypto = require('crypto'); // Removed unused crypto import
const { sendEmail } = require('../utils/email'); // For email change verification

const logger = createLogger('UserController');

/**
 * @desc    Get current logged-in user's profile
 * @route   GET /api/v1/users/me
 * @access  Private
 */
exports.getMe = async (req, res, next) => {
  try {
    const user = await User.findById(req.user.id)
        .select('-password -passwordChangedAt -passwordResetToken -passwordResetExpires -loginAttempts -lockUntil')
        .populate('preferences.communicationPreferences'); // Example populate

    if (!user) {
      return next(new NotFoundError('User not found. This should not happen if token is valid.', 404));
    }

    let additionalData = {};
    if (user.role === 'driver') {
        const driverProfile = await Driver.findOne({ user: user._id }).select('-bankDetails.accountNumber'); // Exclude sensitive data
        additionalData.driverProfile = driverProfile;
    }

    logger.info('Retrieved current user profile', { userId: req.user.id });
    res.status(200).json({
      success: true,
      data: { ...user.toObject(), ...additionalData }
    });
  } catch (error) {
    logger.error('Error getting current user profile', { userId: req.user.id, error: error.message, stack: error.stack });
    next(new AppError('Server error while retrieving your profile.', 500));
  }
};

/**
 * @desc    Update current logged-in user's profile details
 * @route   PUT /api/v1/users/me/update
 * @access  Private
 */
exports.updateMe = async (req, res, next) => {
  try {
    const { firstName, lastName, phone, dateOfBirth, avatar, address, preferences } = req.body;

    // Fields that users are allowed to update directly
    const allowedUpdates = {};
    if (firstName) allowedUpdates['profile.firstName'] = firstName;
    if (lastName) allowedUpdates['profile.lastName'] = lastName;
    if (phone) allowedUpdates['profile.phone'] = phone;
    if (dateOfBirth) allowedUpdates['profile.dateOfBirth'] = dateOfBirth;
    if (avatar) allowedUpdates['profile.avatar'] = avatar; // Assuming avatar is a URL or identifier
    if (address) allowedUpdates['profile.address'] = address; // address should be an object { street, city, ...}
    if (preferences) allowedUpdates.preferences = preferences; // preferences should be an object

    if (Object.keys(allowedUpdates).length === 0) {
      return next(new ValidationError('No valid fields provided for update.', 400));
    }

    allowedUpdates['metadata.lastUpdatedAt'] = Date.now();

    const updatedUser = await User.findByIdAndUpdate(req.user.id, { $set: allowedUpdates }, {
      new: true,
      runValidators: true
    }).select('-password -passwordChangedAt -passwordResetToken -passwordResetExpires -loginAttempts -lockUntil');

    logger.info('User profile updated successfully', { userId: req.user.id, changes: allowedUpdates });
    res.status(200).json({
      success: true,
      message: 'Profile updated successfully.',
      data: updatedUser
    });
  } catch (error) {
    logger.error('Error updating user profile', { userId: req.user.id, error: error.message, stack: error.stack, body: req.body });
    if (error.name === 'ValidationError') {
      return next(new ValidationError(error.message));
    }
    next(new AppError('Server error while updating your profile.', 500));
  }
};

/**
 * @desc    User initiates an email change request
 * @route   POST /api/v1/users/me/change-email
 * @access  Private
 */
exports.requestEmailChange = async (req, res, next) => {
    try {
        const { newEmail, password } = req.body;
        if (!newEmail || !password) {
            return next(new ValidationError('New email and current password are required.', 400));
        }

        const user = await User.findById(req.user.id).select('+password');
        if (!user || !(await user.matchPassword(password))) {
            return next(new AuthenticationError('Incorrect password.', 401));
        }

        if (user.email === newEmail) {
            return next(new AppError('New email cannot be the same as your current email.', 400));
        }

        const existingUserWithNewEmail = await User.findOne({ email: newEmail });
        if (existingUserWithNewEmail) {
            return next(new AppError('This email address is already in use.', 400));
        }

        const emailChangeToken = user.generateEmailChangeToken(newEmail);
        await user.save({ validateBeforeSave: false });

        // Send email with verification link/token
        const verificationUrl = `${req.protocol}://${req.get('host')}/api/v1/auth/verify-email-change/${emailChangeToken}`; // Or frontend URL
        const message = `You are receiving this email because you (or someone else) has requested to change the email for your account.\nPlease click the following link, or paste it into your browser to complete the process within one hour of receiving it:\n\n${verificationUrl}\n\nIf you did not request this, please ignore this email.`;

        await sendEmail({
            to: newEmail, // Send to new email for verification
            subject: 'Verify Your New Email Address',
            text: message,
            html: `<p>${message.replace(/\n/g, '<br>')}</p>` // Basic HTML version
        });

        logger.info('Email change requested, verification email sent', { userId: user._id, newEmail });
        res.status(200).json({ success: true, message: `A verification email has been sent to ${newEmail}. Please verify to update your email address.` });

    } catch (error) {
        logger.error('Error requesting email change', { userId: req.user.id, error: error.message, stack: error.stack });
        next(new AppError('Server error while requesting email change.', 500));
    }
};


/**
 * @desc    User updates their password
 * @route   PUT /api/v1/users/me/update-password
 * @access  Private
 */
exports.updatePassword = async (req, res, next) => {
  try {
    const { currentPassword, newPassword, confirmNewPassword } = req.body;

    if (!currentPassword || !newPassword || !confirmNewPassword) {
      return next(new ValidationError('Current password, new password, and confirmation are required.', 400));
    }
    if (newPassword !== confirmNewPassword) {
      return next(new ValidationError('New password and confirmation do not match.', 400));
    }

    const user = await User.findById(req.user.id).select('+password');
    if (!user || !(await user.matchPassword(currentPassword))) {
      return next(new AuthenticationError('Incorrect current password.', 401));
    }

    user.password = newPassword;
    user.passwordChangedAt = Date.now();
    await user.save();

    // Optionally, log out from other devices by invalidating other tokens (if using a more complex session management)

    logger.info('User password updated successfully', { userId: req.user.id });
    res.status(200).json({ success: true, message: 'Password updated successfully.' });

  } catch (error) {
    logger.error('Error updating password', { userId: req.user.id, error: error.message, stack: error.stack });
    next(new AppError('Server error while updating password.', 500));
  }
};

/**
 * @desc    User deactivates their own account (Soft Delete)
 * @route   DELETE /api/v1/users/me/deactivate
 * @access  Private
 */
exports.deactivateMe = async (req, res, next) => {
  try {
    const user = await User.findById(req.user.id);
    if (!user) return next(new NotFoundError('User not found.', 404));

    // Perform soft delete: mark as inactive, clear sensitive data, etc.
    user.status = 'inactive';
    user.email = `${user.email}_deactivated_${Date.now()}`; // Anonymize email to allow re-registration
    user.password = undefined; // Remove password
    user.passwordResetToken = undefined;
    user.passwordResetExpires = undefined;
    user.emailVerificationToken = undefined;
    user.emailVerificationExpires = undefined;
    user.refreshToken = undefined; 
    user.loginAttempts = 0;
    user.lockUntil = undefined;
    user.metadata.isDeleted = true;
    user.metadata.deletedAt = Date.now();
    user.metadata.deletedBy = req.user.id; // Self-deactivation

    await user.save({ validateBeforeSave: false });

    // TODO: Log out the user by clearing cookies/session
    // res.cookie('jwt', 'loggedout', { expires: new Date(Date.now() + 10 * 1000), httpOnly: true });

    logger.info('User account deactivated successfully', { userId: req.user.id });
    res.status(200).json({ success: true, message: 'Your account has been deactivated.' });
  } catch (error) {
    logger.error('Error deactivating user account', { userId: req.user.id, error: error.message, stack: error.stack });
    next(new AppError('Server error while deactivating your account.', 500));
  }
};

// --- Admin User Management ---

/**
 * @desc    Admin: Get all users
 * @route   GET /api/v1/users
 * @access  Private (Admin)
 */
exports.getAllUsers = async (req, res, next) => {
  try {
    const features = new APIFeatures(User.find().select('-password'), req.query)
      .filter()
      .sort()
      .limitFields()
      .paginate();

    const users = await features.query;
    const totalUsers = await User.countDocuments(features.getQuery()._conditions);

    logger.info('Admin retrieved all users', { count: users.length, adminUserId: req.user.id, query: req.query });
    res.status(200).json({
      success: true,
      count: users.length,
      total: totalUsers,
      pagination: features.pagination,
      data: users
    });
  } catch (error) {
    logger.error('Admin: Error getting all users', { adminUserId: req.user.id, error: error.message, stack: error.stack });
    next(new AppError('Server error while retrieving users.', 500));
  }
};

/**
 * @desc    Admin: Get a single user by ID
 * @route   GET /api/v1/users/:id
 * @access  Private (Admin)
 */
exports.getUserById = async (req, res, next) => {
  try {
    const user = await User.findById(req.params.id)
        .select('-password')
        .populate({ path: 'driverProfile', model: 'Driver', select: '-bankDetails.accountNumber' }); // Example

    if (!user) {
      return next(new NotFoundError(`User not found with ID: ${req.params.id}`, 404));
    }

    logger.info('Admin retrieved user by ID', { targetUserId: req.params.id, adminUserId: req.user.id });
    res.status(200).json({
      success: true,
      data: user
    });
  } catch (error) {
    logger.error('Admin: Error getting user by ID', { targetUserId: req.params.id, adminUserId: req.user.id, error: error.message, stack: error.stack });
    if (error.name === 'CastError') {
        return next(new NotFoundError(`User not found with ID: ${req.params.id}`, 404));
    }
    next(new AppError('Server error while retrieving user.', 500));
  }
};

/**
 * @desc    Admin: Update a user's details (role, status, etc.)
 * @route   PUT /api/v1/users/:id
 * @access  Private (Admin)
 */
exports.updateUser = async (req, res, next) => {
  try {
    const { role, status, isVerified, profile } = req.body; // Admin can update these
    const updateData = {};

    if (role) updateData.role = role;
    if (status) updateData.status = status;
    if (typeof isVerified === 'boolean') {
        updateData['emailVerification.isVerified'] = isVerified;
        if(isVerified) updateData['emailVerification.verifiedAt'] = Date.now();
        else {
            updateData['emailVerification.verifiedAt'] = null;
            updateData['emailVerification.verificationToken'] = null; // Clear token if un-verifying
        }
    }
    if (profile && typeof profile === 'object') {
        // Carefully merge profile updates to avoid overwriting entire object unintentionally
        Object.keys(profile).forEach(key => {
            updateData[`profile.${key}`] = profile[key];
        });
    }

    if (Object.keys(updateData).length === 0) {
      return next(new ValidationError('No valid fields provided for update.', 400));
    }

    updateData['metadata.updatedBy'] = req.user.id;
    updateData['metadata.lastUpdatedAt'] = Date.now();

    const updatedUser = await User.findByIdAndUpdate(req.params.id, { $set: updateData }, {
      new: true,
      runValidators: true
    }).select('-password');

    if (!updatedUser) {
      return next(new NotFoundError(`User not found with ID: ${req.params.id}`, 404));
    }

    logger.info('Admin updated user successfully', { targetUserId: req.params.id, adminUserId: req.user.id, changes: updateData });
    res.status(200).json({
      success: true,
      message: 'User updated successfully.',
      data: updatedUser
    });
  } catch (error) {
    logger.error('Admin: Error updating user', { targetUserId: req.params.id, adminUserId: req.user.id, error: error.message, stack: error.stack, body: req.body });
    if (error.name === 'ValidationError') {
      return next(new ValidationError(error.message));
    }
    if (error.name === 'CastError') {
        return next(new NotFoundError(`User not found with ID: ${req.params.id}`, 404));
    }
    next(new AppError('Server error while updating user.', 500));
  }
};

/**
 * @desc    Admin: Delete a user (Soft or Hard Delete)
 * @route   DELETE /api/v1/users/:id
 * @access  Private (Admin)
 */
exports.deleteUser = async (req, res, next) => {
  try {
    const userIdToDelete = req.params.id;
    if (userIdToDelete === req.user.id) {
        return next(new AppError('Admins cannot delete their own account through this endpoint.', 400));
    }

    const user = await User.findById(userIdToDelete);
    if (!user) {
      return next(new NotFoundError(`User not found with ID: ${userIdToDelete}`, 404));
    }

    // Option 1: Soft delete (recommended)
    user.status = 'deleted'; // Or 'archived'
    user.email = `${user.email}_deleted_${Date.now()}`;
    user.password = undefined;
    user.refreshToken = undefined;
    user.metadata.isDeleted = true;
    user.metadata.deletedAt = Date.now();
    user.metadata.deletedBy = req.user.id;
    await user.save({ validateBeforeSave: false });
    logger.info('Admin soft deleted user successfully', { targetUserId: userIdToDelete, adminUserId: req.user.id });
    res.status(200).json({ success: true, message: 'User account soft deleted.' });

    // Option 2: Hard delete (use with caution)
    // await User.findByIdAndDelete(userIdToDelete);
    // logger.info('Admin hard deleted user successfully', { targetUserId: userIdToDelete, adminUserId: req.user.id });
    // res.status(204).json({ success: true, data: null });

  } catch (error) {
    logger.error('Admin: Error deleting user', { targetUserId: req.params.id, adminUserId: req.user.id, error: error.message, stack: error.stack });
    if (error.name === 'CastError') {
        return next(new NotFoundError(`User not found with ID: ${req.params.id}`, 404));
    }
    next(new AppError('Server error while deleting user.', 500));
  }
};

/**
 * @desc    Get user's booking history
 * @route   GET /api/v1/users/:id/bookings  (Admin for any user)
 * @route   GET /api/v1/users/me/bookings (Logged-in user for their own)
 * @access  Private
 */
exports.getUserBookings = async (req, res, next) => {
    try {
        let targetUserId;
        if (req.params.id) { // Admin getting bookings for a specific user
            if (req.user.role !== 'admin') {
                return next(new AuthorizationError('You are not authorized to view these bookings.', 403));
            }
            targetUserId = req.params.id;
            const userExists = await User.findById(targetUserId);
            if (!userExists) return next(new NotFoundError(`User with ID ${targetUserId} not found.`, 404));
        } else { // User getting their own bookings
            targetUserId = req.user.id;
        }

        const features = new APIFeatures(Booking.find({ user: targetUserId })
            .populate({ path: 'route', select: 'name origin destination'})
            .populate({ path: 'trip', select: 'tripId status schedule.scheduledDeparture' })
            .sort('-createdAt'), // Sort by most recent first
            req.query)
            .filter()
            .paginate();

        const bookings = await features.query;
        const totalBookings = await Booking.countDocuments({ ...features.getQuery()._conditions, user: targetUserId });

        logger.info('Retrieved user bookings', { targetUserId, requester: req.user.id, count: bookings.length });
        res.status(200).json({
            success: true,
            count: bookings.length,
            total: totalBookings,
            pagination: features.pagination,
            data: bookings
        });

    } catch (error) {
        logger.error('Error retrieving user bookings', { targetUserId: req.params.id || req.user.id, error: error.message, stack: error.stack });
        next(new AppError('Server error while retrieving bookings.', 500));
    }
};