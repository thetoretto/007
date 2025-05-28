const User = require('../models/User');
const Trip = require('../models/Trip');
const Booking = require('../models/Booking');
const Vehicle = require('../models/Vehicle');
const Driver = require('../models/Driver');
const Payment = require('../models/Payment');
const Route = require('../models/Route');
const Hotpoint = require('../models/Hotpoint');
const Review = require('../models/Review'); // Assuming Review model exists
const SupportTicket = require('../models/SupportTicket'); // Assuming SupportTicket model exists
const { AppError } = require('../middleware/errorHandler');
const { createLogger } = require('../utils/logger');
const moment = require('moment'); // For date calculations

const logger = createLogger('DashboardController');

/**
 * @desc    Get main dashboard statistics
 * @route   GET /api/v1/admin/dashboard/stats
 * @access  Private (Admin)
 */
exports.getDashboardStats = async (req, res, next) => {
    try {
        const today = moment().startOf('day');
        const startOfMonth = moment().startOf('month');


        // User Stats
        const totalUsers = await User.countDocuments();
        const newUsersToday = await User.countDocuments({ 'metadata.createdAt': { $gte: today.toDate() } });
        const newUsersThisMonth = await User.countDocuments({ 'metadata.createdAt': { $gte: startOfMonth.toDate() } });
        const activeUsers = await User.countDocuments({ status: 'active' }); // Define 'active' based on last login or activity

        // Driver Stats
        const totalDrivers = await Driver.countDocuments();
        const approvedDrivers = await Driver.countDocuments({ status: 'approved' });
        const pendingDrivers = await Driver.countDocuments({ status: 'pending_approval' });

        // Vehicle Stats
        const totalVehicles = await Vehicle.countDocuments();
        const availableVehicles = await Vehicle.countDocuments({ status: 'available' });
        const maintenanceVehicles = await Vehicle.countDocuments({ status: 'maintenance' });

        // Booking Stats
        const totalBookings = await Booking.countDocuments();
        const bookingsToday = await Booking.countDocuments({ 'metadata.createdAt': { $gte: today.toDate() } });
        const confirmedBookings = await Booking.countDocuments({ status: 'confirmed' });
        const pendingBookings = await Booking.countDocuments({ status: 'pending' }); // Or 'pending_payment'

        // Trip Stats
        const totalTrips = await Trip.countDocuments();
        const ongoingTrips = await Trip.countDocuments({ status: 'ongoing' });
        const scheduledTripsToday = await Trip.countDocuments({
            'schedule.scheduledDeparture': {
                $gte: today.toDate(),
                $lt: moment(today).endOf('day').toDate()
            },
            status: { $in: ['scheduled', 'delayed'] }
        });
        const completedTripsThisMonth = await Trip.countDocuments({ status: 'completed', 'schedule.actualArrival': { $gte: startOfMonth.toDate() } });

        // Financial Stats (Simplified)
        const totalRevenueThisMonth = await Payment.aggregate([
            { $match: { status: 'succeeded', 'metadata.createdAt': { $gte: startOfMonth.toDate() } } },
            { $group: { _id: null, total: { $sum: '$amount.total' } } }
        ]);
        const revenueToday = await Payment.aggregate([
            { $match: { status: 'succeeded', 'metadata.createdAt': { $gte: today.toDate() } } },
            { $group: { _id: null, total: { $sum: '$amount.total' } } }
        ]);

        // Other counts
        const totalRoutes = await Route.countDocuments();
        const totalHotpoints = await Hotpoint.countDocuments();
        const openSupportTickets = await SupportTicket.countDocuments({ status: { $in: ['open', 'pending_agent_response', 'reopened'] } });

        logger.info('Fetched dashboard statistics', { adminUserId: req.user.id });
        res.status(200).json({
            success: true,
            data: {
                users: {
                    total: totalUsers,
                    newToday: newUsersToday,
                    newThisMonth: newUsersThisMonth,
                    active: activeUsers
                },
                drivers: {
                    total: totalDrivers,
                    approved: approvedDrivers,
                    pending: pendingDrivers
                },
                vehicles: {
                    total: totalVehicles,
                    available: availableVehicles,
                    maintenance: maintenanceVehicles
                },
                bookings: {
                    total: totalBookings,
                    today: bookingsToday,
                    confirmed: confirmedBookings,
                    pending: pendingBookings
                },
                trips: {
                    total: totalTrips,
                    ongoing: ongoingTrips,
                    scheduledToday: scheduledTripsToday,
                    completedThisMonth: completedTripsThisMonth
                },
                finance: {
                    revenueThisMonth: totalRevenueThisMonth.length > 0 ? totalRevenueThisMonth[0].total : 0,
                    revenueToday: revenueToday.length > 0 ? revenueToday[0].total : 0,
                },
                operational: {
                    routes: totalRoutes,
                    hotpoints: totalHotpoints,
                    openSupportTickets: openSupportTickets
                }
            }
        });
    } catch (error) {
        logger.error('Error fetching dashboard statistics', { adminUserId: req.user.id, error: error.message, stack: error.stack });
        next(new AppError('Server error while fetching dashboard statistics.', 500));
    }
};

