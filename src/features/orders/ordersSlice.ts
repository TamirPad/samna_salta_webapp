import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface Order {
  id: string;
  customerName: string;
  items: Array<{
    id: string;
    name: string;
    quantity: number;
    price: number;
  }>;
  total: number;
  status: 'pending' | 'confirmed' | 'preparing' | 'ready' | 'delivered' | 'cancelled';
  createdAt: string;
  deliveryAddress?: string;
  phone?: string;
}

interface OrdersState {
  orders: Order[];
  isLoading: boolean;
  error: string | null;
}

const initialState: OrdersState = {
  orders: [],
  isLoading: false,
  error: null,
};

const ordersSlice = createSlice({
  name: 'orders',
  initialState,
  reducers: {
    setOrders: (state, action: PayloadAction<Order[]>) => {
      state.orders = action.payload;
    },
    addOrder: (state, action: PayloadAction<Order>) => {
      state.orders.push(action.payload);
    },
    updateOrderStatus: (state, action: PayloadAction<{ id: string; status: Order['status'] }>) => {
      const order = state.orders.find(o => o.id === action.payload.id);
      if (order) {
        order.status = action.payload.status;
      }
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
  setOrders,
  addOrder,
  updateOrderStatus,
  setLoading,
  setError,
} = ordersSlice.actions;

// Selectors
export const selectOrders = (state: { orders: OrdersState }) => state.orders.orders;
export const selectOrdersLoading = (state: { orders: OrdersState }) => state.orders.isLoading;
export const selectOrdersError = (state: { orders: OrdersState }) => state.orders.error;

export default ordersSlice.reducer; 