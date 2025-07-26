// Network utilities for handling connectivity and API calls

// Check if we're in a browser environment
const isBrowser = typeof window !== 'undefined' && typeof navigator !== 'undefined';

export interface NetworkStatus {
  isOnline: boolean;
  isReconnecting: boolean;
  lastSeen: Date | null;
}

export interface RetryConfig {
  maxRetries: number;
  baseDelay: number;
  maxDelay: number;
  backoffMultiplier: number;
}

// Default retry configuration
export const DEFAULT_RETRY_CONFIG: RetryConfig = {
  maxRetries: 3,
  baseDelay: 1000,
  maxDelay: 10000,
  backoffMultiplier: 2,
};

// Check if the browser is online
export const isOnline = (): boolean => {
  if (!isBrowser) return true; // Assume online in non-browser environments
  return navigator.onLine;
};

// Check if the browser supports service workers
export const supportsServiceWorker = (): boolean => {
  if (!isBrowser) return false;
  return 'serviceWorker' in navigator;
};

// Check if the browser supports push notifications
export const supportsPushNotifications = (): boolean => {
  if (!isBrowser) return false;
  return 'PushManager' in window;
};

// Exponential backoff retry function
export const retryWithBackoff = async <T>(
  fn: () => Promise<T>,
  config: Partial<RetryConfig> = {}
): Promise<T> => {
  const finalConfig = { ...DEFAULT_RETRY_CONFIG, ...config };
  let lastError: Error;

  for (let attempt = 0; attempt <= finalConfig.maxRetries; attempt++) {
    try {
      return await fn();
    } catch (error) {
      lastError = error instanceof Error ? error : new Error(String(error));
      
      if (attempt === finalConfig.maxRetries) {
        throw lastError;
      }

      const delay = Math.min(
        finalConfig.baseDelay * Math.pow(finalConfig.backoffMultiplier, attempt),
        finalConfig.maxDelay
      );

      await new Promise(resolve => setTimeout(resolve, delay));
    }
  }

  throw lastError!;
};

// Network status monitoring
export class NetworkMonitor {
  private status: NetworkStatus;
  private listeners: Set<(status: NetworkStatus) => void>;
  private isStarted: boolean = false;

  constructor() {
    this.status = {
      isOnline: isOnline(),
      isReconnecting: false,
      lastSeen: isOnline() ? new Date() : null,
    };
    this.listeners = new Set();
  }

  public getStatus(): NetworkStatus {
    return { ...this.status };
  }

  public addListener(listener: (status: NetworkStatus) => void): () => void {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }

  public start(): void {
    if (!isBrowser || this.isStarted) return;
    
    this.isStarted = true;
    
    const handleOnline = (): void => {
      this.status = {
        isOnline: true,
        isReconnecting: false,
        lastSeen: new Date(),
      };
      this.notifyListeners();
    };

    const handleOffline = (): void => {
      this.status = {
        isOnline: false,
        isReconnecting: false,
        lastSeen: this.status.lastSeen,
      };
      this.notifyListeners();
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
  }

  private notifyListeners(): void {
    this.listeners.forEach(listener => listener(this.getStatus()));
  }
}

// API request with retry logic
export const apiRequest = async <T>(
  url: string,
  options: RequestInit = {},
  retryConfig?: Partial<RetryConfig>
): Promise<T> => {
  const makeRequest = async (): Promise<T> => {
    if (!isBrowser) {
      throw new Error('API requests are only available in browser environments');
    }
    
    const response = await fetch(url, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
    });

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }

    return response.json();
  };

  return retryWithBackoff(makeRequest, retryConfig);
};

// Check if a URL is reachable
export const checkUrlReachability = async (url: string, timeout = 5000): Promise<boolean> => {
  if (!isBrowser) return false;
  
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), timeout);

    const response = await fetch(url, {
      method: 'HEAD',
      signal: controller.signal,
    });

    clearTimeout(timeoutId);
    return response.ok;
  } catch {
    return false;
  }
}; 