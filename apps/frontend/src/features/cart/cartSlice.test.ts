import cartReducer, {
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
  selectCartItems,
  selectCartTotal,
  selectCartItemsCount,
  selectIsCartOpen,
  selectCartLastUpdated,
  selectCartItemById,
  selectCartItemsByCategory,
  selectIsCartEmpty,
  selectCartItemIds,
  selectCartCategories,
  selectCartSummary,
  CartItem,
} from './cartSlice';

describe('Cart Slice', () => {
  const mockItem: CartItem = {
    id: '1',
    name: 'Test Product',
    price: 25.00,
    quantity: 1,
    image: 'test-image.jpg',
    category: 'Test Category',
    description: 'Test description',
  };

  const mockItem2: CartItem = {
    id: '2',
    name: 'Test Product 2',
    price: 30.00,
    quantity: 2,
    image: 'test-image-2.jpg',
    category: 'Test Category 2',
  };

  const initialState = {
    items: [],
    isOpen: false,
    lastUpdated: Date.now(),
  };

  describe('reducers', () => {
    it('should return initial state', () => {
      expect(cartReducer(undefined, { type: 'unknown' })).toEqual(initialState);
    });

    it('should handle addToCart with new item', () => {
      const newState = cartReducer(initialState, addToCart(mockItem));

      expect(newState.items).toHaveLength(1);
      expect(newState.items[0]).toEqual(mockItem);
      expect(newState.lastUpdated).toBeGreaterThan(initialState.lastUpdated);
    });

    it('should handle addToCart with existing item', () => {
      const stateWithItem = {
        ...initialState,
        items: [mockItem],
      };

      const newItem = { ...mockItem, quantity: 2 };
      const newState = cartReducer(stateWithItem, addToCart(newItem));

      expect(newState.items).toHaveLength(1);
      expect(newState.items[0]?.quantity).toBe(3); // 1 + 2
    });

    it('should handle removeFromCart', () => {
      const stateWithItems = {
        ...initialState,
        items: [mockItem, mockItem2],
      };

      const newState = cartReducer(stateWithItems, removeFromCart('1'));

      expect(newState.items).toHaveLength(1);
      expect(newState.items[0]?.id).toBe('2');
    });

    it('should handle updateQuantity', () => {
      const stateWithItem = {
        ...initialState,
        items: [mockItem],
      };

      const newState = cartReducer(stateWithItem, updateQuantity({ id: '1', quantity: 3 }));

      expect(newState.items[0]?.quantity).toBe(3);
    });

    it('should handle updateQuantity to zero (remove item)', () => {
      const stateWithItem = {
        ...initialState,
        items: [mockItem],
      };

      const newState = cartReducer(stateWithItem, updateQuantity({ id: '1', quantity: 0 }));

      expect(newState.items).toHaveLength(0);
    });

    it('should handle clearCart', () => {
      const stateWithItems = {
        ...initialState,
        items: [mockItem, mockItem2],
      };

      const newState = cartReducer(stateWithItems, clearCart());

      expect(newState.items).toHaveLength(0);
      expect(newState.lastUpdated).toBeGreaterThan(initialState.lastUpdated);
    });

    it('should handle toggleCart', () => {
      const newState = cartReducer(initialState, toggleCart());

      expect(newState.isOpen).toBe(true);

      const newState2 = cartReducer(newState, toggleCart());

      expect(newState2.isOpen).toBe(false);
    });

    it('should handle openCart', () => {
      const newState = cartReducer(initialState, openCart());

      expect(newState.isOpen).toBe(true);
    });

    it('should handle closeCart', () => {
      const stateOpen = {
        ...initialState,
        isOpen: true,
      };

      const newState = cartReducer(stateOpen, closeCart());

      expect(newState.isOpen).toBe(false);
    });

    it('should handle addMultipleItems', () => {
      const newState = cartReducer(initialState, addMultipleItems([mockItem, mockItem2]));

      expect(newState.items).toHaveLength(2);
      expect(newState.items[0]).toEqual(mockItem);
      expect(newState.items[1]).toEqual(mockItem2);
    });

    it('should handle removeMultipleItems', () => {
      const stateWithItems = {
        ...initialState,
        items: [mockItem, mockItem2],
      };

      const newState = cartReducer(stateWithItems, removeMultipleItems(['1', '2']));

      expect(newState.items).toHaveLength(0);
    });

    it('should handle updateItem', () => {
      const stateWithItem = {
        ...initialState,
        items: [mockItem],
      };

      const newState = cartReducer(stateWithItem, updateItem({
        id: '1',
        updates: { name: 'Updated Product', price: 35.00 }
      }));

      expect(newState.items[0]?.name).toBe('Updated Product');
      expect(newState.items[0]?.price).toBe(35.00);
      expect(newState.items[0]?.quantity).toBe(1); // unchanged
    });

    it('should handle moveItem', () => {
      const stateWithItems = {
        ...initialState,
        items: [mockItem, mockItem2],
      };

      const newState = cartReducer(stateWithItems, moveItem({ fromIndex: 0, toIndex: 1 }));

      expect(newState.items[0]?.id).toBe('2');
      expect(newState.items[1]?.id).toBe('1');
    });

    it('should not move item with invalid indices', () => {
      const stateWithItems = {
        ...initialState,
        items: [mockItem, mockItem2],
      };

      const newState = cartReducer(stateWithItems, moveItem({ fromIndex: 0, toIndex: 5 }));

      expect(newState.items).toEqual(stateWithItems.items);
    });
  });

  describe('selectors', () => {
    const mockState = {
      cart: {
        items: [mockItem, mockItem2],
        isOpen: true,
        lastUpdated: 1234567890,
      },
    };

    it('should select cart items', () => {
      const result = selectCartItems(mockState);
      expect(result).toEqual([mockItem, mockItem2]);
    });

    it('should select cart total', () => {
      const result = selectCartTotal(mockState);
      // mockItem: 25 * 1 = 25, mockItem2: 30 * 2 = 60, total = 85
      expect(result).toBe(85);
    });

    it('should select cart items count', () => {
      const result = selectCartItemsCount(mockState);
      // mockItem: 1, mockItem2: 2, total = 3
      expect(result).toBe(3);
    });

    it('should select is cart open', () => {
      const result = selectIsCartOpen(mockState);
      expect(result).toBe(true);
    });

    it('should select cart last updated', () => {
      const result = selectCartLastUpdated(mockState);
      expect(result).toBe(1234567890);
    });

    it('should select cart item by id', () => {
      const result = selectCartItemById(mockState, '1');
      expect(result).toEqual(mockItem);
    });

    it('should select cart item by id (not found)', () => {
      const result = selectCartItemById(mockState, '999');
      expect(result).toBeUndefined();
    });

    it('should select cart items by category', () => {
      const result = selectCartItemsByCategory(mockState, 'Test Category');
      expect(result).toEqual([mockItem]);
    });

    it('should select is cart empty', () => {
      const emptyState = {
        cart: {
          ...mockState.cart,
          items: [],
        },
      };
      const result = selectIsCartEmpty(emptyState);
      expect(result).toBe(true);
    });

    it('should select cart item ids', () => {
      const result = selectCartItemIds(mockState);
      expect(result).toEqual(['1', '2']);
    });

    it('should select cart categories', () => {
      const result = selectCartCategories(mockState);
      expect(result).toEqual(['Test Category', 'Test Category 2']);
    });

    it('should select cart summary', () => {
      const result = selectCartSummary(mockState);
      expect(result).toEqual({
        itemCount: 2,
        totalQuantity: 3,
        totalPrice: 85,
        categories: ['Test Category', 'Test Category 2'],
      });
    });
  });

  describe('edge cases', () => {
    it('should handle adding item with zero quantity', () => {
      const itemWithZeroQuantity = { ...mockItem, quantity: 0 };
      const newState = cartReducer(initialState, addToCart(itemWithZeroQuantity));

      expect(newState.items).toHaveLength(0);
    });

    it('should handle updating quantity of non-existent item', () => {
      const newState = cartReducer(initialState, updateQuantity({ id: '999', quantity: 5 }));

      expect(newState.items).toHaveLength(0);
    });

    it('should handle removing non-existent item', () => {
      const newState = cartReducer(initialState, removeFromCart('999'));

      expect(newState.items).toHaveLength(0);
    });

    it('should handle updating non-existent item', () => {
      const newState = cartReducer(initialState, updateItem({
        id: '999',
        updates: { name: 'Updated' }
      }));

      expect(newState.items).toHaveLength(0);
    });
  });
}); 