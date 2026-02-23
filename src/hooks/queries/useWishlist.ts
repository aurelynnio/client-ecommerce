/**
 * Wishlist React Query Hooks
 * Replaces wishlistAction.ts async thunks with React Query
 */
import {
  QueryClient,
  useQuery,
  useMutation,
  useQueryClient,
} from "@tanstack/react-query";
import { useCallback, useRef, useState } from "react";
import instance from "@/api/api";
import { extractApiData, getSafeErrorMessage } from "@/api";
import { errorHandler } from "@/services/errorHandler";
import { STALE_TIME } from "@/constants/cache";
import { wishlistKeys } from "@/lib/queryKeys";
import { toast } from "sonner";
import {
  WishlistResponse,
  CheckWishlistResponse,
  CheckMultipleWishlistResponse,
} from "@/types/wishlist";

function invalidateWishlistListAndCount(queryClient: QueryClient) {
  queryClient.invalidateQueries({ queryKey: wishlistKeys.list() });
  queryClient.invalidateQueries({ queryKey: wishlistKeys.count() });
}

function invalidateWishlistAll(queryClient: QueryClient) {
  return queryClient.invalidateQueries({ queryKey: wishlistKeys.all });
}

// ============ API Functions ============
const wishlistApi = {
  getAll: async (params?: {
    page?: number;
    limit?: number;
  }): Promise<WishlistResponse> => {
    const response = await instance.get("/wishlist", { params });
    return extractApiData(response);
  },

  getCount: async (): Promise<number> => {
    const response = await instance.get("/wishlist/count");
    const data = extractApiData<{ count?: number }>(response);
    return data?.count || 0;
  },

  check: async (productId: string): Promise<boolean> => {
    const response = await instance.get(`/wishlist/check/${productId}`);
    const data = extractApiData<CheckWishlistResponse>(response);
    return data?.isInWishlist || false;
  },

  checkMultiple: async (
    productIds: string[]
  ): Promise<CheckMultipleWishlistResponse> => {
    const response = await instance.post("/wishlist/check-multiple", {
      productIds,
    });
    return extractApiData(response) || {};
  },

  // Mutations
  add: async (
    productId: string
  ): Promise<{ productId: string; wishlistCount: number }> => {
    const response = await instance.post(`/wishlist/${productId}`);
    return { ...extractApiData(response), productId };
  },

  remove: async (productId: string): Promise<string> => {
    await instance.delete(`/wishlist/${productId}`);
    return productId;
  },

  clear: async (): Promise<void> => {
    await instance.delete("/wishlist");
  },
};

// ============ Query Hooks ============

/**
 * Get user's wishlist with pagination
 */
export function useWishlist(params?: { page?: number; limit?: number }) {
  return useQuery({
    queryKey: wishlistKeys.list(params),
    queryFn: () => wishlistApi.getAll(params),
    staleTime: STALE_TIME.LONG,
  });
}

/**
 * Get wishlist count (for badge display)
 */
export function useWishlistCount(options?: { enabled?: boolean }) {
  return useQuery({
    queryKey: wishlistKeys.count(),
    queryFn: wishlistApi.getCount,
    enabled: options?.enabled,
    staleTime: STALE_TIME.MEDIUM,
  });
}

/**
 * Check if single product is in wishlist
 */
export function useCheckInWishlist(
  productId: string,
  options?: { enabled?: boolean }
) {
  return useQuery({
    queryKey: wishlistKeys.check(productId),
    queryFn: () => wishlistApi.check(productId),
    enabled: options?.enabled ?? !!productId,
    staleTime: STALE_TIME.LONG,
  });
}

/**
 * Check multiple products in wishlist (batch check)
 */
export function useCheckMultipleInWishlist(
  productIds: string[],
  options?: { enabled?: boolean }
) {
  return useQuery({
    queryKey: wishlistKeys.checkMultiple(productIds),
    queryFn: () => wishlistApi.checkMultiple(productIds),
    enabled: options?.enabled ?? productIds.length > 0,
    staleTime: STALE_TIME.LONG,
  });
}

// ============ Mutation Hooks ============

/**
 * Add product to wishlist
 */
export function useAddToWishlist() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: wishlistApi.add,
    onSuccess: (_, productId) => {
      // Update wishlist check cache
      queryClient.setQueryData(wishlistKeys.check(productId), true);
      invalidateWishlistListAndCount(queryClient);
    },
    onError: (error) => {
      errorHandler.log(error, { context: "Add to wishlist failed" });
    },
  });
}

