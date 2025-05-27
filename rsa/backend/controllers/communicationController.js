const User = require('../models/User');
const Notification = require('../models/Notification'); // Assuming Notification model exists
const { AppError } = require('../middleware/errorHandler');
const { createLogger } = require('../utils/logger');
const { sendEmail, sendBulkEmail } = require('../utils/emailHandler'); // Assuming emailHandler utility
// const { sendSMS } = require('../utils/smsHandler'); // Placeholder for SMS utility

const logger = createLogger('CommunicationController');

/**
 * @desc    Send a direct email to a specific user or a list of users (Admin)
 * @route   POST /api/v1/admin/communications/send-email
 * @access  Private (Admin)
 * @body    to (email string or array of emails), subject, body (text or html), templateId (optional), templateData (optional)
 */
exports.sendDirectEmail = async (req, res, next) => {
    try {
        const { to, subject, body, htmlBody, templateId, templateData } = req.body;
        const adminUserId = req.user.id;

        if (!to || !subject || (!body && !htmlBody && !templateId)) {
            return next(new AppError('Recipient(s), subject, and body/template are required.', 400));
        }

        const emailOptions = {
            subject,
            text: body,
            html: htmlBody,
            // template: templateId, // If using a template engine integrated with emailHandler
            // context: templateData, // Data for the template
        };

        let recipients = Array.isArray(to) ? to : [to];

        // Validate email addresses if needed, or let emailHandler do it

        if (recipients.length === 1) {
            emailOptions.to = recipients[0];
            await sendEmail(emailOptions);
        } else if (recipients.length > 1) {
            // For bulk, consider BCC or individual sends depending on privacy and email provider limits
            // This example assumes sendBulkEmail handles multiple recipients appropriately (e.g., individual sends or BCC)
            await sendBulkEmail(recipients, emailOptions.subject, emailOptions.text, emailOptions.html /*, templateId, templateData */);
        }

        logger.info('Direct email sent by admin', { adminUserId, recipientsCount: recipients.length, subject });
        res.status(200).json({ success: true, message: 'Email(s) sent successfully.' });

    } catch (error) {
        logger.error('Error sending direct email', { adminUserId: req.user.id, error: error.message, stack: error.stack, body: req.body });
        next(new AppError('Server error while sending email.', 500));
    }
};

/**
 * @desc    Send a broadcast message to a group of users (e.g., newsletter, announcement) (Admin)
 * @route   POST /api/v1/admin/communications/broadcast
 * @access  Private (Admin)
 * @body    targetGroup ('all', 'active_users', 'subscribers', 'custom_filter'), customFilter (if targetGroup is 'custom_filter'),
 *          channel ('email', 'in_app_notification', 'sms'), subject (for email), message (for all)
 */
