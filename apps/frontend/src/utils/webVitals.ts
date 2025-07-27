import { ReportHandler } from 'web-vitals';

const reportWebVitals = (onPerfEntry?: ReportHandler): void => {
  if (onPerfEntry && onPerfEntry instanceof Function) {
    import('web-vitals').then(({ getCLS, getFID, getFCP, getLCP, getTTFB }) => {
      getCLS(onPerfEntry);
      getFID(onPerfEntry);
      getFCP(onPerfEntry);
      getLCP(onPerfEntry);
      getTTFB(onPerfEntry);
    });
  }
};

export default reportWebVitals;

// Performance monitoring utilities
export const measureWebVitals = (): void => {
  reportWebVitals(metric => {
    // Here you could send metrics to your analytics service
  });
};

// Custom performance observer
export const observePerformance = (
  callback: (entry: PerformanceEntry) => void
): PerformanceObserver | null => {
  if ('PerformanceObserver' in window) {
    const observer = new PerformanceObserver(list => {
      list.getEntries().forEach(callback);
    });

    try {
      observer.observe({ entryTypes: ['navigation', 'resource', 'paint'] });
      return observer;
    } catch (error) {
      // console.warn('PerformanceObserver not supported:', error);
      return null;
    }
  }
  return null;
};
