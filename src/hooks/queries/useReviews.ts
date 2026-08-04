/**
 * Review React Query Hooks
 * Replaces reviewAction.ts async thunks with React Query
 */
import { QueryClient, useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import instance from '@/api/api';
import { ENDPOINT_REVIEW } from '@/constants/endpoint';
import { extractApiData } from '@/api';
import { errorHandler } from '@/lib/error-handler';
import { STALE_TIME } from '@/constants/cache';
import { reviewKeys, productKeys } from '@/lib/queryKeys';
import { PaginationData } from '@/types/common';

// ============ Types ============
export interface Review {
  _id: string;
  user: {
    _id: string;
    username: string;
    avatar?: string;
  };
  product:
    | string
    | {
        _id: string;
        name: string;
        slug?: string;
        images?: string[];
      };
  rating: number;
  comment: string;
  reply?: string;
  replyAt?: string;
  images?: string[];
  createdAt: string;

  updatedAt: string;
}

export interface AdminReview {
  _id: string;
  user?: { _id: string; username: string; email?: string };
  product?: string | { _id: string; name: string; slug?: string; images?: string[] };
  rating: number;
  comment?: string;
  createdAt: string;
}

export interface AdminReviewListParams {
  page?: number;
  limit?: number;
  rating?: number;
  search?: string;
}

export interface AdminReviewListResponse {
  data: AdminReview[];
  pagination: PaginationData | null;
}

export interface ReviewListParams {
  page?: number;
  limit?: number;
  rating?: number;
}

export interface ReviewListResponse {
  reviews: Review[];
  pagination: PaginationData | null;
  averageRating?: number;
  totalReviews?: number;
  ratingDistribution?: Record<number, number>;
}

export interface CreateReviewData {
  productId: string;
  rating: number;
  comment: string;
  images?: string[];
}

export interface UpdateReviewData {
  reviewId: string;
  rating?: number;
  comment?: string;
  images?: string[];
}

function invalidateReviewProduct(queryClient: QueryClient, productId: string) {
  return queryClient.invalidateQueries({
    queryKey: reviewKeys.product(productId),
  });
}

function invalidateUserReviews(queryClient: QueryClient) {
  return queryClient.invalidateQueries({ queryKey: reviewKeys.user() });
}

function invalidateProductDetailRating(queryClient: QueryClient, productId: string) {
  return queryClient.invalidateQueries({
    queryKey: productKeys.detailById(productId),
  });
}

// ============ API Functions ============
const reviewApi = {
  getByProduct: async (
    productId: string,
    params: ReviewListParams = {},
  ): Promise<ReviewListResponse> => {
    const { page = 1, limit = 10 } = params;
    const response = await instance.get(ENDPOINT_REVIEW.byProductId(productId), {
      params: { page, limit },
    });
    const data = extractApiData<
      ReviewListResponse & {
        data?: Review[];
        metadata?: {
          ratingDistribution?: Record<number, number>;
          averageRating?: number;
          totalReviews?: number;
        };
      }
    >(response);
    // Handle both old format (flat) and new format (metadata object)
    const metadata = data?.metadata;
    return {
      reviews: data?.reviews || data?.data || [],
      pagination: data?.pagination || null,
      averageRating: metadata?.averageRating ?? data?.averageRating,
      totalReviews: metadata?.totalReviews ?? data?.totalReviews,
      ratingDistribution: metadata?.ratingDistribution ?? data?.ratingDistribution,
    };
  },

  getByShop: async (shopId: string, params: ReviewListParams = {}): Promise<ReviewListResponse> => {
    const { page = 1, limit = 10, rating } = params;
    const response = await instance.get(ENDPOINT_REVIEW.byShopId(shopId), {
      params: { page, limit, ...(rating && { rating }) },
    });
    const data = extractApiData<ReviewListResponse & { data?: Review[] }>(response);
    return {
      reviews: data?.reviews || data?.data || [],
      pagination: data?.pagination || null,
    };
  },

  getUserReviews: async (): Promise<Review[]> => {
    const response = await instance.get(ENDPOINT_REVIEW.USER_ME);
    return extractApiData(response);
  },

  // Admin APIs
  getAdminReviews: async (params: AdminReviewListParams = {}): Promise<AdminReviewListResponse> => {
    const { page = 1, limit = 10, rating, search } = params;
    const response = await instance.get(ENDPOINT_REVIEW.ROOT, {
      params: { page, limit, rating, search },
    });
    return extractApiData(response);
  },

  // Seller APIs
  getMyShopReviews: async (params: ReviewListParams = {}): Promise<ReviewListResponse> => {
    const { page = 1, limit = 10, rating } = params;
    const response = await instance.get(ENDPOINT_REVIEW.SELLER_ME, {
      params: { page, limit, rating },
    });
    return extractApiData(response);
  },

  replyReview: async (data: { reviewId: string; content: string }) => {
    const response = await instance.post(ENDPOINT_REVIEW.reply(data.reviewId), {
      content: data.content,
    });
    return extractApiData(response);
  },

  // Mutations

  create: async (data: CreateReviewData): Promise<Review> => {
    const response = await instance.post(ENDPOINT_REVIEW.ROOT, data);
    return extractApiData(response);
  },

  update: async (data: UpdateReviewData): Promise<Review> => {
    const { reviewId, ...updateData } = data;
    const response = await instance.put(ENDPOINT_REVIEW.byId(reviewId), updateData);
    return extractApiData(response);
  },

  delete: async (reviewId: string): Promise<void> => {
    await instance.delete(ENDPOINT_REVIEW.byId(reviewId));
  },
};

// ============ Query Hooks ============

/**
 * Get reviews for a product
 */
export function useProductReviews(productId: string, params?: ReviewListParams) {
  return useQuery({
    queryKey: reviewKeys.product(productId, params),
    queryFn: () => reviewApi.getByProduct(productId, params),
    enabled: !!productId,
    staleTime: STALE_TIME.VERY_LONG,
  });
}

/**
 * Get reviews for a shop
 */
export function useShopReviews(shopId: string, params?: ReviewListParams) {
  return useQuery({
    queryKey: reviewKeys.shop(shopId, params),
    queryFn: () => reviewApi.getByShop(shopId, params),
    enabled: !!shopId,
    staleTime: STALE_TIME.VERY_LONG,
  });
}

/**
 * Get current user's reviews
 */
export function useUserReviews() {
  return useQuery({
    queryKey: reviewKeys.user(),
    queryFn: reviewApi.getUserReviews,
    staleTime: STALE_TIME.VERY_LONG,
  });
}

/**
 * Get reviews for admin moderation
 */
export function useAdminReviews(params?: AdminReviewListParams) {
  return useQuery({
    queryKey: reviewKeys.admin(params),
    queryFn: () => reviewApi.getAdminReviews(params),
    staleTime: STALE_TIME.SHORT,
  });
}

/**
 * Get reviews for seller's own shop
 */
export function useMyShopReviews(params?: ReviewListParams) {
  return useQuery({
    queryKey: reviewKeys.seller(params),
    queryFn: () => reviewApi.getMyShopReviews(params),
    staleTime: STALE_TIME.SHORT,
  });
}

/**
 * Reply to review mutation
 */
export function useReplyReview() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: reviewApi.replyReview,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: reviewKeys.seller() });
    },
    onError: (error) => {
      errorHandler.log(error, { context: 'Reply review failed' });
    },
  });
}

