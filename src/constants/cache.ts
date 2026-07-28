/**
 * Cache Time Constants
 * Centralized cache configuration for React Query
 */

/**
 * Stale time constants (how long data is considered fresh)
 */
export const STALE_TIME = {
  /** 30 seconds - for frequently changing data (flash sales, notifications) */
  SHORT: 30 * 1000,
  /** 1 minute - for moderately changing data (search results) */
  MEDIUM: 1 * 60 * 1000,
  /** 2 minutes - for standard data (product lists, orders) */
  LONG: 2 * 60 * 1000,
  /** 5 minutes - for slowly changing data (product details, reviews) */
  VERY_LONG: 5 * 60 * 1000,
  /** 10 minutes - for rarely changing data (categories, featured products) */
  STATIC: 10 * 60 * 1000,
  /** 30 minutes - for very rarely changing data (category tree) */
  VERY_STATIC: 30 * 60 * 1000,
} as const;

/**
 * Garbage collection time constants (how long unused data stays in cache)
 */
export const GC_TIME = {
  /** 30 minutes - default cache retention */
  DEFAULT: 30 * 60 * 1000,
  /** 1 hour - for important data */
  LONG: 60 * 60 * 1000,
} as const;

/**
 * Refetch interval constants (for polling)
 */
export const REFETCH_INTERVAL = {
  /** 30 seconds - for real-time data (flash sales) */
  FAST: 30 * 1000,
  /** 1 minute - for notifications, cart updates */
  NORMAL: 60 * 1000,
  /** 5 minutes - for dashboard stats */
  SLOW: 5 * 60 * 1000,
} as const;

export type StaleTime = (typeof STALE_TIME)[keyof typeof STALE_TIME];
export type GcTime = (typeof GC_TIME)[keyof typeof GC_TIME];
export type RefetchInterval = (typeof REFETCH_INTERVAL)[keyof typeof REFETCH_INTERVAL];
