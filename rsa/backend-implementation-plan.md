# Rwanda Shuttle Application (RSA) Backend Implementation Plan

## Overview

This document outlines the implementation plan for creating a robust backend for the Rwanda Shuttle Application (RSA). The backend will support driver trip management, user booking functionality, and admin oversight.

## Technology Stack

- **Runtime Environment**: Node.js
- **Web Framework**: Express.js
- **Database**: MongoDB with Mongoose ODM
- **Authentication**: JWT (JSON Web Tokens)
- **API Documentation**: Swagger/OpenAPI
- **Testing**: Jest

## Project Structure

```
rsa-backend/
├── config/                 # Configuration files
│   ├── db.js              # Database connection
│   └── auth.js            # Authentication config
├── controllers/           # Request handlers
│   ├── authController.js
│   ├── tripController.js
│   ├── bookingController.js
│   ├── vehicleController.js
│   └── adminController.js
├── middleware/            # Custom middleware
│   ├── auth.js            # Authentication middleware
│   ├── error.js           # Error handling
│   └── validation.js      # Request validation
├── models/                # Database models
│   ├── User.js            # Base user model
│   ├── Passenger.js       # Passenger model
│   ├── Driver.js          # Driver model
│   ├── Admin.js           # Admin model
│   ├── Vehicle.js         # Vehicle model
│   ├── Route.js           # Route model
│   ├── Trip.js            # Trip model
│   └── Booking.js         # Booking model
├── routes/                # API routes
│   ├── auth.js
│   ├── trips.js
│   ├── bookings.js
│   ├── vehicles.js
│   └── admin.js
├── utils/                 # Utility functions
│   ├── validators.js
│   └── helpers.js
├── app.js                 # Express app setup
├── server.js              # Server entry point
└── package.json           # Project dependencies
```

## Database Models

### User Model (Base)
```javascript
const userSchema = new mongoose.Schema({
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  firstName: { type: String, required: true },
  lastName: { type: String, required: true },
  role: { type: String, enum: ['passenger', 'driver', 'admin'], required: true },
  avatar: { type: String },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});
```

### Vehicle Model
```javascript
const vehicleSchema = new mongoose.Schema({
  model: { type: String, required: true },
  licensePlate: { type: String, required: true, unique: true },
  capacity: { type: Number, required: true },
  luggageCapacity: { type: Number, required: true },
  comfortLevel: { type: String, enum: ['Basic', 'Standard', 'Premium', 'Luxury'] },
  type: { type: String, required: true },
  features: [{ type: String }],
  imageUrl: { type: String },
  pricePerMile: { type: Number, required: true },
  isActive: { type: Boolean, default: true },
  driverId: { type: mongoose.Schema.Types.ObjectId, ref: 'Driver' }
});
```

### Trip Model
```javascript
const tripSchema = new mongoose.Schema({
  routeId: { type: mongoose.Schema.Types.ObjectId, ref: 'Route', required: true },
  vehicleId: { type: mongoose.Schema.Types.ObjectId, ref: 'Vehicle', required: true },
  driverId: { type: mongoose.Schema.Types.ObjectId, ref: 'Driver', required: true },
  departureTime: { type: Date, required: true },
  arrivalTime: { type: Date, required: true },
  status: { 
    type: String, 
    enum: ['scheduled', 'in-progress', 'completed', 'cancelled'], 
    default: 'scheduled' 
  },
  availableSeats: { type: Number, required: true },
  price: { type: Number, required: true },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});
```

### Booking Model
```javascript
const bookingSchema = new mongoose.Schema({
  passengerId: { type: mongoose.Schema.Types.ObjectId, ref: 'Passenger', required: true },
  tripId: { type: mongoose.Schema.Types.ObjectId, ref: 'Trip', required: true },
  seatNumber: { type: String, required: true },
  status: { 
    type: String, 
    enum: ['pending', 'confirmed', 'cancelled', 'completed'], 
    default: 'pending' 
  },
  doorstepPickup: { type: Boolean, default: false },
  pickupAddress: { type: String },
  extras: [{
    name: { type: String, required: true },
    price: { type: Number, required: true },
    quantity: { type: Number, required: true }
  }],
  totalPrice: { type: Number, required: true },
  paymentStatus: { 
    type: String, 
    enum: ['pending', 'paid', 'refunded'], 
    default: 'pending' 
  },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});
```

