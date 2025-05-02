const User = require('../models/User');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');

/**
 * @desc    Register a new user
 * @route   POST /api/auth/register
 * @access  Public
 */
exports.register = async (req, res) => {
  try {
    const { email, phoneNumber, password, firstName, lastName } = req.body;

    if (!email && !phoneNumber) {
      return res.status(400).json({
        success: false,
        message: 'Either email or phone number is required'
      });
    }

    if (!password) {
      return res.status(400).json({
        success: false,
        message: 'Password is required'
      });
    }

    // Check if user exists with either email or phone
    const existingUser = await User.findOne({
      $or: [
        { email: email?.toLowerCase() },
        { phoneNumber }
      ].filter(Boolean)
    });

    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: 'User already exists with this email or phone number'
      });
    }

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Create user with default role 'user'
    const user = await User.create({
      ...(email && { email }),
      ...(phoneNumber && { phoneNumber }),
      password: hashedPassword,
      firstName,
      lastName,
      role: 'user'
    });

    // Generate JWT
    const token = jwt.sign(
      { id: user._id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: '5h' }
    );

    res.status(201).json({
      success: true,
      token,
      user: {
        id: user._id,
        role: user.role,
        phoneNumber: user.phoneNumber
      }
    });

  } catch (err) {
    console.error('Register error:', err);
    res.status(500).json({
      success: false,
      message: 'Server error during registration'
    });
  }
};

/**
 * @desc    Login user
 * @route   POST /api/auth/login
 * @access  Public
 */
exports.login = async (req, res) => {
  if (process.env.NODE_ENV === 'development') {
    const creds = require('../devCredentials');
    const { email, password } = req.body;
    const user = Object.values(creds).find(u => u.username === email && u.password === password);
    if (user) {
      return res.status(200).json({ success: true, role: user.role });
    } else {
      return res.status(401).json({ success: false, message: 'Invalid credentials' });
    }
  }
  try {
    const { email, phoneNumber, password } = req.body;
    if (!email && !phoneNumber) {
      return res.status(400).json({
        success: false,
        message: 'Please provide either email or phone number'
      });
    }
    // Find user by email or phone number
    const user = await User.findOne({
      $or: [
        { email: email?.toLowerCase() },
        { phoneNumber }
      ].filter(Boolean)
    });
    if (!user) {
      // Update existing error responses
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials',
        errorCode: 'AUTH_FAILURE', // Unified error code
        details: invalidField ? `Invalid ${invalidField}` : undefined
      });
    }
    // Validate password
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials',
        error: 'INVALID_PASSWORD'
      });
    }
    // Generate JWT token (using details from the second login function)
    const token = jwt.sign(
      { id: user._id, role: user.role }, // Include role for consistency
      process.env.JWT_SECRET || 'your_jwt_secret', // Fallback secret
      { expiresIn: '30d' } // Use 30d expiry
    );
    // Return user data without password
    const userData = user.toObject();
    delete userData.password;
    res.status(200).json({
      success: true,
      token,
      data: {
        id: user._id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        role: user.role
      },
      redirectTo: user.phoneNumber ? '/dashboard/user' : 
        user.role === 'admin' ? '/admin/dashboard' :
        user.role === 'driver' ? '/driver/dashboard' : '/dashboard'
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({
      success: false,
      message: 'Server Error during authentication',
      error: error.message
    });
  }
};

/**
 * @desc    Get current user profile
 * @route   GET /api/auth/me
 * @access  Private
 */
exports.getMe = async (req, res) => {
  try {
    // req.user.id should be populated by the auth middleware
    const user = await User.findById(req.user.id).select('-password');

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    res.status(200).json({
      success: true,
      data: user
    });
  } catch (error) {
    console.error('Get me error:', error.message);
    res.status(500).json({
      success: false,
      message: 'Server Error',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

/**
 * @desc    Update user profile
 * @route   PUT /api/auth/me
 * @access  Private
 */
exports.updateMe = async (req, res) => {
  try {
    // Fields that are allowed to be updated
    const allowedUpdates = ['firstName', 'lastName', 'avatar'];
    const updates = {};

    Object.keys(req.body).forEach(key => {
      if (allowedUpdates.includes(key)) {
        updates[key] = req.body[key];
      }
    });

    // Update user
    const user = await User.findByIdAndUpdate(
      req.user.id, // req.user.id from auth middleware
      { $set: updates },
      { new: true, runValidators: true }
    ).select('-password');

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    res.status(200).json({
      success: true,
      data: user
    });
  } catch (error) {
    console.error('Update me error:', error.message);
    res.status(500).json({
      success: false,
      message: 'Server Error',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};
if (!process.env.JWT_SECRET) {
  return res.status(500).json({
    success: false,
    message: 'Server configuration error'
  });
}