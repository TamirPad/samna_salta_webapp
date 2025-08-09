const logger = require('../utils/logger');

const errorHandler = (err, req, res, next) => {
  // Handle null/undefined errors
  if (!err) {
    err = new Error('Unknown error');
  }

  let error = {...err};
  error.message = err.message || 'Server Error';

  // Log error safely
  try {
    logger.error('Error occurred:', {
      error: err.message,
      stack: err.stack,
      url: req.url,
      method: req.method,
      ip: req.ip,
      userAgent: req.get ? req.get('User-Agent') : 'Unknown'
    });
  } catch (logError) {
    console.error('Failed to log error:', logError);
  }

  // Handle different error types
  if (err.name === 'CastError') {
    error = {message: 'Resource not found', statusCode: 404};
  } else if (err.code === 11000) {
    error = {message: 'Duplicate field value entered', statusCode: 400};
  } else if (err.name === 'ValidationError' || err.statusCode === 422) {
    const message = err.message || 'Validation failed';
    if (Array.isArray(err.errors)) {
      error = { message: 'Validation failed', statusCode: 422, details: err.errors.map(e => ({ field: e.param || e.field, message: e.msg || e.message })) };
    } else {
      error = {message, statusCode: 422};
    }
  } else if (err.name === 'JsonWebTokenError') {
    error = {message: 'Invalid token', statusCode: 401};
  } else if (err.name === 'TokenExpiredError') {
    error = {message: 'Token expired', statusCode: 401};
  } else if (err.code === '23505') {
    error = {message: 'Resource already exists', statusCode: 409};
  } else if (err.code === '23503') {
    error = {message: 'Invalid reference', statusCode: 400};
  } else if (err.code === '23502') {
    error = {message: 'Required field missing', statusCode: 400};
  } else if (err.code === 'LIMIT_FILE_SIZE') {
    error = {message: 'File too large', statusCode: 400};
  } else if (err.code === 'LIMIT_UNEXPECTED_FILE') {
    error = {message: 'Unexpected file field', statusCode: 400};
  } else if (err.status === 429) {
    error = {message: 'Too many requests', statusCode: 429};
  }

  // Set default values
  const statusCode = error.statusCode || err.statusCode || err.status || 500;
  const message = error.message || 'Server Error';

  // Send standardized error response
  const response = {
    success: false,
    error: message,
    requestId: (req && (req.id || req.headers && (req.headers['x-request-id'] || req.headers['X-Request-ID']))) || undefined,
    timestamp: new Date().toISOString(),
  };
  if (error.details) {
    response.details = error.details;
  } else if (process.env.NODE_ENV !== 'production') {
    response.details = err.details || undefined;
  }
  res.status(statusCode).json(response);
};

module.exports = {errorHandler};
