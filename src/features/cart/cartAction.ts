import instance from '@/api/api';
import { ENDPOINT_CART } from '@/constants/endpoint';
import { createAsyncThunk } from '@reduxjs/toolkit';
import { AddToCartPayload, UpdateCartItemPayload } from '@/types/cart';
import { extractApiData, extractApiError } from '@/api';

// Add to cart
export const addToCart = createAsyncThunk(
  'add/cart',
  async (
    { productId, shopId, modelId, quantity = 1, size }: AddToCartPayload,
    { rejectWithValue },
  ) => {
    try {
      const response = await instance.post(ENDPOINT_CART.ROOT, {
        productId,
        shopId,
        modelId,
        quantity,
        size,
      });
      return extractApiData(response);
    } catch (error) {
      return rejectWithValue(extractApiError(error));
    }
  },
);

// Remove item from cart
export const removeFromCart = createAsyncThunk(
  'remove/cart',
  async ({ itemId }: { itemId: string }, { rejectWithValue }) => {
    try {
      const response = await instance.delete(ENDPOINT_CART.byItemId(itemId));
      return extractApiData(response);
    } catch (error) {
      return rejectWithValue(extractApiError(error));
    }
  },
);

// Clear entire cart
export const clearCart = createAsyncThunk('clear/cart', async (_, { rejectWithValue }) => {
  try {
    const response = await instance.delete(ENDPOINT_CART.ROOT);
    return extractApiData(response);
  } catch (error) {
    return rejectWithValue(extractApiError(error));
  }
});

// Update cart item quantity
export const updateCartItem = createAsyncThunk(
  'update/cart',
  async ({ itemId, quantity }: UpdateCartItemPayload, { rejectWithValue }) => {
    try {
      const response = await instance.put(ENDPOINT_CART.byItemId(itemId), { quantity });
      return extractApiData(response);
    } catch (error) {
      return rejectWithValue(extractApiError(error));
    }
  },
);

// Get cart
export const getCart = createAsyncThunk('get/cart', async (_, { rejectWithValue }) => {
  try {
    const response = await instance.get(ENDPOINT_CART.ROOT);
    return extractApiData(response);
  } catch (error) {
    return rejectWithValue(extractApiError(error));
  }
});

// NEW: Remove items by shop
export const removeItemsByShop = createAsyncThunk(
  'remove/cart/shop',
  async ({ shopId }: { shopId: string }, { rejectWithValue }) => {
    try {
      const cartResponse = await instance.get(ENDPOINT_CART.ROOT);
      const cart = extractApiData<{
        items?: Array<{ _id: string; shopId?: string | { _id?: string } }>;
      }>(cartResponse);
      const itemIds =
        cart.items
          ?.filter((item) => {
            const itemShopId = typeof item.shopId === 'string' ? item.shopId : item.shopId?._id;
            return itemShopId === shopId;
          })
          .map((item) => item._id) ?? [];

      await Promise.all(itemIds.map((itemId) => instance.delete(ENDPOINT_CART.byItemId(itemId))));
      const response = await instance.get(ENDPOINT_CART.ROOT);
      return extractApiData(response);
    } catch (error) {
      return rejectWithValue(extractApiError(error));
    }
  },
);
