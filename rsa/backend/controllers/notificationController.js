const Notification = require('../models/Notification'); // Assuming Notification model exists or will be created
const User = require('../models/User');
const { AppError, ValidationError, NotFoundError, AuthorizationError } = require('../middleware/errorHandler');
const { createLogger } = require('../utils/logger');
const APIFeatures = require('../utils/apiFeatures');
// const { sendPushNotification, sendEmailNotification, sendSMSNotification } = require('../services/notificationService'); // Example service

const logger = createLogger('NotificationController');

/**
 * @desc    Get all notifications for the logged-in user
 * @route   GET /api/v1/notifications
 * @access  Private (User)
 */
exports.getMyNotifications = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const { status, type, sort } = req.query; // Filter by status (read/unread), type

    let queryFilter = { user: userId };
    if (status === 'read') queryFilter.isRead = true;
    if (status === 'unread') queryFilter.isRead = false;
    if (type) queryFilter.type = type;

    const features = new APIFeatures(Notification.find(queryFilter), req.query)
      .filter() // General purpose filter if needed beyond status/type
      .sort(sort || '-createdAt') // Default sort by newest first
      .paginate();

    const notifications = await features.query;
    const totalNotifications = await Notification.countDocuments({ ...features.getQuery()._conditions, ...queryFilter });

    logger.info('Retrieved user notifications', { userId, count: notifications.length, filter: queryFilter });
    res.status(200).json({
      success: true,
      count: notifications.length,
      total: totalNotifications,
      pagination: features.pagination,
      data: notifications
    });
  } catch (error) {
    logger.error('Error getting user notifications', { userId: req.user.id, error: error.message, stack: error.stack });
    next(new AppError('Server error while retrieving your notifications.', 500));
  }
};

/**
 * @desc    Mark a notification as read
 * @route   PATCH /api/v1/notifications/:id/read
 * @access  Private (User)
 */
exports.markNotificationAsRead = async (req, res, next) => {
  try {
    const notificationId = req.params.id;
    const userId = req.user.id;

    const notification = await Notification.findOne({ _id: notificationId, user: userId });

    if (!notification) {
      return next(new NotFoundError('Notification not found or you do not have permission to access it.', 404));
    }

    if (notification.isRead) {
      return res.status(200).json({ success: true, message: 'Notification is already marked as read.', data: notification });
    }

    notification.isRead = true;
    notification.readAt = Date.now();
    notification.metadata.lastUpdatedAt = Date.now();
    notification.metadata.updatedBy = userId;
    await notification.save();

    logger.info('Notification marked as read', { notificationId, userId });
    res.status(200).json({
      success: true,
      message: 'Notification marked as read.',
      data: notification
    });
  } catch (error) {
    logger.error('Error marking notification as read', { notificationId: req.params.id, userId: req.user.id, error: error.message, stack: error.stack });
    if (error.name === 'CastError') {
        return next(new NotFoundError('Notification not found.', 404));
    }
    next(new AppError('Server error while updating notification status.', 500));
  }
};

/**
 * @desc    Mark all unread notifications for the user as read
 * @route   PATCH /api/v1/notifications/mark-all-read
 * @access  Private (User)
 */
exports.markAllNotificationsAsRead = async (req, res, next) => {
    try {
        const userId = req.user.id;

        const result = await Notification.updateMany(
            { user: userId, isRead: false },
            {
                $set: {
                    isRead: true,
                    readAt: Date.now(),
                    'metadata.lastUpdatedAt': Date.now(),
                    'metadata.updatedBy': userId
                }
            }
        );

        logger.info('Marked all unread notifications as read', { userId, modifiedCount: result.nModified });
        res.status(200).json({
            success: true,
            message: `Successfully marked ${result.nModified} notifications as read.`,
            data: { modifiedCount: result.nModified }
        });
    } catch (error) {
        logger.error('Error marking all notifications as read', { userId: req.user.id, error: error.message, stack: error.stack });
        next(new AppError('Server error while updating notifications.', 500));
    }
};


/**
 * @desc    Delete a notification
 * @route   DELETE /api/v1/notifications/:id
 * @access  Private (User)
 */
