const logger = require('../utils/logger');

// Simple in-memory storage for sessions and cache
const memoryStore = new Map();
const sessionStore = new Map();

// Clean up expired items every 5 minutes
const cleanupInterval = setInterval(() => {
  const now = Date.now();

  // Clean up cache
  for (const [key, value] of memoryStore.entries()) {
    if (value.expiresAt && value.expiresAt < now) {
      memoryStore.delete(key);
    }
  }

  // Clean up sessions
  for (const [key, value] of sessionStore.entries()) {
    if (value.expiresAt && value.expiresAt < now) {
      sessionStore.delete(key);
    }
  }
}, 5 * 60 * 1000);

// Clear interval on process exit
process.on('exit', () => {
  clearInterval(cleanupInterval);
});

// Initialize Redis (in-memory only)
const initializeRedis = async () => {
  logger.info('Using in-memory storage for sessions and cache');
  return true;
};

// Connect to Redis (in-memory only)
const connectRedis = async () => {
  try {
    await initializeRedis();
    logger.info('In-memory storage initialized successfully');
  } catch (error) {
    logger.error('Storage initialization failed:', error);
    throw error;
  }
};

// Check if storage is connected
const isRedisConnected = () => {
  return true; // In-memory is always "connected"
};

// Cache operations
const setCache = async (key, value, expireTime = 3600) => {
  try {
    const expiresAt = Date.now() + (expireTime * 1000);
    memoryStore.set(key, {value, expiresAt});
    return true;
  } catch (error) {
    logger.error('Failed to set cache:', error);
    return false;
  }
};

const getCache = async (key) => {
  try {
    const item = memoryStore.get(key);
    if (!item) {
      return null;
    }

    if (item.expiresAt && item.expiresAt < Date.now()) {
      memoryStore.delete(key);
      return null;
    }

    return item.value;
  } catch (error) {
    logger.error('Failed to get cache:', error);
    return null;
  }
};

const deleteCache = async (key) => {
  try {
    return memoryStore.delete(key);
  } catch (error) {
    logger.error('Failed to delete cache:', error);
    return false;
  }
};

const clearCache = async () => {
  try {
    memoryStore.clear();
    return true;
  } catch (error) {
    logger.error('Failed to clear cache:', error);
    return false;
  }
};

// Session operations
const setSession = async (sessionId, userData, expireTime = 86400) => {
  try {
    const expiresAt = Date.now() + (expireTime * 1000);
    sessionStore.set(sessionId, {userData, expiresAt});
    return true;
  } catch (error) {
    logger.error('Failed to set session:', error);
    return false;
  }
};

const getSession = async (sessionId) => {
  try {
    const item = sessionStore.get(sessionId);
    if (!item) {
      return null;
    }

    if (item.expiresAt && item.expiresAt < Date.now()) {
      sessionStore.delete(sessionId);
      return null;
    }

    return item.userData;
  } catch (error) {
    logger.error('Failed to get session:', error);
    return null;
  }
};

const deleteSession = async (sessionId) => {
  try {
    return sessionStore.delete(sessionId);
  } catch (error) {
    logger.error('Failed to delete session:', error);
    return false;
  }
};

// Close Redis (cleanup)
const closeRedis = async () => {
  try {
    clearInterval(cleanupInterval);
    memoryStore.clear();
    sessionStore.clear();
    logger.info('Storage cleaned up successfully');
  } catch (error) {
    logger.error('Failed to close storage:', error);
  }
};

module.exports = {
  connectRedis,
  isRedisConnected,
  setCache,
  getCache,
  deleteCache,
  clearCache,
  setSession,
  getSession,
  deleteSession,
  closeRedis
};
