/**
 * Centralized Query Keys
 * Factory functions for consistent query key generation across the app
 *
 * Benefits:
 * - Type-safe query keys
 * - Easy invalidation of related queries
 * - Consistent naming conventions
 */

// Product query keys
export const productKeys = {
  all: ["products"] as const,
  lists: () => [...productKeys.all, "list"] as const,
  list: (filters: unknown) => [...productKeys.lists(), filters] as const,
  infinite: (filters?: unknown) => [...productKeys.all, "infinite", filters] as const,
  details: () => [...productKeys.all, "detail"] as const,
  detail: (slug: string) => [...productKeys.details(), slug] as const,
  detailById: (id: string) => [...productKeys.all, "detail-by-id", id] as const,
  featured: () => [...productKeys.all, "featured"] as const,
  newArrivals: () => [...productKeys.all, "new-arrivals"] as const,
  onSale: () => [...productKeys.all, "on-sale"] as const,
  byCategory: (categorySlug: string) =>
    [...productKeys.all, "category", categorySlug] as const,
  infiniteByCategory: (categorySlug: string) =>
    [...productKeys.all, "infinite-category", categorySlug] as const,
  shopProducts: (shopId: string, filters?: unknown) =>
    [...productKeys.all, "shop", shopId, filters] as const,
  infiniteShopProducts: (shopId: string, filters?: unknown) =>
    [...productKeys.all, "infinite-shop", shopId, filters] as const,
  related: (productId: string) =>
    [...productKeys.all, "related", productId] as const,
  search: (keyword: string, limit?: number) =>
    [...productKeys.all, "search", keyword, limit] as const,
};

// Category query keys
export const categoryKeys = {
  all: ["categories"] as const,
  lists: () => [...categoryKeys.all, "list"] as const,
  list: (filters: unknown) => [...categoryKeys.lists(), filters] as const,
  tree: () => [...categoryKeys.all, "tree"] as const,
  detail: (id: string) => [...categoryKeys.all, "detail", id] as const,
  statistics: () => [...categoryKeys.all, "statistics"] as const,
};

// Recommendation query keys
export const recommendationKeys = {
  all: ["recommendations"] as const,
  forYou: (limit?: number) =>
    [...recommendationKeys.all, "for-you", limit] as const,
  recentlyViewed: (limit?: number) =>
    [...recommendationKeys.all, "recently-viewed", limit] as const,
  similar: (productId: string, limit?: number) =>
    [...recommendationKeys.all, "similar", productId, limit] as const,
  frequentlyBoughtTogether: (productId: string, limit?: number) =>
    [...recommendationKeys.all, "fbt", productId, limit] as const,
  category: (categoryId: string, limit?: number) =>
    [...recommendationKeys.all, "category", categoryId, limit] as const,
  homepage: () => [...recommendationKeys.all, "homepage"] as const,
};

// Flash sale query keys
export const flashSaleKeys = {
  all: ["flash-sale"] as const,
  active: (params?: { page?: number; limit?: number }) =>
    [...flashSaleKeys.all, "active", params] as const,
  schedule: () => [...flashSaleKeys.all, "schedule"] as const,
  slot: (timeSlot: string) => [...flashSaleKeys.all, "slot", timeSlot] as const,
  stats: () => [...flashSaleKeys.all, "stats"] as const,
  adminProducts: () => [...flashSaleKeys.all, "admin-products"] as const,
  adminSchedule: () => [...flashSaleKeys.all, "admin-schedule"] as const,
};

// Wishlist query keys
export const wishlistKeys = {
  all: ["wishlist"] as const,
  list: (params?: { page?: number; limit?: number }) =>
    [...wishlistKeys.all, "list", params] as const,
  count: () => [...wishlistKeys.all, "count"] as const,
  check: (productId: string) =>
    [...wishlistKeys.all, "check", productId] as const,
  checkMultiple: (productIds: string[]) =>
    [...wishlistKeys.all, "check-multiple", productIds] as const,
};

// Cart query keys
export const cartKeys = {
  all: ["cart"] as const,
  current: () => [...cartKeys.all, "current"] as const,
};

// Order query keys
export const orderKeys = {
  all: ["orders"] as const,
  lists: () => [...orderKeys.all, "list"] as const,
  list: (params?: unknown) => [...orderKeys.lists(), params] as const,
  detail: (orderId: string) => [...orderKeys.all, "detail", orderId] as const,
  shopOrders: (shopId: string, params?: unknown) =>
    [...orderKeys.all, "shop", shopId, params] as const,
  admin: (params?: unknown) => [...orderKeys.all, "admin", params] as const,
  statistics: () => [...orderKeys.all, "statistics"] as const,
};

// User/Profile query keys
export const userKeys = {
  all: ["user"] as const,
  profile: () => [...userKeys.all, "profile"] as const,
  addresses: () => [...userKeys.all, "addresses"] as const,
  address: (addressId: string) =>
    [...userKeys.all, "address", addressId] as const,
  list: (params?: unknown) => [...userKeys.all, "list", params] as const,
};

