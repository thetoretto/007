const mongoose = require('mongoose');
// const { createLogger } = require('../utils/logger'); // Removed unused createLogger

// const logger = createLogger('HotpointModel'); // Removed unused logger

const hotpointSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Hotpoint name is required'],
    trim: true,
    maxlength: [100, 'Name cannot exceed 100 characters']
  },
  description: {
    type: String,
    trim: true,
    maxlength: [500, 'Description cannot exceed 500 characters']
  },
  location: {
    type: {
      type: String,
      enum: ['Point'],
      default: 'Point'
    },
    coordinates: {
      type: [Number], // [longitude, latitude]
      required: [true, 'Coordinates are required'],
      validate: {
        validator: function(coords) {
          return coords.length === 2 && 
                 coords[0] >= -180 && coords[0] <= 180 && // longitude
                 coords[1] >= -90 && coords[1] <= 90;     // latitude
        },
        message: 'Invalid coordinates. Longitude must be between -180 and 180, latitude between -90 and 90'
      }
    }
  },
  address: {
    street: { type: String, trim: true },
    city: { type: String, required: true, trim: true },
    state: { type: String, required: true, trim: true },
    zipCode: { type: String, trim: true },
    country: { type: String, default: 'USA', trim: true }
  },
  type: {
    type: String,
    enum: ['pickup', 'dropoff', 'both'],
    default: 'both'
  },
  category: {
    type: String,
    enum: ['airport', 'hotel', 'restaurant', 'shopping', 'business', 'residential', 'hospital', 'school', 'other'],
    default: 'other'
  },
  amenities: [{
    type: String,
    enum: ['parking', 'wifi', 'restroom', 'wheelchair_accessible', 'waiting_area', 'food', 'atm', 'charging_station']
  }],
  operatingHours: {
    monday: { open: String, close: String, closed: { type: Boolean, default: false } },
    tuesday: { open: String, close: String, closed: { type: Boolean, default: false } },
    wednesday: { open: String, close: String, closed: { type: Boolean, default: false } },
    thursday: { open: String, close: String, closed: { type: Boolean, default: false } },
    friday: { open: String, close: String, closed: { type: Boolean, default: false } },
    saturday: { open: String, close: String, closed: { type: Boolean, default: false } },
    sunday: { open: String, close: String, closed: { type: Boolean, default: false } }
  },
  contact: {
    phone: String,
    email: String,
    website: String
  },
  images: [{
    url: String,
    alt: String,
    isPrimary: { type: Boolean, default: false }
  }],
  rating: {
    average: { type: Number, min: 0, max: 5, default: 0 },
    count: { type: Number, default: 0 }
  },
  popularity: {
    type: Number,
    default: 0,
    min: 0
  },
  isActive: {
    type: Boolean,
    default: true
  },
  isVerified: {
    type: Boolean,
    default: false
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
    notes: String
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Indexes
hotpointSchema.index({ location: '2dsphere' }); // Geospatial index
hotpointSchema.index({ name: 'text', description: 'text' }); // Text search
hotpointSchema.index({ type: 1 });
hotpointSchema.index({ category: 1 });
hotpointSchema.index({ isActive: 1 });
hotpointSchema.index({ 'address.city': 1 });
hotpointSchema.index({ 'address.state': 1 });
hotpointSchema.index({ popularity: -1 });
hotpointSchema.index({ 'rating.average': -1 });
hotpointSchema.index({ createdAt: -1 });

// Virtual for full address
hotpointSchema.virtual('fullAddress').get(function() {
  const parts = [];
  if (this.address.street) parts.push(this.address.street);
  if (this.address.city) parts.push(this.address.city);
  if (this.address.state) parts.push(this.address.state);
  if (this.address.zipCode) parts.push(this.address.zipCode);
  if (this.address.country) parts.push(this.address.country);
  return parts.join(', ');
});

// Virtual for coordinates in lat/lng format
hotpointSchema.virtual('latLng').get(function() {
  if (this.location && this.location.coordinates) {
    return {
      lat: this.location.coordinates[1],
      lng: this.location.coordinates[0]
    };
  }
  return null;
});

// Virtual for primary image
hotpointSchema.virtual('primaryImage').get(function() {
  if (this.images && this.images.length > 0) {
    const primary = this.images.find(img => img.isPrimary);
    return primary || this.images[0];
  }
  return null;
});

// Static method to find nearby hotpoints
hotpointSchema.statics.findNearby = function(longitude, latitude, maxDistance = 10000, limit = 10) {
  return this.find({
    location: {
      $near: {
        $geometry: {
          type: 'Point',
          coordinates: [longitude, latitude]
        },
        $maxDistance: maxDistance // in meters
      }
    },
    isActive: true
  }).limit(limit);
};

// Static method to search hotpoints
hotpointSchema.statics.search = function(query, filters = {}) {
  const searchQuery = {
    isActive: true,
    ...filters
  };

  if (query) {
    searchQuery.$text = { $search: query };
  }

  return this.find(searchQuery).sort({ score: { $meta: 'textScore' }, popularity: -1 });
};

// Method to calculate distance from a point
hotpointSchema.methods.distanceFrom = function(longitude, latitude) {
  if (!this.location || !this.location.coordinates) {
    return null;
  }

  const [hotpointLng, hotpointLat] = this.location.coordinates;
  
  // Haversine formula
  const R = 6371e3; // Earth's radius in meters
  const φ1 = latitude * Math.PI / 180;
  const φ2 = hotpointLat * Math.PI / 180;
  const Δφ = (hotpointLat - latitude) * Math.PI / 180;
  const Δλ = (hotpointLng - longitude) * Math.PI / 180;

  const a = Math.sin(Δφ/2) * Math.sin(Δφ/2) +
            Math.cos(φ1) * Math.cos(φ2) *
            Math.sin(Δλ/2) * Math.sin(Δλ/2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));

  return R * c; // Distance in meters
};