/**
 * @desc    Get data for charts (e.g., user signups over time, revenue trends)
 * @route   GET /api/v1/admin/dashboard/charts
 * @access  Private (Admin)
 */
exports.getChartData = async (req, res, next) => {
    try {
        const { chartType, timeRange } = req.query; // e.g., chartType=userSignups, timeRange=last30days

        let data = {};
        const endDate = moment().endOf('day');
        let startDate;
        let dateFormat;
        let aggregationGroupFormat;

        switch (timeRange) {
            case 'last7days': startDate = moment().subtract(6, 'days').startOf('day'); dateFormat = 'MMM D'; aggregationGroupFormat = '%Y-%m-%d'; break;
            case 'last30days': startDate = moment().subtract(29, 'days').startOf('day'); dateFormat = 'MMM D'; aggregationGroupFormat = '%Y-%m-%d'; break;
            case 'last6months': startDate = moment().subtract(5, 'months').startOf('month'); dateFormat = 'MMM YYYY'; aggregationGroupFormat = '%Y-%m'; break;
            case 'last12months': startDate = moment().subtract(11, 'months').startOf('month'); dateFormat = 'MMM YYYY'; aggregationGroupFormat = '%Y-%m'; break;
            default: startDate = moment().subtract(29, 'days').startOf('day'); dateFormat = 'MMM D'; aggregationGroupFormat = '%Y-%m-%d'; // Default to last 30 days
        }

        if (chartType === 'userSignups') {
            const signups = await User.aggregate([
                { $match: { 'metadata.createdAt': { $gte: startDate.toDate(), $lte: endDate.toDate() } } },
                {
                    $group: {
                        _id: { $dateToString: { format: aggregationGroupFormat, date: '$metadata.createdAt' } },
                        count: { $sum: 1 }
                    }
                },
                { $sort: { _id: 1 } }
            ]);
            data.userSignups = { labels: signups.map(s => moment(s._id).format(dateFormat)), values: signups.map(s => s.count) };
        }

        if (chartType === 'revenueTrend') {
            const revenue = await Payment.aggregate([
                { $match: { status: 'succeeded', 'metadata.createdAt': { $gte: startDate.toDate(), $lte: endDate.toDate() } } },
                {
                    $group: {
                        _id: { $dateToString: { format: aggregationGroupFormat, date: '$metadata.createdAt' } },
                        totalAmount: { $sum: '$amount.total' }
                    }
                },
                { $sort: { _id: 1 } }
            ]);
            data.revenueTrend = { labels: revenue.map(r => moment(r._id).format(dateFormat)), values: revenue.map(r => r.totalAmount) };
        }
        
        if (chartType === 'tripStatusDistribution') {
            const tripStats = await Trip.aggregate([
                { $match: { 'metadata.createdAt': { $gte: startDate.toDate() } } }, // Or filter by schedule date
                { $group: { _id: '$status', count: { $sum: 1 } } },
                { $sort: { _id: 1 } }
            ]);
            data.tripStatusDistribution = { labels: tripStats.map(t => t._id), values: tripStats.map(t => t.count) };
        }

        if (chartType === 'bookingTrends') {
            const bookings = await Booking.aggregate([
                { $match: { 'metadata.createdAt': { $gte: startDate.toDate(), $lte: endDate.toDate() } } },
                {
                    $group: {
                        _id: { $dateToString: { format: aggregationGroupFormat, date: '$metadata.createdAt' } },
                        count: { $sum: 1 }
                    }
                },
                { $sort: { _id: 1 } }
            ]);
            data.bookingTrends = { labels: bookings.map(b => moment(b._id).format(dateFormat)), values: bookings.map(b => b.count) };
        }

        if (Object.keys(data).length === 0) {
            return next(new AppError('Invalid chart type or no data available for the selected parameters.', 400));
        }

        logger.info('Fetched chart data', { adminUserId: req.user.id, chartType, timeRange });
        res.status(200).json({ success: true, data });

    } catch (error) {
        logger.error('Error fetching chart data', { adminUserId: req.user.id, error: error.message, stack: error.stack, query: req.query });
        next(new AppError('Server error while fetching chart data.', 500));
    }
};

/**
 * @desc    Get recent activities (e.g., new users, new bookings, important system events)
 * @route   GET /api/v1/admin/dashboard/recent-activities
 * @access  Private (Admin)
 */
