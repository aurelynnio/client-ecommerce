/**
 * Centralized Error Handler Service
 * Provides consistent error handling across the application
 */

import { toast } from 'sonner';
import { extractApiError } from '@/utils/api';
import type { ApiError } from '@/utils/api';

export type { ApiError } from '@/utils/api';

export interface ErrorHandlerOptions {
  silent?: boolean;
  context?: string;
}

function extractError(error: unknown): ApiError {
  return extractApiError(error);
}

export const errorHandler = {
  log(error: unknown, options: ErrorHandlerOptions = {}): void {
    if (process.env.NODE_ENV !== 'production' && !options.silent) {
      const context = options.context ? `[${options.context}]` : '[Error]';
      console.error(`${context}:`, error);
    }
  },

  extract(error: unknown): ApiError {
    return extractError(error);
  },

  notify(error: unknown, message?: string): void {
    const apiError = extractError(error);
    toast.error(message || apiError.message);
  },

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
