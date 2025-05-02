const express = require('express');
const router = express.Router();
const { auth, checkRole } = require('../middleware/auth');
const adminController = require('../controllers/adminController');

// @route   GET /api/admin/users
// @desc    Get all users
// @access  Private (Admin)
router.get('/users', auth, checkRole(['admin']), adminController.getUsers);

// @route   GET /api/admin/trips
// @desc    Get all trips with advanced filters
// @access  Private (Admin)
router.get('/trips', auth, checkRole(['admin']), adminController.getTrips);

// @route   GET /api/admin/bookings
// @desc    Get all bookings with advanced filters
// @access  Private (Admin)
router.get('/bookings', auth, checkRole(['admin']), adminController.getBookings);

// @route   GET /api/admin/stats
// @desc    Get system statistics
// @access  Private (Admin)
router.get('/stats', auth, checkRole(['admin']), adminController.getStats);

module.exports = router;