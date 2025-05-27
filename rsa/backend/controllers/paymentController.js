const Payment = require('../models/Payment');
const Booking = require('../models/Booking');
const { AppError, ValidationError, NotFoundError, AuthorizationError } = require('../utils/errors');
const createLogger = require('../utils/logger');
const APIFeatures = require('../utils/apiFeatures');
// const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY); // Example for Stripe integration

const logger = createLogger('PaymentController');

/**
 * @desc    Process a new payment (e.g., for a booking)
 * @route   POST /api/v1/payments
 * @access  Private (User for their own bookings, Admin for manual entries)
 * @note    This is a simplified mock. Real payment processing involves gateway integration.
 */
exports.processPayment = async (req, res, next) => {
  try {
    const { bookingId, amount, currency, paymentMethodDetails, description } = req.body;
    const userId = req.user.id;

    if (!bookingId || !amount || !currency || !paymentMethodDetails) {
      return next(new ValidationError('Booking ID, amount, currency, and payment method details are required.', 400));
    }

    const booking = await Booking.findById(bookingId);
    if (!booking) {
      return next(new NotFoundError(`Booking not found with ID: ${bookingId}`, 404));
    }

    // Authorization: Ensure user owns the booking or is an admin
    if (req.user.role !== 'admin' && booking.user.toString() !== userId) {
      return next(new AuthorizationError('You are not authorized to make a payment for this booking.', 403));
    }

    if (booking.paymentStatus === 'paid' || booking.status === 'confirmed') {
        return next(new AppError(`Booking ${bookingId} is already paid or confirmed.`, 400));
    }

    // --- MOCK PAYMENT GATEWAY INTERACTION ---
    // In a real scenario, you would call Stripe, PayPal, etc. here.
    // For example, with Stripe:
    // const paymentIntent = await stripe.paymentIntents.create({
    //   amount: Math.round(amount * 100), // Amount in cents
    //   currency: currency,
    //   payment_method: paymentMethodDetails.id, // e.g., 'pm_card_visa'
    //   customer: booking.user.stripeCustomerId, // If you store Stripe customer IDs
    //   confirm: true,
    //   description: `Payment for Booking ID: ${bookingId}`,
    //   metadata: { booking_id: bookingId, user_id: userId }
    // });

    // Mocking a successful payment
    const mockTransactionId = `MOCK_TRANS_${Date.now()}`;
    const mockGatewayResponse = { simulated: true, transactionId: mockTransactionId, status: 'succeeded' };

    const payment = await Payment.create({
      user: userId,
      booking: bookingId,
      amount: { value: parseFloat(amount), currency },
      paymentMethod: paymentMethodDetails, // Store tokenized/type of payment method
      status: 'succeeded', // Assume success for mock
      transactionId: mockTransactionId,
      gateway: { name: 'mock_gateway', response: mockGatewayResponse },
      description: description || `Payment for Booking ${bookingId}`,
      billingAddress: req.body.billingAddress, // Optional
      metadata: { initiatedBy: userId }
    });

    // Update booking status upon successful payment
    booking.payment = payment._id;
    booking.paymentStatus = 'paid';
    booking.status = 'confirmed'; // Or 'processing' depending on workflow
    booking.confirmationId = booking.confirmationId || `CONF-${Date.now().toString(36)}-${Math.random().toString(36).substr(2,7)}`.toUpperCase();
    booking.schedule.confirmedDateTime = new Date();
    await booking.save();
    
    // If the booking was for a route (not a specific trip), a Trip record might be created now.
    if (booking.status === 'confirmed' && !booking.trip) {
        const Trip = require('../models/Trip'); // Lazy require to avoid circular deps if any
        const associatedTrip = await Trip.create({
            user: booking.user,
            route: booking.route,
            booking: booking._id,
            passengers: booking.passengers,
            schedule: {
                scheduledDeparture: booking.schedule.requestedDateTime,
            },
            pickupLocation: booking.pickupLocation,
            dropoffLocation: booking.dropoffLocation,
            pricing: booking.pricing,
            status: 'scheduled',
            specialRequirements: booking.specialRequirements,
            metadata: { createdBy: booking.user, autoCreatedFromBooking: true }
        });
        booking.trip = associatedTrip._id;
        await booking.save();
        logger.info('Trip auto-created from confirmed booking after payment', { tripId: associatedTrip._id, bookingId: booking._id });
    }

    // TODO: Send payment confirmation email/receipt

    logger.info('Payment processed successfully (mock)', { paymentId: payment._id, bookingId, userId });
    res.status(201).json({
      success: true,
      message: 'Payment processed successfully.',
      data: {
        payment,
        bookingStatus: booking.status,
        confirmationId: booking.confirmationId
      }
    });

  } catch (error) {
    logger.error('Error processing payment', { error: error.message, stack: error.stack, body: req.body, userId: req.user.id });
    // if (error.type === 'StripeCardError') { // Example for Stripe errors
    //   return next(new AppError(`Payment failed: ${error.message}`, 400));
    // }
    if (error.name === 'ValidationError') {
        return next(new ValidationError(error.message));
    }
    next(new AppError('Server error while processing payment.', 500));
  }
};

