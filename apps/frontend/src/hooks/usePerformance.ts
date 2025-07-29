import { useEffect, useRef, useCallback } from "react";

interface PerformanceMetrics {
  componentMountTime: number;
  renderCount: number;
  lastRenderTime: number;
  averageRenderTime: number;
}

interface UsePerformanceOptions {
  componentName?: string;
  trackRenders?: boolean;
  trackInteractions?: boolean;
  logToConsole?: boolean;
}

export function usePerformance(options: UsePerformanceOptions = {}) {
  const {
    componentName = "Component",
    trackRenders = true,
    trackInteractions = true,
    logToConsole = process.env.NODE_ENV === "development",
  } = options;

  const metricsRef = useRef<PerformanceMetrics>({
    componentMountTime: 0,
    renderCount: 0,
    lastRenderTime: 0,
    averageRenderTime: 0,
  });

  const mountTimeRef = useRef<number>(0);
  const renderTimesRef = useRef<number[]>([]);

  // Track component mount
  useEffect(() => {
    mountTimeRef.current = performance.now();
    metricsRef.current.componentMountTime = mountTimeRef.current;

    if (logToConsole) {
      console.log(`🚀 ${componentName} mounted at ${new Date().toISOString()}`);
    }

    // Track component unmount
    return () => {
      const unmountTime = performance.now();
      const totalLifetime = unmountTime - mountTimeRef.current;

      if (logToConsole) {
        console.log(
          `🛑 ${componentName} unmounted after ${totalLifetime.toFixed(2)}ms`,
        );
        console.log(
          `📊 ${componentName} performance metrics:`,
          metricsRef.current,
        );
      }
    };
  }, [componentName, logToConsole]);

  // Track renders
  useEffect(() => {
    if (trackRenders) {
      const renderTime = performance.now();
      const lastRenderTime = metricsRef.current.lastRenderTime;
      const renderDuration = lastRenderTime ? renderTime - lastRenderTime : 0;

      metricsRef.current.renderCount++;
      metricsRef.current.lastRenderTime = renderTime;

      if (renderDuration > 0) {
        renderTimesRef.current.push(renderDuration);
        metricsRef.current.averageRenderTime =
          renderTimesRef.current.reduce((a, b) => a + b, 0) /
          renderTimesRef.current.length;
      }

      if (logToConsole && renderDuration > 16) {
        // Log slow renders (>16ms)
        console.warn(
          `🐌 ${componentName} slow render: ${renderDuration.toFixed(2)}ms`,
        );
      }
    }
  });

  // Track user interactions
  const trackInteraction = useCallback(
    (interactionType: string, details?: any) => {
      if (trackInteractions) {
        const interactionTime = performance.now();
        const timeSinceMount = interactionTime - mountTimeRef.current;

        if (logToConsole) {
          console.log(`👆 ${componentName} interaction:`, {
            type: interactionType,
            timeSinceMount: `${timeSinceMount.toFixed(2)}ms`,
            details,
          });
        }
      }
    },
    [componentName, trackInteractions, logToConsole],
  );

  // Track API calls
  const trackApiCall = useCallback(
    (endpoint: string, duration: number, success: boolean) => {
      if (logToConsole) {
        const status = success ? "✅" : "❌";
        console.log(`${status} ${componentName} API call:`, {
          endpoint,
          duration: `${duration.toFixed(2)}ms`,
          success,
        });
      }
    },
    [componentName, logToConsole],
  );

  // Get current metrics
  const getMetrics = useCallback(() => {
    return { ...metricsRef.current };
  }, []);

  return {
    trackInteraction,
    trackApiCall,
    getMetrics,
  };
}

// Hook for tracking page load performance
export function usePageLoadPerformance(pageName: string) {
  useEffect(() => {
    const startTime = performance.now();

    // Track when page becomes interactive
    const handleLoad = () => {
      const loadTime = performance.now() - startTime;
      console.log(`📄 ${pageName} loaded in ${loadTime.toFixed(2)}ms`);
    };

    // Track when page becomes interactive
    const handleInteractive = () => {
      const interactiveTime = performance.now() - startTime;
      console.log(
        `⚡ ${pageName} became interactive in ${interactiveTime.toFixed(2)}ms`,
      );
    };

    if (document.readyState === "complete") {
      handleLoad();
    } else {
      window.addEventListener("load", handleLoad);
    }

    if (document.readyState === "interactive") {
      handleInteractive();
    } else {
      document.addEventListener("DOMContentLoaded", handleInteractive);
    }

    return () => {
      window.removeEventListener("load", handleLoad);
      document.removeEventListener("DOMContentLoaded", handleInteractive);
    };
  }, [pageName]);
}

// Hook for tracking memory usage
export function useMemoryTracking(componentName: string) {
  useEffect(() => {
    if (process.env.NODE_ENV === "development" && "memory" in performance) {
      const memory = (performance as any).memory;

      const logMemoryUsage = () => {
        console.log(`🧠 ${componentName} memory usage:`, {
          usedJSHeapSize: `${(memory.usedJSHeapSize / 1024 / 1024).toFixed(2)}MB`,
          totalJSHeapSize: `${(memory.totalJSHeapSize / 1024 / 1024).toFixed(2)}MB`,
          jsHeapSizeLimit: `${(memory.jsHeapSizeLimit / 1024 / 1024).toFixed(2)}MB`,
        });
      };

      // Log initial memory usage
      logMemoryUsage();

      // Log memory usage every 30 seconds
      const interval = setInterval(logMemoryUsage, 30000);

      return () => {
        clearInterval(interval);
        logMemoryUsage(); // Log final memory usage
      };
    }

    // Return empty cleanup function if memory tracking is not available
    return () => {};
  }, [componentName]);
}
