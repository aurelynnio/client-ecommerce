/**
 * Status Constants
 * Centralized status definitions for type-safe status checking
 */

/**
 * Shop status constants
 */
export const SHOP_STATUS = {
  ACTIVE: 'active',
  INACTIVE: 'inactive',
  BANNED: 'banned',
} as const;

export type ShopStatus = (typeof SHOP_STATUS)[keyof typeof SHOP_STATUS];

/**
 * Order status constants
 */
export const ORDER_STATUS = {
  PENDING: 'pending',
  CONFIRMED: 'confirmed',
  PROCESSING: 'processing',
  SHIPPED: 'shipped',
  DELIVERED: 'delivered',
  CANCELLED: 'cancelled',
  RETURNED: 'returned',
} as const;

export type OrderStatus = (typeof ORDER_STATUS)[keyof typeof ORDER_STATUS];

/**
 * Flash sale status constants
 */
export const FLASH_SALE_STATUS = {
  UPCOMING: 'upcoming',
  ACTIVE: 'active',
  ENDED: 'ended',
} as const;

export type FlashSaleStatus = (typeof FLASH_SALE_STATUS)[keyof typeof FLASH_SALE_STATUS];

/**
 * Product status constants
 * Note: ProductStatus type is defined in product.ts, use ProductStatusValue here
 */
export const PRODUCT_STATUS = {
  DRAFT: 'draft',
  PUBLISHED: 'published',
  SUSPENDED: 'suspended',
  DELETED: 'deleted',
} as const;

export type ProductStatusValue = (typeof PRODUCT_STATUS)[keyof typeof PRODUCT_STATUS];

/**
 * Verification status constants
 */
export const VERIFICATION_STATUS = {
  PENDING: 'pending',
  VERIFIED: 'verified',
  REJECTED: 'rejected',
} as const;

export type VerificationStatus = (typeof VERIFICATION_STATUS)[keyof typeof VERIFICATION_STATUS];
