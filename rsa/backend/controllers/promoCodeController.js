const PromoCode = require('../models/PromoCode');
const User = require('../models/User'); // This was present in the previous view, keeping it for now unless linter flags it later.
const { AppError } = require('../middleware/errorHandler');
const { createLogger } = require('../utils/logger');

const logger = createLogger('PromoCodeController');

/**
 * @desc    Create a new promo code
 * @route   POST /api/v1/admin/promocodes
 * @access  Private (Admin)
 */
exports.createPromoCode = async (req, res, next) => {
    try {
        const {
            code,
            discountType, // 'percentage', 'fixed_amount'
            discountValue,
            description,
            validFrom,
            validUntil,
            maxUses,
            minBookingAmount,
            applicableTo, // 'all_routes', 'specific_routes', 'all_users', 'specific_users'
            specificRouteIds, // Array of Route IDs if applicableTo is 'specific_routes'
            specificUserIds, // Array of User IDs if applicableTo is 'specific_users'
            isActive
        } = req.body;

        if (!code || !discountType || !discountValue) {
            return next(new AppError('Code, discount type, and discount value are required.', 400));
        }

        const existingCode = await PromoCode.findOne({ code: code.toUpperCase() });
        if (existingCode) {
            return next(new AppError(`Promo code '${code}' already exists.`, 400));
        }

        const promoCodeData = {
            code: code.toUpperCase(),
            discountType,
            discountValue,
            description,
            validFrom: validFrom ? new Date(validFrom) : new Date(),
            validUntil: validUntil ? new Date(validUntil) : null,
            maxUses: maxUses ? parseInt(maxUses) : null,
            minBookingAmount: minBookingAmount ? parseFloat(minBookingAmount) : null,
            timesUsed: 0,
            applicableTo: applicableTo || 'all_routes',
            specificRouteIds: applicableTo === 'specific_routes' ? specificRouteIds : [],
            specificUserIds: applicableTo === 'specific_users' ? specificUserIds : [],
            isActive: isActive !== undefined ? isActive : true,
            createdBy: req.user.id
        };

        const newPromoCode = await PromoCode.create(promoCodeData);

        logger.info('Promo code created', { adminUserId: req.user.id, promoCodeId: newPromoCode._id, code: newPromoCode.code });
        res.status(201).json({ success: true, data: newPromoCode });

    } catch (error) {
        logger.error('Error creating promo code', { adminUserId: req.user.id, error: error.message, stack: error.stack, body: req.body });
        if (error.name === 'ValidationError') {
            return next(new AppError(Object.values(error.errors).map(e => e.message).join(', '), 400));
        }
        next(new AppError('Server error while creating promo code.', 500));
    }
};

/**
 * @desc    Get all promo codes
 * @route   GET /api/v1/admin/promocodes
 * @access  Private (Admin)
 * @query   isActive, code, page, limit, sortBy, sortOrder
 */
exports.getAllPromoCodes = async (req, res, next) => {
    try {
        const {
            isActive,
            code,
            page = 1,
            limit = 20,
            sortBy = 'createdAt',
            sortOrder = 'desc'
        } = req.query;

        let query = {};
        if (isActive !== undefined) query.isActive = isActive === 'true' || isActive === true;
        if (code) query.code = { $regex: code.toUpperCase(), $options: 'i' };

        const sortOptions = {};
        sortOptions[sortBy] = sortOrder === 'asc' ? 1 : -1;

        const totalPromoCodes = await PromoCode.countDocuments(query);
        const promoCodes = await PromoCode.find(query)
            .populate('createdBy', 'profile.firstName profile.lastName')
            .sort(sortOptions)
            .skip((page - 1) * limit)
            .limit(parseInt(limit));

        logger.info('Fetched all promo codes', { adminUserId: req.user.id, query, page, limit, totalPromoCodes });

        res.status(200).json({
            success: true,
            count: promoCodes.length,
            total: totalPromoCodes,
            pagination: {
                currentPage: parseInt(page),
                totalPages: Math.ceil(totalPromoCodes / limit),
                limit: parseInt(limit)
            },
            data: promoCodes
        });

    } catch (error) {
        logger.error('Error fetching all promo codes', { adminUserId: req.user.id, error: error.message, stack: error.stack, query: req.query });
        next(new AppError('Server error while fetching promo codes.', 500));
    }
};

