import { BaseEntity } from './common';

// Banner theme type
export type BannerTheme = 'light' | 'dark';

// Banner item interface - matches backend bannerSchema
export interface BannerItem extends BaseEntity {
  imageUrl: string;
  title: string;
  subtitle: string;
  link: string; // Has default "" in backend, not optional
  theme: BannerTheme;
  isActive: boolean;
  order: number;
}

// Alias for backward compatibility
export type Banner = BannerItem;

// Create banner payload
export interface CreateBannerPayload {
  title: string;
  subtitle: string;
  imageUrl?: string;
  theme: BannerTheme;
  isActive: boolean;
  order: number;
  link?: string;
  imageFile: File; // For creation, file is required
}

// Update banner payload
export interface UpdateBannerPayload {
  title?: string;
  subtitle?: string;
  imageUrl?: string;
  theme?: BannerTheme;
  isActive?: boolean;
  order?: number;
  link?: string;
  imageFile?: File | null; // For update, file is optional
}
