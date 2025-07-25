import { getCLS, getFID, getFCP, getLCP, getTTFB } from 'web-vitals';

const sendToAnalytics = (metric: any) => {
  // In a real app, you would send this to your analytics service
  console.log('Web Vital:', {
    name: metric.name,
    value: metric.value,
    id: metric.id,
  });
};

export const reportWebVitals = () => {
  getCLS(sendToAnalytics);
  getFID(sendToAnalytics);
  getFCP(sendToAnalytics);
  getLCP(sendToAnalytics);
  getTTFB(sendToAnalytics);
};

// Performance monitoring for specific user interactions
export const measureUserInteraction = (interactionName: string) => {
  if ('PerformanceObserver' in window) {
    const observer = new PerformanceObserver((list) => {
      for (const entry of list.getEntries()) {
        if (entry.entryType === 'interaction') {
          console.log(`${interactionName} interaction took ${entry.duration}ms`);
        }
      }
    });
    
    observer.observe({ entryTypes: ['interaction'] });
  }
};

// Monitor long tasks that might block the main thread
export const monitorLongTasks = () => {
  if ('PerformanceObserver' in window) {
    const observer = new PerformanceObserver((list) => {
      for (const entry of list.getEntries()) {
        if (entry.duration > 50) { // Tasks longer than 50ms
          console.warn('Long task detected:', {
            duration: entry.duration,
            startTime: entry.startTime,
            name: entry.name,
          });
        }
      }
    });
    
    observer.observe({ entryTypes: ['longtask'] });
  }
}; 