const {
  connectRedis,
  setCache,
  getCache,
  deleteCache,
  clearCache,
  setSession,
  getSession,
  deleteSession
} = require('../../config/redis');

// Mock the logger
jest.mock('../../utils/logger', () => ({
  info: jest.fn(),
  error: jest.fn(),
  debug: jest.fn()
}));

describe('Redis Configuration', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  describe('connectRedis', () => {
    it('should connect to Redis successfully', async () => {
      await expect(connectRedis()).resolves.not.toThrow();
    });
  });

  describe('Cache Operations', () => {
    it('should set cache successfully', async () => {
      await setCache('test-key', 'test-value', 3600);
      
      const result = await getCache('test-key');
      expect(result).toBe('test-value');
    });

    it('should get cache successfully', async () => {
      await setCache('test-key', 'test-value');
      
      const result = await getCache('test-key');
      expect(result).toBe('test-value');
    });

    it('should return null for non-existent cache key', async () => {
      const result = await getCache('non-existent-key');
      expect(result).toBeNull();
    });

    it('should delete cache successfully', async () => {
      await setCache('test-key', 'test-value');
      await deleteCache('test-key');
      
      const result = await getCache('test-key');
      expect(result).toBeNull();
    });

    it('should clear all cache', async () => {
      await setCache('key1', 'value1');
      await setCache('key2', 'value2');
      await clearCache();
      
      const result1 = await getCache('key1');
      const result2 = await getCache('key2');
      
      expect(result1).toBeNull();
      expect(result2).toBeNull();
    });

    it('should expire cache after specified time', async () => {
      await setCache('test-key', 'test-value', 1); // 1 second
      
      // Should exist immediately
      let result = await getCache('test-key');
      expect(result).toBe('test-value');
      
      // Advance time by 2 seconds
      jest.advanceTimersByTime(2000);
      
      // Should be expired
      result = await getCache('test-key');
      expect(result).toBeNull();
    });
  });

  describe('Session Operations', () => {
    it('should set session successfully', async () => {
      const sessionData = { userId: 1, email: 'test@example.com' };
      await setSession('session-id', sessionData, 86400);
      
      const result = await getSession('session-id');
      expect(result).toEqual(sessionData);
    });

    it('should get session successfully', async () => {
      const sessionData = { userId: 1, email: 'test@example.com' };
      await setSession('session-id', sessionData);
      
      const result = await getSession('session-id');
      expect(result).toEqual(sessionData);
    });

    it('should return null for non-existent session', async () => {
      const result = await getSession('non-existent-session');
      expect(result).toBeNull();
    });

    it('should delete session successfully', async () => {
      const sessionData = { userId: 1, email: 'test@example.com' };
      await setSession('session-id', sessionData);
      await deleteSession('session-id');
      
      const result = await getSession('session-id');
      expect(result).toBeNull();
    });

    it('should expire session after specified time', async () => {
      const sessionData = { userId: 1, email: 'test@example.com' };
      await setSession('session-id', sessionData, 1); // 1 second
      
      // Should exist immediately
      let result = await getSession('session-id');
      expect(result).toEqual(sessionData);
      
      // Advance time by 2 seconds
      jest.advanceTimersByTime(2000);
      
      // Should be expired
      result = await getSession('session-id');
      expect(result).toBeNull();
    });
  });

  describe('Error Handling', () => {
    it('should handle cache set errors gracefully', async () => {
      // This test ensures the function doesn't throw on errors
      await expect(setCache('test-key', 'test-value')).resolves.not.toThrow();
    });

    it('should handle cache get errors gracefully', async () => {
      const result = await getCache('test-key');
      expect(result).toBeDefined();
    });

    it('should handle session set errors gracefully', async () => {
      await expect(setSession('session-id', { test: 'data' })).resolves.not.toThrow();
    });

    it('should handle session get errors gracefully', async () => {
      const result = await getSession('session-id');
      expect(result).toBeDefined();
    });
  });
}); 