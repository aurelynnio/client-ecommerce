/**
 * Statistics React Query Hooks (Admin)
 * Replaces statisticsAction.ts async thunks with React Query
 */
import { useQuery } from "@tanstack/react-query";
import instance from "@/api/api";
import { extractApiData } from "@/api";
import { STALE_TIME, REFETCH_INTERVAL } from "@/constants/cache";
import { statisticsKeys } from "@/lib/queryKeys";

export interface DashboardStats {
  // Flat structure (new format)
  totalUsers: number;
  totalProducts: number;
  totalOrders: number;
  totalRevenue: number;
  // Nested structure (old format - backward compatibility)
  counts?: {
    users: number;
    products: number;
    orders: number;
    revenue: number;
  };
  // Additional stats
  newUsersToday?: number;
  newOrdersToday?: number;
  revenueToday?: number;
  pendingOrders?: number;
  lowStockProducts?: number;
  // Trends
  userGrowth?: number;
  orderGrowth?: number;
  revenueGrowth?: number;
  // Dashboard specific data
  recentOrders?: Array<{
    _id: string;
    orderNumber?: string;
    user: { name: string; avatar?: string | null };
    totalAmount: number;
    status: string;
    createdAt: string;
  }>;
  topProducts?: Array<{
    _id: string;
    name: string;
    slug?: string;
    image?: string | null;
    sold: number;
    revenue: number;
  }>;
  chartData?: Array<{
    month: string;
    revenue: number;
    orders: number;
  }>;
}

export interface RevenueStats {
  period: string;
  revenue: number;
  orders: number;
  averageOrderValue: number;
}

export interface ProductStats {
  topSelling: Array<{
    productId: string;
    name: string;
    sold: number;
    revenue: number;
  }>;
  lowStock: Array<{
    productId: string;
    name: string;
    stock: number;
  }>;
  byCategory: Array<{
    category: string;
    count: number;
    revenue: number;
  }>;
}

export interface OrderStats {
  byStatus: Record<string, number>;
  byPaymentMethod: Record<string, number>;
  byDay: Array<{
    date: string;
    orders: number;
    revenue: number;
  }>;
}

const statisticsApi = {
  getDashboard: async (): Promise<DashboardStats> => {
    const response = await instance.get("/statistics/dashboard");
    return extractApiData(response);
  },

  getRevenue: async (params?: {
    startDate?: string;
    endDate?: string;
    groupBy?: "day" | "week" | "month";
  }): Promise<RevenueStats[]> => {
    void params;
    const dashboard = await statisticsApi.getDashboard();
    return (
      dashboard.chartData?.map((item) => ({
        period: item.month,
        revenue: item.revenue,
        orders: item.orders,
        averageOrderValue: item.orders > 0 ? item.revenue / item.orders : 0,
      })) ?? []
    );
  },

  getProducts: async (): Promise<ProductStats> => {
    const dashboard = await statisticsApi.getDashboard();
    return {
      topSelling:
        dashboard.topProducts?.map((product) => ({
          productId: product._id,
          name: product.name,
          sold: product.sold,
          revenue: product.revenue,
        })) ?? [],
      lowStock: [],
      byCategory: [],
    };
  },

  getOrders: async (params?: {
    startDate?: string;
    endDate?: string;
  }): Promise<OrderStats> => {
    void params;
    const dashboard = await statisticsApi.getDashboard();
    return {
      byStatus: {
        pending: dashboard.pendingOrders ?? 0,
      },
      byPaymentMethod: {},
      byDay:
        dashboard.chartData?.map((item) => ({
          date: item.month,
          orders: item.orders,
          revenue: item.revenue,
        })) ?? [],
    };
  },
};

/**
 * Get dashboard statistics (Admin)
 */
export function useDashboardStats() {
  return useQuery({
    queryKey: statisticsKeys.dashboard(),
    queryFn: statisticsApi.getDashboard,
    staleTime: STALE_TIME.LONG,
    refetchInterval: REFETCH_INTERVAL.SLOW,
  });
}

/**
 * Get revenue statistics (Admin)
 */
export function useRevenueStats(params?: {
  startDate?: string;
  endDate?: string;
  groupBy?: "day" | "week" | "month";
}) {
  return useQuery({
    queryKey: statisticsKeys.revenue(params),
    queryFn: () => statisticsApi.getRevenue(params),
    staleTime: STALE_TIME.VERY_LONG,
  });
}

/**
 * Get product statistics (Admin)
 */
export function useProductStats() {
  return useQuery({
    queryKey: statisticsKeys.products(),
    queryFn: statisticsApi.getProducts,
    staleTime: STALE_TIME.VERY_LONG,
  });
}

/**
 * Get order statistics (Admin)
 */
export function useOrderStats(params?: {
  startDate?: string;
  endDate?: string;
}) {
  return useQuery({
    queryKey: statisticsKeys.orders(params),
    queryFn: () => statisticsApi.getOrders(params),
    staleTime: STALE_TIME.VERY_LONG,
  });
}
