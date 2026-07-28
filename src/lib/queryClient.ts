import { QueryClient } from '@tanstack/react-query';
import { STALE_TIME, GC_TIME } from '@/constants/cache';

/**
 * React Query client configuration
 * Centralized query client with optimized defaults for the ecommerce app
 */
export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      // Data considered fresh for 5 minutes
      staleTime: STALE_TIME.VERY_LONG,
      // Cache kept for 30 minutes after becoming unused
      gcTime: GC_TIME.DEFAULT,
      // Retry failed requests once
      retry: 1,
      // Don't refetch on window focus by default (can override per query)
      refetchOnWindowFocus: false,
      // Keep previous data while fetching new data
      placeholderData: (prev: unknown) => prev,
    },
    mutations: {
      // Don't retry mutations by default
      retry: 0,
    },
  },
});

/**
 * Invalidate queries helper
 * Use this to invalidate related queries after mutations
 */
export function invalidateQueries(queryKey: readonly unknown[]) {
  return queryClient.invalidateQueries({ queryKey });
}

/**
 * Prefetch query helper
 * Use for SSR or preloading data
 */
export async function prefetchQuery<T>(queryKey: readonly unknown[], queryFn: () => Promise<T>) {
  await queryClient.prefetchQuery({ queryKey, queryFn });
}
