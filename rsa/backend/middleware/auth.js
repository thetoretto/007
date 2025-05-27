const jwt = require('jsonwebtoken');
const { asyncHandler, AuthenticationError, AuthorizationError } = require('./errorHandler');
const User = require('../models/User');
const { createLogger } = require('../utils/logger');

const logger = createLogger('Auth');

// Verify JWT token
const authenticate = asyncHandler(async (req, res, next) => {
  let token;

  // Get token from header
  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    token = req.headers.authorization.split(' ')[1];
  }

  // Check if token exists
  if (!token) {
    logger.logSecurity('Authentication failed - No token provided', {
      ip: req.ip,
      userAgent: req.get('User-Agent'),
      url: req.originalUrl
    });
    throw new AuthenticationError('Access denied. No token provided.');
  }

  try {
    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    // Get user from token
    const user = await User.findById(decoded.id).select('-password');
    
    if (!user) {
      logger.logSecurity('Authentication failed - User not found', {
        userId: decoded.id,
        ip: req.ip,
        userAgent: req.get('User-Agent')
      });
      throw new AuthenticationError('Token is not valid.');
    }

    // Check if user is active
    if (!user.isActive) {
      logger.logSecurity('Authentication failed - User account deactivated', {
        userId: user._id,
        email: user.email,
        ip: req.ip
      });
      throw new AuthenticationError('Account has been deactivated.');
    }

    // Add user to request object
    req.user = user;
    
    logger.logAuth('User authenticated', user._id, {
      email: user.email,
      role: user.role,
      ip: req.ip
    });
    
    next();
  } catch (error) {
    if (error.name === 'JsonWebTokenError') {
      logger.logSecurity('Authentication failed - Invalid token', {
        ip: req.ip,
        userAgent: req.get('User-Agent'),
        error: error.message
      });
      throw new AuthenticationError('Token is not valid.');
    }
    
    if (error.name === 'TokenExpiredError') {
      logger.logSecurity('Authentication failed - Token expired', {
        ip: req.ip,
        userAgent: req.get('User-Agent')
      });
      throw new AuthenticationError('Token has expired.');
    }
    
    throw error;
  }
});

// Optional authentication (doesn't throw error if no token)
const optionalAuth = asyncHandler(async (req, res, next) => {
  let token;

  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    token = req.headers.authorization.split(' ')[1];
  }

  if (token) {
    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      const user = await User.findById(decoded.id).select('-password');
      
      if (user && user.isActive) {
        req.user = user;
      }
    } catch (error) {
      // Silently fail for optional auth
      logger.debug('Optional auth failed:', error.message);
    }
  }

  next();
});

// Check if user has required role
const authorize = (...roles) => {
  return (req, res, next) => {
    if (!req.user) {
      throw new AuthenticationError('Authentication required.');
    }

    if (!roles.includes(req.user.role)) {
      logger.logSecurity('Authorization failed - Insufficient permissions', {
        userId: req.user._id,
        userRole: req.user.role,
        requiredRoles: roles,
        ip: req.ip,
        url: req.originalUrl
      });
      throw new AuthorizationError('Access denied. Insufficient permissions.');
    }

    logger.logAuth('User authorized', req.user._id, {
      role: req.user.role,
      requiredRoles: roles,
      url: req.originalUrl
    });

    next();
  };
};

// Check if user owns the resource or is admin
const authorizeOwnerOrAdmin = (resourceUserIdField = 'userId') => {
  return asyncHandler(async (req, res, next) => {
    if (!req.user) {
      throw new AuthenticationError('Authentication required.');
    }

    // Admin can access everything
    if (req.user.role === 'admin') {
      return next();
    }

    // Check if user owns the resource
    const resourceUserId = req.params[resourceUserIdField] || req.body[resourceUserIdField];
    
    if (resourceUserId && resourceUserId.toString() === req.user._id.toString()) {
      return next();
    }

    // If resource doesn't have userId, check if it belongs to the user
    if (!resourceUserId) {
      // This will be handled by individual route handlers
      return next();
    }

    logger.logSecurity('Authorization failed - Resource access denied', {
      userId: req.user._id,
      resourceUserId,
      ip: req.ip,
      url: req.originalUrl
    });

    throw new AuthorizationError('Access denied. You can only access your own resources.');
  });
};

// Rate limiting per user
const userRateLimit = (maxRequests = 100, windowMs = 15 * 60 * 1000) => {
  const requests = new Map();

  return (req, res, next) => {
    if (!req.user) {
      return next();
    }

    const userId = req.user._id.toString();
    const now = Date.now();
    const windowStart = now - windowMs;

    // Clean old entries
    if (requests.has(userId)) {
      const userRequests = requests.get(userId).filter(time => time > windowStart);
      requests.set(userId, userRequests);
    }

    // Check current requests
    const currentRequests = requests.get(userId) || [];
    
    if (currentRequests.length >= maxRequests) {
      logger.logSecurity('Rate limit exceeded', {
        userId,
        requestCount: currentRequests.length,
        maxRequests,
        ip: req.ip
      });
      
      return res.status(429).json({
        success: false,
        error: {
          message: 'Too many requests. Please try again later.',
          status: 429,
          retryAfter: Math.ceil(windowMs / 1000)
        }
      });
    }

    // Add current request
    currentRequests.push(now);
    requests.set(userId, currentRequests);

    next();
  };
};

module.exports = {
  authenticate,
  optionalAuth,
  authorize,
  authorizeOwnerOrAdmin,
  userRateLimit
};