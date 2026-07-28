/**
 * Timing Constants
 * Centralized timing configuration for debounce, timeouts, etc.
 */

/**
 * Debounce delay constants (in milliseconds)
 */
export const DEBOUNCE_DELAY = {
  /** 300ms - for search input in header */
  SHORT: 300,
  /** 500ms - for admin table filters */
  MEDIUM: 500,
  /** 1000ms - default debounce */
  LONG: 1000,
} as const;

/**
 * Timeout constants (in milliseconds)
 */
export const TIMEOUT = {
  /** 10 seconds - API request timeout */
  API: 10000,
  /** 3 seconds - toast notification duration */
  TOAST: 3000,
  /** 5 seconds - redirect delay */
  REDIRECT: 5000,
} as const;

/**
 * Animation duration constants (in milliseconds)
 */
export const ANIMATION_DURATION = {
  /** 150ms - fast transitions */
  FAST: 150,
  /** 300ms - normal transitions */
  NORMAL: 300,
  /** 500ms - slow transitions */
  SLOW: 500,
} as const;

export type DebounceDelay = (typeof DEBOUNCE_DELAY)[keyof typeof DEBOUNCE_DELAY];
export type Timeout = (typeof TIMEOUT)[keyof typeof TIMEOUT];
export type AnimationDuration = (typeof ANIMATION_DURATION)[keyof typeof ANIMATION_DURATION];