exports.getRecentActivities = async (req, res, next) => {
    try {
        const limit = parseInt(req.query.limit) || 10;

        const recentUsers = await User.find()
            .sort({ 'metadata.createdAt': -1 })
            .limit(limit / 2) // Example: half users, half bookings
            .select('profile.firstName profile.lastName email metadata.createdAt');

        const recentBookings = await Booking.find()
            .sort({ 'metadata.createdAt': -1 })
            .limit(limit / 2)
            .populate('user', 'profile.firstName profile.lastName')
            .populate('route', 'name')
            .select('bookingId user route status metadata.createdAt');
        
        // Could also fetch recent trips, payments, reviews, support tickets etc.
        // For simplicity, combining users and bookings, then sorting by date client-side or here if needed.

        const activities = [
            ...recentUsers.map(u => ({ type: 'New User', details: `${u.profile.firstName} ${u.profile.lastName} (${u.email})`, timestamp: u.metadata.createdAt, id: u._id })),
            ...recentBookings.map(b => ({ type: 'New Booking', details: `Booking ${b.bookingId} by ${b.user.profile.firstName} for route ${b.route ? b.route.name : 'N/A'}`, status: b.status, timestamp: b.metadata.createdAt, id: b._id }))
        ].sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp)).slice(0, limit);

        logger.info('Fetched recent activities', { adminUserId: req.user.id, limit });
        res.status(200).json({ success: true, data: activities });

    } catch (error) {
        logger.error('Error fetching recent activities', { adminUserId: req.user.id, error: error.message, stack: error.stack });
        next(new AppError('Server error while fetching recent activities.', 500));
    }
};

/**
 * @desc    Get key performance indicators (KPIs) - more specific than general stats
 * @route   GET /api/v1/admin/dashboard/kpis
 * @access  Private (Admin)
 */
exports.getKPIs = async (req, res, next) => {
    try {
        // Example KPIs - these can be highly specific to business goals

        // Average booking value
        const avgBookingValueAgg = await Payment.aggregate([
            { $match: { status: 'succeeded' } }, // Consider only successful payments
            { $group: { _id: null, totalRevenue: { $sum: '$amount.total' }, totalBookings: { $sum: 1 } } }, // Assuming 1 payment per booking for simplicity
            { $project: { average: { $cond: [ { $eq: ['$totalBookings', 0] }, 0, { $divide: ['$totalRevenue', '$totalBookings'] } ] } } }
        ]);
        const averageBookingValue = avgBookingValueAgg.length > 0 ? avgBookingValueAgg[0].average : 0;

        // Driver utilization (e.g., percentage of approved drivers with an active trip or recent trip)
        // This would require more complex logic, e.g., checking Driver.assignedTrips or Trip.driver
        const activeDriversWithTrips = await Trip.distinct('driver', { status: { $in: ['ongoing', 'scheduled'] }, driver: { $ne: null } });
        const totalApprovedDrivers = await Driver.countDocuments({ status: 'approved' });
        const driverUtilization = totalApprovedDrivers > 0 ? (activeDriversWithTrips.length / totalApprovedDrivers) * 100 : 0;

        // Customer satisfaction (e.g., average rating from reviews)
        const avgRatingAgg = await Review.aggregate([
            { $group: { _id: null, averageRating: { $avg: '$rating' }, totalReviews: { $sum: 1 } } }
        ]);
        const averageCustomerRating = avgRatingAgg.length > 0 ? avgRatingAgg[0].averageRating : 0;
        const totalCustomerReviews = avgRatingAgg.length > 0 ? avgRatingAgg[0].totalReviews : 0;

        // Support ticket resolution time (average)
        // Requires storing resolution time on SupportTicket model or calculating from timestamps
        // Example: (resolvedAt - createdAt) for resolved tickets
        const avgResolutionTimeAgg = await SupportTicket.aggregate([
            { $match: { status: 'resolved', resolvedAt: { $ne: null }, 'metadata.createdAt': { $ne: null } } },
            {
                $project: {
                    resolutionTimeHours: { 
                        $divide: [ { $subtract: ['$resolvedAt', '$metadata.createdAt'] }, 1000 * 60 * 60 ] 
                    }
                }
            },
            { $group: { _id: null, averageHours: { $avg: '$resolutionTimeHours' } } }
        ]);
        const averageTicketResolutionTimeHours = avgResolutionTimeAgg.length > 0 ? avgResolutionTimeAgg[0].averageHours : null;


        logger.info('Fetched KPIs', { adminUserId: req.user.id });
        res.status(200).json({
            success: true,
            data: {
                averageBookingValue: parseFloat(averageBookingValue.toFixed(2)),
                driverUtilizationPercentage: parseFloat(driverUtilization.toFixed(2)),
                averageCustomerRating: parseFloat(averageCustomerRating.toFixed(2)),
                totalCustomerReviews,
                averageTicketResolutionTimeHours: averageTicketResolutionTimeHours ? parseFloat(averageTicketResolutionTimeHours.toFixed(2)) : 'N/A'
            }
        });

    } catch (error) {
        logger.error('Error fetching KPIs', { adminUserId: req.user.id, error: error.message, stack: error.stack });
        next(new AppError('Server error while fetching KPIs.', 500));
    }
};