const { Pool } = require('pg');
const logger = require('../utils/logger');
const { getCache, setCache } = require('./redis');

const pool = new Pool({
  connectionString: process.env.SUPABASE_CONNECTION_STRING,
  max: 20, // Maximum number of clients in the pool
  idleTimeoutMillis: 30000, // Close idle clients after 30 seconds
  connectionTimeoutMillis: 2000, // Return an error after 2 seconds if connection could not be established
  ssl: {
    rejectUnauthorized: false // Required for Supabase
  }
});

// Test the connection
pool.on('connect', () => {
  logger.info('Connected to PostgreSQL database');
});

pool.on('error', (err) => {
  logger.error('Unexpected error on idle client', err);
  process.exit(-1);
});

const connectDB = async () => {
  try {
    const client = await pool.connect();
    logger.info('Database connection established');
    client.release();
  } catch (error) {
    logger.error('Database connection failed:', error);
    throw error;
  }
};

// Helper function to run queries
const query = async (text, params) => {
  const start = Date.now();
  try {
    const res = await pool.query(text, params);
    const duration = Date.now() - start;
    logger.debug('Executed query', { text, duration, rows: res.rowCount });
    return res;
  } catch (error) {
    logger.error('Query error:', error);
    throw error;
  }
};

// Helper function to get a client for transactions
const getClient = () => {
  return pool.connect();
};

module.exports = {
  connectDB,
  query,
  getClient,
  pool,
  getCache,
  setCache
}; 