// ============ Mutation Hooks ============

/**
 * Create review mutation
 */
export function useCreateReview() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: reviewApi.create,
    onSuccess: (_, variables) => {
      invalidateReviewProduct(queryClient, variables.productId);
      invalidateProductDetailRating(queryClient, variables.productId);
      invalidateUserReviews(queryClient);
    },
    onError: (error) => {
      errorHandler.log(error, { context: 'Create review failed' });
    },
  });
}

/**
 * Update review mutation
 */
export function useUpdateReview(productId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: reviewApi.update,
    onSuccess: () => {
      invalidateReviewProduct(queryClient, productId);
      invalidateUserReviews(queryClient);
    },
    onError: (error) => {
      errorHandler.log(error, { context: 'Update review failed' });
    },
  });
}

/**
 * Delete review mutation
 */
export function useDeleteReview(productId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: reviewApi.delete,
    onSuccess: () => {
      invalidateReviewProduct(queryClient, productId);
      invalidateProductDetailRating(queryClient, productId);
      invalidateUserReviews(queryClient);
    },
    onError: (error) => {
      errorHandler.log(error, { context: 'Delete review failed' });
    },
  });
}

/**
 * Delete review mutation for admin moderation
 */
export function useDeleteAdminReview() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: reviewApi.delete,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: reviewKeys.admin() });
    },
    onError: (error) => {
      errorHandler.log(error, { context: 'Delete admin review failed' });
    },
  });
}
