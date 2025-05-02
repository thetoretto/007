const mongoose = require('mongoose');

const bookingSchema = new mongoose.Schema({
  passengerId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'User', 
    required: true 
  },
  tripId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'Trip', 
    required: true 
  },
  seatNumber: { 
    type: String, 
    required: true 
  },
  status: { 
    type: String, 
    enum: ['pending', 'confirmed', 'cancelled', 'completed'], 
    default: 'pending' 
  },
  doorstepPickup: { 
    type: Boolean, 
    default: false 
  },
  pickupAddress: { 
    type: String,
    required: function() {
      return this.doorstepPickup === true;
    }
  },
  extras: [{
    name: { type: String, required: true },
    price: { type: Number, required: true },
    quantity: { type: Number, required: true, min: 1 }
  }],
  baseFare: {
    type: Number,
    required: true,
    min: 0
  },
  extrasFee: {
    type: Number,
    default: 0,
    min: 0
  },
  doorstepFee: {
    type: Number,
    default: 0,
    min: 0
  },
  discount: {
    type: Number,
    default: 0,
    min: 0
  },
  totalPrice: { 
    type: Number, 
    required: true,
    min: 0
  },
  paymentStatus: { 
    type: String, 
    enum: ['pending', 'paid', 'refunded'], 
    default: 'pending' 
  },
  paymentMethod: {
    type: String,
    enum: ['cash', 'credit_card', 'mobile_money', 'bank_transfer'],
    default: 'cash'
  },
  paymentDate: {
    type: Date
  },
  specialRequests: {
    type: String
  },
  checkedIn: {
    type: Boolean,
    default: false
  },
  checkedInAt: {
    type: Date
  }
}, {
  timestamps: true
});

// Add indexes for faster queries
bookingSchema.index({ passengerId: 1 });
bookingSchema.index({ tripId: 1 });
bookingSchema.index({ status: 1 });
bookingSchema.index({ paymentStatus: 1 });

// Method to calculate total price
bookingSchema.methods.calculateTotalPrice = function() {
  let extrasTotal = 0;
  
  if (this.extras && this.extras.length > 0) {
    extrasTotal = this.extras.reduce((total, item) => {
      return total + (item.price * item.quantity);
    }, 0);
  }
  
  this.extrasFee = extrasTotal;
  this.totalPrice = this.baseFare + extrasTotal + this.doorstepFee - this.discount;
  
  return this.totalPrice;
};

const Booking = mongoose.model('Booking', bookingSchema);

module.exports = Booking;