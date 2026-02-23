/**
 * Order React Query Hooks
 * Replaces orderAction.ts async thunks with React Query
 */
import {
  QueryClient,
  useQuery,
  useMutation,
  useQueryClient,
} from "@tanstack/react-query";
import instance from "@/api/api";
import { extractApiData } from "@/api";
import { errorHandler } from "@/services/errorHandler";
import { STALE_TIME } from "@/constants/cache";
import { orderKeys, cartKeys } from "@/lib/queryKeys";
import { Order, OrderStatus, OrderStatistics } from "@/types/order";
import { PaginationData } from "@/types/common";

export interface OrderListParams {
  page?: number;
  limit?: number;
  status?: OrderStatus;
  paymentStatus?: "unpaid" | "paid" | "refunded";
  paymentMethod?: "cod" | "vnpay" | "momo";
  userId?: string;
  search?: string;
  startDate?: string;
  endDate?: string;
}

export interface CreateOrderData {
  cartItemIds: string[];
  shippingAddress: {
    fullName: string;
    phone: string;
    address: string;
    city: string;
    district: string;
    ward: string;
    note?: string;
  };
  paymentMethod: "cod" | "vnpay" | "momo";
  voucherShopCode?: string;
  voucherPlatformCode?: string;
  discountCode?: string; // DEPRECATED
  note?: string;
}

export interface OrderListResponse {
  orders: Order[];
  pagination: PaginationData | null;
}

function invalidateOrderLists(queryClient: QueryClient) {
  return queryClient.invalidateQueries({ queryKey: orderKeys.lists() });
}

function invalidateOrdersAndCart(queryClient: QueryClient) {
  invalidateOrderLists(queryClient);
  queryClient.invalidateQueries({ queryKey: cartKeys.all });
}

const orderApi = {
  getUserOrders: async (
    params: OrderListParams = {},
  ): Promise<OrderListResponse> => {
    const {
      page = 1,
      limit = 10,
      status,
      paymentStatus,
      paymentMethod,
    } = params;
    const response = await instance.get("/orders", {
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
  getAllOrders: async (
    params: OrderListParams = {},
  ): Promise<OrderListResponse> => {
    const {
      page = 1,
      limit = 10,
      status,
      paymentStatus,
      paymentMethod,
      userId,
      search,
      startDate,
      endDate,
    } = params;

    const response = await instance.get("/orders/all/list", {
      params: {
        page,
        limit,
        ...(status && { status }),
        ...(paymentStatus && { paymentStatus }),
        ...(paymentMethod && { paymentMethod }),
        ...(userId && { userId }),
        ...(search && { search }),
        ...(startDate && { startDate }),
        ...(endDate && { endDate }),
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
    shopId: string,
    params: OrderListParams = {},
  ): Promise<OrderListResponse> => {
    const { page = 1, limit = 10, status } = params;
    const response = await instance.get(`/orders/shop/${shopId}`, {
      params: { page, limit, ...(status && { status }) },
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
    const response = await instance.get("/orders/statistics");
    return extractApiData(response);
  },

  // Mutations
  create: async (data: CreateOrderData): Promise<Order> => {
    const response = await instance.post("/orders", data);
    return extractApiData(response);
  },

  cancel: async (orderId: string): Promise<Order> => {
    const response = await instance.delete(`/orders/${orderId}/cancel`);
    return extractApiData(response);
  },

  updateStatus: async (params: {
    orderId: string;
    status: OrderStatus;
  }): Promise<Order> => {
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
export function useUserOrders(
  params?: OrderListParams,
  options?: { enabled?: boolean },
) {
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
    enabled:
      options?.enabled ?? (!!orderId && /^[0-9a-fA-F]{24}$/.test(orderId)),
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
      errorHandler.log(error, { context: "Create order failed" });
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
      errorHandler.log(error, { context: "Cancel order failed" });
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
      errorHandler.log(error, { context: "Update order status failed" });
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
      errorHandler.log(error, { context: "Confirm delivery failed" });
    },
  });
}
