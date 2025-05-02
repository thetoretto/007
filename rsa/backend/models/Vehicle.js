const mongoose = require('mongoose');

const vehicleSchema = new mongoose.Schema({
  model: { 
    type: String, 
    required: true 
  },
  licensePlate: { 
    type: String, 
    required: true, 
    unique: true,
    trim: true,
    uppercase: true
  },
  capacity: { 
    type: Number, 
    required: true,
    min: 1
  },
  luggageCapacity: { 
    type: Number, 
    required: true,
    min: 0
  },
  comfortLevel: { 
    type: String, 
    enum: ['Basic', 'Standard', 'Premium', 'Luxury'],
    default: 'Standard'
  },
  type: { 
    type: String, 
    required: true 
  },
  features: [{ 
    type: String 
  }],
  imageUrl: { 
    type: String 
  },
  pricePerMile: { 
    type: Number, 
    required: true,
    min: 0
  },
  isActive: { 
    type: Boolean, 
    default: true 
  },
  driverId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'User',
    required: true
  }
}, {
  timestamps: true
});

// Add index for faster queries
vehicleSchema.index({ driverId: 1 });
vehicleSchema.index({ isActive: 1 });

const Vehicle = mongoose.model('Vehicle', vehicleSchema);

module.exports = Vehicle;