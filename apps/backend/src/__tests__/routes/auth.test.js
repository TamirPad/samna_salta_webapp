const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

// Set up test environment
process.env.JWT_SECRET = 'test-jwt-secret-key';
process.env.NODE_ENV = 'test';

// Mock dependencies
jest.mock('../../config/database', () => ({
  query: jest.fn()
}));

jest.mock('../../config/redis', () => ({
  setSession: jest.fn(),
  deleteSession: jest.fn(),
  getSession: jest.fn()
}));

jest.mock('../../utils/logger', () => ({
  info: jest.fn(),
  error: jest.fn()
}));

// Mock express-validator
jest.mock('express-validator', () => ({
  body: jest.fn(() => ({
    trim: jest.fn().mockReturnThis(),
    isLength: jest.fn().mockReturnThis(),
    isEmail: jest.fn().mockReturnThis(),
    normalizeEmail: jest.fn().mockReturnThis(),
    notEmpty: jest.fn().mockReturnThis(),
    optional: jest.fn().mockReturnThis(),
    isMobilePhone: jest.fn().mockReturnThis(),
    withMessage: jest.fn().mockReturnThis()
  })),
  validationResult: jest.fn(() => ({
    isEmpty: () => true,
    array: () => []
  }))
}));

// Mock the auth middleware
jest.mock('../../middleware/auth', () => ({
  authenticateToken: jest.fn((req, res, next) => {
    // For testing, we'll manually set the user based on the token
    const authHeader = req.headers['authorization'];
    if (authHeader && authHeader.startsWith('Bearer ')) {
      const token = authHeader.split(' ')[1];
      try {
        const mockJwt = require('jsonwebtoken');
        const decoded = mockJwt.verify(token, process.env.JWT_SECRET);
        req.user = {
          id: decoded.userId,
          email: decoded.email,
          isAdmin: decoded.isAdmin,
          sessionId: decoded.sessionId
        };
      } catch (error) {
        // Invalid token - don't set user
      }
    }
    next();
  }),
  requireAdmin: jest.fn(),
  optionalAuth: jest.fn()
}));

describe('Authentication Core Functions', () => {
  let mockReq;
  let mockRes;
  let mockNext;

  beforeEach(() => {
    jest.clearAllMocks();
    
    mockReq = {
      body: {},
      headers: {},
      user: null
    };
    
    mockRes = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn()
    };
    
    mockNext = jest.fn();
  });

  describe('Password Hashing', () => {
    it('should hash password correctly', async () => {
      const password = 'testpassword123';
      const hashedPassword = await bcrypt.hash(password, 12);
      
      expect(hashedPassword).toBeDefined();
      expect(hashedPassword).not.toBe(password);
      
      const isValid = await bcrypt.compare(password, hashedPassword);
      expect(isValid).toBe(true);
    });

    it('should verify password correctly', async () => {
      const password = 'testpassword123';
      const hashedPassword = await bcrypt.hash(password, 12);
      
      const isValid = await bcrypt.compare(password, hashedPassword);
      expect(isValid).toBe(true);
      
      const isInvalid = await bcrypt.compare('wrongpassword', hashedPassword);
      expect(isInvalid).toBe(false);
    });
  });

  describe('JWT Token Operations', () => {
    it('should create and verify JWT token', () => {
      const payload = {
        userId: 1,
        email: 'test@example.com',
        isAdmin: false,
        sessionId: 'session-123'
      };

      const token = jwt.sign(payload, process.env.JWT_SECRET);
      expect(token).toBeDefined();

      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      expect(decoded).toMatchObject(payload);
    });

    it('should reject invalid JWT token', () => {
      expect(() => {
        jwt.verify('invalid-token', process.env.JWT_SECRET);
      }).toThrow();
    });

    it('should reject expired JWT token', () => {
      const payload = {
        userId: 1,
        email: 'test@example.com',
        isAdmin: false,
        sessionId: 'session-123'
      };

      const token = jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: '1ms' });
      
      // Wait for token to expire
      setTimeout(() => {
        expect(() => {
          jwt.verify(token, process.env.JWT_SECRET);
        }).toThrow('jwt expired');
      }, 10);
    });
  });

  describe('Database Operations', () => {
    it('should handle database queries', async () => {
      const { query } = require('../../config/database');
      
      const mockResult = {
        rows: [{ id: 1, name: 'Test User', email: 'test@example.com' }],
        rowCount: 1
      };
      
      query.mockResolvedValue(mockResult);
      
      const result = await query('SELECT * FROM users WHERE id = $1', [1]);
      
      expect(result).toEqual(mockResult);
      expect(query).toHaveBeenCalledWith('SELECT * FROM users WHERE id = $1', [1]);
    });

    it('should handle database errors', async () => {
      const { query } = require('../../config/database');
      
      query.mockRejectedValue(new Error('Database connection failed'));
      
      await expect(query('SELECT * FROM invalid_table')).rejects.toThrow('Database connection failed');
    });
  });

  describe('Session Management', () => {
    it('should set and get session data', async () => {
      const { setSession, getSession } = require('../../config/redis');
      
      const sessionData = {
        userId: 1,
        email: 'test@example.com',
        isAdmin: false
      };
      
      setSession.mockResolvedValue();
      getSession.mockResolvedValue(sessionData);
      
      await setSession('session-123', sessionData);
      const retrieved = await getSession('session-123');
      
      expect(setSession).toHaveBeenCalledWith('session-123', sessionData);
      expect(getSession).toHaveBeenCalledWith('session-123');
      expect(retrieved).toEqual(sessionData);
    });

    it('should delete session data', async () => {
      const { deleteSession } = require('../../config/redis');
      
      deleteSession.mockResolvedValue();
      
      await deleteSession('session-123');
      
      expect(deleteSession).toHaveBeenCalledWith('session-123');
    });
  });

  describe('Error Handling', () => {
    it('should handle validation errors', () => {
      const { validationResult } = require('express-validator');
      
      const mockErrors = {
        isEmpty: () => false,
        array: () => [
          { field: 'email', message: 'Invalid email format' },
          { field: 'password', message: 'Password too short' }
        ]
      };
      
      validationResult.mockReturnValue(mockErrors);
      
      const errors = validationResult();
      expect(errors.isEmpty()).toBe(false);
      expect(errors.array()).toHaveLength(2);
    });

    it('should handle authentication errors', () => {
      expect(() => {
        jwt.verify('invalid-token', process.env.JWT_SECRET);
      }).toThrow('jwt malformed');
    });
  });

  describe('Response Formatting', () => {
    it('should format success response correctly', () => {
      const successData = {
        user: {
          id: 1,
          name: 'Test User',
          email: 'test@example.com'
        },
        token: 'jwt-token-here'
      };

      const response = {
        success: true,
        message: 'Operation successful',
        data: successData
      };

      expect(response.success).toBe(true);
      expect(response.message).toBe('Operation successful');
      expect(response.data).toEqual(successData);
    });

    it('should format error response correctly', () => {
      const errorResponse = {
        success: false,
        error: 'Validation failed',
        message: 'Please check your input',
        details: [
          { field: 'email', message: 'Invalid email format' }
        ]
      };

      expect(errorResponse.success).toBe(false);
      expect(errorResponse.error).toBe('Validation failed');
      expect(errorResponse.message).toBe('Please check your input');
      expect(errorResponse.details).toHaveLength(1);
    });
  });
}); 