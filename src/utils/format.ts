/**
 * Format Utilities
 * Centralized formatting functions for consistent display
 */

/**
 * Format number as Vietnamese currency
 * @param value - Number to format
 * @returns Formatted currency string with ₫ symbol
 * @example formatCurrency(1000000) => "₫1.000.000"
 */
export function formatCurrency(value: number): string {
  return `₫${value.toLocaleString('vi-VN')}`;
}

/**
 * Format date to Vietnamese locale
 * @param date - Date string or Date object
 * @param options - Intl.DateTimeFormatOptions
 * @returns Formatted date string
 */
export function formatDate(
  date: string | Date,
  options: Intl.DateTimeFormatOptions = {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  },
): string {
  return new Date(date).toLocaleDateString('vi-VN', options);
}
