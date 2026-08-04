/**
 * Shop React Query Hooks
 */
import { QueryClient, useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import instance from '@/api/api';
import { ENDPOINT_SHOP, ENDPOINT_SHOP_CATEGORY } from '@/constants/endpoint';
import { extractApiData } from '@/api';
import { errorHandler } from '@/lib/error-handler';
import { STALE_TIME } from '@/constants/cache';
import { shopCategoryKeys, shopKeys } from '@/lib/queryKeys';
import { Shop, CreateShopPayload, UpdateShopPayload } from '@/types/shop';
import { PaginationData } from '@/types/common';

export interface ShopListParams {
  page?: number;
  limit?: number;
  search?: string;
  status?: 'active' | 'inactive' | 'banned';
}

const shopApi = {
  getMyShop: async (): Promise<Shop | null> => {
    try {
      const response = await instance.get(ENDPOINT_SHOP.MY);
      return extractApiData(response);
    } catch (error: unknown) {
      // If user doesn't have a shop, return null instead of throwing
      if ((error as { response?: { status?: number } })?.response?.status === 404) {
        return null;
      }
      throw error;
    }
  },

  getById: async (shopId: string): Promise<Shop> => {
    const response = await instance.get(ENDPOINT_SHOP.byId(shopId));
    return extractApiData(response);
  },

  getBySlug: async (slug: string): Promise<Shop> => {
    const response = await instance.get(ENDPOINT_SHOP.bySlug(slug));
    return extractApiData(response);
  },

  getCategories: async (
    shopId: string,
  ): Promise<{
    categories: {
      _id: string;
      name: string;
      slug?: string;
      isActive?: boolean;
      productCount: number;
    }[];
    totalProducts: number;
  }> => {
    const response = await instance.get(ENDPOINT_SHOP_CATEGORY.byShopId(shopId));
    const data = extractApiData<
      | {
          categories?: {
            _id: string;
            name: string;
            slug?: string;
            isActive?: boolean;
            productCount: number;
          }[];
          totalProducts?: number;
        }
      | { _id: string; name: string; slug?: string; isActive?: boolean; productCount?: number }[]
    >(response);

    // Handle both old format (array) and new format (object with categories)
    if (Array.isArray(data)) {
      return {
        categories: data.map((c) => ({ ...c, productCount: c.productCount || 0 })),
        totalProducts: 0,
      };
    }
    return {
      categories: data.categories || [],
      totalProducts: data.totalProducts || 0,
    };
  },

  // Admin: Get all shops
  getAll: async (
    params: ShopListParams = {},
  ): Promise<{ shops: Shop[]; pagination: PaginationData | null }> => {
    const { page = 1, limit = 10, search, status } = params;
    const response = await instance.get(ENDPOINT_SHOP.ADMIN_LIST, {
      params: { page, limit, search, status },
    });
    const data = extractApiData<{
      data?: Shop[];
      shops?: Shop[];
      pagination?: PaginationData;
    }>(response);
    return {
      shops: data?.data || data?.shops || [],
      pagination: data?.pagination || null,
    };
  },

  register: async (data: CreateShopPayload): Promise<Shop> => {
    const response = await instance.post(ENDPOINT_SHOP.REGISTER, data);
    return extractApiData(response);
  },

  update: async (data: UpdateShopPayload): Promise<Shop> => {
    const response = await instance.put(ENDPOINT_SHOP.MY, data);
    return extractApiData(response);
  },

  uploadLogo: async (formData: FormData): Promise<{ logo: string }> => {
    const response = await instance.post(ENDPOINT_SHOP.UPLOAD_LOGO, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return extractApiData(response);
  },

  uploadBanner: async (formData: FormData): Promise<{ banner: string }> => {
    const response = await instance.post(ENDPOINT_SHOP.UPLOAD_BANNER, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return extractApiData(response);
  },

  updateStatus: async (params: {
    shopId: string;
    status: 'active' | 'inactive' | 'banned';
  }): Promise<Shop> => {
    const { shopId, status } = params;
    const response = await instance.put(ENDPOINT_SHOP.updateAdminStatus(shopId), { status });
    return extractApiData(response);
  },

  follow: async (shopId: string): Promise<void> => {
    await instance.post(ENDPOINT_SHOP.follow(shopId));
  },

  unfollow: async (shopId: string): Promise<void> => {
    await instance.delete(ENDPOINT_SHOP.follow(shopId));
  },
};

/**
 * Get current user's shop (for sellers)
 */
export function useMyShop(options?: { enabled?: boolean }) {
  return useQuery({
    queryKey: shopKeys.myShop(),
    queryFn: shopApi.getMyShop,
    enabled: options?.enabled,
    staleTime: STALE_TIME.STATIC,
  });
}

export interface ShopStatistics {
  shop: {
    _id: string;
    name: string;
    slug: string;
    logo?: string;
    banner?: string;
    rating: number;
    status: string;
    followers: number;
    responseRate: number;
  };
  stats: {
    totalProducts: number;
    totalOrders: number;
    totalRevenue: number;
    ordersByStatus: {
      pending: number;
      confirmed: number;
      processing: number;
      shipped: number;
      delivered: number;
      cancelled: number;
      returned: number;
    };
  };
  topProducts: Array<{
    _id: string;
    name: string;
    slug: string;
    image: string | null;
    sold: number;
    revenue: number;
  }>;
  recentOrders: Array<{
    _id: string;
    customer: string;
    avatar: string | null;
    totalAmount: number;
    status: string;
    paymentStatus: string;
    createdAt: string;
  }>;
  chartData: Array<{
    month: string;
    revenue: number;
    orders: number;
  }>;
}

/**
 * Get shop statistics for seller dashboard
 */
export function useShopStatistics(options?: { enabled?: boolean }) {
  return useQuery({
    queryKey: shopKeys.statistics(),
    queryFn: async (): Promise<ShopStatistics> => {
      const response = await instance.get(ENDPOINT_SHOP.STATISTICS);
      return extractApiData(response);
    },
    enabled: options?.enabled,
    staleTime: STALE_TIME.LONG,
  });
}

/**
 * Get shop by ID
 */
export function useShop(shopId: string, options?: { enabled?: boolean }) {
  return useQuery({
    queryKey: shopKeys.detail(shopId),
    queryFn: () => shopApi.getById(shopId),
    enabled: options?.enabled ?? !!shopId,
    staleTime: STALE_TIME.VERY_LONG,
  });
}

/**
 * Get shop by slug
 */
export function useShopBySlug(slug: string, options?: { enabled?: boolean }) {
  return useQuery({
    queryKey: shopKeys.detailBySlug(slug),
    queryFn: () => shopApi.getBySlug(slug),
    enabled: options?.enabled ?? !!slug,
    staleTime: STALE_TIME.VERY_LONG,
  });
}

/**
 * Get shop categories
 */
export function useShopCategories(shopId: string, options?: { enabled?: boolean }) {
  return useQuery({
    queryKey: shopCategoryKeys.byShopWithTotals(shopId),
    queryFn: () => shopApi.getCategories(shopId),
    enabled: options?.enabled ?? !!shopId,
    staleTime: STALE_TIME.STATIC,
  });
}

function invalidateMyShop(queryClient: QueryClient) {
  return queryClient.invalidateQueries({ queryKey: shopKeys.myShop() });
}

function invalidateAllShops(queryClient: QueryClient) {
  return queryClient.invalidateQueries({ queryKey: shopKeys.all });
}

function invalidateShopDetail(queryClient: QueryClient, shopId: string) {
  return queryClient.invalidateQueries({ queryKey: shopKeys.detail(shopId) });
}

/**
 * Get all shops (Admin)
 */
export function useAllShops(params?: ShopListParams) {
  return useQuery({
    queryKey: shopKeys.list(params),
    queryFn: () => shopApi.getAll(params),
    staleTime: STALE_TIME.LONG,
  });
}

/**
 * Register new shop
 */
export function useRegisterShop() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: shopApi.register,
    onSuccess: (data) => {
      queryClient.setQueryData(shopKeys.myShop(), data);
    },
    onError: (error) => {
      errorHandler.log(error, { context: 'Register shop failed' });
    },
  });
}

