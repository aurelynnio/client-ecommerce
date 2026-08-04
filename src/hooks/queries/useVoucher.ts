/**
 * Voucher React Query Hooks
 * Replaces voucherAction.ts async thunks with React Query
 */
import { QueryClient, useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import instance from '@/api/api';
import { ENDPOINT_VOUCHER } from '@/constants/endpoint';
import { extractApiData } from '@/api';
import { voucherKeys } from '@/lib/queryKeys';
import { errorHandler } from '@/lib/error-handler';
import { STALE_TIME } from '@/constants/cache';
import {
  Voucher,
  CreateVoucherData,
  UpdateVoucherData,
  VoucherFilters,
  VoucherScope,
  AvailableVouchersResponse,
  ApplyVoucherResult,
  VoucherStatistics,
} from '@/types/voucher';

// ============ Types ============
export interface VoucherListResponse {
  vouchers: Voucher[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

interface QueryOptions {
  enabled?: boolean;
}

function invalidateVoucherLists(queryClient: QueryClient) {
  return queryClient.invalidateQueries({ queryKey: voucherKeys.lists() });
}

function invalidateVoucherStatistics(queryClient: QueryClient) {
  return queryClient.invalidateQueries({ queryKey: voucherKeys.statistics() });
}

// ============ API Functions ============
const voucherApi = {
  getAdminList: async (params?: Partial<VoucherFilters>): Promise<VoucherListResponse> => {
    const response = await instance.get(ENDPOINT_VOUCHER.ROOT, { params });
    const data = extractApiData(response);
    // Handle different response formats
    if (Array.isArray(data)) {
      return {
        vouchers: data,
        pagination: {
          page: 1,
          limit: data.length,
          total: data.length,
          totalPages: 1,
        },
      };
    }
    return {
      vouchers: data?.data || data?.vouchers || [],
      pagination: data?.pagination || {
        page: 1,
        limit: 10,
        total: 0,
        totalPages: 0,
      },
    };
  },

  getPlatform: async (): Promise<Voucher[]> => {
    const response = await instance.get(ENDPOINT_VOUCHER.PLATFORM);
    return extractApiData(response);
  },

  getShopPublic: async (shopId: string): Promise<Voucher[]> => {
    const response = await instance.get(ENDPOINT_VOUCHER.byShopId(shopId));
    return extractApiData(response);
  },

  getById: async (id: string): Promise<Voucher> => {
    const response = await instance.get(ENDPOINT_VOUCHER.byId(id));
    return extractApiData(response);
  },

  getAvailable: async (params: {
    orderTotal: number;
    shopId?: string;
    scope?: VoucherScope;
  }): Promise<AvailableVouchersResponse> => {
    const response = await instance.get(ENDPOINT_VOUCHER.AVAILABLE, { params });
    return extractApiData(response);
  },

  getStatistics: async (): Promise<VoucherStatistics> => {
    const response = await instance.get(ENDPOINT_VOUCHER.STATISTICS);
    return extractApiData(response);
  },

  create: async (data: CreateVoucherData): Promise<Voucher> => {
    const response = await instance.post(ENDPOINT_VOUCHER.ROOT, data);
    return extractApiData(response);
  },

  update: async ({ id, ...data }: UpdateVoucherData & { id: string }): Promise<Voucher> => {
    const response = await instance.put(ENDPOINT_VOUCHER.byId(id), data);
    return extractApiData(response);
  },

  delete: async (id: string): Promise<string> => {
    // Admin table "Xóa" is expected to remove the voucher entirely.
    await instance.delete(ENDPOINT_VOUCHER.permanent(id));
    return id;
  },

  apply: async (params: {
    code: string;
    orderTotal: number;
    shopId?: string;
  }): Promise<ApplyVoucherResult> => {
    const response = await instance.post(ENDPOINT_VOUCHER.APPLY, {
      code: params.code,
      orderValue: params.orderTotal,
      shopId: params.shopId,
    });
    return extractApiData(response);
  },
};

// ============ Query Hooks ============

/**
 * Get all vouchers with pagination and filters (Admin)
 */
export function useAdminVouchers(params?: Partial<VoucherFilters>, options?: QueryOptions) {
  return useQuery({
    queryKey: voucherKeys.list(params),
    queryFn: () => voucherApi.getAdminList(params),
    enabled: options?.enabled,
    staleTime: STALE_TIME.LONG,
  });
}

/**
 * Get public platform vouchers
 */
export function usePlatformVouchers() {
  return useQuery({
    queryKey: voucherKeys.platform(),
    queryFn: voucherApi.getPlatform,
    staleTime: STALE_TIME.LONG,
  });
}

/**
 * Get public vouchers for a specific shop
 */
export function useShopVouchers(shopId: string, options?: { enabled?: boolean }) {
  return useQuery({
    queryKey: voucherKeys.shopPublic(shopId),
    queryFn: () => voucherApi.getShopPublic(shopId),
    enabled: options?.enabled ?? !!shopId,
    staleTime: STALE_TIME.LONG,
  });
}

/**
 * Get voucher by ID
 */
export function useVoucher(id: string, options?: { enabled?: boolean }) {
  return useQuery({
    queryKey: voucherKeys.detail(id),
    queryFn: () => voucherApi.getById(id),
    enabled: options?.enabled ?? !!id,
    staleTime: STALE_TIME.VERY_LONG,
  });
}

/**
 * Get available vouchers for checkout
 */
export function useAvailableVouchers(
  params: { orderTotal: number; shopId?: string; scope?: VoucherScope },
  options?: { enabled?: boolean },
) {
  return useQuery({
    queryKey: voucherKeys.available(params),
    queryFn: () => voucherApi.getAvailable(params),
    enabled: options?.enabled ?? params.orderTotal > 0,
    staleTime: STALE_TIME.MEDIUM,
  });
}

/**
 * Get voucher statistics (Admin)
 */
export function useVoucherStatistics(options?: QueryOptions) {
  return useQuery({
    queryKey: voucherKeys.statistics(),
    queryFn: voucherApi.getStatistics,
    enabled: options?.enabled,
    staleTime: STALE_TIME.VERY_LONG,
  });
}

// ============ Mutation Hooks ============

/**
 * Create voucher mutation (Admin)
 */
export function useCreateVoucher() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: voucherApi.create,
    onSuccess: () => {
      invalidateVoucherLists(queryClient);
      invalidateVoucherStatistics(queryClient);
    },
    onError: (error) => {
      errorHandler.log(error, { context: 'Create voucher failed' });
    },
  });
}

/**
 * Update voucher mutation (Admin)
 */
export function useUpdateVoucher() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: voucherApi.update,
    onSuccess: (data) => {
      invalidateVoucherLists(queryClient);
      queryClient.setQueryData(voucherKeys.detail(data._id), data);
    },
    onError: (error) => {
      errorHandler.log(error, { context: 'Update voucher failed' });
    },
  });
}

/**
 * Delete voucher mutation (Admin)
 */
export function useDeleteVoucher() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: voucherApi.delete,
    onSuccess: () => {
      invalidateVoucherLists(queryClient);
      invalidateVoucherStatistics(queryClient);
    },
    onError: (error) => {
      errorHandler.log(error, { context: 'Delete voucher failed' });
    },
  });
}

/**
 * Apply voucher code mutation
 */
export function useApplyVoucher() {
  return useMutation({
    mutationFn: voucherApi.apply,
    onError: (error) => {
      errorHandler.log(error, { context: 'Apply voucher failed' });
    },
  });
}
