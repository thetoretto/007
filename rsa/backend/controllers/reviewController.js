const Review = require('../models/Review'); // Assuming Review model exists or will be created
const Trip = require('../models/Trip');
const Route = require('../models/Route');
const Driver = require('../models/Driver');
const { AppError, ValidationError, NotFoundError, AuthorizationError } = require('../middleware/errorHandler');
const { createLogger } = require('../utils/logger');
const APIFeatures = require('../utils/apiFeatures');

const logger = createLogger('ReviewController');

// Helper function to update average rating on related model
const updateAverageRating = async (model, modelId, rating) => {
    try {
        const entity = await model.findById(modelId);
        if (!entity) return; // Or throw error

        // Ensure ratings field exists and is an array
        if (!entity.ratings || !Array.isArray(entity.ratings.values)) {
            entity.ratings = { values: [], average: 0, count: 0 };
        }

        entity.ratings.values.push(rating);
        entity.ratings.count = entity.ratings.values.length;
        const sum = entity.ratings.values.reduce((acc, curr) => acc + curr, 0);
        entity.ratings.average = entity.ratings.count > 0 ? parseFloat((sum / entity.ratings.count).toFixed(2)) : 0;
        
        await entity.save();
        logger.info(`Updated average rating for ${model.modelName} ID ${modelId}`, { newAverage: entity.ratings.average });
    } catch (error) {
        logger.error(`Error updating average rating for ${model.modelName} ID ${modelId}`, { error: error.message });
        // Decide if this error should propagate or just be logged
    }
};

/**
 * @desc    Create a new review
 * @route   POST /api/v1/reviews
 * @access  Private (User)
 */
exports.createReview = async (req, res, next) => {
  try {
    const { reviewFor, entityId, rating, comment, title } = req.body;
    const userId = req.user.id;

    if (!reviewFor || !entityId || rating === undefined) {
      return next(new ValidationError('Review target (reviewFor, entityId) and rating are required.', 400));
    }

    // Validate rating value
    if (rating < 1 || rating > 5) {
        return next(new ValidationError('Rating must be between 1 and 5.', 400));
    }

    let targetModel, targetField;
    switch (reviewFor.toLowerCase()) {
      case 'trip':
        targetModel = Trip;
        targetField = 'trip';
        break;
      case 'route':
        targetModel = Route;
        targetField = 'route';
        break;
      case 'driver':
        targetModel = Driver;
        targetField = 'driver';
        break;
      default:
        return next(new ValidationError('Invalid review target specified. Must be trip, route, or driver.', 400));
    }

    const entityExists = await targetModel.findById(entityId);
    if (!entityExists) {
      return next(new NotFoundError(`${reviewFor.charAt(0).toUpperCase() + reviewFor.slice(1)} not found with ID: ${entityId}`, 404));
    }

    // Check if user has already reviewed this entity (optional, based on business logic)
    const existingReview = await Review.findOne({ user: userId, [targetField]: entityId });
    if (existingReview) {
        return next(new AppError(`You have already reviewed this ${reviewFor}.`, 400));
    }

    // For 'trip' reviews, ensure the user was part of the trip (example validation)
    if (reviewFor.toLowerCase() === 'trip') {
        const trip = await Trip.findById(entityId).populate('passengers.user');
        const isPassenger = trip && trip.passengers.some(p => p.user._id.toString() === userId);
        const isBooker = trip && trip.user.toString() === userId;
        if (!isPassenger && !isBooker) {
            return next(new AuthorizationError('You can only review trips you were part of or booked.', 403));
        }
    }

    const reviewData = {
      user: userId,
      rating,
      comment,
      title,
      reviewFor,
      [targetField]: entityId,
      metadata: { createdAt: Date.now(), createdBy: userId }
    };

    const review = await Review.create(reviewData);

    // Update average rating on the reviewed entity
    await updateAverageRating(targetModel, entityId, rating);

    logger.info('Review created successfully', { reviewId: review._id, userId, entityId, reviewFor });
    res.status(201).json({
      success: true,
      message: 'Review submitted successfully.',
      data: review
    });
  } catch (error) {
    logger.error('Error creating review', { userId: req.user.id, error: error.message, stack: error.stack, body: req.body });
    if (error.name === 'ValidationError') {
      return next(new ValidationError(error.message));
    }
    next(new AppError('Server error while submitting your review.', 500));
  }
};

