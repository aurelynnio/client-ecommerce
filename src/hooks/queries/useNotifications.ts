/**
 * Notification React Query Hooks
 * Replaces notificationAction.ts async thunks with React Query
 */
import { QueryClient, useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import instance from '@/api/api';
import { ENDPOINT_NOTIFICATION } from '@/constants/endpoint';
import { extractApiData } from '@/api';
import { errorHandler } from '@/lib/error-handler';
import { STALE_TIME, REFETCH_INTERVAL } from '@/constants/cache';
import { notificationKeys } from '@/lib/queryKeys';
import { Notification, NotificationSummary, NotificationType } from '@/types/notification';
import { PaginationData } from '@/types/common';

// ============ Types ============
export interface NotificationListParams {
  page?: number;
  limit?: number;
  type?: string;
  isRead?: boolean;
}

export interface NotificationListResponse {
  notifications: Notification[];
  pagination: PaginationData | null;
  unreadCount?: number;
  summary?: NotificationSummary | null;
}

export interface CreateNotificationData {
  title: string;
  message: string;
  type?: NotificationType;
  recipient?: string;
  link?: string;
  orderId?: string;
}

interface QueryOptions {
  enabled?: boolean;
}

function invalidateNotificationQueries(queryClient: QueryClient) {
  return queryClient.invalidateQueries({ queryKey: notificationKeys.all });
}

// ============ API Functions ============
const notificationApi = {
  getList: async (params: NotificationListParams = {}): Promise<NotificationListResponse> => {
    const { page = 1, limit = 10 } = params;
    const response = await instance.get(ENDPOINT_NOTIFICATION.ROOT, {
      params: { page, limit },
    });
    const data = extractApiData<
      NotificationListResponse & {
        data?: Notification[];
        unreadCount?: number;
        summary?: NotificationSummary;
        metadata?: { unreadCount?: number };
        meta?: { unreadCount?: number };
      }
    >(response);
    // Handle both old format (meta) and new format (metadata)
    const unreadCount =
      data?.unreadCount ?? data?.metadata?.unreadCount ?? data?.meta?.unreadCount ?? 0;
    return {
      notifications: data?.notifications || data?.data || [],
      pagination: data?.pagination || null,
      unreadCount,
      summary: data?.summary || null,
    };
  },

  getUnreadCount: async (): Promise<number> => {
    const response = await instance.get(ENDPOINT_NOTIFICATION.COUNT);
    const data = extractApiData<{ count?: number }>(response);
    return data?.count || 0;
  },

  // Mutations
  markAsRead: async (notificationId: string): Promise<Notification> => {
    const response = await instance.patch(ENDPOINT_NOTIFICATION.byId(notificationId), {
      isRead: true,
    });
    return extractApiData(response);
  },

  markAllAsRead: async (): Promise<void> => {
    await instance.patch(ENDPOINT_NOTIFICATION.READ_ALL, {});
  },

  clearAll: async (): Promise<void> => {
    await instance.delete(ENDPOINT_NOTIFICATION.ROOT);
  },

  // Admin: Create notification
  create: async (data: CreateNotificationData): Promise<Notification> => {
    const payload = {
      ...data,
      recipient: data.recipient?.trim() || undefined,
      link: data.link?.trim() || undefined,
      orderId: data.orderId?.trim() || undefined,
    };
    const response = await instance.post(ENDPOINT_NOTIFICATION.ROOT, payload);
    return extractApiData(response);
  },
};

// ============ Query Hooks ============

/**
 * Get notifications list
 */
export function useNotifications(params?: NotificationListParams, options?: QueryOptions) {
  return useQuery({
    queryKey: notificationKeys.list(params),
    queryFn: () => notificationApi.getList(params),
    enabled: options?.enabled,
    staleTime: STALE_TIME.MEDIUM,
  });
}

/**
 * Get unread notification count (for badge)
 */
export function useUnreadNotificationCount(options?: QueryOptions) {
  return useQuery({
    queryKey: notificationKeys.unreadCount(),
    queryFn: notificationApi.getUnreadCount,
    enabled: options?.enabled,
    staleTime: STALE_TIME.SHORT,
    refetchInterval: REFETCH_INTERVAL.NORMAL,
  });
}

// ============ Mutation Hooks ============

/**
 * Mark notification as read
 */
export function useMarkNotificationAsRead() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: notificationApi.markAsRead,
    onSuccess: () => {
      invalidateNotificationQueries(queryClient);
    },
    onError: (error) => {
      errorHandler.log(error, { context: 'Mark as read failed' });
    },
  });
}

/**
 * Mark all notifications as read
 */
export function useMarkAllNotificationsAsRead() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: notificationApi.markAllAsRead,
    onSuccess: () => {
      invalidateNotificationQueries(queryClient);
    },
    onError: (error) => {
      errorHandler.log(error, { context: 'Mark all as read failed' });
    },
  });
}

/**
 * Delete notification
 */
export function useDeleteNotification() {
  return useMutation({
    mutationFn: async () => {
      throw new Error(
        'Deleting a single notification is not supported by the current backend API.',
      );
    },
  });
}

/**
 * Clear all notifications
 */
export function useClearAllNotifications() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: notificationApi.clearAll,
    onSuccess: () => {
      invalidateNotificationQueries(queryClient);
    },
    onError: (error) => {
      errorHandler.log(error, { context: 'Clear all notifications failed' });
    },
  });
}

/**
 * Create notification (Admin)
 */
export function useCreateNotification() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: notificationApi.create,
    onSuccess: () => {
      invalidateNotificationQueries(queryClient);
    },
    onError: (error) => {
      errorHandler.log(error, { context: 'Create notification failed' });
    },
  });
}

/**
 * Hook to invalidate notifications from socket events
 * Call this when receiving a new notification via socket
 */
export function useInvalidateNotifications() {
  const queryClient = useQueryClient();

  return () => {
    invalidateNotificationQueries(queryClient);
  };
}
