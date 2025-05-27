const mongoose = require('mongoose');
// Removed unused bcrypt import
const { createLogger } = require('../utils/logger');

const logger = createLogger('DriverModel');

const driverSchema = new mongoose.Schema({
  driverId: {
    type: String,
    unique: true,
    required: true
  },
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'User account is required'],
    unique: true
  },
  license: {
    number: {
      type: String,
      required: [true, 'License number is required'],
      unique: true,
      trim: true
    },
    issuingCountry: {
      type: String,
      required: [true, 'Issuing country is required'],
      default: 'USA'
    },
    issuingState: {
      type: String,
      required: [true, 'Issuing state is required']
    },
    expiryDate: {
      type: Date,
      required: [true, 'License expiry date is required']
    },
    class: {
      type: String,
      enum: ['Class A', 'Class B', 'Class C', 'Class D', 'Motorcycle', 'Commercial', 'Other'],
      default: 'Class D'
    },
    endorsements: [String], // e.g., 'H' for Hazmat, 'P' for Passenger
    restrictions: [String],
    scanUrl: String,
    scanPublicId: String
  },
  vehicle: {
    assignedVehicle: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Vehicle'
    },
    assignmentHistory: [{
      vehicle: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Vehicle'
      },
      assignedAt: Date,
      unassignedAt: Date
    }],
    preferredTypes: [String] // e.g., 'sedan', 'suv'
  },
  availability: {
    status: {
      type: String,
      enum: ['available', 'on_trip', 'offline', 'unavailable', 'break'],
      default: 'offline'
    },
    lastSeen: Date,
    currentLocation: {
      coordinates: [Number], // [longitude, latitude]
      address: String,
      timestamp: Date
    },
    workingHours: {
      startTime: String, // HH:MM
      endTime: String,   // HH:MM
      days: [String]    // ['Monday', 'Tuesday', ...]
    },
    serviceArea: {
      type: {
        type: String,
        enum: ['Point', 'Polygon'],
        default: 'Point'
      },
      coordinates: { type: mongoose.Schema.Types.Mixed }, // For Point: [lng, lat], For Polygon: [[[lng, lat], ...]]
      radius: Number // in kilometers, if type is Point
    }
  },
  performance: {
    rating: {
      average: { type: Number, default: 0, min: 0, max: 5 },
      totalRatings: { type: Number, default: 0 },
      breakdown: {
        punctuality: { type: Number, default: 0 },
        safety: { type: Number, default: 0 },
        service: { type: Number, default: 0 },
        drivingSkill: { type: Number, default: 0 }
      }
    },
    completionRate: { type: Number, default: 0 }, // Percentage of completed trips
    acceptanceRate: { type: Number, default: 0 }, // Percentage of accepted trip requests
    cancellationRate: { type: Number, default: 0 }, // Percentage of trips cancelled by driver
    totalTrips: { type: Number, default: 0 },
    totalDistance: { type: Number, default: 0 }, // in kilometers
    totalHoursDriven: { type: Number, default: 0 },
    incidents: [{
      type: {
        type: String,
        enum: ['accident', 'traffic_violation', 'complaint', 'commendation']
      },
      description: String,
      date: Date,
      reportId: String,
      resolved: { type: Boolean, default: false }
    }]
  },
  documents: {
    backgroundCheck: {
      status: {
        type: String,
        enum: ['pending', 'approved', 'rejected', 'expired']
      },
      reportId: String,
      checkDate: Date,
      expiryDate: Date,
      provider: String
    },
    medicalCertificate: {
      isValid: Boolean,
      issueDate: Date,
      expiryDate: Date,
      scanUrl: String,
      scanPublicId: String
    },
    trainingCertificates: [{
      name: String,
      issuer: String,
      issueDate: Date,
      expiryDate: Date,
      scanUrl: String,
      scanPublicId: String
    }]
  },
  bankDetails: {
    accountHolderName: String,
    accountNumber: String,
    bankName: String,
    branchCode: String, // e.g., Swift, IBAN, Sort Code
    routingNumber: String
  },
  emergencyContact: {
    name: String,
    relationship: String,
    phone: String
  },
  status: {
    type: String,
    enum: ['pending_approval', 'active', 'inactive', 'suspended', 'rejected', 'on_boarding'],
    default: 'pending_approval'
  },
  metadata: {
    applicationDate: {
      type: Date,
      default: Date.now
    },
    approvedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User' // Admin user
    },
    approvalDate: Date,
    onboardingCompleted: { type: Boolean, default: false },
    notes: String,
    tags: [String]
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Indexes
driverSchema.index({ driverId: 1 }, { unique: true });
driverSchema.index({ user: 1 }, { unique: true });
driverSchema.index({ 'license.number': 1 }, { unique: true });
driverSchema.index({ status: 1 });
driverSchema.index({ 'availability.status': 1 });
driverSchema.index({ 'availability.currentLocation.coordinates': '2dsphere' }); // For geospatial queries
driverSchema.index({ 'performance.rating.average': -1 });
driverSchema.index({ createdAt: -1 });

