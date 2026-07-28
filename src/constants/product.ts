/**
 * Product Constants
 * Shared constants for product-related components and forms
 */

/**
 * Product status options for forms and filters
 */
export const STATUS_OPTIONS = [
  { value: 'draft', label: 'Bản nháp' },
  { value: 'published', label: 'Đang bán' },
  { value: 'suspended', label: 'Tạm ngưng' },
] as const;

/**
 * Product status type derived from STATUS_OPTIONS
 */
export type ProductStatus = (typeof STATUS_OPTIONS)[number]['value'];

/**
 * All possible product statuses including deleted
 */
export type ProductStatusFull = ProductStatus | 'deleted';

/**
 * Status display configuration
 */
export const STATUS_CONFIG: Record<
  ProductStatusFull,
  {
    label: string;
    color: string;
    bgColor: string;
  }
> = {
  draft: {
    label: 'Bản nháp',
    color: 'text-gray-600',
    bgColor: 'bg-gray-100',
  },
  published: {
    label: 'Đang bán',
    color: 'text-green-600',
    bgColor: 'bg-green-100',
  },
  suspended: {
    label: 'Tạm ngưng',
    color: 'text-yellow-600',
    bgColor: 'bg-yellow-100',
  },
  deleted: {
    label: 'Đã xóa',
    color: 'text-red-600',
    bgColor: 'bg-red-100',
  },
};

/**
 * Maximum number of images per variant
 */
export const MAX_VARIANT_IMAGES = 8;

/**
 * Maximum number of description images per product
 */
export const MAX_DESCRIPTION_IMAGES = 20;

/**
 * Maximum number of product gallery images
 */
export const MAX_GALLERY_IMAGES = 10;

/**
 * Default currency
 */
export const DEFAULT_CURRENCY = 'VND';

/**
 * Sort options for product listing
 */
export const SORT_OPTIONS = [
  { value: 'createdAt:desc', label: 'Mới nhất' },
  { value: 'createdAt:asc', label: 'Cũ nhất' },
  { value: 'price:asc', label: 'Giá thấp đến cao' },
  { value: 'price:desc', label: 'Giá cao đến thấp' },
  { value: 'soldCount:desc', label: 'Bán chạy nhất' },
  { value: 'ratingAverage:desc', label: 'Đánh giá cao nhất' },
  { value: 'name:asc', label: 'Tên A-Z' },
  { value: 'name:desc', label: 'Tên Z-A' },
] as const;

/**
 * Sort option type
 */
export type SortOption = (typeof SORT_OPTIONS)[number]['value'];

/**
 * Default pagination settings
 */
export const DEFAULT_PAGINATION = {
  page: 1,
  limit: 20,
} as const;

/**
 * Variant attribute labels (Vietnamese)
 */
export const VARIANT_ATTRIBUTE_LABELS = {
  color: 'Màu sắc',
  size: 'Kích thước',
  material: 'Chất liệu',
} as const;
