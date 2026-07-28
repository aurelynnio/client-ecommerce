import { createSlice } from '@reduxjs/toolkit';
import {
  addToCart,
  clearCart,
  getCart,
  removeFromCart,
  updateCartItem,
  removeItemsByShop,
} from './cartAction';
import {
  Cart,
  CartItem,
  CartState,
  groupCartItemsByShop,
  getCartItemPriceValue,
} from '@/types/cart';

const initialState: CartState = {
  data: null,
  isLoading: false,
  error: null,
  selectedItems: [],
  checkoutTotal: 0,
  itemsByShop: [], // NEW: Items grouped by shop
};

const calculateCartTotals = (items: CartItem[], selectedItems: CartItem[]) => {
  const totalAmount = items.reduce((sum, item) => {
    const price = getCartItemPriceValue(item.price);
    return sum + price * item.quantity;
  }, 0);

  const checkoutTotal = selectedItems.reduce((sum, item) => {
    const price = getCartItemPriceValue(item.price);
    return sum + price * item.quantity;
  }, 0);

  return { totalAmount, checkoutTotal };
};

const getRejectedErrorMessage = (action: { payload?: unknown }, fallback: string): string => {
  if (action.payload && typeof action.payload === 'object' && 'message' in action.payload) {
    const message = (action.payload as { message?: unknown }).message;
    if (typeof message === 'string' && message.trim() !== '') {
      return message;
    }
  }
  return fallback;
};

