import { createSlice, PayloadAction, createSelector } from '@reduxjs/toolkit';

// Types
export interface CartItem {
  id: string;
  name: string;
  price: number;
  quantity: number;
  image: string;
  category: string;
  description?: string;
  available?: boolean;
}

export interface CartState {
  items: CartItem[];
  isOpen: boolean;
  lastUpdated: number;
}

// Initial state
const getInitialState = (): CartState => ({
  items: [],
  isOpen: false,
  lastUpdated: Date.now(),
});

// Utility functions
const findItemIndex = (items: CartItem[], id: string): number => {
  return items.findIndex(item => item.id === id);
};

const updateItemQuantity = (
  items: CartItem[],
  id: string,
  quantity: number
): CartItem[] => {
  const index = findItemIndex(items, id);
  if (index === -1) return items;

  const newItems = [...items];
  if (quantity <= 0) {
    newItems.splice(index, 1);
  } else {
    if (newItems[index]) {
      const existingItem = newItems[index];
      if (existingItem) {
        newItems[index] = { ...existingItem, quantity };
      }
    }
  }
  return newItems;
};

const addItemToCart = (items: CartItem[], newItem: CartItem): CartItem[] => {
  const existingIndex = findItemIndex(items, newItem.id);
  if (existingIndex !== -1) {
    // Update existing item quantity
    const existingItem = items[existingIndex];
    if (existingItem) {
      return updateItemQuantity(
        items,
        newItem.id,
        existingItem.quantity + newItem.quantity
      );
    }
    return items;
  }
  // Add new item
  return [...items, newItem];
};

// Cart slice
const cartSlice = createSlice({
  name: 'cart',
  initialState: getInitialState(),
  reducers: {
    addToCart: (state, action: PayloadAction<CartItem>) => {
      state.items = addItemToCart(state.items, action.payload);
      state.lastUpdated = Date.now();
    },

    removeFromCart: (state, action: PayloadAction<string>) => {
      state.items = state.items.filter(item => item.id !== action.payload);
      state.lastUpdated = Date.now();
    },

    updateQuantity: (
      state,
      action: PayloadAction<{ id: string; quantity: number }>
    ) => {
      const { id, quantity } = action.payload;
      state.items = updateItemQuantity(state.items, id, quantity);
      state.lastUpdated = Date.now();
    },

    clearCart: state => {
      state.items = [];
      state.lastUpdated = Date.now();
    },

    toggleCart: state => {
      state.isOpen = !state.isOpen;
    },

    openCart: state => {
      state.isOpen = true;
    },

    closeCart: state => {
      state.isOpen = false;
    },

    // Batch operations for better performance
    addMultipleItems: (state, action: PayloadAction<CartItem[]>) => {
      let newItems = [...state.items];
      action.payload.forEach(item => {
        newItems = addItemToCart(newItems, item);
      });
      state.items = newItems;
      state.lastUpdated = Date.now();
    },

    removeMultipleItems: (state, action: PayloadAction<string[]>) => {
      const idsToRemove = new Set(action.payload);
      state.items = state.items.filter(item => !idsToRemove.has(item.id));
      state.lastUpdated = Date.now();
    },

    // Update item properties
    updateItem: (
      state,
      action: PayloadAction<{ id: string; updates: Partial<CartItem> }>
    ) => {
      const { id, updates } = action.payload;
      const index = findItemIndex(state.items, id);
      if (index !== -1) {
        const existingItem = state.items[index];
        if (existingItem) {
          state.items[index] = { ...existingItem, ...updates };
        }
        state.lastUpdated = Date.now();
      }
    },

    // Move item to different position
    moveItem: (
      state,
      action: PayloadAction<{ fromIndex: number; toIndex: number }>
    ) => {
      const { fromIndex, toIndex } = action.payload;
      if (
        fromIndex >= 0 &&
        fromIndex < state.items.length &&
        toIndex >= 0 &&
        toIndex < state.items.length
      ) {
        const newItems = [...state.items];
        const [movedItem] = newItems.splice(fromIndex, 1);
        if (movedItem) {
          newItems.splice(toIndex, 0, movedItem);
        }
        state.items = newItems;
        state.lastUpdated = Date.now();
      }
    },
  },
});

// Export actions
export const {
  addToCart,
  removeFromCart,
  updateQuantity,
  clearCart,
  toggleCart,
  openCart,
  closeCart,
  addMultipleItems,
  removeMultipleItems,
  updateItem,
  moveItem,
} = cartSlice.actions;

// Base selectors
const selectCartState = (state: { cart: CartState }): CartState => state.cart;
export const selectCartItems = (state: { cart: CartState }): CartItem[] =>
  state.cart.items;

// Memoized selectors for better performance
export const selectCartItemsCount = createSelector([selectCartItems], items =>
  items.reduce((total, item) => total + item.quantity, 0)
);

export const selectCartTotal = createSelector([selectCartItems], items =>
  items.reduce((total, item) => total + item.price * item.quantity, 0)
);

export const selectIsCartOpen = createSelector(
  [selectCartState],
  cart => cart.isOpen
);

export const selectCartLastUpdated = createSelector(
  [selectCartState],
  cart => cart.lastUpdated
);

export const selectCartItemById = createSelector(
  [selectCartItems, (_state: { cart: CartState }, itemId: string) => itemId],
  (items: CartItem[], itemId: string): CartItem | undefined =>
    items.find(item => item.id === itemId)
);

export const selectCartItemsByCategory = createSelector(
  [selectCartItems, (_state: unknown, category: string) => category],
  (items, category) => items.filter(item => item.category === category)
);

// Utility selectors
export const selectIsCartEmpty = createSelector(
  [selectCartItems],
  items => items.length === 0
);

export const selectCartItemIds = createSelector([selectCartItems], items =>
  items.map(item => item.id)
);

export const selectCartCategories = createSelector([selectCartItems], items =>
  Array.from(new Set(items.map(item => item.category).filter(Boolean)))
);

export const selectCartSummary = createSelector(
  [selectCartItems, selectCartTotal, selectCartItemsCount],
  (items, total, count) => ({
    itemCount: items.length,
    totalQuantity: count,
    totalPrice: total,
    categories: Array.from(
      new Set(items.map(item => item.category).filter(Boolean))
    ),
  })
);

// Export the reducer
export default cartSlice.reducer;
