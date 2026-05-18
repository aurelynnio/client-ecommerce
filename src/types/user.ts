import { Address } from "./address";
import { BaseEntity, PaginationData } from "./common";

export type UserRole = "user" | "admin" | "seller";
export type AuthProvider = "local" | "google";

export interface User extends BaseEntity {
  username: string;
  email: string;
  roles: UserRole;
  permissions: string[];
  phone?: string;
  avatar: string | null;

  // Relations
  shop?: string | null; // Shop ID if user is a seller, null by default
  wishlist: string[]; // Product IDs - has default [] in schema
  followingShops: string[]; // Shop IDs - has default [] in schema

  // Verification
  isVerifiedEmail: boolean;
  isTwoFactorEnabled: boolean;
  provider: AuthProvider;

  // Addresses
  addresses: Address[];

  // Internal/Transient - verification codes
  codeVerifiEmail?: string;
  expiresCodeVerifiEmail?: string;
  codeVerifiPassword?: string;
  expiresCodeVerifiPassword?: string; // Added - matches backend schema
}

// ============ Admin/Form Types ============

// Create user data for admin
export interface CreateUserData {
  username: string;
  email: string;
  password: string;
  roles: UserRole;
  permissions?: string[];
}

// Update user data for admin
export interface UpdateUserData {
  id: string;
  username?: string;
  email?: string;
  roles?: UserRole;
  permissions?: string[];
  isVerifiedEmail?: boolean;
}

// ============ State & Filters ============

export interface UserState {
  user: User[];
  pagination: PaginationData | null;
  isLoading: boolean;
  error: string | null;
  isUploadingAvatar: boolean;
  isChangingPassword: boolean;
  isUpdatingProfile: boolean;
}

export interface UserFilters {
  page: number;
  limit: number;
  search: string;
  role: string;
  isVerifiedEmail: boolean | null;
  [key: string]: string | number | boolean | null;
}