export const cartSlice = createSlice({
  name: 'cart',
  initialState,
  reducers: {
    setCartFromQuery: (state, action: { payload: Cart | null }) => {
      const cartData = action.payload;
      if (!cartData) {
        state.data = null;
        state.selectedItems = [];
        state.checkoutTotal = 0;
        state.itemsByShop = [];
        return;
      }

      const selectedIds = new Set(state.selectedItems.map((item) => item._id));
      const items = (cartData.items ?? []).map((item: CartItem) => ({
        ...item,
        selected: selectedIds.has(item._id),
      }));

      const selectedItems = items.filter((item) => item.selected);
      const { checkoutTotal } = calculateCartTotals(items, selectedItems);

      state.data = {
        ...cartData,
        items,
      };
      state.selectedItems = selectedItems;
      state.checkoutTotal = checkoutTotal;
      state.itemsByShop = groupCartItemsByShop(items);
    },
    addToCartLocal: (state, action) => {
      if (!state.data) {
        state.data = {
          _id: '',
          userId: '',
          items: [action.payload],
          totalAmount: action.payload.price.currentPrice * action.payload.quantity,
          cartCount: 1,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        };
      } else {
        const existingItemIndex = state.data.items.findIndex(
          (item) =>
            item._id === action.payload._id ||
            (item.productId &&
              typeof item.productId === 'object' &&
              item.productId._id === action.payload.productId._id &&
              (item.modelId === action.payload.modelId ||
                item.variantId === action.payload.variantId)),
        );

        if (existingItemIndex > -1) {
          // Update existing item
          state.data.items[existingItemIndex].quantity += action.payload.quantity;
        } else {
          // Add new item
          state.data.items.push(action.payload);
        }

        // Recalculate total
        const { totalAmount } = calculateCartTotals(state.data.items, state.selectedItems);
        state.data.totalAmount = totalAmount;
      }
    },
    removeFromCartLocal: (state, action) => {
      if (state.data) {
        const itemToRemove = state.data.items.find((item) => item._id === action.payload);
        if (itemToRemove) {
          state.data.items = state.data.items.filter((item) => item._id !== action.payload);

          state.selectedItems = state.selectedItems.filter((item) => item._id !== action.payload);

          const { totalAmount, checkoutTotal } = calculateCartTotals(
            state.data.items,
            state.selectedItems,
          );
          state.data.totalAmount = totalAmount;
          state.checkoutTotal = checkoutTotal;
        }
      }
    },
    clearCartLocal: (state) => {
      if (state.data) {
        state.data.items = [];
        state.data.totalAmount = 0;
      }
      state.selectedItems = [];
      state.checkoutTotal = 0;
    },
    updateCartLocal: (state, action) => {
      if (state.data) {
        const { itemId, quantity } = action.payload;
        const itemIndex = state.data.items.findIndex((item) => item._id === itemId);

        if (itemIndex > -1) {
          state.data.items[itemIndex].quantity = quantity;

          const selectedItemIndex = state.selectedItems.findIndex((item) => item._id === itemId);
          if (selectedItemIndex > -1) {
            state.selectedItems[selectedItemIndex].quantity = quantity;
          }

          const { totalAmount, checkoutTotal } = calculateCartTotals(
            state.data.items,
            state.selectedItems,
          );
          state.data.totalAmount = totalAmount;
          state.checkoutTotal = checkoutTotal;
        }
      }
    },

    toggleSelectItem: (state, action) => {
      const itemId = action.payload;
      if (!state.data) return;

      const itemIndex = state.data.items.findIndex((item) => item._id === itemId);
      if (itemIndex > -1) {
        const item = state.data.items[itemIndex];
        const isSelected = !item.selected;

        // Cập nhật trạng thái selected trong cart items
        state.data.items[itemIndex].selected = isSelected;

        // Cập nhật selectedItems
        if (isSelected) {
          // Thêm vào selectedItems nếu chưa có
          if (!state.selectedItems.find((selectedItem) => selectedItem._id === itemId)) {
            state.selectedItems.push(item);
          }
        } else {
          // Xóa khỏi selectedItems
          state.selectedItems = state.selectedItems.filter(
            (selectedItem) => selectedItem._id !== itemId,
          );
        }

        // Tính lại checkout total
        const { checkoutTotal } = calculateCartTotals(state.data.items, state.selectedItems);
        state.checkoutTotal = checkoutTotal;
      }
    },

    selectAllItems: (state) => {
      if (!state.data) return;

      // Chọn tất cả items
      state.data.items.forEach((item) => {
        item.selected = true;
      });

      // Cập nhật selectedItems
      state.selectedItems = [...state.data.items];

      // Tính lại checkout total
      const { checkoutTotal } = calculateCartTotals(state.data.items, state.selectedItems);
      state.checkoutTotal = checkoutTotal;
    },

    unselectAllItems: (state) => {
      if (!state.data) return;

      // Bỏ chọn tất cả items
      state.data.items.forEach((item) => {
        item.selected = false;
      });

      // Xóa selectedItems
      state.selectedItems = [];
      state.checkoutTotal = 0;
    },

    prepareForCheckout: (state) => {
      if (!state.data) return;

      const { checkoutTotal } = calculateCartTotals(state.data.items, state.selectedItems);
      state.checkoutTotal = checkoutTotal;
    },

    clearError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    // Get Cart
    builder.addCase(getCart.pending, (state) => {
      state.isLoading = true;
      state.error = null;
    });
    builder.addCase(getCart.fulfilled, (state, action) => {
      state.isLoading = false;
      state.error = null;

      // extractApiData already extracts the data
      const cartData = action.payload;

      if (cartData && cartData.items) {
        cartData.items = cartData.items.map((item: CartItem) => ({
          ...item,
          selected: item.selected || false,
        }));
      }

      state.data = cartData;

      if (cartData && cartData.items) {
        state.selectedItems = cartData.items.filter((item: CartItem) => item.selected);
        const { checkoutTotal } = calculateCartTotals(cartData.items, state.selectedItems);
        state.checkoutTotal = checkoutTotal;
      }
    });
    builder.addCase(getCart.rejected, (state, action) => {
      state.isLoading = false;
      state.error = getRejectedErrorMessage(action, 'Không thể lấy giỏ hàng');
    });

    // Add to Cart
    builder.addCase(addToCart.pending, (state) => {
      state.isLoading = true;
      state.error = null;
    });
    builder.addCase(addToCart.fulfilled, (state, action) => {
      state.isLoading = false;
      state.error = null;

      // extractApiData already extracts the data
      const cartData = action.payload;

      if (cartData && cartData.items) {
        cartData.items = cartData.items.map((item: CartItem) => ({
          ...item,
          selected: item.selected || false,
        }));
      }

      state.data = cartData;
    });
    builder.addCase(addToCart.rejected, (state, action) => {
      state.isLoading = false;
      state.error = getRejectedErrorMessage(action, 'Không thể thêm sản phẩm vào giỏ hàng');
    });

    // Remove from Cart
    builder.addCase(removeFromCart.pending, (state) => {
      state.isLoading = true;
      state.error = null;
    });
    builder.addCase(removeFromCart.fulfilled, (state, action) => {
      state.isLoading = false;
      state.error = null;

      // extractApiData already extracts the data
      const cartData = action.payload;

      if (cartData && cartData.items) {
        cartData.items = cartData.items.map((item: CartItem) => ({
          ...item,
          selected: item.selected || false,
        }));
      }

      state.data = cartData;

      if (cartData && cartData.items) {
        state.selectedItems = cartData.items.filter((item: CartItem) => item.selected);
        const { checkoutTotal } = calculateCartTotals(cartData.items, state.selectedItems);
        state.checkoutTotal = checkoutTotal;
      }
    });
    builder.addCase(removeFromCart.rejected, (state, action) => {
      state.isLoading = false;
      state.error = getRejectedErrorMessage(action, 'Không thể xóa sản phẩm khỏi giỏ hàng');
    });

    // Clear Cart
    builder.addCase(clearCart.pending, (state) => {
      state.isLoading = true;
      state.error = null;
    });
    builder.addCase(clearCart.fulfilled, (state, action) => {
      state.isLoading = false;
      state.error = null;

      // extractApiData already extracts the data
      const cartData = action.payload;

      state.data = cartData;
      state.selectedItems = [];
      state.checkoutTotal = 0;
    });
    builder.addCase(clearCart.rejected, (state, action) => {
      state.isLoading = false;
      state.error = getRejectedErrorMessage(action, 'Không thể xóa giỏ hàng');
    });

    builder.addCase(updateCartItem.pending, (state) => {
      state.isLoading = true;
      state.error = null;
    });

    builder.addCase(updateCartItem.fulfilled, (state, action) => {
      state.isLoading = false;
      state.error = null;
      const oldItemsWithVariants = state.data?.items || [];

      // extractApiData already extracts the data
      const cartData = action.payload;

      if (cartData) {
        // Optimize: Create map for O(1) lookup instead of O(N) find
        const oldItemsMap = new Map(oldItemsWithVariants.map((item) => [item._id, item]));

        const updatedItems = cartData.items.map((newItem: Record<string, string>) => {
          const oldItem = oldItemsMap.get(newItem._id);
          return {
            ...newItem,
            variant: oldItem?.variant,
            selected: oldItem?.selected || false,
          };
        });

        state.data = {
          ...cartData,
          items: updatedItems,
        };

        state.selectedItems = updatedItems.filter((item: CartItem) => item.selected);
        const { checkoutTotal } = calculateCartTotals(updatedItems, state.selectedItems);
        state.checkoutTotal = checkoutTotal;
      }
    });
    builder.addCase(updateCartItem.rejected, (state, action) => {
      state.isLoading = false;
      state.error = getRejectedErrorMessage(action, 'Không thể cập nhật giỏ hàng');
    });

    // NEW: Remove items by shop
    builder.addCase(removeItemsByShop.pending, (state) => {
      state.isLoading = true;
      state.error = null;
    });
    builder.addCase(removeItemsByShop.fulfilled, (state, action) => {
      state.isLoading = false;
      state.error = null;

      // extractApiData already extracts the data
      const cartData = action.payload;

      if (cartData && cartData.items) {
        cartData.items = cartData.items.map((item: CartItem) => ({
          ...item,
          selected: item.selected || false,
        }));
        state.itemsByShop = groupCartItemsByShop(cartData.items);
      }

      state.data = cartData;
    });
    builder.addCase(removeItemsByShop.rejected, (state, action) => {
      state.isLoading = false;
      state.error = getRejectedErrorMessage(action, 'Không thể xóa sản phẩm theo shop');
    });
  },
});

export const {
  setCartFromQuery,
  addToCartLocal,
  removeFromCartLocal,
  clearCartLocal,
  updateCartLocal,
  toggleSelectItem,
  selectAllItems,
  unselectAllItems,
  prepareForCheckout,
  clearError,
} = cartSlice.actions;

export default cartSlice.reducer;
