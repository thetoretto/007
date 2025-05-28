const Driver = require('../models/Driver');
const Vehicle = require('../models/Vehicle');
const Trip = require('../models/Trip'); // If live trip tracking is involved
// const Hotpoint = require('../models/Hotpoint');
const { AppError } = require('../middleware/errorHandler');
const { createLogger } = require('../utils/logger');
// const { calculateDistance } = require('../utils/geoUtils'); // Example utility

const logger = createLogger('GeolocationController');

/**
 * @desc    Update driver's current location
 * @route   POST /api/v1/drivers/:driverId/location
 * @access  Private (Driver, Admin)
 * @body    latitude, longitude, timestamp (optional), accuracy (optional)
 */
exports.updateDriverLocation = async (req, res, next) => {
    try {
        const { driverId } = req.params;
        const { latitude, longitude, timestamp, accuracy } = req.body;

        if (typeof latitude !== 'number' || typeof longitude !== 'number') {
            return next(new AppError('Latitude and longitude are required and must be numbers.', 400));
        }

        // Authorization: Ensure the logged-in user is the driver or an admin
        if (req.user.role !== 'admin' && req.user.id !== driverId) {
            // Assuming req.user.id is the ID of the authenticated user (which might be a User _id, not Driver _id directly)
            // This check might need adjustment based on how driver authentication and User/Driver models are linked.
            // If Driver model has a 'user' field linking to User model:
            const driver = await Driver.findById(driverId);
            if (!driver || driver.user.toString() !== req.user.id) {
                 return next(new AppError('You are not authorized to update this driver\'s location.', 403));
            }
        }

        const updatedDriver = await Driver.findByIdAndUpdate(
            driverId,
            {
                'currentLocation.coordinates': [longitude, latitude], // GeoJSON format: [longitude, latitude]
                'currentLocation.timestamp': timestamp || Date.now(),
                'currentLocation.accuracy': accuracy,
                'status': 'active' // Or 'online' / 'available_for_ride'
            },
            { new: true, runValidators: true }
        );

        if (!updatedDriver) {
            return next(new AppError('Driver not found.', 404));
        }

        // TODO: Potentially emit a WebSocket event for real-time tracking
        // global.io.to(`driver_${driverId}`).emit('locationUpdate', { latitude, longitude });

        logger.info('Driver location updated', { driverId, latitude, longitude, updatedBy: req.user.id });
        res.status(200).json({ success: true, message: 'Location updated successfully.', data: updatedDriver.currentLocation });

    } catch (error) {
        logger.error('Error updating driver location', { driverId: req.params.driverId, userId: req.user.id, error: error.message, stack: error.stack, body: req.body });
        if (error.name === 'ValidationError') {
            return next(new AppError(error.message, 400));
        }
        next(new AppError('Server error while updating driver location.', 500));
    }
};

/**
 * @desc    Get driver's current location
 * @route   GET /api/v1/drivers/:driverId/location
 * @access  Private (User - for assigned trip, Admin, Driver)
 */
exports.getDriverLocation = async (req, res, next) => {
    try {
        const { driverId } = req.params;

        const driver = await Driver.findById(driverId).select('currentLocation user');

        if (!driver) {
            return next(new AppError('Driver not found.', 404));
        }

        // Authorization: More complex logic might be needed here.
        // e.g., a user can see location if they have an active trip with this driver.
        // Admins and the driver themselves can always see.
        // For simplicity, this example is less restrictive but should be tightened in production.
        if (req.user.role !== 'admin' && driver.user.toString() !== req.user.id) {
            // Basic check, needs refinement for user trip context
            // return next(new AppError('You are not authorized to view this driver\'s location.', 403));
        }

        logger.info('Fetched driver location', { driverId, requestedBy: req.user.id });
        res.status(200).json({ success: true, data: driver.currentLocation });

    } catch (error) {
        logger.error('Error fetching driver location', { driverId: req.params.driverId, userId: req.user.id, error: error.message, stack: error.stack });
        next(new AppError('Server error while fetching driver location.', 500));
    }
};

/**
 * @desc    Find nearby available drivers
 * @route   GET /api/v1/drivers/nearby
 * @access  Private (User, Admin)
 * @query   latitude, longitude, radius (in meters, default 5000), vehicleType (optional)
 */
exports.findNearbyDrivers = async (req, res, next) => {
    try {
        const { latitude, longitude, radius = 5000, vehicleType } = req.query;

        if (!latitude || !longitude) {
            return next(new AppError('Latitude and longitude are required.', 400));
        }

        const lat = parseFloat(latitude);
        const lon = parseFloat(longitude);
        const rad = parseInt(radius, 10);

        if (isNaN(lat) || isNaN(lon) || isNaN(rad)) {
            return next(new AppError('Invalid location or radius parameters.', 400));
        }

        const query = {
            'currentLocation.coordinates': {
                $nearSphere: {
                    $geometry: {
                        type: 'Point',
                        coordinates: [lon, lat],
                    },
                    $maxDistance: rad,
                },
            },
            availabilityStatus: 'available', // Ensure driver is available
            // status: 'active', // Ensure driver account is active
        };

        if (vehicleType) {
            // This requires linking drivers to vehicles and vehicles having a type.
            // Assuming Driver model has 'assignedVehicle' which populates vehicle details including 'type'.
            // This is a simplified query; a more robust solution might involve an aggregation pipeline.
            const vehiclesOfType = await Vehicle.find({ type: vehicleType, status: 'active' }).select('_id');
            if (vehiclesOfType.length === 0) {
                return res.status(200).json({ success: true, data: [], message: 'No vehicles of the specified type found.' });
            }
            query.assignedVehicle = { $in: vehiclesOfType.map(v => v._id) };
        }

        const drivers = await Driver.find(query)
            .populate('assignedVehicle', 'type make model licensePlate') // Populate some vehicle info
            .select('firstName lastName overallRating currentLocation.coordinates assignedVehicle'); // Select relevant fields

        logger.info('Searched for nearby drivers', { latitude, longitude, radius, vehicleType, foundCount: drivers.length, requestedBy: req.user.id });
        res.status(200).json({ success: true, count: drivers.length, data: drivers });

    } catch (error) {
        logger.error('Error finding nearby drivers', { userId: req.user.id, error: error.message, stack: error.stack, query: req.query });
        next(new AppError('Server error while finding nearby drivers.', 500));
    }
};

