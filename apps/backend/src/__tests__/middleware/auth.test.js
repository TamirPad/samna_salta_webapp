const jwt = require('jsonwebtoken');
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
    });

    it('should return 401 when no token provided', async () => {
      await authenticateToken(mockReq, mockRes, mockNext);

      expect(mockRes.status).toHaveBeenCalledWith(401);
      expect(mockRes.json).toHaveBeenCalledWith({
        success: false,
        error: 'Access token required',
      });
    });

    it('should return 401 when token is invalid', async () => {
      mockReq.headers.authorization = 'Bearer invalid-token';

      await authenticateToken(mockReq, mockRes, mockNext);

      expect(mockRes.status).toHaveBeenCalledWith(401);
      expect(mockRes.json).toHaveBeenCalledWith({
        error: 'Invalid token',
        message: 'Authentication token is invalid',
      });
    });
  });

  describe('requireAdmin', () => {
    it('should allow admin user to proceed', () => {
      mockReq.user = { id: 1, isAdmin: true };
      
      requireAdmin(mockReq, mockRes, mockNext);
      
      expect(mockNext).toHaveBeenCalledWith();
    });

    it('should return 403 for non-admin user', () => {
      mockReq.user = { id: 1, isAdmin: false };
      
      requireAdmin(mockReq, mockRes, mockNext);
      
      expect(mockRes.status).toHaveBeenCalledWith(403);
      expect(mockRes.json).toHaveBeenCalledWith({
        success: false,
        error: 'Admin access required',
      });
    });
  });

  describe('optionalAuth', () => {
    it('should set user when valid token provided', async () => {
      const testUser = { id: 1, email: 'test@example.com' };
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
  });
}); 