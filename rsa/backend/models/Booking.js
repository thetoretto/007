const mongoose = require('mongoose');
const { createLogger } = require('../utils/logger');

const logger = createLogger('BookingModel');

const bookingSchema = new mongoose.Schema({
  bookingId: {
    type: String,
    unique: true,
    required: true
  },
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'User is required']
  },
  trip: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Trip',
    required: [true, 'Trip is required']
  },
  route: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Route',
    required: [true, 'Route is required']
  },
  passengers: {
    count: {
      type: Number,
      required: true,
      min: 1,
      max: 8
    },
    details: [{
      name: {
        type: String,
        required: true,
        trim: true
      },
      age: {
        type: Number,
        min: 0,
        max: 120
      },
      phone: String,
      email: String,
      specialRequirements: String,
      seatPreference: {
        type: String,
        enum: ['window', 'aisle', 'any'],
        default: 'any'
      }
    }]
  },
  schedule: {
    departureDate: {
      type: Date,
      required: true
    },
    departureTime: {
      type: String,
      required: true,
      match: [/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, 'Invalid time format (HH:MM)']
    },
    returnDate: Date,
    returnTime: String,
    isRoundTrip: {
      type: Boolean,
      default: false
    }
  },
  pickup: {
    hotpoint: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Hotpoint',
      required: true
    },
    address: String,
    coordinates: [Number], // [longitude, latitude]
    instructions: String,
    contactPerson: {
      name: String,
      phone: String
    }
  },
  dropoff: {
    hotpoint: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Hotpoint',
      required: true
    },
    address: String,
    coordinates: [Number], // [longitude, latitude]
    instructions: String,
    contactPerson: {
      name: String,
      phone: String
    }
  },
  waypoints: [{
    hotpoint: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Hotpoint'
    },
    address: String,
    coordinates: [Number],
    stopDuration: {
      type: Number,
      default: 0 // minutes
    },
    purpose: String,
    order: Number
  }],
  pricing: {
    basePrice: {
      type: Number,
      required: true,
      min: 0
    },
    passengerPrice: {
      type: Number,
      required: true,
      min: 0
    },
    additionalCharges: [{
      type: {
        type: String,
        enum: ['luggage', 'pet', 'child_seat', 'wheelchair', 'priority', 'insurance', 'fuel_surcharge', 'toll', 'other'],
        required: true
      },
      amount: {
        type: Number,
        required: true
      },
      description: String
    }],
    discounts: [{
      type: {
        type: String,
        enum: ['early_bird', 'loyalty', 'group', 'promo_code', 'referral', 'seasonal', 'other'],
        required: true
      },
      amount: {
        type: Number,
        required: true
      },
      code: String,
      description: String
    }],
    taxes: [{
      type: {
        type: String,
        enum: ['vat', 'service_tax', 'city_tax', 'other'],
        required: true
      },
      rate: Number, // percentage
      amount: Number,
      description: String
    }],
    totalAmount: {
      type: Number,
      required: true,
      min: 0
    },
    currency: {
      type: String,
      default: 'USD',
      enum: ['USD', 'EUR', 'GBP', 'JPY', 'CNY', 'INR', 'BRL', 'CAD', 'AUD']
    }
  },
  payment: {
    method: {
      type: String,
      enum: ['credit_card', 'debit_card', 'paypal', 'apple_pay', 'google_pay', 'bank_transfer', 'cash', 'wallet'],
      required: true
    },
    status: {
      type: String,
      enum: ['pending', 'processing', 'completed', 'failed', 'cancelled', 'refunded', 'partial_refund'],
      default: 'pending'
    },
    transactionId: String,
    paymentIntentId: String, // Stripe payment intent ID
    paidAt: Date,
    refundAmount: {
      type: Number,
      default: 0
    },
    refundedAt: Date,
    paymentDetails: {
      last4: String,
      brand: String,
      expiryMonth: Number,
      expiryYear: Number
    }
  },
  status: {
    type: String,
    enum: [
      'pending',
      'confirmed',
      'paid',
      'assigned',
      'in_progress',
      'completed',
      'cancelled',
      'no_show',
      'refunded'
    ],
    default: 'pending'
  },
  confirmation: {
    code: String,
    confirmedAt: Date,
    confirmedBy: {
      type: String,
      enum: ['user', 'admin', 'system'],
      default: 'system'
    }
  },
  specialRequirements: {
    wheelchairAccessible: { type: Boolean, default: false },
    childSeat: {
      required: { type: Boolean, default: false },
      count: { type: Number, default: 0 },
      ageGroups: [{
        type: String,
        enum: ['infant', 'toddler', 'child']
      }]
    },
    petFriendly: {
      required: { type: Boolean, default: false },
      petDetails: [{
        type: String, // 'dog', 'cat', etc.
        size: String, // 'small', 'medium', 'large'
        weight: Number,
        name: String
      }]
    },
    luggage: {
      extraLuggage: { type: Boolean, default: false },
      pieces: { type: Number, default: 0 },
      weight: { type: Number, default: 0 }, // kg
      dimensions: String
    },
    mobility: {
      assistance: { type: Boolean, default: false },
      equipment: [String] // ['walker', 'crutches', 'wheelchair']
    },
    dietary: [String], // for longer trips with meals
    other: String
  },
  communication: {
    preferredLanguage: {
      type: String,
      default: 'en'
    },
    contactPreferences: {
      email: { type: Boolean, default: true },
      sms: { type: Boolean, default: true },
      phone: { type: Boolean, default: false },
      whatsapp: { type: Boolean, default: false }
    },
    notifications: [{
      type: {
        type: String,
        enum: ['booking_confirmed', 'payment_received', 'trip_assigned', 'driver_assigned', 'trip_started', 'trip_completed', 'cancellation', 'reminder'],
        required: true
      },
      message: String,
      sentAt: Date,
      channel: {
        type: String,
        enum: ['email', 'sms', 'push', 'whatsapp']
      },
      status: {
        type: String,
        enum: ['sent', 'delivered', 'failed'],
        default: 'sent'
      }
    }]
  },
  cancellation: {
    cancelledBy: {
      type: String,
      enum: ['user', 'admin', 'system', 'driver']
    },
    reason: {
      type: String,
      enum: [
        'user_request',
        'payment_failed',
        'no_driver_available',
        'weather_conditions',
        'vehicle_breakdown',
        'route_unavailable',
        'emergency',
        'duplicate_booking',
        'other'
      ]
    },
    description: String,
    cancelledAt: Date,
    refundPolicy: {
      type: String,
      enum: ['full_refund', 'partial_refund', 'no_refund', 'credit_note']
    },
    refundAmount: Number,
    cancellationFee: Number
  },
  feedback: {
    rating: {
      overall: { type: Number, min: 1, max: 5 },
      driver: { type: Number, min: 1, max: 5 },
      vehicle: { type: Number, min: 1, max: 5 },
      punctuality: { type: Number, min: 1, max: 5 },
      comfort: { type: Number, min: 1, max: 5 },
      safety: { type: Number, min: 1, max: 5 }
    },
    comment: String,
    wouldRecommend: Boolean,
    submittedAt: Date
  },
  metadata: {
    source: {
      type: String,
      enum: ['web', 'mobile', 'api', 'phone', 'admin'],
      default: 'web'
    },
    userAgent: String,
    ipAddress: String,
    sessionId: String,
    referrer: String,
    campaignId: String,
    promoCode: String,
    affiliateId: String,
    bookingChannel: String,
    deviceInfo: {
      platform: String,
      version: String,
      model: String
    },
    geoLocation: {
      country: String,
      region: String,
      city: String,
      coordinates: [Number]
    },
    tags: [String],
    notes: String // Admin notes
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Indexes
bookingSchema.index({ bookingId: 1 }, { unique: true });
bookingSchema.index({ user: 1, createdAt: -1 });
bookingSchema.index({ trip: 1 });
bookingSchema.index({ route: 1 });
bookingSchema.index({ status: 1 });
bookingSchema.index({ 'schedule.departureDate': 1 });
bookingSchema.index({ 'payment.status': 1 });
bookingSchema.index({ 'confirmation.code': 1 });
bookingSchema.index({ createdAt: -1 });

// Virtual for total passengers
bookingSchema.virtual('totalPassengers').get(function() {
  return this.passengers.count;
});

// Virtual for booking reference
bookingSchema.virtual('reference').get(function() {
  return this.confirmation.code || this.bookingId;
});

// Virtual for is cancellable
bookingSchema.virtual('isCancellable').get(function() {
  const nonCancellableStatuses = ['completed', 'cancelled', 'refunded', 'no_show'];
  const departureTime = new Date(`${this.schedule.departureDate.toDateString()} ${this.schedule.departureTime}`);
  const now = new Date();
  const hoursUntilDeparture = (departureTime - now) / (1000 * 60 * 60);
  
  return !nonCancellableStatuses.includes(this.status) && hoursUntilDeparture > 2; // Can cancel up to 2 hours before
});

// Virtual for refund eligibility
bookingSchema.virtual('refundEligible').get(function() {
  if (this.payment.status !== 'completed') return false;
  
  const departureTime = new Date(`${this.schedule.departureDate.toDateString()} ${this.schedule.departureTime}`);
  const now = new Date();
  const hoursUntilDeparture = (departureTime - now) / (1000 * 60 * 60);
  
  if (hoursUntilDeparture > 24) return { eligible: true, percentage: 100 };
  if (hoursUntilDeparture > 12) return { eligible: true, percentage: 75 };
  if (hoursUntilDeparture > 2) return { eligible: true, percentage: 50 };
  
  return { eligible: false, percentage: 0 };
});

// Pre-save middleware to generate booking ID
bookingSchema.pre('save', function(next) {
  if (!this.bookingId) {
    const timestamp = Date.now().toString(36);
    const random = Math.random().toString(36).substr(2, 5);
    this.bookingId = `BK-${timestamp}-${random}`.toUpperCase();
  }
  
  // Generate confirmation code if not exists
  if (!this.confirmation.code) {
    this.confirmation.code = Math.random().toString(36).substr(2, 8).toUpperCase();
  }
  
  next();
});

// Pre-save middleware to calculate total amount
bookingSchema.pre('save', function(next) {
  if (this.isModified('pricing')) {
    this.calculateTotalAmount();
  }
  next();
});

// Static method to find by user
bookingSchema.statics.findByUser = function(userId, filters = {}) {
  const query = { user: userId, ...filters };
  return this.find(query)
    .populate('route pickup.hotpoint dropoff.hotpoint')
    .sort({ createdAt: -1 });
};

// Static method to find by confirmation code
bookingSchema.statics.findByConfirmationCode = function(code) {
  return this.findOne({ 'confirmation.code': code })
    .populate('user route pickup.hotpoint dropoff.hotpoint');
};

// Static method to find upcoming bookings
bookingSchema.statics.findUpcoming = function(filters = {}) {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  
  const query = {
    'schedule.departureDate': { $gte: today },
    status: { $in: ['confirmed', 'paid', 'assigned'] },
    ...filters
  };
  
  return this.find(query)
    .populate('user route pickup.hotpoint dropoff.hotpoint')
    .sort({ 'schedule.departureDate': 1, 'schedule.departureTime': 1 });
};

// Method to calculate total amount
bookingSchema.methods.calculateTotalAmount = function() {
  let total = this.pricing.basePrice + (this.pricing.passengerPrice * (this.passengers.count - 1));
  
  // Add additional charges
  if (this.pricing.additionalCharges) {
    total += this.pricing.additionalCharges.reduce((sum, charge) => sum + charge.amount, 0);
  }
  
  // Subtract discounts
  if (this.pricing.discounts) {
    total -= this.pricing.discounts.reduce((sum, discount) => sum + discount.amount, 0);
  }
  
  // Add taxes
  if (this.pricing.taxes) {
    const taxAmount = this.pricing.taxes.reduce((sum, tax) => {
      if (tax.rate) {
        return sum + (total * tax.rate / 100);
      }
      return sum + (tax.amount || 0);
    }, 0);
    total += taxAmount;
  }
  
  this.pricing.totalAmount = Math.max(0, Math.round(total * 100) / 100); // Round to 2 decimal places
  return this.pricing.totalAmount;
};

// Method to confirm booking
bookingSchema.methods.confirm = function(confirmedBy = 'system') {
  this.status = 'confirmed';
  this.confirmation.confirmedAt = new Date();
  this.confirmation.confirmedBy = confirmedBy;
  
  // Add notification
  this.communication.notifications.push({
    type: 'booking_confirmed',
    message: `Your booking ${this.bookingId} has been confirmed`,
    sentAt: new Date(),
    channel: 'email'
  });
  
  logger.info('Booking confirmed', {
    bookingId: this.bookingId,
    userId: this.user,
    confirmedBy
  });
  
  return this.save();
};

// Method to cancel booking
bookingSchema.methods.cancel = function(cancelledBy, reason, description = '') {
  const refundInfo = this.refundEligible;
  
  this.status = 'cancelled';
  this.cancellation = {
    cancelledBy,
    reason,
    description,
    cancelledAt: new Date(),
    refundPolicy: refundInfo.eligible ? (refundInfo.percentage === 100 ? 'full_refund' : 'partial_refund') : 'no_refund',
    refundAmount: refundInfo.eligible ? (this.pricing.totalAmount * refundInfo.percentage / 100) : 0,
    cancellationFee: refundInfo.eligible ? (this.pricing.totalAmount * (100 - refundInfo.percentage) / 100) : this.pricing.totalAmount
  };
  
  // Add notification
  this.communication.notifications.push({
    type: 'cancellation',
    message: `Your booking ${this.bookingId} has been cancelled`,
    sentAt: new Date(),
    channel: 'email'
  });
  
  logger.info('Booking cancelled', {
    bookingId: this.bookingId,
    userId: this.user,
    cancelledBy,
    reason,
    refundAmount: this.cancellation.refundAmount
  });
  
  return this.save();
};

// Method to update payment status
bookingSchema.methods.updatePaymentStatus = function(status, transactionData = {}) {
  this.payment.status = status;
  
  if (transactionData.transactionId) {
    this.payment.transactionId = transactionData.transactionId;
  }
  
  if (transactionData.paymentIntentId) {
    this.payment.paymentIntentId = transactionData.paymentIntentId;
  }
  
  if (status === 'completed') {
    this.payment.paidAt = new Date();
    this.status = 'paid';
    
    // Add notification
    this.communication.notifications.push({
      type: 'payment_received',
      message: `Payment received for booking ${this.bookingId}`,
      sentAt: new Date(),
      channel: 'email'
    });
  }
  
  logger.info('Payment status updated', {
    bookingId: this.bookingId,
    userId: this.user,
    status,
    transactionId: transactionData.transactionId
  });
  
  return this.save();
};

// Method to submit feedback
bookingSchema.methods.submitFeedback = function(feedbackData) {
  this.feedback = {
    ...feedbackData,
    submittedAt: new Date()
  };
  
  logger.info('Feedback submitted', {
    bookingId: this.bookingId,
    userId: this.user,
    rating: feedbackData.rating?.overall
  });
  
  return this.save();
};

// Method to add notification
bookingSchema.methods.addNotification = function(type, message, channel = 'email') {
  this.communication.notifications.push({
    type,
    message,
    sentAt: new Date(),
    channel,
    status: 'sent'
  });
  
  return this.save();
};

module.exports = mongoose.model('Booking', bookingSchema);