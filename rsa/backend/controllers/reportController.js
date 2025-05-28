const User = require('../models/User');
const Trip = require('../models/Trip');
const Booking = require('../models/Booking');
const Vehicle = require('../models/Vehicle');
const Driver = require('../models/Driver');
const Payment = require('../models/Payment');
const Route = require('../models/Route');
const Review = require('../models/Review');
const { AppError } = require('../middleware/errorHandler');
const { createLogger } = require('../utils/logger');
const moment = require('moment');
const { Parser } = require('json2csv'); // For CSV export
const PDFDocument = require('pdfkit'); // For PDF export

const logger = createLogger('ReportController');

// Helper function to format date ranges for queries
const getDateRange = (startDateStr, endDateStr) => {
    const startDate = startDateStr ? moment(startDateStr).startOf('day').toDate() : moment().subtract(30, 'days').startOf('day').toDate();
    const endDate = endDateStr ? moment(endDateStr).endOf('day').toDate() : moment().endOf('day').toDate();
    if (moment(startDate).isAfter(moment(endDate))) {
        throw new AppError('Start date cannot be after end date.', 400);
    }
    return { startDate, endDate };
};

/**
 * @desc    Generate Financial Report (Revenue, Expenses, Profit)
 * @route   GET /api/v1/admin/reports/financial
 * @access  Private (Admin)
 * @query   startDate, endDate, format (json, csv, pdf)
 */
exports.generateFinancialReport = async (req, res, next) => {
    try {
        const { startDate: startDateStr, endDate: endDateStr, format = 'json' } = req.query;
        const { startDate, endDate } = getDateRange(startDateStr, endDateStr);

        const revenueData = await Payment.aggregate([
            { $match: { status: 'succeeded', 'metadata.createdAt': { $gte: startDate, $lte: endDate } } },
            { $group: { _id: null, totalRevenue: { $sum: '$amount.total' }, count: { $sum: 1 } } }
        ]);

        const totalRevenue = revenueData.length > 0 ? revenueData[0].totalRevenue : 0;
        const totalTransactions = revenueData.length > 0 ? revenueData[0].count : 0;

        // Placeholder for expenses - this would typically come from another model or integration
        const totalExpenses = 0; // Example: await Expense.sum('amount', { where: { date: { [Op.between]: [startDate, endDate]}}});
        const netProfit = totalRevenue - totalExpenses;

        const reportData = {
            reportType: 'Financial Report',
            period: {
                from: moment(startDate).format('YYYY-MM-DD'),
                to: moment(endDate).format('YYYY-MM-DD'),
            },
            summary: {
                totalRevenue: parseFloat(totalRevenue.toFixed(2)),
                totalTransactions,
                totalExpenses: parseFloat(totalExpenses.toFixed(2)),
                netProfit: parseFloat(netProfit.toFixed(2)),
            },
            // Optional: detailed breakdown by day/week/month or payment method
        };

        logger.info('Generated financial report', { adminUserId: req.user.id, period: reportData.period, format });

        if (format === 'csv') {
            const fields = [
                { label: 'Metric', value: 'metric' },
                { label: 'Value', value: 'value' },
            ];
            const dataForCsv = [
                { metric: 'Total Revenue', value: reportData.summary.totalRevenue },
                { metric: 'Total Transactions', value: reportData.summary.totalTransactions },
                { metric: 'Total Expenses', value: reportData.summary.totalExpenses },
                { metric: 'Net Profit', value: reportData.summary.netProfit },
            ];
            const json2csvParser = new Parser({ fields });
            const csv = json2csvParser.parse(dataForCsv);
            res.header('Content-Type', 'text/csv');
            res.attachment(`financial-report-${reportData.period.from}-to-${reportData.period.to}.csv`);
            return res.send(csv);
        } else if (format === 'pdf') {
            const doc = new PDFDocument({ margin: 50 });
            res.setHeader('Content-Type', 'application/pdf');
            res.setHeader('Content-Disposition', `attachment; filename=financial-report-${reportData.period.from}-to-${reportData.period.to}.pdf`);
            doc.pipe(res);

            doc.fontSize(18).text(reportData.reportType, { align: 'center' });
            doc.fontSize(12).text(`Period: ${reportData.period.from} to ${reportData.period.to}`, { align: 'center' });
            doc.moveDown(2);
            doc.fontSize(14).text('Summary:', { underline: true });
            doc.moveDown();
            doc.text(`Total Revenue: ${reportData.summary.totalRevenue.toLocaleString(undefined, { style: 'currency', currency: 'USD' /* Adjust currency */ })}`);
            doc.text(`Total Transactions: ${reportData.summary.totalTransactions}`);
            doc.text(`Total Expenses: ${reportData.summary.totalExpenses.toLocaleString(undefined, { style: 'currency', currency: 'USD' })}`);
            doc.text(`Net Profit: ${reportData.summary.netProfit.toLocaleString(undefined, { style: 'currency', currency: 'USD' })}`);
            doc.end();
            return;
        }

        res.status(200).json({ success: true, data: reportData });

    } catch (error) {
        logger.error('Error generating financial report', { adminUserId: req.user.id, error: error.message, stack: error.stack, query: req.query });
        if (error instanceof AppError) return next(error);
        next(new AppError('Server error while generating financial report.', 500));
    }
};

