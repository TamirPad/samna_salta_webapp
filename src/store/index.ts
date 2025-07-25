import { configureStore } from '@reduxjs/toolkit';
import { persistStore, persistReducer } from 'redux-persist';
import storage from 'redux-persist/lib/storage';

import cartReducer from '../features/cart/cartSlice';
import authReducer from '../features/auth/authSlice';
import languageReducer from '../features/language/languageSlice';
import uiReducer from '../features/ui/uiSlice';
import ordersReducer from '../features/orders/ordersSlice';
import productsReducer from '../features/products/productsSlice';
import customersReducer from '../features/customers/customersSlice';

const persistConfig = {
  key: 'root',
  storage,
  whitelist: ['cart', 'auth', 'language'], // Only persist these reducers
};

const persistedCartReducer = persistReducer(persistConfig, cartReducer);
const persistedAuthReducer = persistReducer(persistConfig, authReducer);
const persistedLanguageReducer = persistReducer(persistConfig, languageReducer);

export const store = configureStore({
  reducer: {
    cart: persistedCartReducer,
    auth: persistedAuthReducer,
    language: persistedLanguageReducer,
    ui: uiReducer,
    orders: ordersReducer,
    products: productsReducer,
    customers: customersReducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        ignoredActions: ['persist/PERSIST', 'persist/REHYDRATE'],
      },
    }),
});

export const persistor = persistStore(store);

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch; 