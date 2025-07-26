import { configureStore, combineReducers } from '@reduxjs/toolkit';
import { persistStore, persistReducer, FLUSH, REHYDRATE, PAUSE, PERSIST, PURGE, REGISTER } from 'redux-persist';
import storage from 'redux-persist/lib/storage';

// Import reducers
import cartReducer from '../features/cart/cartSlice';
import authReducer from '../features/auth/authSlice';
import languageReducer from '../features/language/languageSlice';
import uiReducer from '../features/ui/uiSlice';
import ordersReducer from '../features/orders/ordersSlice';
import productsReducer from '../features/products/productsSlice';
import customersReducer from '../features/customers/customersSlice';
import analyticsReducer from '../features/analytics/analyticsSlice';

// Types
export interface RootState {
  cart: ReturnType<typeof cartReducer>;
  auth: ReturnType<typeof authReducer>;
  language: ReturnType<typeof languageReducer>;
  ui: ReturnType<typeof uiReducer>;
  orders: ReturnType<typeof ordersReducer>;
  products: ReturnType<typeof productsReducer>;
  customers: ReturnType<typeof customersReducer>;
  analytics: ReturnType<typeof analyticsReducer>;
}

// Persist configuration
const persistConfig = {
  key: 'root',
  storage,
  whitelist: ['cart', 'auth', 'language'], // Only persist these reducers
  blacklist: ['products', 'orders', 'customers', 'analytics'], // Don't persist these
  // Transform data before persisting
  transforms: [
    // Add any data transformations here if needed
  ],
  // Migrate data between versions
  migrate: (state: any) => {
    // Handle state migrations here
    return Promise.resolve(state);
  },
  // Serialize/deserialize data
  serialize: true,
  deserialize: true,
};

// Combine reducers
const rootReducer = combineReducers({
  cart: cartReducer,
  auth: authReducer,
  language: languageReducer,
  ui: uiReducer,
  orders: ordersReducer,
  products: productsReducer,
  customers: customersReducer,
  analytics: analyticsReducer,
});

// Create persisted reducer
const persistedReducer = persistReducer(persistConfig, rootReducer);

// Configure store with enhanced settings
export const store = configureStore({
  reducer: persistedReducer,
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        ignoredActions: [FLUSH, REHYDRATE, PAUSE, PERSIST, PURGE, REGISTER],
        // Ignore specific action types that might contain non-serializable data
        ignoredActionPaths: ['payload.timestamp', 'payload.file'],
        ignoredPaths: ['products.items', 'orders.items'], // Ignore specific state paths
      },
      // Add custom middleware for performance monitoring
      immutableCheck: {
        // Disable in production for better performance
        ignoredPaths: process.env['NODE_ENV'] === 'production' ? ['products', 'orders'] : [],
      },
    }),
  devTools: process.env['NODE_ENV'] !== 'production',
});

// Create persistor
export const persistor = persistStore(store);

// Export types
export type AppDispatch = typeof store.dispatch;
export type AppState = ReturnType<typeof store.getState>;

// Utility functions for store management
export const resetStore = (): void => {
  // Clear persisted data
  persistor.purge();
  // Reset all reducers to initial state
  store.dispatch({ type: 'RESET_STORE' });
};

export const clearPersistedData = (): void => {
  localStorage.removeItem('persist:root');
  sessionStorage.clear();
};

// Hot reload support for development
if (process.env['NODE_ENV'] === 'development' && (module as any).hot) {
  (module as any).hot.accept('../features/cart/cartSlice', () => {
    store.replaceReducer(persistedReducer);
  });
} 