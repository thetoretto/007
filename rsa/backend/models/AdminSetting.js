const mongoose = require('mongoose');
const { createLogger } = require('../utils/logger');

const logger = createLogger('AdminSettingModel');

const adminSettingSchema = new mongoose.Schema({
  key: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    enum: [
      // General Settings
      'site_name',
      'site_logo_url',
      'admin_email',
      'default_currency',
      'default_language',
      'timezone',
      'maintenance_mode',
      'maintenance_message',
      // API Keys & Integrations
      'google_maps_api_key',
      'stripe_publishable_key',
      'stripe_secret_key',
      'twilio_account_sid',
      'twilio_auth_token',
      'twilio_phone_number',
      'sendgrid_api_key',
      // Email Settings
      'email_from_address',
      'email_from_name',
      'smtp_host',
      'smtp_port',
      'smtp_user',
      'smtp_password',
      'smtp_secure', // boolean: true for SSL/TLS, false otherwise
      // Financial Settings
      'platform_fee_percentage',
      'minimum_payout_amount',
      'payout_schedule', // e.g., 'daily', 'weekly', 'monthly'
      // Operational Settings
      'max_trip_distance_km',
      'max_active_bookings_per_user',
      'driver_approval_required', // boolean
      'vehicle_approval_required', // boolean
      'auto_assign_driver_to_trip', // boolean
      // Security & Rate Limiting
      'max_login_attempts',
      'lockout_duration_minutes',
      'api_rate_limit_window_ms',
      'api_rate_limit_max_requests',
      // Legal & Compliance
      'terms_and_conditions_url',
      'privacy_policy_url',
      'cookie_policy_url',
      // Notifications
      'enable_sms_notifications',
      'enable_email_notifications',
      'enable_push_notifications',
      // Custom Features Flags
      'feature_realtime_tracking_enabled',
      'feature_dynamic_pricing_enabled',
      'feature_promo_codes_enabled',
      // Add more keys as needed
    ]
  },
  value: {
    type: mongoose.Schema.Types.Mixed, // Can store string, number, boolean, object, array
    required: true
  },
  description: {
    type: String,
    trim: true
  },
  type: {
    type: String,
    enum: ['string', 'number', 'boolean', 'object', 'array', 'secure_string'],
    default: 'string'
  },
  isEditable: {
    type: Boolean,
    default: true // Some settings might be system-critical and not editable via UI
  },
  group: {
    type: String,
    enum: [
      'general', 
      'api_keys', 
      'email', 
      'financial', 
      'operational', 
      'security', 
      'legal', 
      'notifications',
      'features',
      'other'
    ],
    default: 'other'
  },
  lastUpdatedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User' // Admin user who last updated this setting
  }
}, {
  timestamps: true
});

// Indexes
adminSettingSchema.index({ key: 1 }, { unique: true });
adminSettingSchema.index({ group: 1 });

// Static method to get a setting value by key
adminSettingSchema.statics.getSetting = async function(key) {
  try {
    const setting = await this.findOne({ key });
    if (setting) {
      return setting.value;
    }
    logger.warn(`Setting with key '${key}' not found.`);
    return null; // Or a default value if appropriate
  } catch (error) {
    logger.error(`Error fetching setting '${key}':`, { error });
    return null;
  }
};

// Static method to get multiple settings by keys
adminSettingSchema.statics.getSettings = async function(keys) {
  try {
    const settings = await this.find({ key: { $in: keys } });
    const settingsMap = settings.reduce((acc, setting) => {
      acc[setting.key] = setting.value;
      return acc;
    }, {});
    return settingsMap;
  } catch (error) {
    logger.error('Error fetching multiple settings:', { error, keys });
    return {};
  }
};

// Static method to set/update a setting value
adminSettingSchema.statics.setSetting = async function(key, value, adminUserId, options = {}) {
  try {
    const { description, type, group, isEditable } = options;
    const updateData = { value, lastUpdatedBy: adminUserId };
    if (description !== undefined) updateData.description = description;
    if (type !== undefined) updateData.type = type;
    if (group !== undefined) updateData.group = group;
    if (isEditable !== undefined) updateData.isEditable = isEditable;

    const setting = await this.findOneAndUpdate(
      { key },
      { $set: updateData },
      { new: true, upsert: true, runValidators: true }
    );
    logger.info(`Setting '${key}' updated successfully by admin ${adminUserId}.`);
    return setting;
  } catch (error) {
    logger.error(`Error updating setting '${key}':`, { error, value });
    throw error;
  }
};

// Static method to get all settings, optionally grouped
adminSettingSchema.statics.getAllSettings = async function(grouped = false) {
  try {
    const settings = await this.find().populate('lastUpdatedBy', 'profile.firstName profile.lastName email');
    if (!grouped) {
      return settings;
    }
    const groupedSettings = settings.reduce((acc, setting) => {
      const groupKey = setting.group || 'other';
      if (!acc[groupKey]) {
        acc[groupKey] = [];
      }
      acc[groupKey].push(setting);
      return acc;
    }, {});
    return groupedSettings;
  } catch (error) {
    logger.error('Error fetching all settings:', { error });
    return grouped ? {} : [];
  }
};

// Pre-save hook for logging
adminSettingSchema.pre('save', function(next) {
  if (this.isModified()) {
    logger.info('AdminSetting modified', { key: this.key, newValue: this.value });
  }
  next();
});

const AdminSetting = mongoose.model('AdminSetting', adminSettingSchema);

module.exports = AdminSetting;