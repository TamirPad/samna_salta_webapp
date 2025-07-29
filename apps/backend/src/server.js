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

const app = express();

// Trust proxy for rate limiting behind load balancers
app.set('trust proxy', 1);

const PORT = process.env.PORT || 3001;

// Security middleware
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      scriptSrc: ["'self'", "'unsafe-inline'"],
      styleSrc: ["'self'", "'unsafe-inline'", "https://fonts.googleapis.com"],
      fontSrc: ["'self'", "data:", "https://fonts.gstatic.com"],
      imgSrc: ["'self'", "data:", "https:", "http:"],
      connectSrc: ["'self'"],
      mediaSrc: ["'self'"],
      objectSrc: ["'none'"],
      upgradeInsecureRequests: []
    }
  }
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

// Simple rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  message: 'Too many requests from this IP, please try again later.'
});
app.use('/api/', limiter);

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
  
  // Serve static files only for actual static file requests
  app.use((req, res, next) => {
    // Check if this is a static file request
    if (req.path.match(/\.(js|css|json|png|jpg|jpeg|gif|svg|ico)$/)) {
      // Serve static files with proper MIME types
      if (req.path.startsWith('/static/')) {
        express.static(path.join(frontendBuildPath, 'static'), {
          setHeaders: (res, path) => {
            if (path.endsWith('.js')) {
              res.setHeader('Content-Type', 'application/javascript');
            } else if (path.endsWith('.css')) {
              res.setHeader('Content-Type', 'text/css');
            }
          }
        })(req, res, next);
      } else {
        // Serve other static files (manifest.json, favicon.ico, etc.)
        express.static(frontendBuildPath, {
          setHeaders: (res, path) => {
            if (path.endsWith('.json')) {
              res.setHeader('Content-Type', 'application/json');
            } else if (path.endsWith('.png') || path.endsWith('.jpg') || path.endsWith('.jpeg') || path.endsWith('.gif') || path.endsWith('.svg')) {
              res.setHeader('Content-Type', `image/${path.split('.').pop()}`);
            }
          }
        })(req, res, next);
      }
    } else {
      next();
    }
  });
  
  // Serve index.html for all other routes (React Router will handle routing)
  app.get('*', (req, res) => {
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
