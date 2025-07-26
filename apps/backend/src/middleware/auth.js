const jwt = require('jsonwebtoken');
const { getSession } = require('../config/redis');
const logger = require('../utils/logger');

const authenticateToken = async (req, res, next) => {
  try {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN

    if (!token) {
      return res.status(401).json({ 
        error: 'Access token required',
        message: 'Please provide a valid authentication token' 
      });
    }

    // Verify JWT token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    // Check if user session exists in Redis
    const session = await getSession(decoded.sessionId);
    if (!session) {
      return res.status(401).json({ 
        error: 'Invalid session',
        message: 'Session expired or invalid' 
      });
    }

    // Add user info to request
    req.user = {
      id: decoded.userId,
      email: decoded.email,
      isAdmin: decoded.isAdmin,
      sessionId: decoded.sessionId
    };

    next();
  } catch (error) {
    logger.error('Authentication error:', error);
    
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({ 
        error: 'Token expired',
        message: 'Authentication token has expired' 
      });
    }
    
    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({ 
        error: 'Invalid token',
        message: 'Invalid authentication token' 
      });
    }

    return res.status(500).json({ 
      error: 'Authentication failed',
      message: 'Internal server error during authentication' 
    });
  }
};

const requireAdmin = (req, res, next) => {
  if (!req.user || !req.user.isAdmin) {
    return res.status(403).json({ 
      error: 'Admin access required',
      message: 'You do not have permission to access this resource' 
    });
  }
  next();
};

const optionalAuth = async (req, res, next) => {
  try {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (token) {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      const session = await getSession(decoded.sessionId);
      
      if (session) {
        req.user = {
          id: decoded.userId,
          email: decoded.email,
          isAdmin: decoded.isAdmin,
          sessionId: decoded.sessionId
        };
      }
    }
    
    next();
  } catch (error) {
    // Continue without authentication for optional routes
    // Don't set req.user to null, just leave it undefined
    next();
  }
};

module.exports = {
  authenticateToken,
  requireAdmin,
  optionalAuth
}; 