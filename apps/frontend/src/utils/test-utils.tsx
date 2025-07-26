// Mock apiService before importing slices that use it
jest.mock('../utils/api', () => ({
  apiService: {
    getOrders: jest.fn(),
    getOrder: jest.fn(),
    updateOrderStatus: jest.fn(),
    createOrder: jest.fn(),
    getProducts: jest.fn(),
    getProduct: jest.fn(),
    getCustomers: jest.fn(),
    getCustomer: jest.fn(),
    getDashboardAnalytics: jest.fn(),
    getAnalytics: jest.fn(),
    login: jest.fn(),
    register: jest.fn(),
    logout: jest.fn(),
    refreshToken: jest.fn(),
    uploadImage: jest.fn(),
    deleteProduct: jest.fn(),
    createProduct: jest.fn(),
    updateProduct: jest.fn(),
    updateCustomer: jest.fn(),
    deleteCustomer: jest.fn(),
    getCategories: jest.fn(),
    getCurrentUser: jest.fn(),
    clearCache: jest.fn(),
  },
  api: {
    get: jest.fn(),
    post: jest.fn(),
    put: jest.fn(),
    delete: jest.fn(),
    patch: jest.fn(),
  },
  clearCache: jest.fn(),
}));

import { ReactElement } from 'react';
import { render, RenderOptions } from '@testing-library/react';
import { Provider } from 'react-redux';
import { BrowserRouter } from 'react-router-dom';
import { configureStore } from '@reduxjs/toolkit';

// Import all reducers
import cartReducer from '../features/cart/cartSlice';
import authReducer from '../features/auth/authSlice';
import languageReducer from '../features/language/languageSlice';
import uiReducer from '../features/ui/uiSlice';
import ordersReducer from '../features/orders/ordersSlice';
import productsReducer from '../features/products/productsSlice';
import customersReducer from '../features/customers/customersSlice';
import analyticsReducer from '../features/analytics/analyticsSlice';

// Create a test store without persistence
export const createTestStore = (preloadedState = {}) => {
  const store = configureStore({
    reducer: {
      cart: cartReducer,
      auth: authReducer,
      language: languageReducer,
      ui: uiReducer,
      orders: ordersReducer,
      products: productsReducer,
      customers: customersReducer,
      analytics: analyticsReducer,
    },
    preloadedState,
    middleware: (getDefaultMiddleware) =>
      getDefaultMiddleware({
        serializableCheck: {
          // Ignore all non-serializable actions in tests
          ignoredActions: ['*'],
          ignoredPaths: ['*'],
        },
        immutableCheck: false,
      }),
  });

  return { store };
};

// Custom render function that includes providers
interface CustomRenderOptions extends Omit<RenderOptions, 'wrapper'> {
  preloadedState?: Record<string, unknown>;
  route?: string;
}

const customRender = (
  ui: ReactElement,
  options: CustomRenderOptions = {}
) => {
  const { preloadedState, route, ...renderOptions } = options;
  const { store } = createTestStore(preloadedState);

  // Set up route if provided
  if (route) {
    window.history.pushState({}, '', route);
  }

  const result = render(ui, {
    wrapper: ({ children }) => (
      <Provider store={store}>
        <BrowserRouter>
          {children}
        </BrowserRouter>
      </Provider>
    ),
    ...renderOptions,
  });

  return {
    ...result,
    store,
  };
};

// Re-export everything
export * from '@testing-library/react';
export { customRender as render };

// Test data factories
export const createMockProduct = (overrides = {}) => ({
  id: 1,
  name: 'Test Product',
  name_en: 'Test Product',
  name_he: 'מוצר בדיקה',
  description: 'A test product',
  price: 25.00,
  category_id: 1,
  image_url: 'https://example.com/image.jpg',
  is_active: true,
  preparation_time_minutes: 15,
  ...overrides,
});

export const createMockCartItem = (overrides = {}) => ({
  id: '1',
  name: 'Test Product',
  price: 25.00,
  quantity: 1,
  image: 'https://example.com/image.jpg',
  category: 'Test Category',
  ...overrides,
});

export const createMockUser = (overrides = {}) => ({
  id: '1',
  name: 'Test User',
  email: 'test@example.com',
  phone: '+972-50-123-4567',
  isAdmin: false,
  ...overrides,
});

export const createMockOrder = (overrides = {}) => ({
  id: '1',
  customer_id: '1',
  customer_name: 'Test Customer',
  customer_phone: '+972-50-123-4567',
  customer_email: 'customer@example.com',
  items: [],
  total_amount: 50.00,
  status: 'pending',
  payment_status: 'pending',
  created_at: '2023-01-01T00:00:00Z',
  updated_at: '2023-01-01T00:00:00Z',
  ...overrides,
});

export const createMockCustomer = (overrides = {}) => ({
  id: '1',
  name: 'Test Customer',
  name_en: 'Test Customer',
  name_he: 'לקוח בדיקה',
  email: 'customer@example.com',
  phone: '+972-50-123-4567',
  total_orders: 5,
  total_spent: 250.00,
  member_since: '2023-01-01',
  ...overrides,
});

// Common test states
export const mockAuthState = {
  user: createMockUser({ isAdmin: true }),
  isAuthenticated: true,
  isLoading: false,
  error: null,
};

export const mockCartState = {
  items: [createMockCartItem()],
  isOpen: false,
  lastUpdated: Date.now(),
};

export const mockProductsState = {
  products: [createMockProduct()],
  categories: [{ id: 1, name: 'Test Category' }],
  isLoading: false,
  error: null,
};

// Utility functions
export const waitForLoadingToFinish = () => 
  new Promise(resolve => setTimeout(resolve, 0));

export const mockApiResponse = <T,>(data: T) => 
  Promise.resolve({ data });

export const mockApiError = (message: string) => 
  Promise.reject(new Error(message));

// Test helper to verify setup
export const testSetup = () => {
  const { store } = createTestStore();
  return { store };
};

// Mock API service
export const mockApiService = {
  login: jest.fn(),
  getProducts: jest.fn(),
  getOrders: jest.fn(),
  getCustomers: jest.fn(),
  getDashboardAnalytics: jest.fn(),
  createOrder: jest.fn(),
  updateOrderStatus: jest.fn(),
}; 