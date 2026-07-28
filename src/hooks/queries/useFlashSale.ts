/**
 * Flash Sale React Query Hooks
 * Replaces flashSaleAction.ts async thunks with React Query
 */
import { QueryClient, useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useState, useEffect, useCallback, useMemo } from 'react';
import instance from '@/api/api';
import { extractApiData, getSafeErrorMessage } from '@/api';
import { errorHandler } from '@/services/errorHandler';
import { STALE_TIME, REFETCH_INTERVAL } from '@/constants/cache';
import { flashSaleKeys } from '@/lib/queryKeys';
import {
  FlashSaleResponse,
  FlashSaleSlot,
  FlashSaleSlotResponse,
  AddToFlashSalePayload,
} from '@/types/flash-sale';

export interface AdminFlashSaleProduct {
  _id: string;
  name: string;
  slug: string;
  variants?: { images?: string[] }[];
  price: { currentPrice: number };
  flashSale: {
    isActive: boolean;
    salePrice: number;
    discountPercent: number;
    stock: number;
    soldCount: number;
    startTime: string;
    endTime: string;
  };
}

export interface AdminFlashSaleSlot {
  startTime: string;
  endTime: string;
  status: string;
  label: string;
}

function invalidateFlashSaleQueries(queryClient: QueryClient) {
  return queryClient.invalidateQueries({ queryKey: flashSaleKeys.all });
}

// ============ API Functions ============
const flashSaleApi = {
  getActive: async (params?: { page?: number; limit?: number }): Promise<FlashSaleResponse> => {
    const response = await instance.get('/flash-sale', { params });
    return extractApiData(response);
  },

  getSchedule: async (): Promise<FlashSaleSlot[]> => {
    const response = await instance.get('/flash-sale/schedule');
    return extractApiData(response);
  },

  getAdminProducts: async (): Promise<AdminFlashSaleProduct[]> => {
    const response = await instance.get('/flash-sale');
    const data = extractApiData<
      | {
          data?: AdminFlashSaleProduct[];
        }
      | AdminFlashSaleProduct[]
    >(response);
    return Array.isArray(data) ? data : (data?.data ?? []);
  },

  getAdminSchedule: async (): Promise<AdminFlashSaleSlot[]> => {
    const response = await instance.get('/flash-sale/schedule');
    return extractApiData(response);
  },

  getBySlot: async (timeSlot: string): Promise<FlashSaleSlotResponse> => {
    const response = await instance.get(`/flash-sale/slot/${timeSlot}`);
    return extractApiData(response);
  },

  getStats: async (): Promise<{
    totalProducts: number;
    totalSold: number;
    revenue: number;
  }> => {
    const response = await instance.get('/flash-sale/stats');
    return extractApiData(response);
  },

  // Mutations (Seller/Admin)
  addProduct: async (params: { productId: string; data: AddToFlashSalePayload }): Promise<void> => {
    const { productId, data } = params;
    await instance.post(`/flash-sale/${productId}`, data);
  },

  removeProduct: async (productId: string): Promise<void> => {
    await instance.delete(`/flash-sale/${productId}`);
  },
};

// ============ Query Hooks ============

/**
 * Get active flash sale products
 */
export function useActiveFlashSale(params?: { page?: number; limit?: number }) {
  return useQuery({
    queryKey: flashSaleKeys.active(params),
    queryFn: () => flashSaleApi.getActive(params),
    staleTime: STALE_TIME.SHORT,
    refetchInterval: REFETCH_INTERVAL.NORMAL,
  });
}

/**
 * Get flash sale schedule (time slots)
 */
export function useFlashSaleSchedule() {
  return useQuery({
    queryKey: flashSaleKeys.schedule(),
    queryFn: flashSaleApi.getSchedule,
    staleTime: STALE_TIME.VERY_LONG,
  });
}

/**
 * Get admin flash sale products
 */
export function useAdminFlashSaleProducts() {
  return useQuery({
    queryKey: flashSaleKeys.adminProducts(),
    queryFn: flashSaleApi.getAdminProducts,
    staleTime: STALE_TIME.SHORT,
  });
}

/**
 * Get admin flash sale schedule
 */
export function useAdminFlashSaleSchedule() {
  return useQuery({
    queryKey: flashSaleKeys.adminSchedule(),
    queryFn: flashSaleApi.getAdminSchedule,
    staleTime: STALE_TIME.VERY_LONG,
  });
}

