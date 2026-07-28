/**
 * Centralized Error Handler Service
 * Provides consistent error handling across the application
 */

import { toast } from 'sonner';
import { extractApiError } from '@/utils/api';
import type { ApiError } from '@/utils/api';

/**
 * Standard API error structure
 */
export type { ApiError } from '@/utils/api';

/**
 * Options for error logging
 */
export interface ErrorHandlerOptions {
  /** Suppress console output */
  silent?: boolean;
  /** Context identifier for the error */
  context?: string;
}

/**
 * Extract error message from various error formats
 */
function extractError(error: unknown): ApiError {
  return extractApiError(error);
}

/**
 * Centralized error handler
 */
export const errorHandler = {
  /**
   * Log error to console (suppressed in production)
   */
  log(error: unknown, options: ErrorHandlerOptions = {}): void {
    if (process.env.NODE_ENV !== 'production' && !options.silent) {
      const context = options.context ? `[${options.context}]` : '[Error]';
      console.error(`${context}:`, error);
    }
    // Future: Send to error tracking service (Sentry, etc.)
  },

  /**
   * Extract structured error from unknown error
   */
  extract(error: unknown): ApiError {
    return extractError(error);
  },

  /**
   * Log error and show toast notification
   */
  notify(error: unknown, message?: string): void {
    const apiError = extractError(error);
    toast.error(message || apiError.message);
  },

  /**
   * Log error with context and optionally notify user
   */
  handle(
    error: unknown,
    options: ErrorHandlerOptions & { notify?: boolean; notifyMessage?: string } = {},
  ): ApiError {
    const apiError = extractError(error);

    this.log(error, options);

    if (options.notify) {
      toast.error(options.notifyMessage || apiError.message);
    }

    return apiError;
  },
};

export default errorHandler;
