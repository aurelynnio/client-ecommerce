/**
 * Shop Category React Query Hooks
 * Replaces shopCategoryAction.ts async thunks with React Query
 */
import { QueryClient, useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import instance from '@/api/api';
import { ENDPOINT_SHOP_CATEGORY } from '@/constants/endpoint';
import { extractApiData } from '@/api';
import { errorHandler } from '@/lib/error-handler';
import { STALE_TIME } from '@/constants/cache';
import { shopCategoryKeys } from '@/lib/queryKeys';
import {
  ShopCategory,
  CreateShopCategoryPayload,
  UpdateShopCategoryPayload,
} from '@/types/shopCategory';

function invalidateAllShopCategoryQueries(queryClient: QueryClient) {
  return queryClient.invalidateQueries({ queryKey: shopCategoryKeys.all });
}

const normalizeCategory = (category: unknown): ShopCategory => {
  const c =
    category && typeof category === 'object'
      ? (category as Record<string, unknown>)
      : ({} as Record<string, unknown>);

  const shopId = c.shopId;
  const shop = c.shop;
  const sortOrder = c.sortOrder;
  const displayOrder = c.displayOrder;

  return {
    _id: typeof c._id === 'string' ? c._id : '',
    shop: typeof shopId === 'string' ? shopId : typeof shop === 'string' ? shop : '',
    name: typeof c.name === 'string' ? c.name : '',
    slug: typeof c.slug === 'string' ? c.slug : '',
    description: typeof c.description === 'string' ? c.description : '',
    image: typeof c.image === 'string' ? c.image : '',
    productCount: typeof c.productCount === 'number' ? c.productCount : 0,
    isActive: typeof c.isActive === 'boolean' ? c.isActive : true,
    sortOrder:
      typeof sortOrder === 'number'
        ? sortOrder
        : typeof displayOrder === 'number'
          ? displayOrder
          : 0,
    createdAt: typeof c.createdAt === 'string' ? c.createdAt : '',
    updatedAt: typeof c.updatedAt === 'string' ? c.updatedAt : '',
  };
};

const normalizeCategoryList = (data: unknown): ShopCategory[] => {
  if (Array.isArray(data)) {
    return data.map(normalizeCategory);
  }
  if (data && typeof data === 'object') {
    const categories = (data as Record<string, unknown>).categories;
    if (Array.isArray(categories)) {
      return categories.map(normalizeCategory);
    }
  }
  return [];
};

const mapCategoryPayload = (payload: CreateShopCategoryPayload | UpdateShopCategoryPayload) => {
  const { sortOrder, ...rest } = payload;
  return {
    ...rest,
    ...(typeof sortOrder === 'number' ? { displayOrder: sortOrder } : {}),
  };
};

// ============ API Functions ============
const shopCategoryApi = {
  // Get seller's own categories
  getMy: async (): Promise<ShopCategory[]> => {
    const response = await instance.get(ENDPOINT_SHOP_CATEGORY.MY);
    const data = extractApiData(response);
    return normalizeCategoryList(data);
  },

  // Get public shop categories by shop ID
  getByShop: async (shopId: string): Promise<ShopCategory[]> => {
    const response = await instance.get(ENDPOINT_SHOP_CATEGORY.byShopId(shopId));
    const data = extractApiData(response);
    return normalizeCategoryList(data);
  },

  create: async (data: CreateShopCategoryPayload): Promise<ShopCategory> => {
    const response = await instance.post(ENDPOINT_SHOP_CATEGORY.ROOT, mapCategoryPayload(data));
    const result = extractApiData(response);
    return normalizeCategory(result);
  },

  update: async (categoryId: string, data: UpdateShopCategoryPayload): Promise<ShopCategory> => {
    const response = await instance.put(ENDPOINT_SHOP_CATEGORY.byCategoryId(categoryId), mapCategoryPayload(data));
    const result = extractApiData(response);
    return normalizeCategory(result);
  },

  delete: async (categoryId: string): Promise<string> => {
    await instance.delete(ENDPOINT_SHOP_CATEGORY.byCategoryId(categoryId));
    return categoryId;
  },
};

// ============ Query Hooks ============

/**
 * Get seller's own shop categories
 */
export function useMyShopCategories() {
  return useQuery({
    queryKey: shopCategoryKeys.myCategories(),
    queryFn: shopCategoryApi.getMy,
    staleTime: STALE_TIME.VERY_LONG,
  });
}

/**
 * Get shop categories by shop ID (public)
 */
export function useShopCategoriesByShop(shopId: string, options?: { enabled?: boolean }) {
  return useQuery({
    queryKey: shopCategoryKeys.byShop(shopId),
    queryFn: () => shopCategoryApi.getByShop(shopId),
    enabled: options?.enabled ?? !!shopId,
    staleTime: STALE_TIME.VERY_LONG,
  });
}

// ============ Mutation Hooks ============

/**
 * Create shop category mutation
 */
export function useCreateShopCategory() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: shopCategoryApi.create,
    onSuccess: () => {
      invalidateAllShopCategoryQueries(queryClient);
    },
    onError: (error) => {
      errorHandler.log(error, { context: 'Create shop category failed' });
    },
  });
}

/**
 * Update shop category mutation
 */
export function useUpdateShopCategory() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ categoryId, data }: { categoryId: string; data: UpdateShopCategoryPayload }) =>
      shopCategoryApi.update(categoryId, data),
    onSuccess: () => {
      invalidateAllShopCategoryQueries(queryClient);
    },
    onError: (error) => {
      errorHandler.log(error, { context: 'Update shop category failed' });
    },
  });
}

/**
 * Delete shop category mutation
 */
export function useDeleteShopCategory() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: shopCategoryApi.delete,
    onSuccess: () => {
      invalidateAllShopCategoryQueries(queryClient);
    },
    onError: (error) => {
      errorHandler.log(error, { context: 'Delete shop category failed' });
    },
  });
}
