import axios from 'axios';
import { apiService } from './api';
import { AxiosError } from 'axios';

// Mock axios
jest.mock('axios');
const mockedAxios = axios as jest.Mocked<typeof axios>;

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

// Mock location
const mockLocation = {
  href: '',
};
Object.defineProperty(window, 'location', {
  value: mockLocation,
});

// Mock react-toastify
jest.mock('react-toastify', () => ({
  toast: {
    error: jest.fn(),
    success: jest.fn(),
    warning: jest.fn(),
    info: jest.fn(),
  },
}));

describe('API Service', () => {
  let mockAxiosInstance: any;

  beforeEach(() => {
    jest.clearAllMocks();

    // Create mock axios instance
    mockAxiosInstance = {
      interceptors: {
        request: {
          use: jest.fn(),
        },
        response: {
          use: jest.fn(),
        },
      },
      get: jest.fn(),
      post: jest.fn(),
      put: jest.fn(),
      patch: jest.fn(),
      delete: jest.fn(),
    };

    (mockedAxios.create as jest.Mock).mockReturnValue(mockAxiosInstance);
  });

  describe('Axios instance creation', () => {
    it('should create axios instance with correct base URL', () => {
      expect(mockedAxios.create).toHaveBeenCalledWith({
        baseURL: process.env.REACT_APP_API_URL || 'http://localhost:3001/api',
        timeout: 10000,
        headers: {
          'Content-Type': 'application/json',
        },
      });
    });
  });

  describe('Request interceptor', () => {
    it('should add authorization header when token exists', () => {
      localStorageMock.getItem.mockReturnValue('test-token');

      const config = { headers: {} };
      const interceptor =
        mockAxiosInstance.interceptors.request.use.mock.calls[0][0];

      const result = interceptor(config);

      expect(result.headers.Authorization).toBe('Bearer test-token');
    });

    it('should not add authorization header when no token', () => {
      localStorageMock.getItem.mockReturnValue(null);

      const config = { headers: {} };
      const interceptor =
        mockAxiosInstance.interceptors.request.use.mock.calls[0][0];

      const result = interceptor(config);

      expect(result.headers.Authorization).toBeUndefined();
    });

    it('should add request ID to headers', () => {
      const config = { headers: {} };
      const interceptor =
        mockAxiosInstance.interceptors.request.use.mock.calls[0][0];

      const result = interceptor(config);

      expect(result.headers['X-Request-ID']).toMatch(/^\d+-\w{9}$/);
    });
  });

  describe('Response interceptor', () => {
    it('should handle successful responses', () => {
      const response = {
        data: { test: 'data' },
        config: { method: 'get', url: '/test' },
      };
      const interceptor =
        mockAxiosInstance.interceptors.response.use.mock.calls[0][0];

      const result = interceptor(response);

      expect(result).toEqual(response);
    });

    it('should handle 401 errors', () => {
      const error = {
        response: { status: 401 },
        config: { url: '/test' },
      } as AxiosError;

      const interceptor =
        mockAxiosInstance.interceptors.response.use.mock.calls[0][1];

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

      const interceptor =
        mockAxiosInstance.interceptors.response.use.mock.calls[0][1];

      interceptor(error);

      expect(toast.error).toHaveBeenCalledWith(
        'Access denied. You do not have permission to perform this action.'
      );
    });

    it('should handle 404 errors', () => {
      const consoleSpy = jest.spyOn(console, 'warn').mockImplementation();
      const error = {
        response: { status: 404 },
        config: { url: '/test' },
      } as AxiosError;

      const interceptor =
        mockAxiosInstance.interceptors.response.use.mock.calls[0][1];

      interceptor(error);

      expect(consoleSpy).toHaveBeenCalledWith('Resource not found:', '/test');
      expect(consoleSpy).not.toHaveBeenCalledWith(
        expect.stringContaining('toast')
      );
    });

    it('should handle 422 validation errors', () => {
      const { toast } = require('react-toastify');
      const error = {
        response: {
          status: 422,
          data: {
            errors: {
              email: ['Invalid email format'],
              password: ['Password is required'],
            },
          },
        },
        config: { url: '/test' },
      } as AxiosError;

      const interceptor =
        mockAxiosInstance.interceptors.response.use.mock.calls[0][1];

      interceptor(error);

      expect(toast.error).toHaveBeenCalledWith('Invalid email format');
      expect(toast.error).toHaveBeenCalledWith('Password is required');
    });

    it('should handle 500 errors', () => {
      const { toast } = require('react-toastify');
      const error = {
        response: { status: 500, data: { message: 'Server error' } },
        config: { url: '/test' },
      } as AxiosError;

      const interceptor =
        mockAxiosInstance.interceptors.response.use.mock.calls[0][1];

      interceptor(error);

      expect(toast.error).toHaveBeenCalledWith(
        'Server error. Please try again later.'
      );
    });

    it('should handle network errors', () => {
      const { toast } = require('react-toastify');
      const error = {
        message: 'Network Error',
        config: { url: '/test' },
      } as AxiosError;

      const interceptor =
        mockAxiosInstance.interceptors.response.use.mock.calls[0][1];

      interceptor(error);

      expect(toast.error).toHaveBeenCalledWith(
        'Network error. Please check your connection and try again.'
      );
    });

    it('should handle timeout errors', () => {
      const { toast } = require('react-toastify');
      const error = {
        code: 'ECONNABORTED',
        message: 'timeout of 10000ms exceeded',
        config: { url: '/test' },
      } as AxiosError;

      const interceptor =
        mockAxiosInstance.interceptors.response.use.mock.calls[0][1];

      interceptor(error);

      expect(toast.error).toHaveBeenCalledWith(
        'Request timeout. Please try again.'
      );
    });
  });

  describe('Auth methods', () => {
    it('should call login endpoint', () => {
      const credentials = { email: 'test@example.com', password: 'password' };

      apiService.login(credentials);

      expect(mockAxiosInstance.post).toHaveBeenCalledWith(
        '/auth/login',
        credentials
      );
    });

    it('should call register endpoint', () => {
      const userData = { name: 'Test User', email: 'test@example.com' };

      apiService.register(userData);

      expect(mockAxiosInstance.post).toHaveBeenCalledWith(
        '/auth/register',
        userData
      );
    });

    it('should call logout endpoint', () => {
      apiService.logout();

      expect(mockAxiosInstance.post).toHaveBeenCalledWith('/auth/logout');
    });

    it('should call getCurrentUser endpoint', () => {
      apiService.getCurrentUser();

      expect(mockAxiosInstance.get).toHaveBeenCalledWith('/auth/me');
    });
  });

  describe('Product methods', () => {
    it('should call getProducts with params', () => {
      const params = { category: 'pizza', page: 1 };

      apiService.getProducts(params);

      expect(mockAxiosInstance.get).toHaveBeenCalledWith('/products', {
        params,
        headers: { 'Cache-Control': 'max-age=120' },
      });
    });

    it('should call getProduct', () => {
      apiService.getProduct(1);

      expect(mockAxiosInstance.get).toHaveBeenCalledWith('/products/1');
    });

    it('should call createProduct', () => {
      const productData = { name: 'Test Product', price: 10 };

      apiService.createProduct(productData);

      expect(mockAxiosInstance.post).toHaveBeenCalledWith(
        '/products',
        productData
      );
    });

    it('should call updateProduct', () => {
      const productData = { name: 'Updated Product', price: 15 };

      apiService.updateProduct(1, productData);

      expect(mockAxiosInstance.put).toHaveBeenCalledWith(
        '/products/1',
        productData
      );
    });

    it('should call deleteProduct', () => {
      apiService.deleteProduct(1);

      expect(mockAxiosInstance.delete).toHaveBeenCalledWith('/products/1');
    });
  });

  describe('Category methods', () => {
    it('should call getCategories', () => {
      apiService.getCategories();

      expect(mockAxiosInstance.get).toHaveBeenCalledWith(
        '/products/categories'
      );
    });

    it('should call createCategory', () => {
      const categoryData = { name: 'Test Category' };

      apiService.createCategory(categoryData);

      expect(mockAxiosInstance.post).toHaveBeenCalledWith(
        '/products/categories',
        categoryData
      );
    });

    it('should call updateCategory', () => {
      const categoryData = { name: 'Updated Category' };

      apiService.updateCategory(1, categoryData);

      expect(mockAxiosInstance.put).toHaveBeenCalledWith(
        '/products/categories/1',
        categoryData
      );
    });

    it('should call deleteCategory', () => {
      apiService.deleteCategory(1);

      expect(mockAxiosInstance.delete).toHaveBeenCalledWith(
        '/products/categories/1'
      );
    });
  });

  describe('Order methods', () => {
    it('should call getOrders with params', () => {
      const params = { status: 'pending', page: 1 };

      apiService.getOrders(params);

      expect(mockAxiosInstance.get).toHaveBeenCalledWith('/orders', {
        params,
      });
    });

    it('should call getOrder', () => {
      apiService.getOrder(1);

      expect(mockAxiosInstance.get).toHaveBeenCalledWith('/orders/1');
    });

    it('should call createOrder', () => {
      const orderData = { items: [], total: 25 };

      apiService.createOrder(orderData);

      expect(mockAxiosInstance.post).toHaveBeenCalledWith('/orders', orderData);
    });

    it('should call updateOrderStatus', () => {
      apiService.updateOrderStatus(1, 'completed', 'Order delivered');

      expect(mockAxiosInstance.patch).toHaveBeenCalledWith('/orders/1/status', {
        status: 'completed',
        notes: 'Order delivered',
      });
    });

    it('should call confirmPayment', () => {
      apiService.confirmPayment(1, 'pi_test123');

      expect(mockAxiosInstance.post).toHaveBeenCalledWith(
        '/orders/1/confirm-payment',
        {
          payment_intent_id: 'pi_test123',
        }
      );
    });

    it('should call cancelOrder', () => {
      apiService.cancelOrder(1, 'Customer requested cancellation');

      expect(mockAxiosInstance.post).toHaveBeenCalledWith('/orders/1/cancel', {
        reason: 'Customer requested cancellation',
      });
    });
  });

  describe('Customer methods', () => {
    it('should call getCustomers with params', () => {
      const params = { search: 'john', page: 1 };

      apiService.getCustomers(params);

      expect(mockAxiosInstance.get).toHaveBeenCalledWith('/customers', {
        params,
      });
    });

    it('should call getCustomer', () => {
      apiService.getCustomer(1);

      expect(mockAxiosInstance.get).toHaveBeenCalledWith('/customers/1');
    });

    it('should call updateCustomer', () => {
      const customerData = { name: 'Updated Customer' };

      apiService.updateCustomer(1, customerData);

      expect(mockAxiosInstance.put).toHaveBeenCalledWith(
        '/customers/1',
        customerData
      );
    });

    it('should call deleteCustomer', () => {
      apiService.deleteCustomer(1);

      expect(mockAxiosInstance.delete).toHaveBeenCalledWith('/customers/1');
    });
  });

  describe('Analytics methods', () => {
    it('should call getDashboardAnalytics', () => {
      apiService.getDashboardAnalytics();

      expect(mockAxiosInstance.get).toHaveBeenCalledWith(
        '/analytics/dashboard'
      );
    });

    it('should call getSalesReport with params', () => {
      const params = { start_date: '2023-01-01', end_date: '2023-12-31' };

      apiService.getSalesReport(params);

      expect(mockAxiosInstance.get).toHaveBeenCalledWith('/analytics/sales', {
        params,
      });
    });

    it('should call getProductAnalytics with params', () => {
      const params = { category: 'pizza', period: 'month' };

      apiService.getProductAnalytics(params);

      expect(mockAxiosInstance.get).toHaveBeenCalledWith(
        '/analytics/products',
        { params }
      );
    });

    it('should call getCustomerAnalytics with params', () => {
      const params = { period: 'year', limit: 10 };

      apiService.getCustomerAnalytics(params);

      expect(mockAxiosInstance.get).toHaveBeenCalledWith(
        '/analytics/customers',
        { params }
      );
    });
  });

  describe('Upload methods', () => {
    it('should call uploadImage', () => {
      const file = new File(['test'], 'test.jpg', { type: 'image/jpeg' });
      const onProgress = jest.fn();

      apiService.uploadImage(file, onProgress);

      expect(mockAxiosInstance.post).toHaveBeenCalledWith(
        '/upload/image',
        expect.any(FormData),
        {
          headers: { 'Content-Type': 'multipart/form-data' },
          onUploadProgress: expect.any(Function),
        }
      );
    });

    it('should call deleteImage', () => {
      apiService.deleteImage('test-public-id');

      expect(mockAxiosInstance.delete).toHaveBeenCalledWith(
        '/upload/image/test-public-id'
      );
    });

    it('should call getImageInfo', () => {
      apiService.getImageInfo('test-public-id');

      expect(mockAxiosInstance.get).toHaveBeenCalledWith(
        '/upload/image/test-public-id'
      );
    });
  });

  describe('Error handling', () => {
    it('should handle response errors with toast notifications', () => {
      const { toast } = require('react-toastify');
      const error = {
        response: { status: 500, data: { message: 'Server error' } },
        config: { url: '/test' },
      } as AxiosError;

      const interceptor =
        mockAxiosInstance.interceptors.response.use.mock.calls[0][1];

      interceptor(error);

      expect(toast.error).toHaveBeenCalledWith(
        'Server error. Please try again later.'
      );
    });

    it('should handle network errors with toast notifications', () => {
      const { toast } = require('react-toastify');
      const error = {
        message: 'Network Error',
        config: { url: '/test' },
      } as AxiosError;

      const interceptor =
        mockAxiosInstance.interceptors.response.use.mock.calls[0][1];

      interceptor(error);

      expect(toast.error).toHaveBeenCalledWith(
        'Network error. Please check your connection and try again.'
      );
    });
  });
});
