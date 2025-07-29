const {Pool} = require('pg');
const logger = require('../utils/logger');
const config = require('./environment');

// Simple database configuration
const getDatabaseConfig = () => {
  return {
    connectionString: config.DATABASE_URL,
    host: config.DB_HOST,
    port: config.DB_PORT,
    database: config.DB_NAME,
    user: config.DB_USER,
    password: config.DB_PASSWORD,
    ssl: config.isProduction() ? {rejectUnauthorized: false} : false,
    max: 10,
    idleTimeoutMillis: 30000,
    connectionTimeoutMillis: 30000
  };
};

let pool = null;
let isConnected = false;
let isDevelopmentMode = false;

const createPool = () => {
  if (!pool) {
    const config = getDatabaseConfig();
    pool = new Pool(config);

    pool.on('connect', () => {
      console.log('✅ Connected to PostgreSQL database');
      isConnected = true;
    });

    pool.on('error', (err) => {
      console.error('❌ Database pool error:', err.message);
      isConnected = false;
    });
  }
  return pool;
};

const connectDB = async () => {
  try {
    // Check if DATABASE_URL is provided
    if (!config.DATABASE_URL) {
      console.log('⚠️ No DATABASE_URL provided, running in development mode with sample data');
      isConnected = false;
      isDevelopmentMode = true;
      return;
    }

    createPool();
    const client = await pool.connect();
    console.log('✅ Database connection established');
    client.release();
    isConnected = true;
    isDevelopmentMode = false;
  } catch (error) {
    console.error('❌ Database connection failed:', error.message);
    console.log('⚠️ Running in development mode with sample data');
    isConnected = false;
    isDevelopmentMode = true;
    // Don't throw error, just log and continue
  }
};

const query = async (text, params) => {
  if (!pool || !isConnected) {
    if (isDevelopmentMode) {
      throw new Error('Database not connected - running in development mode');
    }
    throw new Error('Database not connected');
  }

  try {
    const res = await pool.query(text, params);
    return res;
  } catch (error) {
    logger.error('Database query error:', error);
    throw error;
  }
};

const isDBConnected = () => {
  return isConnected;
};

const isDevelopmentModeEnabled = () => {
  return isDevelopmentMode;
};

const closePool = async () => {
  if (pool) {
    await pool.end();
    pool = null;
    isConnected = false;
    console.log('✅ Database pool closed');
  }
};

module.exports = {
  connectDB,
  query,
  isDBConnected,
  isDevelopmentModeEnabled,
  closePool
};
