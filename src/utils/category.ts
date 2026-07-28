/**
 * Category Utilities
 * Provides helper functions for working with category data structures
 */

import { Category } from '@/types/category';

/**
 * Flattened category for dropdown selection
 */
export interface FlatCategory {
  _id: string;
  name: string;
  displayName: string;
}

/**
 * Flatten nested category tree for dropdown selection
 * Converts hierarchical category structure into flat array with display names
 * showing the full path (e.g., "Electronics > Phones > Smartphones")
 *
 * @param categories - Array of categories (potentially with subcategories)
 * @param prefix - Current path prefix for display name
 * @returns Flat array of categories with display names
 *
 * @example
 * const categories = [
 *   { _id: "1", name: "Electronics", subcategories: [
 *     { _id: "2", name: "Phones", subcategories: [] }
 *   ]}
 * ];
 * const flat = flattenCategories(categories);
 * // Result: [
 * //   { _id: "1", name: "Electronics", displayName: "Electronics" },
 * //   { _id: "2", name: "Phones", displayName: "Electronics > Phones" }
 * // ]
 */
export function flattenCategories(categories: Category[], prefix = ''): FlatCategory[] {
  const result: FlatCategory[] = [];

  categories.forEach((cat) => {
    // Skip invalid categories
    if (!cat._id || !cat.name) return;

    const displayName = prefix ? `${prefix} > ${cat.name}` : cat.name;
    result.push({
      _id: cat._id,
      name: cat.name,
      displayName,
    });

    // Recursively flatten subcategories
    if (cat.subcategories && cat.subcategories.length > 0) {
      result.push(...flattenCategories(cat.subcategories, displayName));
    }
  });

  return result;
}

/**
 * Find a category by ID in a nested category tree
 *
 * @param categories - Array of categories to search
 * @param id - Category ID to find
 * @returns Found category or undefined
 */
export function findCategoryById(categories: Category[], id: string): Category | undefined {
  for (const cat of categories) {
    if (cat._id === id) return cat;

    if (cat.subcategories && cat.subcategories.length > 0) {
      const found = findCategoryById(cat.subcategories, id);
      if (found) return found;
    }
  }

  return undefined;
}

/**
 * Get the full path of a category as an array of category names
 *
 * @param categories - Root categories array
 * @param id - Target category ID
 * @returns Array of category names from root to target, or empty array if not found
 */
export function getCategoryPath(categories: Category[], id: string): string[] {
  function findPath(cats: Category[], targetId: string, path: string[]): string[] | null {
    for (const cat of cats) {
      if (!cat._id || !cat.name) continue;

      const currentPath = [...path, cat.name];

      if (cat._id === targetId) {
        return currentPath;
      }

      if (cat.subcategories && cat.subcategories.length > 0) {
        const found = findPath(cat.subcategories, targetId, currentPath);
        if (found) return found;
      }
    }
    return null;
  }

  return findPath(categories, id, []) || [];
}

/**
 * Get all leaf categories (categories without subcategories)
 *
 * @param categories - Array of categories
 * @returns Array of leaf categories
 */
export function getLeafCategories(categories: Category[]): Category[] {
  const leaves: Category[] = [];

  function collectLeaves(cats: Category[]) {
    for (const cat of cats) {
      if (!cat.subcategories || cat.subcategories.length === 0) {
        leaves.push(cat);
      } else {
        collectLeaves(cat.subcategories);
      }
    }
  }

  collectLeaves(categories);
  return leaves;
}
