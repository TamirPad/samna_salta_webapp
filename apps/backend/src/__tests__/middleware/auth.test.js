const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const { authenticateToken, requireAdmin, optionalAuth } = require('../../middleware/auth');
const { getSession } = require('../../config/redis');

// Mock dependencies
jest.mock('../../config/redis');
jest.mock('../../utils/logger');

const mockGetSession = getSession;

describe('Auth Middleware', () => {
  let mockReq;
  let mockRes;
  let mockNext;

  beforeEach(() => {
    jest.clearAllMocks();
    
    mockReq = {
      headers: {},
      user: null,
    };
    
    mockRes = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn().mockReturnThis(),
    };
    
    mockNext = jest.fn();
  });

  describe('authenticateToken', () => {
    it('should authenticate valid token and set user', async () => {
      const testUser = {
        id: 1,
        email: 'test@example.com',
        isAdmin: false,
        sessionId: 'test-session-id',
      };

      const token = jwt.sign(testUser, process.env.JWT_SECRET, { expiresIn: '1h' });
      mockReq.headers.authorization = `Bearer ${token}`;
      
      mockGetSession.mockResolvedValue(JSON.stringify(testUser));

      await authenticateToken(mockReq, mockRes, mockNext);

      expect(mockReq.user).toEqual(testUser);
      expect(mockNext).toHaveBeenCalledWith();
      expect(mockGetSession).toHaveBeenCalledWith(testUser.sessionId);
    });

    it('should return 401 when no token provided', async () => {
      await authenticateToken(mockReq, mockRes, mockNext);

      expect(mockRes.status).toHaveBeenCalledWith(401);
      expect(mockRes.json).toHaveBeenCalledWith({
        success: false,
        error: 'Access token required',
      });
      expect(mockNext).not.toHaveBeenCalled();
    });

    it('should return 401 when token format is invalid', async () => {
      mockReq.headers.authorization = 'InvalidToken';

      await authenticateToken(mockReq, mockRes, mockNext);

      expect(mockRes.status).toHaveBeenCalledWith(401);
      expect(mockRes.json).toHaveBeenCalledWith({
        error: 'Access token required',
        message: 'Please provide a valid authentication token',
      });
      expect(mockNext).not.toHaveBeenCalled();
    });

    it('should return 401 when token is expired', async () => {
      const expiredToken = jwt.sign(
        { id: 1, email: 'test@example.com' },
        process.env.JWT_SECRET,
        { expiresIn: '-1h' }
      );
      mockReq.headers.authorization = `Bearer ${expiredToken}`;

      await authenticateToken(mockReq, mockRes, mockNext);

      expect(mockRes.status).toHaveBeenCalledWith(401);
      expect(mockRes.json).toHaveBeenCalledWith({
        error: 'Token expired',
        message: 'Authentication token has expired',
      });
      expect(mockNext).not.toHaveBeenCalled();
    });

    it('should return 401 when token is invalid', async () => {
      mockReq.headers.authorization = 'Bearer invalid-token';

      await authenticateToken(mockReq, mockRes, mockNext);

      expect(mockRes.status).toHaveBeenCalledWith(401);
      expect(mockRes.json).toHaveBeenCalledWith({
        error: 'Invalid token',
        message: 'Invalid authentication token',
      });
      expect(mockNext).not.toHaveBeenCalled();
    });

    it('should return 401 when session not found in Redis', async () => {
      const testUser = {
        id: 1,
        email: 'test@example.com',
        sessionId: 'test-session-id',
      };

      const token = jwt.sign(testUser, process.env.JWT_SECRET, { expiresIn: '1h' });
      mockReq.headers.authorization = `Bearer ${token}`;
      
      mockGetSession.mockResolvedValue(null);

      await authenticateToken(mockReq, mockRes, mockNext);

      expect(mockRes.status).toHaveBeenCalledWith(401);
      expect(mockRes.json).toHaveBeenCalledWith({
        error: 'Invalid session',
        message: 'Session expired or invalid',
      });
      expect(mockNext).not.toHaveBeenCalled();
    });

    it('should return 401 when session data is invalid JSON', async () => {
      const testUser = {
        id: 1,
        email: 'test@example.com',
        sessionId: 'test-session-id',
      };

      const token = jwt.sign(testUser, process.env.JWT_SECRET, { expiresIn: '1h' });
      mockReq.headers.authorization = `Bearer ${token}`;
      
      mockGetSession.mockResolvedValue('invalid-json');

      await authenticateToken(mockReq, mockRes, mockNext);

      expect(mockRes.status).toHaveBeenCalledWith(401);
      expect(mockRes.json).toHaveBeenCalledWith({
        success: false,
        error: 'Invalid session data',
      });
      expect(mockNext).not.toHaveBeenCalled();
    });

    it('should handle Redis errors gracefully', async () => {
      const testUser = {
        id: 1,
        email: 'test@example.com',
        sessionId: 'test-session-id',
      };

      const token = jwt.sign(testUser, process.env.JWT_SECRET, { expiresIn: '1h' });
      mockReq.headers.authorization = `Bearer ${token}`;
      
      mockGetSession.mockRejectedValue(new Error('Redis connection error'));

      await authenticateToken(mockReq, mockRes, mockNext);

      expect(mockRes.status).toHaveBeenCalledWith(500);
      expect(mockRes.json).toHaveBeenCalledWith({
        error: 'Authentication failed',
        message: 'Internal server error during authentication',
      });
      expect(mockNext).not.toHaveBeenCalled();
    });

    it('should handle missing sessionId in token', async () => {
      const testUser = {
        id: 1,
        email: 'test@example.com',
        // Missing sessionId
      };

      const token = jwt.sign(testUser, process.env.JWT_SECRET, { expiresIn: '1h' });
      mockReq.headers.authorization = `Bearer ${token}`;

      await authenticateToken(mockReq, mockRes, mockNext);

      expect(mockRes.status).toHaveBeenCalledWith(401);
      expect(mockRes.json).toHaveBeenCalledWith({
        error: 'Authentication failed',
        message: 'Internal server error during authentication',
      });
      expect(mockNext).not.toHaveBeenCalled();
    });

    it('should handle case-insensitive authorization header', async () => {
      const testUser = {
        id: 1,
        email: 'test@example.com',
        isAdmin: false,
        sessionId: 'test-session-id',
      };

      const token = jwt.sign(testUser, process.env.JWT_SECRET, { expiresIn: '1h' });
      mockReq.headers.AUTHORIZATION = `Bearer ${token}`;
      
      mockGetSession.mockResolvedValue(JSON.stringify(testUser));

      await authenticateToken(mockReq, mockRes, mockNext);

      expect(mockReq.user).toEqual(testUser);
      expect(mockNext).toHaveBeenCalledWith();
    });
  });

  describe('requireAdmin', () => {
    it('should allow admin users to proceed', () => {
      mockReq.user = {
        id: 1,
        email: 'admin@example.com',
        isAdmin: true,
      };

      requireAdmin(mockReq, mockRes, mockNext);

      expect(mockNext).toHaveBeenCalledWith();
    });

    it('should return 403 for non-admin users', () => {
      mockReq.user = {
        id: 1,
        email: 'user@example.com',
        isAdmin: false,
      };

      requireAdmin(mockReq, mockRes, mockNext);

      expect(mockRes.status).toHaveBeenCalledWith(403);
      expect(mockRes.json).toHaveBeenCalledWith({
        error: 'Admin access required',
        message: 'You do not have permission to access this resource',
      });
      expect(mockNext).not.toHaveBeenCalled();
    });

    it('should return 403 when user is null', () => {
      mockReq.user = null;

      requireAdmin(mockReq, mockRes, mockNext);

      expect(mockRes.status).toHaveBeenCalledWith(403);
      expect(mockRes.json).toHaveBeenCalledWith({
        error: 'Admin access required',
        message: 'You do not have permission to access this resource',
      });
      expect(mockNext).not.toHaveBeenCalled();
    });

    it('should return 403 when user is undefined', () => {
      mockReq.user = undefined;

      requireAdmin(mockReq, mockRes, mockNext);

      expect(mockRes.status).toHaveBeenCalledWith(403);
      expect(mockRes.json).toHaveBeenCalledWith({
        error: 'Admin access required',
        message: 'You do not have permission to access this resource',
      });
      expect(mockNext).not.toHaveBeenCalled();
    });

    it('should handle missing isAdmin property', () => {
      mockReq.user = {
        id: 1,
        email: 'user@example.com',
        // Missing isAdmin property
      };

      requireAdmin(mockReq, mockRes, mockNext);

      expect(mockRes.status).toHaveBeenCalledWith(403);
      expect(mockRes.json).toHaveBeenCalledWith({
        error: 'Admin access required',
        message: 'You do not have permission to access this resource',
      });
      expect(mockNext).not.toHaveBeenCalled();
    });
  });

  describe('optionalAuth', () => {
    it('should set user when valid token provided', async () => {
      const testUser = {
        id: 1,
        email: 'test@example.com',
        isAdmin: false,
        sessionId: 'test-session-id',
      };

      const token = jwt.sign(testUser, process.env.JWT_SECRET, { expiresIn: '1h' });
      mockReq.headers.authorization = `Bearer ${token}`;
      
      mockGetSession.mockResolvedValue(JSON.stringify(testUser));

      await optionalAuth(mockReq, mockRes, mockNext);

      expect(mockReq.user).toEqual(testUser);
      expect(mockNext).toHaveBeenCalledWith();
    });

    it('should proceed without user when no token provided', async () => {
      await optionalAuth(mockReq, mockRes, mockNext);

      expect(mockReq.user).toBeNull();
      expect(mockNext).toHaveBeenCalledWith();
    });

    it('should proceed without user when token is invalid', async () => {
      mockReq.headers.authorization = 'Bearer invalid-token';

      await optionalAuth(mockReq, mockRes, mockNext);

      expect(mockReq.user).toBeNull();
      expect(mockNext).toHaveBeenCalledWith();
    });

    it('should proceed without user when token is expired', async () => {
      const expiredToken = jwt.sign(
        { id: 1, email: 'test@example.com' },
        process.env.JWT_SECRET,
        { expiresIn: '-1h' }
      );
      mockReq.headers.authorization = `Bearer ${expiredToken}`;

      await optionalAuth(mockReq, mockRes, mockNext);

      expect(mockReq.user).toBeNull();
      expect(mockNext).toHaveBeenCalledWith();
    });

    it('should proceed without user when session not found', async () => {
      const testUser = {
        id: 1,
        email: 'test@example.com',
        sessionId: 'test-session-id',
      };

      const token = jwt.sign(testUser, process.env.JWT_SECRET, { expiresIn: '1h' });
      mockReq.headers.authorization = `Bearer ${token}`;
      
      mockGetSession.mockResolvedValue(null);

      await optionalAuth(mockReq, mockRes, mockNext);

      expect(mockReq.user).toBeNull();
      expect(mockNext).toHaveBeenCalledWith();
    });

    it('should handle Redis errors gracefully and proceed without user', async () => {
      const testUser = {
        id: 1,
        email: 'test@example.com',
        sessionId: 'test-session-id',
      };

      const token = jwt.sign(testUser, process.env.JWT_SECRET, { expiresIn: '1h' });
      mockReq.headers.authorization = `Bearer ${token}`;
      
      mockGetSession.mockRejectedValue(new Error('Redis connection error'));

      await optionalAuth(mockReq, mockRes, mockNext);

      expect(mockReq.user).toBeNull();
      expect(mockNext).toHaveBeenCalledWith();
    });
  });

  describe('Edge Cases', () => {
    it('should handle malformed authorization header', async () => {
      mockReq.headers.authorization = 'Bearer';

      await authenticateToken(mockReq, mockRes, mockNext);

      expect(mockRes.status).toHaveBeenCalledWith(401);
      expect(mockRes.json).toHaveBeenCalledWith({
        success: false,
        error: 'Invalid token format',
      });
    });

    it('should handle empty authorization header', async () => {
      mockReq.headers.authorization = '';

      await authenticateToken(mockReq, mockRes, mockNext);

      expect(mockRes.status).toHaveBeenCalledWith(401);
      expect(mockRes.json).toHaveBeenCalledWith({
        success: false,
        error: 'Access token required',
      });
    });

    it('should handle null authorization header', async () => {
      mockReq.headers.authorization = null;

      await authenticateToken(mockReq, mockRes, mockNext);

      expect(mockRes.status).toHaveBeenCalledWith(401);
      expect(mockRes.json).toHaveBeenCalledWith({
        success: false,
        error: 'Access token required',
      });
    });

    it('should handle undefined authorization header', async () => {
      mockReq.headers.authorization = undefined;

      await authenticateToken(mockReq, mockRes, mockNext);

      expect(mockRes.status).toHaveBeenCalledWith(401);
      expect(mockRes.json).toHaveBeenCalledWith({
        success: false,
        error: 'Access token required',
      });
    });

    it('should handle token with extra whitespace', async () => {
      const testUser = {
        id: 1,
        email: 'test@example.com',
        isAdmin: false,
        sessionId: 'test-session-id',
      };

      const token = jwt.sign(testUser, process.env.JWT_SECRET, { expiresIn: '1h' });
      mockReq.headers.authorization = `  Bearer  ${token}  `;
      
      mockGetSession.mockResolvedValue(JSON.stringify(testUser));

      await authenticateToken(mockReq, mockRes, mockNext);

      expect(mockReq.user).toEqual(testUser);
      expect(mockNext).toHaveBeenCalledWith();
    });
  });
}); 