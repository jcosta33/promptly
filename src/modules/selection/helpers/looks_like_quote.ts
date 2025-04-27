/**
 * Check if text looks like a quote
 */
export function looks_like_quote(text: string): boolean {
  // Quote patterns
  const quotePatterns = [
    // Text completely wrapped in quotes
    /^["\u201C\u201D\u2018\u2019']([\s\S]*)["\u201C\u201D\u2018\u2019']$/,
    // Text starting with quote markers
    /^[\s>]*["'\u201C\u201D\u2018\u2019>]\s*\w/,
    // Blockquote format (starts with >)
    /(?:^|\n)>[\s\S]/,
  ];

  // Check for any quote patterns
  return quotePatterns.some((pattern) => {
    return pattern.test(text);
  });
}
