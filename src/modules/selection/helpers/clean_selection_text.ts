/**
 * Clean selection text by removing unwanted patterns and normalizing whitespace
 *
 * @param text Text to clean
 * @returns Cleaned text
 */
export function clean_selection_text(text: string): string {
  if (!text) return "";

  let cleanedText = text;

  // Common patterns to remove (e.g., UI elements and artifacts)
  const patternsToRemove = [
    /^\s*Show more\s*$/i,
    /^\s*Reply\s*$/i,
    /^\s*Share\s*$/i,
    /^\s*Like\s*$/i,
    /^\s*Comment\s*$/i,
    /^\s*Retweet\s*$/i,
  ];

  // Apply removal patterns
  for (const pattern of patternsToRemove) {
    cleanedText = cleanedText.replace(pattern, "");
  }

  // Normalize whitespace - replace multiple consecutive spaces/tabs with a single space
  cleanedText = cleanedText.replace(/[ \t]+/g, " ");

  // Preserve paragraph breaks but normalize them
  cleanedText = cleanedText.replace(/\n{3,}/g, "\n\n"); // Replace 3+ newlines with 2

  // Trim leading/trailing whitespace
  cleanedText = cleanedText.trim();

  return cleanedText;
}
