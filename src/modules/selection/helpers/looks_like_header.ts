/**
 * Check if text looks like a header/heading
 */
export function looks_like_header(text: string): boolean {
  // Header patterns (for text-based detection)
  const headerPatterns = [
    // Markdown headers
    /^#{1,6}\s+\w/m,
    // Underlined headers
    /^[^\n]+\n[=\-]{3,}$/m,
    // All caps short text
    /^[A-Z][A-Z0-9 \t,.;:!?-]{0,60}$/,
  ];

  return headerPatterns.some((pattern) => {
    return pattern.test(text);
  });
}
