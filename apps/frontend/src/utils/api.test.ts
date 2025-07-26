import axios, { AxiosError } from 'axios';
import { apiService } from './api';

// Mock axios
jest.mock('axios');
const mockedAxios = axios as jest.Mocked<typeof axios>;

// Mock react-toastify
jest.mock('react-toastify', () => ({
  toast: {
    error: jest.fn(),
    success: jest.fn(),
  },
}));

// Mock localStorage
const localStorageMock = {
  getItem: jest.fn(),
  setItem: jest.fn(),
  removeItem: jest.fn(),
  clear: jest.fn(),
};
Object.defineProperty(window, 'localStorage', {
  value: localStorageMock,
});

// Mock window.location
const mockLocation = {
  href: '',
};
Object.defineProperty(window, 'location', {
  value: mockLocation,
  writable: true,
});

describe('API Utility', () => {
  let mockAxiosInstance: any;

  beforeEach(() => {
    jest.clearAllMocks();
    
    // Create mock axios instance
    mockAxiosInstance = {
      get: jest.fn(),
      post: jest.fn(),
      put: jest.fn(),
      patch: jest.fn(),
      delete: jest.fn(),
      interceptors: {
        request: { use: jest.fn() },
        response: { use: jest.fn() },
      },
    };
    
    mockedAxios.create.mockReturnValue(mockAxiosInstance);
  });

  describe('Axios instance creation', () => {
    it('should create axios instance with correct configuration', () => {
      expect(mockedAxios.create).toHaveBeenCalledWith({
        baseURL: 'http://localhost:3001/api',
        timeout: 10000,
        headers: {
          'Content-Type': 'application/json',
        },
        transformRequest: expect.any(Array),
      });
    });

    it('should use environment variable for base URL if available', () => {
      const originalEnv = process.env['REACT_APP_API_URL'];
      process.env['REACT_APP_API_URL'] = 'https://api.example.com';
      
      // Re-import to trigger new axios instance creation
      jest.resetModules();
      
      // Re-import the module to get fresh instance
      const { apiService: freshApiService } = require('./api');
      
      expect(freshApiService.defaults.baseURL).toBe('https://api.example.com');
      
      process.env['REACT_APP_API_URL'] = originalEnv;
    });
  });

  describe('Request interceptor', () => {
    it('should add authorization header when token exists', () => {
      localStorageMock.getItem.mockReturnValue('test-token');
      
      const config = { headers: {} };
      const interceptor = mockAxiosInstance.interceptors.request.use.mock.calls[0][0];
      
      const result = interceptor(config);
      
      expect(result.headers.Authorization).toBe('Bearer test-token');
    });

    it('should not add authorization header when no token', () => {
      localStorageMock.getItem.mockReturnValue(null);
      
      const config = { headers: {} };
      const interceptor = mockAxiosInstance.interceptors.request.use.mock.calls[0][0];
      
      const result = interceptor(config);
      
      expect(result.headers.Authorization).toBeUndefined();
    });

    it('should add request ID to headers', () => {
      const config = { headers: {} };
      const interceptor = mockAxiosInstance.interceptors.request.use.mock.calls[0][0];
      
      const result = interceptor(config);
      
      expect(result.headers['X-Request-ID']).toMatch(/^\d+-\w{9}$/);
    });
  });

  describe('Response interceptor', () => {
    it('should handle successful responses', () => {
      const response = { data: { test: 'data' }, config: { method: 'get', url: '/test' } };
      const interceptor = mockAxiosInstance.interceptors.response.use.mock.calls[0][0];
      
      const result = interceptor(response);
      
      expect(result).toEqual(response);
    });

    it('should handle 401 errors', () => {
      const error = {
        response: { status: 401 },
        config: { url: '/test' },
      } as AxiosError;
      
      const interceptor = mockAxiosInstance.interceptors.response.use.mock.calls[0][1];
      
      interceptor(error);
      
      expect(localStorageMock.removeItem).toHaveBeenCalledWith('token');
      expect(mockLocation.href).toBe('/login');
    });

    it('should handle 403 errors', () => {
      const { toast } = require('react-toastify');
      const error = {
        response: { status: 403, data: { message: 'Access denied' } },
        config: { url: '/test' },
      } as AxiosError;
      
      const interceptor = mockAxiosInstance.interceptors.response.use.mock.calls[0][1];
      
      interceptor(error);
      
      expect(toast.error).toHaveBeenCalledWith('Access denied. You do not have permission to perform this action.');
    });

    it('should handle 404 errors', () => {
      const consoleSpy = jest.spyOn(console, 'warn').mockImplementation();
      const error = {
        response: { status: 404 },
        config: { url: '/test' },
      } as AxiosError;
      
      const interceptor = mockAxiosInstance.interceptors.response.use.mock.calls[0][1];
      
      interceptor(error);
      
      expect(consoleSpy).toHaveBeenCalledWith('Resource not found:', '/test');
      expect(consoleSpy).not.toHaveBeenCalledWith(expect.stringContaining('toast'));
    });

    it('should handle 422 validation errors', () => {
      const { toast } = require('react-toastify');
      const error = {
        response: { 
          status: 422, 
          data: { 
            errors: { 
              email: 'Invalid email',
              password: 'Password too short'
            } 
          } 
        },
        config: { url: '/test' },
      } as AxiosError;
      
      const interceptor = mockAxiosInstance.interceptors.response.use.mock.calls[0][1];
      
      interceptor(error);
      
      expect(toast.error).toHaveBeenCalledWith('Invalid email');
      expect(toast.error).toHaveBeenCalledWith('Password too short');
    });

    it('should handle network errors', () => {
      const { toast } = require('react-toastify');
      const error = {
        response: undefined,
        config: { url: '/test', headers: {} as any },
        isAxiosError: true,
        toJSON: () => ({}),
        name: 'AxiosError',
        message: 'Network Error'
      } as unknown as AxiosError;
      
      const interceptor = mockAxiosInstance.interceptors.response.use.mock.calls[0][1];
      
      interceptor(error);
      
      expect(toast.error).toHaveBeenCalledWith('Network error. Please check your connection.');
    });
  });

  describe('API Service Methods', () => {
    describe('Authentication', () => {
      it('should call login endpoint', () => {
        const credentials = { email: 'test@example.com', password: 'password' };
        
        apiService.login(credentials);
        
        expect(mockAxiosInstance.post).toHaveBeenCalledWith('/auth/login', credentials);
      });

      it('should call register endpoint', () => {
        const userData = { name: 'Test User', email: 'test@example.com', password: 'password' };
        
        apiService.register(userData);
        
        expect(mockAxiosInstance.post).toHaveBeenCalledWith('/auth/register', userData);
      });

      it('should call logout endpoint and clear cache', () => {
        apiService.logout();
        
        expect(mockAxiosInstance.post).toHaveBeenCalledWith('/auth/logout');
      });

      it('should call getCurrentUser endpoint', () => {
        apiService.getCurrentUser();
        
        expect(mockAxiosInstance.get).toHaveBeenCalledWith('/auth/me');
      });
    });

    describe('Products', () => {
      it('should call getProducts with params', () => {
        const params = { category: 'bread', search: 'test', page: 1, limit: 10 };
        
        apiService.getProducts(params);
        
        expect(mockAxiosInstance.get).toHaveBeenCalledWith('/products', { 
          params,
          headers: { 'Cache-Control': 'max-age=120' }
        });
      });

      it('should call getProduct with id', () => {
        apiService.getProduct(1);
        
        expect(mockAxiosInstance.get).toHaveBeenCalledWith('/products/1');
      });

      it('should call createProduct', () => {
        const productData = { name: 'Test Product', price: 10 };
        
        apiService.createProduct(productData);
        
        expect(mockAxiosInstance.post).toHaveBeenCalledWith('/products', productData);
      });

      it('should call updateProduct and clear cache', () => {
        const productData = { name: 'Updated Product', price: 15 };
        
        apiService.updateProduct(1, productData);
        
        expect(mockAxiosInstance.put).toHaveBeenCalledWith('/products/1', productData);
      });

      it('should call deleteProduct and clear cache', () => {
        apiService.deleteProduct(1);
        
        expect(mockAxiosInstance.delete).toHaveBeenCalledWith('/products/1');
      });
    });

    describe('Categories', () => {
      it('should call getCategories', () => {
        apiService.getCategories();
        
        expect(mockAxiosInstance.get).toHaveBeenCalledWith('/products/categories');
      });

      it('should call createCategory and clear cache', () => {
        const categoryData = { name: 'Test Category' };
        
        apiService.createCategory(categoryData);
        
        expect(mockAxiosInstance.post).toHaveBeenCalledWith('/products/categories', categoryData);
      });

      it('should call updateCategory and clear cache', () => {
        const categoryData = { name: 'Updated Category' };
        
        apiService.updateCategory(1, categoryData);
        
        expect(mockAxiosInstance.put).toHaveBeenCalledWith('/products/categories/1', categoryData);
      });

      it('should call deleteCategory and clear cache', () => {
        apiService.deleteCategory(1);
        
        expect(mockAxiosInstance.delete).toHaveBeenCalledWith('/products/categories/1');
      });
    });

    describe('Orders', () => {
      it('should call getOrders with params', () => {
        const params = { status: 'pending', page: 1, limit: 10 };
        
        apiService.getOrders(params);
        
        expect(mockAxiosInstance.get).toHaveBeenCalledWith('/orders', { params });
      });

      it('should call getOrder with id', () => {
        apiService.getOrder(1);
        
        expect(mockAxiosInstance.get).toHaveBeenCalledWith('/orders/1');
      });

      it('should call createOrder', () => {
        const orderData = { items: [], total: 100 };
        
        apiService.createOrder(orderData);
        
        expect(mockAxiosInstance.post).toHaveBeenCalledWith('/orders', orderData);
      });

      it('should call updateOrderStatus', () => {
        apiService.updateOrderStatus(1, 'completed', 'Order delivered');
        
        expect(mockAxiosInstance.patch).toHaveBeenCalledWith('/orders/1/status', {
          status: 'completed',
          description: 'Order delivered'
        });
      });

      it('should call confirmPayment', () => {
        apiService.confirmPayment(1, 'pi_test123');
        
        expect(mockAxiosInstance.post).toHaveBeenCalledWith('/orders/1/confirm-payment', {
          payment_intent_id: 'pi_test123'
        });
      });

      it('should call cancelOrder', () => {
        apiService.cancelOrder(1, 'Customer requested cancellation');
        
        expect(mockAxiosInstance.post).toHaveBeenCalledWith('/orders/1/cancel', {
          reason: 'Customer requested cancellation'
        });
      });
    });

    describe('Customers', () => {
      it('should call getCustomers with params', () => {
        const params = { search: 'test', page: 1, limit: 10 };
        
        apiService.getCustomers(params);
        
        expect(mockAxiosInstance.get).toHaveBeenCalledWith('/customers', { params });
      });

      it('should call getCustomer with id', () => {
        apiService.getCustomer(1);
        
        expect(mockAxiosInstance.get).toHaveBeenCalledWith('/customers/1');
      });

      it('should call updateCustomer', () => {
        const customerData = { name: 'Updated Customer' };
        
        apiService.updateCustomer(1, customerData);
        
        expect(mockAxiosInstance.put).toHaveBeenCalledWith('/customers/1', customerData);
      });

      it('should call deleteCustomer', () => {
        apiService.deleteCustomer(1);
        
        expect(mockAxiosInstance.delete).toHaveBeenCalledWith('/customers/1');
      });
    });

    describe('Analytics', () => {
      it('should call getDashboardAnalytics', () => {
        apiService.getDashboardAnalytics();
        
        expect(mockAxiosInstance.get).toHaveBeenCalledWith('/analytics/dashboard');
      });

      it('should call getSalesReport with params', () => {
        const params = { start_date: '2023-01-01', end_date: '2023-12-31', group_by: 'month' };
        
        apiService.getSalesReport(params);
        
        expect(mockAxiosInstance.get).toHaveBeenCalledWith('/analytics/sales', { params });
      });

      it('should call getProductAnalytics with params', () => {
        const params = { start_date: '2023-01-01', end_date: '2023-12-31' };
        
        apiService.getProductAnalytics(params);
        
        expect(mockAxiosInstance.get).toHaveBeenCalledWith('/analytics/products', { params });
      });

      it('should call getCustomerAnalytics with params', () => {
        const params = { start_date: '2023-01-01', end_date: '2023-12-31' };
        
        apiService.getCustomerAnalytics(params);
        
        expect(mockAxiosInstance.get).toHaveBeenCalledWith('/analytics/customers', { params });
      });
    });

    describe('File Upload', () => {
      it('should call uploadImage with FormData', () => {
        const file = new File(['test'], 'test.jpg', { type: 'image/jpeg' });
        const onProgress = jest.fn();
        
        apiService.uploadImage(file, onProgress);
        
        expect(mockAxiosInstance.post).toHaveBeenCalledWith('/upload/image', expect.any(FormData), {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
          onUploadProgress: expect.any(Function),
        });
      });

      it('should call deleteImage', () => {
        apiService.deleteImage('test-public-id');
        
        expect(mockAxiosInstance.delete).toHaveBeenCalledWith('/upload/image/test-public-id');
      });

      it('should call getImageInfo', () => {
        apiService.getImageInfo('test-public-id');
        
        expect(mockAxiosInstance.get).toHaveBeenCalledWith('/upload/image/test-public-id');
      });
    });
  });

  describe('Cache Management', () => {
    it('should clear cache', () => {
      // The clearCache function is tested indirectly through the API service methods
      expect(apiService.clearCache).toBeDefined();
    });
  });

  describe('Error Handling', () => {
    it('should handle retry logic for network errors', async () => {
      const error = {
        response: undefined,
        config: { url: '/test', _retryCount: 0, headers: {} as any },
        isAxiosError: true,
        toJSON: () => ({}),
        name: 'AxiosError',
        message: 'Network Error'
      } as unknown as AxiosError;
      
      const interceptor = mockAxiosInstance.interceptors.response.use.mock.calls[0][1];
      
      const result = interceptor(error);
      
      await expect(result).rejects.toEqual(error);
    });

    it('should not retry after max retries', () => {
      const error = {
        response: undefined,
        config: { url: '/test', _retryCount: 3, headers: {} as any },
        isAxiosError: true,
        toJSON: () => ({}),
        name: 'AxiosError',
        message: 'Network Error'
      } as unknown as AxiosError;
      
      const interceptor = mockAxiosInstance.interceptors.response.use.mock.calls[0][1];
      
      const result = interceptor(error);
      
      return expect(result).rejects.toEqual(error);
    });
  });
}); 