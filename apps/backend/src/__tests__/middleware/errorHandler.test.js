const { errorHandler } = require('../../middleware/errorHandler');
const logger = require('../../utils/logger');

// Mock dependencies
jest.mock('../../utils/logger');

const mockLogger = logger;

describe('Error Handler Middleware', () => {
  let mockReq;
  let mockRes;
  let mockNext;

  beforeEach(() => {
    jest.clearAllMocks();
    
    mockReq = {
      url: '/api/test',
      method: 'GET',
      ip: '127.0.0.1',
      get: jest.fn().mockReturnValue('Mozilla/5.0'),
      user: { id: 1, email: 'test@example.com' },
      id: 'req-123',
    };
    
    mockRes = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn().mockReturnThis(),
    };
    
    mockNext = jest.fn();
  });

  describe('JWT Errors', () => {
    it('should handle JsonWebTokenError', () => {
      const error = new Error('jwt malformed');
      error.name = 'JsonWebTokenError';

      errorHandler(error, mockReq, mockRes, mockNext);

      expect(mockRes.status).toHaveBeenCalledWith(401);
      expect(mockRes.json).toHaveBeenCalledWith({
        success: false,
        error: 'Invalid token',
        requestId: 'req-123',
        timestamp: expect.any(String),
      });
      expect(mockLogger.error).toHaveBeenCalledWith('JWT Error:', expect.any(Object));
    });

    it('should handle TokenExpiredError', () => {
      const error = new Error('jwt expired');
      error.name = 'TokenExpiredError';

      errorHandler(error, mockReq, mockRes, mockNext);

      expect(mockRes.status).toHaveBeenCalledWith(401);
      expect(mockRes.json).toHaveBeenCalledWith({
        success: false,
        error: 'Token expired',
        requestId: 'req-123',
        timestamp: expect.any(String),
      });
      expect(mockLogger.error).toHaveBeenCalledWith('JWT Error:', expect.any(Object));
    });

    it('should handle NotBeforeError', () => {
      const error = new Error('jwt not active');
      error.name = 'NotBeforeError';

      errorHandler(error, mockReq, mockRes, mockNext);

      expect(mockRes.status).toHaveBeenCalledWith(401);
      expect(mockRes.json).toHaveBeenCalledWith({
        success: false,
        error: 'Token not active',
        requestId: 'req-123',
        timestamp: expect.any(String),
      });
      expect(mockLogger.error).toHaveBeenCalledWith('JWT Error:', expect.any(Object));
    });
  });

  describe('Validation Errors', () => {
    it('should handle express-validator errors', () => {
      const error = {
        errors: [
          { msg: 'Email is required', param: 'email', location: 'body' },
          { msg: 'Password is required', param: 'password', location: 'body' },
        ],
      };

      errorHandler(error, mockReq, mockRes, mockNext);

      expect(mockRes.status).toHaveBeenCalledWith(422);
      expect(mockRes.json).toHaveBeenCalledWith({
        success: false,
        error: 'Validation failed',
        details: [
          { field: 'email', message: 'Email is required' },
          { field: 'password', message: 'Password is required' },
        ],
        requestId: 'req-123',
        timestamp: expect.any(String),
      });
      expect(mockLogger.error).toHaveBeenCalledWith('Validation Error:', expect.any(Object));
    });

    it('should handle Joi validation errors', () => {
      const error = {
        isJoi: true,
        details: [
          { message: 'Email is required', path: ['email'] },
          { message: 'Password is required', path: ['password'] },
        ],
      };

      errorHandler(error, mockReq, mockRes, mockNext);

      expect(mockRes.status).toHaveBeenCalledWith(422);
      expect(mockRes.json).toHaveBeenCalledWith({
        success: false,
        error: 'Validation failed',
        details: [
          { field: 'email', message: 'Email is required' },
          { field: 'password', message: 'Password is required' },
        ],
        requestId: 'req-123',
        timestamp: expect.any(String),
      });
      expect(mockLogger.error).toHaveBeenCalledWith('Validation Error:', expect.any(Object));
    });
  });

  describe('Database Errors', () => {
    it('should handle CastError (MongoDB)', () => {
      const error = {
        name: 'CastError',
        kind: 'ObjectId',
        value: 'invalid-id',
        path: '_id',
      };

      errorHandler(error, mockReq, mockRes, mockNext);

      expect(mockRes.status).toHaveBeenCalledWith(400);
      expect(mockRes.json).toHaveBeenCalledWith({
        success: false,
        error: 'Invalid ID format',
        requestId: 'req-123',
        timestamp: expect.any(String),
      });
      expect(mockLogger.error).toHaveBeenCalledWith('Database Error:', expect.any(Object));
    });

    it('should handle duplicate key errors', () => {
      const error = {
        code: 11000,
        keyValue: { email: 'test@example.com' },
      };

      errorHandler(error, mockReq, mockRes, mockNext);

      expect(mockRes.status).toHaveBeenCalledWith(409);
      expect(mockRes.json).toHaveBeenCalledWith({
        success: false,
        error: 'Duplicate entry',
        field: 'email',
        requestId: 'req-123',
        timestamp: expect.any(String),
      });
      expect(mockLogger.error).toHaveBeenCalledWith('Database Error:', expect.any(Object));
    });

    it('should handle PostgreSQL unique constraint violations', () => {
      const error = {
        code: '23505',
        constraint: 'users_email_key',
        detail: 'Key (email)=(test@example.com) already exists.',
      };

      errorHandler(error, mockReq, mockRes, mockNext);

      expect(mockRes.status).toHaveBeenCalledWith(409);
      expect(mockRes.json).toHaveBeenCalledWith({
        success: false,
        error: 'Duplicate entry',
        field: 'email',
        requestId: 'req-123',
        timestamp: expect.any(String),
      });
      expect(mockLogger.error).toHaveBeenCalledWith('Database Error:', expect.any(Object));
    });

    it('should handle PostgreSQL foreign key violations', () => {
      const error = {
        code: '23503',
        constraint: 'orders_customer_id_fkey',
        detail: 'Key (customer_id)=(999) is not present in table "customers".',
      };

      errorHandler(error, mockReq, mockRes, mockNext);

      expect(mockRes.status).toHaveBeenCalledWith(400);
      expect(mockRes.json).toHaveBeenCalledWith({
        success: false,
        error: 'Referenced record not found',
        field: 'customer_id',
        requestId: 'req-123',
        timestamp: expect.any(String),
      });
      expect(mockLogger.error).toHaveBeenCalledWith('Database Error:', expect.any(Object));
    });

    it('should handle PostgreSQL not null violations', () => {
      const error = {
        code: '23502',
        column: 'email',
        table: 'users',
      };

      errorHandler(error, mockReq, mockRes, mockNext);

      expect(mockRes.status).toHaveBeenCalledWith(400);
      expect(mockRes.json).toHaveBeenCalledWith({
        success: false,
        error: 'Required field missing',
        field: 'email',
        requestId: 'req-123',
        timestamp: expect.any(String),
      });
      expect(mockLogger.error).toHaveBeenCalledWith('Database Error:', expect.any(Object));
    });
  });

  describe('File Upload Errors', () => {
    it('should handle Multer file size errors', () => {
      const error = new Error('File too large');
      error.code = 'LIMIT_FILE_SIZE';

      errorHandler(error, mockReq, mockRes, mockNext);

      expect(mockRes.status).toHaveBeenCalledWith(413);
      expect(mockRes.json).toHaveBeenCalledWith({
        success: false,
        error: 'File too large',
        requestId: 'req-123',
        timestamp: expect.any(String),
      });
      expect(mockLogger.error).toHaveBeenCalledWith('File Upload Error:', expect.any(Object));
    });

    it('should handle Multer file count errors', () => {
      const error = new Error('Too many files');
      error.code = 'LIMIT_FILE_COUNT';

      errorHandler(error, mockReq, mockRes, mockNext);

      expect(mockRes.status).toHaveBeenCalledWith(413);
      expect(mockRes.json).toHaveBeenCalledWith({
        success: false,
        error: 'Too many files',
        requestId: 'req-123',
        timestamp: expect.any(String),
      });
      expect(mockLogger.error).toHaveBeenCalledWith('File Upload Error:', expect.any(Object));
    });

    it('should handle Multer field count errors', () => {
      const error = new Error('Too many fields');
      error.code = 'LIMIT_FIELD_COUNT';

      errorHandler(error, mockReq, mockRes, mockNext);

      expect(mockRes.status).toHaveBeenCalledWith(413);
      expect(mockRes.json).toHaveBeenCalledWith({
        success: false,
        error: 'Too many fields',
        requestId: 'req-123',
        timestamp: expect.any(String),
      });
      expect(mockLogger.error).toHaveBeenCalledWith('File Upload Error:', expect.any(Object));
    });

    it('should handle Multer unexpected field errors', () => {
      const error = new Error('Unexpected field');
      error.code = 'LIMIT_UNEXPECTED_FILE';

      errorHandler(error, mockReq, mockRes, mockNext);

      expect(mockRes.status).toHaveBeenCalledWith(400);
      expect(mockRes.json).toHaveBeenCalledWith({
        success: false,
        error: 'Unexpected file field',
        requestId: 'req-123',
        timestamp: expect.any(String),
      });
      expect(mockLogger.error).toHaveBeenCalledWith('File Upload Error:', expect.any(Object));
    });
  });

  describe('Rate Limiting Errors', () => {
    it('should handle rate limit exceeded errors', () => {
      const error = new Error('Too many requests');
      error.statusCode = 429;

      errorHandler(error, mockReq, mockRes, mockNext);

      expect(mockRes.status).toHaveBeenCalledWith(429);
      expect(mockRes.json).toHaveBeenCalledWith({
        success: false,
        error: 'Too many requests',
        requestId: 'req-123',
        timestamp: expect.any(String),
      });
      expect(mockLogger.error).toHaveBeenCalledWith('Rate Limit Error:', expect.any(Object));
    });
  });

  describe('Generic Errors', () => {
    it('should handle errors with statusCode', () => {
      const error = new Error('Custom error');
      error.statusCode = 404;

      errorHandler(error, mockReq, mockRes, mockNext);

      expect(mockRes.status).toHaveBeenCalledWith(404);
      expect(mockRes.json).toHaveBeenCalledWith({
        success: false,
        error: 'Custom error',
        requestId: 'req-123',
        timestamp: expect.any(String),
      });
      expect(mockLogger.error).toHaveBeenCalledWith('Error response sent:', expect.any(Object));
    });

    it('should handle errors without statusCode', () => {
      const error = new Error('Internal server error');

      errorHandler(error, mockReq, mockRes, mockNext);

      expect(mockRes.status).toHaveBeenCalledWith(500);
      expect(mockRes.json).toHaveBeenCalledWith({
        success: false,
        error: 'Internal server error',
        requestId: 'req-123',
        timestamp: expect.any(String),
      });
      expect(mockLogger.error).toHaveBeenCalledWith('Error response sent:', expect.any(Object));
    });

    it('should handle errors with custom status', () => {
      const error = new Error('Custom error');
      error.status = 403;

      errorHandler(error, mockReq, mockRes, mockNext);

      expect(mockRes.status).toHaveBeenCalledWith(403);
      expect(mockRes.json).toHaveBeenCalledWith({
        success: false,
        error: 'Custom error',
        requestId: 'req-123',
        timestamp: expect.any(String),
      });
      expect(mockLogger.error).toHaveBeenCalledWith('Error response sent:', expect.any(Object));
    });
  });

  describe('Development Environment', () => {
    it('should include stack trace in development', () => {
      process.env.NODE_ENV = 'development';
      const error = new Error('Test error');

      errorHandler(error, mockReq, mockRes, mockNext);

      expect(mockRes.json).toHaveBeenCalledWith({
        success: false,
        error: 'Test error',
        requestId: 'req-123',
        timestamp: expect.any(String),
        stack: expect.any(String),
      });

      // Reset environment
      process.env.NODE_ENV = 'test';
    });

    it('should not include stack trace in production', () => {
      process.env.NODE_ENV = 'production';
      const error = new Error('Test error');

      errorHandler(error, mockReq, mockRes, mockNext);

      expect(mockRes.json).toHaveBeenCalledWith({
        success: false,
        error: 'Test error',
        requestId: 'req-123',
        timestamp: expect.any(String),
      });

      // Reset environment
      process.env.NODE_ENV = 'test';
    });
  });

  describe('Edge Cases', () => {
    it('should handle null error', () => {
      errorHandler(null, mockReq, mockRes, mockNext);

      expect(mockRes.status).toHaveBeenCalledWith(500);
      expect(mockRes.json).toHaveBeenCalledWith({
        success: false,
        error: 'Server Error',
        requestId: 'req-123',
        timestamp: expect.any(String),
      });
    });

    it('should handle undefined error', () => {
      errorHandler(undefined, mockReq, mockRes, mockNext);

      expect(mockRes.status).toHaveBeenCalledWith(500);
      expect(mockRes.json).toHaveBeenCalledWith({
        success: false,
        error: 'Server Error',
        requestId: 'req-123',
        timestamp: expect.any(String),
      });
    });

    it('should handle error without message', () => {
      const error = {};
      errorHandler(error, mockReq, mockRes, mockNext);

      expect(mockRes.status).toHaveBeenCalledWith(500);
      expect(mockRes.json).toHaveBeenCalledWith({
        success: false,
        error: 'Server Error',
        requestId: 'req-123',
        timestamp: expect.any(String),
      });
    });

    it('should handle string errors', () => {
      const error = 'String error message';
      errorHandler(error, mockReq, mockRes, mockNext);

      expect(mockRes.status).toHaveBeenCalledWith(500);
      expect(mockRes.json).toHaveBeenCalledWith({
        success: false,
        error: 'String error message',
        requestId: 'req-123',
        timestamp: expect.any(String),
      });
    });

    it('should handle missing request properties', () => {
      const error = new Error('Test error');
      const minimalReq = {};

      errorHandler(error, minimalReq, mockRes, mockNext);

      expect(mockRes.json).toHaveBeenCalledWith({
        success: false,
        error: 'Test error',
        requestId: undefined,
        timestamp: expect.any(String),
      });
    });

    it('should handle missing user in request', () => {
      const error = new Error('Test error');
      const reqWithoutUser = { ...mockReq, user: undefined };

      errorHandler(error, reqWithoutUser, mockRes, mockNext);

      expect(mockLogger.error).toHaveBeenCalledWith('Error response sent:', expect.objectContaining({
        userId: undefined,
      }));
    });
  });

  describe('Logging', () => {
    it('should log error with correct context', () => {
      const error = new Error('Test error');
      errorHandler(error, mockReq, mockRes, mockNext);

      expect(mockLogger.error).toHaveBeenCalledWith('Error response sent:', {
        statusCode: 500,
        message: 'Test error',
        url: '/api/test',
        method: 'GET',
        ip: '127.0.0.1',
        userAgent: 'Mozilla/5.0',
        userId: 1,
        requestId: 'req-123',
      });
    });

    it('should handle logger errors gracefully', () => {
      mockLogger.error.mockImplementation(() => {
        throw new Error('Logger error');
      });

      const error = new Error('Test error');
      
      // Should not throw
      expect(() => {
        errorHandler(error, mockReq, mockRes, mockNext);
      }).not.toThrow();

      expect(mockRes.status).toHaveBeenCalledWith(500);
      expect(mockRes.json).toHaveBeenCalledWith({
        success: false,
        error: 'Test error',
        requestId: 'req-123',
        timestamp: expect.any(String),
      });
    });
  });
}); 