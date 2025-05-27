const mongoose = require('mongoose');
const { AppError } = require('../middleware/errorHandler');
const { createLogger } = require('../utils/logger');
const os = require('os');
const process = require('process');

const logger = createLogger('SystemHealthController');

/**
 * @desc    Check overall system health (API, Database)
 * @route   GET /api/v1/health/status
 * @access  Public or Private (depending on exposure needs)
 */
exports.getSystemHealth = async (req, res, _next) => {
    try {
        const checks = [];
        let overallStatus = 'UP';
        let httpStatus = 200;

        // 1. API Status (basic check - if this code runs, API is somewhat up)
        checks.push({ name: 'API', status: 'UP', message: 'API is operational.' });

        // 2. Database Connectivity Check
        try {
            const dbState = mongoose.connection.readyState;
            let dbStatusMessage = 'Database connection unknown.';
            let dbStatus = 'UNKNOWN';

            switch (dbState) {
                case 0: // disconnected
                    dbStatusMessage = 'Database is disconnected.';
                    dbStatus = 'DOWN';
                    overallStatus = 'DEGRADED'; // Or DOWN if DB is critical
                    httpStatus = 503; // Service Unavailable
                    break;
                case 1: // connected
                    dbStatusMessage = 'Database is connected.';
                    dbStatus = 'UP';
                    break;
                case 2: // connecting
                    dbStatusMessage = 'Database is connecting.';
                    dbStatus = 'DEGRADED';
                    overallStatus = 'DEGRADED';
                    break;
                case 3: // disconnecting
                    dbStatusMessage = 'Database is disconnecting.';
                    dbStatus = 'DEGRADED';
                    overallStatus = 'DEGRADED';
                    break;
                case 99: // uninitialized
                     dbStatusMessage = 'Database connection is uninitialized.';
                     dbStatus = 'DOWN';
                     overallStatus = 'DEGRADED';
                     httpStatus = 503;
                     break;
                default:
                    dbStatusMessage = `Database is in an unknown state: ${dbState}`;
                    dbStatus = 'UNKNOWN';
                    overallStatus = 'DEGRADED';
                    break;
            }
            checks.push({ name: 'Database', status: dbStatus, message: dbStatusMessage, state: dbState });
        } catch (dbError) {
            logger.error('Database health check failed', { error: dbError.message });
            checks.push({ name: 'Database', status: 'DOWN', message: dbError.message || 'Failed to connect to database.' });
            overallStatus = 'DOWN';
            httpStatus = 503;
        }

        // 3. Optional: Check other critical dependencies (e.g., external APIs, message queues)
        // Example: Redis, RabbitMQ, Payment Gateway Ping
        // try {
        //    await someExternalService.ping();
        //    checks.push({ name: 'ExternalServiceX', status: 'UP', message: 'Service X is responsive.' });
        // } catch (serviceError) {
        //    checks.push({ name: 'ExternalServiceX', status: 'DOWN', message: serviceError.message });
        //    overallStatus = 'DEGRADED'; // Or DOWN if critical
        // }

        logger.info(`System health check performed. Overall status: ${overallStatus}`);
        res.status(httpStatus).json({
            overallStatus,
            timestamp: new Date().toISOString(),
            checks
        });

    } catch (error) {
        logger.error('Error during system health check', { error: error.message, stack: error.stack });
        // This is a critical endpoint, so it should ideally always return a response
        // _next(new AppError('An unexpected error occurred while performing the health check.', 500)); // Potentially use _next if a global error handler is preferred for this too
        res.status(500).json({
            overallStatus: 'ERROR',
            timestamp: new Date().toISOString(),
            message: 'An unexpected error occurred while performing the health check.',
            error: error.message
        });
    }
};

/**
 * @desc    Get detailed system information (memory, CPU, uptime)
 * @route   GET /api/v1/health/info
 * @access  Private (Admin)
 */
exports.getSystemInfo = async (req, res, next) => {
    try {
        const formatBytes = (bytes, decimals = 2) => {
            if (bytes === 0) return '0 Bytes';
            const k = 1024;
            const dm = decimals < 0 ? 0 : decimals;
            const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
            const i = Math.floor(Math.log(bytes) / Math.log(k));
            return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
        };

        const systemInfo = {
            timestamp: new Date().toISOString(),
            application: {
                nodeVersion: process.version,
                platform: process.platform,
                pid: process.pid,
                uptimeSeconds: Math.floor(process.uptime()),
                environment: process.env.NODE_ENV || 'development',
            },
            system: {
                osPlatform: os.platform(),
                osRelease: os.release(),
                osUptimeSeconds: Math.floor(os.uptime()),
                cpuArchitecture: os.arch(),
                cpuCores: os.cpus().length,
                // Note: os.cpus() provides more detail per core if needed
                totalMemory: formatBytes(os.totalmem()),
                freeMemory: formatBytes(os.freemem()),
            },
            memoryUsage: {
                rss: formatBytes(process.memoryUsage().rss), // Resident Set Size
                heapTotal: formatBytes(process.memoryUsage().heapTotal),
                heapUsed: formatBytes(process.memoryUsage().heapUsed),
                external: formatBytes(process.memoryUsage().external),
                // arrayBuffers: formatBytes(process.memoryUsage().arrayBuffers) // if using Node v14.x+
            }
        };

        logger.info('Fetched system information', { adminUserId: req.user ? req.user.id : 'N/A' });
        res.status(200).json({ success: true, data: systemInfo });

    } catch (error) {
        logger.error('Error fetching system information', { adminUserId: req.user ? req.user.id : 'N/A', error: error.message, stack: error.stack });
        next(new AppError('Server error while fetching system information.', 500));
    }
};

/**
 * @desc    A simple ping endpoint to check if the API is alive
 * @route   GET /api/v1/health/ping
 * @access  Public
 */
exports.ping = (req, res) => {
    res.status(200).send('pong');
};