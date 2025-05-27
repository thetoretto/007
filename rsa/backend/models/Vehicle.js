const mongoose = require('mongoose');
const { createLogger } = require('../utils/logger');

const logger = createLogger('VehicleModel');

const vehicleSchema = new mongoose.Schema({
  vehicleId: {
    type: String,
    unique: true,
    required: true
  },
  registration: {
    plateNumber: {
      type: String,
      required: [true, 'Plate number is required'],
      unique: true,
      uppercase: true,
      trim: true
    },
    registrationDate: Date,
    expiryDate: Date,
    registrationCountry: {
      type: String,
      default: 'USA'
    },
    registrationState: String
  },
  make: {
    type: String,
    required: [true, 'Vehicle make is required'],
    trim: true
  },
  model: {
    type: String,
    required: [true, 'Vehicle model is required'],
    trim: true
  },
  year: {
    type: Number,
    required: [true, 'Vehicle year is required'],
    min: 1900,
    max: new Date().getFullYear() + 1
  },
  type: {
    type: String,
    enum: [
      'sedan',
      'suv',
      'hatchback',
      'wagon',
      'coupe',
      'convertible',
      'pickup',
      'van',
      'minivan',
      'bus',
      'coach',
      'minibus',
      'luxury',
      'electric',
      'hybrid'
    ],
    required: [true, 'Vehicle type is required']
  },
  category: {
    type: String,
    enum: ['economy', 'standard', 'premium', 'luxury', 'executive', 'commercial'],
    default: 'standard'
  },
  specifications: {
    engine: {
      type: {
        type: String,
        enum: ['petrol', 'diesel', 'electric', 'hybrid', 'cng', 'lpg']
      },
      displacement: Number, // in liters
      power: Number, // in HP
      torque: Number, // in Nm
      fuelEfficiency: {
        city: Number, // mpg or km/l
        highway: Number,
        combined: Number
      }
    },
    transmission: {
      type: String,
      enum: ['manual', 'automatic', 'cvt', 'semi_automatic']
    },
    drivetrain: {
      type: String,
      enum: ['fwd', 'rwd', 'awd', '4wd']
    },
    dimensions: {
      length: Number, // in meters
      width: Number,
      height: Number,
      wheelbase: Number,
      groundClearance: Number
    },
    weight: {
      curb: Number, // in kg
      gross: Number,
      payload: Number
    },
    fuelCapacity: Number, // in liters
    batteryCapacity: Number, // in kWh for electric vehicles
    range: Number // in km
  },
  capacity: {
    passengers: {
      type: Number,
      required: [true, 'Passenger capacity is required'],
      min: 1,
      max: 50
    },
    luggage: {
      pieces: Number,
      volume: Number // in liters
    },
    doors: {
      type: Number,
      min: 2,
      max: 6
    }
  },
  features: {
    comfort: {
      airConditioning: { type: Boolean, default: false },
      heatedSeats: { type: Boolean, default: false },
      leatherSeats: { type: Boolean, default: false },
      sunroof: { type: Boolean, default: false },
      tintedWindows: { type: Boolean, default: false },
      recliningSeats: { type: Boolean, default: false }
    },
    safety: {
      airbags: { type: Number, default: 0 },
      abs: { type: Boolean, default: false },
      stabilityControl: { type: Boolean, default: false },
      tractionControl: { type: Boolean, default: false },
      blindSpotMonitoring: { type: Boolean, default: false },
      collisionWarning: { type: Boolean, default: false },
      laneKeepAssist: { type: Boolean, default: false },
      adaptiveCruiseControl: { type: Boolean, default: false }
    },
    technology: {
      gps: { type: Boolean, default: false },
      bluetooth: { type: Boolean, default: false },
      wifi: { type: Boolean, default: false },
      usbPorts: { type: Number, default: 0 },
      powerOutlets: { type: Number, default: 0 },
      entertainmentSystem: { type: Boolean, default: false },
      dashcam: { type: Boolean, default: false }
    },
    accessibility: {
      wheelchairAccessible: { type: Boolean, default: false },
      ramp: { type: Boolean, default: false },
      handControls: { type: Boolean, default: false },
      hearingLoop: { type: Boolean, default: false }
    }
  },
  condition: {
    overall: {
      type: String,
      enum: ['excellent', 'good', 'fair', 'poor'],
      default: 'good'
    },
    mileage: {
      type: Number,
      required: true,
      min: 0
    },
    lastServiceDate: Date,
    nextServiceDue: Date,
    serviceMileage: Number,
    issues: [{
      type: {
        type: String,
        enum: ['mechanical', 'electrical', 'body', 'interior', 'safety', 'other']
      },
      description: String,
      severity: {
        type: String,
        enum: ['low', 'medium', 'high', 'critical']
      },
      reportedDate: Date,
      resolvedDate: Date,
      cost: Number,
      status: {
        type: String,
        enum: ['open', 'in_progress', 'resolved', 'deferred'],
        default: 'open'
      }
    }]
  },
  insurance: {
    provider: String,
    policyNumber: String,
    coverage: {
      liability: Number,
      collision: Number,
      comprehensive: Number
    },
    startDate: Date,
    expiryDate: Date,
    premium: {
      amount: Number,
      frequency: {
        type: String,
        enum: ['monthly', 'quarterly', 'semi_annual', 'annual']
      }
    }
  },
  documents: {
    registration: {
      url: String,
      publicId: String,
      uploadedAt: Date
    },
    insurance: {
      url: String,
      publicId: String,
      uploadedAt: Date
    },
    inspection: {
      url: String,
      publicId: String,
      uploadedAt: Date,
      expiryDate: Date
    },
    emissions: {
      url: String,
      publicId: String,
      uploadedAt: Date,
      expiryDate: Date
    }
  },
  images: [{
    url: {
      type: String,
      required: true
    },
    publicId: String,
    type: {
      type: String,
      enum: ['exterior_front', 'exterior_back', 'exterior_side', 'interior', 'dashboard', 'engine', 'other'],
      default: 'other'
    },
    isPrimary: {
      type: Boolean,
      default: false
    },
    uploadedAt: {
      type: Date,
      default: Date.now
    }
  }],
  status: {
    type: String,
    enum: ['active', 'inactive', 'maintenance', 'repair', 'retired', 'sold'],
    default: 'active'
  },
  availability: {
    isAvailable: {
      type: Boolean,
      default: true
    },
    currentLocation: {
      coordinates: [Number], // [longitude, latitude]
      address: String,
      lastUpdated: Date
    },
    assignedDriver: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Driver'
    },
    currentTrip: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Trip'
    },
    schedule: [{
      date: Date,
      startTime: String,
      endTime: String,
      status: {
        type: String,
        enum: ['available', 'booked', 'maintenance', 'unavailable'],
        default: 'available'
      },
      tripId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Trip'
      }
    }]
  },
  maintenance: {
    schedule: [{
      type: {
        type: String,
        enum: ['oil_change', 'tire_rotation', 'brake_inspection', 'general_service', 'annual_inspection', 'other'],
        required: true
      },
      description: String,
      dueDate: Date,
      dueMileage: Number,
      completed: {
        type: Boolean,
        default: false
      },
      completedDate: Date,
      cost: Number,
      provider: String,
      notes: String
    }],
    history: [{
      type: String,
      description: String,
      date: Date,
      mileage: Number,
      cost: Number,
      provider: String,
      invoiceNumber: String,
      warranty: {
        covered: Boolean,
        expiryDate: Date,
        mileageLimit: Number
      },
      parts: [{
        name: String,
        partNumber: String,
        quantity: Number,
        cost: Number
      }],
      notes: String
    }]
  },
  financial: {
    acquisition: {
      method: {
        type: String,
        enum: ['purchase', 'lease', 'finance', 'rental']
      },
      cost: Number,
      date: Date,
      dealer: String,
      warranty: {
        duration: Number, // months
        mileageLimit: Number,
        expiryDate: Date
      }
    },
    depreciation: {
      method: {
        type: String,
        enum: ['straight_line', 'declining_balance', 'units_of_production']
      },
      rate: Number, // percentage
      currentValue: Number,
      lastValuationDate: Date
    },
    expenses: {
      fuel: { type: Number, default: 0 },
      maintenance: { type: Number, default: 0 },
      insurance: { type: Number, default: 0 },
      registration: { type: Number, default: 0 },
      parking: { type: Number, default: 0 },
      tolls: { type: Number, default: 0 },
      other: { type: Number, default: 0 }
    },
    revenue: {
      total: { type: Number, default: 0 },
      thisMonth: { type: Number, default: 0 },
      lastMonth: { type: Number, default: 0 },
      thisYear: { type: Number, default: 0 }
    }
  },
  tracking: {
    gpsDevice: {
      installed: { type: Boolean, default: false },
      deviceId: String,
      provider: String,
      lastSignal: Date
    },
    telemetrics: {
      enabled: { type: Boolean, default: false },
      fuelLevel: Number, // percentage
      batteryLevel: Number, // percentage for electric vehicles
      engineHours: Number,
      idleTime: Number, // minutes
      averageSpeed: Number,
      maxSpeed: Number,
      harshBraking: Number,
      rapidAcceleration: Number,
      lastUpdate: Date
    }
  },
  compliance: {
    emissions: {
      standard: String, // Euro 6, EPA Tier 3, etc.
      lastTest: Date,
      nextTestDue: Date,
      passed: Boolean
    },
    safety: {
      lastInspection: Date,
      nextInspectionDue: Date,
      passed: Boolean,
      defects: [String]
    },
    commercial: {
      licenseRequired: Boolean,
      licenseType: String,
      operatingPermits: [{
        type: String,
        number: String,
        expiryDate: Date
      }]
    }
  },
  metadata: {
    addedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    fleet: String, // Fleet identifier
    location: String, // Primary location/depot
    tags: [String],
    notes: String,
    customFields: [{
      name: String,
      value: String,
      type: {
        type: String,
        enum: ['text', 'number', 'date', 'boolean']
      }
    }]
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Indexes
vehicleSchema.index({ vehicleId: 1 }, { unique: true });
vehicleSchema.index({ 'registration.plateNumber': 1 }, { unique: true });
vehicleSchema.index({ status: 1 });
vehicleSchema.index({ type: 1 });
vehicleSchema.index({ 'availability.isAvailable': 1 });
vehicleSchema.index({ 'availability.assignedDriver': 1 });
vehicleSchema.index({ make: 1, model: 1 });
vehicleSchema.index({ year: 1 });
vehicleSchema.index({ createdAt: -1 });

// Virtual for vehicle display name
vehicleSchema.virtual('displayName').get(function() {
  return `${this.year} ${this.make} ${this.model}`;
});

// Virtual for age
vehicleSchema.virtual('age').get(function() {
  return new Date().getFullYear() - this.year;
});

// Virtual for primary image
vehicleSchema.virtual('primaryImage').get(function() {
  const primary = this.images.find(img => img.isPrimary);
  return primary ? primary.url : (this.images.length > 0 ? this.images[0].url : null);
});

// Virtual for next maintenance due
vehicleSchema.virtual('nextMaintenanceDue').get(function() {
  if (!this.maintenance.schedule.length) return null;
  
  const upcoming = this.maintenance.schedule
    .filter(item => !item.completed)
    .sort((a, b) => new Date(a.dueDate) - new Date(b.dueDate));
  
  return upcoming.length > 0 ? upcoming[0] : null;
});

// Virtual for insurance status
vehicleSchema.virtual('insuranceStatus').get(function() {
  if (!this.insurance.expiryDate) return 'unknown';
  
  const now = new Date();
  const expiryDate = new Date(this.insurance.expiryDate);
  const daysUntilExpiry = Math.ceil((expiryDate - now) / (1000 * 60 * 60 * 24));
  
  if (daysUntilExpiry < 0) return 'expired';
  if (daysUntilExpiry <= 30) return 'expiring_soon';
  return 'valid';
});

// Virtual for total expenses
vehicleSchema.virtual('totalExpenses').get(function() {
  const expenses = this.financial.expenses;
  return Object.values(expenses).reduce((total, amount) => total + (amount || 0), 0);
});

// Pre-save middleware to generate vehicle ID
vehicleSchema.pre('save', function(next) {
  if (!this.vehicleId) {
    const timestamp = Date.now().toString(36);
    const random = Math.random().toString(36).substr(2, 4);
    this.vehicleId = `VH-${timestamp}-${random}`.toUpperCase();
  }
  next();
});

// Pre-save middleware to ensure only one primary image
vehicleSchema.pre('save', function(next) {
  if (this.isModified('images')) {
    const primaryImages = this.images.filter(img => img.isPrimary);
    if (primaryImages.length > 1) {
      // Keep only the first primary image
      this.images.forEach((img, index) => {
        if (index > 0 && img.isPrimary) {
          img.isPrimary = false;
        }
      });
    } else if (primaryImages.length === 0 && this.images.length > 0) {
      // Set first image as primary if none is set
      this.images[0].isPrimary = true;
    }
  }
  next();
});

// Static method to find available vehicles
vehicleSchema.statics.findAvailable = function(filters = {}) {
  const query = {
    status: 'active',
    'availability.isAvailable': true,
    ...filters
  };
  return this.find(query).populate('availability.assignedDriver');
};

// Static method to find by type
vehicleSchema.statics.findByType = function(type, filters = {}) {
  const query = { type, ...filters };
  return this.find(query);
};

// Static method to find vehicles needing maintenance
vehicleSchema.statics.findNeedingMaintenance = function() {
  const now = new Date();
  return this.find({
    $or: [
      { 'maintenance.schedule.dueDate': { $lte: now }, 'maintenance.schedule.completed': false },
      { 'condition.nextServiceDue': { $lte: now } }
    ]
  });
};

// Method to update location
vehicleSchema.methods.updateLocation = function(coordinates, address) {
  this.availability.currentLocation = {
    coordinates,
    address,
    lastUpdated: new Date()
  };
  
  logger.info('Vehicle location updated', {
    vehicleId: this.vehicleId,
    coordinates,
    address
  });
  
  return this.save();
};

// Method to assign driver
vehicleSchema.methods.assignDriver = function(driverId) {
  this.availability.assignedDriver = driverId;
  
  logger.info('Driver assigned to vehicle', {
    vehicleId: this.vehicleId,
    driverId
  });
  
  return this.save();
};

// Method to set availability
vehicleSchema.methods.setAvailability = function(isAvailable, reason = '') {
  this.availability.isAvailable = isAvailable;
  
  if (!isAvailable && reason) {
    this.metadata.notes = `${this.metadata.notes || ''} Unavailable: ${reason}`.trim();
  }
  
  logger.info('Vehicle availability updated', {
    vehicleId: this.vehicleId,
    isAvailable,
    reason
  });
  
  return this.save();
};

// Method to add maintenance record
vehicleSchema.methods.addMaintenanceRecord = function(maintenanceData) {
  this.maintenance.history.push({
    ...maintenanceData,
    date: new Date()
  });
  
  // Update mileage if provided
  if (maintenanceData.mileage && maintenanceData.mileage > this.condition.mileage) {
    this.condition.mileage = maintenanceData.mileage;
    this.condition.lastServiceDate = new Date();
  }
  
  logger.info('Maintenance record added', {
    vehicleId: this.vehicleId,
    type: maintenanceData.type,
    cost: maintenanceData.cost
  });
  
  return this.save();
};

// Method to update mileage
vehicleSchema.methods.updateMileage = function(newMileage) {
  if (newMileage > this.condition.mileage) {
    this.condition.mileage = newMileage;
    
    // Check if service is due based on mileage
    if (this.condition.serviceMileage && newMileage >= this.condition.serviceMileage) {
      this.condition.nextServiceDue = new Date();
    }
    
    logger.info('Vehicle mileage updated', {
      vehicleId: this.vehicleId,
      newMileage,
      previousMileage: this.condition.mileage
    });
    
    return this.save();
  }
  return Promise.resolve(this);
};

// Method to calculate depreciation
vehicleSchema.methods.calculateDepreciation = function() {
  if (!this.financial.acquisition.cost || !this.financial.depreciation.rate) {
    return this.financial.depreciation.currentValue || 0;
  }
  
  const ageInYears = this.age;
  const depreciationRate = this.financial.depreciation.rate / 100;
  const originalCost = this.financial.acquisition.cost;
  
  let currentValue;
  
  switch (this.financial.depreciation.method) {
    case 'declining_balance': {
      currentValue = originalCost * Math.pow(1 - depreciationRate, ageInYears);
      break;
    }
    case 'units_of_production': {
      // Simplified calculation based on mileage
      const estimatedLifeMileage = 200000; // km
      const usageRate = this.condition.mileage / estimatedLifeMileage;
      currentValue = originalCost * (1 - usageRate);
      break;
    }
    default: { // straight_line
      const estimatedLife = 10; // years
      const annualDepreciation = originalCost / estimatedLife;
      currentValue = originalCost - (annualDepreciation * ageInYears);
    }
  }
  
  this.financial.depreciation.currentValue = Math.max(0, currentValue);
  this.financial.depreciation.lastValuationDate = new Date();
  
  return this.financial.depreciation.currentValue;
};

// Method to add expense
vehicleSchema.methods.addExpense = function(category, amount, description = '') {
  if (Object.prototype.hasOwnProperty.call(this.financial.expenses, category)) {
    this.financial.expenses[category] += amount;
  } else {
    this.financial.expenses.other += amount;
  }
  
  logger.info('Expense added to vehicle', {
    vehicleId: this.vehicleId,
    category,
    amount,
    description
  });
  
  return this.save();
};

// Method to check if vehicle needs inspection
vehicleSchema.methods.needsInspection = function() {
  const inspectionDate = this.compliance.safety.nextInspectionDue;
  if (!inspectionDate) return false;
  
  const now = new Date();
  const daysUntilInspection = Math.ceil((inspectionDate - now) / (1000 * 60 * 60 * 24));
  
  return daysUntilInspection <= 30; // Needs inspection within 30 days
};

module.exports = mongoose.model('Vehicle', vehicleSchema);