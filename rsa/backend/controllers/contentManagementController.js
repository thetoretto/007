const Content = require('../models/Content'); // Assuming Content model will be created
const { AppError } = require('../middleware/errorHandler');
const { createLogger } = require('../utils/logger');

const logger = createLogger('ContentManagementController');

/**
 * @desc    Create a new content entry (e.g., FAQ, T&C, blog post)
 * @route   POST /api/v1/admin/content
 * @access  Private (Admin or Content Manager role)
 */
exports.createContent = async (req, res, next) => {
    try {
        const {
            slug, // Unique identifier for the content, e.g., 'faq', 'terms-and-conditions', 'privacy-policy', 'blog/my-first-post'
            title,
            body, // Can be HTML, Markdown, or plain text depending on frontend rendering
            contentType, // e.g., 'page', 'faq_item', 'blog_post', 'policy'
            category, // Optional, for grouping (e.g., 'Legal', 'Help', 'Announcements')
            tags, // Optional array of strings
            metaTitle, // For SEO
            metaDescription, // For SEO
            status, // 'draft', 'published', 'archived'
            author, // User ID of the author/creator
            language // e.g., 'en', 'es'
        } = req.body;

        if (!slug || !title || !body || !contentType) {
            return next(new AppError('Slug, title, body, and content type are required.', 400));
        }

        const existingContent = await Content.findOne({ slug, language: language || 'en' }); // Ensure slug is unique per language
        if (existingContent) {
            return next(new AppError(`Content with slug '${slug}' already exists for the specified language.`, 400));
        }

        const contentData = {
            slug: slug.toLowerCase().replace(/\s+/g, '-'), // Sanitize slug
            title,
            body,
            contentType,
            category,
            tags,
            metaTitle: metaTitle || title,
            metaDescription,
            status: status || 'draft',
            author: author || req.user.id, // Default to current user if not provided
            createdBy: req.user.id,
            language: language || 'en', // Default language
            versions: [{ body, author: author || req.user.id, createdAt: new Date() }] // Initial version
        };

        const newContent = await Content.create(contentData);

        logger.info('Content entry created', { adminUserId: req.user.id, contentId: newContent._id, slug: newContent.slug });
        res.status(201).json({ success: true, data: newContent });

    } catch (error) {
        logger.error('Error creating content entry', { adminUserId: req.user.id, error: error.message, stack: error.stack, body: req.body });
        if (error.name === 'ValidationError') {
            return next(new AppError(Object.values(error.errors).map(e => e.message).join(', '), 400));
        }
        next(new AppError('Server error while creating content entry.', 500));
    }
};

/**
 * @desc    Get all content entries (for admin listing)
 * @route   GET /api/v1/admin/content
 * @access  Private (Admin or Content Manager role)
 * @query   contentType, category, status, language, page, limit, sortBy, sortOrder, search
 */
exports.getAllContentEntries = async (req, res, next) => {
    try {
        const {
            contentType,
            category,
            status,
            language,
            search, // Search by title or slug
            page = 1,
            limit = 20,
            sortBy = 'updatedAt', // or 'createdAt', 'title'
            sortOrder = 'desc'
        } = req.query;

        let query = {};
        if (contentType) query.contentType = contentType;
        if (category) query.category = { $regex: category, $options: 'i' };
        if (status) query.status = status;
        if (language) query.language = language;
        if (search) {
            query.$or = [
                { title: { $regex: search, $options: 'i' } },
                { slug: { $regex: search, $options: 'i' } }
            ];
        }

        const sortOptions = {};
        sortOptions[sortBy] = sortOrder === 'asc' ? 1 : -1;

        const totalContent = await Content.countDocuments(query);
        const contentEntries = await Content.find(query)
            .populate('author', 'profile.firstName profile.lastName')
            .populate('createdBy', 'profile.firstName profile.lastName')
            .populate('lastUpdatedBy', 'profile.firstName profile.lastName')
            .sort(sortOptions)
            .skip((page - 1) * limit)
            .limit(parseInt(limit))
            .select('-versions.body'); // Exclude full body of all versions in list view for performance

        logger.info('Fetched all content entries', { adminUserId: req.user.id, query, page, limit, totalContent });

        res.status(200).json({
            success: true,
            count: contentEntries.length,
            total: totalContent,
            pagination: {
                currentPage: parseInt(page),
                totalPages: Math.ceil(totalContent / limit),
                limit: parseInt(limit)
            },
            data: contentEntries
        });

    } catch (error) {
        logger.error('Error fetching all content entries', { adminUserId: req.user.id, error: error.message, stack: error.stack, query: req.query });
        next(new AppError('Server error while fetching content entries.', 500));
    }
};

