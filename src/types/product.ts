import { BaseEntity, PaginationData } from './common';
import { Shop } from './shop';
import { ShopCategory } from './shopCategory';

export interface Category {
  _id: string;
  name: string;
  slug: string;
}

export interface Price {
  currentPrice: number;
  discountPrice?: number | null;
  currency: string;
}

export interface ProductAttribute {
  name: string;
  value: string;
}

export interface ProductDimensions {
  height?: number;
  width?: number;
  length?: number;
}

export interface FlashSaleInfo {
  isActive: boolean;
  salePrice?: number;
  discountPercent?: number;
  stock?: number;
  soldCount?: number;
  startTime?: string;
  endTime?: string;
}

export interface Variant {
  _id: string;
  name: string;
  sku?: string;
  color?: string;
  price: number;
  stock: number;
  sold?: number;
  images: string[];
}

export type ProductStatus = 'draft' | 'published' | 'suspended' | 'deleted';

export interface Product extends BaseEntity {
  name: string;
  slug: string;
  description: string;

  shop: Shop | string;
  category: Category | null;
  shopCategory?: ShopCategory | string;

  brand?: string;
  tags?: string[];

  sizes: string[];

  descriptionImages: string[];
  video?: string;

  price: Price;
  stock: number;
  soldCount: number;

  variants: Variant[];

  shippingTemplate?: string;
  weight: number;
  dimensions?: ProductDimensions;

  attributes: ProductAttribute[];

  ratingAverage: number;
  reviewCount: number;

  flashSale?: FlashSaleInfo;

  isFeatured: boolean;
  isNewArrival: boolean;
  status: ProductStatus;

  onSale?: boolean;
  isActive?: boolean;
  effectivePrice?: number;
}

// ============ Helpers ============

export function getVariantDisplay(variant: Variant): string {
  if (variant.name) return variant.name;
  if (variant.color) return variant.color;
  return 'Mặc định';
}

export interface ProductState {
  all: Product[];
  featured: Product[];
  newArrivals: Product[];
  onSale: Product[];
  byCategory: Product[];
  currentProduct: Product | null;
  pagination: PaginationData | null;
  isLoading: boolean;
  error: string | null;
  searchResults: Product[];
  isSearching: boolean;
  searchError: string | null;
  related: Product[];
}

export interface ProductFilters {
  search: string;
  minPrice: number;
  maxPrice: number;
  rating: number[];
  colors: string[];
  sizes: string[];
  sortBy: string;
}

export interface AdminProductFilters {
  page: number;
  limit: number;
  search: string;
  category: string;
  brand: string;
  minPrice: number | null;
  maxPrice: number | null;
  isActive: boolean | null;
  [key: string]: string | number | boolean | null;
}

export interface ProductUrlFilters {
  search: string;
  minPrice: number;
  maxPrice: number;
  rating: string;
  colors: string;
  sizes: string;
  sortBy: string;
  [key: string]: string | number | boolean | null;
}

export interface VariantFormCreate {
  _id: string;
  name: string;
  color?: string;
  price: number;
  stock: number;
  sold?: number;
  images: {
    files: File[];
    previews: string[];
  };
}

export interface VariantFormUpdate {
  _id: string;
  name: string;
  color?: string;
  price: number;
  stock: number;
  sold?: number;
  images: {
    existing: string[];
    newFiles: File[];
    newPreviews: string[];
  };
}

export type VariantForm = VariantFormCreate | VariantFormUpdate;
