import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { apiService } from '../../utils/api';
import { RootState } from '../../store';

export interface Customer {
  id: string;
  name: string;
  name_en?: string;
  name_he?: string;
  email: string;
  phone: string;
  address?: string;
  total_orders: number;
  total_spent: number;
  last_order_date?: string;
  member_since: string;
  avatar?: string;
}

export interface CustomerDetails extends Customer {
  orders?: Order[];
  notes?: string;
}

interface Order {
  id: string;
  order_number: string;
  total_amount: number;
  status: string;
  created_at: string;
}

interface CustomersState {
  customers: Customer[];
  selectedCustomer: CustomerDetails | null;
  isLoading: boolean;
  error: string | null;
  pagination: {
    page: number;
    limit: number;
    total: number;
    pages: number;
  };
}

const initialState: CustomersState = {
  customers: [],
  selectedCustomer: null,
  isLoading: false,
  error: null,
  pagination: {
    page: 1,
    limit: 20,
    total: 0,
    pages: 0,
  },
};

// Async thunks
export const fetchCustomers = createAsyncThunk(
  'customers/fetchCustomers',
  async (
    params: { page?: number; limit?: number; search?: string } = {},
    { rejectWithValue }
  ) => {
    try {
      const response = await apiService.getCustomers(params);
      return response.data;
    } catch (error: unknown) {
      const errorMessage =
        error instanceof Error && 'response' in error
          ? (error as any).response?.data?.message ||
            'Failed to fetch customers'
          : 'Failed to fetch customers';
      return rejectWithValue(errorMessage);
    }
  }
);

export const fetchCustomerDetails = createAsyncThunk(
  'customers/fetchCustomerDetails',
  async (customerId: string, { rejectWithValue }) => {
    try {
      const response = await apiService.getCustomer(parseInt(customerId));
      return response.data;
    } catch (error: unknown) {
      const errorMessage =
        error instanceof Error && 'response' in error
          ? (error as any).response?.data?.message ||
            'Failed to fetch customer details'
          : 'Failed to fetch customer details';
      return rejectWithValue(errorMessage);
    }
  }
);

export const updateCustomer = createAsyncThunk(
  'customers/updateCustomer',
  async (
    { id, customerData }: { id: string; customerData: Partial<Customer> },
    { rejectWithValue }
  ) => {
    try {
      const response = await apiService.updateCustomer(
        parseInt(id),
        customerData
      );
      return response.data;
    } catch (error: unknown) {
      const errorMessage =
        error instanceof Error && 'response' in error
          ? (error as any).response?.data?.message ||
            'Failed to update customer'
          : 'Failed to update customer';
      return rejectWithValue(errorMessage);
    }
  }
);

export const deleteCustomer = createAsyncThunk(
  'customers/deleteCustomer',
  async (customerId: string, { rejectWithValue }) => {
    try {
      await apiService.deleteCustomer(parseInt(customerId));
      return customerId;
    } catch (error: unknown) {
      const errorMessage =
        error instanceof Error && 'response' in error
          ? (error as any).response?.data?.message ||
            'Failed to delete customer'
          : 'Failed to delete customer';
      return rejectWithValue(errorMessage);
    }
  }
);

const customersSlice = createSlice({
  name: 'customers',
  initialState,
  reducers: {
    setSelectedCustomer: (
      state,
      action: PayloadAction<CustomerDetails | null>
    ) => {
      state.selectedCustomer = action.payload;
    },
    clearCustomersError: state => {
      state.error = null;
    },
    setCustomersPagination: (
      state,
      action: PayloadAction<{ page: number; limit: number }>
    ) => {
      state.pagination.page = action.payload.page;
      state.pagination.limit = action.payload.limit;
    },
  },
  extraReducers: builder => {
    builder
      // Fetch customers
      .addCase(fetchCustomers.pending, state => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchCustomers.fulfilled, (state, action) => {
        state.isLoading = false;
        state.customers = action.payload.data;
        state.pagination = action.payload.pagination;
      })
      .addCase(fetchCustomers.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })
      // Fetch customer details
      .addCase(fetchCustomerDetails.pending, state => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchCustomerDetails.fulfilled, (state, action) => {
        state.isLoading = false;
        state.selectedCustomer = action.payload.data;
      })
      .addCase(fetchCustomerDetails.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })
      // Update customer
      .addCase(updateCustomer.pending, state => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(updateCustomer.fulfilled, (state, action) => {
        state.isLoading = false;
        // Update the customer in the list
        const updatedCustomer = action.payload.data;
        const index = state.customers.findIndex(
          c => c.id === updatedCustomer.id
        );
        if (index !== -1) {
          state.customers[index] = updatedCustomer;
        }
        // Update selected customer if it's the same one
        if (
          state.selectedCustomer &&
          state.selectedCustomer.id === updatedCustomer.id
        ) {
          state.selectedCustomer = {
            ...state.selectedCustomer,
            ...updatedCustomer,
          };
        }
      })
      .addCase(updateCustomer.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });
  },
});

export const {
  setSelectedCustomer,
  clearCustomersError,
  setCustomersPagination,
} = customersSlice.actions;

// Selectors
export const selectCustomers = (state: RootState): Customer[] =>
  state.customers.customers;
export const selectSelectedCustomer = (
  state: RootState
): CustomerDetails | null => state.customers.selectedCustomer;
export const selectCustomersLoading = (state: RootState): boolean =>
  state.customers.isLoading;
export const selectCustomersError = (state: RootState): string | null =>
  state.customers.error;
export const selectCustomersPagination = (
  state: RootState
): { page: number; limit: number; total: number; pages: number } =>
  state.customers.pagination;

export default customersSlice.reducer;
