const multer = require('multer');
const path = require('path');
const fs = require('fs');
const { AppError, ValidationError, NotFoundError } = require('../middleware/errorHandler');
const { createLogger } = require('../utils/logger');
const User = require('../models/User'); // For updating user avatar
const Vehicle = require('../models/Vehicle'); // For updating vehicle images
const Driver = require('../models/Driver'); // For updating driver documents
// const SupportTicket = require('../models/SupportTicket'); // For support ticket attachments (if storing refs in DB)

const logger = createLogger('FileUploadController');

// --- Multer Configuration for Local Storage ---
// Define storage for different types of uploads
const storageConfig = (destinationPath) => {
    // Ensure destination directory exists
    const absoluteDestinationPath = path.join(__dirname, '..', 'public', 'uploads', destinationPath);
    if (!fs.existsSync(absoluteDestinationPath)) {
        fs.mkdirSync(absoluteDestinationPath, { recursive: true });
    }

    return multer.diskStorage({
        destination: (req, file, cb) => {
            cb(null, absoluteDestinationPath);
        },
        filename: (req, file, cb) => {
            const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
            const extension = path.extname(file.originalname);
            cb(null, file.fieldname + '-' + uniqueSuffix + extension);
        }
    });
};

// Define file filter
const fileFilterConfig = (allowedMimes) => {
    return (req, file, cb) => {
        if (allowedMimes.includes(file.mimetype)) {
            cb(null, true);
        } else {
            cb(new ValidationError(`Invalid file type. Only ${allowedMimes.join(', ')} are allowed.`, 400), false);
        }
    };
};

// --- Specific Upload Middlewares ---

// Avatar Upload
const avatarUploadPath = 'avatars';
const avatarAllowedMimes = ['image/jpeg', 'image/png', 'image/gif'];
const avatarMaxFileSizeMB = 2;
exports.uploadUserAvatar = multer({
    storage: storageConfig(avatarUploadPath, avatarAllowedMimes, avatarMaxFileSizeMB),
    fileFilter: fileFilterConfig(avatarAllowedMimes),
    limits: { fileSize: avatarMaxFileSizeMB * 1024 * 1024 } // Max size in bytes
}).single('avatar'); // 'avatar' is the field name in the form-data

// Vehicle Image Upload
const vehicleImageUploadPath = 'vehicles';
const vehicleImageAllowedMimes = ['image/jpeg', 'image/png'];
const vehicleMaxFileSizeMB = 5;
exports.uploadVehicleImage = multer({
    storage: storageConfig(vehicleImageUploadPath, vehicleImageAllowedMimes, vehicleMaxFileSizeMB),
    fileFilter: fileFilterConfig(vehicleImageAllowedMimes),
    limits: { fileSize: vehicleMaxFileSizeMB * 1024 * 1024 }
}).array('vehicleImages', 5); // 'vehicleImages' field, max 5 images

// Driver Document Upload
const driverDocUploadPath = 'driver-documents';
const driverDocAllowedMimes = ['application/pdf', 'image/jpeg', 'image/png'];
const driverDocMaxFileSizeMB = 10;
exports.uploadDriverDocument = multer({
    storage: storageConfig(driverDocUploadPath, driverDocAllowedMimes, driverDocMaxFileSizeMB),
    fileFilter: fileFilterConfig(driverDocAllowedMimes),
    limits: { fileSize: driverDocMaxFileSizeMB * 1024 * 1024 }
}).fields([
    { name: 'license', maxCount: 1 },
    { name: 'insurance', maxCount: 1 },
    { name: 'registration', maxCount: 1 }
]); // Different document types

