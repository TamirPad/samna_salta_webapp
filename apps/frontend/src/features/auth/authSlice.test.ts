import authReducer, {
  loginStart,
  loginSuccess,
  loginFailure,
  logoutUser,
  clearError,
  initializeAuth,
  selectUser,
  selectIsAuthenticated,
  selectIsAdmin,
  selectAuthLoading,
  selectAuthError,
  selectIsAuthInitialized,
} from './authSlice';

// Mock the API service
jest.mock('../../utils/api', () => ({
  apiService: {
    getCurrentUser: jest.fn(),
  },
}));

describe('Auth Slice', () => {
  const initialState = {
    user: null,
    isAuthenticated: false,
    isLoading: false,
    error: null,
    isInitialized: false,
  };

  const mockUser = {
    id: 1,
    name: 'Test User',
    email: 'test@example.com',
    phone: '+972-50-123-4567',
    isAdmin: false,
  };

  const mockAdminUser = {
    ...mockUser,
    isAdmin: true,
  };

  beforeEach(() => {
    // Clear localStorage before each test
    localStorage.clear();
    jest.clearAllMocks();
  });

  describe('reducers', () => {
    it('should return initial state', () => {
      expect(authReducer(undefined, { type: 'unknown' })).toEqual(initialState);
    });

    it('should handle loginStart', () => {
      const state = {
        ...initialState,
        error: 'Previous error',
      };

      const newState = authReducer(state, loginStart());

      expect(newState.isLoading).toBe(true);
      expect(newState.error).toBe(null);
    });

    it('should handle loginSuccess', () => {
      const state = {
        ...initialState,
        isLoading: true,
      };

      const newState = authReducer(state, loginSuccess(mockUser));

      expect(newState.isLoading).toBe(false);
      expect(newState.isAuthenticated).toBe(true);
      expect(newState.user).toEqual(mockUser);
      expect(newState.error).toBe(null);
    });

    it('should handle loginFailure', () => {
      const state = {
        ...initialState,
        isLoading: true,
      };

      const errorMessage = 'Login failed';
      const newState = authReducer(state, loginFailure(errorMessage));

      expect(newState.isLoading).toBe(false);
      expect(newState.error).toBe(errorMessage);
      expect(newState.isAuthenticated).toBe(false);
      expect(newState.user).toBe(null);
    });

    it('should handle logoutUser', () => {
      const state = {
        ...initialState,
        user: mockUser,
        isAuthenticated: true,
        error: 'Some error',
      };

      const newState = authReducer(state, logoutUser());

      expect(newState.user).toBe(null);
      expect(newState.isAuthenticated).toBe(false);
      expect(newState.error).toBe(null);
    });

    it('should handle clearError', () => {
      const state = {
        ...initialState,
        error: 'Some error',
      };

      const newState = authReducer(state, clearError());

      expect(newState.error).toBe(null);
    });
  });

  describe('async thunks', () => {
    it('should handle initializeAuth.pending', () => {
      const state = {
        ...initialState,
        error: 'Previous error',
      };

      const newState = authReducer(state, { type: initializeAuth.pending.type });

      expect(newState.isLoading).toBe(true);
      expect(newState.error).toBe(null);
    });

    it('should handle initializeAuth.fulfilled with valid auth', () => {
      const state = {
        ...initialState,
        isLoading: true,
      };

      const newState = authReducer(state, {
        type: initializeAuth.fulfilled.type,
        payload: { user: mockUser, isAuthenticated: true },
        meta: { requestId: 'test-id' }
      });

      expect(newState.isLoading).toBe(false);
      expect(newState.isAuthenticated).toBe(true);
      expect(newState.user).toEqual(mockUser);
      expect(newState.isInitialized).toBe(true);
      expect(newState.error).toBe(null);
    });

    it('should handle initializeAuth.fulfilled with no auth', () => {
      const state = {
        ...initialState,
        isLoading: true,
      };

      const newState = authReducer(state, {
        type: initializeAuth.fulfilled.type,
        payload: { user: null, isAuthenticated: false },
        meta: { requestId: 'test-id' }
      });

      expect(newState.isLoading).toBe(false);
      expect(newState.isAuthenticated).toBe(false);
      expect(newState.user).toBe(null);
      expect(newState.isInitialized).toBe(true);
      expect(newState.error).toBe(null);
    });

    it('should handle initializeAuth.rejected', () => {
      const state = {
        ...initialState,
        isLoading: true,
      };

      const newState = authReducer(state, {
        type: initializeAuth.rejected.type,
        payload: 'Authentication failed',
        meta: { requestId: 'test-id' },
        error: { message: 'Failed' }
      });

      expect(newState.isLoading).toBe(false);
      expect(newState.isAuthenticated).toBe(false);
      expect(newState.user).toBe(null);
      expect(newState.isInitialized).toBe(true);
      expect(newState.error).toBe('Authentication failed');
    });
  });

  describe('selectors', () => {
    const mockState = {
      auth: {
        user: mockUser,
        isAuthenticated: true,
        isLoading: false,
        error: null,
        isInitialized: true,
      },
    };

    it('should select user', () => {
      expect(selectUser(mockState)).toEqual(mockUser);
    });

    it('should select isAuthenticated', () => {
      expect(selectIsAuthenticated(mockState)).toBe(true);
    });

    it('should select isAdmin', () => {
      expect(selectIsAdmin(mockState)).toBe(false);
    });

    it('should select isAdmin for admin user', () => {
      const adminState = {
        auth: {
          ...mockState.auth,
          user: mockAdminUser,
        },
      };
      expect(selectIsAdmin(adminState)).toBe(true);
    });

    it('should select authLoading', () => {
      expect(selectAuthLoading(mockState)).toBe(false);
    });

    it('should select authError', () => {
      expect(selectAuthError(mockState)).toBe(null);
    });

    it('should select isAuthInitialized', () => {
      expect(selectIsAuthInitialized(mockState)).toBe(true);
    });
  });

  describe('state transitions', () => {
    it('should handle complete login flow', () => {
      let state = authReducer(undefined, { type: 'unknown' });
      
      // Start login
      state = authReducer(state, loginStart());
      expect(state.isLoading).toBe(true);
      expect(state.error).toBe(null);
      
      // Login success
      state = authReducer(state, loginSuccess(mockUser));
      expect(state.isLoading).toBe(false);
      expect(state.isAuthenticated).toBe(true);
      expect(state.user).toEqual(mockUser);
      
      // Logout
      state = authReducer(state, logoutUser());
      expect(state.user).toBe(null);
      expect(state.isAuthenticated).toBe(false);
    });

    it('should handle login failure flow', () => {
      let state = authReducer(undefined, { type: 'unknown' });
      
      // Start login
      state = authReducer(state, loginStart());
      expect(state.isLoading).toBe(true);
      
      // Login failure
      state = authReducer(state, loginFailure('Invalid credentials'));
      expect(state.isLoading).toBe(false);
      expect(state.error).toBe('Invalid credentials');
      expect(state.isAuthenticated).toBe(false);
      
      // Clear error
      state = authReducer(state, clearError());
      expect(state.error).toBe(null);
    });

    it('should handle authentication initialization flow', () => {
      let state = authReducer(undefined, { type: 'unknown' });
      
      // Start initialization
      state = authReducer(state, { type: initializeAuth.pending.type });
      expect(state.isLoading).toBe(true);
      expect(state.isInitialized).toBe(false);
      
      // Initialization success with auth
      state = authReducer(state, {
        type: initializeAuth.fulfilled.type,
        payload: { user: mockUser, isAuthenticated: true },
        meta: { requestId: 'test-id' }
      });
      expect(state.isLoading).toBe(false);
      expect(state.isAuthenticated).toBe(true);
      expect(state.user).toEqual(mockUser);
      expect(state.isInitialized).toBe(true);
      
      // Logout
      state = authReducer(state, logoutUser());
      expect(state.user).toBe(null);
      expect(state.isAuthenticated).toBe(false);
      expect(state.isInitialized).toBe(true); // Should remain true
    });
  });
}); 