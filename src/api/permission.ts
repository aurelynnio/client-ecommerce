import instance from './api';
import { endpoint_permission } from '@/constants/endpoint';
import { extractApiData } from '@/utils/api';

export interface AllPermissionsResponse {
  permissions: string[];
  grouped: Record<string, string[]>;
  total: number;
}

export interface RolePermissionsResponse {
  rolePermissions: Record<string, string[]>;
}

export interface UserPermissionsResponse {
  user: {
    _id: string;
    username: string;
    email: string;
    roles: string;
  };
  effectivePermissions: string[];
  userPermissions: string[];
  rolePermissions: string[];
}

export interface AuditLogEntry {
  _id: string;
  action: 'grant' | 'revoke';
  adminId: {
    _id: string;
    username: string;
    email: string;
  };
  targetUserId: {
    _id: string;
    username: string;
    email: string;
  };
  permission: string;
  previousPermissions?: string[];
  newPermissions?: string[];
  createdAt: string;
}

export interface AuditLogsResponse {
  logs: AuditLogEntry[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

// Get all available permissions
export const getAllPermissions = async (): Promise<AllPermissionsResponse> => {
  const response = await instance.get(endpoint_permission.getAll, {
    withCredentials: true,
  });
  return extractApiData(response);
};

// Get default permissions for each role
export const getRolePermissions = async (): Promise<RolePermissionsResponse> => {
  const response = await instance.get(endpoint_permission.getRolePermissions, {
    withCredentials: true,
  });
  return extractApiData(response);
};

// Get current user's permissions
export const getMyPermissions = async (): Promise<string[]> => {
  const response = await instance.get(endpoint_permission.getMyPermissions, {
    withCredentials: true,
  });
  const data = extractApiData(response);
  return data?.permissions || [];
};

// Get specific user's permissions (admin only)
export const getUserPermissions = async (userId: string): Promise<UserPermissionsResponse> => {
  const response = await instance.get(endpoint_permission.getUserPermissions(userId), {
    withCredentials: true,
  });
  return extractApiData(response);
};

export interface UpdatePermissionResponse {
  user: {
    _id: string;
    username: string;
    email: string;
    permissions: string[];
  };
}

// Update user's permissions (admin only)
export const updateUserPermissions = async (
  userId: string,
  permissions: string[],
): Promise<UpdatePermissionResponse> => {
  const response = await instance.put(
    endpoint_permission.updateUserPermissions(userId),
    { permissions },
    { withCredentials: true },
  );
  return extractApiData(response);
};

// Grant single permission to user (admin only)
export const grantPermission = async (
  userId: string,
  permission: string,
): Promise<UpdatePermissionResponse> => {
  const response = await instance.post(
    endpoint_permission.grantPermission(userId),
    { permission },
    { withCredentials: true },
  );
  return extractApiData(response);
};

// Revoke single permission from user (admin only)
export const revokePermission = async (
  userId: string,
  permission: string,
): Promise<UpdatePermissionResponse> => {
  const response = await instance.post(
    endpoint_permission.revokePermission(userId),
    { permission },
    { withCredentials: true },
  );
  return extractApiData(response);
};

// Get permission audit logs (admin only)
export const getAuditLogs = async (params?: {
  userId?: string;
  page?: number;
  limit?: number;
}): Promise<AuditLogsResponse> => {
  const response = await instance.get(endpoint_permission.getAuditLogs, {
    params,
    withCredentials: true,
  });
  return extractApiData(response);
};
