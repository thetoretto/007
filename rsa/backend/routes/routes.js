const express = require('express');
const router = express.Router();
const routeController = require('../controllers/routeController');

/**
 * @route   GET /api/routes
 * @desc    Get all routes
 * @access  Public
 */
router.get('/', routeController.getRoutes);

/**
 * @route   GET /api/routes/:id
 * @desc    Get single route by ID
 * @access  Public
 */
router.get('/:id', routeController.getRouteById);

module.exports = router;