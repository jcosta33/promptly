import { type DomainPattern, PageCategory } from "../models/context";
import DOMAIN_MAPPINGS_DATA from './domain_mappings.json';

// Define the type for the imported JSON data explicitly
type DomainMappingEntry = {
  domain: string;
  category: PageCategory;
};

// Assert the type of the imported data
const DOMAIN_MAPPINGS: DomainMappingEntry[] = DOMAIN_MAPPINGS_DATA as DomainMappingEntry[];

/**
 * Domain mappings for categorizing URLs
 *
 * These mappings are used to determine the category of a webpage based on its URL.
 * Simple contains check is performed against the URL.
 */

/**
 * Get the category for a URL
 */
export function get_url_category(url: string): PageCategory {
  // Use a simple contains check for each domain from the imported data
  for (const { domain, category } of DOMAIN_MAPPINGS) {
    if (url.includes(domain)) {
      return category;
    }
  }

  // If no matches, return the general category
  return PageCategory.GENERAL;
}

/**
 * Get all URL categorization patterns for API access
 */
export function get_all_patterns(): DomainPattern[] {
  // Convert imported domain mappings to the DomainPattern format
  return DOMAIN_MAPPINGS.map(({ domain, category }) => ({
    pattern: domain, // Use domain as the pattern string
    category,
    description: `URLs containing ${domain}`,
  }));
}
