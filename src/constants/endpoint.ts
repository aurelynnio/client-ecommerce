/**
 * API paths relative to the Axios base URL (`/api`).
 */

export const ENDPOINT_AUTH = {
  LOGIN: '/auth/login',
  REGISTER: '/auth/register',
  REFRESH: '/auth/refresh-token',
  LOGOUT: '/auth/logout',
  SEND_VERIFICATION_CODE: '/auth/send-verification-code',
  VERIFY_CODE: '/auth/verify-code',
  FORGOT_PASSWORD: '/auth/forgot-password',
  RESET_PASSWORD: '/auth/reset-password',
  CHANGE_PASSWORD: '/auth/change-password',
  VERIFY_LOGIN_TWO_FACTOR: '/auth/2fa/verify-login',
  RESEND_LOGIN_TWO_FACTOR_CODE: '/auth/2fa/resend-login-code',
  SEND_TWO_FACTOR_CODE: '/auth/2fa/send-code',
  CONFIRM_TWO_FACTOR: '/auth/2fa/confirm',
} as const;

export const ENDPOINT_BANNER = {
  LIST: '/banners',
  ADMIN_LIST: '/banners/admin/all',
  byId: (id: string) => `/banners/${id}`,
} as const;

export const ENDPOINT_CART = {
  ROOT: '/cart',
  COUNT: '/cart/count',
  byItemId: (itemId: string) => `/cart/${itemId}`,
} as const;

export const ENDPOINT_CATEGORY = {
  LIST: '/categories',
  TREE: '/categories/tree',
  ACTIVE: '/categories/active',
  STATISTICS: '/categories/statistics',
  byId: (id: string) => `/categories/${id}`,
  bySlug: (slug: string) => `/categories/slug/${slug}`,
  subcategories: (categoryId: string) => `/categories/${categoryId}/subcategories`,
} as const;

export const ENDPOINT_CHAT = {
  START: '/chat/start',
  MESSAGE: '/chat/message',
  MEDIA_MESSAGE: '/chat/message/media',
  CONVERSATIONS: '/chat/conversations',
  messages: (conversationId: string) => `/chat/messages/${conversationId}`,
  markAsRead: (conversationId: string) => `/chat/conversations/${conversationId}/read`,
} as const;

export const ENDPOINT_CHATBOT = {
  MESSAGE: '/chatbot/message',
  ADMIN_SESSIONS: '/chatbot/admin/sessions',
  STREAM: '/chatbot/stream',
  STATUS: '/chatbot/status',
  history: (sessionId: string) => `/chatbot/history/${sessionId}`,
  clearSession: (sessionId: string) => `/chatbot/session/${sessionId}`,
  SUGGESTIONS: '/chatbot/suggestions',
  FEEDBACK: '/chatbot/feedback',
} as const;

export const ENDPOINT_FLASH_SALE = {
  ROOT: '/flash-sale',
  SCHEDULE: '/flash-sale/schedule',
  STATS: '/flash-sale/stats',
  bySlot: (timeSlot: string) => `/flash-sale/slot/${timeSlot}`,
  byProductId: (productId: string) => `/flash-sale/${productId}`,
} as const;

export const ENDPOINT_NEWSLETTER = {
  SUBSCRIBE: '/newsletter/subscribe',
} as const;

export const ENDPOINT_NOTIFICATION = {
  ROOT: '/notifications',
  COUNT: '/notifications/count',
  READ_ALL: '/notifications/read-all',
  byId: (notificationId: string) => `/notifications/${notificationId}`,
} as const;

export const ENDPOINT_ORDER = {
  ROOT: '/orders',
  ALL: '/orders/all/list',
  SELLER: '/orders/seller/list',
  STATISTICS: '/orders/statistics/overview',
  SELLER_STATISTICS: '/orders/seller/statistics',
  byId: (orderId: string) => `/orders/${orderId}`,
  cancel: (orderId: string) => `/orders/${orderId}/cancel`,
  updateStatus: (orderId: string) => `/orders/${orderId}/status`,
  updateSellerStatus: (orderId: string) => `/orders/seller/${orderId}/status`,
  confirmDelivery: (orderId: string) => `/orders/${orderId}/confirm-delivery`,
} as const;

export const ENDPOINT_PAYMENT = {
  ROOT: '/payment',
  VNPAY_RETURN: '/payment/vnpay-return',
  VNPAY_IPN: '/payment/vnpay-ipn',
  byOrderId: (orderId: string) => `/payment/order/${orderId}`,
} as const;

export const ENDPOINT_PERMISSION = {
  ROOT: '/permissions',
  ROLES: '/permissions/roles',
  ME: '/permissions/me',
  AUDIT_LOGS: '/permissions/audit',
  byUserId: (userId: string) => `/permissions/user/${userId}`,
  grant: (userId: string) => `/permissions/user/${userId}/grant`,
  revoke: (userId: string) => `/permissions/user/${userId}/revoke`,
} as const;

