const express = require('express');
const { body, validationResult } = require('express-validator');
const crypto = require('crypto');
const jwt = require('jsonwebtoken'); // Added import for jsonwebtoken
const User = require('../models/User');
const { asyncHandler, ValidationError, AuthenticationError } = require('../middleware/errorHandler'); // Removed NotFoundError
const { authenticate } = require('../middleware/auth');
const { createLogger } = require('../utils/logger');
const { sendEmail } = require('../utils/email');

const router = express.Router();
const logger = createLogger('AuthRoutes');

// Validation middleware
const validateRegistration = [
  body('firstName')
    .trim()
    .isLength({ min: 2, max: 50 })
    .withMessage('First name must be between 2 and 50 characters'),
  body('lastName')
    .trim()
    .isLength({ min: 2, max: 50 })
    .withMessage('Last name must be between 2 and 50 characters'),
  body('email')
    .isEmail()
    .normalizeEmail()
    .withMessage('Please provide a valid email'),
  body('password')
    .isLength({ min: 6 })
    .withMessage('Password must be at least 6 characters')
    .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/)
    .withMessage('Password must contain at least one uppercase letter, one lowercase letter, and one number'),
  body('phone')
    .isMobilePhone()
    .withMessage('Please provide a valid phone number')
];

const validateLogin = [
  body('email')
    .isEmail()
    .normalizeEmail()
    .withMessage('Please provide a valid email'),
  body('password')
    .notEmpty()
    .withMessage('Password is required')
];

const validateForgotPassword = [
  body('email')
    .isEmail()
    .normalizeEmail()
    .withMessage('Please provide a valid email')
];

const validateResetPassword = [
  body('token')
    .notEmpty()
    .withMessage('Reset token is required'),
  body('password')
    .isLength({ min: 6 })
    .withMessage('Password must be at least 6 characters')
    .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/)
    .withMessage('Password must contain at least one uppercase letter, one lowercase letter, and one number')
];

// Helper function to handle validation errors
const handleValidationErrors = (req) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    const formattedErrors = errors.array().map(error => ({
      field: error.path,
      message: error.msg
    }));
    throw new ValidationError('Validation failed', formattedErrors);
  }
};

// @desc    Register user
// @route   POST /api/auth/register
// @access  Public
router.post('/register', validateRegistration, asyncHandler(async (req, res) => {
  handleValidationErrors(req);

  const { firstName, lastName, email, password, phone } = req.body;

  // Check if user already exists
  const existingUser = await User.findByEmail(email);
  if (existingUser) {
    logger.logSecurity('Registration attempt with existing email', {
      email,
      ip: req.ip,
      userAgent: req.get('User-Agent')
    });
    throw new ValidationError('User with this email already exists');
  }

  // Create user
  const user = await User.create({
    firstName,
    lastName,
    email,
    password,
    phone,
    metadata: {
      registrationIP: req.ip,
      userAgent: req.get('User-Agent')
    }
  });

  // Generate email verification token
  const emailToken = crypto.randomBytes(32).toString('hex');
  user.verification.email.token = crypto.createHash('sha256').update(emailToken).digest('hex');
  user.verification.email.expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours
  await user.save();

  // Send verification email
  try {
    await sendEmail({
      to: user.email,
      subject: 'Verify Your Email - RSA Transportation',
      template: 'emailVerification',
      data: {
        name: user.fullName,
        verificationUrl: `${process.env.FRONTEND_URL}/verify-email?token=${emailToken}`
      }
    });
  } catch (error) {
    logger.error('Failed to send verification email:', error);
  }

  // Generate JWT token
  const token = user.getSignedJwtToken();
  const refreshToken = user.getRefreshToken();

  logger.logAuth('User registered', user._id, {
    email: user.email,
    ip: req.ip
  });

  res.status(201).json({
    success: true,
    message: 'Registration successful. Please check your email to verify your account.',
    data: {
      token,
      refreshToken,
      user: {
        id: user._id,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        phone: user.phone,
        role: user.role,
        isEmailVerified: user.verification.email.isVerified
      }
    }
  });
}));

// @desc    Login user
// @route   POST /api/auth/login
// @access  Public
router.post('/login', validateLogin, asyncHandler(async (req, res) => {
  handleValidationErrors(req);

  const { email, password } = req.body;

  // Find user and include password
  const user = await User.findByEmail(email).select('+password');
  
  if (!user) {
    logger.logSecurity('Login attempt with non-existent email', {
      email,
      ip: req.ip,
      userAgent: req.get('User-Agent')
    });
    throw new AuthenticationError('Invalid credentials');
  }

  // Check if account is locked
  if (user.isLocked) {
    logger.logSecurity('Login attempt on locked account', {
      userId: user._id,
      email,
      ip: req.ip
    });
    throw new AuthenticationError('Account is temporarily locked due to too many failed login attempts');
  }

  // Check if account is active
  if (!user.isActive) {
    logger.logSecurity('Login attempt on deactivated account', {
      userId: user._id,
      email,
      ip: req.ip
    });
    throw new AuthenticationError('Account has been deactivated');
  }

  // Check password
  const isPasswordValid = await user.matchPassword(password);
  
  if (!isPasswordValid) {
    await user.incLoginAttempts();
    logger.logSecurity('Failed login attempt - invalid password', {
      userId: user._id,
      email,
      loginAttempts: user.security.loginAttempts + 1,
      ip: req.ip
    });
    throw new AuthenticationError('Invalid credentials');
  }

  // Reset login attempts on successful login
  if (user.security.loginAttempts > 0) {
    await user.resetLoginAttempts();
  }

  // Update last login
  await user.updateLastLogin(req.ip, req.get('User-Agent'));

  // Generate tokens
  const token = user.getSignedJwtToken();
  const refreshToken = user.getRefreshToken();

  logger.logAuth('User logged in', user._id, {
    email: user.email,
    ip: req.ip
  });

  res.json({
    success: true,
    message: 'Login successful',
    data: {
      token,
      refreshToken,
      user: {
        id: user._id,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        phone: user.phone,
        role: user.role,
        isEmailVerified: user.verification.email.isVerified
      }
    }
  });
}));

