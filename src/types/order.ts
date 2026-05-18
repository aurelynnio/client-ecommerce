import { BaseEntity, PaginationData } from "./common";
import { Shop } from "./shop";
import { User } from "./user";

// Order product interface - matches backend products[] schema
export interface OrderProduct {
  productId: string; // ObjectId ref to Product
  modelId?: string; // maps to product.models._id

  // Variation info
  name: string;
  sku?: string;
  image?: string;
  color?: string;
  size?: string;

  // Selection
  quantity: number;
  tierIndex?: number[]; // e.g. [0, 1] for Blue, M

  // Snapshot prices
  price: number; // Snapshot price at purchase
  totalPrice: number; // quantity * price (required in backend)

  // Display helper (frontend only)
  variationInfo?: string;
}

// Shipping address interface - matches backend shippingAddress schema exactly
export interface ShippingAddress {
  fullName: string;
  phone: string;
  address: string;
  city: string;
  district?: string;
  ward?: string;
  note?: string;
}

// Order status type
export type OrderStatus =
  | "pending"
  | "confirmed"
  | "processing"
  | "shipped"
  | "delivered"
  | "cancelled"
  | "returned";
export type PaymentMethod = "cod" | "vnpay" | "momo";
export type PaymentStatus = "unpaid" | "paid" | "refunded";

// Order interface
export interface Order extends BaseEntity {
  orderGroupId?: string; // Group ID for multi-shop checkout

  userId: string | User;
  shopId: string | Shop;

  products: OrderProduct[];
  shippingAddress: ShippingAddress;

  // Payment info
  paymentMethod: PaymentMethod;
  paymentStatus: PaymentStatus;

  // Financials
  subtotal: number;
  shippingFee: number;
  discountShop: number;
  discountPlatform: number;
  totalAmount: number;

  // Status and tracking
  status: OrderStatus;
  trackingNumber?: string;
  carrier?: string;

  deliveredAt?: string;
  cancelledAt?: string;
  cancelReason?: string;

  // Display only
  orderCode?: string;
}

// Order statistics interface
export interface OrderStatistics {
  totalOrders: number;
  pendingOrders: number;
  confirmedOrders: number;
  processingOrders: number;
  shippedOrders: number;
  deliveredOrders: number;
  cancelledOrders: number;
  totalRevenue: number;
  revenueByPeriod?: Array<{
    period: string;
    revenue: number;
    orders: number;
  }>;
}

// Order filters for admin
export interface OrderFilters {
  page: number;
  limit: number;
  search: string;
  status: string;
  paymentStatus: string;
  paymentMethod: string;
  userId: string;
  shop: string; // Updated from shopId to match previous usage
  startDate: string;
  endDate: string;
  [key: string]: string | number | boolean | null | undefined;
}


// Seller order statistics interface
export interface SellerOrderStatistics {
  summary: {
    totalOrders: number;
    pendingOrders: number;
    completedOrders: number;
    cancelledOrders: number;
    totalRevenue: number;
    avgOrderValue: number;
  };
  ordersByStatus: Record<string, { count: number; totalAmount: number }>;
  dailyOrders: Array<{
    date: string;
    orders: number;
    revenue: number;
  }>;
  topProducts: Array<{
    _id: string;
    productName: string;
    totalQuantity: number;
    totalRevenue: number;
  }>;
}

// Order state for Redux
export interface OrderState {
  userOrders: Order[];
  currentOrder: Order | null;
  allOrders: Order[];
  statistics: OrderStatistics | null;
  pagination: PaginationData | null;
  isLoading: boolean;
  isCreating: boolean;
  isUpdating: boolean;
  isCancelling: boolean;
  error: string | null;
  // Seller shop orders
  shopOrders: Order[];
  shopOrdersPagination: PaginationData | null;
  isLoadingShopOrders: boolean;
  shopOrdersError: string | null;
  // Seller statistics
  sellerStatistics: SellerOrderStatistics | null;
  isLoadingSellerStats: boolean;
  sellerStatsError: string | null;
}

// Order status count for stats
export interface OrderStatusCount {
  _id: string;
  count: number;
}

// Order stats props for components
export interface OrdersStatsProps {
  totalOrders?: number;
  pendingOrders?: number;
  confirmedOrders?: number;
  processingOrders?: number;
  shippedOrders?: number;
  deliveredOrders?: number;
  cancelledOrders?: number;
  totalRevenue?: number;
  ordersByStatus?: OrderStatusCount[];
}

// Create order payload - Updated
export interface CreateOrderPayload {
  products: Array<{
    productId: string;
    modelId?: string;
    // tierIndex is generally calculated on backend or used for meta
    quantity: number;
    price: number;
  }>;
  addressId: string;
  paymentMethod: PaymentMethod;
  shopId?: string;
  voucherShopCode?: string;
  voucherPlatformCode?: string;
}

// Order group for multi-vendor checkout
export interface OrderGroup {
  orderGroupId: string;
  orders: Order[];
  totalAmount: number;
  totalDiscountShop: number;
  totalDiscountPlatform: number;
}
