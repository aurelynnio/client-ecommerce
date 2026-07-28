import { Product } from './product';
import { PaginationData } from './common';

// Wishlist item (product in wishlist)
export type WishlistItem = Product;

// Wishlist response from API
export interface WishlistResponse {
  data: WishlistItem[];
  pagination: PaginationData;
}

// Wishlist state for Redux
export interface WishlistState {
  items: WishlistItem[];
  pagination: PaginationData | null;
  isLoading: boolean;
  error: string | null;
  count: number;
  // Map of productId -> boolean for quick lookup
  wishlistMap: Record<string, boolean>;
}

// Add to wishlist response
export interface AddToWishlistResponse {
  message: string;
  productId: string;
  wishlistCount: number;
}

// Check wishlist response
export interface CheckWishlistResponse {
  isInWishlist: boolean;
}

// Check multiple response
export interface CheckMultipleWishlistResponse {
  [productId: string]: boolean;
}
