import { BaseEntity, PaginationData } from "./common";

// Notification type enum - matches backend schema
export type NotificationType =
  | "order_status"
  | "promotion"
  | "system"
  | "chat"
  | "shop_follow";

// Populated order info for notification
export interface NotificationOrderInfo {
  _id: string;
  orderCode?: string;
  totalAmount: number;
  status: string;
}

// Notification interface - matches backend notificationSchema
export interface Notification extends BaseEntity {
  userId: string;
  type: NotificationType;
  title: string;
  message: string;
  orderId?: NotificationOrderInfo | string; // Can be populated or ID
  link?: string;
  isRead: boolean;
  readAt?: string; // Added - matches backend schema
}

// Notification state for Redux
export interface NotificationState {
  notifications: Notification[];
  unreadCount: number;
  loading: boolean;
  error: string | null;
  pagination: PaginationData | null;
}

// Notification filters
export interface NotificationFilters {
  page?: number;
  limit?: number;
  type?: NotificationType;
  isRead?: boolean;
}
