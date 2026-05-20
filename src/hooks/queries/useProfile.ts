/**
 * User/Profile React Query Hooks
 * Replaces userAction.ts async thunks with React Query
 */
import {
  QueryClient,
  useQuery,
  useMutation,
  useQueryClient,
} from "@tanstack/react-query";
import instance from "@/api/api";
import { extractApiData } from "@/api";
import { errorHandler } from "@/services/errorHandler";
import { STALE_TIME } from "@/constants/cache";
import { userKeys } from "@/lib/queryKeys";
import { User } from "@/types/user";
import { Address } from "@/types/address";
import { PaginationData } from "@/types/common";

// ============ Types ============
export interface UserListParams {
  page?: number;
  limit?: number;
  search?: string;
  role?: string;
  isVerifiedEmail?: boolean;
}

export interface UpdateProfileData {
  username?: string;
  email?: string;
  avatar?: string;
}

export type TwoFactorAction = "enable" | "disable";

export interface CreateAddressData {
  fullName: string;
  phone: string;
  address: string;
  city: string;
  district: string;
  ward: string;
  isDefault?: boolean;
}

export interface UpdateAddressData extends Partial<CreateAddressData> {
  addressId: string;
}

export interface CreateUserData {
  username: string;
  email: string;
  phone?: string;
  roles: string;
  isVerifiedEmail: boolean;
  password: string;
  permissions?: string[];
}

export interface UserListStatistics {
  totalUsers: number;
  verifiedUsers: number;
  usersWithAddress: number;
  recentUsers: number;
}

export interface UpdateUserData {
  id: string;
  username: string;
  email: string;
  isVerifiedEmail: boolean;
  roles: string;
  permissions?: string[];
}

function invalidateProfile(queryClient: QueryClient) {
  return queryClient.invalidateQueries({ queryKey: userKeys.profile() });
}

function invalidateAddresses(queryClient: QueryClient) {
  return queryClient.invalidateQueries({ queryKey: userKeys.addresses() });
}

function invalidateUsers(queryClient: QueryClient) {
  return queryClient.invalidateQueries({ queryKey: userKeys.all });
}

function invalidateAddressAndProfile(queryClient: QueryClient) {
  invalidateAddresses(queryClient);
  invalidateProfile(queryClient);
}

// ============ API Functions ============
const userApi = {
  getProfile: async (): Promise<User> => {
    const response = await instance.get("/users/profile");
    return extractApiData(response);
  },

  getAddresses: async (): Promise<Address[]> => {
    const response = await instance.get("/users/addresses");
    return extractApiData(response);
  },

  // Admin: Get all users
  getAll: async (
    params: UserListParams = {}
  ): Promise<{
    users: User[];
    pagination: PaginationData | null;
    statistics: UserListStatistics | null;
  }> => {
    const { page = 1, limit = 10, search, role, isVerifiedEmail } = params;
    const response = await instance.get("/users", {
      params: { page, limit, search, role, isVerifiedEmail },
    });
    const data = extractApiData<{
      data?: User[];
      pagination?: PaginationData;
      statistics?: UserListStatistics;
    }>(response);
    return {
      users: data?.data || [],
      pagination: data?.pagination || null,
      statistics: data?.statistics || null,
    };
  },

  // Mutations
  updateProfile: async (data: UpdateProfileData): Promise<User> => {
    const response = await instance.put("/users/profile", data);
    return extractApiData(response);
  },

  uploadAvatar: async (formData: FormData): Promise<{ avatar: string }> => {
    const response = await instance.post("/users/upload-avatar", formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });
    return extractApiData(response);
  },

  changePassword: async (data: {
    oldPassword: string;
    newPassword: string;
  }): Promise<void> => {
    await instance.put("/users/change-password", data);
  },

  sendTwoFactorCode: async (action: TwoFactorAction): Promise<{
    action: TwoFactorAction;
    email: string;
    expiresIn: string;
  }> => {
    const response = await instance.post("/auth/2fa/send-code", { action });
    return extractApiData(response);
  },

  confirmTwoFactor: async (data: {
    action: TwoFactorAction;
    code: string;
  }): Promise<User> => {
    const response = await instance.post("/auth/2fa/confirm", data);
    return extractApiData(response);
  },

  // Address mutations
  createAddress: async (data: CreateAddressData): Promise<Address> => {
    const response = await instance.post("/users/addresses", data);
    return extractApiData(response);
  },

  updateAddress: async (data: UpdateAddressData): Promise<Address> => {
    const { addressId, ...updateData } = data;
    const response = await instance.put(
      `/users/addresses/${addressId}`,
      updateData
    );
    return extractApiData(response);
  },

  deleteAddress: async (addressId: string): Promise<void> => {
    await instance.delete(`/users/addresses/${addressId}`);
  },

  setDefaultAddress: async (addressId: string): Promise<Address[]> => {
    const response = await instance.put(`/users/addresses/${addressId}/default`);
    return extractApiData(response);
  },

  // Admin mutations
  createUser: async (data: CreateUserData): Promise<User> => {
    const payload = { ...data };
    delete payload.phone;
    const response = await instance.post("/users", payload);
    return extractApiData(response);
  },

  updateUser: async (data: UpdateUserData): Promise<User> => {
    const response = await instance.put("/users", data);
    return extractApiData(response);
  },

  deleteUser: async (userId: string): Promise<void> => {
    await instance.delete(`/users/${userId}`);
  },
};