// Method to check if hotpoint is open at a given time
hotpointSchema.methods.isOpenAt = function(date = new Date()) {
  const days = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];
  const dayName = days[date.getDay()];
  const daySchedule = this.operatingHours[dayName];
  
  if (!daySchedule || daySchedule.closed) {
    return false;
  }
  
  if (!daySchedule.open || !daySchedule.close) {
    return true; // Assume 24/7 if no specific hours
  }
  
  const currentTime = date.getHours() * 60 + date.getMinutes();
  const [openHour, openMin] = daySchedule.open.split(':').map(Number);
  const [closeHour, closeMin] = daySchedule.close.split(':').map(Number);
  const openTime = openHour * 60 + openMin;
  const closeTime = closeHour * 60 + closeMin;
  
  if (closeTime < openTime) {
    // Crosses midnight
    return currentTime >= openTime || currentTime <= closeTime;
  }
  
  return currentTime >= openTime && currentTime <= closeTime;
};

// Method to update popularity
hotpointSchema.methods.incrementPopularity = function() {
  this.popularity += 1;
  return this.save();
};

// Method to update rating
hotpointSchema.methods.updateRating = function(newRating) {
  const totalRating = this.rating.average * this.rating.count + newRating;
  this.rating.count += 1;
  this.rating.average = totalRating / this.rating.count;
  return this.save();
};

// Pre-save middleware
hotpointSchema.pre('save', function(next) {
  // Ensure only one primary image
  if (this.images && this.images.length > 0) {
    const primaryImages = this.images.filter(img => img.isPrimary);
    if (primaryImages.length > 1) {
      // Keep only the first primary image
      this.images.forEach((img, index) => {
        if (index > 0 && img.isPrimary) {
          img.isPrimary = false;
        }
      });
    } else if (primaryImages.length === 0) {
      // Set first image as primary
      this.images[0].isPrimary = true;
    }
  }
  
  next();
});

module.exports = mongoose.model('Hotpoint', hotpointSchema);