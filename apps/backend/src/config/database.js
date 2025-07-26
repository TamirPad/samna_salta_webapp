const { Pool } = require('pg');
const logger = require('../utils/logger');

// Determine database configuration
const getDatabaseConfig = () => {
  // Check if using Supabase
  if (process.env.SUPABASE_CONNECTION_STRING) {
    return {
      connectionString: process.env.SUPABASE_CONNECTION_STRING,
      ssl: {
        rejectUnauthorized: false
      }
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

const pool = new Pool({
  ...getDatabaseConfig(),
  max: 20, // Maximum number of clients in the pool
  idleTimeoutMillis: 30000, // Close idle clients after 30 seconds
  connectionTimeoutMillis: 2000, // Return an error after 2 seconds if connection could not be established
  // Add connection retry logic
  connectionRetryAttempts: 3,
  connectionRetryDelay: 1000,
});

// Test the connection
pool.on('connect', () => {
  logger.info('Connected to PostgreSQL database');
});

pool.on('error', (err) => {
  logger.error('Unexpected error on idle client', err);
  // Don't exit process in production, let it handle reconnection
  if (process.env.NODE_ENV !== 'production') {
    process.exit(-1);
  }
});

const connectDB = async () => {
  try {
    const client = await pool.connect();
    logger.info('Database connection established successfully');
    client.release();
  } catch (error) {
    logger.error('Database connection failed:', error);
    // In production, don't throw immediately, allow retry
    if (process.env.NODE_ENV === 'production') {
      logger.warn('Database connection failed, will retry on next request');
      return;
    }
    throw error;
  }
};

// Helper function to run queries with retry logic
const query = async (text, params) => {
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
      logger.warn(`Query attempt ${attempt} failed:`, error.message);
      
      // Don't retry on certain errors
      if (error.code === '23505' || error.code === '23503' || error.code === '23502') {
        throw error;
      }
      
      if (attempt < maxRetries) {
        await new Promise(resolve => setTimeout(resolve, 1000 * attempt));
      }
    }
  }
  
  logger.error('Query failed after all retries:', lastError);
  throw lastError;
};

// Helper function to get a client for transactions
const getClient = () => {
  return pool.connect();
};

// Graceful shutdown
const closePool = async () => {
  try {
    await pool.end();
    logger.info('Database pool closed successfully');
  } catch (error) {
    logger.error('Error closing database pool:', error);
  }
};

// Handle graceful shutdown
process.on('SIGTERM', closePool);
process.on('SIGINT', closePool);

module.exports = {
  connectDB,
  query,
  getClient,
  pool,
  closePool
}; 