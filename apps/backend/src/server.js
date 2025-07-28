require('dotenv').config();
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const compression = require('compression');
const rateLimit = require('express-rate-limit');
const csrf = require('csurf');
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
    console.log('⚠️ Environment validation failed, but continuing in production mode');
    console.log('⚠️ Some features may not work properly');
  } else {
    logger.warn('Running in development mode with missing environment variables');
  }
}

const app = express();
const server = createServer(app);

// Trust proxy for rate limiting
app.set('trust proxy', 1);

// CORS configuration
const allowedOrigins = [
  process.env.FRONTEND_URL || "http://localhost:3000"
];

// Add additional origins from environment if specified
if (process.env.ADDITIONAL_CORS_ORIGINS) {
  const additionalOrigins = process.env.ADDITIONAL_CORS_ORIGINS.split(',').map(origin => origin.trim());
  allowedOrigins.push(...additionalOrigins);
}

const io = new Server(server, {
  cors: {
    origin: allowedOrigins,
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
      connectSrc: [
        "'self'", 
        process.env.FRONTEND_URL || "http://localhost:3000"
      ],
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

app.use(cors({
  origin: function (origin, callback) {
    // Allow requests with no origin (like mobile apps or curl requests)
    if (!origin) return callback(null, true);
    
    if (allowedOrigins.indexOf(origin) !== -1) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
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

// Add request size validation middleware
app.use((req, res, next) => {
  const contentLength = parseInt(req.headers['content-length'] || '0');
  const maxSize = parseInt(process.env.MAX_FILE_SIZE || '10485760'); // 10MB default
  
  if (contentLength > maxSize) {
    return res.status(413).json({
      success: false,
      error: 'Request entity too large',
      message: 'Request size exceeds the allowed limit'
    });
  }
  next();
});

// CSRF protection (skip for API routes and file uploads)
app.use((req, res, next) => {
  if (req.path.startsWith('/api/') || req.path.startsWith('/upload/')) {
    return next();
  }
  
  const csrfProtection = csrf({ 
    cookie: {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict'
    }
  });
  
  csrfProtection(req, res, next);
});

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
  
  const healthStatus = {
    status: 'healthy',
    timestamp: new Date().toISOString(),
    version: process.env.npm_package_version || '1.0.0',
    environment: process.env.NODE_ENV || 'development',
    uptime: process.uptime(),
    memory: {
      used: Math.round(process.memoryUsage().heapUsed / 1024 / 1024),
      total: Math.round(process.memoryUsage().heapTotal / 1024 / 1024),
      external: Math.round(process.memoryUsage().external / 1024 / 1024)
    },
    services: {
      database: isDBConnected ? 'connected' : 'disconnected',
      redis: isRedisConnected ? 'connected' : 'disconnected'
    },
    port: process.env.PORT || 3001,
    requestId: req.id
  };

  // Set status based on critical services
  const isHealthy = isDBConnected && isRedisConnected;
  const statusCode = isHealthy ? 200 : 503;
  
  res.status(statusCode).json(healthStatus);
});

// Simple test endpoint that doesn't require database
app.get('/api/test', (req, res) => {
  res.json({
    success: true,
    message: 'Backend API is working!',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development'
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

const startServer = async () => {
  try {
    console.log('🚀 Starting Samna Salta Backend Server...');
    console.log('Environment:', process.env.NODE_ENV);
    console.log('Port:', process.env.PORT || 3001);
    
    // Try to connect to database (but don't fail if it doesn't work)
    try {
      await connectDB();
      console.log('✅ Database connection established');
    } catch (dbError) {
      console.log('⚠️ Database connection failed, continuing without database:', dbError.message);
    }
    
    // Try to connect to Redis (but don't fail if it doesn't work)
    try {
      await connectRedis();
      console.log('✅ Redis connection established');
    } catch (redisError) {
      console.log('⚠️ Redis connection failed, using in-memory fallback:', redisError.message);
    }
    
    // Use PORT from environment or default to 3001
    const port = process.env.BACKEND_PORT || process.env.PORT || 3001; // Use BACKEND_PORT first
    
    // Add error handling for port conflicts
    server.on('error', (error) => {
      console.error('❌ Server error:', error.message);
      if (error.code === 'EADDRINUSE') {
        console.log(`⚠️ Port ${port} is already in use. Trying port ${port + 1}`);
        server.listen(port + 1);
      } else {
        console.error('❌ Fatal server error:', error);
        // Don't exit process in production, just log the error
        if (process.env.NODE_ENV !== 'production') {
          process.exit(1);
        }
      }
    });
    
    server.listen(port, () => {
      console.log(`✅ Server running on port ${port}`);
      console.log(`🌐 Health check: http://localhost:${port}/health`);
      console.log(`🧪 Test endpoint: http://localhost:${port}/api/test`);
    });
  } catch (error) {
    console.error('❌ Failed to start server:', error.message);
    // Don't exit process in production, just log the error
    if (process.env.NODE_ENV !== 'production') {
      process.exit(1);
    }
  }
};

startServer();

// Graceful shutdown
const gracefulShutdown = async (signal) => {
  console.log(`🛑 ${signal} received, shutting down gracefully`);
  
  try {
    // Close server
    server.close(() => {
      console.log('✅ HTTP server closed');
    });
    
    // Close database connections
    try {
      await closePool();
      console.log('✅ Database pool closed');
    } catch (error) {
      console.log('⚠️ Error closing database pool:', error.message);
    }
    
    try {
      await closeRedis();
      console.log('✅ Redis connection closed');
    } catch (error) {
      console.log('⚠️ Error closing Redis connection:', error.message);
    }
    
    console.log('✅ Graceful shutdown completed');
    
    // Only exit if not in production or if it's a critical error
    if (process.env.NODE_ENV !== 'production' || signal === 'uncaughtException' || signal === 'unhandledRejection') {
      process.exit(0);
    }
  } catch (error) {
    console.error('❌ Error during graceful shutdown:', error);
    process.exit(1);
  }
};

process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
process.on('SIGINT', () => gracefulShutdown('SIGINT'));

// Handle uncaught exceptions
process.on('uncaughtException', (error) => {
  console.error('❌ Uncaught Exception:', error.message);
  console.error('Stack trace:', error.stack);
  
  // In production, don't exit immediately, try to log and continue
  if (process.env.NODE_ENV === 'production') {
    console.log('⚠️ Continuing in production despite uncaught exception');
    return;
  }
  
  gracefulShutdown('uncaughtException');
});

// Handle unhandled promise rejections
process.on('unhandledRejection', (reason, promise) => {
  console.error('❌ Unhandled Rejection at:', promise);
  console.error('Reason:', reason);
  
  // In production, don't exit immediately, try to log and continue
  if (process.env.NODE_ENV === 'production') {
    console.log('⚠️ Continuing in production despite unhandled rejection');
    return;
  }
  
  gracefulShutdown('unhandledRejection');
});

module.exports = { app, server, io }; 