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
if (process.env.NODE_ENV === 'test') {
  // Provide a test-friendly stub so tests can monkey-patch methods
  pool = {
    connect: async () => ({ release: () => {} }),
    query: async () => ({ rows: [], rowCount: 0 }),
    end: async () => {},
    options: {
      max: 20,
      idleTimeoutMillis: 30000,
      connectionTimeoutMillis: 2000,
      ssl: { rejectUnauthorized: false }
    }
  };
}
let isConnected = false;
let isDevelopmentMode = false;

const createPool = () => {
  if (!pool) {
    const dbConfig = getDatabaseConfig();
    pool = new Pool(dbConfig);
    
    pool.on('error', (err) => {
      console.error('Unexpected error on idle client', err);
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
    
    // Set the search path to use the new schema
    await client.query('SET search_path TO samna_salta_webapp, public');
    console.log('✅ Schema search path set to samna_salta_webapp');
    
    await client.end();
    
    // Now create the pool
    createPool();
    const poolClient = await pool.connect();
    
    // Set search path for the pool as well
    await poolClient.query('SET search_path TO samna_salta_webapp, public');
    
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
  if (!isConnected || isDevelopmentMode) {
    throw new Error('Database not connected - running in development mode');
  }

  const client = await pool.connect();
  try {
    // Ensure search path is set for each query
    await client.query('SET search_path TO samna_salta_webapp, public');
    const result = await client.query(text, params);
    return result;
  } finally {
    client.release();
  }
};

const getClient = () => {
  if (!isConnected || isDevelopmentMode) {
    throw new Error('Database not connected - running in development mode');
  }
  return pool.connect();
};

const isConnectedToDB = () => isConnected && !isDevelopmentMode;

const isInDevelopmentMode = () => isDevelopmentMode;

// Gracefully close the pool
const closePool = async () => {
  try {
    if (pool) {
      await pool.end();
      pool = null;
    }
  } catch (_) {
    // ignore
  } finally {
    isConnected = false;
  }
};

module.exports = {
  connectDB,
  query,
  getClient,
  isConnectedToDB,
  isInDevelopmentMode,
  closePool
};

// Also expose pool for tests
Object.defineProperty(module.exports, 'pool', {
  enumerable: true,
  get() { return pool; },
  set(v) { pool = v; }
});
