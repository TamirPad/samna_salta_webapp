import authReducer, {
  loginStart,
  loginSuccess,
  loginFailure,
  logoutUser,
  clearError,
  selectUser,
  selectIsAuthenticated,
  selectIsAdmin,
  selectAuthLoading,
  selectAuthError,
} from './authSlice';

describe('Auth Slice', () => {
  const initialState = {
    user: null,
    isAuthenticated: false,
    isLoading: false,
    error: null,
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
        user: mockUser,
        isAuthenticated: true,
        isLoading: false,
        error: 'Some error',
      };

      const newState = authReducer(state, logoutUser());

      expect(newState.user).toBe(null);
      expect(newState.isAuthenticated).toBe(false);
      expect(newState.error).toBe(null);
      expect(newState.isLoading).toBe(false);
    });

    it('should handle clearError', () => {
      const state = {
        ...initialState,
        error: 'Some error',
      };

      const newState = authReducer(state, clearError());

      expect(newState.error).toBe(null);
    });

    it('should handle loginSuccess with admin user', () => {
      const state = {
        ...initialState,
        isLoading: true,
      };

      const newState = authReducer(state, loginSuccess(mockAdminUser));

      expect(newState.user).toEqual(mockAdminUser);
      expect(newState.user?.isAdmin).toBe(true);
    });
  });

  describe('selectors', () => {
    const mockState = {
      auth: {
        user: mockUser,
        isAuthenticated: true,
        isLoading: false,
        error: null,
      },
    };

    const mockAdminState = {
      auth: {
        user: mockAdminUser,
        isAuthenticated: true,
        isLoading: false,
        error: null,
      },
    };

    const mockErrorState = {
      auth: {
        user: null,
        isAuthenticated: false,
        isLoading: false,
        error: 'Login failed',
      },
    };

    it('should select user', () => {
      const result = selectUser(mockState);
      expect(result).toEqual(mockUser);
    });

    it('should select isAuthenticated', () => {
      const result = selectIsAuthenticated(mockState);
      expect(result).toBe(true);
    });

    it('should select isAdmin for regular user', () => {
      const result = selectIsAdmin(mockState);
      expect(result).toBe(false);
    });

    it('should select isAdmin for admin user', () => {
      const result = selectIsAdmin(mockAdminState);
      expect(result).toBe(true);
    });

    it('should select isAdmin when user is null', () => {
      const stateWithNoUser = {
        auth: {
          ...initialState,
        },
      };
      const result = selectIsAdmin(stateWithNoUser);
      expect(result).toBe(false);
    });

    it('should select auth loading', () => {
      const loadingState = {
        auth: {
          ...mockState.auth,
          isLoading: true,
        },
      };
      const result = selectAuthLoading(loadingState);
      expect(result).toBe(true);
    });

    it('should select auth error', () => {
      const result = selectAuthError(mockErrorState);
      expect(result).toBe('Login failed');
    });

    it('should select null error when no error', () => {
      const result = selectAuthError(mockState);
      expect(result).toBe(null);
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
  });
}); 