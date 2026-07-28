import { BaseEntity } from './common';
import { User } from './user';

// Pickup address for shop - all fields optional per backend schema
export interface PickupAddress {
  fullName?: string;
  phone?: string;
  address?: string;
  city?: string;
  district?: string;
  ward?: string;
}

// Shop metrics
export interface ShopMetrics {
  responseRate: number;
  shippingOnTime: number;
  ratingCount: number;
}

// Shop status type
export type ShopStatus = 'active' | 'inactive' | 'banned';

// Shop owner interface for populated owner field
export interface ShopOwner {
  _id: string;
  username: string;
  email: string;
  avatar?: string | null;
}

// Main Shop interface - matches backend schema
export interface Shop extends BaseEntity {
  owner: string | ShopOwner | User; // Can be ID or populated User
  name: string;
  slug: string;
  logo: string;
  banner: string;
  description: string;

  pickupAddress?: PickupAddress;
  status: ShopStatus;

  // Metrics
  rating: number;
  metrics: ShopMetrics;

  // Followers - array of User IDs (matches backend: [{ type: Types.ObjectId, ref: "User" }])
  followers: string[];
  // Follower count - separate field (matches backend: followerCount: { type: Number, default: 0 })
  followerCount: number;
}

// Create shop payload
export interface CreateShopPayload {
  name: string;
  description?: string;
  logo?: string;
  banner?: string;
  pickupAddress?: PickupAddress;
}

// Update shop payload
export interface UpdateShopPayload {
  name?: string;
  description?: string;
  logo?: string;
  banner?: string;
  pickupAddress?: PickupAddress;
  isActive?: boolean;
}

// Shop state for Redux
export interface ShopState {
  myShop: Shop | null;
  currentShop: Shop | null;
  shops: Shop[]; // List of all shops (for admin)
  isLoading: boolean;
  isRegistering: boolean;
  isUpdating: boolean;
  error: string | null;
  // Image upload states
  isUploadingLogo: boolean;
  isUploadingBanner: boolean;
  uploadError: string | null;
}

// Shop filters for listing
export interface ShopFilters {
  page: number;
  limit: number;
  search?: string;
  status?: ShopStatus;
}