// Support Ticket Attachment Upload
const supportAttachmentPath = 'support-attachments';
const supportAttachmentAllowedMimes = ['application/pdf', 'image/jpeg', 'image/png', 'text/plain', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'];
const supportAttachmentMaxFileSizeMB = 10;
exports.uploadSupportAttachment = multer({
    storage: storageConfig(supportAttachmentPath, supportAttachmentAllowedMimes, supportAttachmentMaxFileSizeMB),
    fileFilter: fileFilterConfig(supportAttachmentAllowedMimes),
    limits: { fileSize: supportAttachmentMaxFileSizeMB * 1024 * 1024 }
}).array('attachments', 3); // 'attachments' field, max 3 files


// --- Controller Methods to Handle Upload Results ---

/**
 * @desc    Handles the result of user avatar upload and updates user profile
 * @route   POST /api/v1/users/me/avatar (or similar, depends on user routes)
 * @access  Private
 */
exports.processUserAvatarUpload = async (req, res, next) => {
    try {
        if (!req.file) {
            return next(new ValidationError('No avatar file uploaded.', 400));
        }

        const userId = req.user.id;
        // Construct the URL or path to be stored
        // Example: /uploads/avatars/avatar-16294...jpg
        const avatarPath = `/uploads/${avatarUploadPath}/${req.file.filename}`;

        const user = await User.findByIdAndUpdate(userId, 
            { 'profile.avatar': avatarPath, 'metadata.lastUpdatedAt': Date.now() }, 
            { new: true, runValidators: true }
        ).select('profile.avatar');

        if (!user) {
            // Clean up uploaded file if user not found (should not happen with auth middleware)
            fs.unlinkSync(req.file.path);
            return next(new NotFoundError('User not found.'));
        }

        logger.info('User avatar uploaded and profile updated', { userId, avatarPath });
        res.status(200).json({
            success: true,
            message: 'Avatar uploaded successfully.',
            data: {
                avatarUrl: avatarPath // Or full URL: `${req.protocol}://${req.get('host')}${avatarPath}`
            }
        });
    } catch (error) {
        logger.error('Error processing user avatar upload', { userId: req.user.id, error: error.message, stack: error.stack });
        // If an error occurs after file is saved, attempt to delete it
        if (req.file && req.file.path) {
            try { fs.unlinkSync(req.file.path); } catch (e) { logger.warn('Failed to cleanup uploaded avatar file after error', { path: req.file.path, error: e.message }); }
        }
        if (error instanceof multer.MulterError) {
            return next(new ValidationError(error.message, 400));
        }
        next(new AppError('Server error while uploading avatar.', 500));
    }
};

/**
 * @desc    Handles vehicle image uploads and updates vehicle record
 * @route   POST /api/v1/vehicles/:vehicleId/images (example route)
 * @access  Private (Owner/Admin)
 */
exports.processVehicleImageUpload = async (req, res, next) => {
    try {
        if (!req.files || req.files.length === 0) {
            return next(new ValidationError('No vehicle image files uploaded.', 400));
        }

        const vehicleId = req.params.vehicleId; // Assuming vehicleId is in route params
        // TODO: Add authorization check: ensure req.user owns the vehicle or is admin

        const imagePaths = req.files.map(file => `/uploads/${vehicleImageUploadPath}/${file.filename}`);

        const vehicle = await Vehicle.findByIdAndUpdate(vehicleId, 
            { $push: { images: { $each: imagePaths } }, 'metadata.lastUpdatedAt': Date.now() }, 
            { new: true, runValidators: true }
        ).select('images');

        if (!vehicle) {
            req.files.forEach(file => fs.unlinkSync(file.path)); // Cleanup
            return next(new NotFoundError(`Vehicle with ID ${vehicleId} not found.`));
        }

        logger.info('Vehicle images uploaded', { vehicleId, count: imagePaths.length });
        res.status(200).json({
            success: true,
            message: 'Vehicle images uploaded successfully.',
            data: {
                imageUrls: imagePaths // Or full URLs
            }
        });
    } catch (error) {
        logger.error('Error processing vehicle image upload', { vehicleId: req.params.vehicleId, error: error.message, stack: error.stack });
        if (req.files) req.files.forEach(file => { try { fs.unlinkSync(file.path); } catch(e) { /* log cleanup error */ } });
        if (error instanceof multer.MulterError) {
            return next(new ValidationError(error.message, 400));
        }
        next(new AppError('Server error while uploading vehicle images.', 500));
    }
};

/**
 * @desc    Handles driver document uploads and updates driver record
 * @route   POST /api/v1/drivers/:driverId/documents (example route)
 * @access  Private (Driver/Admin)
 */
exports.processDriverDocumentUpload = async (req, res, next) => {
    try {
        if (!req.files || Object.keys(req.files).length === 0) {
            return next(new ValidationError('No document files uploaded.', 400));
        }

        const driverId = req.params.driverId; // Assuming driverId is in route params
        // TODO: Add authorization check: ensure req.user is the driver or admin

        const updates = {};
        const uploadedFilePaths = {};

        for (const fieldName in req.files) {
            if (req.files[fieldName] && req.files[fieldName].length > 0) {
                const file = req.files[fieldName][0];
                const filePath = `/uploads/${driverDocUploadPath}/${file.filename}`;
                // Example: updates['documents.license.url'] = filePath;
                // This depends on how Driver model stores document info
                // Assuming a structure like: documents: { license: { url: '', verified: false }, ... }
                if (fieldName === 'license') updates['documents.license.url'] = filePath;
                if (fieldName === 'insurance') updates['documents.insurance.url'] = filePath;
                if (fieldName === 'registration') updates['documents.vehicleRegistration.url'] = filePath; // Example field name
                uploadedFilePaths[fieldName] = filePath;
            }
        }
        updates['metadata.lastUpdatedAt'] = Date.now();

        if (Object.keys(updates).length <= 1) { // Only metadata.lastUpdatedAt
             Object.values(req.files).flat().forEach(file => fs.unlinkSync(file.path)); // Cleanup
            return next(new ValidationError('No valid document fields processed.', 400));
        }

        const driver = await Driver.findOneAndUpdate({ _id: driverId }, { $set: updates }, { new: true, runValidators: true }).select('documents');

        if (!driver) {
            Object.values(req.files).flat().forEach(file => fs.unlinkSync(file.path)); // Cleanup
            return next(new NotFoundError(`Driver with ID ${driverId} not found.`));
        }

        logger.info('Driver documents uploaded', { driverId, files: uploadedFilePaths });
        res.status(200).json({
            success: true,
            message: 'Driver documents uploaded successfully.',
            data: {
                uploadedDocuments: uploadedFilePaths
            }
        });
    } catch (error) {
        logger.error('Error processing driver document upload', { driverId: req.params.driverId, error: error.message, stack: error.stack });
        if (req.files) Object.values(req.files).flat().forEach(file => { try { fs.unlinkSync(file.path); } catch(e) { /* log cleanup error */ } });
        if (error instanceof multer.MulterError) {
            return next(new ValidationError(error.message, 400));
        }
        next(new AppError('Server error while uploading driver documents.', 500));
    }
};

/**
 * @desc    Handles support ticket attachment uploads
 * @route   POST /api/v1/support-tickets/:ticketId/attachments (example route)
 * @access  Private (User/Admin)
 */
exports.processSupportAttachmentUpload = async (req, res, next) => {
    try {
        if (!req.files || req.files.length === 0) {
            return next(new ValidationError('No attachment files uploaded.', 400));
        }

        const ticketId = req.params.ticketId; // Assuming ticketId is in route params
        // TODO: Add authorization check: user owns ticket or is admin/support

        const attachmentPaths = req.files.map(file => {
            return {
                fileName: file.originalname,
                filePath: `/uploads/${supportAttachmentPath}/${file.filename}`,
                fileType: file.mimetype,
                fileSize: file.size
            };
        });

        // Here, you would typically add these attachmentPaths to a message within the SupportTicket
        // This controller might just return the paths, and another controller (SupportTicketController)
        // would handle adding them to the DB record when a message is posted.
        // For simplicity, we'll just return them here.

        logger.info('Support ticket attachments uploaded', { ticketId, count: attachmentPaths.length });
        res.status(200).json({
            success: true,
            message: 'Attachments uploaded successfully. Add them to your message.',
            data: {
                attachments: attachmentPaths
            }
        });
    } catch (error) {
        logger.error('Error processing support attachment upload', { ticketId: req.params.ticketId, error: error.message, stack: error.stack });
        if (req.files) req.files.forEach(file => { try { fs.unlinkSync(file.path); } catch(e) { /* log cleanup error */ } });
        if (error instanceof multer.MulterError) {
            return next(new ValidationError(error.message, 400));
        }
        next(new AppError('Server error while uploading attachments.', 500));
    }
};

// Note: For cloud storage (S3, Cloudinary, etc.), you would replace multer.diskStorage
// with a suitable storage engine like 'multer-s3' or 'multer-storage-cloudinary'.
// The controller logic would then handle URLs provided by these services instead of local paths.