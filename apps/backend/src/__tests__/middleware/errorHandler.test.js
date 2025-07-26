const { errorHandler } = require('../../middleware/errorHandler');

// Mock the logger
jest.mock('../../utils/logger', () => ({
  error: jest.fn()
}));

describe('Error Handler Middleware', () => {
  let mockReq;
  let mockRes;
  let mockNext;

  beforeEach(() => {
    mockReq = {
      url: '/test',
      method: 'GET',
      ip: '127.0.0.1',
      get: jest.fn().mockReturnValue('test-user-agent')
    };
    mockRes = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn()
    };
    mockNext = jest.fn();
    jest.clearAllMocks();
  });

  describe('General Error Handling', () => {
    it('should handle general errors with 500 status', () => {
      const error = new Error('General error');

      errorHandler(error, mockReq, mockRes, mockNext);

      expect(mockRes.status).toHaveBeenCalledWith(500);
      expect(mockRes.json).toHaveBeenCalledWith({
        success: false,
        error: 'General error'
      });
    });

    it('should include stack trace in development environment', () => {
      const originalEnv = process.env.NODE_ENV;
      process.env.NODE_ENV = 'development';
      
      const error = new Error('Development error');

      errorHandler(error, mockReq, mockRes, mockNext);

      expect(mockRes.json).toHaveBeenCalledWith({
        success: false,
        error: 'Development error',
        stack: error.stack
      });

      process.env.NODE_ENV = originalEnv;
    });

    it('should not include stack trace in production environment', () => {
      const originalEnv = process.env.NODE_ENV;
      process.env.NODE_ENV = 'production';
      
      const error = new Error('Production error');

      errorHandler(error, mockReq, mockRes, mockNext);

      expect(mockRes.json).toHaveBeenCalledWith({
        success: false,
        error: 'Production error'
      });

      process.env.NODE_ENV = originalEnv;
    });
  });

  describe('Mongoose Error Handling', () => {
    it('should handle CastError (bad ObjectId)', () => {
      const error = new Error('Cast to ObjectId failed');
      error.name = 'CastError';

      errorHandler(error, mockReq, mockRes, mockNext);

      expect(mockRes.status).toHaveBeenCalledWith(404);
      expect(mockRes.json).toHaveBeenCalledWith({
        success: false,
        error: 'Resource not found'
      });
    });

    it('should handle duplicate key error', () => {
      const error = new Error('Duplicate key error');
      error.code = 11000;

      errorHandler(error, mockReq, mockRes, mockNext);

      expect(mockRes.status).toHaveBeenCalledWith(400);
      expect(mockRes.json).toHaveBeenCalledWith({
        success: false,
        error: 'Duplicate field value entered'
      });
    });

    it('should handle validation error', () => {
      const error = new Error('Validation failed');
      error.name = 'ValidationError';
      error.errors = {
        field1: { message: 'Field 1 is required' },
        field2: { message: 'Field 2 is invalid' }
      };

      errorHandler(error, mockReq, mockRes, mockNext);

      expect(mockRes.status).toHaveBeenCalledWith(400);
      expect(mockRes.json).toHaveBeenCalledWith({
        success: false,
        error: 'Field 1 is required, Field 2 is invalid'
      });
    });
  });

  describe('JWT Error Handling', () => {
    it('should handle JsonWebTokenError', () => {
      const error = new Error('Invalid token');
      error.name = 'JsonWebTokenError';

      errorHandler(error, mockReq, mockRes, mockNext);

      expect(mockRes.status).toHaveBeenCalledWith(401);
      expect(mockRes.json).toHaveBeenCalledWith({
        success: false,
        error: 'Invalid token'
      });
    });

    it('should handle TokenExpiredError', () => {
      const error = new Error('Token expired');
      error.name = 'TokenExpiredError';

      errorHandler(error, mockReq, mockRes, mockNext);

      expect(mockRes.status).toHaveBeenCalledWith(401);
      expect(mockRes.json).toHaveBeenCalledWith({
        success: false,
        error: 'Token expired'
      });
    });
  });

  describe('PostgreSQL Error Handling', () => {
    it('should handle unique violation error', () => {
      const error = new Error('Unique constraint violation');
      error.code = '23505';

      errorHandler(error, mockReq, mockRes, mockNext);

      expect(mockRes.status).toHaveBeenCalledWith(400);
      expect(mockRes.json).toHaveBeenCalledWith({
        success: false,
        error: 'Duplicate entry'
      });
    });

    it('should handle foreign key violation error', () => {
      const error = new Error('Foreign key violation');
      error.code = '23503';

      errorHandler(error, mockReq, mockRes, mockNext);

      expect(mockRes.status).toHaveBeenCalledWith(400);
      expect(mockRes.json).toHaveBeenCalledWith({
        success: false,
        error: 'Referenced record does not exist'
      });
    });

    it('should handle not null violation error', () => {
      const error = new Error('Not null violation');
      error.code = '23502';

      errorHandler(error, mockReq, mockRes, mockNext);

      expect(mockRes.status).toHaveBeenCalledWith(400);
      expect(mockRes.json).toHaveBeenCalledWith({
        success: false,
        error: 'Required field missing'
      });
    });
  });

  describe('File Upload Error Handling', () => {
    it('should handle file size limit error', () => {
      const error = new Error('File too large');
      error.code = 'LIMIT_FILE_SIZE';

      errorHandler(error, mockReq, mockRes, mockNext);

      expect(mockRes.status).toHaveBeenCalledWith(400);
      expect(mockRes.json).toHaveBeenCalledWith({
        success: false,
        error: 'File too large'
      });
    });

    it('should handle unexpected file field error', () => {
      const error = new Error('Unexpected file field');
      error.code = 'LIMIT_UNEXPECTED_FILE';

      errorHandler(error, mockReq, mockRes, mockNext);

      expect(mockRes.status).toHaveBeenCalledWith(400);
      expect(mockRes.json).toHaveBeenCalledWith({
        success: false,
        error: 'Unexpected file field'
      });
    });
  });

  describe('Rate Limiting Error Handling', () => {
    it('should handle rate limiting error', () => {
      const error = new Error('Too many requests');
      error.status = 429;

      errorHandler(error, mockReq, mockRes, mockNext);

      expect(mockRes.status).toHaveBeenCalledWith(429);
      expect(mockRes.json).toHaveBeenCalledWith({
        success: false,
        error: 'Too many requests'
      });
    });
  });

  describe('Error with Custom Status Code', () => {
    it('should use custom status code from error', () => {
      const error = new Error('Custom error');
      error.statusCode = 422;

      errorHandler(error, mockReq, mockRes, mockNext);

      expect(mockRes.status).toHaveBeenCalledWith(422);
      expect(mockRes.json).toHaveBeenCalledWith({
        success: false,
        error: 'Custom error'
      });
    });

    it('should use status property from error', () => {
      const error = new Error('Status error');
      error.status = 418;

      errorHandler(error, mockReq, mockRes, mockNext);

      expect(mockRes.status).toHaveBeenCalledWith(418);
      expect(mockRes.json).toHaveBeenCalledWith({
        success: false,
        error: 'Status error'
      });
    });
  });

  describe('Error Logging', () => {
    it('should log error details', () => {
      const logger = require('../../utils/logger');
      const error = new Error('Test error');

      errorHandler(error, mockReq, mockRes, mockNext);

      expect(logger.error).toHaveBeenCalledWith('Error occurred:', {
        error: 'Test error',
        stack: error.stack,
        url: '/test',
        method: 'GET',
        ip: '127.0.0.1',
        userAgent: 'test-user-agent'
      });
    });
  });
}); 