// @desc    Get current user
// @route   GET /api/auth/me
// @access  Private
router.get('/me', authenticate, asyncHandler(async (req, res) => {
  res.json({
    success: true,
    data: {
      user: {
        id: req.user._id,
        firstName: req.user.firstName,
        lastName: req.user.lastName,
        email: req.user.email,
        phone: req.user.phone,
        role: req.user.role,
        avatar: req.user.avatar,
        isEmailVerified: req.user.verification.email.isVerified,
        preferences: req.user.preferences,
        createdAt: req.user.createdAt
      }
    }
  });
}));

// @desc    Logout user
// @route   POST /api/auth/logout
// @access  Private
router.post('/logout', authenticate, asyncHandler(async (req, res) => {
  logger.logAuth('User logged out', req.user._id, {
    email: req.user.email,
    ip: req.ip
  });

  res.json({
    success: true,
    message: 'Logout successful'
  });
}));

// @desc    Forgot password
// @route   POST /api/auth/forgot-password
// @access  Public
router.post('/forgot-password', validateForgotPassword, asyncHandler(async (req, res) => {
  handleValidationErrors(req);

  const { email } = req.body;

  const user = await User.findByEmail(email);
  
  if (!user) {
    // Don't reveal if email exists or not
    return res.json({
      success: true,
      message: 'If an account with that email exists, a password reset link has been sent.'
    });
  }

  // Generate reset token
  const resetToken = user.getResetPasswordToken();
  await user.save();

  // Send reset email
  try {
    await sendEmail({
      to: user.email,
      subject: 'Password Reset - RSA Transportation',
      template: 'passwordReset',
      data: {
        name: user.fullName,
        resetUrl: `${process.env.FRONTEND_URL}/reset-password?token=${resetToken}`
      }
    });

    logger.logAuth('Password reset requested', user._id, {
      email: user.email,
      ip: req.ip
    });
  } catch (error) {
    user.security.passwordResetToken = undefined;
    user.security.passwordResetExpires = undefined;
    await user.save();
    
    logger.error('Failed to send password reset email:', error);
    throw new Error('Email could not be sent');
  }

  res.json({
    success: true,
    message: 'If an account with that email exists, a password reset link has been sent.'
  });
}));

// @desc    Reset password
// @route   POST /api/auth/reset-password
// @access  Public
router.post('/reset-password', validateResetPassword, asyncHandler(async (req, res) => {
  handleValidationErrors(req);

  const { token, password } = req.body;

  // Hash the token
  const hashedToken = crypto.createHash('sha256').update(token).digest('hex');

  // Find user by token
  const user = await User.findOne({
    'security.passwordResetToken': hashedToken,
    'security.passwordResetExpires': { $gt: Date.now() }
  });

  if (!user) {
    throw new AuthenticationError('Invalid or expired reset token');
  }

  // Set new password
  user.password = password;
  user.security.passwordResetToken = undefined;
  user.security.passwordResetExpires = undefined;
  user.security.loginAttempts = 0;
  user.security.lockUntil = undefined;
  
  await user.save();

  logger.logAuth('Password reset completed', user._id, {
    email: user.email,
    ip: req.ip
  });

  res.json({
    success: true,
    message: 'Password has been reset successfully'
  });
}));

// @desc    Verify email
// @route   POST /api/auth/verify-email
// @access  Public
router.post('/verify-email', asyncHandler(async (req, res) => {
  const { token } = req.body;

  if (!token) {
    throw new ValidationError('Verification token is required');
  }

  // Hash the token
  const hashedToken = crypto.createHash('sha256').update(token).digest('hex');

  // Find user by token
  const user = await User.findOne({
    'verification.email.token': hashedToken,
    'verification.email.expiresAt': { $gt: Date.now() }
  });

  if (!user) {
    throw new AuthenticationError('Invalid or expired verification token');
  }

  // Verify email
  user.verification.email.isVerified = true;
  user.verification.email.token = undefined;
  user.verification.email.expiresAt = undefined;
  
  await user.save();

  logger.logAuth('Email verified', user._id, {
    email: user.email,
    ip: req.ip
  });

  res.json({
    success: true,
    message: 'Email verified successfully'
  });
}));

// @desc    Refresh token
// @route   POST /api/auth/refresh
// @access  Public
router.post('/refresh', asyncHandler(async (req, res) => {
  const { refreshToken } = req.body;

  if (!refreshToken) {
    throw new AuthenticationError('Refresh token is required');
  }

  try {
    const decoded = jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET);
    
    if (decoded.type !== 'refresh') {
      throw new AuthenticationError('Invalid token type');
    }

    const user = await User.findById(decoded.id);
    
    if (!user || !user.isActive) {
      throw new AuthenticationError('User not found or inactive');
    }

    // Generate new tokens
    const newToken = user.getSignedJwtToken();
    const newRefreshToken = user.getRefreshToken();

    res.json({
      success: true,
      data: {
        token: newToken,
        refreshToken: newRefreshToken
      }
    });
  } catch (error) {
    throw new AuthenticationError('Invalid refresh token');
  }
}));

module.exports = router;