/**
 * @desc    Generate Booking Report (Volume, Trends, Cancellations)
 * @route   GET /api/v1/admin/reports/bookings
 * @access  Private (Admin)
 * @query   startDate, endDate, routeId, status, format (json, csv, pdf)
 */
exports.generateBookingReport = async (req, res, next) => {
    try {
        const { startDate: startDateStr, endDate: endDateStr, routeId, status, format = 'json' } = req.query;
        const { startDate, endDate } = getDateRange(startDateStr, endDateStr);

        let matchQuery = { 'metadata.createdAt': { $gte: startDate, $lte: endDate } };
        if (routeId) matchQuery.route = routeId;
        if (status) matchQuery.status = status;

        const bookings = await Booking.find(matchQuery)
            .populate('user', 'profile.firstName profile.lastName email')
            .populate('trip', 'tripId')
            .populate('route', 'name')
            .sort({ 'metadata.createdAt': -1 });

        const totalBookings = bookings.length;
        const totalRevenueFromBookings = bookings.reduce((sum, booking) => sum + (booking.payment && booking.payment.status === 'succeeded' ? booking.payment.amount.total : 0), 0);
        const cancellationRate = totalBookings > 0 ? (bookings.filter(b => b.status === 'cancelled').length / totalBookings) * 100 : 0;

        const reportData = {
            reportType: 'Booking Report',
            period: { from: moment(startDate).format('YYYY-MM-DD'), to: moment(endDate).format('YYYY-MM-DD') },
            filters: { routeId, status },
            summary: {
                totalBookings,
                totalRevenueFromBookings: parseFloat(totalRevenueFromBookings.toFixed(2)),
                cancellationRate: parseFloat(cancellationRate.toFixed(2)),
            },
            bookings: bookings.map(b => ({
                bookingId: b.bookingId,
                user: b.user ? `${b.user.profile.firstName} ${b.user.profile.lastName} (${b.user.email})` : 'N/A',
                tripId: b.trip ? b.trip.tripId : 'N/A',
                route: b.route ? b.route.name : 'N/A',
                status: b.status,
                bookingDate: moment(b.metadata.createdAt).format('YYYY-MM-DD HH:mm'),
                amount: b.pricing.totalAmount,
                paymentStatus: b.payment && b.payment.status ? b.payment.status : 'N/A'
            }))
        };

        logger.info('Generated booking report', { adminUserId: req.user.id, period: reportData.period, filters: reportData.filters, format });

        if (format === 'csv') {
            const fields = [
                { label: 'Booking ID', value: 'bookingId' },
                { label: 'User', value: 'user' },
                { label: 'Trip ID', value: 'tripId' },
                { label: 'Route', value: 'route' },
                { label: 'Status', value: 'status' },
                { label: 'Booking Date', value: 'bookingDate' },
                { label: 'Amount', value: 'amount' },
                { label: 'Payment Status', value: 'paymentStatus' },
            ];
            const json2csvParser = new Parser({ fields });
            const csv = json2csvParser.parse(reportData.bookings);
            res.header('Content-Type', 'text/csv');
            res.attachment(`booking-report-${reportData.period.from}-to-${reportData.period.to}.csv`);
            return res.send(csv);
        } else if (format === 'pdf') {
            // PDF generation for booking list can be complex, basic summary for now
            const doc = new PDFDocument({ margin: 50, layout: 'landscape' });
            res.setHeader('Content-Type', 'application/pdf');
            res.setHeader('Content-Disposition', `attachment; filename=booking-report-${reportData.period.from}-to-${reportData.period.to}.pdf`);
            doc.pipe(res);
            doc.fontSize(18).text(reportData.reportType, { align: 'center' });
            doc.fontSize(12).text(`Period: ${reportData.period.from} to ${reportData.period.to}`, { align: 'center' });
            if(routeId) doc.text(`Route ID: ${routeId}`, { align: 'center' });
            if(status) doc.text(`Status: ${status}`, { align: 'center' });
            doc.moveDown(2);
            doc.fontSize(14).text('Summary:', { underline: true });
            doc.text(`Total Bookings: ${reportData.summary.totalBookings}`);
            doc.text(`Total Revenue from Bookings: ${reportData.summary.totalRevenueFromBookings.toLocaleString(undefined, { style: 'currency', currency: 'USD' })}`);
            doc.text(`Cancellation Rate: ${reportData.summary.cancellationRate.toFixed(2)}%`);
            // Add table for bookings if needed (more complex with pdfkit)
            doc.end();
            return;
        }

        res.status(200).json({ success: true, data: reportData });

    } catch (error) {
        logger.error('Error generating booking report', { adminUserId: req.user.id, error: error.message, stack: error.stack, query: req.query });
        if (error instanceof AppError) return next(error);
        next(new AppError('Server error while generating booking report.', 500));
    }
};

