import {
  isOnline,
  supportsServiceWorker,
  supportsPushNotifications,
  retryWithBackoff,
  NetworkMonitor,
  apiRequest,
  checkUrlReachability,
  DEFAULT_RETRY_CONFIG,
  type RetryConfig,
} from './networkUtils';

// Mock fetch
global.fetch = jest.fn();

// Mock navigator
Object.defineProperty(navigator, 'onLine', {
  writable: true,
  value: true,
});

Object.defineProperty(navigator, 'serviceWorker', {
  writable: true,
  value: {},
});

// Mock window
Object.defineProperty(window, 'PushManager', {
  writable: true,
  value: {},
});

describe('Network Utils', () => {
  // Increase timeout for all tests in this describe block
  jest.setTimeout(10000);

  beforeEach(() => {
    // Reset all mocks before each test
    jest.clearAllMocks();

    // Mock fetch globally
    global.fetch = jest.fn();

    // Mock setTimeout
    jest.spyOn(global, 'setTimeout');

    // Mock clearTimeout
    jest.spyOn(global, 'clearTimeout');
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  describe('isOnline', () => {
    it('should return true when navigator.onLine is true', () => {
      Object.defineProperty(navigator, 'onLine', {
        writable: true,
        value: true,
      });

      expect(isOnline()).toBe(true);
    });

    it('should return false when navigator.onLine is false', () => {
      Object.defineProperty(navigator, 'onLine', {
        writable: true,
        value: false,
      });

      expect(isOnline()).toBe(false);
    });
  });

  describe('supportsServiceWorker', () => {
    it('should return true when serviceWorker is supported', () => {
      Object.defineProperty(navigator, 'serviceWorker', {
        writable: true,
        value: {},
      });

      expect(supportsServiceWorker()).toBe(true);
    });

    it('should return false when serviceWorker is not supported', () => {
      // Store original value
      const originalServiceWorker = navigator.serviceWorker;

      // Mock as undefined
      Object.defineProperty(navigator, 'serviceWorker', {
        writable: true,
        value: undefined,
      });

      expect(supportsServiceWorker()).toBe(false);

      // Restore original value
      Object.defineProperty(navigator, 'serviceWorker', {
        writable: true,
        value: originalServiceWorker,
      });
    });
  });

  describe('supportsPushNotifications', () => {
    it('should return true when PushManager is supported', () => {
      Object.defineProperty(window, 'PushManager', {
        writable: true,
        value: {},
      });

      expect(supportsPushNotifications()).toBe(true);
    });

    it('should return false when PushManager is not supported', () => {
      // Store original value
      const originalPushManager = window.PushManager;

      // Mock as undefined
      Object.defineProperty(window, 'PushManager', {
        writable: true,
        value: undefined,
      });

      expect(supportsPushNotifications()).toBe(false);

      // Restore original value
      Object.defineProperty(window, 'PushManager', {
        writable: true,
        value: originalPushManager,
      });
    });
  });

  describe('retryWithBackoff', () => {
    it('should succeed on first attempt', async () => {
      const mockFn = jest.fn().mockResolvedValue('success');

      const result = await retryWithBackoff(mockFn);

      expect(result).toBe('success');
      expect(mockFn).toHaveBeenCalledTimes(1);
    });

    it('should retry and succeed on second attempt', async () => {
      const mockFn = jest
        .fn()
        .mockRejectedValueOnce(new Error('First failure'))
        .mockResolvedValue('success');

      const result = await retryWithBackoff(mockFn);

      expect(result).toBe('success');
      expect(mockFn).toHaveBeenCalledTimes(2);
    });

    it('should fail after max retries', async () => {
      const mockFn = jest.fn().mockRejectedValue(new Error('Always fails'));

      await expect(retryWithBackoff(mockFn)).rejects.toThrow('Always fails');
      expect(mockFn).toHaveBeenCalledTimes(4); // maxRetries + 1
    });

    it('should use custom retry configuration', async () => {
      const mockFn = jest.fn().mockRejectedValue(new Error('Always fails'));
      const customConfig: Partial<RetryConfig> = {
        maxRetries: 1,
        baseDelay: 100,
      };

      await expect(retryWithBackoff(mockFn, customConfig)).rejects.toThrow(
        'Always fails'
      );
      expect(mockFn).toHaveBeenCalledTimes(2); // maxRetries + 1
    });

    it('should respect max delay', async () => {
      const mockFn = jest.fn().mockRejectedValue(new Error('Always fails'));
      const customConfig: Partial<RetryConfig> = {
        maxRetries: 2,
        baseDelay: 1000,
        maxDelay: 1500,
        backoffMultiplier: 2,
      };

      await expect(retryWithBackoff(mockFn, customConfig)).rejects.toThrow(
        'Always fails'
      );

      expect(mockFn).toHaveBeenCalledTimes(3);
    });

    it('should handle non-Error objects', async () => {
      const mockFn = jest.fn().mockRejectedValue('String error');

      await expect(retryWithBackoff(mockFn)).rejects.toThrow('String error');
    });
  });

  describe('NetworkMonitor', () => {
    let monitor: NetworkMonitor;
    let mockListener: jest.Mock;

    beforeEach(() => {
      monitor = new NetworkMonitor();
      mockListener = jest.fn();
    });

    it('should initialize with current online status', () => {
      Object.defineProperty(navigator, 'onLine', {
        writable: true,
        value: true,
      });

      const monitor = new NetworkMonitor();
      const status = monitor.getStatus();

      expect(status.isOnline).toBe(true);
      expect(status.isReconnecting).toBe(false);
      expect(status.lastSeen).toBeInstanceOf(Date);
    });

    it('should add and remove listeners', () => {
      monitor.start(); // Start the monitor first
      const removeListener = monitor.addListener(mockListener);

      // Trigger a status change
      Object.defineProperty(navigator, 'onLine', {
        writable: true,
        value: false,
      });
      window.dispatchEvent(new Event('offline'));

      // Wait for the event to be processed
      setTimeout(() => {
        expect(mockListener).toHaveBeenCalled();
      }, 0);

      // Remove listener
      removeListener();
      jest.clearAllMocks();

      // Trigger another status change
      Object.defineProperty(navigator, 'onLine', {
        writable: true,
        value: true,
      });
      window.dispatchEvent(new Event('online'));

      expect(mockListener).not.toHaveBeenCalled();
    });

    it('should notify listeners of status changes', () => {
      monitor.addListener(mockListener);
      monitor.start();

      // Simulate going offline
      Object.defineProperty(navigator, 'onLine', {
        writable: true,
        value: false,
      });
      window.dispatchEvent(new Event('offline'));

      expect(mockListener).toHaveBeenCalledWith(
        expect.objectContaining({
          isOnline: false,
          isReconnecting: false,
        })
      );

      // Simulate going online
      Object.defineProperty(navigator, 'onLine', {
        writable: true,
        value: true,
      });
      window.dispatchEvent(new Event('online'));

      expect(mockListener).toHaveBeenCalledWith(
        expect.objectContaining({
          isOnline: true,
          isReconnecting: false,
          lastSeen: expect.any(Date),
        })
      );
    });

    it('should return a copy of status', () => {
      const status1 = monitor.getStatus();
      const status2 = monitor.getStatus();

      expect(status1).not.toBe(status2);
      expect(status1).toEqual(status2);
    });
  });

  describe('apiRequest', () => {
    beforeEach(() => {
      (fetch as jest.Mock).mockClear();
    });

    it('should make successful request', async () => {
      const mockResponse = { data: 'test' };
      (fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(mockResponse),
      });

      const result = await apiRequest('/test');

      expect(result).toEqual(mockResponse);
      expect(fetch).toHaveBeenCalledWith('/test', {
        headers: {
          'Content-Type': 'application/json',
        },
      });
    });

    it('should retry on failure', async () => {
      const mockResponse = { data: 'test' };
      (fetch as jest.Mock)
        .mockRejectedValueOnce(new Error('Network error'))
        .mockResolvedValueOnce({
          ok: true,
          json: () => Promise.resolve(mockResponse),
        });

      const result = await apiRequest('/test');

      expect(result).toEqual(mockResponse);
      expect(fetch).toHaveBeenCalledTimes(2);
    });

    it('should throw error for non-ok response', async () => {
      (fetch as jest.Mock).mockResolvedValueOnce({
        ok: false,
        status: 404,
        statusText: 'Not Found',
        json: () => Promise.resolve({ error: 'Not Found' }),
      });

      await expect(apiRequest('/test')).rejects.toThrow('HTTP 404: Not Found');
    });

    it('should use custom headers', async () => {
      const mockResponse = { data: 'test' };
      (fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(mockResponse),
      });

      await apiRequest('/test', {
        headers: {
          Authorization: 'Bearer token',
        },
      });

      expect(fetch).toHaveBeenCalledWith('/test', {
        headers: {
          'Content-Type': 'application/json',
          Authorization: 'Bearer token',
        },
      });
    });

    it('should use custom retry configuration', async () => {
      const mockResponse = { data: 'test' };
      (fetch as jest.Mock)
        .mockRejectedValueOnce(new Error('Network error'))
        .mockResolvedValueOnce({
          ok: true,
          json: () => Promise.resolve(mockResponse),
        });

      const customConfig: Partial<RetryConfig> = {
        maxRetries: 1,
        baseDelay: 100,
      };

      const result = await apiRequest('/test', {}, customConfig);

      expect(result).toEqual(mockResponse);
      expect(fetch).toHaveBeenCalledTimes(2);
    });
  });

  describe('checkUrlReachability', () => {
    beforeEach(() => {
      (fetch as jest.Mock).mockClear();
    });

    it('should return true for reachable URL', async () => {
      (fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
      });

      const result = await checkUrlReachability('https://example.com');

      expect(result).toBe(true);
      expect(fetch).toHaveBeenCalledWith('https://example.com', {
        method: 'HEAD',
        signal: expect.any(AbortSignal),
      });
    });

    it('should return false for unreachable URL', async () => {
      (fetch as jest.Mock).mockRejectedValueOnce(new Error('Network error'));

      const result = await checkUrlReachability('https://example.com');

      expect(result).toBe(false);
    });

    it('should return false for non-ok response', async () => {
      (fetch as jest.Mock).mockResolvedValueOnce({
        ok: false,
      });

      const result = await checkUrlReachability('https://example.com');

      expect(result).toBe(false);
    });

    it('should timeout after specified time', async () => {
      (fetch as jest.Mock).mockImplementationOnce(
        () =>
          new Promise((_, reject) => {
            setTimeout(() => reject(new Error('Timeout')), 1000);
          })
      );

      const result = await checkUrlReachability('https://example.com', 100);

      expect(result).toBe(false);
    });

    it('should use custom timeout', async () => {
      const mockAbortController = {
        signal: {},
        abort: jest.fn(),
      };
      jest
        .spyOn(global, 'AbortController')
        .mockImplementation(() => mockAbortController as any);

      (fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
      });

      await checkUrlReachability('https://example.com', 5000);

      expect(global.setTimeout).toHaveBeenCalledWith(
        expect.any(Function),
        5000
      );
    });
  });

  describe('DEFAULT_RETRY_CONFIG', () => {
    it('should have correct default values', () => {
      expect(DEFAULT_RETRY_CONFIG).toEqual({
        maxRetries: 3,
        baseDelay: 1000,
        maxDelay: 10000,
        backoffMultiplier: 2,
      });
    });
  });
});
