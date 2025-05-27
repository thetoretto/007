const mongoose = require('mongoose');
const { createLogger } = require('../utils/logger');

const logger = createLogger('TripModel');

const tripSchema = new mongoose.Schema({
  tripId: {
    type: String,
    unique: true,
    required: true
  },
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'User is required']
  },
  route: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Route',
    required: [true, 'Route is required']
  },
  booking: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Booking'
  },
  vehicle: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Vehicle'
  },
  driver: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Driver'
  },
  passengers: {
    count: {
      type: Number,
      required: true,
      min: 1
    },
    details: [{
      name: String,
      age: Number,
      phone: String,
      specialRequirements: String
    }]
  },
  schedule: {
    requestedDeparture: {
      type: Date,
      required: true
    },
    actualDeparture: Date,
    estimatedArrival: Date,
    actualArrival: Date,
    duration: Number // in seconds
  },
  pickup: {
    location: {
      hotpointId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Hotpoint'
      },
      coordinates: [Number], // [longitude, latitude]
      address: String,
      instructions: String
    },
    time: {
      scheduled: Date,
      actual: Date
    },
    status: {
      type: String,
      enum: ['pending', 'confirmed', 'arrived', 'completed', 'missed'],
      default: 'pending'
    }
  },
  dropoff: {
    location: {
      hotpointId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Hotpoint'
      },
      coordinates: [Number], // [longitude, latitude]
      address: String,
      instructions: String
    },
    time: {
      scheduled: Date,
      actual: Date
    },
    status: {
      type: String,
      enum: ['pending', 'confirmed', 'arrived', 'completed'],
      default: 'pending'
    }
  },
  waypoints: [{
    hotpointId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Hotpoint'
    },
    coordinates: [Number],
    address: String,
    order: Number,
    scheduledTime: Date,
    actualTime: Date,
    status: {
      type: String,
      enum: ['pending', 'arrived', 'completed', 'skipped'],
      default: 'pending'
    }
  }],
  pricing: {
    basePrice: {
      type: Number,
      required: true
    },
    additionalCharges: [{
      type: String,
      amount: Number,
      description: String
    }],
    discounts: [{
      type: String,
      amount: Number,
      description: String
    }],
    totalAmount: {
      type: Number,
      required: true
    },
    currency: {
      type: String,
      default: 'USD'
    },
    paymentStatus: {
      type: String,
      enum: ['pending', 'paid', 'failed', 'refunded', 'partial'],
      default: 'pending'
    }
  },
  status: {
    type: String,
    enum: [
      'requested',
      'confirmed',
      'assigned',
      'in_progress',
      'pickup_arrived',
      'passenger_onboard',
      'en_route',
      'arrived_destination',
      'completed',
      'cancelled',
      'no_show',
      'failed'
    ],
    default: 'requested'
  },
  tracking: {
    currentLocation: {
      coordinates: [Number], // [longitude, latitude]
      timestamp: Date,
      accuracy: Number
    },
    route: [{
      coordinates: [Number],
      timestamp: Date,
      speed: Number, // km/h
      heading: Number // degrees
    }],
    estimatedTimeOfArrival: Date,
    distanceRemaining: Number // meters
  },
  communication: {
    messages: [{
      from: {
        type: String,
        enum: ['user', 'driver', 'system'],
        required: true
      },
      message: String,
      timestamp: {
        type: Date,
        default: Date.now
      },
      type: {
        type: String,
        enum: ['text', 'location', 'image', 'system_notification'],
        default: 'text'
      }
    }],
    notifications: [{
      type: String,
      message: String,
      sentAt: Date,
      channels: [String] // ['sms', 'email', 'push']
    }]
  },
  feedback: {
    rating: {
      type: Number,
      min: 1,
      max: 5
    },
    comment: String,
    categories: [{
      category: String,
      rating: Number
    }],
    submittedAt: Date
  },
  cancellation: {
    cancelledBy: {
      type: String,
      enum: ['user', 'driver', 'admin', 'system']
    },
    reason: String,
    cancelledAt: Date,
    refundAmount: Number,
    refundStatus: {
      type: String,
      enum: ['pending', 'processed', 'failed', 'not_applicable']
    }
  },
  specialRequirements: {
    wheelchairAccessible: { type: Boolean, default: false },
    childSeat: { type: Boolean, default: false },
    petFriendly: { type: Boolean, default: false },
    extraLuggage: { type: Boolean, default: false },
    notes: String
  },
  metadata: {
    source: {
      type: String,
      enum: ['web', 'mobile', 'api', 'phone'],
      default: 'web'
    },
    userAgent: String,
    ipAddress: String,
    referenceNumber: String,
    externalId: String,
    tags: [String]
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Indexes
tripSchema.index({ tripId: 1 }, { unique: true });
tripSchema.index({ user: 1, createdAt: -1 });
tripSchema.index({ status: 1 });
tripSchema.index({ 'schedule.requestedDeparture': 1 });
tripSchema.index({ driver: 1, status: 1 });
tripSchema.index({ vehicle: 1, status: 1 });
tripSchema.index({ route: 1 });
tripSchema.index({ 'pricing.paymentStatus': 1 });
tripSchema.index({ createdAt: -1 });

// Virtual for trip duration
tripSchema.virtual('actualDuration').get(function() {
  if (this.schedule.actualDeparture && this.schedule.actualArrival) {
    return Math.floor((this.schedule.actualArrival - this.schedule.actualDeparture) / 1000);
  }
  return null;
});

// Virtual for trip progress
tripSchema.virtual('progress').get(function() {
  const statusProgress = {
    'requested': 0,
    'confirmed': 10,
    'assigned': 20,
    'in_progress': 30,
    'pickup_arrived': 40,
    'passenger_onboard': 50,
    'en_route': 75,
    'arrived_destination': 90,
    'completed': 100,
    'cancelled': 0,
    'no_show': 0,
    'failed': 0
  };
  
  return statusProgress[this.status] || 0;
});

// Virtual for estimated total time
tripSchema.virtual('estimatedDuration').get(function() {
  if (this.schedule.requestedDeparture && this.schedule.estimatedArrival) {
    return Math.floor((this.schedule.estimatedArrival - this.schedule.requestedDeparture) / 1000);
  }
  return null;
});

// Pre-save middleware to generate trip ID
tripSchema.pre('save', function(next) {
  if (!this.tripId) {
    const timestamp = Date.now().toString(36);
    const random = Math.random().toString(36).substr(2, 5);
    this.tripId = `TRIP-${timestamp}-${random}`.toUpperCase();
  }
  next();
});

// Static method to find trips by user
tripSchema.statics.findByUser = function(userId, filters = {}) {
  const query = { user: userId, ...filters };
  return this.find(query)
    .populate('route user vehicle driver')
    .sort({ createdAt: -1 });
};

// Static method to find active trips
tripSchema.statics.findActive = function(filters = {}) {
  const activeStatuses = ['confirmed', 'assigned', 'in_progress', 'pickup_arrived', 'passenger_onboard', 'en_route'];
  const query = { status: { $in: activeStatuses }, ...filters };
  return this.find(query)
    .populate('route user vehicle driver')
    .sort({ 'schedule.requestedDeparture': 1 });
};

// Static method to find trips by driver
tripSchema.statics.findByDriver = function(driverId, filters = {}) {
  const query = { driver: driverId, ...filters };
  return this.find(query)
    .populate('route user vehicle')
    .sort({ 'schedule.requestedDeparture': 1 });
};

// Method to update status
tripSchema.methods.updateStatus = function(newStatus, metadata = {}) {
  const oldStatus = this.status;
  this.status = newStatus;
  
  // Add system message for status change
  this.communication.messages.push({
    from: 'system',
    message: `Trip status changed from ${oldStatus} to ${newStatus}`,
    type: 'system_notification',
    timestamp: new Date()
  });
  
  // Update timestamps based on status
  const now = new Date();
  switch (newStatus) {
    case 'in_progress':
      if (!this.schedule.actualDeparture) {
        this.schedule.actualDeparture = now;
      }
      break;
    case 'pickup_arrived':
      this.pickup.time.actual = now;
      this.pickup.status = 'arrived';
      break;
    case 'passenger_onboard':
      this.pickup.status = 'completed';
      break;
    case 'arrived_destination':
      this.dropoff.time.actual = now;
      this.dropoff.status = 'arrived';
      break;
    case 'completed':
      if (!this.schedule.actualArrival) {
        this.schedule.actualArrival = now;
      }
      this.dropoff.status = 'completed';
      break;
  }
  
  logger.info('Trip status updated', {
    tripId: this.tripId,
    oldStatus,
    newStatus,
    userId: this.user,
    ...metadata
  });
  
  return this.save();
};

// Method to update location
tripSchema.methods.updateLocation = function(coordinates, metadata = {}) {
  this.tracking.currentLocation = {
    coordinates,
    timestamp: new Date(),
    accuracy: metadata.accuracy || null
  };
  
  // Add to route history
  this.tracking.route.push({
    coordinates,
    timestamp: new Date(),
    speed: metadata.speed || null,
    heading: metadata.heading || null
  });
  
  // Keep only last 100 location points to prevent document from growing too large
  if (this.tracking.route.length > 100) {
    this.tracking.route = this.tracking.route.slice(-100);
  }
  
  return this.save();
};

// Method to add message
tripSchema.methods.addMessage = function(from, message, type = 'text') {
  this.communication.messages.push({
    from,
    message,
    type,
    timestamp: new Date()
  });
  
  return this.save();
};

// Method to calculate final price
tripSchema.methods.calculateFinalPrice = function() {
  let total = this.pricing.basePrice;
  
  // Add additional charges
  if (this.pricing.additionalCharges) {
    total += this.pricing.additionalCharges.reduce((sum, charge) => sum + charge.amount, 0);
  }
  
  // Subtract discounts
  if (this.pricing.discounts) {
    total -= this.pricing.discounts.reduce((sum, discount) => sum + discount.amount, 0);
  }
  
  this.pricing.totalAmount = Math.max(0, total); // Ensure non-negative
  return this.pricing.totalAmount;
};

// Method to cancel trip
tripSchema.methods.cancel = function(cancelledBy, reason, refundAmount = 0) {
  this.status = 'cancelled';
  this.cancellation = {
    cancelledBy,
    reason,
    cancelledAt: new Date(),
    refundAmount,
    refundStatus: refundAmount > 0 ? 'pending' : 'not_applicable'
  };
  
  // Add cancellation message
  this.communication.messages.push({
    from: 'system',
    message: `Trip cancelled by ${cancelledBy}. Reason: ${reason}`,
    type: 'system_notification',
    timestamp: new Date()
  });
  
  logger.info('Trip cancelled', {
    tripId: this.tripId,
    cancelledBy,
    reason,
    refundAmount
  });
  
  return this.save();
};

// Method to submit feedback
tripSchema.methods.submitFeedback = function(rating, comment, categories = []) {
  this.feedback = {
    rating,
    comment,
    categories,
    submittedAt: new Date()
  };
  
  logger.info('Trip feedback submitted', {
    tripId: this.tripId,
    rating,
    userId: this.user
  });
  
  return this.save();
};

// Method to check if trip can be cancelled
tripSchema.methods.canBeCancelled = function() {
  const nonCancellableStatuses = ['completed', 'cancelled', 'no_show', 'failed'];
  return !nonCancellableStatuses.includes(this.status);
};

// Method to check if trip is in progress
tripSchema.methods.isInProgress = function() {
  const inProgressStatuses = ['assigned', 'in_progress', 'pickup_arrived', 'passenger_onboard', 'en_route'];
  return inProgressStatuses.includes(this.status);
};

module.exports = mongoose.model('Trip', tripSchema);