/**
 * @desc    Generate User Activity Report (Signups, Logins, Engagement)
 * @route   GET /api/v1/admin/reports/user-activity
 * @access  Private (Admin)
 * @query   startDate, endDate, userStatus, format (json, csv, pdf)
 */
exports.generateUserActivityReport = async (req, res, next) => {
    try {
        const { startDate: startDateStr, endDate: endDateStr, userStatus, format = 'json' } = req.query;
        const { startDate, endDate } = getDateRange(startDateStr, endDateStr);

        let userMatchQuery = { 'metadata.createdAt': { $gte: startDate, $lte: endDate } };
        if (userStatus) userMatchQuery.status = userStatus;

        const users = await User.find(userMatchQuery)
            .select('profile.firstName profile.lastName email status roles metadata.createdAt metadata.lastLogin')
            .sort({ 'metadata.createdAt': -1 });

        const totalNewSignups = users.length;
        // Login data would ideally come from a separate audit log or more detailed user activity tracking
        // For simplicity, we'll use lastLogin if available
        const activeUsersInPeriod = await User.countDocuments({
            'metadata.lastLogin': { $gte: startDate, $lte: endDate },
            status: 'active'
        });

        const reportData = {
            reportType: 'User Activity Report',
            period: { from: moment(startDate).format('YYYY-MM-DD'), to: moment(endDate).format('YYYY-MM-DD') },
            filters: { userStatus },
            summary: {
                totalNewSignups,
                activeUsersInPeriod, // This is a simplified metric
            },
            users: users.map(u => ({
                userId: u._id,
                name: `${u.profile.firstName} ${u.profile.lastName}`,
                email: u.email,
                status: u.status,
                roles: u.roles.join(', '),
                signupDate: moment(u.metadata.createdAt).format('YYYY-MM-DD HH:mm'),
                lastLogin: u.metadata.lastLogin ? moment(u.metadata.lastLogin).format('YYYY-MM-DD HH:mm') : 'N/A',
            }))
        };

        logger.info('Generated user activity report', { adminUserId: req.user.id, period: reportData.period, filters: reportData.filters, format });

        if (format === 'csv') {
            const fields = [
                { label: 'User ID', value: 'userId' },
                { label: 'Name', value: 'name' },
                { label: 'Email', value: 'email' },
                { label: 'Status', value: 'status' },
                { label: 'Roles', value: 'roles' },
                { label: 'Signup Date', value: 'signupDate' },
                { label: 'Last Login', value: 'lastLogin' },
            ];
            const json2csvParser = new Parser({ fields });
            const csv = json2csvParser.parse(reportData.users);
            res.header('Content-Type', 'text/csv');
            res.attachment(`user-activity-report-${reportData.period.from}-to-${reportData.period.to}.csv`);
            return res.send(csv);
        }
        // PDF for user list would be similar to booking list - basic summary for now
        else if (format === 'pdf') {
            const doc = new PDFDocument({ margin: 50, layout: 'landscape' });
            res.setHeader('Content-Type', 'application/pdf');
            res.setHeader('Content-Disposition', `attachment; filename=user-activity-report-${reportData.period.from}-to-${reportData.period.to}.pdf`);
            doc.pipe(res);
            doc.fontSize(18).text(reportData.reportType, { align: 'center' });
            doc.fontSize(12).text(`Period: ${reportData.period.from} to ${reportData.period.to}`, { align: 'center' });
            if(userStatus) doc.text(`User Status: ${userStatus}`, { align: 'center' });
            doc.moveDown(2);
            doc.fontSize(14).text('Summary:', { underline: true });
            doc.text(`Total New Signups: ${reportData.summary.totalNewSignups}`);
            doc.text(`Active Users in Period (based on last login): ${reportData.summary.activeUsersInPeriod}`);
            doc.end();
            return;
        }

        res.status(200).json({ success: true, data: reportData });

    } catch (error) {
        logger.error('Error generating user activity report', { adminUserId: req.user.id, error: error.message, stack: error.stack, query: req.query });
        if (error instanceof AppError) return next(error);
        next(new AppError('Server error while generating user activity report.', 500));
    }
};