/**
 * @desc    Update vehicle's current location (e.g., for GPS-equipped vehicles not tied to a specific driver app)
 * @route   POST /api/v1/vehicles/:vehicleId/location
 * @access  Private (System/Device, Admin)
 * @body    latitude, longitude, timestamp (optional), speed (optional)
 */
exports.updateVehicleLocation = async (req, res, next) => {
    try {
        const { vehicleId } = req.params;
        const { latitude, longitude, timestamp, speed } = req.body;

        if (typeof latitude !== 'number' || typeof longitude !== 'number') {
            return next(new AppError('Latitude and longitude are required and must be numbers.', 400));
        }

        // Authorization: Typically, this would be an IoT device or a trusted system service.
        // API key or specific role-based access might be used here.
        // For simplicity, assuming admin or a special 'system' role.
        if (req.user.role !== 'admin' && req.user.role !== 'system') {
            return next(new AppError('You are not authorized to update this vehicle\'s location.', 403));
        }

        const updatedVehicle = await Vehicle.findByIdAndUpdate(
            vehicleId,
            {
                'currentLocation.coordinates': [longitude, latitude],
                'currentLocation.timestamp': timestamp || Date.now(),
                'currentLocation.speed': speed,
            },
            { new: true, runValidators: true }
        );

        if (!updatedVehicle) {
            return next(new AppError('Vehicle not found.', 404));
        }

        // TODO: Potentially emit WebSocket event for vehicle tracking
        // global.io.to(`vehicle_${vehicleId}`).emit('locationUpdate', { latitude, longitude });

        logger.info('Vehicle location updated', { vehicleId, latitude, longitude, updatedBy: req.user.id });
        res.status(200).json({ success: true, message: 'Vehicle location updated successfully.', data: updatedVehicle.currentLocation });

    } catch (error) {
        logger.error('Error updating vehicle location', { vehicleId: req.params.vehicleId, userId: req.user.id, error: error.message, stack: error.stack, body: req.body });
        if (error.name === 'ValidationError') {
            return next(new AppError(error.message, 400));
        }
        next(new AppError('Server error while updating vehicle location.', 500));
    }
};

/**
 * @desc    Get live location for an active trip (for user tracking)
 * @route   GET /api/v1/trips/:tripId/live-location
 * @access  Private (User associated with trip, Admin)
 */
exports.getTripLiveLocation = async (req, res, next) => {
  const { id: tripId } = req.params;
    try {
        const trip = await Trip.findById(tripId).populate('driver', 'currentLocation user').populate('vehicle', 'currentLocation');

        if (!trip) {
            return next(new AppError('Trip not found.', 404));
        }

        // Authorization: User must be the one who booked the trip or an admin.
        if (req.user.role !== 'admin' && trip.user.toString() !== req.user.id) {
            return next(new AppError('You are not authorized to view this trip\'s location.', 403));
        }

        if (trip.status !== 'ongoing' && trip.status !== 'driver_assigned' && trip.status !== 'en_route_to_pickup') {
            return next(new AppError('Live location is only available for active trips.', 400));
        }

        let locationData = null;
        if (trip.driver && trip.driver.currentLocation && trip.driver.currentLocation.coordinates.length === 2) {
            locationData = {
                source: 'driver',
                latitude: trip.driver.currentLocation.coordinates[1],
                longitude: trip.driver.currentLocation.coordinates[0],
                timestamp: trip.driver.currentLocation.timestamp,
            };
        } else if (trip.vehicle && trip.vehicle.currentLocation && trip.vehicle.currentLocation.coordinates.length === 2) {
            // Fallback to vehicle location if driver location is unavailable
            locationData = {
                source: 'vehicle',
                latitude: trip.vehicle.currentLocation.coordinates[1],
                longitude: trip.vehicle.currentLocation.coordinates[0],
                timestamp: trip.vehicle.currentLocation.timestamp,
            };
        }

        if (!locationData) {
            return next(new AppError('Location data for this trip is currently unavailable.', 404));
        }

        logger.info('Fetched live trip location', { tripId, userId: req.user.id });
        res.status(200).json({ success: true, data: locationData });

    } catch (error) {
        logger.error('Error fetching live trip location', { tripId, userId: req.user.id, error: error.message, stack: error.stack });
        next(new AppError('Server error while fetching live trip location.', 500));
    }
};

// Potential future additions:
// - Geofencing: createGeofence, checkGeofence, listGeofences
// - Route optimization based on real-time traffic (would likely integrate an external API)
// - Storing and retrieving historical location trails for drivers/vehicles