/**
 * Update shop
 */
export function useUpdateShop() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: shopApi.update,
    onSuccess: (data) => {
      queryClient.setQueryData(shopKeys.myShop(), data);
      if (data._id) {
        queryClient.setQueryData(shopKeys.detail(data._id), data);
      }
    },
    onError: (error) => {
      errorHandler.log(error, { context: 'Update shop failed' });
    },
  });
}

/**
 * Upload shop logo
 */
export function useUploadShopLogo() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: shopApi.uploadLogo,
    onSuccess: () => {
      invalidateMyShop(queryClient);
    },
    onError: (error) => {
      errorHandler.log(error, { context: 'Upload logo failed' });
    },
  });
}

/**
 * Upload shop banner
 */
export function useUploadShopBanner() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: shopApi.uploadBanner,
    onSuccess: () => {
      invalidateMyShop(queryClient);
    },
    onError: (error) => {
      errorHandler.log(error, { context: 'Upload banner failed' });
    },
  });
}

/**
 * Update shop status (Admin)
 */
export function useUpdateShopStatus() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: shopApi.updateStatus,
    onSuccess: (data, variables) => {
      queryClient.setQueryData(shopKeys.detail(variables.shopId), data);
      invalidateAllShops(queryClient);
    },
    onError: (error) => {
      errorHandler.log(error, { context: 'Update shop status failed' });
    },
  });
}

/**
 * Follow shop
 */
export function useFollowShop() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: shopApi.follow,
    onSuccess: (_, shopId) => {
      invalidateShopDetail(queryClient, shopId);
    },
    onError: (error) => {
      errorHandler.log(error, { context: 'Follow shop failed' });
    },
  });
}

/**
 * Unfollow shop
 */
export function useUnfollowShop() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: shopApi.unfollow,
    onSuccess: (_, shopId) => {
      invalidateShopDetail(queryClient, shopId);
    },
    onError: (error) => {
      errorHandler.log(error, { context: 'Unfollow shop failed' });
    },
  });
}
