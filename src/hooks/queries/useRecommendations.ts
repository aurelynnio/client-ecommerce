/**
 * Recommendation React Query Hooks
 * Replaces recommendationAction.ts async thunks with React Query
 */
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useCallback, useRef } from 'react';
import instance from '@/api/api';
import { ENDPOINT_RECOMMENDATION } from '@/constants/endpoint';
import { extractApiData, getSafeErrorMessage } from '@/api';
import { errorHandler } from '@/lib/error-handler';
import { STALE_TIME } from '@/constants/cache';
import { recommendationKeys } from '@/lib/queryKeys';
import { Product } from '@/types/product';
import { HomepageRecommendations } from '@/types/recommendation';

// ============ API Functions ============
const recommendationApi = {
  getForYou: async (limit?: number): Promise<Product[]> => {
    const response = await instance.get(ENDPOINT_RECOMMENDATION.FOR_YOU, {
      params: { limit },
    });
    return extractApiData(response);
  },

  getRecentlyViewed: async (limit?: number): Promise<Product[]> => {
    const response = await instance.get(ENDPOINT_RECOMMENDATION.RECENTLY_VIEWED, {
      params: { limit },
    });
    return extractApiData(response);
  },

  getSimilar: async (productId: string, limit?: number): Promise<Product[]> => {
    const response = await instance.get(ENDPOINT_RECOMMENDATION.similar(productId), {
      params: { limit },
    });
    return extractApiData(response);
  },

  getFrequentlyBoughtTogether: async (productId: string, limit?: number): Promise<Product[]> => {
    const response = await instance.get(ENDPOINT_RECOMMENDATION.frequentlyBoughtTogether(productId), {
      params: { limit },
    });
    return extractApiData(response);
  },

  getCategoryRecommendations: async (categoryId: string, limit?: number): Promise<Product[]> => {
    const response = await instance.get(ENDPOINT_RECOMMENDATION.byCategory(categoryId), {
      params: { limit },
    });
    return extractApiData(response);
  },

  getHomepage: async (): Promise<HomepageRecommendations> => {
    const response = await instance.get(ENDPOINT_RECOMMENDATION.HOMEPAGE);
    return extractApiData(response);
  },

  // Track product view (mutation)
  trackView: async (productId: string): Promise<void> => {
    await instance.post(ENDPOINT_RECOMMENDATION.trackView(productId));
  },
};

// ============ Query Hooks ============

/**
 * Get personalized "For You" recommendations
 */
export function useForYouRecommendations(limit?: number) {
  return useQuery({
    queryKey: recommendationKeys.forYou(limit),
    queryFn: () => recommendationApi.getForYou(limit),
    staleTime: STALE_TIME.VERY_LONG,
  });
}

/**
 * Get recently viewed products
 */
export function useRecentlyViewed(limit?: number) {
  return useQuery({
    queryKey: recommendationKeys.recentlyViewed(limit),
    queryFn: () => recommendationApi.getRecentlyViewed(limit),
    staleTime: STALE_TIME.MEDIUM,
  });
}

/**
 * Get similar products
 */
export function useSimilarProducts(
  productId: string,
  limit?: number,
  options?: { enabled?: boolean },
) {
  return useQuery({
    queryKey: recommendationKeys.similar(productId, limit),
    queryFn: () => recommendationApi.getSimilar(productId, limit),
    enabled: options?.enabled ?? !!productId,
    staleTime: STALE_TIME.STATIC,
  });
}

/**
 * Get frequently bought together products
 */
export function useFrequentlyBoughtTogether(
  productId: string,
  limit?: number,
  options?: { enabled?: boolean },
) {
  return useQuery({
    queryKey: recommendationKeys.frequentlyBoughtTogether(productId, limit),
    queryFn: () => recommendationApi.getFrequentlyBoughtTogether(productId, limit),
    enabled: options?.enabled ?? !!productId,
    staleTime: STALE_TIME.STATIC,
  });
}

/**
 * Get category recommendations
 */
export function useCategoryRecommendations(
  categoryId: string,
  limit?: number,
  options?: { enabled?: boolean },
) {
  return useQuery({
    queryKey: recommendationKeys.category(categoryId, limit),
    queryFn: () => recommendationApi.getCategoryRecommendations(categoryId, limit),
    enabled: options?.enabled ?? !!categoryId,
    staleTime: STALE_TIME.STATIC,
  });
}

/**
 * Get homepage recommendations (all sections)
 */