export const ENDPOINT_PRODUCT = {
  LIST: '/products',
  SEARCH: '/products/search',
  FEATURED: '/products/featured',
  NEW_ARRIVALS: '/products/new-arrivals',
  ON_SALE: '/products/on-sale',
  byId: (productId: string) => `/products/${productId}`,
  bySlug: (slug: string) => `/products/slug/${slug}`,
  byCategory: (categorySlug: string) => `/products/category/${categorySlug}`,
  related: (productId: string) => `/products/related/${productId}`,
  seller: (productId: string) => `/products/seller/${productId}`,
  permanent: (productId: string) => `/products/${productId}/permanent`,
  variants: (productId: string) => `/products/seller/${productId}/variants`,
  variant: (productId: string, modelId: string) => `/products/seller/${productId}/variants/${modelId}`,
} as const;

export const ENDPOINT_RECOMMENDATION = {
  FOR_YOU: '/recommendations/for-you',
  HOMEPAGE: '/recommendations/homepage',
  RECENTLY_VIEWED: '/recommendations/recently-viewed',
  similar: (productId: string) => `/recommendations/similar/${productId}`,
  frequentlyBoughtTogether: (productId: string) => `/recommendations/fbt/${productId}`,
  byCategory: (categoryId: string) => `/recommendations/category/${categoryId}`,
  trackView: (productId: string) => `/recommendations/track-view/${productId}`,
} as const;

export const ENDPOINT_REVIEW = {
  ROOT: '/reviews',
  USER_ME: '/reviews/user/me',
  SELLER_ME: '/reviews/seller/me',
  byProductId: (productId: string) => `/reviews/product/${productId}`,
  byShopId: (shopId: string) => `/reviews/shop/${shopId}`,
  byId: (reviewId: string) => `/reviews/${reviewId}`,
  reply: (reviewId: string) => `/reviews/seller/${reviewId}/reply`,
  check: (productId: string) => `/reviews/check/${productId}`,
  STATISTICS: '/reviews/statistics/overview',
} as const;

export const ENDPOINT_SEARCH = {
  ROOT: '/search',
  SUGGESTIONS: '/search/suggestions',
  TRENDING: '/search/trending',
  HOT_KEYWORDS: '/search/hot-keywords',
} as const;

export const ENDPOINT_SETTINGS = {
  ROOT: '/settings',
  RESET: '/settings/reset',
  bySection: (section: string) => `/settings/${section}`,
} as const;

export const ENDPOINT_SHIPPING = {
  ROOT: '/shipping',
  byTemplateId: (templateId: string) => `/shipping/${templateId}`,
} as const;

export const ENDPOINT_SHOP = {
  ROOT: '/shops',
  MY: '/shops/my',
  ADMIN_LIST: '/shops/admin/all',
  REGISTER: '/shops/register',
  UPLOAD_REGISTER_IMAGE: '/shops/upload-register-image',
  UPLOAD_IMAGE: '/shops/upload-image',
  UPLOAD_LOGO: '/shops/upload-logo',
  UPLOAD_BANNER: '/shops/upload-banner',
  STATISTICS: '/shops/statistics',
  FOLLOWING: '/shops/following',
  ME: '/shops/me',
  byId: (shopId: string) => `/shops/${shopId}`,
  bySlug: (slug: string) => `/shops/slug/${slug}`,
  updateAdminStatus: (shopId: string) => `/shops/admin/${shopId}/status`,
  follow: (shopId: string) => `/shops/${shopId}/follow`,
} as const;

export const ENDPOINT_SHOP_CATEGORY = {
  ROOT: '/shop-categories',
  MY: '/shop-categories/my',
  byShopId: (shopId: string) => `/shop-categories/${shopId}`,
  byCategoryId: (categoryId: string) => `/shop-categories/${categoryId}`,
} as const;

export const ENDPOINT_STATISTICS = {
  DASHBOARD: '/statistics/dashboard',
} as const;

export const ENDPOINT_USER = {
  ROOT: '/users',
  PROFILE: '/users/profile',
  ADDRESSES: '/users/addresses',
  UPLOAD_AVATAR: '/users/upload-avatar',
  CHANGE_PASSWORD: '/users/change-password',
  byId: (userId: string) => `/users/${userId}`,
  updateRole: (userId: string) => `/users/${userId}/role`,
  address: (addressId: string) => `/users/addresses/${addressId}`,
  defaultAddress: (addressId: string) => `/users/addresses/${addressId}/default`,
} as const;

export const ENDPOINT_VOUCHER = {
  ROOT: '/vouchers',
  PLATFORM: '/vouchers/platform',
  AVAILABLE: '/vouchers/available',
  STATISTICS: '/vouchers/statistics',
  APPLY: '/vouchers/apply',
  byId: (voucherId: string) => `/vouchers/${voucherId}`,
  byShopId: (shopId: string) => `/vouchers/shop/${shopId}`,
  permanent: (voucherId: string) => `/vouchers/${voucherId}/permanent`,
} as const;

export const ENDPOINT_WISHLIST = {
  ROOT: '/wishlist',
  COUNT: '/wishlist/count',
  check: (productId: string) => `/wishlist/check/${productId}`,
  byProductId: (productId: string) => `/wishlist/${productId}`,
  CHECK_MULTIPLE: '/wishlist/check-multiple',
} as const;
