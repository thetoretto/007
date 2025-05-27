const Feedback = require('../models/Feedback'); // Assuming Feedback model will be created
const User = require('../models/User');
const { AppError } = require('../middleware/errorHandler');
const { createLogger } = require('../utils/logger');
const { sendEmail } = require('../utils/emailHandler'); // Optional: for notifying admins

const logger = createLogger('FeedbackController');

/**
 * @desc    Submit new feedback
 * @route   POST /api/v1/feedback
 * @access  Private (Authenticated Users)
 */
exports.submitFeedback = async (req, res, next) => {
    try {
        const { category, subject, message, rating, relatedTo, entityId, contactPermitted } = req.body;
        const userId = req.user.id;

        if (!category || !message) {
            return next(new AppError('Category and message are required for feedback.', 400));
        }

        const feedbackData = {
            user: userId,
            category, // e.g., 'general', 'bug_report', 'feature_request', 'complaint', 'compliment'
            subject, // Optional subject line
            message,
            rating, // Optional: 1-5 star rating
            relatedTo, // Optional: e.g., 'trip', 'route', 'driver', 'vehicle', 'app_feature'
            entityId, // Optional: ID of the related entity (e.g., tripId, routeId)
            contactPermitted: contactPermitted !== undefined ? contactPermitted : true, // Default to true
            status: 'submitted', // Initial status
            userAgent: req.headers['user-agent'],
            ipAddress: req.ip
        };

        const newFeedback = await Feedback.create(feedbackData);

        logger.info('New feedback submitted', { userId, feedbackId: newFeedback._id, category });

        // Optional: Notify admin(s) about new feedback
        try {
            const adminUsers = await User.find({ roles: 'admin', 'profile.communicationPreferences.emailNotifications': true });
            if (adminUsers.length > 0) {
                const adminEmails = adminUsers.map(admin => admin.email);
                await sendEmail({
                    to: adminEmails.join(','),
                    subject: `New Feedback Submitted: ${category} - ${subject || 'No Subject'}`, // TODO: Use a template
                    text: `A new piece of feedback has been submitted by user ID ${userId}.\n\nCategory: ${category}\nSubject: ${subject || 'N/A'}\nMessage: ${message}\n\nView details in the admin panel.`, // TODO: Use a template
                    // html: emailTemplate(...)
                });
            }
        } catch (emailError) {
            logger.error('Failed to send feedback notification email to admins', { feedbackId: newFeedback._id, error: emailError.message });
            // Do not fail the request if email sending fails
        }

        res.status(201).json({
            success: true,
            message: 'Feedback submitted successfully. Thank you!',
            data: newFeedback
        });

    } catch (error) {
        logger.error('Error submitting feedback', { userId: req.user.id, error: error.message, stack: error.stack, body: req.body });
        if (error.name === 'ValidationError') {
            return next(new AppError(Object.values(error.errors).map(e => e.message).join(', '), 400));
        }
        next(new AppError('Server error while submitting feedback.', 500));
    }
};

/**
 * @desc    Get all feedback entries (for admins)
 * @route   GET /api/v1/admin/feedback
 * @access  Private (Admin)
 * @query   category, status, userId, startDate, endDate, page, limit, sortBy, sortOrder
 */
exports.getAllFeedback = async (req, res, next) => {
    try {
        const {
            category,
            status,
            userId,
            startDate: startDateStr,
            endDate: endDateStr,
            page = 1,
            limit = 20,
            sortBy = 'createdAt',
            sortOrder = 'desc'
        } = req.query;

        let query = {};

        if (category) query.category = { $regex: category, $options: 'i' };
        if (status) query.status = status;
        if (userId) query.user = userId;

        if (startDateStr || endDateStr) {
            query.createdAt = {};
            if (startDateStr) query.createdAt.$gte = new Date(startDateStr + 'T00:00:00.000Z');
            if (endDateStr) query.createdAt.$lte = new Date(endDateStr + 'T23:59:59.999Z');
            if (startDateStr && endDateStr && new Date(query.createdAt.$gte) > new Date(query.createdAt.$lte)){
                 return next(new AppError('Start date cannot be after end date.', 400));
            }
        }

        const sortOptions = {};
        sortOptions[sortBy] = sortOrder === 'asc' ? 1 : -1;

        const totalFeedback = await Feedback.countDocuments(query);
        const feedbackEntries = await Feedback.find(query)
            .populate('user', 'profile.firstName profile.lastName email')
            .sort(sortOptions)
            .skip((page - 1) * limit)
            .limit(parseInt(limit));

        logger.info('Fetched all feedback entries', { adminUserId: req.user.id, query, page, limit, totalFeedback });

        res.status(200).json({
            success: true,
            count: feedbackEntries.length,
            total: totalFeedback,
            pagination: {
                currentPage: parseInt(page),
                totalPages: Math.ceil(totalFeedback / limit),
                limit: parseInt(limit)
            },
            data: feedbackEntries
        });

    } catch (error) {
        logger.error('Error fetching all feedback', { adminUserId: req.user.id, error: error.message, stack: error.stack, query: req.query });
        next(new AppError('Server error while fetching feedback.', 500));
    }
};

