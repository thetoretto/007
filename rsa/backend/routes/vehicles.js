const express = require('express');
const router = express.Router();
const {
    createVehicle,
    getAllVehicles,
    getVehicleById,
    updateVehicle,
    deleteVehicle,
    assignDriverToVehicle,
    unassignDriverFromVehicle,
    // getVehicleMaintenanceRecords, // Example: To be added
    // addVehicleMaintenanceRecord,  // Example: To be added
    // getVehicleAvailability       // Example: To be added
} = require('../controllers/vehicleController');
const { authenticate, authorize } = require('../middleware/auth');

// Register a new vehicle (Admin)
router.post('/', authenticate, authorize(['admin', 'fleet_manager']), createVehicle);

// Get all vehicles (Admin, Fleet Manager)
router.get('/', authenticate, authorize(['admin', 'fleet_manager', 'support_agent']), getAllVehicles);

// Get a single vehicle by ID (Admin, Fleet Manager)
router.get('/:id', authenticate, authorize(['admin', 'fleet_manager', 'support_agent', 'driver']), getVehicleById); // Driver might need to see their assigned vehicle details

// Update a vehicle by ID (Admin, Fleet Manager)
router.put('/:id', authenticate, authorize(['admin', 'fleet_manager']), updateVehicle);

// Delete a vehicle by ID (Soft Delete) (Admin, Fleet Manager)
router.delete('/:id', authenticate, authorize(['admin', 'fleet_manager']), deleteVehicle);

// Assign a driver to a vehicle (Admin, Fleet Manager)
router.put('/:id/assign-driver', authenticate, authorize(['admin', 'fleet_manager']), assignDriverToVehicle);

// Unassign a driver from a vehicle (Admin, Fleet Manager)
router.put('/:id/unassign-driver', authenticate, authorize(['admin', 'fleet_manager']), unassignDriverFromVehicle);

// Example: Get vehicle availability calendar
// router.get('/:id/availability', authenticate, authorize(['admin', 'fleet_manager', 'support_agent']), getVehicleAvailability);

// Example: Maintenance records for a vehicle
// router.get('/:id/maintenance', authenticate, authorize(['admin', 'fleet_manager']), getVehicleMaintenanceRecords);
// router.post('/:id/maintenance', authenticate, authorize(['admin', 'fleet_manager']), addVehicleMaintenanceRecord);

module.exports = router;