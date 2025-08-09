const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const {body, validationResult} = require('express-validator');
const {v4: uuidv4} = require('uuid');
const rateLimit = require('express-rate-limit');

const {query} = require('../config/database');
const { setSession, getSession, deleteSession, setCache, getCache, deleteCache } = require('../config/redis');
const {authenticateToken} = require('../middleware/auth');
const logger = require('../utils/logger');

const router = express.Router();

// Token issuance helpers
const ACCESS_TOKEN_TTL = process.env.JWT_EXPIRES_IN || '30m';
const REFRESH_TOKEN_TTL_SEC = 30 * 24 * 60 * 60; // 30 days
const getCookieOptions = () => ({
  httpOnly: true,
  secure: process.env.NODE_ENV === 'production',
  sameSite: 'lax',
  maxAge: REFRESH_TOKEN_TTL_SEC * 1000,
  path: '/api/auth'
});

const generateAccessToken = (payload) =>
  jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: ACCESS_TOKEN_TTL });

const generateRefreshToken = (payload) =>
  jwt.sign(payload, process.env.REFRESH_TOKEN_SECRET || process.env.JWT_SECRET, { expiresIn: `${REFRESH_TOKEN_TTL_SEC}s` });

async function issueTokens(res, user) {
  const sessionId = uuidv4();
  const accessToken = generateAccessToken({ userId: user.id, email: user.email, isAdmin: !!user.is_admin || !!user.isAdmin, sessionId });
  const refreshJti = uuidv4();
  const refreshToken = generateRefreshToken({ userId: user.id, sessionId, jti: refreshJti });

  try {
    await setSession(sessionId, { userId: user.id }, REFRESH_TOKEN_TTL_SEC);
    await setCache(`refresh:${user.id}:${sessionId}:${refreshJti}`, true, REFRESH_TOKEN_TTL_SEC);
  } catch {}

  try {
    res.cookie('rt', refreshToken, getCookieOptions());
  } catch {}

  return { accessToken, sessionId };
}

// Per-IP and per-identifier login limiter
const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10,
  standardHeaders: true,
  legacyHeaders: false,
  keyGenerator: (req) => {
    try {
      const email = (req.body && req.body.email) ? String(req.body.email).toLowerCase() : '';
      return `${req.ip}:${email}`;
    } catch (_) {
      return req.ip;
    }
  },
  message: {
    success: false,
    error: 'Too many login attempts',
    message: 'Please try again later.'
  }
});

// Validation middleware
const validateRegistration = [
  body('name').trim().isLength({min: 2, max: 50}).withMessage('Name must be between 2 and 50 characters'),
  body('email').isEmail().normalizeEmail().withMessage('Please provide a valid email'),
  body('password').isLength({min: 6}).withMessage('Password must be at least 6 characters long'),
  body('phone').optional().isMobilePhone().withMessage('Please provide a valid phone number')
];

const validateLogin = [
  body('email').isEmail().normalizeEmail().withMessage('Please provide a valid email'),
  body('password').notEmpty().withMessage('Password is required')
];

const validateForgot = [ body('email').isEmail().normalizeEmail().withMessage('Please provide a valid email') ];
const validateReset = [
  body('token').isString().notEmpty(),
  body('password').isLength({min: 6}).withMessage('Password must be at least 6 characters long')
];