/**
 * @desc    Get all payments (Admin access, or User for their own payments)
 * @route   GET /api/v1/payments
 * @access  Private
 */
exports.getAllPayments = async (req, res, next) => {
  try {
    let queryFilter = {};
    if (req.user.role !== 'admin') {
      queryFilter.user = req.user.id;
    }

    const features = new APIFeatures(Payment.find(queryFilter)
        .populate('user', 'profile.firstName profile.lastName email')
        .populate('booking', 'bookingId status route'), // Populate with essential booking info
        req.query)
      .filter()
      .sort()
      .limitFields()
      .paginate();

    const payments = await features.query;
    const totalPayments = await Payment.countDocuments({ ...features.getQuery()._conditions, ...queryFilter });

    logger.info('Retrieved payments', { count: payments.length, userId: req.user.id, role: req.user.role });
    res.status(200).json({
      success: true,
      count: payments.length,
      total: totalPayments,
      pagination: features.pagination,
      data: payments
    });

  } catch (error) {
    logger.error('Error getting all payments', { error: error.message, stack: error.stack, userId: req.user.id });
    next(new AppError('Server error while retrieving payments.', 500));
  }
};

/**
 * @desc    Get a single payment by ID
 * @route   GET /api/v1/payments/:id
 * @access  Private
 */
exports.getPaymentById = async (req, res, next) => {
  try {
    const payment = await Payment.findById(req.params.id)
      .populate('user', 'profile.firstName profile.lastName email')
      .populate({ 
          path: 'booking', 
          select: 'bookingId status route passengers pricing',
          populate: { path: 'route', select: 'name origin destination'}
      });

    if (!payment) {
      return next(new NotFoundError(`Payment not found with ID: ${req.params.id}`, 404));
    }

    // Authorization: User can see their own payment, admin can see all
    if (req.user.role !== 'admin' && payment.user._id.toString() !== req.user.id) {
      return next(new AuthorizationError('You are not authorized to view this payment.', 403));
    }

    logger.info('Retrieved payment by ID', { paymentId: req.params.id, userId: req.user.id });
    res.status(200).json({
      success: true,
      data: payment
    });

  } catch (error) {
    logger.error('Error getting payment by ID', { paymentId: req.params.id, error: error.message, stack: error.stack, userId: req.user.id });
    if (error.name === 'CastError') {
        return next(new NotFoundError(`Payment not found with ID: ${req.params.id}`, 404));
    }
    next(new AppError('Server error while retrieving payment.', 500));
  }
};

/**
 * @desc    Process a refund for a payment
 * @route   POST /api/v1/payments/:id/refund
 * @access  Private (Admin)
 */
