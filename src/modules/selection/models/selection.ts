/**
 * Represents the structural context of the selection based on surrounding HTML elements.
 */
export const SelectionContextType = {
  TABLE: "table", // Selected within <table>
  LIST: "list", // Selected within <ul> or <ol>
  CODE_BLOCK: "code_block", // Selected within <pre> or a block-level <code>
  MATH: "math", // Selected within <math>
  QUOTE: "quote", // Selected within <blockquote>
  HEADER: "header", // Selected within <h1>-<h6>
  DEFINITION_LIST: "definition_list", // Selected within <dl>
  LINK: "link", // The entire selection is the content of an <a> tag
  GENERAL: "general", // Default for <p>, <div>, <span>, or mixed content
  INPUT: "input", // Selected within an <input> or <textarea>
} as const;

export type SelectionContextType =
  (typeof SelectionContextType)[keyof typeof SelectionContextType];

/**
 * Represents the type of data the selected text content itself contains.
 */
export const SelectionDataType = {
  WORD: "word", // Few words, no sentence structure
  SENTENCE: "sentence", // A single complete sentence
  PARAGRAPH: "paragraph", // Multi-sentence text block
  LONG_TEXT: "long_text", // Exceeds a certain word/char count
  CODE_LIKE: "code_like", // Contains syntax suggestive of code (brackets, operators etc)
  JSON: "json", // Parsable JSON structure
  LATEX: "latex", // Contains LaTeX math delimiters like \( or $$
  URL: "url", // Matches a URL pattern
  EMAIL: "email", // Matches an email pattern
  MARKDOWN: "markdown", // Contains Markdown syntax elements
  NUMERIC: "numeric", // Primarily consists of numbers or numeric symbols
  ERROR_LIKE: "error_like", // Contains keywords like "error", "exception", "failed"
  TERMINAL_LIKE: "terminal_like", // Contains command prompts like $, #, >
  CITATION: "citation", // Likely a bibliographic citation
  SOCIAL_MEDIA: "social_media", // Likely a handle or tag
  POETRY: "poetry", // Formatted like verse
  PLAIN_TEXT: "plain_text", // Default if no other specific type matches
} as const;

export type SelectionDataType =
  (typeof SelectionDataType)[keyof typeof SelectionDataType];

/**
 * Processed selection data with additional analysis
 */
export type SelectionData = {
  /**
   * Cleaned text content
   */
  text: string;

  /**
   * Original raw text before cleaning
   */
  originalText: string;

  /**
   * Original HTML fragment of the selection
   */
  originalHtml: string;

  /**
   * URL of the page where the selection was made
   */
  pageUrl: string;

  /**
   * Title of the page where the selection was made
   */
  pageTitle?: string;

  /**
   * Number of words in the selection
   */
  wordCount: number;

  /**
   * Number of characters in the selection
   */
  charCount: number;

  /**
   * Whether the selection was chunked due to size
   */
  isChunked: boolean;

  /**
   * Index of this chunk (if the selection was chunked)
   */
  chunkIndex?: number;

  /**
   * Total number of chunks (if the selection was chunked)
   */
  totalChunks?: number;

  /**
   * Text formatted specifically for optimal LLM processing
   */
  llmFormattedText: string;

  /**
   * The primary structural context of the selection (e.g., TABLE, LIST, CODE_BLOCK).
   */
  contextTypes: SelectionContextType[];

  /**
   * Detected types of the data content itself (e.g., WORD, JSON, CODE_LIKE).
   * Can contain multiple types.
   */
  dataTypes: SelectionDataType[];
};
