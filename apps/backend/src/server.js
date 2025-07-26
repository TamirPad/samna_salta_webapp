require('dotenv').config();
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const compression = require('compression');
const rateLimit = require('express-rate-limit');
const { createServer } = require('http');
const { Server } = require('socket.io');

// Import logger first
const logger = require('./utils/logger');

// Import environment validation
const { validateEnvironment } = require('./config/validateEnv');

// Import routes
const authRoutes = require('./routes/auth');
const productRoutes = require('./routes/products');
const orderRoutes = require('./routes/orders');
const customerRoutes = require('./routes/customers');
const analyticsRoutes = require('./routes/analytics');
const uploadRoutes = require('./routes/upload');

// Import middleware
const { authenticateToken } = require('./middleware/auth');
const { errorHandler } = require('./middleware/errorHandler');

// Import database connection
const { connectDB, closePool } = require('./config/database');
const { connectRedis, closeRedis } = require('./config/redis');

// Validate environment variables
if (!validateEnvironment()) {
  if (process.env.NODE_ENV === 'production') {
    process.exit(1);
  } else {
    logger.warn('Running in development mode with missing environment variables');
  }
}

const app = express();
const server = createServer(app);

// Trust proxy for rate limiting
app.set('trust proxy', 1);

const io = new Server(server, {
  cors: {
    origin: process.env.FRONTEND_URL || "http://localhost:3000",
    methods: ["GET", "POST"],
    credentials: true
  },
  // Add security options
  allowEIO3: false,
  transports: ['websocket', 'polling']
});

// Rate limiting with different limits for different endpoints
const generalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS) || 100, // limit each IP to 100 requests per windowMs
  message: 'Too many requests from this IP, please try again later.',
  standardHeaders: true,
  legacyHeaders: false,
  // Add rate limit headers
  handler: (req, res) => {
    res.status(429).json({
      success: false,
      error: 'Too many requests',
      message: 'Rate limit exceeded. Please try again later.',
      retryAfter: Math.ceil(15 * 60 / 1000) // 15 minutes in seconds
    });
  }
});

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: parseInt(process.env.AUTH_RATE_LIMIT_MAX_REQUESTS) || 5, // limit each IP to 5 requests per windowMs
  message: 'Too many authentication attempts, please try again later.',
  standardHeaders: true,
  legacyHeaders: false,
  handler: (req, res) => {
    res.status(429).json({
      success: false,
      error: 'Too many authentication attempts',
      message: 'Too many login attempts. Please try again later.',
      retryAfter: Math.ceil(15 * 60 / 1000) // 15 minutes in seconds
    });
  }
});

// Enhanced security headers
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      scriptSrc: ["'self'"],
      imgSrc: ["'self'", "data:", "https:"],
      connectSrc: ["'self'", process.env.FRONTEND_URL || "http://localhost:3000"],
      fontSrc: ["'self'", "https:"],
      objectSrc: ["'none'"],
      mediaSrc: ["'self'"],
      frameSrc: ["'none'"],
    },
  },
  hsts: {
    maxAge: 31536000,
    includeSubDomains: true,
    preload: true
  },
  noSniff: true,
  referrerPolicy: { policy: 'strict-origin-when-cross-origin' }
}));

// CORS configuration
app.use(cors({
  origin: process.env.FRONTEND_URL || "http://localhost:3000",
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Request-ID', 'Cache-Control', 'cache-control'],
  exposedHeaders: ['X-Total-Count', 'X-Page-Count']
}));

// Compression middleware
app.use(compression({
  level: parseInt(process.env.COMPRESSION_LEVEL) || 6,
  threshold: 1024,
  filter: (req, res) => {
    if (req.headers['x-no-compression']) {
      return false;
    }
    return compression.filter(req, res);
  }
}));

// Request logging
app.use(morgan('combined', { stream: { write: message => logger.info(message.trim()) } }));

// Body parsing middleware with limits
app.use(express.json({ 
  limit: process.env.MAX_FILE_SIZE || '10mb',
  verify: (req, res, buf) => {
    req.rawBody = buf;
  }
}));
app.use(express.urlencoded({ 
  extended: true,
  limit: process.env.MAX_FILE_SIZE || '10mb'
}));