/**
 * @desc    Get all reviews (can be filtered by entity)
 * @route   GET /api/v1/reviews
 * @route   GET /api/v1/trips/:tripId/reviews
 * @route   GET /api/v1/routes/:routeId/reviews
 * @route   GET /api/v1/drivers/:driverId/reviews
 * @access  Public
 */
exports.getAllReviews = async (req, res, next) => {
  try {
    let filter = {};
    if (req.params.tripId) filter.trip = req.params.tripId;
    if (req.params.routeId) filter.route = req.params.routeId;
    if (req.params.driverId) filter.driver = req.params.driverId;

    const features = new APIFeatures(Review.find(filter)
        .populate({ path: 'user', select: 'profile.firstName profile.lastName profile.avatar' })
        .populate({ path: 'trip', select: 'tripId' })
        .populate({ path: 'route', select: 'name' })
        .populate({ path: 'driver', select: 'profile.firstName profile.lastName' }), // Populate driver if review is for a driver
        req.query)
      .filter()
      .sort()
      .limitFields()
      .paginate();

    const reviews = await features.query;
    const totalReviews = await Review.countDocuments({ ...features.getQuery()._conditions, ...filter });

    logger.info('Retrieved reviews', { count: reviews.length, filter, query: req.query });
    res.status(200).json({
      success: true,
      count: reviews.length,
      total: totalReviews,
      pagination: features.pagination,
      data: reviews
    });
  } catch (error) {
    logger.error('Error getting reviews', { error: error.message, stack: error.stack, filter: req.params });
    next(new AppError('Server error while retrieving reviews.', 500));
  }
};

/**
 * @desc    Get a single review by ID
 * @route   GET /api/v1/reviews/:id
 * @access  Public
 */
exports.getReviewById = async (req, res, next) => {
  try {
    const review = await Review.findById(req.params.id)
        .populate({ path: 'user', select: 'profile.firstName profile.lastName profile.avatar' })
        .populate({ path: 'trip', select: 'tripId' })
        .populate({ path: 'route', select: 'name' })
        .populate({ path: 'driver', select: 'profile.firstName profile.lastName' });

    if (!review) {
      return next(new NotFoundError(`Review not found with ID: ${req.params.id}`, 404));
    }

    logger.info('Retrieved review by ID', { reviewId: req.params.id });
    res.status(200).json({
      success: true,
      data: review
    });
  } catch (error) {
    logger.error('Error getting review by ID', { reviewId: req.params.id, error: error.message, stack: error.stack });
    if (error.name === 'CastError') {
        return next(new NotFoundError(`Review not found with ID: ${req.params.id}`, 404));
    }
    next(new AppError('Server error while retrieving the review.', 500));
  }
};

/**
 * @desc    Update a review (only by owner or admin)
 * @route   PUT /api/v1/reviews/:id
 * @access  Private
 */
