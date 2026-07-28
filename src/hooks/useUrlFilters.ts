import { useRouter, useSearchParams } from 'next/navigation';
import { useCallback, useMemo } from 'react';

/**
 * Type for filter values - can be string, number, boolean, or undefined
 */
export type FilterValue = string | number | boolean | null | undefined;

/**
 * Generic filter object type
 */
export type Filters = Record<string, FilterValue>;

/**
 * Options for the useUrlFilters hook
 */
interface UseUrlFiltersOptions<T extends Filters> {
  /**
   * Default filter values
   */
  defaultFilters: T;
  /**
   * Base path for the router (e.g., '/admin/products')
   */
  basePath?: string;
}

/**
 * Custom hook to manage URL parameters for filters and search
 *
 * @example
 * ```tsx
 * const { filters, updateFilter, updateFilters, resetFilters } = useUrlFilters({
 *   defaultFilters: {
 *     search: '',
 *     category: '',
 *     page: 1,
 *     limit: 10,
 *   }
 * });
 *
 * // Update single filter
 * updateFilter('search', 'laptop');
 *
 * // Update multiple filters
 * updateFilters({ category: 'electronics', page: 1 });
 *
 * // Reset all filters
 * resetFilters();
 * ```
 */
export function useUrlFilters<T extends Filters>({
  defaultFilters,
  basePath,
}: UseUrlFiltersOptions<T>) {
  const router = useRouter();
  const searchParams = useSearchParams();

  /**
   * Parse URL parameters and merge with defaults
   */
  const filters = useMemo(() => {
    const parsed: Filters = { ...defaultFilters };

    Object.keys(defaultFilters).forEach((key) => {
      const urlValue = searchParams.get(key);

      if (urlValue !== null) {
        const defaultValue = defaultFilters[key];

        // Parse based on default value type
        if (typeof defaultValue === 'number') {
          parsed[key] = Number(urlValue);
        } else if (typeof defaultValue === 'boolean') {
          parsed[key] = urlValue === 'true';
        } else if (defaultValue === null) {
          // For nullable fields, parse as string or specific value
          if (urlValue === 'true') parsed[key] = true;
          else if (urlValue === 'false') parsed[key] = false;
          else parsed[key] = urlValue;
        } else {
          parsed[key] = urlValue;
        }
      }
    });

    return parsed as T;
  }, [searchParams, defaultFilters]);

  /**
   * Create URL search params from filter object
   * Excludes empty, null, undefined values and values equal to defaults
   */
  const createSearchParams = useCallback(
    (newFilters: Partial<T>): URLSearchParams => {
      const params = new URLSearchParams();

      Object.entries(newFilters).forEach(([key, value]) => {
        const defaultValue = defaultFilters[key as keyof T];

        // Skip if value is empty, null, undefined, or equals default
        if (value === undefined || value === null || value === '' || value === defaultValue) {
          return;
        }

        // Add to params
        params.set(key, String(value));
      });

      return params;
    },
    [defaultFilters],
  );

  /**
   * Update URL with new filter values
   */
  const updateUrl = useCallback(
    (newFilters: Partial<T>) => {
      const mergedFilters = { ...filters, ...newFilters };
      const params = createSearchParams(mergedFilters);
      const queryString = params.toString();
      const url = basePath || window.location.pathname;

      router.push(queryString ? `${url}?${queryString}` : url, { scroll: false });
    },
    [filters, createSearchParams, router, basePath],
  );

  /**
   * Update a single filter
   */
  const updateFilter = useCallback(
    (key: keyof T, value: FilterValue) => {
      updateUrl({ [key]: value } as Partial<T>);
    },
    [updateUrl],
  );

  /**
   * Update multiple filters at once
   */
  const updateFilters = useCallback(
    (newFilters: Partial<T>) => {
      updateUrl(newFilters);
    },
    [updateUrl],
  );

  /**
   * Reset all filters to defaults
   */
  const resetFilters = useCallback(() => {
    const url = basePath || window.location.pathname;
    router.push(url);
  }, [router, basePath]);

  /**
   * Get query string from current filters
   */
  const getQueryString = useCallback((): string => {
    return createSearchParams(filters).toString();
  }, [filters, createSearchParams]);

  return {
    /**
     * Current filter values parsed from URL
     */
    filters,
    /**
     * Update a single filter value
     */
    updateFilter,
    /**
     * Update multiple filter values at once
     */
    updateFilters,
    /**
     * Reset all filters to default values
     */
    resetFilters,
    /**
     * Get current query string
     */
    getQueryString,
    /**
     * Create search params object from filters
     */
    createSearchParams,
  };
}