// Request ID middleware
app.use((req, res, next) => {
  req.id = `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  res.setHeader('X-Request-ID', req.id);
  next();
});

// Health check endpoint
app.get('/health', (req, res) => {
  const { isDBConnected } = require('./config/database');
  const { isRedisConnected } = require('./config/redis');
  
  res.status(200).json({ 
    status: 'healthy', 
    timestamp: new Date().toISOString(),
    version: process.env.npm_package_version || '1.0.0',
    environment: process.env.NODE_ENV || 'development',
    uptime: process.uptime(),
    memory: process.memoryUsage(),
    services: {
      database: isDBConnected ? 'connected' : 'disconnected',
      redis: isRedisConnected ? 'connected' : 'disconnected'
    }
  });
});

// API Routes with rate limiting
app.use('/api/auth', authLimiter, authRoutes);
app.use('/api/products', generalLimiter, productRoutes);
app.use('/api/orders', generalLimiter, orderRoutes);
app.use('/api/customers', generalLimiter, authenticateToken, customerRoutes);
app.use('/api/analytics', generalLimiter, analyticsRoutes);
app.use('/api/upload', generalLimiter, authenticateToken, uploadRoutes);

// Socket.IO for real-time updates
io.on('connection', (socket) => {
  logger.info('Client connected:', socket.id);
  
  socket.on('join-order-room', (orderId) => {
    if (typeof orderId === 'string' && orderId.length > 0) {
      socket.join(`order-${orderId}`);
      logger.info(`Client ${socket.id} joined order room: ${orderId}`);
    }
  });
  
  socket.on('disconnect', () => {
    logger.info('Client disconnected:', socket.id);
  });
});

// Make io available to routes
app.set('io', io);

// Error handling middleware
app.use(errorHandler);

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({ 
    success: false,
    error: 'Route not found',
    path: req.originalUrl,
    timestamp: new Date().toISOString(),
    requestId: req.id
  });
});

const PORT = process.env.PORT || 3001;

// Start server
const startServer = async () => {
  try {
    // Connect to databases (but don't fail if they're not available in development)
    try {
      await connectDB();
    } catch (dbError) {
      if (process.env.NODE_ENV === 'development') {
        logger.warn('Database connection failed, starting server without database');
      } else {
        throw dbError;
      }
    }
    
    try {
      await connectRedis();
    } catch (redisError) {
      if (process.env.NODE_ENV === 'development') {
        logger.warn('Redis connection failed, starting server without Redis');
      } else {
        throw redisError;
      }
    }
    
    server.listen(PORT, () => {
      logger.info(`Server running on port ${PORT}`);
      logger.info(`Environment: ${process.env.NODE_ENV}`);
      logger.info(`Frontend URL: ${process.env.FRONTEND_URL || 'http://localhost:3000'}`);
      logger.info(`Database: ${process.env.SUPABASE_CONNECTION_STRING ? 'Supabase' : 'Local PostgreSQL'}`);
    });
  } catch (error) {
    logger.error('Failed to start server:', error);
    process.exit(1);
  }
};

startServer();

// Graceful shutdown
const gracefulShutdown = async (signal) => {
  logger.info(`${signal} received, shutting down gracefully`);
  
  try {
    // Close server
    server.close(() => {
      logger.info('HTTP server closed');
    });
    
    // Close database connections
    await closePool();
    await closeRedis();
    
    logger.info('Graceful shutdown completed');
    process.exit(0);
  } catch (error) {
    logger.error('Error during graceful shutdown:', error);
    process.exit(1);
  }
};

process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
process.on('SIGINT', () => gracefulShutdown('SIGINT'));

// Handle uncaught exceptions
process.on('uncaughtException', (error) => {
  logger.error('Uncaught Exception:', error);
  gracefulShutdown('uncaughtException');
});

// Handle unhandled promise rejections
process.on('unhandledRejection', (reason, promise) => {
  logger.error('Unhandled Rejection at:', promise, 'reason:', reason);
  gracefulShutdown('unhandledRejection');
});

module.exports = { app, server, io }; 