// Virtual for driver's full name (from User model)
driverSchema.virtual('fullName', {
  ref: 'User',
  localField: 'user',
  foreignField: '_id',
  justOne: true,
  get: function(user) {
    return user ? `${user.profile.firstName} ${user.profile.lastName}` : null;
  }
});

// Virtual for driver's email (from User model)
driverSchema.virtual('email', {
  ref: 'User',
  localField: 'user',
  foreignField: '_id',
  justOne: true,
  get: function(user) {
    return user ? user.email : null;
  }
});

// Virtual for license validity
driverSchema.virtual('isLicenseValid').get(function() {
  return this.license.expiryDate && new Date(this.license.expiryDate) > new Date();
});

// Virtual for years of experience (assuming applicationDate is start of driving career for platform)
driverSchema.virtual('yearsOfExperience').get(function() {
  if (!this.metadata.applicationDate) return 0;
  const diff = Date.now() - new Date(this.metadata.applicationDate).getTime();
  return Math.floor(diff / (1000 * 60 * 60 * 24 * 365.25));
});

// Pre-save middleware to generate driver ID
driverSchema.pre('save', function(next) {
  if (!this.driverId) {
    const timestamp = Date.now().toString(36);
    const random = Math.random().toString(36).substr(2, 5);
    this.driverId = `DRV-${timestamp}-${random}`.toUpperCase();
  }
  next();
});

// Static method to find available drivers
driverSchema.statics.findAvailable = function(filters = {}) {
  const query = {
    status: 'active',
    'availability.status': 'available',
    ...filters
  };
  return this.find(query)
    .populate('user', 'profile.firstName profile.lastName email profile.phone profile.avatar')
    .populate('vehicle.assignedVehicle', 'make model year registration.plateNumber');
};

// Static method to find drivers by location
driverSchema.statics.findNear = function(coordinates, maxDistanceKm = 10) {
  return this.find({
    status: 'active',
    'availability.status': 'available',
    'availability.currentLocation.coordinates': {
      $nearSphere: {
        $geometry: {
          type: 'Point',
          coordinates: coordinates // [longitude, latitude]
        },
        $maxDistance: maxDistanceKm * 1000 // Convert km to meters
      }
    }
  })
  .populate('user', 'profile.firstName profile.lastName email profile.phone profile.avatar')
  .populate('vehicle.assignedVehicle', 'make model year registration.plateNumber');
};

// Method to update availability status
driverSchema.methods.updateAvailability = function(status, location = null) {
  this.availability.status = status;
  this.availability.lastSeen = new Date();
  if (location && location.coordinates) {
    this.availability.currentLocation = {
      coordinates: location.coordinates,
      address: location.address || null,
      timestamp: new Date()
    };
  }
  
  logger.info('Driver availability updated', {
    driverId: this.driverId,
    status,
    location: location ? location.coordinates : null
  });
  
  return this.save();
};