exports.processRefund = async (req, res, next) => {
  try {
    const paymentId = req.params.id;
    const { amount: refundAmount, reason } = req.body;

    const payment = await Payment.findById(paymentId).populate('booking');
    if (!payment) {
      return next(new NotFoundError(`Payment not found with ID: ${paymentId}`, 404));
    }

    if (payment.status !== 'succeeded' && payment.status !== 'partially_refunded') {
        return next(new AppError(`Payment status is ${payment.status}, cannot refund.`, 400));
    }
    if (payment.refunds.some(r => r.status === 'succeeded' && r.amount.value === payment.amount.value)) {
        return next(new AppError('This payment has already been fully refunded.', 400));
    }

    const amountToRefund = refundAmount ? parseFloat(refundAmount) : payment.amount.value; // Full refund if amount not specified
    if (amountToRefund <= 0 || amountToRefund > payment.amount.value - payment.totalRefundedAmount()) {
        return next(new ValidationError('Invalid refund amount.', 400));
    }

    // --- MOCK REFUND GATEWAY INTERACTION ---
    // Example with Stripe:
    // const refund = await stripe.refunds.create({
    //   payment_intent: payment.gateway.response.id, // Assuming you store payment_intent ID
    //   amount: Math.round(amountToRefund * 100),
    //   reason: reason || 'requested_by_customer',
    // });

    const mockRefundTransactionId = `MOCK_REFUND_${Date.now()}`;
    const refundRecord = {
        amount: { value: amountToRefund, currency: payment.amount.currency },
        reason: reason || 'Admin processed refund',
        status: 'succeeded', // Assume success for mock
        transactionId: mockRefundTransactionId,
        gateway: { name: 'mock_gateway', response: { simulated: true, refundId: mockRefundTransactionId } },
        processedBy: req.user.id,
        processedAt: new Date()
    };

    payment.refunds.push(refundRecord);
    
    const totalRefunded = payment.totalRefundedAmount();
    if (totalRefunded >= payment.amount.value) {
        payment.status = 'refunded';
    } else {
        payment.status = 'partially_refunded';
    }
    payment.metadata.lastUpdatedAt = new Date();
    payment.metadata.updatedBy = req.user.id;
    await payment.save();

    // Update associated booking status if applicable
    if (payment.booking) {
        const booking = await Booking.findById(payment.booking._id);
        if (booking) {
            booking.status = 'cancelled'; // Or 'refunded', 'partially_refunded'
            booking.paymentStatus = payment.status;
            // Add cancellation/refund notes to booking
            booking.cancellation = booking.cancellation || {};
            booking.cancellation.reason = booking.cancellation.reason || `Refund processed: ${reason}`;
            booking.cancellation.refundedAmount = (booking.cancellation.refundedAmount || 0) + amountToRefund;
            booking.cancellation.cancelledAt = new Date();
            booking.cancellation.cancelledBy = req.user.id;
            await booking.save();
        }
    }

    // TODO: Send refund confirmation email

    logger.info('Refund processed successfully (mock)', { paymentId, refundAmount, adminUserId: req.user.id });
    res.status(200).json({
      success: true,
      message: 'Refund processed successfully.',
      data: payment
    });

  } catch (error) {
    logger.error('Error processing refund', { paymentId: req.params.id, error: error.message, stack: error.stack, adminUserId: req.user.id });
    // if (error.type === 'StripeInvalidRequestError') { // Example for Stripe errors
    //   return next(new AppError(`Refund failed: ${error.message}`, 400));
    // }
    if (error.name === 'ValidationError') {
        return next(new ValidationError(error.message));
    }
    next(new AppError('Server error while processing refund.', 500));
  }
};

// TODO: Endpoint for users to get their payment methods (e.g., saved cards from Stripe Customer object)
// TODO: Endpoint for updating payment status manually by admin (e.g., for bank transfers)