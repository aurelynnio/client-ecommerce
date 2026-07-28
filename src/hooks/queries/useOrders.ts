/**
 * Order React Query Hooks
 * Replaces orderAction.ts async thunks with React Query
 */
import { QueryClient, useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import instance from '@/api/api';
import { extractApiData } from '@/api';
import { errorHandler } from '@/services/errorHandler';
import { STALE_TIME } from '@/constants/cache';
import { orderKeys, cartKeys } from '@/lib/queryKeys';
import { Order, OrderStatus, OrderStatistics, OrderStatusCount } from '@/types/order';
import { PaginationData } from '@/types/common';

export interface OrderListParams {
  page?: number;
  limit?: number;
  status?: OrderStatus;
  paymentStatus?: 'unpaid' | 'paid' | 'refunded';
  paymentMethod?: 'cod' | 'vnpay' | 'momo';
  userId?: string;
  shop?: string;
  search?: string;
  startDate?: string;
  endDate?: string;
}

export interface CreateOrderData {
  cartItemIds: string[];
  addressId: string;
  paymentMethod: 'cod' | 'vnpay' | 'momo';
  platformVoucher?: string;
  shopVouchers?: Array<{ shopId: string; code: string }>;
  voucherShopCode?: string;
  voucherPlatformCode?: string;
  discountCode?: string; // DEPRECATED
  note?: string;
}

export interface OrderListResponse {
  orders: Order[];
  pagination: PaginationData | null;
}

interface ServerOrderStatisticsResponse {
  summary?: {
    totalOrders?: number;
    pendingOrders?: number;
    completedOrders?: number;
    cancelledOrders?: number;
    totalRevenue?: number;
  };
  ordersByStatus?: Record<string, { count?: number; totalAmount?: number }>;
}

function normalizeOrderStatistics(
  data: ServerOrderStatisticsResponse | OrderStatistics,
): OrderStatistics {
  const summary = 'summary' in data ? data.summary : undefined;
  const ordersByStatusRaw = 'ordersByStatus' in data ? data.ordersByStatus : undefined;

  const ordersByStatus: OrderStatusCount[] = Array.isArray(ordersByStatusRaw)
    ? ordersByStatusRaw
    : ordersByStatusRaw && typeof ordersByStatusRaw === 'object'
      ? Object.entries(ordersByStatusRaw).map(([status, value]) => ({
          _id: status,
          count: value?.count || 0,
        }))
      : [];

  const countsByStatus = new Map(ordersByStatus.map((item) => [item._id, item.count]));

  return {
    totalOrders: summary?.totalOrders ?? ('totalOrders' in data ? data.totalOrders : 0) ?? 0,
    pendingOrders:
      summary?.pendingOrders ??
      ('pendingOrders' in data ? data.pendingOrders : 0) ??
      countsByStatus.get('pending') ??
      0,
    confirmedOrders:
      ('confirmedOrders' in data ? data.confirmedOrders : 0) ??
      countsByStatus.get('confirmed') ??
      0,
    processingOrders:
      ('processingOrders' in data ? data.processingOrders : 0) ??
      countsByStatus.get('processing') ??
      0,
    shippedOrders:
      ('shippedOrders' in data ? data.shippedOrders : 0) ?? countsByStatus.get('shipped') ?? 0,
    deliveredOrders:
      ('deliveredOrders' in data ? data.deliveredOrders : 0) ??
      summary?.completedOrders ??
      countsByStatus.get('delivered') ??
      0,
    cancelledOrders:
      summary?.cancelledOrders ??
      ('cancelledOrders' in data ? data.cancelledOrders : 0) ??
      countsByStatus.get('cancelled') ??
      0,
    totalRevenue: summary?.totalRevenue ?? ('totalRevenue' in data ? data.totalRevenue : 0) ?? 0,
    ordersByStatus,
  };
}

function invalidateOrderLists(queryClient: QueryClient) {
  return queryClient.invalidateQueries({ queryKey: orderKeys.lists() });
}

function invalidateOrdersAndCart(queryClient: QueryClient) {
  invalidateOrderLists(queryClient);
  queryClient.invalidateQueries({ queryKey: cartKeys.all });
}

const orderApi = {
  getUserOrders: async (params: OrderListParams = {}): Promise<OrderListResponse> => {
    const { page = 1, limit = 10, status, paymentStatus, paymentMethod } = params;
    const response = await instance.get('/orders', {
      params: {
        page,
        limit,
        ...(status && { status }),
        ...(paymentStatus && { paymentStatus }),
        ...(paymentMethod && { paymentMethod }),
      },
    });
    const data = extractApiData<{
      data?: Order[];
      orders?: Order[];
      pagination?: PaginationData;
    }>(response);
    return {
      orders: data?.data || data?.orders || [],
      pagination: data?.pagination || null,
    };
  },

  getById: async (orderId: string): Promise<Order> => {
    const response = await instance.get(`/orders/${orderId}`);
    return extractApiData(response);
  },

  // Admin: Get all orders
  getAllOrders: async (params: OrderListParams = {}): Promise<OrderListResponse> => {
    const { page = 1, limit = 10, status, paymentStatus, paymentMethod, userId, shop } = params;

    const response = await instance.get('/orders/all/list', {
      params: {
        page,
        limit,
        ...(status && { status }),
        ...(paymentStatus && { paymentStatus }),
        ...(paymentMethod && { paymentMethod }),
        ...(userId && { userId }),
        ...(shop && { shop }),
      },
    });
    const data = extractApiData<{
      data?: Order[];
      orders?: Order[];
      pagination?: PaginationData;
    }>(response);
    return {
      orders: data?.data || data?.orders || [],
      pagination: data?.pagination || null,
    };
  },

  // Shop orders
  getShopOrders: async (
    _shopId: string,
    params: OrderListParams = {},
  ): Promise<OrderListResponse> => {
    const { page = 1, limit = 10, status, paymentStatus } = params;
    const response = await instance.get('/orders/seller/list', {
      params: {
        page,
        limit,
        ...(status && { status }),
        ...(paymentStatus && { paymentStatus }),
      },
    });
    const data = extractApiData<{
      data?: Order[];
      orders?: Order[];
      pagination?: PaginationData;
    }>(response);
    return {
      orders: data?.data || data?.orders || [],
      pagination: data?.pagination || null,
    };
  },

  getStatistics: async (): Promise<OrderStatistics> => {
    const response = await instance.get('/orders/statistics/overview');
    const data = extractApiData<ServerOrderStatisticsResponse>(response);
    return normalizeOrderStatistics(data);
  },

  // Mutations
  create: async (data: CreateOrderData): Promise<Order> => {
    const { voucherPlatformCode, discountCode, platformVoucher, shopVouchers, ...orderData } = data;
    const response = await instance.post('/orders', {
      ...orderData,
      platformVoucher: platformVoucher ?? voucherPlatformCode ?? discountCode,
      shopVouchers: shopVouchers ?? [],
    });
    return extractApiData(response);
  },

  cancel: async (orderId: string): Promise<Order> => {
    const response = await instance.delete(`/orders/${orderId}/cancel`);
    return extractApiData(response);
  },

  updateStatus: async (params: { orderId: string; status: OrderStatus }): Promise<Order> => {
    const { orderId, status } = params;
    const response = await instance.put(`/orders/${orderId}/status`, {
      status,
    });
    return extractApiData(response);
  },

  confirmDelivery: async (orderId: string): Promise<Order> => {
    const response = await instance.post(`/orders/${orderId}/confirm-delivery`);
    return extractApiData(response);
  },
};

/**
 * Get current user's orders
 */
export function useUserOrders(params?: OrderListParams, options?: { enabled?: boolean }) {
  return useQuery({
    queryKey: orderKeys.list(params),
    queryFn: () => orderApi.getUserOrders(params),
    enabled: options?.enabled,
    staleTime: STALE_TIME.LONG,
  });
}

/**
 * Get order by ID
 */
export function useOrder(orderId: string, options?: { enabled?: boolean }) {
  return useQuery({
    queryKey: orderKeys.detail(orderId),
    queryFn: () => orderApi.getById(orderId),
    enabled: options?.enabled ?? (!!orderId && /^[0-9a-fA-F]{24}$/.test(orderId)),
  });
}

/**
 * Get all orders (Admin)
 */
export function useAllOrders(params?: OrderListParams) {
  return useQuery({
    queryKey: orderKeys.admin(params),
    queryFn: () => orderApi.getAllOrders(params),
    staleTime: STALE_TIME.MEDIUM,
  });
}

/**
 * Get shop orders
 */
export function useShopOrders(shopId: string, params?: OrderListParams) {
  return useQuery({
    queryKey: orderKeys.shopOrders(shopId, params),
    queryFn: () => orderApi.getShopOrders(shopId, params),
    enabled: !!shopId,
    staleTime: STALE_TIME.MEDIUM,
  });
}

/**
 * Get order statistics
 */
export function useOrderStatistics() {
  return useQuery({
    queryKey: orderKeys.statistics(),
    queryFn: orderApi.getStatistics,
    staleTime: STALE_TIME.VERY_LONG,
  });
}

/**
 * Create order mutation
 */
export function useCreateOrder() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: orderApi.create,
    onSuccess: () => {
      invalidateOrdersAndCart(queryClient);
    },
    onError: (error) => {
      errorHandler.log(error, { context: 'Create order failed' });
    },
  });
}

/**
 * Cancel order mutation
 */
export function useCancelOrder() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: orderApi.cancel,
    onSuccess: (data, orderId) => {
      queryClient.setQueryData(orderKeys.detail(orderId), data);
      invalidateOrderLists(queryClient);
    },
    onError: (error) => {
      errorHandler.log(error, { context: 'Cancel order failed' });
    },
  });
}

/**
 * Update order status (Admin/Shop)
 */
export function useUpdateOrderStatus() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: orderApi.updateStatus,
    onSuccess: (data, variables) => {
      queryClient.setQueryData(orderKeys.detail(variables.orderId), data);
      invalidateOrderLists(queryClient);
    },
    onError: (error) => {
      errorHandler.log(error, { context: 'Update order status failed' });
    },
  });
}

/**
 * Confirm delivery mutation
 */
export function useConfirmDelivery() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: orderApi.confirmDelivery,
    onSuccess: (data, orderId) => {
      queryClient.setQueryData(orderKeys.detail(orderId), data);
      invalidateOrderLists(queryClient);
    },
    onError: (error) => {
      errorHandler.log(error, { context: 'Confirm delivery failed' });
    },
  });
}
