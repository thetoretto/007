const mongoose = require('mongoose');

const RouteSchema = new mongoose.Schema({
  origin: {
    type: String,
    required: true
  },
  destination: {
    type: String,
    required: true
  },
  distance: {
    type: Number,
    required: true
  },
  duration: {
    type: Number,
    required: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('Route', RouteSchema);