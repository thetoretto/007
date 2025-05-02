const express = require('express');
const router = express.Router();
const { auth } = require('../middleware/auth');
const authController = require('../controllers/authController');

// @route   POST /api/auth/register
// @desc    Register a new user
// @access  Public
router.post('/register', authController.register);

// @route   POST /api/auth/login
// @desc    Login user
// @access  Public
router.post('/login', authController.login);

// @route   GET /api/auth/me
// @desc    Get current user profile
// @access  Private
router.get('/me', auth, authController.getMe);

// @route   PUT /api/auth/me
// @desc    Update user profile
// @access  Private
router.put('/me', auth, authController.updateMe);

module.exports = router;