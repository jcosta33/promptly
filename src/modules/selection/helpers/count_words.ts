/**
 * Count words in text
 *
 * @param text Text to count words in
 * @returns Number of words
 */
export function count_words(text: string): number {
  if (!text) return 0;

  // Split by whitespace and filter out empty strings
  const words = text.split(/\s+/).filter(Boolean);
  return words.length;
}
