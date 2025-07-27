import React, { ReactElement, ReactNode, useState, useEffect } from 'react';
import { render, RenderOptions } from '@testing-library/react';
import { Provider } from 'react-redux';
import { MemoryRouter } from 'react-router-dom';
import { configureStore } from '@reduxjs/toolkit';
import authReducer from '../features/auth/authSlice';
import cartReducer from '../features/cart/cartSlice';
import productsReducer from '../features/products/productsSlice';
import ordersReducer from '../features/orders/ordersSlice';
import customersReducer from '../features/customers/customersSlice';
import analyticsReducer from '../features/analytics/analyticsSlice';
import languageReducer from '../features/language/languageSlice';
import uiReducer from '../features/ui/uiSlice';

// Create a custom render function that includes providers
const createTestStore = (preloadedState = {}) => {
  return configureStore({
    reducer: {
      auth: authReducer,
      cart: cartReducer,
      products: productsReducer,
      orders: ordersReducer,
      customers: customersReducer,
      analytics: analyticsReducer,
      language: languageReducer,
      ui: uiReducer,
    },
    preloadedState,
  });
};

interface CustomRenderOptions extends Omit<RenderOptions, 'wrapper'> {
  preloadedState?: any;
  store?: ReturnType<typeof createTestStore>;
  route?: string;
}

const customRender = (
  ui: ReactElement,
  {
    preloadedState = {},
    store = createTestStore(preloadedState),
    route = '/',
    ...renderOptions
  }: CustomRenderOptions = {}
) => {
  const Wrapper = ({ children }: { children: React.ReactNode }) => {
    return (
      <Provider store={store}>
        <MemoryRouter initialEntries={[route]}>{children}</MemoryRouter>
      </Provider>
    );
  };

  return { store, ...render(ui, { wrapper: Wrapper, ...renderOptions }) };
};

// Re-export everything
export * from '@testing-library/react';

// Override render method
export { customRender as render };

// Export test utilities
export const createMockStore = createTestStore;

// Mock auth state
export const mockAuthState = {
  auth: {
    user: null,
    token: null,
    isAuthenticated: false,
    isLoading: false,
    error: null,
    isAuthInitialized: true,
  },
  language: {
    currentLanguage: 'he',
    translations: {},
  },
  cart: {
    items: [],
  },
};

// Mock data generators
export const createMockUser = (overrides = {}) => ({
  id: 1,
  email: 'test@example.com',
  name: 'Test User',
  isAdmin: false,
  phone: '+1234567890',
  ...overrides,
});

export const createMockProduct = (overrides = {}) => ({
  id: 1,
  name: 'Test Product',
  description: 'Test product description',
  price: 10.99,
  category: 'bread',
  image: 'test-image.jpg',
  isAvailable: true,
  ...overrides,
});

export const createMockOrder = (overrides = {}) => ({
  id: 1,
  customerId: 1,
  items: [
    {
      productId: 1,
      quantity: 2,
      price: 10.99,
      name: 'Test Product',
    },
  ],
  total: 21.98,
  status: 'pending',
  createdAt: new Date().toISOString(),
  ...overrides,
});

export const createMockCartItem = (overrides = {}) => ({
  id: 1,
  productId: 1,
  name: 'Test Product',
  price: 10.99,
  quantity: 1,
  ...overrides,
});

// Mock functions
export const mockNavigate = jest.fn();
export const mockLocation = {
  pathname: '/',
  search: '',
  hash: '',
  state: null,
};

// Mock window properties
export const mockWindow = {
  innerWidth: 1024,
  innerHeight: 768,
  scrollTo: jest.fn(),
  addEventListener: jest.fn(),
  removeEventListener: jest.fn(),
};

// Mock localStorage
export const mockLocalStorage = {
  getItem: jest.fn(),
  setItem: jest.fn(),
  removeItem: jest.fn(),
  clear: jest.fn(),
};

// Mock sessionStorage
export const mockSessionStorage = {
  getItem: jest.fn(),
  setItem: jest.fn(),
  removeItem: jest.fn(),
  clear: jest.fn(),
};