// Helper: decode session from JWT (safe parsing)
function getSessionIdFromToken(token) {
  try {
    const payload = JSON.parse(Buffer.from(token.split('.')[1], 'base64').toString());
    return payload.sessionId;
  } catch (_) {
    return undefined;
  }
}

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

    const {name, email, password, phone} = req.body;

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

    // Issue tokens (access + refresh cookie)
    const { accessToken: token } = await issueTokens(res, user);

    logger.info('User registered successfully:', {userId: user.id, email});

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
router.post('/login', loginLimiter, validateLogin, async (req, res) => {
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

    const {email, password} = req.body;

    // Try to use database; if DB unavailable, return service unavailable
    let result;
    try {
      result = await query(
        'SELECT id, name, email, password_hash, phone, is_admin FROM users WHERE email = $1',
        [email]
      );
    } catch (dbError) {
      console.error('❌ Database error during login:', dbError.message);
      logger.error('Database error during login:', dbError);
      // Return service unavailable on DB failure
      return res.status(503).json({
        success: false,
        error: 'Service unavailable',
        message: 'Authentication temporarily unavailable'
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

    const { accessToken: token } = await issueTokens(res, user);

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

    console.log('✅ User logged in successfully:', {userId: user.id, email});
    logger.info('User logged in successfully:', {userId: user.id, email});

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

    return res.json({
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
    // Fallback using JWT claims if DB is unavailable
    logger.warn('Get /me falling back to token claims:', error.message);
    if (req.user) {
      return res.json({
        success: true,
        data: {
          user: {
            id: req.user.id,
            name: req.user.email?.split('@')[0] || 'User',
            email: req.user.email,
            isAdmin: !!req.user.isAdmin,
          }
        }
      });
    }
    return res.status(500).json({
      success: false,
      error: 'Failed to get user',
      message: 'Internal server error'
    });
  }
});

// Logout user
router.post('/logout', authenticateToken, async (req, res) => {
  try {
    logger.info('User logged out successfully:', {userId: req.user.id});
    // Revoke session
    if (req.user && req.user.sessionId) {
      try { await deleteSession(req.user.sessionId); } catch {}
    }
    // Revoke current refresh token if present
    try {
      const rt = req.cookies && req.cookies.rt;
      if (rt) {
        const decoded = jwt.verify(rt, process.env.REFRESH_TOKEN_SECRET || process.env.JWT_SECRET);
        await deleteCache(`refresh:${decoded.userId}:${decoded.sessionId}:${decoded.jti}`);
      }
      res.clearCookie('rt', getCookieOptions());
    } catch {}

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

// Forgot password - send reset email
router.post('/forgot-password', validateForgot, async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ success: false, error: 'Validation failed', details: errors.array() });
    }
    const { email } = req.body;
    const userResult = await query('SELECT id, email FROM users WHERE email = $1', [email]);
    // Always respond success to avoid user enumeration
    if (userResult.rows.length === 0) {
      return res.json({ success: true, message: 'If an account exists, a reset link has been sent' });
    }
    const user = userResult.rows[0];
    const token = uuidv4();
    const ttl = 60 * 60; // 1 hour
    await setCache(`pwreset:${user.id}:${token}`, true, ttl);
    const resetUrl = `${process.env.FRONTEND_URL || 'http://localhost:3000'}/reset-password?token=${encodeURIComponent(token)}&uid=${user.id}`;
    // Send email (log in dev)
    try {
      const nodemailer = require('nodemailer');
      const transporter = nodemailer.createTransport({
        host: process.env.SMTP_HOST,
        port: Number(process.env.SMTP_PORT || 587),
        secure: false,
        auth: process.env.SMTP_USER ? { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS } : undefined
      });
      await transporter.sendMail({
        from: process.env.MAIL_FROM || 'no-reply@samna-salta',
        to: user.email,
        subject: 'Password Reset',
        text: `Reset your password: ${resetUrl}`,
        html: `<p>Click to reset your password:</p><p><a href="${resetUrl}">Reset Password</a></p>`
      });
    } catch (e) {
      console.log('ℹ️ Email not sent (dev or SMTP missing). Reset URL:', resetUrl);
    }
    return res.json({ success: true, message: 'If an account exists, a reset link has been sent' });
  } catch (error) {
    logger.error('Forgot password error:', error);
    return res.status(500).json({ success: false, error: 'Failed to start reset' });
  }
});

// Reset password
router.post('/reset-password', validateReset, async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ success: false, error: 'Validation failed', details: errors.array() });
    }
    const { token, password, uid } = { ...req.body, ...req.query };
    if (!uid) {
      return res.status(400).json({ success: false, error: 'Invalid reset request' });
    }
    const exists = await getCache(`pwreset:${uid}:${token}`);
    if (!exists) {
      return res.status(400).json({ success: false, error: 'Invalid or expired token' });
    }
    const saltRounds = 12;
    const hashed = await bcrypt.hash(password, saltRounds);
    await query('UPDATE users SET password_hash = $1, updated_at = NOW() WHERE id = $2', [hashed, uid]);
    await deleteCache(`pwreset:${uid}:${token}`);
    return res.json({ success: true, message: 'Password updated' });
  } catch (error) {
    logger.error('Reset password error:', error);
    return res.status(500).json({ success: false, error: 'Failed to reset password' });
  }
});

// Refresh access token
router.post('/refresh', async (req, res) => {
  try {
    const token = (req.cookies && req.cookies.rt) || (req.body && req.body.refreshToken);
    if (!token) {
      return res.status(401).json({ success: false, error: 'Refresh token required' });
    }
    let decoded;
    try {
      decoded = jwt.verify(token, process.env.REFRESH_TOKEN_SECRET || process.env.JWT_SECRET);
    } catch (e) {
      return res.status(401).json({ success: false, error: 'Invalid refresh token' });
    }
    const { userId, sessionId, jti } = decoded || {};
    if (!userId || !sessionId || !jti) {
      return res.status(401).json({ success: false, error: 'Invalid refresh token' });
    }
    // Validate session still active (support both session store and legacy cache key)
    try {
      let active = null;
      try {
        active = await getSession(sessionId);
      } catch (_) {}
      if (!active) {
        // Legacy cache pattern fallback
        const legacyKey = `user:${userId}:session:${sessionId}`;
        const { getCache } = require('../config/redis');
        try {
          active = await getCache(legacyKey);
        } catch (_) {}
      }
      if (!active) {
        return res.status(401).json({ success: false, error: 'Session expired' });
      }
    } catch {}
    // Enforce rotation: ensure current jti exists then rotate
    const exists = await getCache(`refresh:${userId}:${sessionId}:${jti}`);
    if (!exists) {
      return res.status(401).json({ success: false, error: 'Refresh token rotated', message: 'Please login again' });
    }
    await deleteCache(`refresh:${userId}:${sessionId}:${jti}`);
    const newJti = uuidv4();
    const newRefresh = generateRefreshToken({ userId, sessionId, jti: newJti });
    await setCache(`refresh:${userId}:${sessionId}:${newJti}`, true, REFRESH_TOKEN_TTL_SEC);
    // New access token
    const access = generateAccessToken({ userId, sessionId });
    try { res.cookie('rt', newRefresh, getCookieOptions()); } catch {}
    return res.json({ success: true, data: { token: access } });
  } catch (error) {
    logger.error('Refresh token error:', error);
    return res.status(500).json({ success: false, error: 'Failed to refresh token' });
  }
});
