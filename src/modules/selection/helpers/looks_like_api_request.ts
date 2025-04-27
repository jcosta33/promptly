/**
 * Check if text looks like an API request
 */
export function looks_like_api_request(text: string): boolean {
  // API request patterns
  const apiPatterns = [
    // HTTP methods
    /\b(?:GET|POST|PUT|DELETE|PATCH|OPTIONS|HEAD)\s+\//i,
    // URL with query params often seen in requests
    /https?:\/\/[\w.-]+\/[\w\/.-]+\?[\w=&%+.-]+/,
    // cURL commands
    /\bcurl\s+(?:-[\w-]+\s+)*["\']?https?:\/\//i,
    // Common API request headers
    /\b(?:Content-Type|Authorization|Accept|User-Agent):\s+[\w\/\+.-]+/i,
    // API request body indicators (JSON-like)
    /\{\s*"[\w-]+"\s*:\s*(?:"[^"]*"|[\d.]+|true|false|null|\[|\{)/,
    // GraphQL queries
    /\b(?:query|mutation)\s*(?:[\w\s]+\([^)]*\))?\s*\{/,
  ];

  return apiPatterns.some((pattern) => pattern.test(text));
}
