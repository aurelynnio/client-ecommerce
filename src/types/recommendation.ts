import { Product } from './product';

// Recommendation sections for homepage
export interface HomepageRecommendations {
  popular: Product[];
  newArrivals: Product[];
  topRated: Product[];
  forYou: Product[];
}

// Recommendation state for Redux
export interface RecommendationState {
  forYou: Product[];
  recentlyViewed: Product[];
  frequentlyBoughtTogether: Product[];
  similar: Product[];
  homepage: HomepageRecommendations | null;
  isLoading: boolean;
  error: string | null;
}
