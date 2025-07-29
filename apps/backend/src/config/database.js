const {Pool} = require('pg');
const logger = require('../utils/logger');
const config = require('./environment');

// Simple database configuration
const getDatabaseConfig = () => {
  // Parse DATABASE_URL to extract components
  let dbConfig;
  
  if (config.DATABASE_URL) {
    try {
      const url = new URL(config.DATABASE_URL);
      dbConfig = {
        host: url.hostname,
        port: parseInt(url.port) || 5432,
        database: url.pathname.slice(1), // Remove leading slash
        user: url.username,
        password: url.password,
        max: 10,
        idleTimeoutMillis: 30000,
        connectionTimeoutMillis: 30000
      };
      
      // Force IPv4 connection
      dbConfig.host = url.hostname;
      
      // SSL configuration for Supabase
      if (config.isProduction()) {
        dbConfig.ssl = {
          rejectUnauthorized: false
        };
      }
    } catch (error) {
      console.error('❌ Error parsing DATABASE_URL:', error);
      // Fallback to individual env vars
      dbConfig = {
        connectionString: config.DATABASE_URL,
        max: 10,
        idleTimeoutMillis: 30000,
        connectionTimeoutMillis: 30000
      };
      
      if (config.isProduction()) {
        dbConfig.ssl = {
          rejectUnauthorized: false
        };
      }
    }
  } else {
    // Fallback to individual environment variables
    dbConfig = {
      host: config.DB_HOST,
      port: config.DB_PORT,
      database: config.DB_NAME,
      user: config.DB_USER,
      password: config.DB_PASSWORD,
      max: 10,
      idleTimeoutMillis: 30000,
      connectionTimeoutMillis: 30000
    };
    
    if (config.isProduction()) {
      dbConfig.ssl = {
        rejectUnauthorized: false
      };
    }
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
    console.log('📊 Parsed database config:', {
      host: dbConfig.host,
      port: dbConfig.port,
      database: dbConfig.database,
      user: dbConfig.user,
      ssl: dbConfig.ssl
    });

    createPool();
    const client = await pool.connect();
    console.log('✅ Database connection established');
    client.release();
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
