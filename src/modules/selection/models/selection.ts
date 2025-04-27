/**
 * Enum defining the types of text selections
 */
export enum SelectionType {
  WORD = "word",
  SENTENCE = "sentence",
  PARAGRAPH = "paragraph",
  CODE = "code",
  LIST = "list",
  LONG_TEXT = "long_text",
  TABLE = "table",
  MATH_FORMULA = "math_formula",
  QUOTE = "quote",
  HEADER = "header",
  DEFINITION = "definition",
  URL = "url",
  JSON_DATA = "json_data",
  EMAIL = "email",
  MARKDOWN = "markdown",
  NUMERIC_DATA = "numeric_data",
  CITATION = "citation",
  SOCIAL_MEDIA = "social_media",
  POETRY = "poetry",
  API_REQUEST = "api_request",
  ERROR_MESSAGE = "error_message",
  TERMINAL_OUTPUT = "terminal_output",
}

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
   * All detected types of selection (may include multiple types)
   */
  types: SelectionType[];

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
};
