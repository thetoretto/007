const express = require('express');
const router = express.Router();
const {
    createRoute,
    getAllRoutes,
    getRouteById,
    updateRoute,
    deleteRoute,
    searchRoutes,
    checkRouteAvailability,
    getRoutePathAndElevation, // Assuming this will be added to controller
    getRouteAnalytics // Assuming this will be added to controller
} = require('../controllers/routeController');
const { authenticate, authorize } = require('../middleware/auth'); // Assuming auth.js is in middleware

// Public routes
router.get('/', getAllRoutes);
router.get('/search', searchRoutes);
router.get('/:id', getRouteById);
router.get('/:id/availability', checkRouteAvailability);
router.get('/:id/path', getRoutePathAndElevation); // Example, ensure controller has this

// Admin routes (protected)
router.post('/', authenticate, authorize(['admin']), createRoute);
router.put('/:id', authenticate, authorize(['admin']), updateRoute);
router.delete('/:id', authenticate, authorize(['admin']), deleteRoute);
router.get('/:id/analytics', authenticate, authorize(['admin', 'support']), getRouteAnalytics); // Example, ensure controller has this

module.exports = router;