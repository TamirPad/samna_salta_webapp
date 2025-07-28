const { Pool } = require('pg');
const logger = require('../utils/logger');

// Simple database configuration
const getDatabaseConfig = () => {
  return {
    connectionString: process.env.DATABASE_URL,
    host: process.env.DB_HOST,
    port: parseInt(process.env.DB_PORT) || 5432,
    database: process.env.DB_NAME,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false,
    max: 10,
    idleTimeoutMillis: 30000,
    connectionTimeoutMillis: 30000,
  };
};

let pool = null;
let isConnected = false;

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
    createPool();
    const client = await pool.connect();
    console.log('✅ Database connection established');
    client.release();
    isConnected = true;
  } catch (error) {
    console.error('❌ Database connection failed:', error.message);
    isConnected = false;
    throw error;
  }
};

const query = async (text, params) => {
  if (!pool) {
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
  closePool
}; 