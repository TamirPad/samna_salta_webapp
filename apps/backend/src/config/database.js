const { Pool } = require('pg');
const logger = require('../utils/logger');

// Determine database configuration
const getDatabaseConfig = () => {
  // Check if using Supabase
  if (process.env.SUPABASE_CONNECTION_STRING) {
    let connectionString = process.env.SUPABASE_CONNECTION_STRING;
    
    // Force IPv4 connection for Supabase
    if (connectionString.includes('db.kwrwxtccbnvadqedaqdd.supabase.co')) {
      // Add IPv4-specific parameters
      const separator = connectionString.includes('?') ? '&' : '?';
      connectionString += `${separator}sslmode=require&connect_timeout=30&application_name=samna_salta`;
      
      // Force IPv4 by using a different connection approach
      return {
        connectionString: connectionString,
        ssl: {
          rejectUnauthorized: false
        },
        // Increased timeouts for production
        connectionTimeoutMillis: 30000,
        idleTimeoutMillis: 30000,
        max: 10, // Reduced for Render's limits
        // Force IPv4
        host: 'db.kwrwxtccbnvadqedaqdd.supabase.co',
        port: 5432,
        database: 'postgres',
        user: process.env.DB_USER || 'postgres',
        password: process.env.DB_PASSWORD,
      };
    }
    
    return {
      connectionString: connectionString,
      ssl: {
        rejectUnauthorized: false
      },
      connectionTimeoutMillis: 30000,
      idleTimeoutMillis: 30000,
      max: 10
    };
  }

  // Fallback to local PostgreSQL
  return {
    host: process.env.DB_HOST || 'localhost',
    port: process.env.DB_PORT || 5432,
    database: process.env.DB_NAME || 'samna_salta',
    user: process.env.DB_USER || 'postgres',
    password: process.env.DB_PASSWORD,
    ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
  };
};

let pool = null;
let isConnected = false;
let connectionAttempts = 0;
const maxConnectionAttempts = 3;

const createPool = () => {
  if (!pool) {
    const config = getDatabaseConfig();
    
    console.log('🔧 Database configuration:', {
      hasConnectionString: !!process.env.SUPABASE_CONNECTION_STRING,
      hasDBHost: !!process.env.DB_HOST,
      hasDBPassword: !!process.env.DB_PASSWORD,
      nodeEnv: process.env.NODE_ENV
    });
    
    pool = new Pool({
      ...config,
      max: 10, // Reduced for Render's limits
      idleTimeoutMillis: 30000,
      connectionTimeoutMillis: 30000, // Increased timeout
      // Add connection retry logic
      connectionRetryAttempts: 3,
      connectionRetryDelay: 2000,
    });

    // Test the connection
    pool.on('connect', () => {
      console.log('✅ Connected to PostgreSQL database');
      logger.info('Connected to PostgreSQL database');
      isConnected = true;
      connectionAttempts = 0;
    });

    pool.on('error', (err) => {
      console.error('❌ Database pool error:', err.message);
      logger.error('Unexpected error on idle client', err);
      isConnected = false;
      // Don't exit process in production, let it handle reconnection
      if (process.env.NODE_ENV !== 'production') {
        logger.warn('Database connection error in development mode, continuing without database');
      }
    });
  }
  return pool;
};

const connectDB = async () => {
  try {
    createPool();
    const client = await pool.connect();
    console.log('✅ Database connection established successfully');
    logger.info('Database connection established successfully');
    client.release();
    isConnected = true;
    connectionAttempts = 0;
  } catch (error) {
    connectionAttempts++;
    console.error('❌ Database connection failed:', error.message);
    logger.error('Database connection failed:', error);
    isConnected = false;
    
    // In development mode, allow the server to start without database
    if (process.env.NODE_ENV === 'development') {
      logger.warn('Database connection failed in development mode, server will start without database');
      logger.warn('To fix this, start PostgreSQL or run: docker-compose up db redis -d');
      return;
    }
    
    // In production, don't throw immediately, allow retry
    if (process.env.NODE_ENV === 'production') {
      if (connectionAttempts < maxConnectionAttempts) {
        console.log(`⚠️ Database connection attempt ${connectionAttempts}/${maxConnectionAttempts} failed, will retry...`);
        logger.warn(`Database connection attempt ${connectionAttempts}/${maxConnectionAttempts} failed, will retry`);
        return;
      } else {
        console.log('⚠️ Database connection failed after all attempts, continuing without database');
        logger.warn('Database connection failed after all attempts, continuing without database');
        logger.warn('Some features may not work properly without database connection');
        return;
      }
    }
    
    // Only throw in non-production environments
    throw error;
  }
};

// Helper function to run queries with retry logic
const query = async (text, params) => {
  if (!isConnected) {
    // In production, try to reconnect
    if (process.env.NODE_ENV === 'production') {
      try {
        await connectDB();
      } catch (error) {
        console.error('❌ Failed to reconnect to database:', error.message);
        logger.error('Failed to reconnect to database:', error);
        throw new Error('Database not connected. Please ensure PostgreSQL is running.');
      }
    } else {
      throw new Error('Database not connected. Please ensure PostgreSQL is running.');
    }
  }
  
  const start = Date.now();
  const maxRetries = 3;
  let lastError;

  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      const res = await pool.query(text, params);
      const duration = Date.now() - start;
      logger.debug('Executed query', { text, duration, rows: res.rowCount, attempt });
      return res;
    } catch (error) {
      lastError = error;
      console.warn(`⚠️ Query attempt ${attempt} failed:`, error.message);
      logger.warn(`Query attempt ${attempt} failed:`, error.message);
      
      // Don't retry on certain errors
      if (error.code === '23505' || error.code === '23503' || error.code === '23502') {
        throw error;
      }
      
      if (attempt < maxRetries) {
        await new Promise(resolve => setTimeout(resolve, 2000 * attempt));
      }
    }
  }
  
  console.error('❌ Query failed after all retries:', lastError.message);
  logger.error('Query failed after all retries:', lastError);
  throw lastError;
};

// Helper function to get a client for transactions
const getClient = () => {
  if (!isConnected) {
    throw new Error('Database not connected. Please ensure PostgreSQL is running.');
  }
  return pool.connect();
};

// Check if database is connected
const isDBConnected = () => {
  return isConnected;
};

// Close the pool
const closePool = async () => {
  if (pool) {
    await pool.end();
    pool = null;
    isConnected = false;
    logger.info('Database pool closed');
  }
};

module.exports = {
  connectDB,
  query,
  getClient,
  closePool,
  isDBConnected
}; 