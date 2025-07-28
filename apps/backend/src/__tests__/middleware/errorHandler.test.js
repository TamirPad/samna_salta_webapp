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
    });
  });

  describe('Database Errors', () => {
    it('should handle unique constraint violations', () => {
      const error = new Error('duplicate key value violates unique constraint');
      error.code = '23505';

      errorHandler(error, mockReq, mockRes, mockNext);

      expect(mockRes.status).toHaveBeenCalledWith(409);
      expect(mockRes.json).toHaveBeenCalledWith({
        success: false,
        error: 'Resource already exists',
        requestId: 'req-123',
        timestamp: expect.any(String),
      });
    });

    it('should handle foreign key violations', () => {
      const error = new Error('insert or update on table violates foreign key constraint');
      error.code = '23503';

      errorHandler(error, mockReq, mockRes, mockNext);

      expect(mockRes.status).toHaveBeenCalledWith(400);
      expect(mockRes.json).toHaveBeenCalledWith({
        success: false,
        error: 'Invalid reference',
        requestId: 'req-123',
        timestamp: expect.any(String),
      });
    });
  });

  describe('Generic Errors', () => {
    it('should handle unknown errors', () => {
      const error = new Error('Unknown error occurred');

      errorHandler(error, mockReq, mockRes, mockNext);

      expect(mockRes.status).toHaveBeenCalledWith(500);
      expect(mockRes.json).toHaveBeenCalledWith({
        success: false,
        error: 'Internal server error',
        requestId: 'req-123',
        timestamp: expect.any(String),
      });
    });

    it('should handle null/undefined errors', () => {
      errorHandler(null, mockReq, mockRes, mockNext);

      expect(mockRes.status).toHaveBeenCalledWith(500);
      expect(mockRes.json).toHaveBeenCalledWith({
        success: false,
        error: 'Internal server error',
        requestId: 'req-123',
        timestamp: expect.any(String),
      });
    });
  });
}); 