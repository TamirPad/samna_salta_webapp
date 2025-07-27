const logger = require('../utils/logger');

// Environment validation
const validateEnvironment = () => {
  const errors = [];
  const warnings = [];

  // Required environment variables
  const required = [
    'JWT_SECRET'
  ];

  // Optional but recommended for production
  const recommended = [
    'DB_HOST',
    'DB_NAME',
    'DB_USER',
    'DB_PASSWORD',
    'REDIS_URL',
    'FRONTEND_URL',
    'STRIPE_SECRET_KEY',
    'CLOUDINARY_CLOUD_NAME',
    'CLOUDINARY_API_KEY',
    'CLOUDINARY_API_SECRET'
  ];

  // Check required variables
  required.forEach(varName => {
    if (!process.env[varName]) {
      errors.push(`Missing required environment variable: ${varName}`);
    }
  });

  // Check recommended variables in production
  if (process.env.NODE_ENV === 'production') {
    recommended.forEach(varName => {
      if (!process.env[varName]) {
        warnings.push(`Missing recommended environment variable for production: ${varName}`);
      }
    });

      // Validate JWT secret strength
  if (process.env.JWT_SECRET && process.env.JWT_SECRET.length < 32) {
    errors.push('JWT_SECRET must be at least 32 characters long in production');
  }
  
  // Validate JWT secret complexity in production
  if (process.env.JWT_SECRET && process.env.NODE_ENV === 'production') {
    const hasUpperCase = /[A-Z]/.test(process.env.JWT_SECRET);
    const hasLowerCase = /[a-z]/.test(process.env.JWT_SECRET);
    const hasNumbers = /\d/.test(process.env.JWT_SECRET);
    const hasSpecialChars = /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(process.env.JWT_SECRET);
    
    if (!hasUpperCase || !hasLowerCase || !hasNumbers || !hasSpecialChars) {
      errors.push('JWT_SECRET must contain uppercase, lowercase, numbers, and special characters in production');
    }
  }
  }

  // Validate database configuration
  if (process.env.NODE_ENV === 'production') {
    if (!process.env.SUPABASE_CONNECTION_STRING && 
        (!process.env.DB_HOST || !process.env.DB_NAME || !process.env.DB_USER || !process.env.DB_PASSWORD)) {
      errors.push('Database configuration is required in production. Either set SUPABASE_CONNECTION_STRING or all DB_* variables');
    }
  }

  // Validate Redis configuration
  if (process.env.NODE_ENV === 'production' && !process.env.REDIS_URL) {
    warnings.push('REDIS_URL is recommended for production to enable session management and caching');
  }

  // Validate CORS configuration
  if (process.env.NODE_ENV === 'production' && !process.env.FRONTEND_URL) {
    warnings.push('FRONTEND_URL is recommended for production to configure CORS properly');
  }

  // Log errors and warnings
  if (errors.length > 0) {
    logger.error('Environment validation failed:');
    errors.forEach(error => logger.error(`  - ${error}`));
    return false;
  }

  if (warnings.length > 0) {
    logger.warn('Environment validation warnings:');
    warnings.forEach(warning => logger.warn(`  - ${warning}`));
  }

  logger.info('Environment validation passed');
  return true;
};

// Validate specific environment variable
const validateEnvVar = (name, value, options = {}) => {
  const { required = false, minLength = 0, pattern = null, customValidator = null } = options;

  if (required && !value) {
    return { valid: false, error: `${name} is required` };
  }

  if (value && minLength > 0 && value.length < minLength) {
    return { valid: false, error: `${name} must be at least ${minLength} characters long` };
  }

  if (value && pattern && !pattern.test(value)) {
    return { valid: false, error: `${name} format is invalid` };
  }

  if (value && customValidator) {
    const customResult = customValidator(value);
    if (!customResult.valid) {
      return customResult;
    }
  }

  return { valid: true };
};

// Validate JWT secret
const validateJwtSecret = (secret) => {
  if (process.env.NODE_ENV === 'production' && secret.length < 32) {
    return { valid: false, error: 'JWT_SECRET must be at least 32 characters long in production' };
  }
  return { valid: true };
};

// Validate database URL
const validateDatabaseUrl = (url) => {
  if (url && !url.startsWith('postgresql://') && !url.startsWith('postgres://')) {
    return { valid: false, error: 'Database URL must be a valid PostgreSQL connection string' };
  }
  return { valid: true };
};

// Validate Redis URL
const validateRedisUrl = (url) => {
  if (url && !url.startsWith('redis://') && !url.startsWith('rediss://')) {
    return { valid: false, error: 'Redis URL must be a valid Redis connection string' };
  }
  return { valid: true };
};

// Validate email
const validateEmail = (email) => {
  const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (email && !emailPattern.test(email)) {
    return { valid: false, error: 'Invalid email format' };
  }
  return { valid: true };
};

// Validate URL
const validateUrl = (url) => {
  try {
    new URL(url);
    return { valid: true };
  } catch {
    return { valid: false, error: 'Invalid URL format' };
  }
};

module.exports = {
  validateEnvironment,
  validateEnvVar,
  validateJwtSecret,
  validateDatabaseUrl,
  validateRedisUrl,
  validateEmail,
  validateUrl
}; 