// ============ Query Hooks ============

/**
 * Get current user profile
 */
export function useProfile(options?: { enabled?: boolean }) {
  return useQuery({
    queryKey: userKeys.profile(),
    queryFn: userApi.getProfile,
    enabled: options?.enabled,
    staleTime: STALE_TIME.VERY_LONG,
  });
}

/**
 * Get user addresses
 */
export function useAddresses(options?: { enabled?: boolean }) {
  return useQuery({
    queryKey: userKeys.addresses(),
    queryFn: userApi.getAddresses,
    enabled: options?.enabled,
    staleTime: STALE_TIME.STATIC,
  });
}

/**
 * Get all users (Admin)
 */
export function useAllUsers(params?: UserListParams) {
  return useQuery({
    queryKey: userKeys.list(params),
    queryFn: () => userApi.getAll(params),
    staleTime: STALE_TIME.LONG,
  });
}

// ============ Profile Mutation Hooks ============

/**
 * Update profile mutation
 */
export function useUpdateProfile() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: userApi.updateProfile,
    onSuccess: (data) => {
      queryClient.setQueryData(userKeys.profile(), data);
    },
    onError: (error) => {
      errorHandler.log(error, { context: "Update profile failed" });
    },
  });
}

/**
 * Upload avatar mutation
 */
export function useUploadAvatar() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: userApi.uploadAvatar,
    onSuccess: () => {
      invalidateProfile(queryClient);
    },
    onError: (error) => {
      errorHandler.log(error, { context: "Upload avatar failed" });
    },
  });
}

/**
 * Change password mutation
 */
export function useChangePassword() {
  return useMutation({
    mutationFn: userApi.changePassword,
    onError: (error) => {
      errorHandler.log(error, { context: "Change password failed" });
    },
  });
}

export function useSendTwoFactorCode() {
  return useMutation({
    mutationFn: userApi.sendTwoFactorCode,
    onError: (error) => {
      errorHandler.log(error, { context: "Send two-factor code failed" });
    },
  });
}

export function useConfirmTwoFactor() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: userApi.confirmTwoFactor,
    onSuccess: (data) => {
      queryClient.setQueryData(userKeys.profile(), data);
    },
    onError: (error) => {
      errorHandler.log(error, { context: "Confirm two-factor failed" });
    },
  });
}

// ============ Address Mutation Hooks ============

/**
 * Create address mutation
 */
export function useCreateAddress() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: userApi.createAddress,
    onSuccess: () => {
      invalidateAddressAndProfile(queryClient);
    },
    onError: (error) => {
      errorHandler.log(error, { context: "Create address failed" });
    },
  });
}

/**
 * Update address mutation
 */
export function useUpdateAddress() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: userApi.updateAddress,
    onSuccess: () => {
      invalidateAddressAndProfile(queryClient);
    },
    onError: (error) => {
      errorHandler.log(error, { context: "Update address failed" });
    },
  });
}

/**
 * Delete address mutation
 */
export function useDeleteAddress() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: userApi.deleteAddress,
    onSuccess: () => {
      invalidateAddressAndProfile(queryClient);
    },
    onError: (error) => {
      errorHandler.log(error, { context: "Delete address failed" });
    },
  });
}

/**
 * Set default address mutation
 */
export function useSetDefaultAddress() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: userApi.setDefaultAddress,
    onSuccess: (data) => {
      queryClient.setQueryData(userKeys.addresses(), data);
      invalidateProfile(queryClient);
    },
    onError: (error) => {
      errorHandler.log(error, { context: "Set default address failed" });
    },
  });
}

// ============ Admin User Mutation Hooks ============

/**
 * Create user mutation (Admin)
 */
export function useCreateUser() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: userApi.createUser,
    onSuccess: () => {
      invalidateUsers(queryClient);
    },
    onError: (error) => {
      errorHandler.log(error, { context: "Create user failed" });
    },
  });
}

/**
 * Update user mutation (Admin)
 */
export function useUpdateUser() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: userApi.updateUser,
    onSuccess: () => {
      invalidateUsers(queryClient);
    },
    onError: (error) => {
      errorHandler.log(error, { context: "Update user failed" });
    },
  });
}

/**
 * Delete user mutation (Admin)
 */
export function useDeleteUser() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: userApi.deleteUser,
    onSuccess: () => {
      invalidateUsers(queryClient);
    },
    onError: (error) => {
      errorHandler.log(error, { context: "Delete user failed" });
    },
  });
}
