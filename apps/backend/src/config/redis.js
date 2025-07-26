const logger = require('../utils/logger');

// Try to use real Redis, fallback to in-memory
let redisClient = null;
let useRealRedis = false;

// Initialize Redis client
const initializeRedis = async () => {
  try {
    if (process.env.REDIS_URL && process.env.NODE_ENV === 'production') {
      const redis = require('redis');
      redisClient = redis.createClient({
        url: process.env.REDIS_URL,
        socket: {
          reconnectStrategy: (retries) => {
            if (retries > 10) {
              logger.error('Redis reconnection failed after 10 attempts');
              return false;
            }
            return Math.min(retries * 100, 3000);
          }
        }
      });

      redisClient.on('error', (err) => {
        logger.error('Redis client error:', err);
      });

      redisClient.on('connect', () => {
        logger.info('Connected to Redis');
        useRealRedis = true;
      });

      redisClient.on('ready', () => {
        logger.info('Redis client ready');
      });

      await redisClient.connect();
      return true;
    } else {
      logger.info('Using in-memory storage (Redis disabled or not configured)');
      return false;
    }
  } catch (error) {
    logger.warn('Failed to connect to Redis, using in-memory storage:', error.message);
    return false;
  }
};

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

const connectRedis = async () => {
  await initializeRedis();
  return Promise.resolve();
};

// Cache functions with Redis fallback
const setCache = async (key, value, expireTime = 3600) => {
  try {
    if (useRealRedis && redisClient) {
      await redisClient.setEx(key, expireTime, JSON.stringify(value));
      logger.debug(`Redis cache set: ${key}`);
    } else {
      const expiresAt = Date.now() + (expireTime * 1000);
      memoryStore.set(key, { value, expiresAt });
      logger.debug(`Memory cache set: ${key}`);
    }
  } catch (error) {
    logger.error('Cache set error:', error);
    // Fallback to memory
    const expiresAt = Date.now() + (expireTime * 1000);
    memoryStore.set(key, { value, expiresAt });
  }
};

const getCache = async (key) => {
  try {
    if (useRealRedis && redisClient) {
      const data = await redisClient.get(key);
      if (data) {
        logger.debug(`Redis cache hit: ${key}`);
        return JSON.parse(data);
      }
      logger.debug(`Redis cache miss: ${key}`);
      return null;
    } else {
      const item = memoryStore.get(key);
      if (item && (!item.expiresAt || item.expiresAt > Date.now())) {
        logger.debug(`Memory cache hit: ${key}`);
        return item.value;
      }
      logger.debug(`Memory cache miss: ${key}`);
      return null;
    }
  } catch (error) {
    logger.error('Cache get error:', error);
    return null;
  }
};

const deleteCache = async (key) => {
  try {
    if (useRealRedis && redisClient) {
      await redisClient.del(key);
      logger.debug(`Redis cache deleted: ${key}`);
    } else {
      memoryStore.delete(key);
      logger.debug(`Memory cache deleted: ${key}`);
    }
  } catch (error) {
    logger.error('Cache delete error:', error);
  }
};

const clearCache = async () => {
  try {
    if (useRealRedis && redisClient) {
      await redisClient.flushDb();
      logger.info('Redis cache cleared');
    } else {
      memoryStore.clear();
      logger.info('Memory cache cleared');
    }
  } catch (error) {
    logger.error('Cache clear error:', error);
  }
};

// Session management with Redis fallback
const setSession = async (sessionId, userData, expireTime = 86400) => {
  try {
    if (useRealRedis && redisClient) {
      await redisClient.setEx(sessionId, expireTime, JSON.stringify(userData));
      logger.debug(`Redis session set: ${sessionId}`);
    } else {
      const expiresAt = Date.now() + (expireTime * 1000);
      sessionStore.set(sessionId, { userData, expiresAt });
      logger.debug(`Memory session set: ${sessionId}`);
    }
  } catch (error) {
    logger.error('Session set error:', error);
    // Fallback to memory
    const expiresAt = Date.now() + (expireTime * 1000);
    sessionStore.set(sessionId, { userData, expiresAt });
  }
};

const getSession = async (sessionId) => {
  try {
    if (useRealRedis && redisClient) {
      const data = await redisClient.get(sessionId);
      if (data) {
        return JSON.parse(data);
      }
      return null;
    } else {
      const item = sessionStore.get(sessionId);
      if (item && (!item.expiresAt || item.expiresAt > Date.now())) {
        return item.userData;
      }
      return null;
    }
  } catch (error) {
    logger.error('Session get error:', error);
    return null;
  }
};

const deleteSession = async (sessionId) => {
  try {
    if (useRealRedis && redisClient) {
      await redisClient.del(sessionId);
      logger.debug(`Redis session deleted: ${sessionId}`);
    } else {
      sessionStore.delete(sessionId);
      logger.debug(`Memory session deleted: ${sessionId}`);
    }
  } catch (error) {
    logger.error('Session delete error:', error);
  }
};

// Graceful shutdown
const closeRedis = async () => {
  try {
    if (redisClient) {
      await redisClient.quit();
      logger.info('Redis connection closed');
    }
  } catch (error) {
    logger.error('Error closing Redis connection:', error);
  }
};

// Handle graceful shutdown
process.on('SIGTERM', closeRedis);
process.on('SIGINT', closeRedis);

module.exports = {
  connectRedis,
  setCache,
  getCache,
  deleteCache,
  clearCache,
  setSession,
  getSession,
  deleteSession,
  redisClient,
  closeRedis
}; 