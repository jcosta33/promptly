/**
 * Check if text looks like a citation
 */
export function looks_like_citation(text: string): boolean {
  // Citation patterns
  const citationPatterns = [
    // Academic citation patterns
    /\((?:(?:[A-Z][a-z]+,?\s)+(?:et al\.?)?(?:,\s\d{4}|\s\(\d{4}\)))\)/,
    // Reference list entry
    /^[A-Z][a-z]+,\s[A-Z]\.\s(?:(?:&|and)\s[A-Z][a-z]+,\s[A-Z]\.\s)?(?:\(\d{4}\)|\d{4})\.?\s/,
    // DOI
    /\bdoi:10\.\d{4,}\//i,
    // ISBN
    /\bISBN(?:-13|-10)?:?\s\d[-\s\d]{10,}/i,
    // Footnote or citation number
    /^\s*\[\d+\]|^\d+\.?\s|^\[[a-z]+\]/i, // Handles [1], 1., [a], etc. at start or end
  ];

  return citationPatterns.some((pattern) => {
    return pattern.test(text.trim());
  });
}