/**
 * Remove product from wishlist
 */
export function useRemoveFromWishlist() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: wishlistApi.remove,
    onSuccess: (productId) => {
      // Update wishlist check cache
      queryClient.setQueryData(wishlistKeys.check(productId), false);
      invalidateWishlistListAndCount(queryClient);
    },
    onError: (error) => {
      errorHandler.log(error, { context: "Remove from wishlist failed" });
    },
  });
}

/**
 * Clear entire wishlist
 */
export function useClearWishlist() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: wishlistApi.clear,
    onSuccess: () => {
      invalidateWishlistAll(queryClient);
    },
    onError: (error) => {
      errorHandler.log(error, { context: "Clear wishlist failed" });
    },
  });
}

/**
 * Toggle wishlist (add if not in, remove if in)
 * Convenience hook combining add and remove
 */
export function useToggleWishlist() {
  const addMutation = useAddToWishlist();
  const removeMutation = useRemoveFromWishlist();

  const toggle = async (productId: string, isInWishlist: boolean) => {
    if (isInWishlist) {
      return removeMutation.mutateAsync(productId);
    } else {
      return addMutation.mutateAsync(productId);
    }
  };

  return {
    toggle,
    isLoading: addMutation.isPending || removeMutation.isPending,
    error: addMutation.error || removeMutation.error,
  };
}

// ============ Composite Hooks ============

/**
 * Composite hook for Wishlist management with batch checking and toggle functionality
 * Provides all wishlist operations with toast notifications
 * @param isAuthenticated - Whether the user is authenticated (from Redux auth state)
 */
export function useWishlistManager(isAuthenticated: boolean) {
  const queryClient = useQueryClient();

  // React Query hooks
  const { data: count = 0, isLoading: isLoadingCount } = useWishlistCount({
    enabled: isAuthenticated,
  });
  const addMutation = useAddToWishlist();
  const removeMutation = useRemoveFromWishlist();

  // Track checked products for batch checking (state drives the query hook)
  const [checkedProductIds, setCheckedProductIds] = useState<string[]>([]);
  const pendingCheckedIds = useRef<string[]>([]);
  const checkTimeout = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Use React Query to check multiple products
  const { data: wishlistMap = {} } = useCheckMultipleInWishlist(
    checkedProductIds,
    { enabled: checkedProductIds.length > 0 }
  );

  // Batch check products - debounced
  const batchCheckProducts = useCallback(
    (productIds: string[]) => {
      if (!isAuthenticated) return;

      pendingCheckedIds.current = [
        ...new Set([...pendingCheckedIds.current, ...productIds]),
      ];

      if (checkTimeout.current) {
        clearTimeout(checkTimeout.current);
      }

      checkTimeout.current = setTimeout(() => {
        const next = pendingCheckedIds.current;
        pendingCheckedIds.current = [];

        if (next.length === 0) return;

        setCheckedProductIds((prev) => [...new Set([...prev, ...next])]);
      }, 100);
    },
    [isAuthenticated]
  );

  // Check if product is in wishlist
  const isInWishlist = useCallback(
    (productId: string): boolean => {
      const cached = queryClient.getQueryData<boolean>(
        wishlistKeys.check(productId)
      );
      if (cached !== undefined) return cached;
      return wishlistMap[productId] === true;
    },
    [wishlistMap, queryClient]
  );

  // Toggle wishlist with toast notifications
  const toggleWishlist = useCallback(
    async (productId: string, productName?: string) => {
      if (!isAuthenticated) {
        toast.error("Vui lòng đăng nhập để sử dụng tính năng này");
        return false;
      }

      const currentlyInWishlist = isInWishlist(productId);

      try {
        if (currentlyInWishlist) {
          await removeMutation.mutateAsync(productId);
          toast.success("Đã xóa khỏi yêu thích");
          return false;
        } else {
          await addMutation.mutateAsync(productId);
          toast.success(
            productName
              ? `Đã thêm "${productName}" vào yêu thích`
              : "Đã thêm vào yêu thích"
          );
          return true;
        }
      } catch (error: unknown) {
        toast.error(getSafeErrorMessage(error, "Có lỗi xảy ra"));
        return currentlyInWishlist;
      }
    },
    [isAuthenticated, isInWishlist, addMutation, removeMutation]
  );

  const isLoading =
    isLoadingCount || addMutation.isPending || removeMutation.isPending;

  return {
    isInWishlist,
    toggleWishlist,
    batchCheckProducts,
    count,
    isLoading,
    isAuthenticated,
  };
}
