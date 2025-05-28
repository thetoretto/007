const Hotpoint = require('../models/Hotpoint');
const { AppError, ValidationError, NotFoundError } = require('../middleware/errorHandler');
const { createLogger } = require('../utils/logger');
const APIFeatures = require('../utils/apiFeatures'); // Assuming you have a utility for filtering, sorting, pagination

const logger = createLogger('HotpointController');

/**
 * @desc    Create a new hotpoint
 * @route   POST /api/v1/hotpoints
 * @access  Private (Admin)
 */
exports.createHotpoint = async (req, res, next) => {
  try {
    const { name, description, location, address, type, category, amenities, operatingHours, contact, images, tags } = req.body;

    if (!name || !location || !location.coordinates || location.coordinates.length !== 2) {
      return next(new ValidationError('Name and valid location coordinates are required.', 400));
    }

    const newHotpoint = await Hotpoint.create({
      name,
      description,
      location: {
        type: 'Point',
        coordinates: location.coordinates // [longitude, latitude]
      },
      address,
      type,
      category,
      amenities,
      operatingHours,
      contact,
      images,
      metadata: { createdBy: req.user.id, tags }
    });

    logger.info('Hotpoint created successfully', { hotpointId: newHotpoint._id, name: newHotpoint.name, adminUserId: req.user.id });
    res.status(201).json({
      success: true,
      message: 'Hotpoint created successfully.',
      data: newHotpoint
    });

  } catch (error) {
    logger.error('Error creating hotpoint', { error: error.message, stack: error.stack, body: req.body });
    if (error.name === 'ValidationError') {
      return next(new ValidationError(error.message));
    }
    next(new AppError('Server error while creating hotpoint.', 500));
  }
};

/**
 * @desc    Get all hotpoints
 * @route   GET /api/v1/hotpoints
 * @access  Public
 */
exports.getAllHotpoints = async (req, res, next) => {
  try {
    const features = new APIFeatures(Hotpoint.find(), req.query)
      .filter()
      .sort()
      .limitFields()
      .paginate();

    const hotpoints = await features.query;
    const totalHotpoints = await Hotpoint.countDocuments(features.getQuery()._conditions); // Get total count for pagination

    logger.info('Retrieved all hotpoints', { count: hotpoints.length, query: req.query });
    res.status(200).json({
      success: true,
      count: hotpoints.length,
      total: totalHotpoints,
      pagination: features.pagination,
      data: hotpoints
    });

  } catch (error) {
    logger.error('Error getting all hotpoints', { error: error.message, stack: error.stack });
    next(new AppError('Server error while retrieving hotpoints.', 500));
  }
};

/**
 * @desc    Get a single hotpoint by ID
 * @route   GET /api/v1/hotpoints/:id
 * @access  Public
 */
exports.getHotpointById = async (req, res, next) => {
  try {
    const hotpoint = await Hotpoint.findById(req.params.id);

    if (!hotpoint) {
      return next(new NotFoundError(`Hotpoint not found with ID: ${req.params.id}`, 404));
    }

    // Optionally increment view count or popularity score
    // hotpoint.metadata.views = (hotpoint.metadata.views || 0) + 1;
    // await hotpoint.save();

    logger.info('Retrieved hotpoint by ID', { hotpointId: req.params.id });
    res.status(200).json({
      success: true,
      data: hotpoint
    });

  } catch (error) {
    logger.error('Error getting hotpoint by ID', { hotpointId: req.params.id, error: error.message, stack: error.stack });
    if (error.name === 'CastError') {
        return next(new NotFoundError(`Hotpoint not found with ID: ${req.params.id}`, 404));
    }
    next(new AppError('Server error while retrieving hotpoint.', 500));
  }
};

/**
 * @desc    Update a hotpoint by ID
 * @route   PUT /api/v1/hotpoints/:id
 * @access  Private (Admin)
 */
exports.updateHotpoint = async (req, res, next) => {
  try {
    const { location, tags } = req.body;
    
    const updateData = { ...req.body };
    if (location && location.coordinates) {
        updateData.location = { type: 'Point', coordinates: location.coordinates };
    }
    updateData['metadata.updatedBy'] = req.user.id;
    updateData['metadata.lastUpdatedAt'] = Date.now();
    if(tags) updateData['metadata.tags'] = tags;

    const hotpoint = await Hotpoint.findByIdAndUpdate(req.params.id, updateData, {
      new: true,
      runValidators: true
    });

    if (!hotpoint) {
      return next(new NotFoundError(`Hotpoint not found with ID: ${req.params.id}`, 404));
    }

    logger.info('Hotpoint updated successfully', { hotpointId: req.params.id, adminUserId: req.user.id });
    res.status(200).json({
      success: true,
      message: 'Hotpoint updated successfully.',
      data: hotpoint
    });

  } catch (error) {
    logger.error('Error updating hotpoint', { hotpointId: req.params.id, error: error.message, stack: error.stack, body: req.body });
    if (error.name === 'ValidationError') {
      return next(new ValidationError(error.message));
    }
    if (error.name === 'CastError') {
        return next(new NotFoundError(`Hotpoint not found with ID: ${req.params.id}`, 404));
    }
    next(new AppError('Server error while updating hotpoint.', 500));
  }
};

/**
 * @desc    Delete a hotpoint by ID
 * @route   DELETE /api/v1/hotpoints/:id
 * @access  Private (Admin)
 */