// Setup global mocks
beforeEach(() => {
  // Mock window
  Object.defineProperty(window, 'innerWidth', {
    writable: true,
    configurable: true,
    value: mockWindow.innerWidth,
  });
  Object.defineProperty(window, 'innerHeight', {
    writable: true,
    configurable: true,
    value: mockWindow.innerHeight,
  });
  window.scrollTo = mockWindow.scrollTo;
  window.addEventListener = mockWindow.addEventListener;
  window.removeEventListener = mockWindow.removeEventListener;

  // Mock localStorage
  Object.defineProperty(window, 'localStorage', {
    value: mockLocalStorage,
    writable: true,
  });

  // Mock sessionStorage
  Object.defineProperty(window, 'sessionStorage', {
    value: mockSessionStorage,
    writable: true,
  });

  // Mock fetch
  global.fetch = jest.fn();

  // Mock IntersectionObserver
  global.IntersectionObserver = jest.fn().mockImplementation(() => ({
    observe: jest.fn(),
    unobserve: jest.fn(),
    disconnect: jest.fn(),
  }));

  // Mock ResizeObserver
  global.ResizeObserver = jest.fn().mockImplementation(() => ({
    observe: jest.fn(),
    unobserve: jest.fn(),
    disconnect: jest.fn(),
  }));

  // Mock matchMedia
  Object.defineProperty(window, 'matchMedia', {
    writable: true,
    value: jest.fn().mockImplementation(query => ({
      matches: false,
      media: query,
      onchange: null,
      addListener: jest.fn(),
      removeListener: jest.fn(),
      addEventListener: jest.fn(),
      removeEventListener: jest.fn(),
      dispatchEvent: jest.fn(),
    })),
  });

  // Mock performance
  Object.defineProperty(window, 'performance', {
    writable: true,
    value: {
      now: jest.fn(() => Date.now()),
      mark: jest.fn(),
      measure: jest.fn(),
      getEntriesByType: jest.fn(() => []),
      getEntriesByName: jest.fn(() => []),
    },
  });

  // Mock requestAnimationFrame
  global.requestAnimationFrame = jest.fn(cb => setTimeout(cb, 0));
  global.cancelAnimationFrame = jest.fn();

  // Mock setTimeout and setInterval
  jest.useFakeTimers();
});

afterEach(() => {
  jest.clearAllMocks();
  jest.clearAllTimers();
});

// Export test helpers
export const waitForElementToBeRemoved = (element: HTMLElement) =>
  new Promise(resolve => {
    const observer = new MutationObserver(() => {
      if (!document.contains(element)) {
        observer.disconnect();
        resolve(true);
      }
    });
    observer.observe(document.body, { childList: true, subtree: true });
  });

export const waitForLoadingToFinish = () =>
  new Promise(resolve => setTimeout(resolve, 0));

export const createMockEvent = (type: string, options = {}) =>
  new Event(type, { bubbles: true, cancelable: true, ...options });

export const createMockMouseEvent = (type: string, options = {}) =>
  new MouseEvent(type, { bubbles: true, cancelable: true, ...options });

export const createMockKeyboardEvent = (type: string, options = {}) =>
  new KeyboardEvent(type, { bubbles: true, cancelable: true, ...options });

export const createMockTouchEvent = (type: string, options = {}) =>
  new TouchEvent(type, { bubbles: true, cancelable: true, ...options });

// Mock API responses
export const mockApiResponse = (data: any, status = 200) => ({
  ok: status >= 200 && status < 300,
  status,
  json: async () => data,
  text: async () => JSON.stringify(data),
  headers: new Headers(),
});

export const mockApiError = (message: string, status = 400) => ({
  ok: false,
  status,
  json: async () => ({ error: message }),
  text: async () => JSON.stringify({ error: message }),
  headers: new Headers(),
});

// Test data constants
export const TEST_USER = createMockUser();
export const TEST_PRODUCT = createMockProduct();
export const TEST_ORDER = createMockOrder();
export const TEST_CART_ITEM = createMockCartItem();

// Mock Redux state
export const createMockState = (overrides = {}) => ({
  auth: {
    user: TEST_USER,
    isAuthenticated: true,
    isLoading: false,
    error: null,
    isInitialized: true,
  },
  cart: {
    items: [TEST_CART_ITEM],
    total: TEST_CART_ITEM.price,
    isLoading: false,
    error: null,
  },
  products: {
    items: [TEST_PRODUCT],
    isLoading: false,
    error: null,
  },
  orders: {
    items: [TEST_ORDER],
    isLoading: false,
    error: null,
  },
  customers: {
    items: [],
    isLoading: false,
    error: null,
  },
  analytics: {
    data: {},
    isLoading: false,
    error: null,
  },
  language: {
    current: 'en',
    translations: {},
  },
  ui: {
    theme: 'light',
    sidebarOpen: false,
    notifications: [],
  },
  ...overrides,
});
