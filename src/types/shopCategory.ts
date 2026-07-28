import { BaseEntity } from './common';

// Shop category interface
export interface ShopCategory extends BaseEntity {
  shop: string; // Shop ID
  name: string;
  slug: string;
  description?: string;
  image?: string;
  productCount: number;
  isActive: boolean;
  sortOrder: number;
}

// Create shop category payload
export interface CreateShopCategoryPayload {
  name: string;
  description?: string;
  image?: string;
  sortOrder?: number;
}

// Update shop category payload
export interface UpdateShopCategoryPayload {
  name?: string;
  description?: string;
  image?: string;
  isActive?: boolean;
  sortOrder?: number;
}

// Shop category state for Redux
export interface ShopCategoryState {
  categories: ShopCategory[];
  currentCategory: ShopCategory | null;
  isLoading: boolean;
  isCreating: boolean;
  isUpdating: boolean;
  isDeleting: boolean;
  error: string | null;
}
