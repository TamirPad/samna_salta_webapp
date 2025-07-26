import React, { ComponentType, lazy, Suspense } from 'react';

// Performance monitoring utilities
export const measurePerformance = (name: string, fn: () => void): void => {
  const start = performance.now();
  fn();
  const end = performance.now();
  console.log(`${name} took ${end - start} milliseconds`);
};

export const measureAsyncPerformance = async (name: string, fn: () => Promise<void>): Promise<void> => {
  const start = performance.now();
  await fn();
  const end = performance.now();
  console.log(`${name} took ${end - start} milliseconds`);
};

// Debounce utility
export const debounce = <T extends (...args: any[]) => any>(
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
  
  return (props: Record<string, unknown>): JSX.Element => (
    <Suspense fallback={fallback || <div>Loading...</div>}>
      {/* @ts-ignore: Props spreading for generic component */}
      <LazyComponent {...props} />
    </Suspense>
  );
};

// Intersection Observer for lazy loading
export const createIntersectionObserver = (
  callback: IntersectionObserverCallback,
  options: IntersectionObserverInit = {}
): IntersectionObserver => {
  return new IntersectionObserver(callback, {
    root: null,
    rootMargin: '50px',
    threshold: 0.1,
    ...options,
  });
};

// Image lazy loading hook
export const useLazyImage = (src: string, placeholder?: string): { imageSrc: string; isLoaded: boolean } => {
  const [imageSrc, setImageSrc] = React.useState<string>(placeholder || src);
  const [isLoaded, setIsLoaded] = React.useState<boolean>(false);

  React.useEffect((): void => {
    const img = new window.Image();
    img.src = src;
    img.onload = (): void => {
      setImageSrc(src);
      setIsLoaded(true);
    };
  }, [src]);

  return { imageSrc, isLoaded };
};

// Virtual scrolling utilities
export const getVisibleItems = <T,>(
  items: T[],
  containerHeight: number,
  itemHeight: number,
  scrollTop: number
): { items: T[]; startIndex: number; endIndex: number; totalHeight: number } => {
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
  try {
    const response = await fetch(url);
    const blob = await response.blob();
    return blob.size;
  } catch (error) {
    console.error('Failed to get bundle size:', error);
    return 0;
  }
};

// Memory usage monitoring
export const getMemoryUsage = (): { used: number; total: number; limit: number } | null => {
  if ('memory' in performance) {
    const memory = (performance as { memory: { usedJSHeapSize: number; totalJSHeapSize: number; jsHeapSizeLimit: number } }).memory;
    return {
      used: memory.usedJSHeapSize,
      total: memory.totalJSHeapSize,
      limit: memory.jsHeapSizeLimit,
    };
  }
  return null;
};

// Performance marks and measures
export const performanceMarks = {
  start: (name: string): void => { performance.mark(name); },
  end: (name: string): void => { performance.mark(`${name}-end`); },
  measure: (name: string, startMark: string, endMark: string): number => {
    performance.measure(name, startMark, endMark);
    const measure = performance.getEntriesByName(name)[0] as PerformanceMeasure | undefined;
    return measure?.duration || 0;
  },
};

// React performance optimizations
export const withPerformanceTracking = <P extends object>(
  Component: React.ComponentType<P>,
  displayName?: string
): React.MemoExoticComponent<React.ComponentType<P>> => {
  const WrappedComponent = React.memo(Component);
  WrappedComponent.displayName = displayName || Component.displayName || Component.name;
  return WrappedComponent;
};

// Bundle splitting utilities
export const preloadComponent = (importFunc: () => Promise<unknown>): (() => void) => {
  return (): void => {
    importFunc();
  };
};

// Service Worker utilities
export const registerServiceWorker = async (swPath: string): Promise<ServiceWorkerRegistration | null> => {
  if ('serviceWorker' in navigator) {
    try {
      const registration = await navigator.serviceWorker.register(swPath);
      console.log('SW registered: ', registration);
      return registration;
    } catch (error) {
      console.log('SW registration failed: ', error);
      return null;
    }
  }
  return null;
};

// Cache utilities
export const cacheUtils = {
  set: (key: string, value: unknown, ttl?: number): void => {
    const item = {
      value,
      timestamp: Date.now(),
      ttl,
    };
    localStorage.setItem(key, JSON.stringify(item));
  },
  
  get: (key: string): unknown => {
    const item = localStorage.getItem(key);
    if (!item) return null;
    
    const { value, timestamp, ttl } = JSON.parse(item);
    if (ttl && Date.now() - timestamp > ttl) {
      localStorage.removeItem(key);
      return null;
    }
    
    return value;
  },
  
  remove: (key: string): void => {
    localStorage.removeItem(key);
  },
  
  clear: (): void => {
    localStorage.clear();
  },
};

 