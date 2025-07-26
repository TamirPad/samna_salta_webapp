const logger = require('../utils/logger');

// Simple in-memory storage for sessions and cache
const memoryStore = new Map();
const sessionStore = new Map();

// Clean up expired items every 5 minutes
setInterval(() => {
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

const connectRedis = async () => {
  logger.info('Using in-memory storage (Redis disabled)');
  return Promise.resolve();
};

// Simple cache functions
const setCache = async (key, value, expireTime = 3600) => {
  try {
    const expiresAt = Date.now() + (expireTime * 1000);
    memoryStore.set(key, { value, expiresAt });
    logger.debug(`Cache set: ${key}`);
  } catch (error) {
    logger.error('Cache set error:', error);
  }
};

const getCache = async (key) => {
  try {
    const item = memoryStore.get(key);
    if (item && (!item.expiresAt || item.expiresAt > Date.now())) {
      logger.debug(`Cache hit: ${key}`);
      return item.value;
    }
    logger.debug(`Cache miss: ${key}`);
    return null;
  } catch (error) {
    logger.error('Cache get error:', error);
    return null;
  }
};

const deleteCache = async (key) => {
  try {
    memoryStore.delete(key);
    logger.debug(`Cache deleted: ${key}`);
  } catch (error) {
    logger.error('Cache delete error:', error);
  }
};

const clearCache = async () => {
  try {
    memoryStore.clear();
    logger.info('Cache cleared');
  } catch (error) {
    logger.error('Cache clear error:', error);
  }
};

// Session management
const setSession = async (sessionId, userData, expireTime = 86400) => {
  try {
    const expiresAt = Date.now() + (expireTime * 1000);
    sessionStore.set(sessionId, { userData, expiresAt });
    logger.debug(`Session set: ${sessionId}`);
  } catch (error) {
    logger.error('Session set error:', error);
  }
};

const getSession = async (sessionId) => {
  try {
    const item = sessionStore.get(sessionId);
    if (item && (!item.expiresAt || item.expiresAt > Date.now())) {
      return item.userData;
    }
    return null;
  } catch (error) {
    logger.error('Session get error:', error);
    return null;
  }
};

const deleteSession = async (sessionId) => {
  try {
    sessionStore.delete(sessionId);
    logger.debug(`Session deleted: ${sessionId}`);
  } catch (error) {
    logger.error('Session delete error:', error);
  }
};

module.exports = {
  connectRedis,
  setCache,
  getCache,
  deleteCache,
  clearCache,
  setSession,
  getSession,
  deleteSession,
  redisClient: null
}; 