/**
 * Get flash sale products by time slot
 */
export function useFlashSaleBySlot(timeSlot: string, options?: { enabled?: boolean }) {
  return useQuery({
    queryKey: flashSaleKeys.slot(timeSlot),
    queryFn: () => flashSaleApi.getBySlot(timeSlot),
    enabled: options?.enabled ?? !!timeSlot,
    staleTime: STALE_TIME.SHORT,
  });
}

/**
 * Get flash sale statistics (Admin)
 */
export function useFlashSaleStats() {
  return useQuery({
    queryKey: flashSaleKeys.stats(),
    queryFn: flashSaleApi.getStats,
    staleTime: STALE_TIME.LONG,
  });
}

// ============ Mutation Hooks ============

/**
 * Add product to flash sale (Seller/Admin)
 */
export function useAddToFlashSale() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: flashSaleApi.addProduct,
    onSuccess: () => {
      invalidateFlashSaleQueries(queryClient);
    },
    onError: (error) => {
      errorHandler.log(error, { context: 'Add to flash sale failed' });
    },
  });
}

/**
 * Remove product from flash sale (Seller/Admin)
 */
export function useRemoveFromFlashSale() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: flashSaleApi.removeProduct,
    onSuccess: () => {
      invalidateFlashSaleQueries(queryClient);
    },
    onError: (error) => {
      errorHandler.log(error, { context: 'Remove from flash sale failed' });
    },
  });
}

// ============ Composite Hooks ============

/**
 * Composite hook for Flash Sale with countdown functionality
 * Combines React Query data fetching with local countdown state
 */
export function useFlashSaleWithCountdown() {
  // React Query hooks
  const {
    data: flashSaleData,
    isLoading: isLoadingProducts,
    error: productsError,
    refetch: refetchFlashSale,
  } = useActiveFlashSale(undefined);

  const {
    data: schedule,
    isLoading: isLoadingSchedule,
    error: scheduleError,
    refetch: refetchSchedule,
  } = useFlashSaleSchedule();

  const [nowMs, setNowMs] = useState(0);

  // Extract data from React Query response (matching FlashSaleResponse type)
  const products = flashSaleData?.data || [];
  const pagination = flashSaleData?.pagination;
  const saleInfo = flashSaleData?.saleInfo;
  const nextSaleTime = saleInfo?.nextSaleTime || null;

  // Get endTime from first product's flashSaleInfo if available
  const endTime = products[0]?.flashSaleInfo?.endTime;

  const endTimeMs = useMemo(() => {
    if (!endTime) return null;
    const ms = new Date(endTime).getTime();
    return Number.isFinite(ms) ? ms : null;
  }, [endTime]);

  // Keep "now" in state. This avoids calling Date.now() during render (purity rule).
  useEffect(() => {
    if (!endTimeMs || products.length === 0) return;

    const initId = setTimeout(() => {
      setNowMs(Date.now());
    }, 0);
    const intervalId = setInterval(() => {
      setNowMs(Date.now());
    }, 1000);

    return () => {
      clearTimeout(initId);
      clearInterval(intervalId);
    };
  }, [endTimeMs, products.length]);

  const countdown = useMemo(() => {
    if (!endTimeMs || !nowMs) return 0;
    return Math.max(0, Math.floor((endTimeMs - nowMs) / 1000));
  }, [endTimeMs, nowMs]);

  useEffect(() => {
    if (!endTimeMs || !nowMs) return;
    if (countdown === 0) {
      refetchFlashSale();
    }
  }, [countdown, endTimeMs, nowMs, refetchFlashSale]);

  // Format time helper
  const formatTime = useCallback((seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;

    return {
      hours: hours.toString().padStart(2, '0'),
      minutes: minutes.toString().padStart(2, '0'),
      seconds: secs.toString().padStart(2, '0'),
    };
  }, []);

  // Combined loading and error states
  const isLoading = isLoadingProducts || isLoadingSchedule;
  const error =
    productsError || scheduleError
      ? getSafeErrorMessage(productsError || scheduleError, 'Không thể tải dữ liệu flash sale')
      : null;

  return {
    products,
    schedule: schedule || [],
    pagination,
    nextSaleTime,
    countdown,
    formattedCountdown: formatTime(countdown),
    isLoading,
    error,
    fetchFlashSale: refetchFlashSale,
    fetchSchedule: refetchSchedule,
    formatTime,
  };
}