export function useHomepageRecommendations() {
  return useQuery({
    queryKey: recommendationKeys.homepage(),
    queryFn: recommendationApi.getHomepage,
    staleTime: STALE_TIME.VERY_LONG,
  });
}

// ============ Mutation Hooks ============

/**
 * Track product view mutation
 * Call this when user views a product to improve recommendations
 */
export function useTrackProductView() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: recommendationApi.trackView,
    onSuccess: () => {
      // Invalidate recently viewed to reflect new view
      queryClient.invalidateQueries({
        queryKey: recommendationKeys.recentlyViewed(),
      });
    },
    onError: (error) => {
      // Silent fail - don't interrupt user experience for tracking
      errorHandler.log(error, { context: 'Track view failed' });
    },
  });
}

// ============ Composite Hooks ============

/**
 * Composite hook for all recommendation operations
 * Combines multiple query hooks for comprehensive recommendation functionality
 */
export function useRecommendation(options?: { productId?: string; limit?: number }) {
  const queryClient = useQueryClient();
  const { productId, limit } = options || {};

  // Track view debouncing
  const trackingQueue = useRef<Set<string>>(new Set());
  const trackTimeout = useRef<ReturnType<typeof setTimeout> | null>(null);

  // React Query hooks
  const forYouQuery = useForYouRecommendations(limit);
  const recentlyViewedQuery = useRecentlyViewed(limit);
  const similarQuery = useSimilarProducts(productId || '', limit, {
    enabled: !!productId,
  });
  const fbtQuery = useFrequentlyBoughtTogether(productId || '', limit, {
    enabled: !!productId,
  });
  const homepageQuery = useHomepageRecommendations();

  // Track view mutation
  const { mutate: trackMutate } = useTrackProductView();

  // Extract data from queries
  const forYou = forYouQuery.data || [];
  const recentlyViewed = recentlyViewedQuery.data || [];
  const similar = similarQuery.data || [];
  const frequentlyBoughtTogether = fbtQuery.data || [];
  const homepage = homepageQuery.data || null;

  // Refetch functions
  const fetchForYou = useCallback(() => forYouQuery.refetch(), [forYouQuery]);

  const fetchRecentlyViewed = useCallback(
    () => recentlyViewedQuery.refetch(),
    [recentlyViewedQuery],
  );

  const fetchFBT = useCallback(
    (targetProductId: string, newLimit?: number) => {
      queryClient.invalidateQueries({
        queryKey: recommendationKeys.frequentlyBoughtTogether(targetProductId, newLimit),
      });
    },
    [queryClient],
  );

  const fetchSimilar = useCallback(
    (targetProductId: string, newLimit?: number) => {
      queryClient.invalidateQueries({
        queryKey: recommendationKeys.similar(targetProductId, newLimit),
      });
    },
    [queryClient],
  );

  const fetchHomepage = useCallback(() => {
    return homepageQuery.refetch();
  }, [homepageQuery]);

  // Track product view - debounced
  const trackView = useCallback(
    (viewProductId: string) => {
      if (trackingQueue.current.has(viewProductId)) return;

      trackingQueue.current.add(viewProductId);

      if (trackTimeout.current) {
        clearTimeout(trackTimeout.current);
      }

      trackTimeout.current = setTimeout(() => {
        trackingQueue.current.forEach((id) => {
          trackMutate(id);
        });
        trackingQueue.current.clear();
      }, 500);
    },
    [trackMutate],
  );

  // Reset cache
  const resetCache = useCallback(() => {
    queryClient.invalidateQueries({ queryKey: recommendationKeys.all });
  }, [queryClient]);

  // Combined loading state
  const isLoading =
    forYouQuery.isLoading ||
    recentlyViewedQuery.isLoading ||
    similarQuery.isLoading ||
    fbtQuery.isLoading ||
    homepageQuery.isLoading;

  // Combined error state
  const error =
    forYouQuery.error ||
    recentlyViewedQuery.error ||
    similarQuery.error ||
    fbtQuery.error ||
    homepageQuery.error;

  return {
    forYou,
    recentlyViewed,
    frequentlyBoughtTogether,
    similar,
    homepage,
    isLoading,
    error: error ? getSafeErrorMessage(error, 'Không thể tải gợi ý') : null,
    fetchForYou,
    fetchRecentlyViewed,
    fetchFBT,
    fetchSimilar,
    fetchHomepage,
    trackView,
    resetCache,
  };
}
