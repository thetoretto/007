const mongoose = require('mongoose');
// const { createLogger } = require('../utils/logger'); // Removed unused createLogger

// const logger = createLogger('RouteModel'); // Removed unused logger

const routeSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Route name is required'],
    trim: true,
    maxlength: [100, 'Name cannot exceed 100 characters']
  },
  description: {
    type: String,
    trim: true,
    maxlength: [500, 'Description cannot exceed 500 characters']
  },
  origin: {
    hotpointId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Hotpoint',
      required: [true, 'Origin hotpoint is required']
    },
    name: String,
    coordinates: {
      type: [Number], // [longitude, latitude]
      required: true
    }
  },
  destination: {
    hotpointId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Hotpoint',
      required: [true, 'Destination hotpoint is required']
    },
    name: String,
    coordinates: {
      type: [Number], // [longitude, latitude]
      required: true
    }
  },
  waypoints: [{
    hotpointId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Hotpoint'
    },
    name: String,
    coordinates: {
      type: [Number], // [longitude, latitude]
      required: true
    },
    order: {
      type: Number,
      required: true
    },
    estimatedArrival: String, // Time offset from start (e.g., "30min")
    stopDuration: {
      type: Number,
      default: 5 // minutes
    }
  }],
  distance: {
    value: {
      type: Number,
      required: true // in meters
    },
    text: String // human readable (e.g., "15.2 km")
  },
  duration: {
    value: {
      type: Number,
      required: true // in seconds
    },
    text: String // human readable (e.g., "25 mins")
  },
  pricing: {
    basePrice: {
      type: Number,
      required: true,
      min: 0
    },
    pricePerKm: {
      type: Number,
      default: 0,
      min: 0
    },
    pricePerMinute: {
      type: Number,
      default: 0,
      min: 0
    },
    currency: {
      type: String,
      default: 'USD'
    },
    dynamicPricing: {
      enabled: { type: Boolean, default: false },
      peakHours: [{
        start: String, // "08:00"
        end: String,   // "10:00"
        multiplier: { type: Number, default: 1.5 }
      }],
      demandMultiplier: {
        type: Number,
        default: 1,
        min: 0.5,
        max: 3
      }
    }
  },
  schedule: {
    type: {
      type: String,
      enum: ['fixed', 'on_demand', 'hybrid'],
      default: 'on_demand'
    },
    fixedSchedule: [{
      dayOfWeek: {
        type: String,
        enum: ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday']
      },
      departures: [String] // Array of departure times (e.g., ["08:00", "10:00", "14:00"])
    }],
    operatingHours: {
      start: String, // "06:00"
      end: String    // "22:00"
    },
    frequency: {
      type: Number, // minutes between departures for on-demand
      default: 30
    }
  },
  vehicleRequirements: {
    minCapacity: {
      type: Number,
      default: 1
    },
    maxCapacity: {
      type: Number,
      default: 8
    },
    vehicleTypes: [{
      type: String,
      enum: ['sedan', 'suv', 'van', 'bus', 'luxury', 'electric']
    }],
    accessibility: {
      wheelchairAccessible: { type: Boolean, default: false },
      childSeatAvailable: { type: Boolean, default: false }
    }
  },
  restrictions: {
    maxPassengers: Number,
    minAge: Number,
    requiresBooking: { type: Boolean, default: true },
    advanceBookingRequired: {
      type: Number, // hours
      default: 1
    },
    cancellationPolicy: {
      freeUntil: Number, // hours before departure
      cancellationFee: Number
    }
  },
  status: {
    type: String,
    enum: ['active', 'inactive', 'suspended', 'maintenance'],
    default: 'active'
  },
  popularity: {
    type: Number,
    default: 0,
    min: 0
  },
  rating: {
    average: { type: Number, min: 0, max: 5, default: 0 },
    count: { type: Number, default: 0 }
  },
  statistics: {
    totalTrips: { type: Number, default: 0 },
    totalRevenue: { type: Number, default: 0 },
    averageOccupancy: { type: Number, default: 0 },
    onTimePerformance: { type: Number, default: 100 } // percentage
  },
  metadata: {
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    lastUpdatedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    tags: [String],
    notes: String,
    externalId: String // For integration with external systems
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Indexes
routeSchema.index({ 'origin.hotpointId': 1, 'destination.hotpointId': 1 });
routeSchema.index({ status: 1 });
routeSchema.index({ popularity: -1 });
routeSchema.index({ 'rating.average': -1 });
routeSchema.index({ 'pricing.basePrice': 1 });
routeSchema.index({ name: 'text', description: 'text' });
routeSchema.index({ createdAt: -1 });
routeSchema.index({ 'schedule.type': 1 });

// Virtual for total distance including waypoints
routeSchema.virtual('totalDistance').get(function() {
  return this.distance.value;
});

// Virtual for total duration including waypoints
routeSchema.virtual('totalDuration').get(function() {
  let total = this.duration.value;
  if (this.waypoints && this.waypoints.length > 0) {
    total += this.waypoints.reduce((sum, waypoint) => sum + (waypoint.stopDuration * 60), 0);
  }
  return total;
});

// Virtual for formatted distance
routeSchema.virtual('formattedDistance').get(function() {
  if (this.distance.text) return this.distance.text;
  const km = this.distance.value / 1000;
  return km < 1 ? `${this.distance.value}m` : `${km.toFixed(1)}km`;
});

// Virtual for formatted duration
routeSchema.virtual('formattedDuration').get(function() {
  if (this.duration.text) return this.duration.text;
  const minutes = Math.round(this.totalDuration / 60);
  const hours = Math.floor(minutes / 60);
  const remainingMinutes = minutes % 60;
  
  if (hours > 0) {
    return `${hours}h ${remainingMinutes}m`;
  }
  return `${minutes}m`;
});

// Static method to find routes between hotpoints
routeSchema.statics.findBetweenHotpoints = function(originId, destinationId) {
  return this.find({
    'origin.hotpointId': originId,
    'destination.hotpointId': destinationId,
    status: 'active'
  }).populate('origin.hotpointId destination.hotpointId waypoints.hotpointId');
};

// Static method to search routes
routeSchema.statics.searchRoutes = function(filters = {}) {
  const query = { status: 'active' };
  
  if (filters.origin) {
    query['origin.hotpointId'] = filters.origin;
  }
  
  if (filters.destination) {
    query['destination.hotpointId'] = filters.destination;
  }
  
  if (filters.maxPrice) {
    query['pricing.basePrice'] = { $lte: filters.maxPrice };
  }
  
  if (filters.vehicleType) {
    query['vehicleRequirements.vehicleTypes'] = filters.vehicleType;
  }
  
  if (filters.minCapacity) {
    query['vehicleRequirements.maxCapacity'] = { $gte: filters.minCapacity };
  }
  
  return this.find(query)
    .populate('origin.hotpointId destination.hotpointId')
    .sort({ popularity: -1, 'rating.average': -1 });
};

// Method to calculate price for a trip
routeSchema.methods.calculatePrice = function(passengers = 1, departureTime = new Date()) {
  let price = this.pricing.basePrice;
  
  // Add distance-based pricing
  if (this.pricing.pricePerKm > 0) {
    price += (this.distance.value / 1000) * this.pricing.pricePerKm;
  }
  
  // Add time-based pricing
  if (this.pricing.pricePerMinute > 0) {
    price += (this.totalDuration / 60) * this.pricing.pricePerMinute;
  }
  
  // Apply dynamic pricing if enabled
  if (this.pricing.dynamicPricing.enabled) {
    const hour = departureTime.getHours();
    const minute = departureTime.getMinutes();
    const currentTime = hour * 60 + minute;
    
    // Check peak hours
    for (const peakHour of this.pricing.dynamicPricing.peakHours) {
      const [startHour, startMin] = peakHour.start.split(':').map(Number);
      const [endHour, endMin] = peakHour.end.split(':').map(Number);
      const startTime = startHour * 60 + startMin;
      const endTime = endHour * 60 + endMin;
      
      if (currentTime >= startTime && currentTime <= endTime) {
        price *= peakHour.multiplier;
        break;
      }
    }
    
    // Apply demand multiplier
    price *= this.pricing.dynamicPricing.demandMultiplier;
  }
  
  // Multiply by number of passengers if applicable
  if (passengers > 1) {
    price *= passengers;
  }
  
  return Math.round(price * 100) / 100; // Round to 2 decimal places
};

// Method to check if route is available at given time
routeSchema.methods.isAvailableAt = function(dateTime = new Date()) {
  if (this.status !== 'active') return false;
  
  const hour = dateTime.getHours();
  const minute = dateTime.getMinutes();
  const currentTime = `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`;
  
  // Check operating hours
  if (this.schedule.operatingHours.start && this.schedule.operatingHours.end) {
    if (currentTime < this.schedule.operatingHours.start || currentTime > this.schedule.operatingHours.end) {
      return false;
    }
  }
  
  return true;
};

// Method to get next available departure
routeSchema.methods.getNextDeparture = function(fromTime = new Date()) {
  if (!this.isAvailableAt(fromTime)) return null;
  
  const dayNames = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];
  const dayName = dayNames[fromTime.getDay()];
  
  if (this.schedule.type === 'fixed') {
    const daySchedule = this.schedule.fixedSchedule.find(s => s.dayOfWeek === dayName);
    if (!daySchedule) return null;
    
    const currentTime = fromTime.getHours() * 60 + fromTime.getMinutes();
    
    for (const departure of daySchedule.departures) {
      const [hour, minute] = departure.split(':').map(Number);
      const departureTime = hour * 60 + minute;
      
      if (departureTime > currentTime) {
        const nextDeparture = new Date(fromTime);
        nextDeparture.setHours(hour, minute, 0, 0);
        return nextDeparture;
      }
    }
    
    // No more departures today, check next day
    return null;
  }
  
  // For on-demand, calculate next available slot
  const nextSlot = new Date(fromTime);
  nextSlot.setMinutes(nextSlot.getMinutes() + this.schedule.frequency);
  return nextSlot;
};

// Method to update statistics
routeSchema.methods.updateStatistics = function(tripData) {
  this.statistics.totalTrips += 1;
  this.statistics.totalRevenue += tripData.revenue || 0;
  
  if (tripData.occupancy) {
    const totalOccupancy = this.statistics.averageOccupancy * (this.statistics.totalTrips - 1) + tripData.occupancy;
    this.statistics.averageOccupancy = totalOccupancy / this.statistics.totalTrips;
  }
  
  if (tripData.onTime !== undefined) {
    const totalOnTime = this.statistics.onTimePerformance * (this.statistics.totalTrips - 1) + (tripData.onTime ? 100 : 0);
    this.statistics.onTimePerformance = totalOnTime / this.statistics.totalTrips;
  }
  
  return this.save();
};

// Method to update rating
routeSchema.methods.updateRating = function(newRating) {
  const totalRating = this.rating.average * this.rating.count + newRating;
  this.rating.count += 1;
  this.rating.average = totalRating / this.rating.count;
  return this.save();
};

module.exports = mongoose.model('Route', routeSchema);