exports.updateReview = async (req, res, next) => {
  try {
    const { rating, comment, title } = req.body;
    const reviewId = req.params.id;
    const userId = req.user.id;

    const review = await Review.findById(reviewId);

    if (!review) {
      return next(new NotFoundError(`Review not found with ID: ${reviewId}`, 404));
    }

    // Check ownership or admin role
    if (review.user.toString() !== userId && req.user.role !== 'admin') {
      return next(new AuthorizationError('You are not authorized to update this review.', 403));
    }

    let oldRating = review.rating;
    let ratingChanged = false;

    if (rating !== undefined) {
        if (rating < 1 || rating > 5) {
            return next(new ValidationError('Rating must be between 1 and 5.', 400));
        }
        if (review.rating !== rating) {
            review.rating = rating;
            ratingChanged = true;
        }
    }
    if (comment !== undefined) review.comment = comment;
    if (title !== undefined) review.title = title;
    review.metadata.lastUpdatedAt = Date.now();
    review.metadata.updatedBy = userId;

    await review.save();

    // If rating changed, update the average rating on the related entity
    if (ratingChanged) {
        let targetModel;
        let entityId;
        switch (review.reviewFor.toLowerCase()) {
            case 'trip': targetModel = Trip; entityId = review.trip; break;
            case 'route': targetModel = Route; entityId = review.route; break;
            case 'driver': targetModel = Driver; entityId = review.driver; break;
        }
        if (targetModel && entityId) {
            // To recalculate, we might need to fetch all ratings for that entity or adjust based on old/new
            // For simplicity, let's assume the updateAverageRating can handle recalculation or we fetch all ratings.
            // A more robust way: fetch all ratings for the entity and recalculate.
            const entity = await targetModel.findById(entityId);
            if (entity && entity.ratings && Array.isArray(entity.ratings.values)) {
                // Find and update the specific rating value or re-calculate entirely
                const ratingIndex = entity.ratings.values.indexOf(oldRating); // This is simplistic, assumes unique old rating
                if (ratingIndex > -1) {
                    entity.ratings.values.splice(ratingIndex, 1, review.rating);
                } else {
                    // If old rating not found (e.g., data inconsistency), just add new one and recalculate
                    // This part needs careful thought for accuracy
                    entity.ratings.values.push(review.rating); // Or fetch all reviews and rebuild
                }
                const sum = entity.ratings.values.reduce((acc, curr) => acc + curr, 0);
                entity.ratings.average = entity.ratings.values.length > 0 ? parseFloat((sum / entity.ratings.values.length).toFixed(2)) : 0;
                entity.ratings.count = entity.ratings.values.length;
                await entity.save();
            }
        }
    }

    logger.info('Review updated successfully', { reviewId, userId, isAdmin: req.user.role === 'admin' });
    res.status(200).json({
      success: true,
      message: 'Review updated successfully.',
      data: review
    });
  } catch (error) {
    logger.error('Error updating review', { reviewId: req.params.id, userId: req.user.id, error: error.message, stack: error.stack, body: req.body });
    if (error.name === 'ValidationError') {
      return next(new ValidationError(error.message));
    }
    if (error.name === 'CastError') {
        return next(new NotFoundError(`Review not found with ID: ${req.params.id}`, 404));
    }
    next(new AppError('Server error while updating the review.', 500));
  }
};

/**
 * @desc    Delete a review (only by owner or admin)
 * @route   DELETE /api/v1/reviews/:id
 * @access  Private
 */
exports.deleteReview = async (req, res, next) => {
  try {
    const reviewId = req.params.id;
    const userId = req.user.id;

    const review = await Review.findById(reviewId);

    if (!review) {
      return next(new NotFoundError(`Review not found with ID: ${reviewId}`, 404));
    }

    // Check ownership or admin role
    if (review.user.toString() !== userId && req.user.role !== 'admin') {
      return next(new AuthorizationError('You are not authorized to delete this review.', 403));
    }

    const { reviewFor, rating } = review;
    let entityId;
    let targetModel;

    switch (reviewFor.toLowerCase()) {
        case 'trip': entityId = review.trip; targetModel = Trip; break;
        case 'route': entityId = review.route; targetModel = Route; break;
        case 'driver': entityId = review.driver; targetModel = Driver; break;
    }

    await review.deleteOne(); // Mongoose 5.x+, for older versions use review.remove()

    // After deleting the review, update the average rating of the related entity
    if (targetModel && entityId) {
        const entity = await targetModel.findById(entityId);
        if (entity && entity.ratings && Array.isArray(entity.ratings.values)) {
            const ratingIndex = entity.ratings.values.indexOf(rating);
            if (ratingIndex > -1) {
                entity.ratings.values.splice(ratingIndex, 1);
            }
            entity.ratings.count = entity.ratings.values.length;
            const sum = entity.ratings.values.reduce((acc, curr) => acc + curr, 0);
            entity.ratings.average = entity.ratings.count > 0 ? parseFloat((sum / entity.ratings.count).toFixed(2)) : 0;
            await entity.save();
        }
    }

    logger.info('Review deleted successfully', { reviewId, userId, isAdmin: req.user.role === 'admin' });
    res.status(200).json({ success: true, message: 'Review deleted successfully.', data: {} }); // Or 204 with no content
  } catch (error) {
    logger.error('Error deleting review', { reviewId: req.params.id, userId: req.user.id, error: error.message, stack: error.stack });
    if (error.name === 'CastError') {
        return next(new NotFoundError(`Review not found with ID: ${req.params.id}`, 404));
    }
    next(new AppError('Server error while deleting the review.', 500));
  }
};

