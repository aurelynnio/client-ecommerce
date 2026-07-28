/**
 * API Module - Barrel Export
 * Centralized exports for all API-related utilities
 */

// Axios instance
export { default as api, injectStore } from './api';

// API utilities
export {
  extractApiData,
  extractPaginatedData,
  extractApiError,
  getSafeErrorMessage,
  getLocalizedError,
  ERROR_MESSAGES,
} from '../utils/api';

// Types
export type { ApiResponse, PaginationMeta, PaginatedResponse, ApiError } from '../utils/api';
