const {Pool} = require('pg');
const logger = require('../utils/logger');
const config = require('./environment');

// Simple database configuration
const getDatabaseConfig = () => {
  // Force IPv4 by adding family=4 parameter to connection string
  let connectionString = config.DATABASE_URL;
  if (config.isProduction() && connectionString) {
    // Add family=4 to force IPv4
    const separator = connectionString.includes('?') ? '&' : '?';
    connectionString += `${separator}family=4`;
  }
  
  const dbConfig = {
    connectionString: connectionString,
    max: 10,
    idleTimeoutMillis: 30000,
    connectionTimeoutMillis: 30000
  };
  
  // SSL configuration for Supabase
  if (config.isProduction()) {
    dbConfig.ssl = {
      rejectUnauthorized: false
    };
  }

  return dbConfig;
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

    console.log('🔧 Attempting to connect to database...');
    console.log('🔧 DATABASE_URL (first 50 chars):', config.DATABASE_URL.substring(0, 50) + '...');
    
    const dbConfig = getDatabaseConfig();
    console.log('📊 Database config:', {
      connectionString: dbConfig.connectionString ? 'Set' : 'Not set',
      ssl: dbConfig.ssl
    });

    // Test direct client connection
    const { Client } = require('pg');
    const client = new Client(dbConfig);
    
    console.log('🔧 Testing direct connection...');
    await client.connect();
    console.log('✅ Direct connection successful');
    await client.end();
    
    // Now create the pool
    createPool();
    const poolClient = await pool.connect();
    console.log('✅ Pool connection established');
    poolClient.release();
    isConnected = true;
    isDevelopmentMode = false;
  } catch (error) {
    console.error('❌ Database connection failed:', error.message);
    console.error('❌ Error details:', error);
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
