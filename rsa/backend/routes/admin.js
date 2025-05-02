const express = require('express');
const router = express.Router();
// const { auth, checkRole } = require('../middleware/auth');
const adminController = require('../controllers/adminController');

// router.get('/users', auth, checkRole(['admin']), adminController.getUsers);
// router.get('/trips', auth, checkRole(['admin']), adminController.getTrips);
// router.get('/bookings', auth, checkRole(['admin']), adminController.getBookings);
// router.get('/stats', auth, checkRole(['admin']), adminController.getStats);

module.exports = router;