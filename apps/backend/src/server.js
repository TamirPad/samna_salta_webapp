require('dotenv').config();
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const compression = require('compression');
const rateLimit = require('express-rate-limit');
const path = require('path');

// Import logger
const logger = require('./utils/logger');

// Import routes
const authRoutes = require('./routes/auth');
const productRoutes = require('./routes/products');
const orderRoutes = require('./routes/orders');
const customerRoutes = require('./routes/customers');
const analyticsRoutes = require('./routes/analytics');

// Import middleware
const {authenticateToken} = require('./middleware/auth');
const {errorHandler} = require('./middleware/errorHandler');

// Import database connection
const {connectDB, closePool} = require('./config/database');
const {connectRedis, closeRedis} = require('./config/redis');
const {runMigrations} = require('./config/migration');

const app = express();

// Trust proxy for rate limiting behind load balancers
app.set('trust proxy', 1);

const PORT = process.env.PORT || 3001;

// Security middleware
app.use(helmet({
  contentSecurityPolicy: process.env.NODE_ENV === 'production' ? {
    useDefaults: true,
    directives: {
      defaultSrc: ["'self'"],
      scriptSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'", "https://fonts.googleapis.com"],
      fontSrc: ["'self'", "data:", "https://fonts.gstatic.com"],
      imgSrc: ["'self'", "data:", "https:", "http:"],
      connectSrc: ["'self'"],
      mediaSrc: ["'self'"],
      objectSrc: ["'none'"],
      upgradeInsecureRequests: []
    }
  } : false,
  referrerPolicy: { policy: 'no-referrer' },
  crossOriginEmbedderPolicy: false
}));
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:3000',
  credentials: true
}));
app.use(compression());
app.use(morgan('combined'));
app.use(express.json({limit: '10mb'}));

// Serve static files from public directory
app.use(express.static('public'));

// Rate limiting - disabled in development
if (process.env.NODE_ENV === 'production') {
  const limiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100, // limit each IP to 100 requests per windowMs
    message: 'Too many requests from this IP, please try again later.',
    standardHeaders: true,
    legacyHeaders: false,
    skip: (req) => {
      // Skip rate limiting for health checks and static files
      return req.path === '/health' || req.path.startsWith('/static/') || req.path.includes('.');
    },
    handler: (req, res) => {
      console.log(`🚫 Rate limit exceeded for: ${req.path}`);
      res.status(429).json({
        error: 'Too many requests',
        message: 'Rate limit exceeded. Please try again later.',
        retryAfter: Math.ceil(15 * 60 / 60) // 15 minutes in minutes
      });
    }
  });
  
  // Apply rate limiting only to API routes in production
  app.use('/api/', limiter);
} else {
  console.log('🔓 Rate limiting disabled in development mode');
}

// Health check
app.get('/health', (req, res) => {
  res.json({
    status: 'ok',
    timestamp: new Date(),
    service: 'samna-salta-api'
  });
});

// API routes
app.use('/api/auth', authRoutes);
app.use('/api/products', productRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/customers', authenticateToken, customerRoutes);
app.use('/api/analytics', authenticateToken, analyticsRoutes);

// Error handling
app.use(errorHandler);

// Serve React app for all non-API routes in production
if (process.env.NODE_ENV === 'production') {
  const frontendBuildPath = path.join(__dirname, '../../frontend/build');
  
  // Serve static files with explicit MIME type handling
  // Support both /static and /admin/static to be resilient to older builds that used relative public paths
  app.use(['/static', '/admin/static'], (req, res, next) => {
    const filePath = path.join(frontendBuildPath, 'static', req.path);
    
    // Check if file exists
    if (require('fs').existsSync(filePath)) {
      const ext = path.extname(filePath);
      
      // Set proper MIME types
      if (ext === '.js') {
        res.setHeader('Content-Type', 'application/javascript');
      } else if (ext === '.css') {
        res.setHeader('Content-Type', 'text/css');
      } else if (ext === '.svg') {
        res.setHeader('Content-Type', 'image/svg+xml');
      }
      
      // Cache hashed assets aggressively
      res.setHeader('Cache-Control', 'public, max-age=31536000, immutable');
      res.sendFile(filePath);
    } else {
      const ext = path.extname(filePath);
      if (ext === '.js' || ext === '.css') {
        // Avoid serving index.html for missing chunk files to prevent MIME errors
        return res.status(404).type('text/plain').send('Not Found');
      }
      next();
    }
  });
  
  // Serve other static files (manifest.json, favicon.ico, etc.)
  app.use((req, res, next) => {
    const ext = path.extname(req.path);
    if (ext === '.json' || ext === '.ico' || ext === '.png' || ext === '.jpg' || ext === '.jpeg' || ext === '.gif' || ext === '.svg') {
      const filePath = path.join(frontendBuildPath, req.path);
      
      if (require('fs').existsSync(filePath)) {
        if (ext === '.json') {
          res.setHeader('Content-Type', 'application/json');
        } else if (ext === '.png' || ext === '.jpg' || ext === '.jpeg' || ext === '.gif' || ext === '.svg') {
          const type = ext === '.svg' ? 'image/svg+xml' : `image/${ext.slice(1)}`;
          res.setHeader('Content-Type', type);
        }
        
        // Reasonable caching for static assets from root
        res.setHeader('Cache-Control', ext === '.json' ? 'no-cache' : 'public, max-age=86400');
        res.sendFile(filePath);
      } else {
        next();
      }
    } else {
      next();
    }
  });
  
  // Serve index.html for all other routes (React Router will handle routing)
  app.get('*', (req, res) => {
    // Ensure correct content type for HTML
    res.setHeader('Content-Type', 'text/html; charset=utf-8');
    res.sendFile(path.join(__dirname, '../../frontend/build/index.html'));
  });
} else {
  // 404 handler for development
  app.use('*', (req, res) => {
    res.status(404).json({error: 'Route not found'});
  });
}

// Start server
const startServer = async () => {
  try {
    // Connect to database (optional)
    try {
      await connectDB();
      // Run database migrations
      await runMigrations();
    } catch (dbError) {
      console.log('⚠️ Database connection failed, running in development mode');
      console.log('ℹ️ Set DATABASE_URL environment variable to enable database features');
    }
    
    // Connect to Redis (optional)
    try {
      await connectRedis();
    } catch (redisError) {
      console.log('⚠️ Redis connection failed, using in-memory storage');
    }
    
    // Start server
    app.listen(PORT, () => {
      console.log(`🚀 Server running on port ${PORT}`);
      console.log(`🌐 Health check: http://localhost:${PORT}/health`);
      if (process.env.NODE_ENV === 'production') {
        console.log(`📱 Frontend: http://localhost:${PORT}`);
      } else {
        console.log(`📱 Frontend: http://localhost:3000`);
      }
    });
  } catch (error) {
    console.error('❌ Failed to start server:', error);
    console.error('Error details:', error.message);
    console.error('Stack trace:', error.stack);
    process.exit(1);
  }
};

// Graceful shutdown
const gracefulShutdown = async (signal) => {
  console.log(`\n🛑 Received ${signal}. Starting graceful shutdown...`);

  try {
    await closePool();
    await closeRedis();
    console.log('✅ Graceful shutdown completed');
    process.exit(0);
  } catch (error) {
    console.error('❌ Error during shutdown:', error);
    process.exit(1);
  }
};

process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
process.on('SIGINT', () => gracefulShutdown('SIGINT'));

// Start the server
startServer();