// Method to assign vehicle
driverSchema.methods.assignVehicle = function(vehicleId) {
  if (this.vehicle.assignedVehicle) {
    // Log unassignment of previous vehicle
    const prevAssignment = this.vehicle.assignmentHistory.find(h => h.vehicle.equals(this.vehicle.assignedVehicle) && !h.unassignedAt);
    if (prevAssignment) {
      prevAssignment.unassignedAt = new Date();
    }
  }
  
  this.vehicle.assignedVehicle = vehicleId;
  this.vehicle.assignmentHistory.push({
    vehicle: vehicleId,
    assignedAt: new Date()
  });
  
  logger.info('Vehicle assigned to driver', {
    driverId: this.driverId,
    vehicleId
  });
  
  return this.save();
};

// Method to unassign vehicle
driverSchema.methods.unassignVehicle = function() {
  if (!this.vehicle.assignedVehicle) {
    return Promise.resolve(this);
  }
  
  const currentAssignment = this.vehicle.assignmentHistory.find(h => h.vehicle.equals(this.vehicle.assignedVehicle) && !h.unassignedAt);
  if (currentAssignment) {
    currentAssignment.unassignedAt = new Date();
  }
  
  const unassignedVehicleId = this.vehicle.assignedVehicle;
  this.vehicle.assignedVehicle = null;
  
  logger.info('Vehicle unassigned from driver', {
    driverId: this.driverId,
    vehicleId: unassignedVehicleId
  });
  
  return this.save();
};

// Method to update performance rating
driverSchema.methods.updateRating = function(newRating) {
  const totalRatings = this.performance.rating.totalRatings;
  const currentAverage = this.performance.rating.average;
  
  this.performance.rating.average = ((currentAverage * totalRatings) + newRating) / (totalRatings + 1);
  this.performance.rating.totalRatings += 1;
  
  // Potentially update breakdown ratings if provided
  // For simplicity, only overall average is updated here
  
  logger.info('Driver rating updated', {
    driverId: this.driverId,
    newRating,
    averageRating: this.performance.rating.average
  });
  
  return this.save();
};

// Method to add trip to history and update stats
driverSchema.methods.recordTrip = function(tripData) {
  this.performance.totalTrips += 1;
  this.performance.totalDistance += tripData.distance || 0;
  this.performance.totalHoursDriven += tripData.duration || 0; // Assuming duration in hours
  
  // Update completion/cancellation rates (simplified)
  if (tripData.status === 'completed') {
    // Recalculate completion rate
  } else if (tripData.status === 'cancelled' && tripData.cancelledBy === 'driver') {
    // Recalculate cancellation rate
  }
  
  logger.info('Trip recorded for driver', {
    driverId: this.driverId,
    tripId: tripData.tripId,
    status: tripData.status
  });
  
  return this.save();
};

// Method to update background check status
driverSchema.methods.updateBackgroundCheck = function(status, reportId, expiryDate, provider) {
  this.documents.backgroundCheck = {
    status,
    reportId,
    checkDate: new Date(),
    expiryDate,
    provider
  };
  
  logger.info('Driver background check updated', {
    driverId: this.driverId,
    status,
    reportId
  });
  
  return this.save();
};

// Method to approve driver application
driverSchema.methods.approveApplication = function(adminUserId) {
  this.status = 'active';
  this.metadata.approvedBy = adminUserId;
  this.metadata.approvalDate = new Date();
  this.metadata.onboardingCompleted = true; // Assuming approval means onboarding is done
  
  logger.info('Driver application approved', {
    driverId: this.driverId,
    approvedBy: adminUserId
  });
  
  return this.save();
};

module.exports = mongoose.model('Driver', driverSchema);