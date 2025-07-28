const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { body, validationResult } = require('express-validator');
const { v4: uuidv4 } = require('uuid');

const { query } = require('../config/database');
const { authenticateToken } = require('../middleware/auth');
const logger = require('../utils/logger');

const router = express.Router();

// Validation middleware
const validateRegistration = [
  body('name').trim().isLength({ min: 2, max: 50 }).withMessage('Name must be between 2 and 50 characters'),
  body('email').isEmail().normalizeEmail().withMessage('Please provide a valid email'),
  body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters long'),
  body('phone').optional().isMobilePhone().withMessage('Please provide a valid phone number')
];

const validateLogin = [
  body('email').isEmail().normalizeEmail().withMessage('Please provide a valid email'),
  body('password').notEmpty().withMessage('Password is required')
];

// Register new user
router.post('/register', validateRegistration, async (req, res) => {
  try {
    // Check for validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        error: 'Validation failed',
        details: errors.array()
      });
    }

    const { name, email, password, phone } = req.body;

    // Check if user already exists
    const existingUser = await query(
      'SELECT id FROM users WHERE email = $1',
      [email]
    );

    if (existingUser.rows.length > 0) {
      return res.status(400).json({
        success: false,
        error: 'User already exists',
        message: 'A user with this email already exists'
      });
    }

    // Hash password
    const saltRounds = 12;
    const hashedPassword = await bcrypt.hash(password, saltRounds);

    // Create user
    const result = await query(
      `INSERT INTO users (name, email, password_hash, phone, is_admin, created_at, updated_at)
       VALUES ($1, $2, $3, $4, $5, NOW(), NOW())
       RETURNING id, name, email, phone, is_admin, created_at`,
      [name, email, hashedPassword, phone, false]
    );

    const user = result.rows[0];

    // Generate JWT token
    const token = jwt.sign(
      {
        userId: user.id,
        email: user.email,
        isAdmin: user.is_admin,
        sessionId: uuidv4()
      },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );

    logger.info('User registered successfully:', { userId: user.id, email });

    res.status(201).json({
      success: true,
      message: 'User registered successfully',
      data: {
        user: {
          id: user.id,
          name: user.name,
          email: user.email,
          phone: user.phone,
          isAdmin: user.is_admin
        },
        token
      }
    });

  } catch (error) {
    logger.error('Registration error:', error);
    res.status(500).json({
      success: false,
      error: 'Registration failed',
      message: 'Internal server error'
    });
  }
});

// Login user
router.post('/login', validateLogin, async (req, res) => {
  try {
    // Check for validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        error: 'Validation failed',
        details: errors.array()
      });
    }

    const { email, password } = req.body;

    // Development mode fallback - allow any login without database
    if (process.env.NODE_ENV === 'development') {
      console.log('🔧 Development mode: Using fallback login for any credentials');
      
      const testUser = {
        id: 1,
        name: 'Test User',
        email: email,
        phone: '+1234567890',
        isAdmin: true
      };

      // Generate JWT token
      const token = jwt.sign(
        {
          userId: testUser.id,
          email: testUser.email,
          isAdmin: testUser.isAdmin,
          sessionId: uuidv4()
        },
        process.env.JWT_SECRET || 'dev-secret-key',
        { expiresIn: '7d' }
      );

      console.log('✅ Development login successful:', { userId: testUser.id, email });

      return res.json({
        success: true,
        message: 'Login successful (development mode)',
        data: {
          user: testUser,
          token
        }
      });
    }

    // Find user
    let result;
    try {
      result = await query(
        'SELECT id, name, email, password_hash, phone, is_admin FROM users WHERE email = $1',
        [email]
      );
    } catch (dbError) {
      console.error('❌ Database error during login:', dbError.message);
      logger.error('Database error during login:', dbError);
      
      // Check if it's a connection error
      if (dbError.message.includes('Database not connected') || 
          dbError.message.includes('connection') ||
          dbError.code === 'ECONNREFUSED' ||
          dbError.code === 'ENOTFOUND') {
        return res.status(503).json({
          success: false,
          error: 'Database unavailable',
          message: 'Database connection is not available. Please try again later.',
          details: 'The application is currently experiencing database connectivity issues.'
        });
      }
      
      // For other database errors, return generic error
      return res.status(500).json({
        success: false,
        error: 'Database error',
        message: 'An error occurred while processing your request.'
      });
    }

    if (result.rows.length === 0) {
      return res.status(401).json({
        success: false,
        error: 'Invalid credentials',
        message: 'Email or password is incorrect'
      });
    }

    const user = result.rows[0];

    // Check password
    const isPasswordValid = await bcrypt.compare(password, user.password_hash);
    if (!isPasswordValid) {
      return res.status(401).json({
        success: false,
        error: 'Invalid credentials',
        message: 'Email or password is incorrect'
      });
    }

    // Generate JWT token
    const token = jwt.sign(
      {
        userId: user.id,
        email: user.email,
        isAdmin: user.is_admin,
        sessionId: uuidv4()
      },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );

    // Update last login (optional - don't fail if this fails)
    try {
      await query(
        'UPDATE users SET last_login = NOW() WHERE id = $1',
        [user.id]
      );
    } catch (updateError) {
      console.warn('⚠️ Failed to update last login:', updateError.message);
      logger.warn('Failed to update last login:', updateError);
      // Don't fail the login for this
    }

    console.log('✅ User logged in successfully:', { userId: user.id, email });
    logger.info('User logged in successfully:', { userId: user.id, email });

    res.json({
      success: true,
      message: 'Login successful',
      data: {
        user: {
          id: user.id,
          name: user.name,
          email: user.email,
          phone: user.phone,
          isAdmin: user.is_admin
        },
        token
      }
    });

  } catch (error) {
    console.error('❌ Login error:', error.message);
    logger.error('Login error:', error);
    res.status(500).json({
      success: false,
      error: 'Login failed',
      message: 'Internal server error'
    });
  }
});

// Get current user
router.get('/me', authenticateToken, async (req, res) => {
  try {
    const result = await query(
      'SELECT id, name, email, phone, is_admin, created_at, last_login FROM users WHERE id = $1',
      [req.user.id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'User not found',
        message: 'User does not exist'
      });
    }

    const user = result.rows[0];

    res.json({
      success: true,
      data: {
        user: {
          id: user.id,
          name: user.name,
          email: user.email,
          phone: user.phone,
          isAdmin: user.is_admin,
          createdAt: user.created_at,
          lastLogin: user.last_login
        }
      }
    });

  } catch (error) {
    logger.error('Get user error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to get user',
      message: 'Internal server error'
    });
  }
});

// Logout user
router.post('/logout', authenticateToken, async (req, res) => {
  try {
    logger.info('User logged out successfully:', { userId: req.user.id });

    res.json({
      success: true,
      message: 'Logout successful'
    });

  } catch (error) {
    logger.error('Logout error:', error);
    res.status(500).json({
      success: false,
      error: 'Logout failed',
      message: 'Internal server error'
    });
  }
});

module.exports = router; 