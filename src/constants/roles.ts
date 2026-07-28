/**
 * User Role Constants
 * Centralized role definitions for type-safe role checking
 */

export const USER_ROLES = {
  ADMIN: 'admin',
  SELLER: 'seller',
  USER: 'user',
} as const;

export type UserRole = (typeof USER_ROLES)[keyof typeof USER_ROLES];

/**
 * Check if a role is admin
 */
export function isAdmin(role: string): boolean {
  return role === USER_ROLES.ADMIN;
}

/**
 * Check if a role is seller
 */
export function isSeller(role: string): boolean {
  return role === USER_ROLES.SELLER;
}
