'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { usePermissions } from '@/context/PermissionContext';

/**
 * Props for PermissionGate component
 */
interface PermissionGateProps {
  /** Single permission to check */
  permission?: string;
  /** Multiple permissions to check */
  permissions?: string[];
  /** Mode for checking multiple permissions: 'any' (OR) or 'all' (AND) */
  mode?: 'any' | 'all';
  /** Content to show when user lacks permission */
  fallback?: React.ReactNode;
  /** Children to render when user has permission */
  children: React.ReactNode;
}

/**
 * PermissionGate Component
 * Conditionally renders children based on user permissions
 *
 * @example
 * // Single permission
 * <PermissionGate permission="product:create">
 *   <CreateProductButton />
 * </PermissionGate>
 *
 * @example
 * // Multiple permissions with OR logic
 * <PermissionGate permissions={['product:create', 'product:update']} mode="any">
 *   <ProductActions />
 * </PermissionGate>
 *
 * @example
 * // With fallback
 * <PermissionGate permission="admin:access" fallback={<AccessDenied />}>
 *   <AdminPanel />
 * </PermissionGate>
 */
export const PermissionGate: React.FC<PermissionGateProps> = ({
  permission,
  permissions = [],
  mode = 'all',
  fallback = null,
  children,
}) => {
  const { hasPermission, hasAnyPermission, hasAllPermissions } = usePermissions();

  // Determine which permissions to check
  const permsToCheck = permission ? [permission] : permissions;

  // Check permissions based on mode
  const hasAccess =
    mode === 'any'
      ? hasAnyPermission(permsToCheck)
      : permsToCheck.length === 1
        ? hasPermission(permsToCheck[0])
        : hasAllPermissions(permsToCheck);

  if (!hasAccess) {
    return <>{fallback}</>;
  }

  return <>{children}</>;
};

/**
 * Props for RequirePermission component
 */
interface RequirePermissionProps {
  /** Permission required to access */
  permission: string;
  /** URL to redirect to if unauthorized */
  redirectTo?: string;
  /** Content to show while checking permissions */
  loadingFallback?: React.ReactNode;
  /** Children to render when authorized */
  children: React.ReactNode;
}

/**
 * RequirePermission Component
 * Redirects unauthorized users to specified URL
 *
 * @example
 * <RequirePermission permission="admin:access" redirectTo="/unauthorized">
 *   <AdminDashboard />
 * </RequirePermission>
 */
export const RequirePermission: React.FC<RequirePermissionProps> = ({
  permission,
  redirectTo = '/',
  loadingFallback = null,
  children,
}) => {
  const router = useRouter();
  const { hasPermission, isAuthenticated } = usePermissions();
  const [isChecking, setIsChecking] = React.useState(true);

  React.useEffect(() => {
    // If not authenticated, redirect to login
    if (!isAuthenticated) {
      router.push('/login');
      return;
    }

    // If doesn't have permission, redirect
    if (!hasPermission(permission)) {
      router.push(redirectTo);
      return;
    }

    setIsChecking(false);
  }, [permission, hasPermission, isAuthenticated, redirectTo, router]);

  if (isChecking) {
    return <>{loadingFallback}</>;
  }

  if (!hasPermission(permission)) {
    return null;
  }

  return <>{children}</>;
};

/**
 * Props for RequireRole component
 */
interface RequireRoleProps {
  /** Role(s) required to access */
  roles: string | string[];
  /** URL to redirect to if unauthorized */
  redirectTo?: string;
  /** Children to render when authorized */
  children: React.ReactNode;
}

/**
 * RequireRole Component
 * Redirects users without required role
 *
 * @example
 * <RequireRole roles={['admin', 'seller']} redirectTo="/unauthorized">
 *   <Dashboard />
 * </RequireRole>
 */
export const RequireRole: React.FC<RequireRoleProps> = ({ roles, redirectTo = '/', children }) => {
  const router = useRouter();
  const { role, isAuthenticated } = usePermissions();
  const [isChecking, setIsChecking] = React.useState(true);

  const allowedRoles = React.useMemo(() => (Array.isArray(roles) ? roles : [roles]), [roles]);

  React.useEffect(() => {
    if (!isAuthenticated) {
      router.push('/login');
      return;
    }

    if (!role || !allowedRoles.includes(role)) {
      router.push(redirectTo);
      return;
    }

    setIsChecking(false);
  }, [role, allowedRoles, isAuthenticated, redirectTo, router]);

  if (isChecking || !role || !allowedRoles.includes(role)) {
    return null;
  }

  return <>{children}</>;
};

/**
 * Props for AdminOnly component
 */
interface AdminOnlyProps {
  /** Fallback content for non-admin users */
  fallback?: React.ReactNode;
  /** Children to render for admin users */
  children: React.ReactNode;
}

/**
 * AdminOnly Component
 * Shorthand for checking admin access
 *
 * @example
 * <AdminOnly fallback={<p>Admin access required</p>}>
 *   <AdminControls />
 * </AdminOnly>
 */
export const AdminOnly: React.FC<AdminOnlyProps> = ({ fallback = null, children }) => {
  const { isAdmin } = usePermissions();

  if (!isAdmin) {
    return <>{fallback}</>;
  }

  return <>{children}</>;
};

/**
 * SellerOnly Component
 * Shorthand for checking seller access
 */
export const SellerOnly: React.FC<AdminOnlyProps> = ({ fallback = null, children }) => {
  const { isSeller, isAdmin } = usePermissions();

  // Admin can also access seller features
  if (!isSeller && !isAdmin) {
    return <>{fallback}</>;
  }

  return <>{children}</>;
};

export default PermissionGate;
