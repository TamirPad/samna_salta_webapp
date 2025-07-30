import { createSlice, PayloadAction, createAsyncThunk } from "@reduxjs/toolkit";
import { apiService } from "../../utils/api";

// Define User type locally to avoid import issues
interface User {
  id: number;
  email: string;
  name: string;
  phone?: string;
  isAdmin: boolean;
  language?: "he" | "en";
  createdAt?: string;
  lastLogin?: string;
  updatedAt?: string;
  role?: string; // Added for role check
}

interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
  isInitialized: boolean; // Track if auth has been initialized
}

const initialState: AuthState = {
  user: null,
  isAuthenticated: false,
  isLoading: false,
  error: null,
  isInitialized: false,
};

// Async thunk to initialize authentication
export const initializeAuth = createAsyncThunk(
  "auth/initialize",
  async (_, { rejectWithValue, getState }) => {
    try {
      const token = localStorage.getItem("token");
      const userData = localStorage.getItem("user");

      if (!token || !userData) {
        // eslint-disable-next-line no-console
        console.log(
          "🔍 No token or user data found, returning unauthenticated",
        );
        return { user: null, isAuthenticated: false };
      }

      // Check if we already have valid user data in localStorage
      try {
        const parsedUser = JSON.parse(userData);
        if (parsedUser && parsedUser.isAdmin) {
          // eslint-disable-next-line no-console
          console.log("🔍 Using cached admin user data:", parsedUser);
          return { user: parsedUser, isAuthenticated: true };
        }
      } catch (e) {
        // eslint-disable-next-line no-console
        console.log("🔍 Failed to parse cached user data, validating with backend");
      }

      // eslint-disable-next-line no-console
      console.log("🔍 Attempting to validate token with backend...");

      // Validate token with backend
      const response = await apiService.getCurrentUser();

      // eslint-disable-next-line no-console
      console.log("🔍 Backend response:", response);

      // Handle different response structures
      let user;
      if (response.data && response.data.data) {
        // Backend returns { data: { data: user } }
        user = response.data.data;
        // eslint-disable-next-line no-console
        console.log("🔍 Using response.data.data structure");
      } else if (response.data && response.data.user) {
        // Backend returns { data: { user: user } }
        user = response.data.user;
        // eslint-disable-next-line no-console
        console.log("🔍 Using response.data.user structure");
      } else if (response.data) {
        // Backend returns { data: user }
        user = response.data;
        // eslint-disable-next-line no-console
        console.log("🔍 Using response.data structure");
      } else {
        // No data in response
        // eslint-disable-next-line no-console
        console.error("❌ Invalid response structure:", response);
        throw new Error("Invalid response structure");
      }

      // Ensure user data is properly structured
      if (!user.isAdmin && user.role === 'admin') {
        user.isAdmin = true;
      }

      // Update localStorage with the validated user data
      localStorage.setItem('user', JSON.stringify(user));

      // eslint-disable-next-line no-console
      console.log("✅ User authenticated successfully:", user);
      return { user, isAuthenticated: true };
    } catch (error: unknown) {
      // eslint-disable-next-line no-console
      console.error("❌ Authentication initialization failed:", error);

      // Clear invalid tokens
      localStorage.removeItem("token");
      localStorage.removeItem("user");

      if ((error as any).response?.status === 401) {
        // eslint-disable-next-line no-console
        console.log("🔍 401 Unauthorized, returning unauthenticated");
        return { user: null, isAuthenticated: false };
      }

      return rejectWithValue("Failed to initialize authentication");
    }
  },
);

const authSlice = createSlice({
  name: "auth",
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
  extraReducers: (builder) => {
    builder
      .addCase(initializeAuth.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(initializeAuth.fulfilled, (state, action) => {
        state.isLoading = false;
        state.isAuthenticated = action.payload.isAuthenticated;
        state.user = action.payload.user;
        state.isInitialized = true;
      })
      .addCase(initializeAuth.rejected, (state, action) => {
        state.isLoading = false;
        state.isAuthenticated = false;
        state.user = null;
        state.error = (action.payload as string) || "Authentication failed";
        state.isInitialized = true;
      });
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
export const selectAuth = (state: { auth: AuthState }) => state.auth;
export const selectUser = (state: { auth: AuthState }) => state.auth.user;
export const selectIsAuthenticated = (state: { auth: AuthState }) =>
  state.auth.isAuthenticated;
export const selectIsAdmin = (state: { auth: AuthState }) =>
  state.auth.user?.isAdmin || false;
export const selectAuthLoading = (state: { auth: AuthState }) =>
  state.auth.isLoading;
export const selectAuthError = (state: { auth: AuthState }) => state.auth.error;
export const selectIsAuthInitialized = (state: { auth: AuthState }) =>
  state.auth.isInitialized;

export default authSlice.reducer;
