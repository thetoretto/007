const User = require('../models/User');
const { AppError, ValidationError, AuthenticationError } = require('../middleware/errorHandler');
const { sendVerificationEmail, sendPasswordResetEmail, sendWelcomeEmail } = require('../utils/email');
const { createLogger } = require('../utils/logger');
const crypto = require('crypto');
const AdminSetting = require('../models/AdminSetting');

const logger = createLogger('AuthController');

// Helper function to generate tokens
// const generateToken = (payload, secret, expiresIn) => { // Commented out as it's not used directly in this file
//   return jwt.sign(payload, secret, { expiresIn });
// };

/**
 * @desc    Register a new user
 * @route   POST /api/v1/auth/register
 * @access  Public
 */
exports.register = async (req, res, next) => {
  try {
    const { firstName, lastName, email, password, phone, dateOfBirth, role } = req.body;

    if (!firstName || !lastName || !email || !password) {
      return next(new ValidationError('Please provide first name, last name, email, and password.', 400));
    }

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return next(new AppError('User with this email already exists.', 409)); // 409 Conflict
    }

    const verificationToken = crypto.randomBytes(32).toString('hex');
    const user = new User({
      profile: {
        firstName,
        lastName,
        dateOfBirth
      },
      email,
      password, // Will be hashed by pre-save hook
      phone,
      role: role || 'user', // Default to 'user' if not provided
      verification: {
        token: verificationToken,
        expires: Date.now() + 24 * 60 * 60 * 1000, // 24 hours
      }
    });

    await user.save();

    // Send verification email
    try {
      const verificationUrl = `${req.protocol}://${req.get('host')}/api/v1/auth/verify-email/${verificationToken}`;
      await sendVerificationEmail(user.email, user.profile.firstName, verificationUrl);
      logger.info('Verification email sent successfully', { email: user.email });
    } catch (emailError) {
      logger.error('Failed to send verification email', { email: user.email, error: emailError.message });
      // Decide if this should be a critical failure or just a warning
    }

    // Optionally send welcome email after registration (or after verification)
    // await sendWelcomeEmail(user.email, user.profile.firstName);

    // Do not send tokens immediately, user needs to verify email first
    res.status(201).json({
      success: true,
      message: 'Registration successful. Please check your email to verify your account.',
      // data: { userId: user._id } // Optionally return user ID or minimal data
    });

  } catch (error) {
    logger.error('User registration failed', { error: error.message, stack: error.stack, body: req.body });
    if (error.name === 'ValidationError') {
        return next(new ValidationError(error.message));
    }
    next(new AppError('Server error during registration.', 500));
  }
};

/**
 * @desc    Login user
 * @route   POST /api/v1/auth/login
 * @access  Public
 */
exports.login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return next(new ValidationError('Please provide email and password.', 400));
    }

    const user = await User.findOne({ email }).select('+password +verification.isVerified +security.loginAttempts +security.lockUntil');

    if (!user) {
      return next(new AuthenticationError('Invalid credentials.', 401));
    }

    // Check if account is locked
    if (user.security.lockUntil && user.security.lockUntil > Date.now()) {
        const timeLeft = Math.ceil((user.security.lockUntil - Date.now()) / 60000);
        return next(new AuthenticationError(`Account locked due to too many failed login attempts. Try again in ${timeLeft} minutes.`, 403));
    }

    const isMatch = await user.matchPassword(password);
    if (!isMatch) {
        await user.incrementLoginAttempts();
        const maxAttempts = await AdminSetting.getSetting('max_login_attempts') || 5;
        if (user.security.loginAttempts >= maxAttempts) {
            const lockoutDuration = await AdminSetting.getSetting('lockout_duration_minutes') || 15;
            await user.lockAccount(lockoutDuration);
            return next(new AuthenticationError(`Invalid credentials. Account locked for ${lockoutDuration} minutes.`, 403));
        }
        return next(new AuthenticationError('Invalid credentials.', 401));
    }

    if (!user.verification.isVerified) {
      return next(new AuthenticationError('Account not verified. Please check your email.', 403));
    }

    await user.resetLoginAttempts();
    await user.updateLastLogin();

    const accessToken = user.generateAuthToken();
    const refreshToken = user.generateRefreshToken();

    // Store refresh token in DB (or a secure cache like Redis)
    user.security.refreshToken = refreshToken;
    await user.save();

    // Set refresh token in HTTP-only cookie
    res.cookie('refreshToken', refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days
    });

    res.status(200).json({
      success: true,
      message: 'Login successful.',
      data: {
        accessToken,
        user: {
          id: user._id,
          firstName: user.profile.firstName,
          lastName: user.profile.lastName,
          email: user.email,
          role: user.role,
          avatar: user.profile.avatar
        }
      }
    });

  } catch (error) {
    logger.error('User login failed', { email: req.body.email, error: error.message, stack: error.stack });
    next(error);
    // next(new AppError('Server error during login.', 500)); // Already handled by global error handler if next(error) is used
  }
};

