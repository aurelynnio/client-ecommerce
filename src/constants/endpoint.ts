/**
 * API Endpoint Constants
 * Centralized endpoint definitions for API calls
 */

export const ENDPOINT_AUTH = {
  LOGIN: '/auth/login',
  REGISTER: '/auth/register',
  REFRESH: '/auth/refresh-token',
  LOGOUT: '/auth/logout',
} as const;

export const ENDPOINT_PERMISSION = {
  GET_ALL: '/permissions',
  GET_ROLE_PERMISSIONS: '/permissions/roles',
  GET_MY_PERMISSIONS: '/permissions/me',
  getUserPermissions: (userId: string) => `/permissions/user/${userId}`,
  updateUserPermissions: (userId: string) => `/permissions/user/${userId}`,
  grantPermission: (userId: string) => `/permissions/user/${userId}/grant`,
  revokePermission: (userId: string) => `/permissions/user/${userId}/revoke`,
  GET_AUDIT_LOGS: '/permissions/audit',
} as const;

// Legacy exports for backward compatibility
export const enpoint_auth = ENDPOINT_AUTH;
export const endpoint_permission = {
  getAll: ENDPOINT_PERMISSION.GET_ALL,
  getRolePermissions: ENDPOINT_PERMISSION.GET_ROLE_PERMISSIONS,
  getMyPermissions: ENDPOINT_PERMISSION.GET_MY_PERMISSIONS,
  getUserPermissions: ENDPOINT_PERMISSION.getUserPermissions,
  updateUserPermissions: ENDPOINT_PERMISSION.updateUserPermissions,
  grantPermission: ENDPOINT_PERMISSION.grantPermission,
  revokePermission: ENDPOINT_PERMISSION.revokePermission,
  getAuditLogs: ENDPOINT_PERMISSION.GET_AUDIT_LOGS,
};
