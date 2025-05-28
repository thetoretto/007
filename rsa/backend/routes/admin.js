const express = require('express');
const router = express.Router();

const { authenticate, authorize } = require('../middleware/auth');

// Controllers
const adminSettingController = require('../controllers/adminSettingController');
const auditLogController = require('../controllers/auditLogController');
const dashboardController = require('../controllers/dashboardController');
const reportController = require('../controllers/reportController');
const systemHealthController = require('../controllers/systemHealthController');
const userController = require('../controllers/userController'); // For user management by admin
const driverController = require('../controllers/driverController'); // For driver management by admin
const vehicleController = require('../controllers/vehicleController'); // For vehicle management by admin
const routeController = require('../controllers/routeController'); // For route management by admin
const hotpointController = require('../controllers/hotpointController'); // For hotpoint management by admin
const bookingController = require('../controllers/bookingController'); // For booking overview/management by admin
const paymentController = require('../controllers/paymentController'); // For payment overview/management by admin
const tripController = require('../controllers/tripController'); // For trip overview/management by admin
// Add other controllers as needed, e.g., promoCodeController, contentManagementController

// All routes in this file should be protected and accessible only by admin users.
router.use(authenticate, authorize(['admin', 'superadmin'])); // Default protection for all admin routes

// Dashboard Routes
router.get('/dashboard/stats', dashboardController.getDashboardStats);
router.get('/dashboard/charts', dashboardController.getChartData);
router.get('/dashboard/recent-activity', dashboardController.getRecentActivity); // Assuming this exists
router.get('/dashboard/alerts', dashboardController.getAdminAlerts); // Assuming this exists

// User Management Routes
router.get('/users', userController.getAllUsers); // Admin getting all users
router.get('/users/:id', userController.getUserById); // Admin getting a specific user
router.put('/users/:id', userController.updateUserProfile); // Admin updating a user profile
router.delete('/users/:id', userController.deleteUser); // Admin deleting a user
router.put('/users/:id/status', userController.updateUserStatus); // Admin changing user status (active/inactive/banned)
router.post('/users', userController.createUser); // Admin creating a new user

// Driver Management (subset of driver routes, specific admin actions)
router.get('/drivers', driverController.getAllDrivers); // Already in drivers.js, but can be here for admin panel structure
router.put('/drivers/:id/approve', driverController.approveDriver);
router.put('/drivers/:id/reject', driverController.rejectDriver);
router.put('/drivers/:id/status', driverController.updateDriverStatus);
// Other specific admin actions for drivers

// Vehicle Management (subset of vehicle routes)
router.get('/vehicles', vehicleController.getAllVehicles);
// router.post('/vehicles', vehicleController.createVehicle); // Already in vehicles.js
// Other specific admin actions for vehicles

// Route & Hotpoint Management (subset of their respective routes)
router.get('/routes', routeController.getAllRoutes);
router.get('/hotpoints', hotpointController.getAllHotpoints);

// Booking & Trip Overview (Admin views)
router.get('/bookings', bookingController.getAllBookings); // Admin view of all bookings
router.get('/trips', tripController.getAllTrips); // Admin view of all trips

// Payment Management
router.get('/payments', paymentController.getAllPayments); // Admin view of all payments
router.post('/payments/:id/refund', paymentController.processRefund); // Admin processing refund

// System Settings Routes
router.get('/settings', adminSettingController.getAllSettings);
router.post('/settings', authorize(['superadmin']), adminSettingController.createSetting); // Superadmin only
router.get('/settings/groups', adminSettingController.getSettingGroups);
router.get('/settings/group/:groupName', adminSettingController.getSettingsByGroup);
router.get('/settings/:key', adminSettingController.getSettingByKey);
router.put('/settings/:key', authorize(['superadmin']), adminSettingController.updateSetting); // Superadmin only

// Audit Log Routes
router.get('/audit-logs', auditLogController.getAuditLogs);
router.get('/audit-logs/filters', auditLogController.getAuditLogFilterOptions);
router.get('/audit-logs/:id', auditLogController.getAuditLogById);

// Reporting Routes
router.get('/reports/financial', reportController.generateFinancialReport);
router.get('/reports/bookings', reportController.generateBookingReport);
router.get('/reports/user-activity', reportController.generateUserActivityReport);
router.get('/reports/driver-performance', reportController.generateDriverPerformanceReport);
router.get('/reports/vehicle-utilization', reportController.generateVehicleUtilizationReport);
// Add more report types as needed

// System Health & Info Routes
router.get('/system/health', systemHealthController.getSystemHealth); // Could be public or admin only
router.get('/system/info', systemHealthController.getSystemInfo);
// router.get('/system/logs', systemHealthController.getSystemLogs); // If direct log access is provided

// Example: Content Management (if applicable)
// const contentManagementController = require('../controllers/contentManagementController');
// router.get('/content/:contentType', contentManagementController.getContent);
// router.put('/content/:contentType', contentManagementController.updateContent);

// Example: Promo Codes (if applicable)
// const promoCodeController = require('../controllers/promoCodeController');
// router.get('/promocodes', promoCodeController.getAllPromoCodes);
// router.post('/promocodes', promoCodeController.createPromoCode);
// router.put('/promocodes/:id', promoCodeController.updatePromoCode);
// router.delete('/promocodes/:id', promoCodeController.deletePromoCode);


module.exports = router;