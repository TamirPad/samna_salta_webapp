import React, {
  ReactElement,
  ReactNode,
  useState,
  useEffect,
  ComponentType,
  lazy,
  Suspense,
} from 'react';

// Check if we're in a browser environment
const isBrowser =
  typeof window !== 'undefined' && typeof document !== 'undefined';

// Performance monitoring utilities
export const measurePerformance = (name: string, fn: () => void): number => {
  if (!isBrowser || !performance) {
    fn();
    return 0;
  }

  const start = performance.now();
  fn();
  const end = performance.now();
  const duration = end - start;
  // Performance measurement: ${name} took ${duration} milliseconds
  return duration;
};

export const measureAsyncPerformance = async (
  name: string,
  fn: () => Promise<void>
): Promise<number> => {
  if (!isBrowser || !performance) {
    await fn();
    return 0;
  }

  const start = performance.now();
  await fn();
  const end = performance.now();
  const duration = end - start;
  // Performance measurement: ${name} took ${duration} milliseconds
  return duration;
};

// Debounce utility
export const debounce = <T extends (...args: unknown[]) => unknown>(
  func: T,
  wait: number
): T => {
  let timeout: NodeJS.Timeout;
  return ((...args: Parameters<T>): void => {
    clearTimeout(timeout);
    timeout = setTimeout(() => func(...args), wait);
  }) as T;
};

// Throttle utility
export const throttle = <T extends (...args: unknown[]) => unknown>(
  func: T,
  limit: number
): ((...args: Parameters<T>) => void) => {
  let inThrottle = false;
  return (...args: Parameters<T>): void => {
    if (!inThrottle) {
      func(...args);
      inThrottle = true;
      setTimeout(() => (inThrottle = false), limit);
    }
  };
};

// Memoization utility
export const memoize = <T extends (...args: unknown[]) => unknown>(
  fn: T
): T => {
  const cache = new Map<string, unknown>();
  return ((...args: Parameters<T>): unknown => {
    const key = JSON.stringify(args);
    if (cache.has(key)) {
      return cache.get(key);
    }
    const result = fn(...args);
    cache.set(key, result);
    return result;
  }) as T;
};

// Lazy loading with error boundary
export const lazyLoad = <T extends ComponentType<Record<string, unknown>>>(
  importFunc: () => Promise<{ default: T }>,
  fallback?: React.ReactNode
): React.FC<Record<string, unknown>> => {
  const LazyComponent = lazy(importFunc);

  const LazyWrapper = (props: Record<string, unknown>): JSX.Element => (
    <Suspense fallback={fallback || <div>Loading...</div>}>
      {/* @ts-expect-error: Props spreading for generic component */}
      <LazyComponent {...props} />
    </Suspense>
  );

  LazyWrapper.displayName = 'LazyWrapper';
  return LazyWrapper;
};

// Intersection Observer for lazy loading
export const createIntersectionObserver = (
  callback: IntersectionObserverCallback,
  options: IntersectionObserverInit = {}
): IntersectionObserver | null => {
  if (!isBrowser || !window.IntersectionObserver) {
    return null;
  }

  return new IntersectionObserver(callback, {
    root: null,
    rootMargin: '50px',
    threshold: 0.1,
    ...options,
  });
};

// Image lazy loading hook
export const useLazyImage = (
  src: string,
  placeholder?: string
): { imageSrc: string; isLoaded: boolean } => {
  const [imageSrc, setImageSrc] = React.useState<string>(placeholder || src);
  const [isLoaded, setIsLoaded] = React.useState<boolean>(false);

  React.useEffect((): void => {
    if (!isBrowser) return;

    const img = new window.Image();
    img.src = src;
    img.onload = (): void => {
      setImageSrc(src);
      setIsLoaded(true);
    };
    img.onerror = (): void => {
      // Fallback to placeholder or original src
      setImageSrc(placeholder || src);
      setIsLoaded(true);
    };
  }, [src, placeholder]);

  return { imageSrc, isLoaded };
};

