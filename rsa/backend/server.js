require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const { errorLogger, requestLogger } = require('./utils/logger');

// Import routes with error handling
let authRoutes, tripRoutes, bookingRoutes, vehicleRoutes, adminRoutes, routeRoutes;
try {
  authRoutes = require('./routes/auth');
  tripRoutes = require('./routes/trips');
  bookingRoutes = require('./routes/bookings');
  vehicleRoutes = require('./routes/vehicles');
  adminRoutes = require('./routes/admin');
  routeRoutes = require('./routes/routes');
} catch (err) {
  console.error('Failed to load routes:', err.message);
  process.exit(1);
}

// Create Express app
const app = express();

// Middleware
app.use(express.json());
// CORS Configuration
const corsOptions = {
  origin: ['http://localhost:5173', 'http://127.0.0.1:5173', 'http://localhost:5000'], // Allow frontend and backend servers
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  exposedHeaders: ['Content-Length', 'X-Requested-With'],
  credentials: true,
  preflightContinue: false,
  optionsSuccessStatus: 204,
  maxAge: 3600
};

app.use(cors(corsOptions));
app.use(helmet());
app.use(morgan('dev'));
app.use(requestLogger);

// Define routes
app.use('/api/auth', authRoutes);
app.use('/api/trips', tripRoutes);
app.use('/api/bookings', bookingRoutes);
app.use('/api/vehicles', vehicleRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/routes', routeRoutes);

// Error logging middleware
app.use(errorLogger);

// Global error handler
app.use((err, req, res, next) => {
  const statusCode = err.statusCode || 500;
  res.status(statusCode).json({
    success: false,
    message: err.message || 'Internal Server Error',
    error: process.env.NODE_ENV === 'development' ? err.stack : undefined
  });
});

// Root endpoint
app.get('/', (req, res) => {
  res.json({
    success: true,
    message: 'Ride Sharing API',
    version: '1.0.0',
    documentation: '/api-docs',
    endpoints: ['/api/auth', '/api/trips', '/api/bookings', '/api/vehicles']
  });
});

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({
    success: false,
    message: 'Server Error',
    error: process.env.NODE_ENV === 'development' ? err.message : undefined
  });
});

// Connect to MongoDB
const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/rsa');
    console.log('MongoDB connected successfully');
  } catch (error) {
    console.error('MongoDB connection error:', error.message);
    process.exit(1);
  }
};

// Start the server after connecting to DB
const startServer = async () => {
  await connectDB();
  const PORT = process.env.PORT || 5000;
  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
  });
};

startServer();

module.exports = app; // For testing purposes