/**
 * @desc    Get a specific promo code by ID or Code
 * @route   GET /api/v1/admin/promocodes/:identifier (ID or Code string)
 * @access  Private (Admin)
 */
exports.getPromoCodeByIdentifier = async (req, res, next) => {
    try {
        const identifier = req.params.identifier;
        let promoCode;

        // Check if identifier is a valid MongoDB ObjectId, otherwise assume it's a code string
        if (identifier.match(/^[0-9a-fA-F]{24}$/)) {
            promoCode = await PromoCode.findById(identifier).populate('createdBy', 'profile.firstName profile.lastName');
        } else {
            promoCode = await PromoCode.findOne({ code: identifier.toUpperCase() }).populate('createdBy', 'profile.firstName profile.lastName');
        }

        if (!promoCode) {
            logger.warn('Promo code not found by identifier', { adminUserId: req.user.id, identifier });
            return next(new AppError('Promo code not found.', 404));
        }

        logger.info('Fetched promo code by identifier', { adminUserId: req.user.id, identifier, promoCodeId: promoCode._id });
        res.status(200).json({ success: true, data: promoCode });

    } catch (error) {
        logger.error('Error fetching promo code by identifier', { adminUserId: req.user.id, identifier: req.params.identifier, error: error.message, stack: error.stack });
        if (error.name === 'CastError' && req.params.identifier.match(/^[0-9a-fA-F]{24}$/)) { // Only CastError if it was an ID search
            return next(new AppError(`Invalid promo code ID: ${req.params.identifier}`, 400));
        }
        next(new AppError('Server error while fetching promo code.', 500));
    }
};

/**
 * @desc    Update a promo code
 * @route   PUT /api/v1/admin/promocodes/:id
 * @access  Private (Admin)
 */
exports.updatePromoCode = async (req, res, next) => {
    try {
        const promoCodeId = req.params.id;
        const updates = req.body;

        // Prevent changing the code itself or timesUsed directly via this route
        if (updates.code) delete updates.code;
        if (updates.timesUsed) delete updates.timesUsed;
        if (updates.createdBy) delete updates.createdBy; // Cannot change creator

        if (updates.validFrom) updates.validFrom = new Date(updates.validFrom);
        if (updates.validUntil) updates.validUntil = new Date(updates.validUntil);

        updates.lastUpdatedBy = req.user.id;
        updates.lastUpdatedAt = new Date();

        const updatedPromoCode = await PromoCode.findByIdAndUpdate(promoCodeId, { $set: updates }, { new: true, runValidators: true });

        if (!updatedPromoCode) {
            logger.warn('Promo code not found for update', { adminUserId: req.user.id, promoCodeId });
            return next(new AppError('Promo code not found.', 404));
        }

        logger.info('Promo code updated', { adminUserId: req.user.id, promoCodeId });
        res.status(200).json({ success: true, data: updatedPromoCode });

    } catch (error) {
        logger.error('Error updating promo code', { adminUserId: req.user.id, promoCodeId: req.params.id, error: error.message, stack: error.stack, body: req.body });
        if (error.name === 'ValidationError') {
            return next(new AppError(Object.values(error.errors).map(e => e.message).join(', '), 400));
        }
        if (error.name === 'CastError') {
            return next(new AppError(`Invalid promo code ID: ${req.params.id}`, 400));
        }
        next(new AppError('Server error while updating promo code.', 500));
    }
};

/**
 * @desc    Delete a promo code (soft delete or hard delete)
 * @route   DELETE /api/v1/admin/promocodes/:id
 * @access  Private (Admin)
 */
