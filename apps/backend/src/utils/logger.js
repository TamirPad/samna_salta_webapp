const winston = require('winston');
const path = require('path');
const fs = require('fs');

// Ensure logs directory exists
const logsDir = path.join(__dirname, '../../logs');
if (!fs.existsSync(logsDir)) {
  fs.mkdirSync(logsDir, {recursive: true});
}

// Redaction helper
const redact = (value) => {
  if (typeof value !== 'string') return value;
  // Mask emails
  const emailMasked = value.replace(/([\w._%+-])([\w._%+-]*)(@[^\s]+)/g, (_, a, b, c) => `${a}${b ? '***' : ''}${c}`);
  // Mask long tokens
  const tokenMasked = emailMasked.replace(/(Bearer\s+)?([A-Za-z0-9-_]{10,})/g, (m, p1, p2) => `${p1 || ''}${p2.slice(0,4)}***`);
  return tokenMasked;
};

const sanitizeMeta = (meta) => {
  try {
    const clone = JSON.parse(JSON.stringify(meta));
    const keysToMask = ['password', 'token', 'authorization', 'auth', 'jwt', 'secret'];
    for (const key of Object.keys(clone)) {
      if (keysToMask.includes(key.toLowerCase())) {
        clone[key] = '***';
      } else if (typeof clone[key] === 'string') {
        clone[key] = redact(clone[key]);
      }
    }
    if (clone.headers) {
      for (const hk of Object.keys(clone.headers)) {
        if (['authorization', 'cookie', 'set-cookie'].includes(hk.toLowerCase())) {
          clone.headers[hk] = '***';
        } else if (typeof clone.headers[hk] === 'string') {
          clone.headers[hk] = redact(clone.headers[hk]);
        }
      }
    }
    return clone;
  } catch {
    return meta;
  }
};

// Define log format
const logFormat = winston.format.combine(
  winston.format.timestamp({
    format: 'YYYY-MM-DD HH:mm:ss'
  }),
  winston.format.errors({stack: true}),
  winston.format((info) => {
    const { message, stack, ...rest } = info;
    info.message = typeof message === 'string' ? redact(message) : message;
    if (stack) info.stack = redact(stack);
    Object.assign(info, sanitizeMeta(rest));
    return info;
  })(),
  winston.format.json()
);

// Define console format for development
const consoleFormat = winston.format.combine(
  winston.format.colorize(),
  winston.format.timestamp({
    format: 'YYYY-MM-DD HH:mm:ss'
  }),
  winston.format.printf(({timestamp, level, message, stack, ...meta}) => {
    let log = `${timestamp} [${level}]: ${message}`;
    if (Object.keys(meta).length > 0) {
      log += ` ${JSON.stringify(meta)}`;
    }
    if (stack) {
      log += `\n${stack}`;
    }
    return log;
  })
);

// Create logger instance
const logger = winston.createLogger({
  level: process.env.LOG_LEVEL || 'info',
  format: logFormat,
  defaultMeta: {service: 'samna-salta-api'},
  transports: [
    // Write all logs with level 'error' and below to error.log
    new winston.transports.File({
      filename: path.join(logsDir, 'error.log'),
      level: 'error',
      maxsize: 5242880, // 5MB
      maxFiles: 5,
      tailable: true
    }),
    // Write all logs with level 'info' and below to combined.log
    new winston.transports.File({
      filename: path.join(logsDir, 'combined.log'),
      maxsize: 5242880, // 5MB
      maxFiles: 5,
      tailable: true
    })
  ],
  // Handle uncaught exceptions
  exceptionHandlers: [
    new winston.transports.File({
      filename: path.join(logsDir, 'exceptions.log'),
      maxsize: 5242880, // 5MB
      maxFiles: 5
    })
  ],
  // Handle unhandled promise rejections
  rejectionHandlers: [
    new winston.transports.File({
      filename: path.join(logsDir, 'rejections.log'),
      maxsize: 5242880, // 5MB
      maxFiles: 5
    })
  ]
});

// If we're not in production, log to console as well
if (process.env.NODE_ENV !== 'production') {
  logger.add(new winston.transports.Console({
    format: consoleFormat
  }));
}

// Create a stream object for Morgan
logger.stream = {
  write: (message) => {
    logger.info(message.trim());
  }
};

// Add request logging middleware
logger.logRequest = (req, res, next) => {
  const start = Date.now();

  res.on('finish', () => {
    const duration = Date.now() - start;
    logger.info('HTTP Request', {
      method: req.method,
      url: req.originalUrl,
      status: res.statusCode,
      duration: `${duration}ms`,
      ip: req.ip,
      userAgent: req.get('User-Agent')
    });
  });

  next();
};

// Add error logging utility
logger.logError = (error, context = {}) => {
  logger.error('Application Error', {
    message: error.message,
    stack: error.stack,
    ...context
  });
};

module.exports = logger;