/**
 * @desc    Generate Driver Performance Report
 * @route   GET /api/v1/admin/reports/driver-performance
 * @access  Private (Admin)
 * @query   startDate, endDate, driverId, format (json, csv, pdf)
 */
exports.generateDriverPerformanceReport = async (req, res, next) => {
    try {
        const { startDate: startDateStr, endDate: endDateStr, driverId, format = 'json' } = req.query;
        const { startDate, endDate } = getDateRange(startDateStr, endDateStr);

        let driverMatch = {};
        if (driverId) driverMatch._id = driverId;

        const drivers = await Driver.find(driverMatch)
            .populate('user', 'profile.firstName profile.lastName')
            .select('user licenseDetails performanceMetrics.averageRating performanceMetrics.completedTrips performanceMetrics.acceptanceRate status');

        const reportData = {
            reportType: 'Driver Performance Report',
            period: { from: moment(startDate).format('YYYY-MM-DD'), to: moment(endDate).format('YYYY-MM-DD') }, // Note: Performance metrics might not be strictly time-bound in this simple model
            filters: { driverId },
            drivers: await Promise.all(drivers.map(async (driver) => {
                const tripsInPeriod = await Trip.countDocuments({
                    driver: driver._id,
                    status: 'completed',
                    'schedule.actualArrival': { $gte: startDate, $lte: endDate }
                });
                const reviews = await Review.find({ reviewForType: 'Driver', reviewForId: driver._id, 'metadata.createdAt': { $gte: startDate, $lte: endDate } });
                const averageRatingInPeriod = reviews.length > 0 ? reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length : 0;

                return {
                    driverId: driver._id,
                    name: driver.user ? `${driver.user.profile.firstName} ${driver.user.profile.lastName}` : 'N/A',
                    licenseNumber: driver.licenseDetails.licenseNumber,
                    status: driver.status,
                    overallAverageRating: driver.performanceMetrics.averageRating || 0,
                    overallCompletedTrips: driver.performanceMetrics.completedTrips || 0,
                    tripsCompletedInPeriod: tripsInPeriod,
                    averageRatingInPeriod: parseFloat(averageRatingInPeriod.toFixed(2)),
                    reviewsInPeriod: reviews.length
                };
            }))
        };

        logger.info('Generated driver performance report', { adminUserId: req.user.id, period: reportData.period, filters: reportData.filters, format });

        if (format === 'csv') {
            const fields = [
                { label: 'Driver ID', value: 'driverId' },
                { label: 'Name', value: 'name' },
                { label: 'License Number', value: 'licenseNumber' },
                { label: 'Status', value: 'status' },
                { label: 'Overall Avg Rating', value: 'overallAverageRating' },
                { label: 'Overall Completed Trips', value: 'overallCompletedTrips' },
                { label: 'Trips in Period', value: 'tripsCompletedInPeriod' },
                { label: 'Avg Rating in Period', value: 'averageRatingInPeriod' },
                { label: 'Reviews in Period', value: 'reviewsInPeriod' },
            ];
            const json2csvParser = new Parser({ fields });
            const csv = json2csvParser.parse(reportData.drivers);
            res.header('Content-Type', 'text/csv');
            res.attachment(`driver-performance-report-${reportData.period.from}-to-${reportData.period.to}.csv`);
            return res.send(csv);
        }
        // PDF for driver list - basic summary for now
        else if (format === 'pdf') {
            const doc = new PDFDocument({ margin: 50, layout: 'landscape' });
            res.setHeader('Content-Type', 'application/pdf');
            res.setHeader('Content-Disposition', `attachment; filename=driver-performance-report-${reportData.period.from}-to-${reportData.period.to}.pdf`);
            doc.pipe(res);
            doc.fontSize(18).text(reportData.reportType, { align: 'center' });
            doc.fontSize(12).text(`Period: ${reportData.period.from} to ${reportData.period.to}`, { align: 'center' });
            if(driverId) doc.text(`Driver ID: ${driverId}`, { align: 'center' });
            doc.moveDown(2);
            doc.fontSize(14).text('Driver Details:', { underline: true });
            // Loop through drivers for PDF (can get lengthy)
            reportData.drivers.forEach(d => {
                doc.moveDown();
                doc.text(`Driver: ${d.name} (ID: ${d.driverId})`);
                doc.text(`  Trips in Period: ${d.tripsCompletedInPeriod}, Avg Rating in Period: ${d.averageRatingInPeriod}`);
            });
            doc.end();
            return;
        }

        res.status(200).json({ success: true, data: reportData });

    } catch (error) {
        logger.error('Error generating driver performance report', { adminUserId: req.user.id, error: error.message, stack: error.stack, query: req.query });
        if (error instanceof AppError) return next(error);
        next(new AppError('Server error while generating driver performance report.', 500));
    }
};

// Add more report types as needed: Vehicle Utilization, Route Popularity, etc.