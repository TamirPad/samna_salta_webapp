import { createSlice, createAsyncThunk, PayloadAction } from "@reduxjs/toolkit";
import { apiService } from "../../utils/api";
import { RootState } from "../../store";

export interface OrderItem {
  id: string;
  product_id: number;
  product_name: string;
  product_name_he?: string;
  product_name_en?: string;
  quantity: number;
  unit_price: number;
  total_price: number;
}

export interface Order {
  id: string;
  customer_id: string;
  customer_name: string;
  customer_phone: string;
  customer_email: string;
  items: OrderItem[];
  total_amount: number;
  status:
    | "pending"
    | "confirmed"
    | "preparing"
    | "ready"
    | "delivering"
    | "delivered"
    | "cancelled";
  payment_status: "pending" | "paid" | "failed";
  delivery_address?: string;
  delivery_notes?: string;
  created_at: string;
  updated_at: string;
}

interface OrdersState {
  orders: Order[];
  selectedOrder: Order | null;
  isLoading: boolean;
  error: string | null;
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

const initialState: OrdersState = {
  orders: [],
  selectedOrder: null,
  isLoading: false,
  error: null,
  pagination: {
    page: 1,
    limit: 10,
    total: 0,
    totalPages: 0,
  },
};

// Async thunks
export const fetchOrders = createAsyncThunk(
  "orders/fetchOrders",
  async (
    params: { status?: string; page?: number; limit?: number } = {},
    { rejectWithValue },
  ) => {
    try {
      const response = await apiService.getOrders(params);
      return (response as any)?.data ?? response;
    } catch (error: unknown) {
      const errorMessage =
        error instanceof Error && "response" in error
          ? (error as any).response?.data?.message || "Failed to fetch orders"
          : "Failed to fetch orders";
      return rejectWithValue(errorMessage);
    }
  },
);

export const fetchOrderDetails = createAsyncThunk(
  "orders/fetchOrderDetails",
  async (orderId: string, { rejectWithValue }) => {
    try {
      const response = await apiService.getOrder(parseInt(orderId));
      return (response as any)?.data ?? response;
    } catch (error: unknown) {
      const errorMessage =
        error instanceof Error && "response" in error
          ? (error as any).response?.data?.message ||
            "Failed to fetch order details"
          : "Failed to fetch order details";
      return rejectWithValue(errorMessage);
    }
  },
);

export const updateOrderStatus = createAsyncThunk(
  "orders/updateOrderStatus",
  async (
    {
      orderId,
      status,
      description,
    }: { orderId: string; status: string; description?: string },
    { rejectWithValue },
  ) => {
    try {
      const response = await apiService.updateOrderStatus(
        parseInt(orderId),
        status,
        description,
      );
      return (response as any)?.data ?? response;
    } catch (error: unknown) {
      const errorMessage =
        error instanceof Error && "response" in error
          ? (error as any).response?.data?.message ||
            "Failed to update order status"
          : "Failed to update order status";
      return rejectWithValue(errorMessage);
    }
  },
);

const ordersSlice = createSlice({
  name: "orders",
  initialState,
  reducers: {
    setSelectedOrder: (state, action: PayloadAction<Order | null>) => {
      state.selectedOrder = action.payload;
    },
    clearOrdersError: (state) => {
      state.error = null;
    },
    setOrdersPagination: (
      state,
      action: PayloadAction<{
        page: number;
        limit: number;
        total: number;
        totalPages: number;
      }>,
    ) => {
      state.pagination = action.payload;
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch orders
      .addCase(fetchOrders.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchOrders.fulfilled, (state, action) => {
        state.isLoading = false;
        const payloadData = (action.payload as any)?.data ?? action.payload ?? [];
        state.orders = Array.isArray(payloadData) ? payloadData : [];
        state.pagination = {
          page: (action.payload as any)?.pagination?.page || 1,
          limit: (action.payload as any)?.pagination?.limit || 10,
          total: (action.payload as any)?.pagination?.total || 0,
          totalPages: (action.payload as any)?.pagination?.totalPages || 0,
        };
      })
      .addCase(fetchOrders.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })
      // Fetch order details
      .addCase(fetchOrderDetails.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchOrderDetails.fulfilled, (state, action) => {
        state.isLoading = false;
        state.selectedOrder = (action.payload as any)?.data ?? (action.payload as any) ?? null;
      })
      .addCase(fetchOrderDetails.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })
      // Update order status
      .addCase(updateOrderStatus.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(updateOrderStatus.fulfilled, (state, action) => {
        state.isLoading = false;
        const updatedOrder = (action.payload as any)?.data ?? (action.payload as any);
        const orderIndex = state.orders.findIndex(
          (o: any) => o.id === updatedOrder?.id,
        );
        if (orderIndex !== -1 && updatedOrder) {
          (state.orders as any)[orderIndex] = updatedOrder;
        }
        if ((state.selectedOrder as any)?.id === updatedOrder?.id) {
          (state.selectedOrder as any) = updatedOrder;
        }
      })
      .addCase(updateOrderStatus.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });
  },
});

export const { setSelectedOrder, clearOrdersError, setOrdersPagination } =
  ordersSlice.actions;

// Selectors
export const selectOrders = (state: RootState): any[] => {
  const ordersState: any = (state as any)?.orders;
  const list = ordersState?.orders;
  return Array.isArray(list) ? list : [];
};
export const selectSelectedOrder = (state: RootState): Order | null =>
  (state as any)?.orders?.selectedOrder ?? null;
export const selectOrdersLoading = (state: RootState): boolean =>
  Boolean((state as any)?.orders?.isLoading);
export const selectOrdersError = (state: RootState): string | null =>
  ((state as any)?.orders?.error as string) ?? null;
export const selectOrdersPagination = (
  state: RootState,
): { page: number; limit: number; total: number; totalPages: number } =>
  (state as any)?.orders?.pagination ?? { page: 1, limit: 10, total: 0, totalPages: 0 };

export default ordersSlice.reducer;
