const mongoose = require('mongoose');

const tripSchema = new mongoose.Schema({
  routeId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'Route', 
    required: true 
  },
  vehicleId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'Vehicle', 
    required: true 
  },
  driverId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'User', 
    required: true 
  },
  departureTime: { 
    type: Date, 
    required: true 
  },
  arrivalTime: { 
    type: Date, 
    required: true 
  },
  status: { 
    type: String, 
    enum: ['scheduled', 'in-progress', 'completed', 'cancelled'], 
    default: 'scheduled' 
  },
  availableSeats: { 
    type: Number, 
    required: true,
    min: 0
  },
  totalSeats: {
    type: Number,
    required: true,
    min: 1
  },
  price: { 
    type: Number, 
    required: true,
    min: 0
  },
  origin: {
    name: { type: String, required: true },
    address: { type: String, required: true },
    city: { type: String, required: true },
    coordinates: {
      latitude: { type: Number },
      longitude: { type: Number }
    }
  },
  destination: {
    name: { type: String, required: true },
    address: { type: String, required: true },
    city: { type: String, required: true },
    coordinates: {
      latitude: { type: Number },
      longitude: { type: Number }
    }
  },
  distance: {
    type: Number,
    required: true,
    min: 0
  },
  duration: {
    type: Number, // in minutes
    required: true,
    min: 0
  },
  description: {
    type: String
  }
}, {
  timestamps: true
});

// Add indexes for faster queries
tripSchema.index({ driverId: 1 });
tripSchema.index({ vehicleId: 1 });
tripSchema.index({ departureTime: 1 });
tripSchema.index({ status: 1 });
tripSchema.index({ 'origin.city': 1, 'destination.city': 1 });

// Virtual for bookings
tripSchema.virtual('bookings', {
  ref: 'Booking',
  localField: '_id',
  foreignField: 'tripId'
});

// Set toJSON option to include virtuals
tripSchema.set('toJSON', { virtuals: true });
tripSchema.set('toObject', { virtuals: true });

const Trip = mongoose.model('Trip', tripSchema);

module.exports = Trip;