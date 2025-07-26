import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { User } from '@samna-salta/common';

interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
}

const initialState: AuthState = {
  user: null,
  isAuthenticated: false,
  isLoading: false,
  error: null,
};

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    loginStart: (state) => {
      state.isLoading = true;
      state.error = null;
    },
    loginSuccess: (state, action: PayloadAction<User>) => {
      state.isLoading = false;
      state.isAuthenticated = true;
      state.user = action.payload;
      state.error = null;
    },
    loginFailure: (state, action: PayloadAction<string>) => {
      state.isLoading = false;
      state.error = action.payload;
    },
    logoutUser: (state) => {
      state.user = null;
      state.isAuthenticated = false;
      state.error = null;
    },
    clearError: (state) => {
      state.error = null;
    },
  },
});

export const {
  loginStart,
  loginSuccess,
  loginFailure,
  logoutUser,
  clearError,
} = authSlice.actions;

// Selectors
export const selectUser = (state: { auth: AuthState }): User | null => state.auth.user;
export const selectIsAuthenticated = (state: { auth: AuthState }): boolean => state.auth.isAuthenticated;
export const selectIsAdmin = (state: { auth: AuthState }): boolean => state.auth.user?.isAdmin || false;
export const selectAuthLoading = (state: { auth: AuthState }): boolean => state.auth.isLoading;
export const selectAuthError = (state: { auth: AuthState }): string | null => state.auth.error;
export const selectAuth = (state: { auth: AuthState }): AuthState => state.auth;

export default authSlice.reducer; 