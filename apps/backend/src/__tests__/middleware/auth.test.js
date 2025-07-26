const jwt = require('jsonwebtoken');
const { authenticateToken, requireAdmin, optionalAuth } = require('../../middleware/auth');
const { getSession } = require('../../config/redis');

// Set up test environment
process.env.JWT_SECRET = 'test-jwt-secret-key';
process.env.NODE_ENV = 'test';

// Mock dependencies
jest.mock('../../config/redis');
jest.mock('../../utils/logger', () => ({
  error: jest.fn(),
  info: jest.fn()
}));

describe('Authentication Middleware', () => {
  let mockReq;
  let mockRes;
  let mockNext;

  beforeEach(() => {
    mockReq = {
      headers: {},
      user: null
    };
    mockRes = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn()
    };
    mockNext = jest.fn();
    jest.clearAllMocks();
  });

  describe('authenticateToken', () => {
    it('should authenticate valid token successfully', async () => {
      const token = jwt.sign(
        { userId: 1, email: 'test@example.com', isAdmin: false, sessionId: 'session-123' },
        process.env.JWT_SECRET
      );
      
      mockReq.headers.authorization = `Bearer ${token}`;
      getSession.mockResolvedValue({ userId: 1, email: 'test@example.com', isAdmin: false });

      await authenticateToken(mockReq, mockRes, mockNext);

      expect(mockReq.user).toEqual({
        id: 1,
        email: 'test@example.com',
        isAdmin: false,
        sessionId: 'session-123'
      });
      expect(mockNext).toHaveBeenCalled();
    });

    it('should return 401 when no token provided', async () => {
      await authenticateToken(mockReq, mockRes, mockNext);

      expect(mockRes.status).toHaveBeenCalledWith(401);
      expect(mockRes.json).toHaveBeenCalledWith({
        error: 'Access token required',
        message: 'Please provide a valid authentication token'
      });
      expect(mockNext).not.toHaveBeenCalled();
    });

    it('should return 401 when token is invalid', async () => {
      mockReq.headers.authorization = 'Bearer invalid-token';

      await authenticateToken(mockReq, mockRes, mockNext);

      expect(mockRes.status).toHaveBeenCalledWith(401);
      expect(mockRes.json).toHaveBeenCalledWith({
        error: 'Invalid token',
        message: 'Invalid authentication token'
      });
      expect(mockNext).not.toHaveBeenCalled();
    });

    it('should return 401 when token is expired', async () => {
      const token = jwt.sign(
        { userId: 1, email: 'test@example.com', isAdmin: false, sessionId: 'session-123' },
        process.env.JWT_SECRET,
        { expiresIn: '1ms' }
      );
      
      mockReq.headers.authorization = `Bearer ${token}`;

      // Wait for token to expire
      await new Promise(resolve => setTimeout(resolve, 10));

      await authenticateToken(mockReq, mockRes, mockNext);

      expect(mockRes.status).toHaveBeenCalledWith(401);
      expect(mockRes.json).toHaveBeenCalledWith({
        error: 'Token expired',
        message: 'Authentication token has expired'
      });
      expect(mockNext).not.toHaveBeenCalled();
    });

    it('should return 401 when session not found', async () => {
      const token = jwt.sign(
        { userId: 1, email: 'test@example.com', isAdmin: false, sessionId: 'session-123' },
        process.env.JWT_SECRET
      );
      
      mockReq.headers.authorization = `Bearer ${token}`;
      getSession.mockResolvedValue(null);

      await authenticateToken(mockReq, mockRes, mockNext);

      expect(mockRes.status).toHaveBeenCalledWith(401);
      expect(mockRes.json).toHaveBeenCalledWith({
        error: 'Invalid session',
        message: 'Session expired or invalid'
      });
      expect(mockNext).not.toHaveBeenCalled();
    });

    it('should return 500 on unexpected error', async () => {
      const token = jwt.sign(
        { userId: 1, email: 'test@example.com', isAdmin: false, sessionId: 'session-123' },
        process.env.JWT_SECRET
      );
      
      mockReq.headers.authorization = `Bearer ${token}`;
      getSession.mockRejectedValue(new Error('Redis error'));

      await authenticateToken(mockReq, mockRes, mockNext);

      expect(mockRes.status).toHaveBeenCalledWith(500);
      expect(mockRes.json).toHaveBeenCalledWith({
        error: 'Authentication failed',
        message: 'Internal server error during authentication'
      });
      expect(mockNext).not.toHaveBeenCalled();
    });
  });

  describe('requireAdmin', () => {
    it('should allow admin user to proceed', () => {
      mockReq.user = { id: 1, isAdmin: true };

      requireAdmin(mockReq, mockRes, mockNext);

      expect(mockNext).toHaveBeenCalled();
    });

    it('should deny non-admin user', () => {
      mockReq.user = { id: 1, isAdmin: false };

      requireAdmin(mockReq, mockRes, mockNext);

      expect(mockRes.status).toHaveBeenCalledWith(403);
      expect(mockRes.json).toHaveBeenCalledWith({
        error: 'Admin access required',
        message: 'You do not have permission to access this resource'
      });
      expect(mockNext).not.toHaveBeenCalled();
    });

    it('should deny user without admin property', () => {
      mockReq.user = { id: 1 };

      requireAdmin(mockReq, mockRes, mockNext);

      expect(mockRes.status).toHaveBeenCalledWith(403);
      expect(mockRes.json).toHaveBeenCalledWith({
        error: 'Admin access required',
        message: 'You do not have permission to access this resource'
      });
      expect(mockNext).not.toHaveBeenCalled();
    });

    it('should deny request without user', () => {
      requireAdmin(mockReq, mockRes, mockNext);

      expect(mockRes.status).toHaveBeenCalledWith(403);
      expect(mockRes.json).toHaveBeenCalledWith({
        error: 'Admin access required',
        message: 'You do not have permission to access this resource'
      });
      expect(mockNext).not.toHaveBeenCalled();
    });
  });

  describe('optionalAuth', () => {
    it('should authenticate user when valid token provided', async () => {
      const token = jwt.sign(
        { userId: 1, email: 'test@example.com', isAdmin: false, sessionId: 'session-123' },
        process.env.JWT_SECRET
      );
      
      mockReq.headers.authorization = `Bearer ${token}`;
      getSession.mockResolvedValue({ userId: 1, email: 'test@example.com', isAdmin: false });

      await optionalAuth(mockReq, mockRes, mockNext);

      expect(mockReq.user).toEqual({
        id: 1,
        email: 'test@example.com',
        isAdmin: false,
        sessionId: 'session-123'
      });
      expect(mockNext).toHaveBeenCalled();
    });

    it('should proceed without authentication when no token provided', async () => {
      await optionalAuth(mockReq, mockRes, mockNext);

      expect(mockReq.user).toBeNull();
      expect(mockNext).toHaveBeenCalled();
    });

    it('should proceed without authentication when token is invalid', async () => {
      mockReq.headers.authorization = 'Bearer invalid-token';

      await optionalAuth(mockReq, mockRes, mockNext);

      expect(mockReq.user).toBeNull();
      expect(mockNext).toHaveBeenCalled();
    });

    it('should proceed without authentication when session not found', async () => {
      const token = jwt.sign(
        { userId: 1, email: 'test@example.com', isAdmin: false, sessionId: 'session-123' },
        process.env.JWT_SECRET
      );
      
      mockReq.headers.authorization = `Bearer ${token}`;
      getSession.mockResolvedValue(null);

      await optionalAuth(mockReq, mockRes, mockNext);

      expect(mockReq.user).toBeNull();
      expect(mockNext).toHaveBeenCalled();
    });

    it('should proceed without authentication on error', async () => {
      const token = jwt.sign(
        { userId: 1, email: 'test@example.com', isAdmin: false, sessionId: 'session-123' },
        process.env.JWT_SECRET
      );
      
      mockReq.headers.authorization = `Bearer ${token}`;
      getSession.mockRejectedValue(new Error('Redis error'));

      await optionalAuth(mockReq, mockRes, mockNext);

      expect(mockReq.user).toBeNull();
      expect(mockNext).toHaveBeenCalled();
    });
  });
}); 