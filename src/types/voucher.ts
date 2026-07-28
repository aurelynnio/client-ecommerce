import { BaseEntity, PaginationData } from './common';
import { Shop } from './shop';

// Voucher type enum - matches backend schema
export type VoucherType = 'fixed_amount' | 'percentage';

// Voucher scope enum - matches backend schema
export type VoucherScope = 'shop' | 'platform';

// Voucher interface - matches backend voucherSchema
export interface Voucher extends BaseEntity {
  code: string; // uppercase, unique
  name: string;
  description?: string;

  // Type and value
  type: VoucherType;
  value: number; // 10000 for fixed, 10 for percentage
  maxValue?: number; // Max discount for percentage type

  // Scope
  scope: VoucherScope; // default "shop"
  shopId?: string | Shop; // Required if scope is "shop"

  // Usage limits
  minOrderValue: number; // default 0
  usageLimit: number; // default 1000
  usageCount: number; // default 0
  usageLimitPerUser: number; // default 1
  usedBy: string[]; // Array of User IDs who used this voucher

  // Validity
  startDate: string;
  endDate: string;
  isActive: boolean; // default true
}

// Create voucher payload
export interface CreateVoucherData {
  code: string;
  name: string;
  description?: string;
  type: VoucherType;
  value: number;
  maxValue?: number;
  scope: VoucherScope;
  shopId?: string;
  minOrderValue?: number;
  usageLimit?: number;
  usageLimitPerUser?: number;
  startDate: string;
  endDate: string;
  isActive?: boolean;
}

// Update voucher payload
export interface UpdateVoucherData {
  code?: string;
  name?: string;
  description?: string;
  type?: VoucherType;
  value?: number;
  maxValue?: number;
  scope?: VoucherScope;
  shopId?: string;
  minOrderValue?: number;
  usageLimit?: number;
  usageLimitPerUser?: number;
  startDate?: string;
  endDate?: string;
  isActive?: boolean;
}

// Voucher filters for listing
export interface VoucherFilters {
  page: number;
  limit: number;
  search?: string;
  type?: VoucherType;
  scope?: VoucherScope;
  shopId?: string;
  isActive?: boolean | null;
  [key: string]: string | number | boolean | null | undefined;
}

// Apply voucher result
export interface ApplyVoucherResult {
  voucherId: string;
  code: string;
  discountAmount: number;
  type: VoucherType;
  scope: VoucherScope;
}

export interface AvailableVouchersResponse {
  platform: Voucher[];
  shop: Voucher[];
}

// Voucher state for Redux
export interface VoucherState {
  vouchers: Voucher[];
  currentVoucher: Voucher | null;
  pagination: PaginationData | null;
  isLoading: boolean;
  isCreating: boolean;
  isUpdating: boolean;
  isDeleting: boolean;
  error: string | null;

  // Applied vouchers in checkout
  appliedShopVoucher: ApplyVoucherResult | null;
  appliedPlatformVoucher: ApplyVoucherResult | null;
}

// Voucher statistics
export interface VoucherStatistics {
  totalVouchers: number;
  activeVouchers: number;
  expiredVouchers: number;
  shopVouchers: number;
  platformVouchers: number;
  totalUsage: number;
}