exports.deleteNotification = async (req, res, next) => {
  try {
    const notificationId = req.params.id;
    const userId = req.user.id;

    const notification = await Notification.findOne({ _id: notificationId, user: userId });

    if (!notification) {
      return next(new NotFoundError('Notification not found or you do not have permission to delete it.', 404));
    }

    await notification.deleteOne(); // Mongoose 5.x+

    logger.info('Notification deleted', { notificationId, userId });
    res.status(200).json({ success: true, message: 'Notification deleted successfully.', data: {} });
  } catch (error) {
    logger.error('Error deleting notification', { notificationId: req.params.id, userId: req.user.id, error: error.message, stack: error.stack });
    if (error.name === 'CastError') {
        return next(new NotFoundError('Notification not found.', 404));
    }
    next(new AppError('Server error while deleting notification.', 500));
  }
};

/**
 * @desc    Get count of unread notifications for the logged-in user
 * @route   GET /api/v1/notifications/unread-count
 * @access  Private (User)
 */
exports.getUnreadNotificationsCount = async (req, res, next) => {
    try {
        const userId = req.user.id;
        const count = await Notification.countDocuments({ user: userId, isRead: false });

        logger.info('Retrieved unread notifications count', { userId, count });
        res.status(200).json({
            success: true,
            data: { unreadCount: count }
        });
    } catch (error) {
        logger.error('Error getting unread notifications count', { userId: req.user.id, error: error.message, stack: error.stack });
        next(new AppError('Server error while retrieving unread notification count.', 500));
    }
};

// --- Admin Notification Management (Example: Sending a system-wide notification) ---

/**
 * @desc    Admin: Send a notification to a specific user or a group of users (e.g., all users, all drivers)
 * @route   POST /api/v1/admin/notifications/send
 * @access  Private (Admin)
 */
exports.sendAdminNotification = async (req, res, next) => {
    try {
        const { title, message, type, targetUser, targetGroup, link, priority } = req.body;
        const adminUserId = req.user.id;

        if (!title || !message || !type) {
            return next(new ValidationError('Title, message, and type are required for sending a notification.', 400));
        }

        let userIdsToNotify = [];

        if (targetUser) {
            const user = await User.findById(targetUser).select('_id');
            if (!user) return next(new NotFoundError(`Target user with ID ${targetUser} not found.`, 404));
            userIdsToNotify.push(user._id);
        } else if (targetGroup) {
            let groupFilter = {};
            if (targetGroup === 'all_users') { /* No specific filter needed beyond active status */ groupFilter.status = 'active'; }
            else if (targetGroup === 'all_drivers') { groupFilter.role = 'driver'; groupFilter.status = 'active'; }
            else if (targetGroup === 'all_passengers') { groupFilter.role = 'user'; groupFilter.status = 'active'; } // Assuming 'user' role for passengers
            else {
                return next(new ValidationError('Invalid target group specified.', 400));
            }
            const usersInGroup = await User.find(groupFilter).select('_id');
            userIdsToNotify = usersInGroup.map(u => u._id);
        } else {
            return next(new ValidationError('Either targetUser or targetGroup must be specified.', 400));
        }

        if (userIdsToNotify.length === 0) {
            return next(new AppError('No users found for the specified target.', 404));
        }

        const notificationsToCreate = userIdsToNotify.map(userId => ({
            user: userId,
            title,
            message,
            type, // e.g., 'system_alert', 'promotion', 'update'
            link, // Optional link for more details
            priority: priority || 'medium', // e.g., 'low', 'medium', 'high'
            isRead: false,
            metadata: { createdAt: Date.now(), createdBy: adminUserId }
        }));

        const createdNotifications = await Notification.insertMany(notificationsToCreate);

        // TODO: Potentially trigger real-time push notifications / emails / SMS here
        // for (const notification of createdNotifications) {
        //     // await sendPushNotification(notification.user, notification.title, notification.message, { notificationId: notification._id, link: notification.link });
        // }

        logger.info('Admin sent notification(s)', { adminUserId, count: createdNotifications.length, type, targetUser, targetGroup });
        res.status(201).json({
            success: true,
            message: `Successfully sent ${createdNotifications.length} notification(s).`,
            data: { sentCount: createdNotifications.length }
        });

    } catch (error) {
        logger.error('Admin: Error sending notification', { adminUserId: req.user.id, error: error.message, stack: error.stack, body: req.body });
        next(new AppError('Server error while sending notification(s).', 500));
    }
};