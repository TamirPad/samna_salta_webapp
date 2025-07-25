import axios, { AxiosInstance, InternalAxiosRequestConfig, AxiosResponse } from 'axios';
import { toast } from 'react-toastify';

// Create axios instance
const api: AxiosInstance = axios.create({
  baseURL: process.env.REACT_APP_API_URL || 'http://localhost:3001/api',
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add auth token
api.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    const token = localStorage.getItem('token');
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor for error handling
api.interceptors.response.use(
  (response: AxiosResponse) => {
    return response;
  },
  (error) => {
    const { response } = error;
    
    if (response) {
      const { status, data } = response;
      
      switch (status) {
        case 401:
          // Unauthorized - clear token and redirect to login
          localStorage.removeItem('token');
          window.location.href = '/login';
          toast.error('Session expired. Please login again.');
          break;
          
        case 403:
          // Forbidden
          toast.error('Access denied. You do not have permission to perform this action.');
          break;
          
        case 404:
          // Not found
          toast.error('Resource not found.');
          break;
          
        case 422:
          // Validation error
          if (data.errors) {
            Object.values(data.errors).forEach((error: any) => {
              toast.error(error);
            });
          } else {
            toast.error(data.message || 'Validation error');
          }
          break;
          
        case 500:
          // Server error
          toast.error('Server error. Please try again later.');
          break;
          
        default:
          // Other errors
          toast.error(data.message || 'An error occurred');
      }
    } else {
      // Network error
      toast.error('Network error. Please check your connection.');
    }
    
    return Promise.reject(error);
  }
);

// API methods
export const apiService = {
  // Auth
  login: (credentials: { email: string; password: string }) =>
    api.post('/auth/login', credentials),
    
  register: (userData: { name: string; email: string; password: string; phone?: string }) =>
    api.post('/auth/register', userData),
    
  logout: () => api.post('/auth/logout'),
  
  getCurrentUser: () => api.get('/auth/me'),
  
  // Products
  getProducts: (params?: { category?: string; search?: string; page?: number; limit?: number }) =>
    api.get('/products', { params }),
    
  getProduct: (id: number) => api.get(`/products/${id}`),
  
  createProduct: (productData: any) => api.post('/products', productData),
  
  updateProduct: (id: number, productData: any) => api.put(`/products/${id}`, productData),
  
  deleteProduct: (id: number) => api.delete(`/products/${id}`),
  
  // Categories
  getCategories: () => api.get('/categories'),
  
  getCategory: (id: number) => api.get(`/categories/${id}`),
  
  createCategory: (categoryData: any) => api.post('/categories', categoryData),
  
  updateCategory: (id: number, categoryData: any) => api.put(`/categories/${id}`, categoryData),
  
  deleteCategory: (id: number) => api.delete(`/categories/${id}`),
  
  // Orders
  getOrders: (params?: { status?: string; page?: number; limit?: number }) =>
    api.get('/orders', { params }),
    
  getOrder: (id: number) => api.get(`/orders/${id}`),
  
  createOrder: (orderData: any) => api.post('/orders', orderData),
  
  updateOrderStatus: (id: number, status: string) => api.patch(`/orders/${id}/status`, { status }),
  
  // Customers
  getCustomers: (params?: { search?: string; page?: number; limit?: number }) =>
    api.get('/customers', { params }),
    
  getCustomer: (id: number) => api.get(`/customers/${id}`),
  
  updateCustomer: (id: number, customerData: any) => api.put(`/customers/${id}`, customerData),
  
  // Analytics
  getAnalytics: (params?: { start_date?: string; end_date?: string }) =>
    api.get('/analytics', { params }),
    
  getDailySales: (params?: { start_date?: string; end_date?: string }) =>
    api.get('/analytics/daily-sales', { params }),
    
  getTopProducts: (params?: { limit?: number; start_date?: string; end_date?: string }) =>
    api.get('/analytics/top-products', { params }),
  
  // Business Settings
  getBusinessSettings: () => api.get('/business-settings'),
  
  updateBusinessSettings: (settings: any) => api.put('/business-settings', settings),
  
  // File Upload
  uploadImage: (file: File) => {
    const formData = new FormData();
    formData.append('image', file);
    return api.post('/upload/image', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
  },
};

export { api }; 