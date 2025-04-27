/**
 * Check if text looks like a URL
 */
export function looks_like_url(text: string): boolean {
  // Basic check for common URL characters and structure
  if (!text.includes(".") || text.includes(" ") || text.length < 4) {
    return false;
  }

  // Check for common protocols or www.
  if (/^(https?:\/\/|www\.)/i.test(text)) {
    return true;
  }

  // Check for domain-like structure (letters/numbers, dot, letters/numbers)
  if (/^[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}(\/\S*)?$/.test(text)) {
    return true;
  }

  return false;
}