exports.sendBroadcastMessage = async (req, res, next) => {
    try {
        const { targetGroup, customFilter, channel, subject, message, htmlMessage } = req.body;
        const adminUserId = req.user.id;

        if (!targetGroup || !channel || !message) {
            return next(new AppError('Target group, channel, and message are required.', 400));
        }

        let usersToNotify = [];
        let userQuery = {};

        switch (targetGroup) {
            case 'all':
                userQuery = {};
                break;
            case 'active_users': // Define 'active' based on your criteria (e.g., last login)
                userQuery = { status: 'active', 'profile.communicationPreferences.emailNotifications': true }; // Example
                break;
            case 'subscribers': // Assuming a 'isSubscribedToNewsletter' field or similar
                userQuery = { 'profile.communicationPreferences.newsletter': true, 'profile.communicationPreferences.emailNotifications': true };
                break;
            case 'custom_filter':
                if (!customFilter || typeof customFilter !== 'object') {
                    return next(new AppError('Valid customFilter object is required for custom target group.', 400));
                }
                userQuery = { ...customFilter, 'profile.communicationPreferences.emailNotifications': true }; // Ensure they want emails
                break;
            default:
                return next(new AppError('Invalid target group specified.', 400));
        }

        usersToNotify = await User.find(userQuery).select('email _id profile.communicationPreferences.allowsInAppNotifications profile.phone'); // Select necessary fields

        if (usersToNotify.length === 0) {
            logger.info('Broadcast message attempted but no users matched the criteria', { adminUserId, targetGroup, channel });
            return res.status(200).json({ success: true, message: 'No users found for the specified target group.' });
        }

        let successCount = 0;
        let failureCount = 0;

        if (channel === 'email') {
            if (!subject) return next(new AppError('Subject is required for email broadcasts.', 400));
            const emails = usersToNotify.map(user => user.email).filter(email => email); // Filter out users without emails
            if (emails.length > 0) {
                try {
                    await sendBulkEmail(emails, subject, message, htmlMessage);
                    successCount = emails.length;
                } catch (emailError) {
                    logger.error('Error during email broadcast part', { error: emailError.message });
                    // Partial success might occur, this needs more granular tracking if sendBulkEmail doesn't provide it
                    failureCount = emails.length; // Assume all failed if bulk send throws one error
                }
            }
        } else if (channel === 'in_app_notification') {
            const notifications = usersToNotify
                .filter(user => user.profile.communicationPreferences.allowsInAppNotifications)
                .map(user => ({
                    user: user._id,
                    title: subject || 'New Notification',
                    message: message,
                    type: 'broadcast', // Or a more specific type
                    createdBy: adminUserId
                }));
            if (notifications.length > 0) {
                try {
                    await Notification.insertMany(notifications);
                    successCount = notifications.length;
                } catch (notificationError) {
                    logger.error('Error creating in-app broadcast notifications', { error: notificationError.message });
                    failureCount = notifications.length;
                }
            }
        } else if (channel === 'sms') {
            // Placeholder for SMS logic
            // const phoneNumbers = usersToNotify.map(user => user.profile.phone).filter(phone => phone);
            // if (phoneNumbers.length > 0) {
            //     for (const phone of phoneNumbers) {
            //         try {
            //             await sendSMS(phone, message);
            //             successCount++;
            //         } catch (smsError) {
            //             logger.error('Error sending SMS to a user during broadcast', { phone, error: smsError.message });
            //             failureCount++;
            //         }
            //     }
            // }
            return next(new AppError('SMS channel is not yet implemented.', 501));
        } else {
            return next(new AppError('Invalid communication channel specified.', 400));
        }

        logger.info('Broadcast message processed', { adminUserId, targetGroup, channel, totalTargeted: usersToNotify.length, successCount, failureCount });
        res.status(200).json({
            success: true,
            message: `Broadcast message processed. Sent to ${successCount} users, ${failureCount} failures.`,
            details: { successCount, failureCount, totalTargeted: usersToNotify.length }
        });

    } catch (error) {
        logger.error('Error sending broadcast message', { adminUserId: req.user.id, error: error.message, stack: error.stack, body: req.body });
        next(new AppError('Server error while sending broadcast message.', 500));
    }
};

/**
 * @desc    Get communication templates (Admin - if using a template system)
 * @route   GET /api/v1/admin/communications/templates
 * @access  Private (Admin)
 */
// exports.getCommunicationTemplates = async (req, res, next) => {
//     // This would interact with a template storage system (DB or files)
//     // For now, this is a placeholder
//     try {
//         // const templates = await TemplateModel.find();
//         const templates = [
//             { id: 'welcome_email', name: 'Welcome Email', description: 'Sent to new users upon registration.' },
//             { id: 'password_reset', name: 'Password Reset Email', description: 'Sent when a user requests a password reset.' },
//             { id: 'booking_confirmation', name: 'Booking Confirmation', description: 'Sent after a successful booking.' },
//         ];
//         logger.info('Fetched communication templates', { adminUserId: req.user.id });
//         res.status(200).json({ success: true, data: templates });
//     } catch (error) {
//         logger.error('Error fetching communication templates', { adminUserId: req.user.id, error: error.message });
//         next(new AppError('Server error fetching templates.', 500));
//     }
// };

/**
 * @desc    Get communication logs (Admin - if storing detailed logs of sent communications)
 * @route   GET /api/v1/admin/communications/logs
 * @access  Private (Admin)
 * @query   userId, type (email, sms), status, startDate, endDate, page, limit
 */
// exports.getCommunicationLogs = async (req, res, next) => {
//     // This would require a CommunicationLog model
//     // For now, this is a placeholder
//     try {
//         // const { userId, type, status, startDate, endDate, page, limit } = req.query;
//         // const logs = await CommunicationLogModel.find({ query based on params });
//         logger.info('Fetched communication logs (placeholder)', { adminUserId: req.user.id });
//         res.status(200).json({ success: true, message: 'Communication log retrieval is not yet fully implemented.', data: [] });
//     } catch (error) {
//         logger.error('Error fetching communication logs', { adminUserId: req.user.id, error: error.message });
//         next(new AppError('Server error fetching communication logs.', 500));
//     }
// };