import { createSlice, PayloadAction, createAsyncThunk } from '@reduxjs/toolkit';
import { apiService } from '../../utils/api';
import { Product } from '../../types';

interface ProductsState {
  products: Product[];
  categories: Category[];
  isLoading: boolean;
  error: string | null;
}

interface Category {
  id: number;
  name: string;
  name_en?: string;
  name_he?: string;
}

const initialState: ProductsState = {
  products: [],
  categories: [],
  isLoading: false,
  error: null,
};

// Initial state logged for debugging (removed for production)

// Async thunks
export const fetchProducts = createAsyncThunk(
  'products/fetchProducts',
  async (
    params: {
      category?: string;
      search?: string;
      page?: number;
      limit?: number;
    } = {},
    { rejectWithValue }
  ) => {
    try {
      const response = await apiService.getProducts(params);
      return response.data;
    } catch (error: unknown) {
      const errorMessage =
        error instanceof Error && 'response' in error
          ? (error as any).response?.data?.message || 'Failed to fetch products'
          : 'Failed to fetch products';
      return rejectWithValue(errorMessage);
    }
  }
);

export const fetchCategories = createAsyncThunk(
  'products/fetchCategories',
  async (_, { rejectWithValue }) => {
    try {
      const response = await apiService.getCategories();
      return response.data;
    } catch (error: unknown) {
      const errorMessage =
        error instanceof Error && 'response' in error
          ? (error as any).response?.data?.message ||
            'Failed to fetch categories'
          : 'Failed to fetch categories';
      return rejectWithValue(errorMessage);
    }
  }
);

export const createProduct = createAsyncThunk(
  'products/createProduct',
  async (productData: Partial<Product>, { rejectWithValue }) => {
    try {
      const response = await apiService.createProduct(productData);
      return response.data;
    } catch (error: unknown) {
      const errorMessage =
        error instanceof Error && 'response' in error
          ? (error as any).response?.data?.message || 'Failed to create product'
          : 'Failed to create product';
      return rejectWithValue(errorMessage);
    }
  }
);

export const updateProductAsync = createAsyncThunk(
  'products/updateProduct',
  async (
    { id, productData }: { id: number; productData: Partial<Product> },
    { rejectWithValue }
  ) => {
    try {
      const response = await apiService.updateProduct(id, productData);
      return response.data;
    } catch (error: unknown) {
      const errorMessage =
        error instanceof Error && 'response' in error
          ? (error as any).response?.data?.message || 'Failed to update product'
          : 'Failed to update product';
      return rejectWithValue(errorMessage);
    }
  }
);

export const deleteProduct = createAsyncThunk(
  'products/deleteProduct',
  async (productId: number, { rejectWithValue }) => {
    try {
      await apiService.deleteProduct(productId);
      return productId;
    } catch (error: unknown) {
      const errorMessage =
        error instanceof Error && 'response' in error
          ? (error as any).response?.data?.message || 'Failed to delete product'
          : 'Failed to delete product';
      return rejectWithValue(errorMessage);
    }
  }
);

const productsSlice = createSlice({
  name: 'products',
  initialState,
  reducers: {
    setProducts: (state, action: PayloadAction<Product[]>) => {
      state.products = action.payload;
    },
    addProduct: (state, action: PayloadAction<Product>) => {
      state.products.push(action.payload);
    },
    updateProduct: (state, action: PayloadAction<Product>) => {
      const index = state.products.findIndex(p => p.id === action.payload.id);
      if (index !== -1) {
        state.products[index] = action.payload;
      }
    },
    removeProduct: (state, action: PayloadAction<number>) => {
      state.products = state.products.filter(p => p.id !== action.payload);
    },
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.isLoading = action.payload;
    },
    setError: (state, action: PayloadAction<string | null>) => {
      state.error = action.payload;
    },
  },
  extraReducers: builder => {
    builder
      // Fetch products
      .addCase(fetchProducts.pending, state => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchProducts.fulfilled, (state, action) => {
        state.isLoading = false;
        state.products = Array.isArray(action.payload)
          ? action.payload
          : action.payload.data || [];
      })
      .addCase(fetchProducts.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })
      // Fetch categories
      .addCase(fetchCategories.pending, state => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchCategories.fulfilled, (state, action) => {
        state.isLoading = false;
        state.categories = Array.isArray(action.payload)
          ? action.payload
          : action.payload.data || [];
      })
      .addCase(fetchCategories.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });
  },
});

export const {
  setProducts,
  addProduct,
  updateProduct,
  removeProduct,
  setLoading,
  setError,
} = productsSlice.actions;

// Selectors
export const selectProducts = (state: { products: ProductsState }): Product[] =>
  state.products.products;
export const selectCategories = (state: {
  products: ProductsState;
}): Category[] => state.products.categories;
export const selectProductsLoading = (state: {
  products: ProductsState;
}): boolean => state.products.isLoading;
export const selectProductsError = (state: {
  products: ProductsState;
}): string | null => state.products.error;

export default productsSlice.reducer;
