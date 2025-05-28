const AdminSetting = require('../models/AdminSetting');
const { AppError, ValidationError, NotFoundError } = require('../middleware/errorHandler');
const { createLogger } = require('../utils/logger');

const logger = createLogger('AdminSettingController');

/**
 * @desc    Get all admin settings
 * @route   GET /api/v1/admin/settings
 * @access  Private (SuperAdmin/Admin)
 */
exports.getAllSettings = async (req, res, next) => {
  try {
    const settings = await AdminSetting.find().sort('group key');
    logger.info('Retrieved all admin settings', { count: settings.length, adminUserId: req.user.id });
    res.status(200).json({
      success: true,
      count: settings.length,
      data: settings
    });
  } catch (error) {
    logger.error('Error getting all admin settings', { adminUserId: req.user.id, error: error.message, stack: error.stack });
    next(new AppError('Server error while retrieving settings.', 500));
  }
};

/**
 * @desc    Get a specific setting by key
 * @route   GET /api/v1/admin/settings/:key
 * @access  Private (SuperAdmin/Admin)
 */
exports.getSettingByKey = async (req, res, next) => {
  try {
    const setting = await AdminSetting.findOne({ key: req.params.key });
    if (!setting) {
      return next(new NotFoundError(`Setting with key '${req.params.key}' not found.`, 404));
    }
    logger.info('Retrieved admin setting by key', { key: req.params.key, adminUserId: req.user.id });
    res.status(200).json({
      success: true,
      data: setting
    });
  } catch (error) {
    logger.error(`Error getting admin setting by key ${req.params.key}`, { key: req.params.key, adminUserId: req.user.id, error: error.message, stack: error.stack });
    next(new AppError('Server error while retrieving setting.', 500));
  }
};

/**
 * @desc    Update a setting by key
 * @route   PUT /api/v1/admin/settings/:key
 * @access  Private (SuperAdmin)
 */
exports.updateSetting = async (req, res, next) => {
  try {
    const { value } = req.body;
    if (value === undefined) {
      return next(new ValidationError('Value is required to update a setting.', 400));
    }

    const setting = await AdminSetting.findOne({ key: req.params.key });
    if (!setting) {
      return next(new NotFoundError(`Setting with key '${req.params.key}' not found.`, 404));
    }

    if (!setting.isEditable) {
        return next(new AppError(`Setting '${req.params.key}' is not editable.`, 403));
    }

    // Validate value type if necessary (e.g., based on setting.type)
    // For simplicity, this example directly sets the value.
    // In a real app, you might want to cast to 'Number', 'Boolean', etc.
    // switch (setting.type) {
    //     case 'Boolean': updatedValue = Boolean(value); break;
    //     case 'Number': updatedValue = Number(value); break;
    //     case 'JSON': try { updatedValue = JSON.parse(value); } catch (e) { return next(new ValidationError('Invalid JSON format for value.'));} break;
    //     default: updatedValue = value;
    // }

    setting.value = value;
    setting.metadata.lastUpdatedAt = Date.now();
    setting.metadata.updatedBy = req.user.id; // Assuming req.user is populated

    await setting.save();

    logger.info('Admin setting updated successfully', { key: req.params.key, adminUserId: req.user.id, newValue: value });
    res.status(200).json({
      success: true,
      message: `Setting '${req.params.key}' updated successfully.`,
      data: setting
    });
  } catch (error) {
    logger.error(`Error updating admin setting ${req.params.key}`, { key: req.params.key, adminUserId: req.user.id, error: error.message, stack: error.stack, body: req.body });
    next(new AppError('Server error while updating setting.', 500));
  }
};

/**
 * @desc    Create a new admin setting (Use with caution, typically settings are predefined)
 * @route   POST /api/v1/admin/settings
 * @access  Private (SuperAdmin - highly restricted)
 */
exports.createSetting = async (req, res, next) => {
    try {
        const { key, value, description, type, group, isEditable, isSensitive } = req.body;

        if (!key || value === undefined || !type) {
            return next(new ValidationError('Key, value, and type are required for a new setting.', 400));
        }

        const existingSetting = await AdminSetting.findOne({ key });
        if (existingSetting) {
            return next(new AppError(`Setting with key '${key}' already exists.`, 400));
        }

        const newSetting = await AdminSetting.create({
            key,
            value,
            description,
            type,
            group: group || 'General',
            isEditable: isEditable !== undefined ? isEditable : true,
            isSensitive: isSensitive !== undefined ? isSensitive : false,
            metadata: {
                createdAt: Date.now(),
                createdBy: req.user.id, // Assuming req.user is populated
                lastUpdatedAt: Date.now(),
                updatedBy: req.user.id
            }
        });

        logger.info('New admin setting created', { key, adminUserId: req.user.id });
        res.status(201).json({
            success: true,
            message: 'Setting created successfully.',
            data: newSetting
        });
    } catch (error) {
        logger.error('Error creating admin setting', { adminUserId: req.user.id, error: error.message, stack: error.stack, body: req.body });
        if (error.name === 'ValidationError') {
            return next(new ValidationError(error.message));
        }
        next(new AppError('Server error while creating the setting.', 500));
    }
};

/**
 * @desc    Get settings by group
 * @route   GET /api/v1/admin/settings/group/:groupName
 * @access  Private (SuperAdmin/Admin)
 */
exports.getSettingsByGroup = async (req, res, next) => {
    try {
        const groupName = req.params.groupName;
        const settings = await AdminSetting.find({ group: groupName }).sort('key');
        
        if (!settings || settings.length === 0) {
            logger.warn('No settings found for group', { groupName, adminUserId: req.user.id });
            // Depending on desired behavior, could be 404 or empty array
            // return next(new NotFoundError(`No settings found for group '${groupName}'.`, 404));
        }
        
        logger.info('Retrieved admin settings by group', { groupName, count: settings.length, adminUserId: req.user.id });
        res.status(200).json({
            success: true,
            count: settings.length,
            data: settings
        });
    } catch (error) {
        logger.error(`Error getting admin settings by group ${req.params.groupName}`, { group: req.params.groupName, adminUserId: req.user.id, error: error.message, stack: error.stack });
        next(new AppError('Server error while retrieving settings by group.', 500));
    }
};


/**
 * @desc    Get all distinct setting groups
 * @route   GET /api/v1/admin/settings/groups
 * @access  Private (SuperAdmin/Admin)
 */
exports.getSettingGroups = async (req, res, next) => {
    try {
        const groups = await AdminSetting.distinct('group');
        logger.info('Retrieved distinct admin setting groups', { count: groups.length, adminUserId: req.user.id });
        res.status(200).json({
            success: true,
            count: groups.length,
            data: groups.sort()
        });
    } catch (error) {
        logger.error('Error getting admin setting groups', { adminUserId: req.user.id, error: error.message, stack: error.stack });
        next(new AppError('Server error while retrieving setting groups.', 500));
    }
};