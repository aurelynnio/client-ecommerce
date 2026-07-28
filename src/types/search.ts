import { Product, Category } from './product';
import { Shop } from './shop';
import { PaginationData } from './common';

// Search suggestions response
export interface SearchSuggestions {
  products: {
    _id: string;
    name: string;
    slug: string;
    images: string[];
    price: Product['price'];
  }[];
  categories: Pick<Category, '_id' | 'name' | 'slug'>[];
  shops: Pick<Shop, '_id' | 'name' | 'slug' | 'logo'>[];
}

// Trending search item
export interface TrendingSearch {
  keyword: string;
  type: 'product' | 'category' | 'shop';
}

// Search facets for filtering
export interface SearchFacets {
  priceRanges: Array<{
    _id: number | string;
    count: number;
  }>;
  categories: Array<{
    _id: string;
    name: string;
    slug: string;
    count: number;
  }>;
  ratings: Array<{
    _id: number | string;
    count: number;
  }>;
}

// Advanced search response
export interface SearchResponse {
  data: Product[];
  pagination: PaginationData;
  facets: SearchFacets;
}

// Search params
export interface SearchParams {
  q?: string;
  category?: string;
  minPrice?: number;
  maxPrice?: number;
  rating?: number;
  sort?: 'relevance' | 'price_asc' | 'price_desc' | 'newest' | 'bestselling' | 'rating';
  page?: number;
  limit?: number;
}

// Search state for Redux
export interface SearchState {
  suggestions: SearchSuggestions | null;
  trending: TrendingSearch[];
  hotKeywords: string[];
  results: Product[];
  facets: SearchFacets | null;
  pagination: PaginationData | null;
  isLoading: boolean;
  isSuggestionsLoading: boolean;
  error: string | null;
  recentSearches: string[];
}
