const AuditLog = require('../models/AuditLog'); // Assuming AuditLog model will be created
const { AppError } = require('../middleware/errorHandler');
const { createLogger } = require('../utils/logger');
const moment = require('moment');

const logger = createLogger('AuditLogController');

/**
 * @desc    Get all audit logs (with filtering and pagination)
 * @route   GET /api/v1/admin/audit-logs
 * @access  Private (Admin - or specific roles with audit permissions)
 * @query   userId, actionType, entityType, entityId, startDate, endDate, page, limit, sortBy, sortOrder
 */
exports.getAuditLogs = async (req, res, _next) => {
    try {
        const { 
            userId, 
            actionType, 
            entityType, 
            entityId, 
            startDate: startDateStr, 
            endDate: endDateStr, 
            ipAddress,
            status,
            page = 1, 
            limit = 20, 
            sortBy = 'timestamp', 
            sortOrder = 'desc' 
        } = req.query;

        let query = {};

        if (userId) query.user = userId;
        if (actionType) query.actionType = { $regex: actionType, $options: 'i' };
        if (entityType) query.entityType = { $regex: entityType, $options: 'i' };
        if (entityId) query.entityId = entityId;
        if (ipAddress) query.ipAddress = ipAddress;
        if (status) query.status = status; 

        if (startDateStr || endDateStr) {
            query.timestamp = {};
            if (startDateStr) query.timestamp.$gte = moment(startDateStr).startOf('day').toDate();
            if (endDateStr) query.timestamp.$lte = moment(endDateStr).endOf('day').toDate();
            if (startDateStr && endDateStr && moment(startDateStr).isAfter(moment(endDateStr))){
                return next(new AppError('Start date cannot be after end date.', 400));
            }
        }

        const sortOptions = {};
        sortOptions[sortBy] = sortOrder === 'asc' ? 1 : -1;

        const totalLogs = await AuditLog.countDocuments(query);
        const logs = await AuditLog.find(query)
            .populate('user', 'profile.firstName profile.lastName email') // Populate user details
            .sort(sortOptions)
            .skip((page - 1) * limit)
            .limit(parseInt(limit));

        logger.info('Fetched audit logs', { adminUserId: req.user.id, query, page, limit, totalLogs });

        res.status(200).json({
            success: true,
            count: logs.length,
            total: totalLogs,
            pagination: {
                currentPage: parseInt(page),
                totalPages: Math.ceil(totalLogs / limit),
                limit: parseInt(limit)
            },
            data: logs
        });

    } catch (error) {
        logger.error('Error retrieving audit logs', { adminUserId: req.user.id, error: error.message, stack: error.stack, query: req.query });
        _next(new AppError('Server error while retrieving audit logs.', 500));
    }
};

/**
 * @desc    Get a specific audit log entry by ID
 * @route   GET /api/v1/admin/audit-logs/:id
 * @access  Private (Admin)
 */
exports.getAuditLogById = async (req, res, _next) => {
    try {
        const logEntry = await AuditLog.findById(req.params.id)
            .populate('user', 'profile.firstName profile.lastName email');

        if (!logEntry) {
            logger.warn('Audit log entry not found', { adminUserId: req.user.id, logId: req.params.id });
            return next(new AppError('Audit log entry not found.', 404));
        }

        logger.info('Fetched audit log entry by ID', { adminUserId: req.user.id, logId: req.params.id });
        res.status(200).json({ success: true, data: logEntry });

    } catch (error) {
        logger.error(`Error retrieving audit log by ID ${req.params.id}`, { logId: req.params.id, adminUserId: req.user.id, error: error.message, stack: error.stack });
        _next(new AppError('Server error while retrieving audit log.', 500));
    }
};

/**
 * @desc    Get distinct values for audit log filters (e.g., actionTypes, entityTypes)
 * @route   GET /api/v1/admin/audit-logs/filters
 * @access  Private (Admin)
 */
exports.getAuditLogFilterOptions = async (req, res, _next) => {
    try {
        const actionTypes = await AuditLog.distinct('actionType');
        const entityTypes = await AuditLog.distinct('entityType');
        const statuses = await AuditLog.distinct('status');
        // Could also get distinct users if needed, but that might be a large list

        logger.info('Fetched audit log filter options', { adminUserId: req.user.id });
        res.status(200).json({
            success: true,
            data: {
                actionTypes: actionTypes.sort(),
                entityTypes: entityTypes.sort(),
                statuses: statuses.sort()
            }
        });
    } catch (error) {
        logger.error('Error retrieving audit log filter options', { adminUserId: req.user.id, error: error.message, stack: error.stack });
        _next(new AppError('Server error while retrieving filter options.', 500));
    }
};

// Note: Creation of audit logs will typically happen within other controllers/services
// when an auditable action occurs. A dedicated 'createAuditLog' endpoint here might be
// less common unless there's a specific need for manual log injection or a separate microservice.
// Instead, a utility function `createAuditLogEntry(details)` would be used internally.
// Example (to be placed in a utility or service, not directly as an exposed controller method for creation):
/*
async function createAuditLogEntry(logData) {
    try {
        const newLog = await AuditLog.create({
            user: logData.userId, // ID of the user performing the action
            actionType: logData.actionType, // e.g., 'USER_LOGIN', 'TRIP_UPDATE', 'BOOKING_CANCELLED'
            entityType: logData.entityType, // e.g., 'User', 'Trip', 'Booking'
            entityId: logData.entityId, // ID of the affected entity
            details: logData.details, // Object or string with more context (e.g., old vs new values)
            status: logData.status || 'succeeded', // 'succeeded', 'failed', 'pending'
            ipAddress: logData.ipAddress,
            userAgent: logData.userAgent
        });
        logger.info('Audit log entry created', { logId: newLog._id, actionType: newLog.actionType });
        return newLog;
    } catch (error) {
        logger.error('Failed to create audit log entry', { error: error.message, logData });
        // Decide if this error should propagate or be handled silently
    }
}
*/