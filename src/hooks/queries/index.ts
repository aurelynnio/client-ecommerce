/**
 * React Query Hooks - Central Export
 * Import all query hooks from this file for convenience
 */

// Product queries (includes useProductDetail composite hook)
export {
  useProducts,
  useProduct,
  useProductById,
  useFeaturedProducts,
  useNewArrivals,
  useOnSaleProducts,
  useProductsByCategory,
  useRelatedProducts,
  useShopProducts,
  useProductSearch,
  useCreateProduct,
  useUpdateProduct,
  useDeleteProduct,
  useUpdateSellerProduct,
  useDeleteSellerProduct,
  useUpdateProductModel,
  useDeleteProductModel,
  useProductDetail,
  type ProductListParams,
  type ProductListResponse,
  type UseProductDetailOptions,
  type UseProductDetailReturn,
} from "./useProducts";

// Category queries
export {
  useCategoryTree,
  useCategories,
  useCategory,
  useCategoryStatistics,
  useCreateCategory,
  useUpdateCategory,
  useDeleteCategory,
  type CategoryListParams,
  type CreateCategoryData,
  type UpdateCategoryData,
  type CategoryTree,
} from "./useCategories";

// Recommendation queries
export {
  useForYouRecommendations,
  useRecentlyViewed,
  useSimilarProducts,
  useFrequentlyBoughtTogether,
  useCategoryRecommendations,
  useHomepageRecommendations,
  useTrackProductView,
  useRecommendation,
} from "./useRecommendations";

// Flash sale queries
export {
  useActiveFlashSale,
  useFlashSaleSchedule,
  useAdminFlashSaleProducts,
  useAdminFlashSaleSchedule,
  useFlashSaleBySlot,
  useFlashSaleStats,
  useAddToFlashSale,
  useRemoveFromFlashSale,
  useFlashSaleWithCountdown,
  useFlashSaleWithCountdown as useFlashSale,
  type AdminFlashSaleProduct,
  type AdminFlashSaleSlot,
} from "./useFlashSale";

// Wishlist queries
export {
  useWishlist,
  useWishlistCount,
  useCheckInWishlist,
  useCheckMultipleInWishlist,
  useAddToWishlist,
  useRemoveFromWishlist,
  useClearWishlist,
  useToggleWishlist,
  useWishlistManager,
} from "./useWishlist";

// Order queries
export {
  useUserOrders,
  useOrder,
  useAllOrders,
  useShopOrders,
  useOrderStatistics,
  useCreateOrder,
  useCancelOrder,
  useUpdateOrderStatus,
  useConfirmDelivery,
  type OrderListParams,
  type CreateOrderData,
  type OrderListResponse,
} from "./useOrders";

// Profile/User queries
export {
  useProfile,
  useAddresses,
  useAllUsers,
  useUpdateProfile,
  useUploadAvatar,
  useChangePassword,
  useSendTwoFactorCode,
  useConfirmTwoFactor,
  useCreateAddress,
  useUpdateAddress,
  useDeleteAddress,
  useSetDefaultAddress,
  useCreateUser,
  useUpdateUser,
  useDeleteUser,
  type UserListParams,
  type UpdateProfileData,
  type CreateAddressData,
  type UpdateAddressData,
  type CreateUserData,
  type UpdateUserData,
} from "./useProfile";

// Auth mutations
export {
  useLogin,
  useRegister,
  useSendVerificationCode,
  useVerifyCode,
  useVerifyLoginTwoFactor,
  useResendLoginTwoFactorCode,
  useForgotPassword,
  useResetPassword,
  useLogout,
  useRefreshAuthSession,
} from "./useAuth";

// Shop queries
export {
  useMyShop,
  useShop,
  useShopBySlug,
  useShopCategories,
  useAllShops,
  useRegisterShop,
  useUpdateShop,
  useUploadShopLogo,
  useUploadShopBanner,
  useUpdateShopStatus,
  useFollowShop,
  useUnfollowShop,
  type ShopListParams,
} from "./useShop";

// Review queries
export {
  useProductReviews,
  useShopReviews,
  useUserReviews,
  useAdminReviews,
  useCreateReview,
  useUpdateReview,
  useDeleteReview,
  useDeleteAdminReview,
  type Review,
  type AdminReview,
  type AdminReviewListParams,
  type AdminReviewListResponse,
  type ReviewListParams,
  type ReviewListResponse,
  type CreateReviewData,
  type UpdateReviewData,
} from "./useReviews";

// Cart queries
export {
  useCart,
  useAddToCart,
  useUpdateCartItem,
  useRemoveFromCart,
  useClearCart,
  useOptimisticAddToCart,
  type AddToCartData,
  type UpdateCartItemData,
} from "./useCart";

// Notification queries
export {
  useNotifications,
  useUnreadNotificationCount,
  useMarkNotificationAsRead,
  useMarkAllNotificationsAsRead,
  useDeleteNotification,
  useClearAllNotifications,
  useCreateNotification,
  useInvalidateNotifications,
  type NotificationListParams,
  type NotificationListResponse,
  type CreateNotificationData,
} from "./useNotifications";

// Chatbot queries
export {
  useAdminChatbotSessions,
  useAdminChatbotHistory,
  type ChatSession,
  type ChatMessage,
  type AdminChatbotSessionsResponse,
  type AdminChatbotHistoryResponse,
} from "./useChatbot";

// Chat queries
export {
  useChatConversations,
  useChatMessages,
  useStartConversation,
  useSendChatMessage,
  useMarkConversationAsRead,
  type ChatMessagesParams,
  type ChatMessagesResponse,
} from "./useChat";

// Statistics queries (Admin)
export {
  useDashboardStats,
  useRevenueStats,
  useProductStats,
  useOrderStats,
  type DashboardStats,
  type RevenueStats,
  type ProductStats,
  type OrderStats,
} from "./useStatistics";

// Banner queries
export {
  useActiveBanners,
  useBanners,
  useCreateBanner,
  useUpdateBanner,
  useDeleteBanner,
  type BannerListParams,
  type BannerListResponse,
} from "./useBanner";

// Payment queries
export {
  usePaymentByOrder,
  useCreatePaymentUrl,
  type PaymentUrlResponse,
  type PaymentDetails,
} from "./usePayment";

// Shipping queries
export {
  useMyShippingTemplates,
  useCreateShippingTemplate,
  useUpdateShippingTemplate,
  useDeleteShippingTemplate,
} from "./useShipping";

// Shop Category queries
export {
  useMyShopCategories,
  useShopCategoriesByShop,
  useCreateShopCategory,
  useUpdateShopCategory,
  useDeleteShopCategory,
} from "./useShopCategory";

// Voucher queries
export {
  useAdminVouchers,
  usePlatformVouchers,
  useShopVouchers,
  useVoucher,
  useAvailableVouchers,
  useVoucherStatistics,
  useCreateVoucher,
  useUpdateVoucher,
  useDeleteVoucher,
  useApplyVoucher,
  type VoucherListResponse,
} from "./useVoucher";

export { useSubscribeNewsletter } from "./useNewsletter";
