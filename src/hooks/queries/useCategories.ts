/**
 * Category React Query Hooks
 * Replaces categoryAction.ts async thunks with React Query
 */
import { QueryClient, useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import instance from '@/api/api';
import { extractApiData } from '@/api';
import { errorHandler } from '@/services/errorHandler';
import { STALE_TIME, GC_TIME } from '@/constants/cache';
import { categoryKeys } from '@/lib/queryKeys';
import { Category, CategoriesResponse } from '@/types/category';

// ============ Types ============
export interface CategoryListParams {
  page?: number;
  limit?: number;
  search?: string;
  parentCategory?: string | null;
}

export interface CreateCategoryData {
  name: string;
  slug: string;
  description?: string;
  images: string[];
  isActive?: boolean;
  parentCategory?: string;
}

export interface UpdateCategoryData {
  id: string;
  name: string;
  slug: string;
  description?: string;
  isActive: boolean;
  isFeatured?: boolean;
}

// Tree category type (with children)
export interface CategoryTree extends Category {
  children?: CategoryTree[];
}

function invalidateAllCategoryQueries(queryClient: QueryClient) {
  return queryClient.invalidateQueries({ queryKey: categoryKeys.all });
}

function invalidateCategoryListAndTree(queryClient: QueryClient) {
  queryClient.invalidateQueries({ queryKey: categoryKeys.lists() });
  queryClient.invalidateQueries({ queryKey: categoryKeys.tree() });
}

// ============ API Functions ============
const categoryApi = {
  getTree: async (): Promise<CategoryTree[]> => {
    const response = await instance.get('/categories/tree');
    return extractApiData(response);
  },

  getAll: async (params: CategoryListParams = {}): Promise<CategoriesResponse> => {
    const { page = 1, limit = 10, search = '', parentCategory } = params;
    const response = await instance.get('/categories', {
      params: { page, limit, search, ...(parentCategory !== undefined && { parentCategory }) },
    });
    return extractApiData(response);
  },

  getActive: async (params: CategoryListParams = {}): Promise<CategoriesResponse> => {
    const { page = 1, limit = 100, search = '', parentCategory } = params;
    const response = await instance.get('/categories/active', {
      params: { page, limit, search, ...(parentCategory !== undefined && { parentCategory }) },
    });
    return extractApiData(response);
  },

  getById: async (categoryId: string): Promise<Category> => {
    const response = await instance.get(`/categories/${categoryId}`);
    return extractApiData(response);
  },

  getStatistics: async (): Promise<{
    categories: Category[];
    totalProducts: number;
  }> => {
    const response = await instance.get('/categories/statistics');
    return extractApiData(response);
  },

  // Mutations
  create: async (data: CreateCategoryData): Promise<Category> => {
    const response = await instance.post('/categories', data);
    return extractApiData(response);
  },

  update: async (data: UpdateCategoryData): Promise<Category> => {
    const { id, ...updateData } = data;
    const response = await instance.put(`/categories/${id}`, updateData);
    return extractApiData(response);
  },

  delete: async (categoryId: string): Promise<void> => {
    await instance.delete(`/categories/${categoryId}`);
  },
};

// ============ Query Hooks ============

/**
 * Get category tree (hierarchical structure)
 * Used for navigation menus, category selectors
 */
export function useCategoryTree() {
  return useQuery({
    queryKey: categoryKeys.tree(),
    queryFn: categoryApi.getTree,
    staleTime: STALE_TIME.VERY_STATIC,
    gcTime: GC_TIME.LONG,
  });
}

/**
 * Get all categories with pagination and filters
 */
export function useCategories(params: CategoryListParams = {}) {
  return useQuery({
    queryKey: categoryKeys.list(params),
    queryFn: () => categoryApi.getAll(params),
    staleTime: STALE_TIME.STATIC,
  });
}

/**
 * Get public active categories with pagination and filters
 */
export function useActiveCategories(params: CategoryListParams = {}) {
  return useQuery({
    queryKey: categoryKeys.list({ ...params, isActive: true }),
    queryFn: () => categoryApi.getActive(params),
    staleTime: STALE_TIME.STATIC,
  });
}

/**
 * Get category by ID
 */
export function useCategory(categoryId: string, options?: { enabled?: boolean }) {
  return useQuery({
    queryKey: categoryKeys.detail(categoryId),
    queryFn: () => categoryApi.getById(categoryId),
    enabled: options?.enabled ?? !!categoryId,
  });
}

/**
 * Get category statistics
 */
export function useCategoryStatistics() {
  return useQuery({
    queryKey: categoryKeys.statistics(),
    queryFn: categoryApi.getStatistics,
    staleTime: STALE_TIME.VERY_LONG,
  });
}

// ============ Mutation Hooks ============

/**
 * Create category mutation
 */
export function useCreateCategory() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: categoryApi.create,
    onSuccess: () => {
      invalidateAllCategoryQueries(queryClient);
    },
    onError: (error) => {
      errorHandler.log(error, { context: 'Create category failed' });
    },
  });
}

/**
 * Update category mutation
 */
export function useUpdateCategory() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: categoryApi.update,
    onSuccess: (data, variables) => {
      queryClient.setQueryData(categoryKeys.detail(variables.id), data);
      invalidateCategoryListAndTree(queryClient);
    },
    onError: (error) => {
      errorHandler.log(error, { context: 'Update category failed' });
    },
  });
}

/**
 * Delete category mutation
 */
export function useDeleteCategory() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: categoryApi.delete,
    onSuccess: () => {
      invalidateAllCategoryQueries(queryClient);
    },
    onError: (error) => {
      errorHandler.log(error, { context: 'Delete category failed' });
    },
  });
}