// Profile query keys (alias for userKeys with current() for compatibility)
export const profileKeys = {
  all: ["profile"] as const,
  current: () => [...profileKeys.all, "current"] as const,
  addresses: () => [...profileKeys.all, "addresses"] as const,
};

// Shop query keys
export const shopKeys = {
  all: ["shops"] as const,
  myShop: () => [...shopKeys.all, "my-shop"] as const,
  statistics: () => [...shopKeys.all, "statistics"] as const,
  detail: (shopId: string) => [...shopKeys.all, "detail", shopId] as const,
  detailBySlug: (slug: string) => [...shopKeys.all, "slug", slug] as const,
  list: (params?: unknown) => [...shopKeys.all, "list", params] as const,
};

// Shop Category query keys
export const shopCategoryKeys = {
  all: ["shop-categories"] as const,
  myCategories: () => [...shopCategoryKeys.all, "my"] as const,
  byShop: (shopId: string) =>
    [...shopCategoryKeys.all, "shop", shopId] as const,
  // Same endpoint as byShop(), but for consumers that expect `{ categories, totalProducts }`.
  byShopWithTotals: (shopId: string) =>
    [...shopCategoryKeys.all, "shop-with-totals", shopId] as const,
};

// Review query keys
export const reviewKeys = {
  all: ["reviews"] as const,
  product: (productId: string, params?: unknown) =>
    [...reviewKeys.all, "product", productId, params] as const,
  shop: (shopId: string, params?: unknown) =>
    [...reviewKeys.all, "shop", shopId, params] as const,
  seller: (params?: unknown) => [...reviewKeys.all, "seller", params] as const,
  user: () => [...reviewKeys.all, "user"] as const,
  admin: (params?: unknown) => [...reviewKeys.all, "admin", params] as const,
};


// Notification query keys
export const notificationKeys = {
  all: ["notifications"] as const,
  list: (params?: unknown) =>
    [...notificationKeys.all, "list", params] as const,
  unreadCount: () => [...notificationKeys.all, "unread-count"] as const,
};

// Statistics query keys (Admin)
export const statisticsKeys = {
  all: ["statistics"] as const,
  dashboard: () => [...statisticsKeys.all, "dashboard"] as const,
  revenue: (params?: unknown) =>
    [...statisticsKeys.all, "revenue", params] as const,
  orders: (params?: unknown) =>
    [...statisticsKeys.all, "orders", params] as const,
  products: (params?: unknown) =>
    [...statisticsKeys.all, "products", params] as const,
};

// Settings query keys (Admin)
export const settingsKeys = {
  all: ["settings"] as const,
  current: () => [...settingsKeys.all, "current"] as const,
  section: (section: string) => [...settingsKeys.all, section] as const,
};

// Voucher query keys
export const voucherKeys = {
  all: ["vouchers"] as const,
  lists: () => [...voucherKeys.all, "list"] as const,
  list: (params?: unknown) => [...voucherKeys.lists(), params] as const,
  platform: () => [...voucherKeys.all, "platform"] as const,
  shopPublic: (shopId: string) =>
    [...voucherKeys.all, "shop-public", shopId] as const,
  detail: (voucherId: string) =>
    [...voucherKeys.all, "detail", voucherId] as const,
  available: (params?: unknown) =>
    [...voucherKeys.all, "available", params] as const,
  validate: (code: string) => [...voucherKeys.all, "validate", code] as const,
  statistics: () => [...voucherKeys.all, "statistics"] as const,
};

// Banner query keys
export const bannerKeys = {
  all: ["banners"] as const,
  active: () => [...bannerKeys.all, "active"] as const,
  list: () => [...bannerKeys.all, "list"] as const,
};

// Shipping query keys
export const shippingKeys = {
  all: ["shipping"] as const,
  templates: () => [...shippingKeys.all, "templates"] as const,
  methods: () => [...shippingKeys.all, "methods"] as const,
  calculate: (params: unknown) =>
    [...shippingKeys.all, "calculate", params] as const,
};

// Chat query keys
export const chatKeys = {
  all: ["chat"] as const,
  conversations: () => [...chatKeys.all, "conversations"] as const,
  messages: (conversationId: string) =>
    [...chatKeys.all, "messages", conversationId] as const,
};

// Chatbot query keys
export const chatbotKeys = {
  all: ["chatbot"] as const,
  adminSessions: (params?: unknown) =>
    [...chatbotKeys.all, "admin-sessions", params] as const,
  history: (sessionId: string) =>
    [...chatbotKeys.all, "history", sessionId] as const,
};

// Search query keys
export const searchKeys = {
  all: ["search"] as const,
  suggestions: (query: string, limit?: number) =>
    [...searchKeys.all, "suggestions", query, limit] as const,
  results: (params: unknown) => [...searchKeys.all, "results", params] as const,
};

// Payment query keys
export const paymentKeys = {
  all: ["payment"] as const,
  methods: () => [...paymentKeys.all, "methods"] as const,
  byOrder: (orderId: string) => [...paymentKeys.all, "order", orderId] as const,
};
