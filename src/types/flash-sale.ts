import { Product } from './product';

import { PaginationData } from './common';

// Flash sale info for a product
export interface FlashSaleInfo {
  originalPrice: number;
  salePrice: number;
  discount: number;
  soldCount: number;
  totalStock: number;
  soldPercent: number;
  endTime: string;
  remainingSeconds: number;
}

// Flash sale product (product with flash sale info)
export interface FlashSaleProduct extends Product {
  flashSaleInfo: FlashSaleInfo;
}

// Flash sale time slot
export interface FlashSaleSlot {
  startTime: string;
  endTime: string;
  status: 'upcoming' | 'active' | 'ended';
  label: string;
}

// Flash sale response
export interface FlashSaleResponse {
  data: FlashSaleProduct[];
  pagination: PaginationData;
  saleInfo: {
    currentTime: string;
    nextSaleTime: string;
  };
}

// Flash sale by slot response
export interface FlashSaleSlotResponse {
  timeSlot: string;
  startTime: string;
  endTime: string;
  products: FlashSaleProduct[];
}

// Flash sale state for Redux
export interface FlashSaleState {
  products: FlashSaleProduct[];
  schedule: FlashSaleSlot[];
  pagination: PaginationData | null;
  currentSlot: FlashSaleSlotResponse | null;
  nextSaleTime: string | null;
  isLoading: boolean;
  error: string | null;
}

// Add to flash sale payload (for sellers)
export interface AddToFlashSalePayload {
  salePrice: number;
  discountPercent?: number;
  stock: number;
  startTime: string;
  endTime: string;
}
