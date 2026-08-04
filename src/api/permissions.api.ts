import instance from './api';
import { ENDPOINT_PERMISSION } from '@/constants/endpoint';
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

export const getAllPermissions = async (): Promise<AllPermissionsResponse> => {
  const response = await instance.get(ENDPOINT_PERMISSION.ROOT, {
    withCredentials: true,
  });
  return extractApiData(response);
};

export const getRolePermissions = async (): Promise<RolePermissionsResponse> => {
  const response = await instance.get(ENDPOINT_PERMISSION.ROLES, {
    withCredentials: true,
  });
  return extractApiData(response);
};

export const getMyPermissions = async (): Promise<string[]> => {
  const response = await instance.get(ENDPOINT_PERMISSION.ME, {
    withCredentials: true,
  });
  const data = extractApiData(response);
  return data?.permissions || [];
};

export const getUserPermissions = async (userId: string): Promise<UserPermissionsResponse> => {
  const response = await instance.get(ENDPOINT_PERMISSION.byUserId(userId), {
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

export const updateUserPermissions = async (
  userId: string,
  permissions: string[],
): Promise<UpdatePermissionResponse> => {
  const response = await instance.put(
    ENDPOINT_PERMISSION.byUserId(userId),
    { permissions },
    { withCredentials: true },
  );
  return extractApiData(response);
};

export const grantPermission = async (
  userId: string,
  permission: string,
): Promise<UpdatePermissionResponse> => {
  const response = await instance.post(
    ENDPOINT_PERMISSION.grant(userId),
    { permission },
    { withCredentials: true },
  );
  return extractApiData(response);
};

export const revokePermission = async (
  userId: string,
  permission: string,
): Promise<UpdatePermissionResponse> => {
  const response = await instance.post(
    ENDPOINT_PERMISSION.revoke(userId),
    { permission },
    { withCredentials: true },
  );
  return extractApiData(response);
};

export const getAuditLogs = async (params?: {
  userId?: string;
  page?: number;
  limit?: number;
}): Promise<AuditLogsResponse> => {
  const response = await instance.get(ENDPOINT_PERMISSION.AUDIT_LOGS, {
    params,
    withCredentials: true,
  });
  return extractApiData(response);
};