// Virtual scrolling utilities
export const getVisibleItems = <T,>(
  items: T[],
  containerHeight: number,
  itemHeight: number,
  scrollTop: number
): {
  items: T[];
  startIndex: number;
  endIndex: number;
  totalHeight: number;
} => {
  const startIndex = Math.floor(scrollTop / itemHeight);
  const endIndex = Math.min(
    startIndex + Math.ceil(containerHeight / itemHeight) + 1,
    items.length
  );

  return {
    items: items.slice(startIndex, endIndex),
    startIndex,
    endIndex,
    totalHeight: items.length * itemHeight,
  };
};

// Bundle size monitoring
export const getBundleSize = async (url: string): Promise<number> => {
  if (!isBrowser) return 0;

  try {
    const response = await fetch(url);
    const blob = await response.blob();
    return blob.size;
  } catch (error) {
    // console.error('Failed to get bundle size:', error);
    return 0;
  }
};

// Memory usage monitoring
export const getMemoryUsage = (): {
  used: number;
  total: number;
  limit: number;
} | null => {
  if (!isBrowser || !performance || !('memory' in performance)) {
    return null;
  }

  const memory = (
    performance as {
      memory: {
        usedJSHeapSize: number;
        totalJSHeapSize: number;
        jsHeapSizeLimit: number;
      };
    }
  ).memory;
  return {
    used: memory.usedJSHeapSize,
    total: memory.totalJSHeapSize,
    limit: memory.jsHeapSizeLimit,
  };
};

// Performance marks and measures
export const performanceMarks = {
  start: (name: string): void => {
    if (isBrowser && performance) {
      performance.mark(name);
    }
  },
  end: (name: string): void => {
    if (isBrowser && performance) {
      performance.mark(`${name}-end`);
    }
  },
  measure: (name: string, startMark: string, endMark: string): number => {
    if (!isBrowser || !performance) return 0;

    try {
      performance.measure(name, startMark, endMark);
      const entries = performance.getEntriesByName(name);
      const measure = entries[0] as PerformanceMeasure | undefined;
      return measure?.duration || 0;
    } catch (error) {
      // console.warn('Performance measure failed:', error);
      return 0;
    }
  },
};

// React performance optimizations
export const withPerformanceTracking = <P extends object>(
  Component: React.ComponentType<P>,
  displayName?: string
): React.MemoExoticComponent<React.ComponentType<P>> => {
  const WrappedComponent = React.memo(Component);
  WrappedComponent.displayName =
    displayName || Component.displayName || Component.name;
  return WrappedComponent;
};

// Bundle splitting utilities
export const preloadComponent = (
  importFunc: () => Promise<unknown>
): (() => void) => {
  return (): void => {
    importFunc();
  };
};

// Service Worker utilities
export const registerServiceWorker = async (
  swPath: string
): Promise<ServiceWorkerRegistration | null> => {
  if (!isBrowser || !('serviceWorker' in navigator)) {
    return null;
  }

  try {
    const registration = await navigator.serviceWorker.register(swPath);
    // Service worker registered successfully
    return registration as ServiceWorkerRegistration;
  } catch (error) {
    // Service worker registration failed
    return null;
  }
};

// Cache utilities
export const cacheUtils = {
  set: (key: string, value: unknown, ttl?: number): void => {
    if (!isBrowser || !localStorage) return;

    try {
      const item = {
        value,
        timestamp: Date.now(),
        ttl,
      };
      localStorage.setItem(key, JSON.stringify(item));
    } catch (error) {
      // console.warn('Failed to set cache item:', error);
    }
  },

  get: (key: string): unknown => {
    if (!isBrowser || !localStorage) return null;

    try {
      const item = localStorage.getItem(key);
      if (!item) return null;

      const { value, timestamp, ttl } = JSON.parse(item);
      if (ttl && Date.now() - timestamp > ttl) {
        localStorage.removeItem(key);
        return null;
      }

      return value;
    } catch (error) {
      // console.warn('Failed to get cache item:', error);
      return null;
    }
  },

  remove: (key: string): void => {
    if (!isBrowser || !localStorage) return;

    try {
      localStorage.removeItem(key);
    } catch (error) {
      // console.warn('Failed to remove cache item:', error);
    }
  },

  clear: (): void => {
    if (!isBrowser || !localStorage) return;

    try {
      localStorage.clear();
    } catch (error) {
      // console.warn('Failed to clear cache:', error);
    }
  },
};
