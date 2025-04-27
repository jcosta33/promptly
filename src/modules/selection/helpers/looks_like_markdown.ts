/**
 * Check if text looks like markdown
 */
export function looks_like_markdown(text: string): boolean {
  // Common Markdown patterns
  const markdownPatterns = [
    // Headers
    /^#{1,6}\s+\w/m,
    // Bold/italic
    /\*\*[\w\s]+\*\*|\*[\w\s]+\*|__[\w\s]+__|_[\w\s]+_/,
    // Links
    /\[[\w\s]+\]\(https?:\/\/[^\s)]+\)/,
    // Images
    /!\[[\w\s]*\]\(https?:\/\/[^\s)]+\)/,
    // Code blocks
    /```[\w\s]*\n[\s\S]*?\n```/,
    // Inline code
    /`[\w\s]+`/,
    // Lists
    /(?:^\s*[-*+]\s+\w|^\s*\d+\.\s+\w)/m,
    // Blockquotes
    /^\s*>\s+\w/m,
  ];

  // Count how many markdown patterns are found
  let markdownFeatures = 0;
  for (const pattern of markdownPatterns) {
    if (pattern.test(text)) {
      markdownFeatures++;
    }
  }

  // If at least 2 markdown features are found, consider it markdown
  return markdownFeatures >= 2;
}
