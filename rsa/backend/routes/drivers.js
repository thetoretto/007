const express = require('express');
const router = express.Router();

const driverController = require('../controllers/driverController');
const { authenticate, authorize } = require('../middleware/auth');

// Public routes (if any - e.g., searching for drivers by certain criteria, if applicable)
// router.get('/search', driverController.searchDrivers); // Example, if search is public

// Admin routes
router.post('/', authenticate, authorize(['admin']), driverController.createDriver);
router.get('/', authenticate, authorize(['admin']), driverController.getAllDrivers);
router.put('/:id/approve', authenticate, authorize(['admin']), driverController.approveDriver);
router.put('/:id/reject', authenticate, authorize(['admin']), driverController.rejectDriver);
router.put('/:id/status', authenticate, authorize(['admin']), driverController.updateDriverStatus); // For admin to change status like active, suspended
router.delete('/:id', authenticate, authorize(['admin']), driverController.deleteDriver);

// Routes accessible by Admin or the Driver themselves
router.get('/:id', authenticate, authorize(['admin', 'driver']), driverController.getDriverById);
router.put('/:id', authenticate, authorize(['admin', 'driver']), driverController.updateDriver); // Driver can update their own profile (limited fields), Admin can update all

// Driver-specific document management (could be part of updateDriver or separate)
router.post('/:id/documents', authenticate, authorize(['admin', 'driver']), driverController.uploadDriverDocument); // Driver uploads, admin can also manage
router.get('/:id/documents', authenticate, authorize(['admin', 'driver']), driverController.getDriverDocuments);
router.delete('/:id/documents/:docId', authenticate, authorize(['admin', 'driver']), driverController.deleteDriverDocument);

// Driver availability management
router.put('/:id/availability', authenticate, authorize(['admin', 'driver']), driverController.updateDriverAvailability);
router.get('/:id/availability', authenticate, authorize(['admin', 'driver']), driverController.getDriverAvailability);

// Driver performance and history (potentially admin or driver specific views)
router.get('/:id/performance', authenticate, authorize(['admin', 'driver']), driverController.getDriverPerformance); // Admin sees full, driver sees own
router.get('/:id/trip-history', authenticate, authorize(['admin', 'driver']), driverController.getDriverTripHistory);

// Assign/Unassign vehicle to driver (Admin only)
// These might live in vehicle routes or here, depending on primary resource focus
// router.post('/:driverId/assign-vehicle/:vehicleId', authenticate, authorize(['admin']), driverController.assignVehicleToDriver);
// router.post('/:driverId/unassign-vehicle', authenticate, authorize(['admin']), driverController.unassignVehicleFromDriver);


module.exports = router;