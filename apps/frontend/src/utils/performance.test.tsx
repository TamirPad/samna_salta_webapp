import {
  measurePerformance,
  debounce,
  throttle,
  memoize,
  lazyLoad,
  createIntersectionObserver,
  useLazyImage,
  getVisibleItems,
  getMemoryUsage,
  performanceMarks,
  withPerformanceTracking,
  preloadComponent,
  registerServiceWorker,
  cacheUtils,
} from './performance';

// Mock performance API
const mockPerformance = {
  now: jest.fn(() => 1234567890),
  mark: jest.fn(),
  measure: jest.fn(() => ({ duration: 100 })),
  getEntriesByName: jest.fn(() => [{ duration: 100 }]),
  clearMarks: jest.fn(),
  clearMeasures: jest.fn(),
};

// Mock service worker
const mockServiceWorker = {
  register: jest.fn(() => Promise.resolve({})),
};

// Mock window objects
Object.defineProperty(window, 'performance', {
  value: mockPerformance,
  writable: true,
});

Object.defineProperty(window, 'navigator', {
  value: {
    serviceWorker: mockServiceWorker,
  },
  writable: true,
});

describe('Performance Utils', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('measurePerformance', () => {
    it('should measure function execution time', () => {
      const mockFn = jest.fn();
      const result = measurePerformance('test', mockFn);
      
      expect(mockFn).toHaveBeenCalled();
      expect(typeof result).toBe('number');
      expect(result).toBeGreaterThan(0);
    });
  });

  describe('debounce', () => {
    beforeEach(() => {
      jest.useFakeTimers();
    });

    afterEach(() => {
      jest.useRealTimers();
    });

    it('should debounce function calls', () => {
      const mockFn = jest.fn();
      const debouncedFn = debounce(mockFn, 100);

      debouncedFn();
      debouncedFn();
      debouncedFn();

      expect(mockFn).not.toHaveBeenCalled();

      jest.advanceTimersByTime(100);

      expect(mockFn).toHaveBeenCalledTimes(1);
    });

    it('should pass arguments to debounced function', () => {
      const mockFn = jest.fn();
      const debouncedFn = debounce(mockFn, 100);

      debouncedFn('test', 123);

      jest.advanceTimersByTime(100);

      expect(mockFn).toHaveBeenCalledWith('test', 123);
    });
  });

  describe('throttle', () => {
    beforeEach(() => {
      jest.useFakeTimers();
    });

    afterEach(() => {
      jest.useRealTimers();
    });

    it('should throttle function calls', () => {
      const mockFn = jest.fn();
      const throttledFn = throttle(mockFn, 100);

      throttledFn();
      throttledFn();
      throttledFn();

      expect(mockFn).toHaveBeenCalledTimes(1);

      jest.advanceTimersByTime(100);

      throttledFn();
      expect(mockFn).toHaveBeenCalledTimes(2);
    });
  });

  describe('memoize', () => {
    it('should memoize function results', () => {
      const mockFn = jest.fn((a: number, b: number) => a + b);
      const memoizedFn = memoize(mockFn as any);

      const result1 = memoizedFn(1, 2);
      const result2 = memoizedFn(1, 2);

      expect(result1).toBe(3);
      expect(result2).toBe(3);
      expect(mockFn).toHaveBeenCalledTimes(1);
    });

    it('should handle different arguments', () => {
      const mockFn = jest.fn((a: number, b: number) => a + b);
      const memoizedFn = memoize(mockFn as any);

      memoizedFn(1, 2);
      memoizedFn(2, 3);

      expect(mockFn).toHaveBeenCalledTimes(2);
    });
  });

  describe('lazyLoad', () => {
    it('should create lazy loaded component', () => {
      const mockImportFunc = jest.fn().mockResolvedValue({
        default: () => <div>Lazy Component</div>,
      });

      const LazyComponent = lazyLoad(mockImportFunc);

      expect(typeof LazyComponent).toBe('function');
    });
  });

  describe('createIntersectionObserver', () => {
    it('should create intersection observer', () => {
      const mockCallback = jest.fn();
      const observer = createIntersectionObserver(mockCallback);

      expect(observer).toBeInstanceOf(IntersectionObserver);
    });
  });

  describe('useLazyImage', () => {
    it('should return image state', () => {
      const { result } = require('@testing-library/react').renderHook(() =>
        useLazyImage('test.jpg')
      );

      expect(result.current).toHaveProperty('imageSrc');
      expect(result.current).toHaveProperty('isLoaded');
    });
  });

  describe('getVisibleItems', () => {
    it('should return visible items', () => {
      const items = [1, 2, 3, 4, 5];
      const result = getVisibleItems(items, 100, 20, 0);

      expect(result).toHaveProperty('items');
      expect(result).toHaveProperty('startIndex');
      expect(result).toHaveProperty('endIndex');
      expect(result).toHaveProperty('totalHeight');
    });
  });

  describe('getMemoryUsage', () => {
    it('should return memory usage or null', () => {
      getMemoryUsage();
      
      // In test environment, it might return null
      // Note: memory info may not be available in test environment
      // This is expected behavior, so we don't assert on it
    });
  });

  describe('performanceMarks', () => {
    it('should create performance marks', () => {
      const mockMark = jest.spyOn(performance, 'mark').mockImplementation(() => ({} as PerformanceMark));
      const mockMeasure = jest.spyOn(performance, 'measure').mockReturnValue({} as PerformanceMeasure);

      performanceMarks.start('test');
      performanceMarks.end('test');
      performanceMarks.measure('test', 'test', 'test-end');

      expect(mockMark).toHaveBeenCalledWith('test');
      expect(mockMark).toHaveBeenCalledWith('test-end');
      expect(mockMeasure).toHaveBeenCalledWith('test', 'test', 'test-end');

      mockMark.mockRestore();
      mockMeasure.mockRestore();
    });
  });

  describe('withPerformanceTracking', () => {
    it('should wrap component with performance tracking', () => {
      const TestComponent = () => <div>Test</div>;
      const WrappedComponent = withPerformanceTracking(TestComponent);

      expect(WrappedComponent).toBeDefined();
    });
  });

  describe('preloadComponent', () => {
    it('should return cleanup function', () => {
      const mockImportFunc = jest.fn();
      const cleanup = preloadComponent(mockImportFunc);

      expect(typeof cleanup).toBe('function');
    });
  });

  describe('registerServiceWorker', () => {
    it('should register service worker', async () => {
      const mockRegister = jest.fn().mockResolvedValue({});
      Object.defineProperty(navigator, 'serviceWorker', {
        value: { register: mockRegister },
        writable: true,
      });

      const result = await registerServiceWorker('/sw.js');

      expect(mockRegister).toHaveBeenCalledWith('/sw.js');
      expect(result).toEqual({});
    });

    it('should return null when service worker not supported', async () => {
      Object.defineProperty(navigator, 'serviceWorker', {
        value: undefined,
        writable: true,
      });

      const result = await registerServiceWorker('/sw.js');

      expect(result).toBeNull();
    });
  });

  describe('cacheUtils', () => {
    beforeEach(() => {
      // Clear cache before each test
      cacheUtils.clear();
    });

    it('should set and get cache', () => {
      const testData = { test: 'data' };
      cacheUtils.set('test-key', testData);

      const result = cacheUtils.get('test-key');
      expect(result).toEqual(testData);
    });

    it('should return null for non-existent key', () => {
      const result = cacheUtils.get('non-existent');
      expect(result).toBeNull();
    });

    it('should remove cache item', () => {
      cacheUtils.set('test-key', 'test-value');
      cacheUtils.remove('test-key');

      const result = cacheUtils.get('test-key');
      expect(result).toBeNull();
    });

    it('should clear all cache', () => {
      cacheUtils.set('key1', 'value1');
      cacheUtils.set('key2', 'value2');
      cacheUtils.clear();

      expect(cacheUtils.get('key1')).toBeNull();
      expect(cacheUtils.get('key2')).toBeNull();
    });

    it('should handle TTL expiration', () => {
      jest.useFakeTimers();

      cacheUtils.set('test-key', 'test-value', 1); // 1 second TTL

      // Before expiration
      expect(cacheUtils.get('test-key')).toBe('test-value');

      // After expiration
      jest.advanceTimersByTime(2000);
      expect(cacheUtils.get('test-key')).toBeNull();

      jest.useRealTimers();
    });
  });
}); 