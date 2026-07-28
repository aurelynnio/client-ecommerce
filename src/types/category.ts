import { BaseEntity, PaginationData } from './common';

// Parent category for populated reference
export interface ParentCategory extends BaseEntity {
  name: string;
  slug: string;
  images: string[];
  isActive?: boolean;
}

// Subcategory type (same structure as Category)
export interface SubCategory extends BaseEntity {
  name: string;
  slug: string;
  images: string[];
  isActive?: boolean;
}

// Category interface - matches backend categorySchema
export interface Category extends BaseEntity {
  name: string;
  slug: string;
  description: string; // Has default "" in backend
  images: string[]; // Has default [] in backend

  parentCategory?: ParentCategory | string | null; // Populated or ID, default null

  // Virtuals/Populated (computed on frontend or backend)
  subcategories?: Category[];
  productCount?: number;

  isActive: boolean; // Has default true in backend
}

// Categories response from API
export interface CategoriesResponse {
  data: Category[];
  pagination: PaginationData;
}

// Category filters for listing
export interface CategoryFilters {
  page: number;
  limit: number;
  search: string;
  isActive?: boolean | null;
  parentCategory?: string | null;
  [key: string]: string | number | boolean | null | undefined;
}

// Create category payload
export interface CreateCategoryPayload {
  name: string;
  slug?: string;
  description?: string;
  images?: string[];
  parentCategory?: string | null;
  isActive?: boolean;
}

// Update category payload
export interface UpdateCategoryPayload {
  name?: string;
  slug?: string;
  description?: string;
  images?: string[];
  parentCategory?: string | null;
  isActive?: boolean;
}
