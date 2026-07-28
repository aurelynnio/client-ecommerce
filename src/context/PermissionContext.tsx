'use client';

import React, { createContext, useContext, useMemo, useCallback } from 'react';
import { useAppSelector } from '@/hooks/hooks';

/**
 * Permission Context Type Definition
 */
interface PermissionContextType {
  /** Array of user's effective permissions */
  permissions: string[];
  /** Check if user has a specific permission */
  hasPermission: (permission: string) => boolean;
  /** Check if user has any of the specified permissions (OR logic) */
  hasAnyPermission: (permissions: string[]) => boolean;
  /** Check if user has all specified permissions (AND logic) */
  hasAllPermissions: (permissions: string[]) => boolean;
  /** Check if user can access a resource with specific action */
  canAccess: (resource: string, action: string) => boolean;
  /** Check if user is admin */
  isAdmin: boolean;
  /** Check if user is seller */
  isSeller: boolean;
  /** Check if user is authenticated */
  isAuthenticated: boolean;
  /** User's role */
  role: string | null;
}

const PermissionContext = createContext<PermissionContextType | null>(null);

/**
 * Permission Provider Component
 * Provides permission checking functionality to child components
 */
export const PermissionProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { data, isAuthenticated } = useAppSelector((state) => state.auth);

  // Get permissions from user object
  const permissions = useMemo(() => {
    return data?.permissions || [];
  }, [data?.permissions]);

  // Get user role
  const role = useMemo(() => {
    return data?.roles || null;
  }, [data?.roles]);

  /**
   * Check if user has a specific permission
   */
  const hasPermission = useCallback(
    (permission: string): boolean => {
      // Admin has all permissions
      if (permissions.includes('*')) return true;

      // Check for exact match
      if (permissions.includes(permission)) return true;

      // Check for manage permission (grants all CRUD)
      const [resource] = permission.split(':');
      if (permissions.includes(`${resource}:manage`)) return true;

      return false;
    },
    [permissions],
  );

  /**
   * Check if user has any of the specified permissions (OR logic)
   */
  const hasAnyPermission = useCallback(
    (perms: string[]): boolean => {
      if (!perms || perms.length === 0) return false;
      return perms.some((p) => hasPermission(p));
    },
    [hasPermission],
  );

  /**
   * Check if user has all specified permissions (AND logic)
   */
  const hasAllPermissions = useCallback(
    (perms: string[]): boolean => {
      if (!perms || perms.length === 0) return false;
      return perms.every((p) => hasPermission(p));
    },
    [hasPermission],
  );

  /**
   * Check if user can access a resource with specific action
   */
  const canAccess = useCallback(
    (resource: string, action: string): boolean => {
      return hasPermission(`${resource}:${action}`);
    },
    [hasPermission],
  );

  // Computed properties
  const isAdmin = role === 'admin';
  const isSeller = role === 'seller';

  const value: PermissionContextType = useMemo(
    () => ({
      permissions,
      hasPermission,
      hasAnyPermission,
      hasAllPermissions,
      canAccess,
      isAdmin,
      isSeller,
      isAuthenticated: !!isAuthenticated,
      role,
    }),
    [
      permissions,
      hasPermission,
      hasAnyPermission,
      hasAllPermissions,
      canAccess,
      isAdmin,
      isSeller,
      isAuthenticated,
      role,
    ],
  );

  return <PermissionContext.Provider value={value}>{children}</PermissionContext.Provider>;
};

/**
 * Hook to access permission context
 * @throws Error if used outside PermissionProvider
 */
export const usePermissions = (): PermissionContextType => {
  const context = useContext(PermissionContext);
  if (!context) {
    throw new Error('usePermissions must be used within PermissionProvider');
  }
  return context;
};

export default PermissionContext;
