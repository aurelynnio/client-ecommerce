/**
 * Banner React Query Hooks
 * Replaces bannerAction.ts async thunks with React Query
 */
import { QueryClient, useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import instance from '@/api/api';
import { extractApiData } from '@/api';
import { errorHandler } from '@/services/errorHandler';
import { STALE_TIME } from '@/constants/cache';
import { bannerKeys } from '@/lib/queryKeys';
import { BannerItem, CreateBannerPayload, UpdateBannerPayload } from '@/types/banner';

// ============ Types ============
export interface BannerListParams {
  page?: number;
  limit?: number;
  isActive?: boolean;
  search?: string;
}

export interface BannerListResponse {
  data: BannerItem[];
  pagination: {
    currentPage: number;
    pageSize: number;
    totalItems: number;
    totalPages: number;
    hasNextPage: boolean;
    hasPrevPage: boolean;
    nextPage: number | null;
    prevPage: number | null;
  };
}

// Legacy response format (for backward compatibility)
interface LegacyBannerResponse {
  banners?: BannerItem[];
  data?: BannerItem[];
  total?: number;
  page?: number;
  limit?: number;
  totalPages?: number;
  pagination?: BannerListResponse['pagination'];
}

function invalidateBannerQueries(queryClient: QueryClient) {
  return queryClient.invalidateQueries({ queryKey: bannerKeys.all });
}

// ============ API Functions ============
const bannerApi = {
  getActive: async (params?: BannerListParams): Promise<BannerItem[]> => {
    const response = await instance.get('/banners', {
      params: { ...params, isActive: true },
    });
    const rawData = extractApiData<LegacyBannerResponse | BannerItem[]>(response);

    // Handle multiple response formats:
    // 1. Direct array: BannerItem[]
    // 2. New format: { data: [...], pagination: {...} }
    // 3. Legacy format: { banners: [...], total, page, ... }
    if (Array.isArray(rawData)) {
      return rawData;
    }
    return rawData.data || rawData.banners || [];
  },

  getAll: async (params?: BannerListParams): Promise<BannerListResponse> => {
    const response = await instance.get('/banners/admin/all', { params });
    const rawData = extractApiData<LegacyBannerResponse>(response);

    // Normalize to standard format
    const banners = rawData.data || rawData.banners || [];
    const pagination = rawData.pagination || {
      currentPage: rawData.page || 1,
      pageSize: rawData.limit || 10,
      totalItems: rawData.total || banners.length,
      totalPages: rawData.totalPages || 1,
      hasNextPage: false,
      hasPrevPage: false,
      nextPage: null,
      prevPage: null,
    };

    return { data: banners, pagination };
  },

  create: async (data: CreateBannerPayload): Promise<BannerItem> => {
    const formData = new FormData();
    formData.append('title', data.title);
    formData.append('subtitle', data.subtitle);
    formData.append('theme', data.theme);
    formData.append('order', data.order.toString());
    formData.append('isActive', data.isActive.toString());
    if (data.link) formData.append('link', data.link);
    if (data.imageFile) {
      formData.append('image', data.imageFile);
    }

    const response = await instance.post('/banners', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return extractApiData(response);
  },

  update: async (id: string, data: UpdateBannerPayload): Promise<BannerItem> => {
    const formData = new FormData();
    Object.entries(data).forEach(([key, value]) => {
      if (key === 'imageFile') {
        if (value) formData.append('image', value as File);
      } else if (value !== undefined) {
        formData.append(key, String(value));
      }
    });

    const response = await instance.put(`/banners/${id}`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return extractApiData(response);
  },

  delete: async (id: string): Promise<void> => {
    await instance.delete(`/banners/${id}`);
  },
};

// ============ Query Hooks ============

/**
 * Get active banners for display
 */
export function useActiveBanners(params?: Omit<BannerListParams, 'isActive'>) {
  return useQuery({
    queryKey: bannerKeys.active(),
    queryFn: () => bannerApi.getActive(params),
    staleTime: STALE_TIME.LONG,
  });
}

/**
 * Get all banners (Admin)
 */
export function useBanners(params?: BannerListParams) {
  return useQuery({
    queryKey: bannerKeys.list(),
    queryFn: () => bannerApi.getAll(params),
    staleTime: STALE_TIME.MEDIUM,
  });
}

// ============ Mutation Hooks ============

/**
 * Create banner mutation
 */
export function useCreateBanner() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: bannerApi.create,
    onSuccess: () => {
      invalidateBannerQueries(queryClient);
    },
    onError: (error) => {
      errorHandler.log(error, { context: 'Create banner failed' });
    },
  });
}

/**
 * Update banner mutation
 */
export function useUpdateBanner() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateBannerPayload }) =>
      bannerApi.update(id, data),
    onSuccess: () => {
      invalidateBannerQueries(queryClient);
    },
    onError: (error) => {
      errorHandler.log(error, { context: 'Update banner failed' });
    },
  });
}

/**
 * Delete banner mutation
 */
export function useDeleteBanner() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: bannerApi.delete,
    onSuccess: () => {
      invalidateBannerQueries(queryClient);
    },
    onError: (error) => {
      errorHandler.log(error, { context: 'Delete banner failed' });
    },
  });
}