/**
 * @desc    Get a specific content entry by ID (for admin editing)
 * @route   GET /api/v1/admin/content/:id
 * @access  Private (Admin or Content Manager role)
 */
exports.getContentEntryById = async (req, res, next) => {
    try {
        const contentId = req.params.id;
        const contentEntry = await Content.findById(contentId)
            .populate('author', 'profile.firstName profile.lastName email')
            .populate('createdBy', 'profile.firstName profile.lastName')
            .populate('lastUpdatedBy', 'profile.firstName profile.lastName')
            .populate('versions.author', 'profile.firstName profile.lastName'); // Populate authors of versions

        if (!contentEntry) {
            logger.warn('Content entry not found by ID', { adminUserId: req.user.id, contentId });
            return next(new AppError('Content entry not found.', 404));
        }

        logger.info('Fetched content entry by ID', { adminUserId: req.user.id, contentId });
        res.status(200).json({ success: true, data: contentEntry });

    } catch (error) {
        logger.error('Error fetching content entry by ID', { adminUserId: req.user.id, contentId: req.params.id, error: error.message, stack: error.stack });
        if (error.name === 'CastError') {
            return next(new AppError(`Invalid content ID: ${req.params.id}`, 400));
        }
        next(new AppError('Server error while fetching content entry.', 500));
    }
};

/**
 * @desc    Update a content entry
 * @route   PUT /api/v1/admin/content/:id
 * @access  Private (Admin or Content Manager role)
 */
exports.updateContentEntry = async (req, res, next) => {
    try {
        const contentId = req.params.id;
        const updates = req.body;

        const existingContent = await Content.findById(contentId);
        if (!existingContent) {
            logger.warn('Content entry not found for update', { adminUserId: req.user.id, contentId });
            return next(new AppError('Content entry not found.', 404));
        }

        // If slug is being updated, check for uniqueness again (excluding current document)
        if (updates.slug && updates.slug !== existingContent.slug) {
            updates.slug = updates.slug.toLowerCase().replace(/\s+/g, '-');
            const conflictingContent = await Content.findOne({ slug: updates.slug, language: updates.language || existingContent.language, _id: { $ne: contentId } });
            if (conflictingContent) {
                return next(new AppError(`Content with slug '${updates.slug}' already exists for the specified language.`, 400));
            }
        }

        // If body is updated, create a new version
        if (updates.body && updates.body !== existingContent.body) {
            existingContent.versions.push({
                body: updates.body,
                author: req.user.id,
                createdAt: new Date()
            });
            // Optionally limit the number of versions stored, e.g., existingContent.versions = existingContent.versions.slice(-10);
        }

        // Apply other updates
        Object.keys(updates).forEach(key => {
            if (key !== '_id' && key !== 'versions' && key !== 'createdBy' && key !== 'createdAt') { // Prevent direct modification of certain fields
                existingContent[key] = updates[key];
            }
        });

        existingContent.lastUpdatedBy = req.user.id;
        existingContent.updatedAt = new Date(); // Mongoose handles this automatically if timestamps: true

        const updatedContent = await existingContent.save();

        logger.info('Content entry updated', { adminUserId: req.user.id, contentId });
        res.status(200).json({ success: true, data: updatedContent });

    } catch (error) {
        logger.error('Error updating content entry', { adminUserId: req.user.id, contentId: req.params.id, error: error.message, stack: error.stack, body: req.body });
        if (error.name === 'ValidationError') {
            return next(new AppError(Object.values(error.errors).map(e => e.message).join(', '), 400));
        }
        if (error.name === 'CastError') {
            return next(new AppError(`Invalid content ID: ${req.params.id}`, 400));
        }
        next(new AppError('Server error while updating content entry.', 500));
    }
};

/**
 * @desc    Delete a content entry (soft or hard delete)
 * @route   DELETE /api/v1/admin/content/:id
 * @access  Private (Admin or Content Manager role)
 */
