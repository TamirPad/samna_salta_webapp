// Standardized API response utilities
class ApiResponse {
  static success(res, data = null, message = 'Success', statusCode = 200) {
    return res.status(statusCode).json({
      success: true,
      message,
      data,
      timestamp: new Date().toISOString()
    });
  }

  static error(res, message = 'Error occurred', statusCode = 500, details = null) {
    const response = {
      success: false,
      error: message,
      timestamp: new Date().toISOString()
    };

    if (details) {
      response.details = details;
    }

    return res.status(statusCode).json(response);
  }

  static validationError(res, errors) {
    return res.status(400).json({
      success: false,
      error: 'Validation failed',
      details: errors,
      timestamp: new Date().toISOString()
    });
  }

  static notFound(res, resource = 'Resource') {
    return res.status(404).json({
      success: false,
      error: `${resource} not found`,
      timestamp: new Date().toISOString()
    });
  }

  static unauthorized(res, message = 'Unauthorized') {
    return res.status(401).json({
      success: false,
      error: message,
      timestamp: new Date().toISOString()
    });
  }

  static forbidden(res, message = 'Forbidden') {
    return res.status(403).json({
      success: false,
      error: message,
      timestamp: new Date().toISOString()
    });
  }

  static conflict(res, message = 'Conflict') {
    return res.status(409).json({
      success: false,
      error: message,
      timestamp: new Date().toISOString()
    });
  }

  static tooManyRequests(res, message = 'Too many requests') {
    return res.status(429).json({
      success: false,
      error: message,
      timestamp: new Date().toISOString()
    });
  }
}

module.exports = ApiResponse;
