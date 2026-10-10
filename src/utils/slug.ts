import { CategoryInfo } from '../types';

/**
 * Normalizes any category name or string into a clean, URL-friendly slug.
 * Examples:
 *  "Desk Setup" -> "desk-setup"
 *  "Cable Management" -> "cable-management"
 *  "Gaming Monitors" -> "gaming-monitors"
 *  "Audio Gear & Accessories" -> "audio-gear-accessories"
 */
export function categoryToSlug(categoryName: string): string {
  if (!categoryName) return '';
  return categoryName
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '') // Remove special characters
    .replace(/[\s_]+/g, '-')   // Replace spaces and underscores with single hyphen
    .replace(/--+/g, '-');     // Replace multiple hyphens with single hyphen
}

/**
 * Finds a matching CategoryInfo from a list of categories using a slug or raw name.
 */
export function findCategoryBySlug(
  categories: CategoryInfo[],
  slugOrName: string
): CategoryInfo | undefined {
  if (!slugOrName) return undefined;
  const target = categoryToSlug(slugOrName);
  return categories.find((c) => {
    const cSlug = categoryToSlug(c.slug || c.name);
    const cNameSlug = categoryToSlug(c.name);
    return cSlug === target || cNameSlug === target;
  });
}