/**
 * @desc    Verify Email
 * @route   GET /api/v1/auth/verify-email/:token
 * @access  Public
 */
exports.verifyEmail = async (req, res, next) => {
  try {
    const { token } = req.params;
    if (!token) {
      return next(new ValidationError('Verification token is missing.', 400));
    }

    const user = await User.findOne({
      'verification.token': token,
      'verification.expires': { $gt: Date.now() }
    });

    if (!user) {
      return next(new AppError('Invalid or expired verification token.', 400));
    }

    user.verification.isVerified = true;
    user.verification.verifiedAt = Date.now();
    user.verification.token = undefined;
    user.verification.expires = undefined;
    user.status = 'active'; // Activate user upon email verification
    await user.save();

    // Send welcome email after verification
    try {
        await sendWelcomeEmail(user.email, user.profile.firstName);
        logger.info('Welcome email sent successfully after verification', { email: user.email });
    } catch (emailError) {
        logger.error('Failed to send welcome email after verification', { email: user.email, error: emailError.message });
    }

    // Optionally, log the user in directly or redirect to login page
    // For now, just confirm verification
    res.status(200).json({
      success: true,
      message: 'Email verified successfully. You can now log in.'
    });

  } catch (error) {
    logger.error('Email verification failed', { token: req.params.token, error: error.message, stack: error.stack });
    next(error);
    // next(new AppError('Server error during email verification.', 500));
  }
};

/**
 * @desc    Resend Verification Email
 * @route   POST /api/v1/auth/resend-verification
 * @access  Public
 */
exports.resendVerificationEmail = async (req, res, next) => {
  try {
    const { email } = req.body;
    if (!email) {
      return next(new ValidationError('Email is required.', 400));
    }

    const user = await User.findOne({ email });
    if (!user) {
      return next(new AppError('User with this email not found.', 404));
    }

    if (user.verification.isVerified) {
      return next(new AppError('Email is already verified.', 400));
    }

    // Check if a token was recently sent to prevent abuse
    // For example, allow resend only after X minutes

    const verificationToken = crypto.randomBytes(32).toString('hex');
    user.verification.token = verificationToken;
    user.verification.expires = Date.now() + 24 * 60 * 60 * 1000; // 24 hours
    await user.save();

    const verificationUrl = `${req.protocol}://${req.get('host')}/api/v1/auth/verify-email/${verificationToken}`;
    await sendVerificationEmail(user.email, user.profile.firstName, verificationUrl);

    res.status(200).json({
      success: true,
      message: 'Verification email resent. Please check your inbox.'
    });

  } catch (error) {
    logger.error('Resend verification email failed', { email: req.body.email, error: error.message, stack: error.stack });
    next(error);
    // next(new AppError('Server error resending verification email.', 500));
  }
};

/**
 * @desc    Forgot Password
 * @route   POST /api/v1/auth/forgot-password
 * @access  Public
 */
exports.forgotPassword = async (req, res, next) => {
  try {
    const { email } = req.body;
    if (!email) {
      return next(new ValidationError('Email is required.', 400));
    }

    const user = await User.findOne({ email });
    if (!user) {
      // To prevent email enumeration, send a generic success message even if user not found
      logger.warn('Password reset requested for non-existent email', { email });
      return res.status(200).json({ success: true, message: 'If an account with this email exists, a password reset link has been sent.' });
    }

    const resetToken = user.generatePasswordResetToken();
    await user.save({ validateBeforeSave: false }); // Skip validation as we are only saving token

    const resetUrl = `${req.protocol}://${req.get('host')}/api/v1/auth/reset-password/${resetToken}`;
    await sendPasswordResetEmail(user.email, user.profile.firstName, resetUrl);

    res.status(200).json({ success: true, message: 'Password reset link sent to your email.' });

  } catch (error) {
    logger.error('Forgot password request failed', { email: req.body.email, error: error.message, stack: error.stack });
    next(error);
    // Clear token if error occurred after generation
    // This logic might need to be re-evaluated if `user` is not in scope here due to `next(error)`
    // const user = await User.findOne({ email: req.body.email }); // Re-fetch or ensure `user` is available
    if (error.userInstance && error.userInstance.security.resetPasswordToken) { // Assuming user instance is passed with error
        error.userInstance.security.resetPasswordToken = undefined;
        error.userInstance.security.resetPasswordExpires = undefined;
        await error.userInstance.save({ validateBeforeSave: false });
    }
    // next(new AppError('Error processing forgot password request.', 500));
  }
};

