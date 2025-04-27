// Helper Imports
import { clean_selection_text } from "../helpers/clean_selection_text";
import { count_words } from "../helpers/count_words";
import { detect_code_language } from "../helpers/detect_code_language";
import { detect_selection_types } from "../helpers/detect_selection_types";
import { extract_selection_html } from "../helpers/extract_selection_html";
import { extract_text_from_html } from "../helpers/extract_text_from_html";
import { SelectionData, SelectionType } from "../models/selection";

import { format_code_block } from "./format_code_block";
import { format_list_from_html } from "./format_list_from_html";
import { format_long_text_for_llm } from "./format_long_text_for_llm";
import { format_table_from_html } from "./format_table_from_html";

/**
 * Transforms raw browser Selection object into processed SelectionData,
 * including cleaning, type detection, and formatting for LLM consumption.
 *
 * @param selection Raw selection from the DOM
 * @returns Processed SelectionData object or null if selection is empty.
 */
export function transform_raw_selection_to_selection_data(
  selection: Selection
): SelectionData | null {
  // Get the text content of the selection
  const originalText = selection.toString();

  // If selection is empty, return null
  if (!originalText.trim()) {
    return null;
  }

  // Get the HTML fragment of the selection
  const originalHtml = extract_selection_html(selection);

  // Clean the text
  const cleanedText = clean_selection_text(originalText);

  // Count stats
  const wordCount = count_words(cleanedText);
  const charCount = cleanedText.length;

  // Detect all possible selection types using the helper
  const detectedTypes = detect_selection_types(
    selection,
    cleanedText,
    wordCount
  );

  // Generate LLM-optimized version of the text, now using HTML context
  const llmFormattedText = format_text_for_llm(
    cleanedText,
    originalHtml,
    detectedTypes
  );

  return {
    text: cleanedText,
    originalText,
    originalHtml,
    types: detectedTypes,
    pageUrl: window.location.href,
    pageTitle: document.title,
    wordCount,
    charCount,
    isChunked: false, // Will be set to true if later chunked
    llmFormattedText,
  };
}

/**
 * Registry of formatters for different selection types
 */
type TypeFormatter = {
  type: SelectionType;
  format: (text: string, html: string) => string;
};

/**
 * Registry of formatters for all selection types in priority order (most specific to most general)
 */
const TYPE_FORMATTERS: TypeFormatter[] = [
  // Specific code-related formatters (highest priority)
  {
    type: SelectionType.JSON_DATA,
    format: (text, html) => {
      // Try to parse and pretty-print JSON
      try {
        const parsed = JSON.parse(text);
        return "```json\n" + JSON.stringify(parsed, null, 2) + "\n```";
      } catch (e) {
        // If parsing fails, use the original HTML if it looks like code, else text
        return format_code_block(html.includes("<") ? html : text, "json");
      }
    },
  },
  {
    type: SelectionType.CODE,
    format: (text, html) => {
      // Prefer HTML content if available, otherwise use text
      const content = html.includes("<") ? extract_text_from_html(html) : text;
      const language = detect_code_language(content);
      return format_code_block(content, language);
    },
  },
  // Terminal and error outputs
  {
    type: SelectionType.ERROR_MESSAGE,
    format: (text, html) => {
      return format_code_block(text);
    }, // Use text for errors
  },
  {
    type: SelectionType.TERMINAL_OUTPUT,
    format: (text, html) => {
      return format_code_block(text);
    }, // Use text for terminal
  },
  // Structured data formats
  {
    type: SelectionType.TABLE,
    format: (text, html) => {
      return format_table_from_html(html);
    }, // Use HTML parser for tables
  },
  {
    type: SelectionType.MATH_FORMULA,
    format: (text, html) => {
      // Preserve LaTeX or MathML
      if (
        html.includes("<math") ||
        text.includes("\\(") ||
        text.includes("$$")
      ) {
        // If MathML or LaTeX detected, wrap appropriately or return text
        return text.includes("$$") || text.includes("\\(")
          ? text // Assume pre-formatted LaTeX
          : format_code_block(html, "mathml"); // Wrap MathML
      }
      return text; // Return text if no specific format found
    },
  },
  {
    type: SelectionType.LIST,
    format: (text, html) => {
      return format_list_from_html(html);
    }, // Use HTML parser for lists
  },
  // Additional complex text types
  {
    type: SelectionType.LONG_TEXT,
    format: (text, html) => {
      return format_long_text_for_llm(text);
    },
  },
  // Basic types (word, sentence, paragraph) don't need special formatting
];

/**
 * Format the selected text optimally for LLM processing based on the detected types
 *
 * @param text Cleaned text content
 * @param html Original HTML fragment of the selection
 * @param types Array of detected selection types
 * @returns Text formatted for optimal LLM processing
 */
function format_text_for_llm(
  text: string,
  html: string,
  types: SelectionType[]
): string {
  if (types.length === 0) {
    // Default to returning the text as is if no types detected
    return text;
  }

  let formattedText = text; // Start with plain text

  // Apply the highest priority formatter found
  for (const formatter of TYPE_FORMATTERS) {
    if (types.includes(formatter.type)) {
      formattedText = formatter.format(text, html);
      break; // Apply only the first matching (highest priority) formatter
    }
  }

  // Note: The specialized mixed-content formatters (like format_list_with_code)
  // are removed as the HTML-based formatters should handle these cases better.
  // If specific combinations need *further* refinement beyond the primary formatter,
  // additional checks could be added here.

  return formattedText;
}
