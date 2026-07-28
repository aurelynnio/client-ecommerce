import { BaseEntity } from './common';

// Review user info (populated)
export interface ReviewUser {
  _id: string;
  name: string;
  avatar?: string;
}

// Review interface - matches backend schema
export interface Review extends BaseEntity {
  user: ReviewUser | string;
  product: string;
  order?: string;
  rating: number;
  comment: string;
  images?: string[];
  verified?: boolean;
  helpful?: number;
  reply?: {
    content: string;
    createdAt: string;
  };
}

// Rating breakdown for product reviews
export interface RatingBreakdown {
  5: number;
  4: number;
  3: number;
  2: number;
  1: number;
}

// Reviews response from API
export interface ReviewsResponse {
  reviews: Review[];
  total: number;
  page: number;
  totalPages: number;
  ratingBreakdown?: RatingBreakdown;
}

// Create review payload
export interface CreateReviewPayload {
  productId: string;
  orderId?: string;
  rating: number;
  comment: string;
  images?: string[];
}

// Update review payload
export interface UpdateReviewPayload {
  rating?: number;
  comment?: string;
  images?: string[];
}