/**
 * @desc    Get a specific feedback entry by ID (for admins)
 * @route   GET /api/v1/admin/feedback/:id
 * @access  Private (Admin)
 */
exports.getFeedbackById = async (req, res, next) => {
    try {
        const feedbackEntry = await Feedback.findById(req.params.id)
            .populate('user', 'profile.firstName profile.lastName email');

        if (!feedbackEntry) {
            logger.warn('Feedback entry not found', { adminUserId: req.user.id, feedbackId: req.params.id });
            return next(new AppError('Feedback entry not found.', 404));
        }

        logger.info('Fetched feedback entry by ID', { adminUserId: req.user.id, feedbackId: req.params.id });
        res.status(200).json({ success: true, data: feedbackEntry });

    } catch (error) {
        logger.error('Error fetching feedback by ID', { adminUserId: req.user.id, feedbackId: req.params.id, error: error.message, stack: error.stack });
        if (error.name === 'CastError') {
            return next(new AppError(`Invalid feedback ID: ${req.params.id}`, 400));
        }
        next(new AppError('Server error while fetching feedback entry.', 500));
    }
};

/**
 * @desc    Update feedback status or add admin notes (for admins)
 * @route   PUT /api/v1/admin/feedback/:id
 * @access  Private (Admin)
 */
exports.updateFeedback = async (req, res, next) => {
    try {
        const { status, adminNotes } = req.body;
        const feedbackId = req.params.id;

        const feedbackEntry = await Feedback.findById(feedbackId);

        if (!feedbackEntry) {
            logger.warn('Feedback entry not found for update', { adminUserId: req.user.id, feedbackId });
            return next(new AppError('Feedback entry not found.', 404));
        }

        if (status) feedbackEntry.status = status; // e.g., 'reviewed', 'in_progress', 'resolved', 'archived'
        if (adminNotes) {
            feedbackEntry.adminNotes = feedbackEntry.adminNotes || [];
            feedbackEntry.adminNotes.push({
                note: adminNotes,
                adminUser: req.user.id,
                timestamp: new Date()
            });
        }
        feedbackEntry.lastUpdatedAt = new Date();

        await feedbackEntry.save();

        logger.info('Feedback entry updated', { adminUserId: req.user.id, feedbackId, newStatus: status });
        res.status(200).json({ success: true, data: feedbackEntry });

    } catch (error) {
        logger.error('Error updating feedback', { adminUserId: req.user.id, feedbackId: req.params.id, error: error.message, stack: error.stack, body: req.body });
        if (error.name === 'ValidationError') {
            return next(new AppError(Object.values(error.errors).map(e => e.message).join(', '), 400));
        }
        if (error.name === 'CastError') {
            return next(new AppError(`Invalid feedback ID: ${req.params.id}`, 400));
        }
        next(new AppError('Server error while updating feedback.', 500));
    }
};

/**
 * @desc    Delete a feedback entry (for admins)
 * @route   DELETE /api/v1/admin/feedback/:id
 * @access  Private (Admin)
 */
exports.deleteFeedback = async (req, res, next) => {
    try {
        const feedbackId = req.params.id;
        const feedbackEntry = await Feedback.findById(feedbackId);

        if (!feedbackEntry) {
            logger.warn('Feedback entry not found for deletion', { adminUserId: req.user.id, feedbackId });
            return next(new AppError('Feedback entry not found.', 404));
        }

        await feedbackEntry.remove(); // Or soft delete if preferred

        logger.info('Feedback entry deleted', { adminUserId: req.user.id, feedbackId });
        res.status(200).json({ success: true, message: 'Feedback entry deleted successfully.' });

    } catch (error) {
        logger.error('Error deleting feedback', { adminUserId: req.user.id, feedbackId: req.params.id, error: error.message, stack: error.stack });
        if (error.name === 'CastError') {
            return next(new AppError(`Invalid feedback ID: ${req.params.id}`, 400));
        }
        next(new AppError('Server error while deleting feedback.', 500));
    }
};

/**
 * @desc    Get distinct values for feedback filters (e.g., categories, statuses)
 * @route   GET /api/v1/admin/feedback/filters
 * @access  Private (Admin)
 */
exports.getFeedbackFilterOptions = async (req, res, next) => {
    try {
        const categories = await Feedback.distinct('category');
        const statuses = await Feedback.distinct('status');
        // Could also get distinct 'relatedTo' if it becomes a standard field

        logger.info('Fetched feedback filter options', { adminUserId: req.user.id });
        res.status(200).json({
            success: true,
            data: {
                categories: categories.sort(),
                statuses: statuses.sort()
            }
        });
    } catch (error) {
        logger.error('Error fetching feedback filter options', { adminUserId: req.user.id, error: error.message, stack: error.stack });
        next(new AppError('Server error while fetching filter options for feedback.', 500));
    }
};