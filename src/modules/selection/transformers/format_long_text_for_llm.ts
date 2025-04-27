/**
 * Maximum number of words to include before chunking.
 * This value might need tuning based on typical LLM context window limits
 * and performance considerations.
 */
const MAX_WORDS_BEFORE_CHUNKING = 1000;

/**
 * Formats long text for LLM consumption, currently by chunking.
 * It truncates the text to a maximum word count and appends an indicator.
 *
 * @param text The cleaned text content.
 * @returns The potentially chunked text, formatted for the LLM.
 */
export function format_long_text_for_llm(text: string): string {
  const words = text.split(/\s+/);

  if (words.length > MAX_WORDS_BEFORE_CHUNKING) {
    const chunk = words.slice(0, MAX_WORDS_BEFORE_CHUNKING).join(" ");
    // Indicate truncation clearly for the LLM
    return chunk + "\n\n[... Text truncated due to length ...]";
  }

  // If text is not longer than the threshold, return it as is.
  return text;
}
