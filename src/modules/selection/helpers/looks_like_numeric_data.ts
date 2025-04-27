/**
 * Check if text looks like numeric data
 */
export function looks_like_numeric_data(text: string): boolean {
  // Count numbers vs. total words
  const words = text.split(/\s+/).filter(Boolean);
  if (words.length === 0) return false;
  const numericWords = words.filter((word) => {
    return /^[-+]?\d*\.?\d+(?:[eE][-+]?\d+)?$/.test(word);
  });

  // If more than 50% of words are numbers, consider it numerical data
  if (numericWords.length / words.length > 0.5) {
    return true;
  }

  // Look for statistical or numeric patterns
  const numericPatterns = [
    // Statistical data patterns
    /\b\d+(?:\.\d+)?%\b/, // Percentages
    /\b\d+(?:\.\d+)?\s*(?:kg|g|lb|oz|m|cm|km|mi|ft|in)\b/i, // Measurements
    /\bmean|median|avg|average|std|standard deviation|variance\b/i, // Statistical terms
    /\b\d+\s*×\s*\d+\b/, // Multiplication sign
    /\b\d+\s*±\s*\d+(?:\.\d+)?\b/, // Plus-minus notation
  ];

  // Check for numeric patterns
  return numericPatterns.some((pattern) => {
    return pattern.test(text);
  });
}