/**
 * @desc    Get review statistics for an entity (e.g., average rating, count per rating)
 * @route   GET /api/v1/reviews/stats/:reviewFor/:entityId
 * @access  Public
 */
exports.getReviewStatistics = async (req, res, next) => {
    try {
        const { reviewFor, entityId } = req.params;

        let targetField;
        let TargetModel;
        switch (reviewFor.toLowerCase()) {
            case 'trip': targetField = 'trip'; TargetModel = Trip; break;
            case 'route': targetField = 'route'; TargetModel = Route; break;
            case 'driver': targetField = 'driver'; TargetModel = Driver; break;
            default:
                return next(new ValidationError('Invalid review target specified. Must be trip, route, or driver.', 400));
        }

        const entity = await TargetModel.findById(entityId).select('ratings'); // Check if entity exists and has ratings
        if (!entity) {
            return next(new NotFoundError(`${reviewFor.charAt(0).toUpperCase() + reviewFor.slice(1)} not found with ID: ${entityId}`, 404));
        }

        // Use aggregation pipeline for more detailed stats
        const stats = await Review.aggregate([
            { $match: { [targetField]: new mongoose.Types.ObjectId(entityId) } }, // Ensure entityId is ObjectId
            {
                $group: {
                    _id: '$rating',
                    count: { $sum: 1 }
                }
            },
            { $sort: { _id: 1 } } // Sort by rating (1-star to 5-star)
        ]);

        const ratingCounts = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
        let totalReviews = 0;
        let sumOfRatings = 0;

        stats.forEach(stat => {
            if (Object.prototype.hasOwnProperty.call(ratingCounts, stat._id)) {
                ratingCounts[stat._id] = stat.count;
                totalReviews += stat.count;
                sumOfRatings += stat._id * stat.count;
            }
        });

        const averageRating = totalReviews > 0 ? parseFloat((sumOfRatings / totalReviews).toFixed(2)) : 0;

        // Verify with the stored average rating if available and consistent
        // This can also be directly taken from the entity.ratings.average if always up-to-date

        logger.info('Retrieved review statistics', { reviewFor, entityId, averageRating, totalReviews });
        res.status(200).json({
            success: true,
            data: {
                entityId,
                reviewFor,
                averageRating: entity.ratings ? entity.ratings.average : averageRating, // Prefer stored if accurate
                totalReviews: entity.ratings ? entity.ratings.count : totalReviews,
                ratingDistribution: ratingCounts,
                // rawAggregation: stats // Optionally include for debugging
            }
        });

    } catch (error) {
        logger.error('Error getting review statistics', { reviewFor: req.params.reviewFor, entityId: req.params.entityId, error: error.message, stack: error.stack });
        if (error.name === 'CastError' && error.path === '_id') { // Check if CastError is for entityId
             return next(new NotFoundError(`${req.params.reviewFor.charAt(0).toUpperCase() + req.params.reviewFor.slice(1)} not found with ID: ${req.params.entityId}`, 404));
        }
        next(new AppError('Server error while retrieving review statistics.', 500));
    }
};

// Need to import mongoose for ObjectId in aggregation
const mongoose = require('mongoose');