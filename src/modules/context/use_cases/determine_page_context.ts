import { type PageContext } from "../models/context";
import { get_url_category } from "../repositories/context_repository";

/**
 * Extract the domain from a URL
 */
function extract_domain(url: string): string {
  try {
    const urlObj = new URL(url);
    return urlObj.hostname;
  } catch (error) {
    // console.error("Error parsing URL:", error);

    // Fallback: try to extract domain with regex
    const match = url.match(
      /^(?:https?:\/\/)?(?:[^@\n]+@)?(?:www\.)?([^:/\n?]+)/i
    );
    return match ? match[1] : url;
  }
}

/**
 * Determine the context of a webpage based on its URL and optionally its title
 *
 * @param url The URL of the page to categorize
 * @param pageTitle Optional title of the page for additional context
 * @returns PageContext object containing the category and metadata
 */
export function determine_page_context(
  url: string,
  pageTitle?: string
): PageContext {
  const category = get_url_category(url);
  const domain = extract_domain(url);

  return {
    category,
    url,
    domain,
    pageTitle,
  };
}
