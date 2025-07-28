import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { apiService } from "../../utils/api";
import { RootState } from "../../store";

export interface DashboardAnalytics {
  today: {
    orders: number;
    revenue: number;
  };
  month: {
    orders: number;
    revenue: number;
  };
  customers: number;
  pending_orders: number;
  top_products: Array<{
    name: string;
    name_he?: string;
    name_en?: string;
    order_count: number;
    total_quantity: number;
  }>;
  orders_by_status: Array<{
    status: string;
    count: number;
  }>;
  revenue_by_day: Array<{
    date: string;
    orders: number;
    revenue: number;
  }>;
}

interface AnalyticsState {
  dashboard: DashboardAnalytics | null;
  isLoading: boolean;
  error: string | null;
}

const initialState: AnalyticsState = {
  dashboard: null,
  isLoading: false,
  error: null,
};

// Async thunks
export const fetchDashboardAnalytics = createAsyncThunk(
  "analytics/fetchDashboard",
  async (_, { rejectWithValue, getState }) => {
    try {
      const state = getState() as RootState;
      const { analytics } = state;

      // Prevent excessive retries
      if (analytics.error && analytics.error.includes("Too many requests")) {
        return rejectWithValue(
          "Rate limit exceeded. Please wait before retrying.",
        );
      }

      const response = await apiService.getDashboardAnalytics();
      return response.data;
    } catch (error: unknown) {
      const errorMessage =
        error instanceof Error && "response" in error
          ? (error as any).response?.data?.message ||
            "Failed to fetch dashboard analytics"
          : "Failed to fetch dashboard analytics";
      return rejectWithValue(errorMessage);
    }
  },
  {
    // Add condition to prevent retries on rate limit errors
    condition: (_, { getState }) => {
      const state = getState() as RootState;
      const { analytics } = state;
      return !analytics.error?.includes("Too many requests");
    },
  },
);

const analyticsSlice = createSlice({
  name: "analytics",
  initialState,
  reducers: {
    clearAnalyticsError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch dashboard analytics
      .addCase(fetchDashboardAnalytics.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchDashboardAnalytics.fulfilled, (state, action) => {
        state.isLoading = false;
        state.dashboard = action.payload.data;
      })
      .addCase(fetchDashboardAnalytics.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });
  },
});

export const { clearAnalyticsError } = analyticsSlice.actions;

// Selectors
export const selectDashboardAnalytics = (
  state: RootState,
): DashboardAnalytics | null => state.analytics.dashboard;
export const selectAnalyticsLoading = (state: RootState): boolean =>
  state.analytics.isLoading;
export const selectAnalyticsError = (state: RootState): string | null =>
  state.analytics.error;

export default analyticsSlice.reducer;
