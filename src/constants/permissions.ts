/**
 * Permission System Constants
 * Defines all permissions, resources, actions, and role-based permission mappings
 * Must be kept in sync with server-side permission definitions
 */

/**
 * All available resources in the system
 */
export const RESOURCES = {
  PRODUCT: 'product',
  ORDER: 'order',
  USER: 'user',
  SHOP: 'shop',
  CATEGORY: 'category',
  VOUCHER: 'voucher',
  BANNER: 'banner',
  NOTIFICATION: 'notification',
  FLASH_SALE: 'flash-sale',
  REVIEW: 'review',
  CART: 'cart',
  WISHLIST: 'wishlist',
  SHIPPING: 'shipping',
  STATISTICS: 'statistics',
  CHAT: 'chat',
  SHOP_CATEGORY: 'shop-category',
  PAYMENT: 'payment',
} as const;

/**
 * All available actions
 */
export const ACTIONS = {
  CREATE: 'create',
  READ: 'read',
  UPDATE: 'update',
  DELETE: 'delete',
  MANAGE: 'manage',
} as const;

/**
 * Generate permission string from resource and action
 */
export const permission = (resource: string, action: string): string => 
  `${resource}:${action}`;

/**
 * Special permissions
 */
export const SPECIAL_PERMISSIONS = {
  ADMIN_ACCESS: 'admin:access',
  SELLER_ACCESS: 'seller:access',
} as const;

const buildPermissions = (): Record<string, string> => {
  const generated: Record<string, string> = {};

  for (const [resourceKey, resourceValue] of Object.entries(RESOURCES)) {
    for (const [actionKey, actionValue] of Object.entries(ACTIONS)) {
      generated[`${resourceKey}_${actionKey}`] = permission(resourceValue, actionValue);
    }
  }

  return generated;
};

/**
 * All permissions (resource-action generated + special permissions)
 */
export const PERMISSIONS = {
  ...buildPermissions(),
  ADMIN_ACCESS: SPECIAL_PERMISSIONS.ADMIN_ACCESS,
  SELLER_ACCESS: SPECIAL_PERMISSIONS.SELLER_ACCESS,
} as Record<string, string>;

// Type definitions
export type Resource = typeof RESOURCES[keyof typeof RESOURCES];
export type Action = typeof ACTIONS[keyof typeof ACTIONS];
export type Permission = typeof PERMISSIONS[keyof typeof PERMISSIONS];

const ALL_PERMISSIONS = [...new Set(Object.values(PERMISSIONS))];
const ALL_PERMISSIONS_SET = new Set(ALL_PERMISSIONS);

/**
 * Get all permissions as array
 */
export const getAllPermissions = (): string[] => [...ALL_PERMISSIONS];

/**
 * Get permissions grouped by resource
 */
export const getPermissionsByResource = (): Record<string, string[]> => {
  const grouped: Record<string, string[]> = {};
  
  for (const perm of ALL_PERMISSIONS) {
    if (perm.includes(':')) {
      const [resource] = perm.split(':');
      if (!grouped[resource]) {
        grouped[resource] = [];
      }
      grouped[resource].push(perm);
    }
  }
  
  return grouped;
};

/**
 * Check if a permission string is valid
 */
export const isValidPermission = (perm: string): boolean => {
  if (!perm) return false;
  if (perm === '*') return true;
  return ALL_PERMISSIONS_SET.has(perm);
};