/**
 * @desc    Reset Password
 * @route   PUT /api/v1/auth/reset-password/:token
 * @access  Public
 */
exports.resetPassword = async (req, res, next) => {
  try {
    const { token } = req.params;
    const { password } = req.body;

    if (!password) {
      return next(new ValidationError('New password is required.', 400));
    }

    const hashedToken = crypto.createHash('sha256').update(token).digest('hex');

    const user = await User.findOne({
      'security.resetPasswordToken': hashedToken,
      'security.resetPasswordExpires': { $gt: Date.now() }
    });

    if (!user) {
      return next(new AppError('Invalid or expired password reset token.', 400));
    }

    user.password = password; // Hashing will be done by pre-save hook
    user.security.resetPasswordToken = undefined;
    user.security.resetPasswordExpires = undefined;
    user.security.passwordLastChangedAt = Date.now();
    await user.resetLoginAttempts(); // Reset lock status as well
    await user.save();

    // Optionally, log the user in or send a confirmation email

    res.status(200).json({ success: true, message: 'Password reset successfully.' });

  } catch (error) {
    logger.error('Password reset failed', { token: req.params.token, error: error.message, stack: error.stack });
    next(error);
    // next(new AppError('Error resetting password.', 500));
  }
};

/**
 * @desc    Refresh Access Token
 * @route   POST /api/v1/auth/refresh-token
 * @access  Private (requires valid refresh token cookie)
 */
exports.refreshToken = async (req, res, next) => {
  try {
    const refreshTokenFromCookie = req.cookies.refreshToken;
    if (!refreshTokenFromCookie) {
      return next(new AuthenticationError('Refresh token not found.', 401));
    }

    const user = await User.findOne({ 'security.refreshToken': refreshTokenFromCookie });
    if (!user) {
      return next(new AuthenticationError('Invalid refresh token.', 403));
    }

    // Verify the refresh token (optional, if it has its own expiry separate from storage)
    // For simplicity, we assume if it's in DB and matches, it's valid.
    // In a more robust system, refresh tokens might also have an expiry managed by JWT.

    const newAccessToken = user.generateAuthToken();
    // Optionally, rotate refresh token
    // const newRefreshToken = user.generateRefreshToken();
    // user.security.refreshToken = newRefreshToken;
    // await user.save();
    // res.cookie('refreshToken', newRefreshToken, { httpOnly: true, ... });

    res.status(200).json({
      success: true,
      data: { accessToken: newAccessToken }
    });

  } catch (error) {
    logger.error('Token refresh failed', { error: error.message, stack: error.stack, body: req.body });
    next(error);
    // next(new AppError('Error refreshing token.', 500));
  }
};

/**
 * @desc    Logout User
 * @route   POST /api/v1/auth/logout
 * @access  Private
 */
exports.logout = async (req, res, next) => {
  try {
    const user = await User.findById(req.user.id);
    if (user) {
      user.security.refreshToken = undefined; // Invalidate refresh token
      await user.save();
    }

    res.cookie('refreshToken', '', {
      httpOnly: true,
      expires: new Date(0) // Expire cookie immediately
    });

    res.status(200).json({ success: true, message: 'Logged out successfully.' });

  } catch (error) {
    logger.error('User logout failed', { userId: req.user ? req.user.id : 'N/A', error: error.message, stack: error.stack });
    next(error);
    // next(new AppError('Error during logout.', 500));
  }
};

/**
 * @desc    Get current logged-in user
 * @route   GET /api/v1/auth/me
 * @access  Private
 */
exports.getMe = async (req, res, next) => {
  try {
    // req.user is populated by the authMiddleware
    const user = await User.findById(req.user.id).select('-password -security.refreshToken -security.resetPasswordToken -security.resetPasswordExpires -verification.token');

    if (!user) {
      return next(new AppError('User not found.', 404));
    }

    res.status(200).json({
      success: true,
      data: user
    });
  } catch (error) {
    logger.error('Failed to get current user profile', { userId: req.user.id, error: error.message, stack: error.stack });
    next(error);
    // next(new AppError('Error fetching user details.', 500));
  }
};

// JWT is required for token generation, ensure it's imported
// const jwt = require('jsonwebtoken');