exports.deleteHotpoint = async (req, res, next) => {
  try {
    const hotpoint = await Hotpoint.findById(req.params.id);

    if (!hotpoint) {
      return next(new NotFoundError(`Hotpoint not found with ID: ${req.params.id}`, 404));
    }

    // Instead of deleting, consider soft delete by setting a status like 'deleted' or 'archived'
    // await hotpoint.remove(); // Or hotpoint.deleteOne();
    hotpoint.status = 'deleted'; // Example of soft delete
    hotpoint.metadata.deletedBy = req.user.id;
    hotpoint.metadata.deletedAt = Date.now();
    await hotpoint.save();

    logger.info('Hotpoint (soft) deleted successfully', { hotpointId: req.params.id, adminUserId: req.user.id });
    res.status(200).json({
      success: true,
      message: 'Hotpoint deleted successfully.',
      data: {} // Or return the soft-deleted object
    });

  } catch (error) {
    logger.error('Error deleting hotpoint', { hotpointId: req.params.id, error: error.message, stack: error.stack });
     if (error.name === 'CastError') {
        return next(new NotFoundError(`Hotpoint not found with ID: ${req.params.id}`, 404));
    }
    next(new AppError('Server error while deleting hotpoint.', 500));
  }
};

/**
 * @desc    Get hotpoints within a certain distance (geospatial query)
 * @route   GET /api/v1/hotpoints/nearby
 * @access  Public
 * @query   lat,lng (latitude,longitude), distance (in km), unit (km or mi, default km)
 */
exports.getHotpointsNearby = async (req, res, next) => {
  try {
    const { lat, lng, distance, unit } = req.query;

    if (!lat || !lng) {
      return next(new ValidationError('Latitude and longitude are required for nearby search.', 400));
    }

    const latitude = parseFloat(lat);
    const longitude = parseFloat(lng);
    const maxDistance = parseFloat(distance) || 10; // Default 10 km
    const radiusUnit = unit === 'mi' ? 3963.2 : 6378.1; // Earth radius in miles or kilometers
    const distanceInRadians = maxDistance / radiusUnit;

    const hotpoints = await Hotpoint.find({
      location: {
        $geoWithin: { $centerSphere: [[longitude, latitude], distanceInRadians] }
      },
      status: { $ne: 'deleted' } // Exclude soft-deleted hotpoints
    });

    // Alternative using $nearSphere for sorted results by distance (requires 2dsphere index)
    /*
    const hotpoints = await Hotpoint.find({
      location: {
        $nearSphere: {
          $geometry: {
            type: 'Point',
            coordinates: [longitude, latitude]
          },
          $maxDistance: maxDistance * (unit === 'mi' ? 1609.34 : 1000) // Convert to meters
        }
      },
      status: { $ne: 'deleted' }
    });
    */

    logger.info('Retrieved nearby hotpoints', { lat, lng, distance, count: hotpoints.length });
    res.status(200).json({
      success: true,
      count: hotpoints.length,
      data: hotpoints
    });

  } catch (error) {
    logger.error('Error getting nearby hotpoints', { error: error.message, stack: error.stack, query: req.query });
    next(new AppError('Server error while searching nearby hotpoints.', 500));
  }
};

/**
 * @desc    Search hotpoints by keyword, category, tags, etc.
 * @route   GET /api/v1/hotpoints/search
 * @access  Public
 * @query   q (keyword), category, type, tags, amenities, rating (minRating)
 */
exports.searchHotpoints = async (req, res, next) => {
  try {
    const { q, category, type, tags, amenities, rating } = req.query;
    let queryFilter = { status: { $ne: 'deleted' } };

    if (q) {
      queryFilter.$text = { $search: q }; // Requires a text index on name, description, etc.
    }
    if (category) {
      queryFilter.category = { $in: category.split(',') };
    }
    if (type) {
      queryFilter.type = { $in: type.split(',') };
    }
    if (tags) {
      queryFilter['metadata.tags'] = { $in: tags.split(',') };
    }
    if (amenities) {
      queryFilter.amenities = { $all: amenities.split(',') }; // All specified amenities must be present
    }
    if (rating) {
      queryFilter['rating.average'] = { $gte: parseFloat(rating) };
    }

    const features = new APIFeatures(Hotpoint.find(queryFilter), req.query)
      .sort()
      .limitFields()
      .paginate();

    const hotpoints = await features.query;
    const totalHotpoints = await Hotpoint.countDocuments(features.getQuery()._conditions);

    logger.info('Searched hotpoints', { query: req.query, count: hotpoints.length });
    res.status(200).json({
      success: true,
      count: hotpoints.length,
      total: totalHotpoints,
      pagination: features.pagination,
      data: hotpoints
    });

  } catch (error) {
    logger.error('Error searching hotpoints', { error: error.message, stack: error.stack, query: req.query });
    next(new AppError('Server error while searching hotpoints.', 500));
  }
};

/**
 * @desc    Get distinct categories, types, or tags for filtering
 * @route   GET /api/v1/hotpoints/filters
 * @access  Public
 */
exports.getHotpointFilters = async (req, res, next) => {
    try {
        const categories = await Hotpoint.distinct('category', { status: { $ne: 'deleted' } });
        const types = await Hotpoint.distinct('type', { status: { $ne: 'deleted' } });
        const tags = await Hotpoint.distinct('metadata.tags', { status: { $ne: 'deleted' } });
        // Could also get min/max price if applicable, or other filterable fields

        logger.info('Retrieved hotpoint filter options');
        res.status(200).json({
            success: true,
            data: {
                categories: categories.sort(),
                types: types.sort(),
                tags: tags.sort()
            }
        });
    } catch (error) {
        logger.error('Error fetching hotpoint filter options', { error: error.message, stack: error.stack });
        next(new AppError('Server error while fetching filter options.', 500));
    }
};