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

const createPool = (config = null) => {
  if (pool) {
    pool.end();
  }
  
  const poolConfig = config || getDatabaseConfig();
  pool = new Pool(poolConfig);
  
  pool.on('error', (err) => {
    console.error('❌ Unexpected error on idle client', err);
    logger.error('Unexpected error on idle client', err);
  });
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

    // Try to resolve hostname to IPv4
    const { URL } = require('url');
    const { lookup } = require('dns').promises;
    
    try {
      const url = new URL(config.DATABASE_URL);
      console.log('🔧 Resolving hostname:', url.hostname);
      
      const addresses = await lookup(url.hostname, { family: 4 });
      console.log('✅ Resolved to IPv4:', addresses.address);
      
      // Create new connection string with IP
      const ipConnectionString = config.DATABASE_URL.replace(url.hostname, addresses.address);
      console.log('🔧 Using IP connection string (first 50 chars):', ipConnectionString.substring(0, 50) + '...');
      
      const ipDbConfig = {
        ...dbConfig,
        connectionString: ipConnectionString
      };
      
      // Test direct client connection with IP
      const { Client } = require('pg');
      const client = new Client(ipDbConfig);
      
      console.log('🔧 Testing direct connection with IP...');
      await client.connect();
      console.log('✅ Direct connection successful');
      await client.end();
      
      // Now create the pool with IP
      createPool(ipDbConfig);
      const poolClient = await pool.connect();
      console.log('✅ Pool connection established');
      poolClient.release();
      isConnected = true;
      isDevelopmentMode = false;
    } catch (resolveError) {
      console.error('❌ Failed to resolve hostname:', resolveError.message);
      throw resolveError;
    }
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
