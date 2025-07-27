import React, { ReactElement, ReactNode, useState, useEffect } from 'react';
import { render, screen } from '../utils/test-utils';
import { Provider } from 'react-redux';
import { configureStore } from '@reduxjs/toolkit';
import { BrowserRouter } from 'react-router-dom';
import ProtectedRoute from './ProtectedRoute';
import authReducer from '../features/auth/authSlice';

// Mock the LoadingSpinner component
jest.mock('./LoadingSpinner', () => {
  return function MockLoadingSpinner() {
    return <div data-testid='loading-spinner'>Loading...</div>;
  };
});

const createMockStore = (initialState = {}) => {
  return configureStore({
    reducer: {
      auth: authReducer,
    },
    preloadedState: {
      auth: {
        user: null,
        isAuthenticated: false,
        isLoading: false,
        error: null,
        isInitialized: false,
        ...initialState,
      },
    },
  });
};

const renderWithProviders = (
  component: React.ReactElement,
  initialState = {}
) => {
  const store = createMockStore(initialState);
  return render(
    <Provider store={store}>
      <BrowserRouter>{component}</BrowserRouter>
    </Provider>
  );
};

describe('ProtectedRoute', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Loading State', () => {
    it('should show loading spinner when auth is not initialized', () => {
      renderWithProviders(
        <ProtectedRoute>
          <div>Protected Content</div>
        </ProtectedRoute>,
        { isInitialized: false, isLoading: true }
      );

      expect(screen.getByTestId('loading-spinner')).toBeInTheDocument();
      expect(screen.queryByText('Protected Content')).not.toBeInTheDocument();
    });

    it('should show loading spinner when auth is loading', () => {
      renderWithProviders(
        <ProtectedRoute>
          <div>Protected Content</div>
        </ProtectedRoute>,
        { isInitialized: true, isLoading: true }
      );

      expect(screen.getByTestId('loading-spinner')).toBeInTheDocument();
      expect(screen.queryByText('Protected Content')).not.toBeInTheDocument();
    });
  });

  describe('Authentication Required', () => {
    it('should redirect to login when not authenticated', () => {
      const mockNavigate = jest.fn();
      jest.mock('react-router-dom', () => ({
        ...jest.requireActual('react-router-dom'),
        useNavigate: () => mockNavigate,
      }));

      renderWithProviders(
        <ProtectedRoute>
          <div>Protected Content</div>
        </ProtectedRoute>,
        { isInitialized: true, isLoading: false, isAuthenticated: false }
      );

      expect(screen.queryByText('Protected Content')).not.toBeInTheDocument();
    });

    it('should render children when authenticated', () => {
      renderWithProviders(
        <ProtectedRoute>
          <div>Protected Content</div>
        </ProtectedRoute>,
        {
          isInitialized: true,
          isLoading: false,
          isAuthenticated: true,
          user: { id: 1, email: 'test@example.com', isAdmin: false },
        }
      );

      expect(screen.getByText('Protected Content')).toBeInTheDocument();
      expect(screen.queryByTestId('loading-spinner')).not.toBeInTheDocument();
    });
  });

  describe('Admin Access Required', () => {
    it('should redirect to home when user is not admin', () => {
      const mockNavigate = jest.fn();
      jest.mock('react-router-dom', () => ({
        ...jest.requireActual('react-router-dom'),
        useNavigate: () => mockNavigate,
      }));

      renderWithProviders(
        <ProtectedRoute requireAdmin>
          <div>Admin Content</div>
        </ProtectedRoute>,
        {
          isInitialized: true,
          isLoading: false,
          isAuthenticated: true,
          user: { id: 1, email: 'test@example.com', isAdmin: false },
        }
      );

      expect(screen.queryByText('Admin Content')).not.toBeInTheDocument();
    });

    it('should render children when user is admin', () => {
      renderWithProviders(
        <ProtectedRoute requireAdmin>
          <div>Admin Content</div>
        </ProtectedRoute>,
        {
          isInitialized: true,
          isLoading: false,
          isAuthenticated: true,
          user: { id: 1, email: 'admin@example.com', isAdmin: true },
        }
      );

      expect(screen.getByText('Admin Content')).toBeInTheDocument();
      expect(screen.queryByTestId('loading-spinner')).not.toBeInTheDocument();
    });

    it('should redirect to login when not authenticated and admin access required', () => {
      const mockNavigate = jest.fn();
      jest.mock('react-router-dom', () => ({
        ...jest.requireActual('react-router-dom'),
        useNavigate: () => mockNavigate,
      }));

      renderWithProviders(
        <ProtectedRoute requireAdmin>
          <div>Admin Content</div>
        </ProtectedRoute>,
        { isInitialized: true, isLoading: false, isAuthenticated: false }
      );

      expect(screen.queryByText('Admin Content')).not.toBeInTheDocument();
    });
  });

  describe('Edge Cases', () => {
    it('should handle null user gracefully', () => {
      renderWithProviders(
        <ProtectedRoute>
          <div>Protected Content</div>
        </ProtectedRoute>,
        {
          isInitialized: true,
          isLoading: false,
          isAuthenticated: true,
          user: null,
        }
      );

      expect(screen.queryByText('Protected Content')).not.toBeInTheDocument();
    });

    it('should handle undefined user gracefully', () => {
      renderWithProviders(
        <ProtectedRoute>
          <div>Protected Content</div>
        </ProtectedRoute>,
        {
          isInitialized: true,
          isLoading: false,
          isAuthenticated: true,
          user: undefined,
        }
      );

      expect(screen.queryByText('Protected Content')).not.toBeInTheDocument();
    });

    it('should handle complex children components', () => {
      const ComplexComponent = () => (
        <div>
          <h1>Complex Title</h1>
          <p>Complex description</p>
          <button>Click me</button>
        </div>
      );

      renderWithProviders(
        <ProtectedRoute>
          <ComplexComponent />
        </ProtectedRoute>,
        {
          isInitialized: true,
          isLoading: false,
          isAuthenticated: true,
          user: { id: 1, email: 'test@example.com', isAdmin: false },
        }
      );

      expect(screen.getByText('Complex Title')).toBeInTheDocument();
      expect(screen.getByText('Complex description')).toBeInTheDocument();
      expect(screen.getByRole('button')).toBeInTheDocument();
    });

    it('should handle multiple children', () => {
      renderWithProviders(
        <ProtectedRoute>
          <div>Child 1</div>
          <div>Child 2</div>
          <div>Child 3</div>
        </ProtectedRoute>,
        {
          isInitialized: true,
          isLoading: false,
          isAuthenticated: true,
          user: { id: 1, email: 'test@example.com', isAdmin: false },
        }
      );

      expect(screen.getByText('Child 1')).toBeInTheDocument();
      expect(screen.getByText('Child 2')).toBeInTheDocument();
      expect(screen.getByText('Child 3')).toBeInTheDocument();
    });
  });

  describe('Component Props', () => {
    it('should accept and render children prop', () => {
      renderWithProviders(
        <ProtectedRoute>
          <div data-testid='test-child'>Test Child</div>
        </ProtectedRoute>,
        {
          isInitialized: true,
          isLoading: false,
          isAuthenticated: true,
          user: { id: 1, email: 'test@example.com', isAdmin: false },
        }
      );

      expect(screen.getByTestId('test-child')).toBeInTheDocument();
    });

    it('should handle requireAdmin prop correctly', () => {
      const { rerender } = renderWithProviders(
        <ProtectedRoute requireAdmin={false}>
          <div>Regular Content</div>
        </ProtectedRoute>,
        {
          isInitialized: true,
          isLoading: false,
          isAuthenticated: true,
          user: { id: 1, email: 'test@example.com', isAdmin: false },
        }
      );

      expect(screen.getByText('Regular Content')).toBeInTheDocument();

      rerender(
        <ProtectedRoute requireAdmin={true}>
          <div>Admin Content</div>
        </ProtectedRoute>
      );

      expect(screen.queryByText('Admin Content')).not.toBeInTheDocument();
    });
  });
});