exports.deleteContentEntry = async (req, res, next) => {
    try {
        const contentId = req.params.id;
        const contentEntry = await Content.findById(contentId);

        if (!contentEntry) {
            logger.warn('Content entry not found for deletion', { adminUserId: req.user.id, contentId });
            return next(new AppError('Content entry not found.', 404));
        }

        // Option 1: Hard delete
        // await contentEntry.remove();
        // const message = 'Content entry deleted successfully.';

        // Option 2: Soft delete (by changing status to 'archived' or setting a deletedAt timestamp)
        contentEntry.status = 'archived';
        contentEntry.deletedAt = new Date(); // Assuming a deletedAt field in schema for soft delete
        contentEntry.lastUpdatedBy = req.user.id;
        await contentEntry.save();
        const message = 'Content entry archived successfully.';

        logger.info('Content entry deleted/archived', { adminUserId: req.user.id, contentId });
        res.status(200).json({ success: true, message });

    } catch (error) {
        logger.error('Error deleting content entry', { adminUserId: req.user.id, contentId: req.params.id, error: error.message, stack: error.stack });
        if (error.name === 'CastError') {
            return next(new AppError(`Invalid content ID: ${req.params.id}`, 400));
        }
        next(new AppError('Server error while deleting content entry.', 500));
    }
};

/**
 * @desc    Get publicly accessible content by slug (e.g., for displaying FAQ, T&C on frontend)
 * @route   GET /api/v1/content/:slug
 * @access  Public
 * @query   lang (optional language code, defaults to 'en')
 */
exports.getPublicContentBySlug = async (req, res, next) => {
    try {
        const slug = req.params.slug;
        const language = req.query.lang || 'en'; // Default to English

        const contentEntry = await Content.findOne({
            slug: slug.toLowerCase(),
            status: 'published',
            language: language
        })
        .select('title body contentType category tags metaTitle metaDescription updatedAt language'); // Select fields relevant for public display

        if (!contentEntry) {
            logger.warn('Public content not found by slug', { slug, language });
            // Try fetching in default language if not found in specified language as a fallback
            if (language !== 'en') {
                const fallbackContent = await Content.findOne({ slug: slug.toLowerCase(), status: 'published', language: 'en' })
                    .select('title body contentType category tags metaTitle metaDescription updatedAt language');
                if (fallbackContent) {
                    logger.info('Fetched public content by slug (fallback language)', { slug, requestedLang: language, actualLang: 'en' });
                    return res.status(200).json({ success: true, data: fallbackContent });
                }
            }
            return next(new AppError('Content not found.', 404));
        }

        logger.info('Fetched public content by slug', { slug, language });
        res.status(200).json({ success: true, data: contentEntry });

    } catch (error) {
        logger.error('Error fetching public content by slug', { slug: req.params.slug, lang: req.query.lang, error: error.message, stack: error.stack });
        next(new AppError('Server error while fetching content.', 500));
    }
};

/**
 * @desc    Get a list of public content by category or content type (e.g., all FAQs, all blog posts)
 * @route   GET /api/v1/content/list/:typeOrCategory
 * @access  Public
 * @query   filterBy ('contentType' or 'category'), lang, page, limit
 */
exports.getPublicContentList = async (req, res, next) => {
    try {
        const typeOrCategoryValue = req.params.typeOrCategory;
        const filterBy = req.query.filterBy || 'contentType'; // 'contentType' or 'category'
        const language = req.query.lang || 'en';
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;

        let query = { status: 'published', language };
        if (filterBy === 'contentType') {
            query.contentType = typeOrCategoryValue;
        } else if (filterBy === 'category') {
            query.category = typeOrCategoryValue;
        } else {
            return next(new AppError('Invalid filterBy parameter. Use "contentType" or "category".', 400));
        }

        const totalContent = await Content.countDocuments(query);
        const contentList = await Content.find(query)
            .sort({ createdAt: -1 }) // Or 'updatedAt', 'title'
            .skip((page - 1) * limit)
            .limit(limit)
            .select('slug title metaTitle metaDescription category tags createdAt updatedAt language');

        logger.info('Fetched public content list', { typeOrCategoryValue, filterBy, language, page, limit });
        res.status(200).json({
            success: true,
            count: contentList.length,
            total: totalContent,
            pagination: {
                currentPage: page,
                totalPages: Math.ceil(totalContent / limit),
                limit: limit
            },
            data: contentList
        });

    } catch (error) {
        logger.error('Error fetching public content list', { params: req.params, query: req.query, error: error.message, stack: error.stack });
        next(new AppError('Server error while fetching content list.', 500));
    }
};