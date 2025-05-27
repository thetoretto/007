const fs = require('fs');
const path = require('path');

class Logger {
  constructor(context = 'App') {
    this.context = context;
    this.logLevel = process.env.LOG_LEVEL || 'info';
    this.logFile = process.env.LOG_FILE || './logs/app.log';
    
    // Ensure logs directory exists
    this.ensureLogDirectory();
  }

  ensureLogDirectory() {
    const logDir = path.dirname(this.logFile);
    if (!fs.existsSync(logDir)) {
      fs.mkdirSync(logDir, { recursive: true });
    }
  }

  formatMessage(level, message, meta = {}) {
    const timestamp = new Date().toISOString();
    const contextStr = this.context ? `[${this.context}]` : '';
    const metaStr = Object.keys(meta).length > 0 ? ` ${JSON.stringify(meta)}` : '';
    
    return `${timestamp} [${level.toUpperCase()}] ${contextStr} ${message}${metaStr}`;
  }

  shouldLog(level) {
    const levels = {
      error: 0,
      warn: 1,
      info: 2,
      debug: 3
    };
    
    return levels[level] <= levels[this.logLevel];
  }

  writeToFile(formattedMessage) {
    if (process.env.NODE_ENV !== 'test') {
      try {
        fs.appendFileSync(this.logFile, formattedMessage + '\n');
      } catch (error) {
        console.error('Failed to write to log file:', error.message);
      }
    }
  }

  log(level, message, meta = {}) {
    if (!this.shouldLog(level)) return;

    const formattedMessage = this.formatMessage(level, message, meta);
    
    // Console output with colors
    if (process.env.NODE_ENV !== 'production') {
      const colors = {
        error: '\x1b[31m', // Red
        warn: '\x1b[33m',  // Yellow
        info: '\x1b[36m',  // Cyan
        debug: '\x1b[35m'  // Magenta
      };
      
      const reset = '\x1b[0m';
      const color = colors[level] || '';
      
      console.log(`${color}${formattedMessage}${reset}`);
    } else {
      console.log(formattedMessage);
    }

    // File output
    this.writeToFile(formattedMessage);
  }

  error(message, meta = {}) {
    if (message instanceof Error) {
      this.log('error', message.message, {
        ...meta,
        stack: message.stack,
        name: message.name
      });
    } else {
      this.log('error', message, meta);
    }
  }

  warn(message, meta = {}) {
    this.log('warn', message, meta);
  }

  info(message, meta = {}) {
    this.log('info', message, meta);
  }

  debug(message, meta = {}) {
    this.log('debug', message, meta);
  }

  // HTTP request logging
  logRequest(req, res, responseTime) {
    const { method, url, ip, headers } = req;
    const { statusCode } = res;
    
    const logData = {
      method,
      url,
      ip,
      userAgent: headers['user-agent'],
      statusCode,
      responseTime: `${responseTime}ms`
    };

    if (statusCode >= 400) {
      this.warn(`HTTP ${statusCode} ${method} ${url}`, logData);
    } else {
      this.info(`HTTP ${statusCode} ${method} ${url}`, logData);
    }
  }

  // Database operation logging
  logDbOperation(operation, collection, query = {}, result = {}) {
    this.debug(`DB ${operation} on ${collection}`, {
      query: JSON.stringify(query),
      result: typeof result === 'object' ? JSON.stringify(result) : result
    });
  }

  // Authentication logging
  logAuth(action, userId, details = {}) {
    this.info(`Auth: ${action}`, {
      userId,
      ...details
    });
  }

  // Payment logging
  logPayment(action, paymentId, amount, details = {}) {
    this.info(`Payment: ${action}`, {
      paymentId,
      amount,
      ...details
    });
  }

  // Security logging
  logSecurity(event, details = {}) {
    this.warn(`Security: ${event}`, details);
  }
}

// Factory function to create logger instances
function createLogger(context) {
  return new Logger(context);
}

// Default logger instance
const defaultLogger = new Logger();

module.exports = {
  Logger,
  createLogger,
  logger: defaultLogger
};