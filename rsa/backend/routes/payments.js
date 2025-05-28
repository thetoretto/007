const express = require('express');
const router = express.Router();
const {
    processPayment,
    getAllPayments,
    getPaymentById,
    processRefund,
    // getPaymentMethods, // Example: To be added in controller
    // handlePaymentWebhook // Example: To be added in controller for gateway webhooks
} = require('../controllers/paymentController');
const { authenticate, authorize } = require('../middleware/auth');

// Process a new payment (User for their booking, Admin for manual entries)
router.post('/', authenticate, processPayment);

// Get all payments (User sees their own, Admin sees all)
router.get('/', authenticate, getAllPayments);

// Get a single payment by ID (User sees their own, Admin sees all)
router.get('/:id', authenticate, getPaymentById);

// Process a refund for a payment (Admin only)
router.post('/:id/refund', authenticate, authorize(['admin', 'support_agent']), processRefund);

// Example: Get user's saved payment methods
// router.get('/methods', authenticate, authorize(['user']), getPaymentMethods);

// Example: Webhook endpoint for payment gateways (e.g., Stripe, PayPal)
// router.post('/webhook', handlePaymentWebhook); // Webhooks often don't use standard JWT auth

module.exports = router;