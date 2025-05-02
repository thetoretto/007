# Rwanda Shuttle Application (RSA) Backend

This is the backend implementation for the Rwanda Shuttle Application, providing APIs for driver trip management, user booking functionality, and admin oversight.

## Features

- **User Authentication**: Register, login, and profile management
- **Trip Management**: Drivers can create, update, and manage trips
- **Booking System**: Users can book trips, select seats, and add extras
- **Vehicle Management**: Drivers can manage their vehicles
- **Admin Dashboard**: Admins can oversee all operations

## Technology Stack

- **Runtime**: Node.js
- **Framework**: Express.js
- **Database**: MongoDB with Mongoose ODM
- **Authentication**: JWT (JSON Web Tokens)

## Getting Started

### Prerequisites

- Node.js (v18 or higher)
- MongoDB (local or Atlas)

### Installation

1. Clone the repository (if not already done)
2. Navigate to the backend directory:
   ```
   cd rsa/backend
   ```
3. Install dependencies:
   ```
   npm install
   ```
4. Create a `.env` file in the root of the backend directory with the following variables:
   ```
   PORT=5000
   MONGO_URI=mongodb://localhost:27017/rsa
   JWT_SECRET=your_jwt_secret_key
   NODE_ENV=development
   ```

### Running the Server

```
npm run dev
```

The server will start on port 5000 (or the port specified in your .env file).

## API Endpoints

### Authentication
- `POST /api/auth/register` - Register a new user
- `POST /api/auth/login` - Login and get token
- `GET /api/auth/me` - Get current user profile

### Trips (Driver)
- `POST /api/trips` - Create a new trip
- `GET /api/trips` - Get all trips (with filters)
- `GET /api/trips/:id` - Get trip details
- `PUT /api/trips/:id` - Update trip details
- `DELETE /api/trips/:id` - Cancel a trip
- `GET /api/trips/driver` - Get driver's trips
- `PUT /api/trips/:id/status` - Update trip status

### Bookings (Passenger)
- `POST /api/bookings` - Create a new booking
- `GET /api/bookings` - Get user's bookings
- `GET /api/bookings/:id` - Get booking details
- `PUT /api/bookings/:id` - Update booking
- `DELETE /api/bookings/:id` - Cancel booking
- `GET /api/bookings/trip/:tripId` - Get all bookings for a trip (Driver)
- `PUT /api/bookings/:id/checkin` - Check in passenger (Driver)

## Frontend Integration

To connect the frontend with this backend:

1. Update the API client in `src/utils/api.ts` to point to this backend server
2. Replace mock data with actual API calls in the store files

## Development

### Adding New Features

1. Create or update models in the `models` directory
2. Add controller functions in the `controllers` directory
3. Define routes in the `routes` directory

### Testing

Run tests with:

```
npm test
```

## License

This project is licensed under the MIT License.