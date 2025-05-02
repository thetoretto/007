const winston = require('winston');
const path = require('path');

// Define log format
const logFormat = winston.format.combine(
    winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
    winston.format.errors({ stack: true }),
    winston.format.splat(),
    winston.format.json()
);

// Create logger instance
const logger = winston.createLogger({
    level: process.env.LOG_LEVEL || 'info',
    format: logFormat,
    defaultMeta: { service: 'rsa-backend' },
    transports: [
        // Write all logs with level 'error' and below to error.log
        new winston.transports.File({
            filename: path.join(__dirname, '../logs/error.log'),
            level: 'error',
            maxsize: 5242880, // 5MB
            maxFiles: 5,
        }),
        // Write all logs with level 'info' and below to combined.log
        new winston.transports.File({
            filename: path.join(__dirname, '../logs/combined.log'),
            maxsize: 5242880, // 5MB
            maxFiles: 5,
        })
    ]
});

// If we're not in production, log to the console with a simpler format
if (process.env.NODE_ENV !== 'production') {
    logger.add(new winston.transports.Console({
        format: winston.format.combine(
            winston.format.colorize(),
            winston.format.simple()
        )
    }));
}

// Create error logging middleware
const errorLogger = (err, req, res, next) => {
    const errorDetails = {
        method: req.method,
        url: req.url,
        body: req.body,
        query: req.query,
        params: req.params,
        userId: req.user ? req.user.id : 'unauthenticated',
        stack: err.stack,
        timestamp: new Date().toISOString()
    };

    logger.error('API Error:', errorDetails);
    next(err);
};

// Create request logging middleware
const requestLogger = (req, res, next) => {
    const startTime = Date.now();

    res.on('finish', () => {
        const duration = Date.now() - startTime;
        const logData = {
            method: req.method,
            url: req.url,
            status: res.statusCode,
            duration: `${duration}ms`,
            userId: req.user ? req.user.id : 'unauthenticated',
            timestamp: new Date().toISOString()
        };

        logger.info('API Request:', logData);
    });

    next();
};

module.exports = {
    logger,
    errorLogger,
    requestLogger
};