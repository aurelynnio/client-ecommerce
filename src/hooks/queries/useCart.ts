/**
 * Cart React Query Hooks
 * Replaces cartAction.ts async thunks with React Query for server sync
 * Note: Cart UI state (selectedItems, etc.) remains in Redux
 */
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import instance from '@/api/api';
import { extractApiData } from '@/api';
import { errorHandler } from '@/services/errorHandler';
import { cartKeys } from '@/lib/queryKeys';
import { Cart } from '@/types/cart';

export interface AddToCartData {
  productId: string;
  shopId: string;
  modelId?: string;
  quantity?: number;
  size?: string;
}

export interface UpdateCartItemData {
  itemId: string;
  quantity: number;
}

const cartApi = {
  get: async (): Promise<Cart> => {
    const response = await instance.get('/cart');
    return extractApiData(response);
  },

  add: async (data: AddToCartData): Promise<Cart> => {
    const response = await instance.post('/cart', {
      productId: data.productId,
      shopId: data.shopId,
      modelId: data.modelId,
      quantity: data.quantity || 1,
      size: data.size,
    });
    return extractApiData(response);
  },

  update: async (data: UpdateCartItemData): Promise<Cart> => {
    const response = await instance.put(`/cart/${data.itemId}`, {
      quantity: data.quantity,
    });
    return extractApiData(response);
  },

  remove: async (itemId: string): Promise<Cart> => {
    const response = await instance.delete(`/cart/${itemId}`);
    return extractApiData(response);
  },

  clear: async (): Promise<Cart> => {
    const response = await instance.delete('/cart');
    return extractApiData(response);
  },
};

/**
 * Get current cart
 */
export function useCart(options?: { enabled?: boolean }) {
  return useQuery({
    queryKey: cartKeys.current(),
    queryFn: cartApi.get,
    enabled: options?.enabled,
    staleTime: 1 * 60 * 1000, // 1 minute
  });
}

/**
 * Add to cart mutation
 */
export function useAddToCart() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: cartApi.add,
    onSuccess: (data) => {
      // Update cart cache with new data
      queryClient.setQueryData(cartKeys.current(), data);
    },
    onError: (error) => {
      errorHandler.log(error, { context: 'Add to cart failed' });
    },
  });
}

/**
 * Update cart item mutation
 */
export function useUpdateCartItem() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: cartApi.update,
    onSuccess: (data) => {
      queryClient.setQueryData(cartKeys.current(), data);
    },
    onError: (error) => {
      errorHandler.log(error, { context: 'Update cart item failed' });
    },
  });
}

/**
 * Remove from cart mutation
 */
export function useRemoveFromCart() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: cartApi.remove,
    onSuccess: (data) => {
      queryClient.setQueryData(cartKeys.current(), data);
    },
    onError: (error) => {
      errorHandler.log(error, { context: 'Remove from cart failed' });
    },
  });
}

/**
 * Clear cart mutation
 */
export function useClearCart() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: cartApi.clear,
    onSuccess: (data) => {
      queryClient.setQueryData(cartKeys.current(), data);
    },
    onError: (error) => {
      errorHandler.log(error, { context: 'Clear cart failed' });
    },
  });
}

/**
 * Optimistic add to cart with rollback
 */
export function useOptimisticAddToCart() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: cartApi.add,
    onMutate: async () => {
      // Cancel outgoing refetches
      await queryClient.cancelQueries({ queryKey: cartKeys.current() });

      // Snapshot previous value
      const previousCart = queryClient.getQueryData(cartKeys.current());

      return { previousCart };
    },
    onError: (_err, _variables, context) => {
      // Rollback on error
      if (context?.previousCart) {
        queryClient.setQueryData(cartKeys.current(), context.previousCart);
      }
    },
    onSuccess: (data) => {
      queryClient.setQueryData(cartKeys.current(), data);
    },
    onSettled: () => {
      // Refetch to ensure consistency
      queryClient.invalidateQueries({ queryKey: cartKeys.current() });
    },
  });
}