## API Endpoints

### Authentication
- `POST /api/auth/register` - Register a new user
- `POST /api/auth/login` - Login and get token
- `GET /api/auth/me` - Get current user profile
- `PUT /api/auth/me` - Update user profile

### Trips (Driver)
- `POST /api/trips` - Create a new trip
- `GET /api/trips` - Get all trips (with filters)
- `GET /api/trips/:id` - Get trip details
- `PUT /api/trips/:id` - Update trip details
- `DELETE /api/trips/:id` - Cancel a trip
- `GET /api/trips/:id/bookings` - Get all bookings for a trip
- `PUT /api/trips/:id/status` - Update trip status

### Bookings (Passenger)
- `POST /api/bookings` - Create a new booking
- `GET /api/bookings` - Get user's bookings
- `GET /api/bookings/:id` - Get booking details
- `PUT /api/bookings/:id` - Update booking
- `DELETE /api/bookings/:id` - Cancel booking
- `POST /api/bookings/:id/payment` - Process payment

### Vehicles
- `POST /api/vehicles` - Add a new vehicle
- `GET /api/vehicles` - Get all vehicles
- `GET /api/vehicles/:id` - Get vehicle details
- `PUT /api/vehicles/:id` - Update vehicle
- `DELETE /api/vehicles/:id` - Delete vehicle

### Admin
- `GET /api/admin/users` - Get all users
- `GET /api/admin/trips` - Get all trips with advanced filters
- `GET /api/admin/bookings` - Get all bookings with advanced filters
- `GET /api/admin/stats` - Get system statistics

## Implementation Steps

### 1. Project Setup
1. Initialize Node.js project: `npm init -y`
2. Install core dependencies:
   ```
   npm install express mongoose bcryptjs jsonwebtoken cors helmet morgan dotenv
   ```
3. Install development dependencies:
   ```
   npm install --save-dev nodemon jest supertest
   ```
4. Create basic server structure (app.js, server.js)
5. Set up environment variables (.env file)

### 2. Database Setup
1. Set up MongoDB connection
2. Create database models
3. Add validation to models

### 3. Authentication System
1. Implement user registration
2. Implement user login with JWT
3. Create authentication middleware
4. Implement password hashing

### 4. Trip Management (Driver)
1. Create CRUD operations for trips
2. Implement trip status management
3. Add validation for trip creation
4. Implement trip search and filtering

### 5. Booking System (Passenger)
1. Create booking creation endpoint
2. Implement seat availability checking
3. Add booking status management
4. Create booking cancellation logic

### 6. Vehicle Management
1. Implement CRUD operations for vehicles
2. Add vehicle assignment to drivers
3. Implement vehicle status tracking

### 7. Admin Dashboard API
1. Create endpoints for user management
2. Implement system statistics
3. Add advanced filtering for trips and bookings

### 8. Testing & Documentation
1. Write unit tests for critical functions
2. Create API documentation with Swagger
3. Add README with setup instructions

## Integration with Frontend

To integrate this backend with the existing React frontend:

1. Update the API client in `src/utils/api.ts` to point to the new backend
2. Modify the store files to use real API calls instead of mock data
3. Add proper error handling for API responses
4. Implement authentication token storage and refresh

## Deployment Considerations

1. Set up environment variables for production
2. Configure CORS for security
3. Implement rate limiting
4. Set up database backups
5. Configure logging for production

## Next Steps

After implementing the basic backend:

1. Add real-time notifications using WebSockets
2. Implement payment gateway integration
3. Add email notifications for bookings
4. Implement analytics tracking
5. Add multi-language support