exports.deletePromoCode = async (req, res, next) => {
    try {
        const promoCodeId = req.params.id;
        const promoCode = await PromoCode.findById(promoCodeId);

        if (!promoCode) {
            logger.warn('Promo code not found for deletion', { adminUserId: req.user.id, promoCodeId });
            return next(new AppError('Promo code not found.', 404));
        }

        // Option 1: Hard delete
        // await promoCode.remove();
        // message = 'Promo code deleted successfully.';

        // Option 2: Soft delete (by setting isActive to false and maybe a deletedAt timestamp)
        promoCode.isActive = false;
        promoCode.deletedAt = new Date();
        promoCode.lastUpdatedBy = req.user.id;
        await promoCode.save();
        const message = 'Promo code deactivated successfully.';

        logger.info('Promo code deleted/deactivated', { adminUserId: req.user.id, promoCodeId });
        res.status(200).json({ success: true, message });

    } catch (error) {
        logger.error('Error deleting promo code', { adminUserId: req.user.id, promoCodeId: req.params.id, error: error.message, stack: error.stack });
        if (error.name === 'CastError') {
            return next(new AppError(`Invalid promo code ID: ${req.params.id}`, 400));
        }
        next(new AppError('Server error while deleting promo code.', 500));
    }
};

/**
 * @desc    Validate a promo code for a user and potential booking
 * @route   POST /api/v1/promocodes/validate
 * @access  Private (Authenticated Users)
 * @body    code, bookingAmount (optional), routeId (optional)
 */
exports.validatePromoCode = async (req, res, next) => {
    try {
        const { code, bookingAmount, routeId } = req.body;
        const userId = req.user.id;

        if (!code) {
            return next(new AppError('Promo code is required.', 400));
        }

        const promoCode = await PromoCode.findOne({ code: code.toUpperCase() });

        if (!promoCode) {
            return next(new AppError('Invalid or expired promo code.', 400));
        }

        const validationResult = await promoCode.validateForUser(userId, bookingAmount, routeId);

        if (!validationResult.isValid) {
            return next(new AppError(validationResult.message, 400));
        }

        logger.info('Promo code validated successfully', { userId, code, validationResult });
        res.status(200).json({
            success: true,
            message: 'Promo code is valid.',
            data: {
                code: promoCode.code,
                description: promoCode.description,
                discountType: promoCode.discountType,
                discountValue: promoCode.discountValue,
                // Potentially calculate and return the discount amount for the given bookingAmount
            }
        });

    } catch (error) {
        logger.error('Error validating promo code', { userId: req.user.id, error: error.message, stack: error.stack, body: req.body });
        if (error instanceof AppError) return next(error);
        next(new AppError('Server error while validating promo code.', 500));
    }
};

/**
 * @desc    Get public-facing active promo codes (e.g., for a promotional page)
 * @route   GET /api/v1/promocodes/active
 * @access  Public
 */
exports.getActivePublicPromoCodes = async (req, res, next) => {
    try {
        const now = new Date();
        const promoCodes = await PromoCode.find({
            isActive: true,
            validFrom: { $lte: now },
            $and: [
                {
                    $or: [
                        { validUntil: null },
                        { validUntil: { $gte: now } }
                    ]
                },
                {
                    $or: [
                        { maxUses: null },
                        { $expr: { $lt: ["$timesUsed", "$maxUses"] } }
                    ]
                }
            ],
            // Add any other criteria for public visibility, e.g., a 'isPublic' flag
            // applicableTo: { $in: ['all_routes', 'all_users'] } // Example: only show broadly applicable codes
        })
        .select('code description discountType discountValue validUntil minBookingAmount applicableTo -_id'); // Select only relevant public fields

        logger.info('Fetched active public promo codes');
        res.status(200).json({ success: true, data: promoCodes });

    } catch (error) {
        logger.error('Error fetching active public promo codes', { error: error.message, stack: error.stack });
        next(new AppError('Server error while fetching active promo codes.', 500));
    }
};