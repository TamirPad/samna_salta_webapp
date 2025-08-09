import axios, {
  AxiosInstance,
  InternalAxiosRequestConfig,
  AxiosResponse,
  AxiosError,
} from "axios";
import { toast } from "react-toastify";

// Types
interface ApiError {
  message: string;
  status?: number;
  code?: string;
}

interface RetryConfig {
  retries: number;
  retryDelay: number;
  retryCondition: (error: AxiosError) => boolean;
}

// Constants
const API_TIMEOUT = 10000;
const ERROR_THROTTLE_TIME = 5000;
const MAX_RETRIES = 3;
const RETRY_DELAY = 1000;

// Error tracking for throttling
let lastErrorMessage = "";
let errorMessageCount = 0;

// Cache for API responses with size limit
const MAX_CACHE_SIZE = 100;
const responseCache = new Map<
  string,
  { data: unknown; timestamp: number; ttl: number }
>();

// Retry configuration
const retryConfig: RetryConfig = {
  retries: MAX_RETRIES,
  retryDelay: RETRY_DELAY,
  retryCondition: (error: AxiosError) => {
    // Retry on network errors or 5xx server errors
    return (
      !error.response ||
      (error.response.status >= 500 && error.response.status < 600)
    );
  },
};

const shouldRetry = (error: AxiosError, retryCount: number): boolean => {
  return retryCount < retryConfig.retries && retryConfig.retryCondition(error);
};

const delay = (ms: number): Promise<void> =>
  new Promise((resolve) => setTimeout(resolve, ms));

const getCacheKey = (config: InternalAxiosRequestConfig): string => {
  return `${config.method?.toUpperCase()}:${config.url}:${JSON.stringify(config.params || {})}`;
};

const isCacheable = (config: InternalAxiosRequestConfig): boolean => {
  return (
    config.method?.toLowerCase() === "get" && !config.url?.includes("/auth/")
  );
};

const getCachedResponse = (cacheKey: string): unknown | null => {
  const cached = responseCache.get(cacheKey);
  if (cached && Date.now() - cached.timestamp < cached.ttl) {
    return cached.data;
  }
  responseCache.delete(cacheKey);
  return null;
};

const setCachedResponse = (
  cacheKey: string,
  data: unknown,
  ttl: number = 5 * 60 * 1000,
): void => {
  // Clear old entries if cache is too large
  if (responseCache.size >= MAX_CACHE_SIZE) {
    const oldestKey = responseCache.keys().next().value;
    if (oldestKey) {
      responseCache.delete(oldestKey);
    }
  }

  responseCache.set(cacheKey, {
    data,
    timestamp: Date.now(),
    ttl,
  });
};

const clearCache = (): void => {
  responseCache.clear();
};

// Create axios instance with enhanced configuration
const getApiBaseUrl = (): string => {
  if (process.env["REACT_APP_API_URL"]) {
    return process.env["REACT_APP_API_URL"];
  }
  if (process.env["NODE_ENV"] === "production") {
    const currentDomain = window.location.origin.replace(/\/$/, "");
    return `${currentDomain}/api`;
  }
  return "http://localhost:3001/api";
};

const api: AxiosInstance = axios.create({
  baseURL: getApiBaseUrl(),
  timeout: API_TIMEOUT,
  headers: {
    "Content-Type": "application/json",
  },
  withCredentials: true,
});

