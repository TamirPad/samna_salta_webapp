import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface Customer {
  id: string;
  name: string;
  email: string;
  phone: string;
  address?: string;
  totalOrders: number;
  totalSpent: number;
  lastOrderDate?: string;
}

interface CustomersState {
  customers: Customer[];
  isLoading: boolean;
  error: string | null;
}

const initialState: CustomersState = {
  customers: [],
  isLoading: false,
  error: null,
};

const customersSlice = createSlice({
  name: 'customers',
  initialState,
  reducers: {
    setCustomers: (state, action: PayloadAction<Customer[]>) => {
      state.customers = action.payload;
    },
    addCustomer: (state, action: PayloadAction<Customer>) => {
      state.customers.push(action.payload);
    },
    updateCustomer: (state, action: PayloadAction<Customer>) => {
      const index = state.customers.findIndex(c => c.id === action.payload.id);
      if (index !== -1) {
        state.customers[index] = action.payload;
      }
    },
    removeCustomer: (state, action: PayloadAction<string>) => {
      state.customers = state.customers.filter(c => c.id !== action.payload);
    },
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.isLoading = action.payload;
    },
    setError: (state, action: PayloadAction<string | null>) => {
      state.error = action.payload;
    },
  },
});

export const {
  setCustomers,
  addCustomer,
  updateCustomer,
  removeCustomer,
  setLoading,
  setError,
} = customersSlice.actions;

// Selectors
export const selectCustomers = (state: { customers: CustomersState }) => state.customers.customers;
export const selectCustomersLoading = (state: { customers: CustomersState }) => state.customers.isLoading;
export const selectCustomersError = (state: { customers: CustomersState }) => state.customers.error;

export default customersSlice.reducer; 