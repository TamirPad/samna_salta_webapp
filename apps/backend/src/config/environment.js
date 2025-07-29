const path = require('path');

// Environment configuration
const config = {
  // Server configuration
  NODE_ENV: process.env.NODE_ENV || 'development',
  PORT: parseInt(process.env.PORT) || 3001,

  // Database configuration
  DATABASE_URL: process.env.DATABASE_URL,
  DB_HOST: process.env.DB_HOST,
  DB_PORT: parseInt(process.env.DB_PORT) || 5432,
  DB_NAME: process.env.DB_NAME,
  DB_USER: process.env.DB_USER,
  DB_PASSWORD: process.env.DB_PASSWORD,

  // Authentication
  JWT_SECRET: process.env.JWT_SECRET || 'dev-secret-key-change-in-production',
  JWT_EXPIRES_IN: process.env.JWT_EXPIRES_IN || '7d',

  // CORS configuration
  FRONTEND_URL: process.env.FRONTEND_URL || 'http://localhost:3000',

  // Redis configuration
  REDIS_URL: process.env.REDIS_URL,

  // Logging
  LOG_LEVEL: process.env.LOG_LEVEL || 'info',

  // File upload
  MAX_FILE_SIZE: parseInt(process.env.MAX_FILE_SIZE) || 5 * 1024 * 1024, // 5MB
  UPLOAD_PATH: process.env.UPLOAD_PATH || path.join(__dirname, '../../public/uploads'),

  // Rate limiting
  RATE_LIMIT_WINDOW_MS: parseInt(process.env.RATE_LIMIT_WINDOW_MS) || 15 * 60 * 1000, // 15 minutes
  RATE_LIMIT_MAX_REQUESTS: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS) || 100,

  // Business settings
  BUSINESS_NAME: process.env.BUSINESS_NAME || 'Samna Salta',
  CURRENCY: process.env.CURRENCY || 'ILS',
  DELIVERY_CHARGE: parseFloat(process.env.DELIVERY_CHARGE) || 10.0
};

// Validation
const validateConfig = () => {
  const required = ['JWT_SECRET'];
  const missing = required.filter(key => !config[key]);

  if (missing.length > 0) {
    console.warn(`⚠️ Missing required environment variables: ${missing.join(', ')}`);
  }

  // Warn about development mode
  if (!config.DATABASE_URL) {
    console.warn('⚠️ DATABASE_URL not set - running in development mode');
  }

  return config;
};

// Helper functions
const isDevelopment = () => config.NODE_ENV === 'development';
const isProduction = () => config.NODE_ENV === 'production';
const isTest = () => config.NODE_ENV === 'test';

module.exports = {
  ...validateConfig(),
  isDevelopment,
  isProduction,
  isTest
};