// Add request interceptor for headers
api.interceptors.request.use((config) => {
  // Add request ID for tracking
  config.headers["X-Request-ID"] =
    `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  return config;
});

// Request interceptor
api.interceptors.request.use(
  async (config: InternalAxiosRequestConfig) => {
    // Add auth token
    const token = localStorage.getItem("token");
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    // Check cache for GET requests
    if (isCacheable(config)) {
      const cacheKey = getCacheKey(config);
      const cachedData = getCachedResponse(cacheKey);
      if (cachedData) {
        // Return cached response
        return Promise.reject({
          __cached: true,
          data: cachedData,
          config,
        });
      }
    }

    return config;
  },
  (error) => {
    return Promise.reject(error);
  },
);

let isRefreshing = false;
let refreshPromise: Promise<string | null> | null = null;

async function refreshAccessToken(): Promise<string | null> {
  if (isRefreshing && refreshPromise) return refreshPromise;
  isRefreshing = true;
  refreshPromise = (async () => {
    try {
      const resp = await api.post('/auth/refresh');
      const newToken = (resp as any)?.data?.data?.token;
      if (newToken) {
        localStorage.setItem('token', newToken);
        return newToken as string;
      }
    } catch (_) {
      // ignore
    } finally {
      isRefreshing = false;
    }
    return null;
  })();
  return refreshPromise;
}

// Response interceptor with retry logic
api.interceptors.response.use(
  (response: AxiosResponse) => {
    // Cache successful GET responses
    if (isCacheable(response.config)) {
      const cacheKey = getCacheKey(response.config);
      setCachedResponse(cacheKey, response.data);
    }
    return response;
  },
  async (error: AxiosError) => {
    // Handle cached responses
    if (error && (error as any).__cached) {
      return Promise.resolve((error as any).data);
    }

    const originalRequest = error.config as any;

    // Retry logic
    if (
      originalRequest &&
      shouldRetry(error, originalRequest._retryCount || 0)
    ) {
      originalRequest._retryCount = (originalRequest._retryCount || 0) + 1;

      await delay(retryConfig.retryDelay * originalRequest._retryCount);

      return api(originalRequest);
    }

    // Error handling
    const { response } = error;

    if (response) {
      const { status, data } = response;

      switch (status) {
        case 401:
          // Try refresh once (avoid for refresh endpoint itself)
          if (!(originalRequest && originalRequest._triedRefresh) && !(originalRequest && originalRequest.url && originalRequest.url.includes('/auth/refresh'))) {
            originalRequest._triedRefresh = true;
            const newToken = await refreshAccessToken();
            if (newToken) {
              originalRequest.headers = originalRequest.headers || {};
              originalRequest.headers.Authorization = `Bearer ${newToken}`;
              return api(originalRequest);
            }
          }
          // Refresh failed - clear token and redirect
          localStorage.removeItem('token');
          localStorage.removeItem('user');
          clearCache();
          if (window.location.pathname !== '/' && window.location.pathname !== '/login') {
            window.location.href = '/login';
            toast.error('Session expired. Please login again.');
          }
          break;

        case 403:
          // Forbidden
          toast.error(
            "Access denied. You do not have permission to perform this action.",
          );
          break;

        case 404:
          // Not found - don't show toast for 404 errors as they're usually expected
          // console.warn('Resource not found:', error.config?.url);
          break;

        case 422:
          // Validation error
          if (
            data &&
            typeof data === "object" &&
            "errors" in data &&
            data.errors
          ) {
            Object.values(data.errors as Record<string, any>).forEach(
              (error: any) => {
                toast.error(error as string);
              },
            );
          } else {
            toast.error((data as any)?.message || "Validation error");
          }
          break;

        case 429:
          // Rate limited
          toast.error("Too many requests. Please try again later.");
          break;

        case 500:
          // Server error
          toast.error("Server error. Please try again later.");
          break;

        default:
          // Other errors
          toast.error((data as any)?.message || "An error occurred");
      }
    } else {
      // Network error - throttle to avoid spam
      const currentTime = Date.now();
      const errorMessage = "Network error. Please check your connection.";

      if (
        errorMessage !== lastErrorMessage ||
        currentTime - errorMessageCount > ERROR_THROTTLE_TIME
      ) {
        lastErrorMessage = errorMessage;
        errorMessageCount = currentTime;
        toast.error(errorMessage, {
          toastId: "network-error",
          autoClose: 5000,
        });
      }
    }

    return Promise.reject(error);
  },
);

// API Service interface
export interface ApiService {
  // Cache management
  clearCache: () => void;
  getCache: (key: string) => any;
  setCache: (key: string, data: any, ttl?: number) => void;

  // Auth methods
  login: (credentials: { email: string; password: string }) => Promise<any>;
  register: (userData: any) => Promise<any>;
  logout: () => Promise<any>;
  getCurrentUser: () => Promise<any>;

  // Product methods
  getProducts: (params?: any) => Promise<any>;
  getProduct: (id: number) => Promise<any>;
  getProductOptions: (id: number) => Promise<any>;
  createProduct: (productData: any) => Promise<any>;
  updateProduct: (id: number, productData: any) => Promise<any>;
  deleteProduct: (id: number) => Promise<any>;

  // Category methods
  getCategories: () => Promise<any>;
  createCategory: (categoryData: any) => Promise<any>;
  updateCategory: (id: number, categoryData: any) => Promise<any>;
  deleteCategory: (id: number) => Promise<any>;

  // Order methods
  getOrders: (params?: any) => Promise<any>;
  getOrder: (id: number) => Promise<any>;
  createOrder: (orderData: any) => Promise<any>;
  updateOrderStatus: (
    id: number,
    status: string,
    notes?: string,
  ) => Promise<any>;
  confirmPayment: (id: number, paymentIntentId: string) => Promise<any>;
  cancelOrder: (id: number, reason: string) => Promise<any>;

  // Customer methods
  getCustomers: (params?: any) => Promise<any>;
  getCustomer: (id: number) => Promise<any>;
  updateCustomer: (id: number, customerData: any) => Promise<any>;
  deleteCustomer: (id: number) => Promise<any>;
  // Profile methods
  getProfile: () => Promise<any>;
  updateProfile: (profile: any) => Promise<any>;

  // Analytics methods
  getDashboardAnalytics: () => Promise<any>;
  getSalesReport: (params?: any) => Promise<any>;
  getProductAnalytics: (params?: any) => Promise<any>;
  getCustomerAnalytics: (params?: any) => Promise<any>;
}

// API service with enhanced methods
export const apiService: ApiService = {
  // Cache management
  clearCache,
  getCache: (key: string) => getCachedResponse(key),
  setCache: (key: string, data: unknown, ttl?: number) =>
    setCachedResponse(key, data, ttl),

  // Auth
  login: (credentials: { email: string; password: string }) =>
    api.post("/auth/login", credentials),

  register: (userData: {
    name: string;
    email: string;
    password: string;
    phone?: string;
  }) => api.post("/auth/register", userData),

  logout: () => {
    clearCache(); // Clear cache on logout
    return api.post("/auth/logout");
  },

  getCurrentUser: () => api.get("/auth/me"),

  // Products with caching
  getProducts: (params?: {
    category?: string;
    search?: string;
    page?: number;
    limit?: number;
  }) =>
    api.get("/products", {
      params,
      // Cache product listings for 2 minutes
      headers: { "Cache-Control": "max-age=120" },
    }),

  getProduct: (id: number) => api.get(`/products/${id}`),
  getProductOptions: (id: number) => api.get(`/products/${id}/options`),

  createProduct: (productData: unknown) => api.post("/products", productData),

  updateProduct: (id: number, productData: unknown) => {
    clearCache(); // Clear cache on product update
    return api.put(`/products/${id}`, productData);
  },

  deleteProduct: (id: number) => {
    clearCache(); // Clear cache on product deletion
    return api.delete(`/products/${id}`);
  },

  // Categories
  getCategories: () => api.get("/products/categories"),

  createCategory: (categoryData: unknown) => {
    clearCache();
    return api.post("/products/categories", categoryData);
  },

  updateCategory: (id: number, categoryData: unknown) => {
    clearCache();
    return api.put(`/products/categories/${id}`, categoryData);
  },

  deleteCategory: (id: number) => {
    clearCache();
    return api.delete(`/products/categories/${id}`);
  },

  // Orders
  getOrders: (params?: { status?: string; page?: number; limit?: number }) =>
    api.get("/orders", { params }),

  getOrder: (id: number) => api.get(`/orders/${id}`),

  createOrder: (orderData: unknown) => api.post("/orders", orderData),

  updateOrderStatus: (id: number, status: string, description?: string) =>
    api.patch(`/orders/${id}/status`, { status, description }),

  confirmPayment: (orderId: number, paymentIntentId: string) =>
    api.post(`/orders/${orderId}/confirm-payment`, {
      payment_intent_id: paymentIntentId,
    }),

  cancelOrder: (orderId: number, reason?: string) =>
    api.post(`/orders/${orderId}/cancel`, { reason }),

  // Customers
  getCustomers: (params?: { search?: string; page?: number; limit?: number }) =>
    api.get("/customers", { params }),

  getCustomer: (id: number) => api.get(`/customers/${id}`),

  updateCustomer: (id: number, customerData: unknown) =>
    api.put(`/customers/${id}`, customerData),

  deleteCustomer: (id: number) => api.delete(`/customers/${id}`),

  // Profile
  getProfile: () => api.get('/customers/me'),
  updateProfile: (profile: unknown) => api.put('/customers/me', profile),

  // Analytics
  getDashboardAnalytics: () => api.get("/analytics/dashboard"),

  getSalesReport: (params?: {
    start_date?: string;
    end_date?: string;
    group_by?: string;
  }) => api.get("/analytics/sales", { params }),

  getProductAnalytics: (params?: { start_date?: string; end_date?: string }) =>
    api.get("/analytics/products", { params }),

  getCustomerAnalytics: (params?: { start_date?: string; end_date?: string }) =>
    api.get("/analytics/customers", { params }),

  // File Upload with progress tracking
};

// Export axios instance for direct use if needed
export { api };

// Export types for external use
export type { ApiError, RetryConfig };

// Export the clearCache function
export { clearCache };
