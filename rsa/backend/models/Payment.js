const mongoose = require('mongoose');
const { createLogger } = require('../utils/logger');

const logger = createLogger('PaymentModel');

const paymentSchema = new mongoose.Schema({
  paymentId: {
    type: String,
    unique: true,
    required: true,
    default: () => `PAY-${Date.now().toString(36)}-${Math.random().toString(36).substr(2, 9)}`.toUpperCase()
  },
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'User is required for payment']
  },
  booking: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Booking',
    required: [true, 'Booking is required for payment']
  },
  trip: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Trip' // Optional, can be derived from booking
  },
  amount: {
    value: {
      type: Number,
      required: [true, 'Payment amount is required'],
      min: [0.01, 'Payment amount must be positive']
    },
    currency: {
      type: String,
      required: [true, 'Currency is required'],
      default: 'USD',
      enum: ['USD', 'EUR', 'GBP', 'INR', 'CAD', 'AUD'] // Add more as needed
    }
  },
  paymentMethod: {
    type: {
      type: String,
      enum: ['card', 'paypal', 'bank_transfer', 'wallet', 'cash_on_delivery', 'other'],
      required: [true, 'Payment method type is required']
    },
    details: {
      // For card payments
      cardBrand: String, // e.g., 'Visa', 'Mastercard'
      last4: String, // Last 4 digits of the card
      expiryMonth: Number,
      expiryYear: Number,
      // For PayPal
      paypalEmail: String,
      paypalTransactionId: String,
      // For bank transfer
      bankName: String,
      accountNumberLast4: String,
      transactionReference: String,
      // For wallet
      walletProvider: String,
      walletTransactionId: String,
      // General
      token: String, // Payment gateway token if applicable
      isDefault: { type: Boolean, default: false }
    }
  },
  status: {
    type: String,
    enum: ['pending', 'processing', 'succeeded', 'failed', 'cancelled', 'refunded', 'partially_refunded', 'requires_action', 'disputed'],
    default: 'pending',
    required: true
  },
  transactionId: {
    type: String, // ID from the payment gateway (e.g., Stripe charge ID)
    unique: true,
    sparse: true // Allows multiple nulls, but unique if present
  },
  gateway: {
    name: {
      type: String, // e.g., 'stripe', 'paypal', 'braintree'
      required: [true, 'Payment gateway name is required']
    },
    response: mongoose.Schema.Types.Mixed, // Store raw response from gateway for debugging
    fee: {
      value: { type: Number, default: 0 },
      currency: { type: String, default: 'USD' }
    }
  },
  description: String, // Optional description for the payment
  billingAddress: {
    street: String,
    city: String,
    state: String,
    postalCode: String,
    country: String
  },
  refunds: [{
    refundId: {
      type: String,
      unique: true,
      sparse: true
    },
    amount: {
      value: Number,
      currency: String
    },
    reason: String,
    status: {
      type: String,
      enum: ['pending', 'succeeded', 'failed']
    },
    gatewayRefundId: String,
    processedAt: Date,
    createdAt: { type: Date, default: Date.now }
  }],
  metadata: {
    ipAddress: String,
    userAgent: String,
    initiatedBy: { type: String, enum: ['user', 'system', 'admin'] },
    notes: String,
    tags: [String]
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Indexes
paymentSchema.index({ paymentId: 1 }, { unique: true });
paymentSchema.index({ user: 1 });
paymentSchema.index({ booking: 1 });
paymentSchema.index({ trip: 1 });
paymentSchema.index({ status: 1 });
paymentSchema.index({ transactionId: 1 }, { unique: true, sparse: true });
paymentSchema.index({ 'paymentMethod.type': 1 });
paymentSchema.index({ 'gateway.name': 1 });
paymentSchema.index({ createdAt: -1 });

// Virtuals
paymentSchema.virtual('isSuccessful').get(function() {
  return this.status === 'succeeded';
});

paymentSchema.virtual('isRefunded').get(function() {
  return ['refunded', 'partially_refunded'].includes(this.status);
});

paymentSchema.virtual('totalRefundedAmount').get(function() {
  if (!this.refunds || this.refunds.length === 0) return 0;
  return this.refunds
    .filter(r => r.status === 'succeeded')
    .reduce((sum, refund) => sum + (refund.amount.value || 0), 0);
});

// Pre-save middleware
paymentSchema.pre('save', function(next) {
  if (this.isModified('status')) {
    logger.info('Payment status changed', {
      paymentId: this.paymentId,
      bookingId: this.booking,
      oldStatus: this._previousStatus, // Requires a custom pre-save hook to capture previous status if needed
      newStatus: this.status,
      transactionId: this.transactionId
    });
  }
  // Ensure trip is populated if booking is present and trip is not set
  if (this.booking && !this.trip && this.isNew) {
    mongoose.model('Booking').findById(this.booking).select('trip').lean()
      .then(bookingDoc => {
        if (bookingDoc && bookingDoc.trip) {
          this.trip = bookingDoc.trip;
        }
        next();
      })
      .catch(err => {
        logger.error('Error populating trip from booking in payment pre-save', { error: err, bookingId: this.booking });
        next(err); // Or handle error appropriately
      });
  } else {
    next();
  }
});

// Static methods
paymentSchema.statics.findByBookingId = function(bookingId) {
  return this.find({ booking: bookingId }).sort({ createdAt: -1 });
};

paymentSchema.statics.findByUserId = function(userId, queryParams = {}) {
  const { limit = 10, skip = 0, status } = queryParams;
  const filter = { user: userId };
  if (status) filter.status = status;
  return this.find(filter)
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(limit);
};

paymentSchema.statics.calculateTotalRevenue = async function(startDate, endDate, currency = 'USD') {
  const matchStage = {
    status: 'succeeded',
    'amount.currency': currency,
  };
  if (startDate) matchStage.createdAt = { ...matchStage.createdAt, $gte: new Date(startDate) };
  if (endDate) matchStage.createdAt = { ...matchStage.createdAt, $lte: new Date(endDate) };

  const result = await this.aggregate([
    { $match: matchStage },
    {
      $group: {
        _id: '$amount.currency',
        totalRevenue: { $sum: '$amount.value' },
        count: { $sum: 1 }
      }
    }
  ]);
  return result.length > 0 ? result[0] : { _id: currency, totalRevenue: 0, count: 0 };
};

// Instance methods
paymentSchema.methods.markAsSucceeded = function(transactionId, gatewayResponse = null) {
  this.status = 'succeeded';
  this.transactionId = transactionId;
  if (gatewayResponse) this.gateway.response = gatewayResponse;
  logger.info('Payment marked as succeeded', { paymentId: this.paymentId, transactionId });
  return this.save();
};

paymentSchema.methods.markAsFailed = function(reason, gatewayResponse = null) {
  this.status = 'failed';
  if (reason) this.description = (this.description ? this.description + '; ' : '') + `Failure: ${reason}`;
  if (gatewayResponse) this.gateway.response = gatewayResponse;
  logger.warn('Payment marked as failed', { paymentId: this.paymentId, reason });
  return this.save();
};

paymentSchema.methods.initiateRefund = async function(amountToRefund, reason, gatewayRefundId = null) {
  if (this.status !== 'succeeded' && this.status !== 'partially_refunded') {
    throw new Error('Cannot refund payment that is not succeeded or partially refunded.');
  }
  if (amountToRefund <= 0) {
    throw new Error('Refund amount must be positive.');
  }
  const totalRefunded = this.totalRefundedAmount;
  if (amountToRefund > (this.amount.value - totalRefunded)) {
    throw new Error('Refund amount exceeds refundable balance.');
  }

  const refund = {
    refundId: `REF-${Date.now().toString(36)}-${Math.random().toString(36).substr(2, 7)}`.toUpperCase(),
    amount: {
      value: amountToRefund,
      currency: this.amount.currency
    },
    reason,
    status: 'pending', // Or 'succeeded' if processed immediately by gateway
    gatewayRefundId,
    createdAt: new Date()
  };
  this.refunds.push(refund);

  // Update payment status
  if ((totalRefunded + amountToRefund) >= this.amount.value) {
    this.status = 'refunded';
  } else {
    this.status = 'partially_refunded';
  }
  
  logger.info('Refund initiated for payment', {
    paymentId: this.paymentId,
    refundId: refund.refundId,
    amount: amountToRefund
  });
  
  // In a real scenario, you would call the payment gateway's refund API here.
  // For now, we'll assume it's successful if gatewayRefundId is provided or handled externally.
  if (gatewayRefundId) {
     const createdRefund = this.refunds.find(r => r.refundId === refund.refundId);
     if(createdRefund) createdRefund.status = 'succeeded'; // Simulate successful gateway refund
  }

  return this.save();
};

module.exports = mongoose.model('Payment', paymentSchema);