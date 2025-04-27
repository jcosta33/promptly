import { SelectionType } from "../models/selection";

// Removed detect_code_language import as it wasn't used

const MAX_WORDS_FOR_WORD_TYPE = 3;
const MAX_CHARS_FOR_SENTENCE_TYPE = 200;
const MIN_WORDS_FOR_LONG_TEXT = 50; // Threshold to consider text "long"

/**
 * Detects the type(s) of the selected content based on heuristics.
 * Analyzes both the text content and the underlying HTML structure.
 *
 * @param selection The raw browser Selection object.
 * @param cleanedText The cleaned text content of the selection.
 * @param wordCount The word count of the cleaned text.
 * @returns An array of detected SelectionType values, ordered by specificity.
 */
export function detect_selection_types(
  selection: Selection,
  cleanedText: string,
  wordCount: number
): SelectionType[] {
  const detected: Set<SelectionType> = new Set();

  const range = selection.rangeCount > 0 ? selection.getRangeAt(0) : null;
  const container = range?.commonAncestorContainer;

  // Define the common parent element once, handling potential nulls
  const parentElement =
    container && (container.nodeType === Node.ELEMENT_NODE
      ? (container as Element)
      : container.parentElement);


  // --- HTML Structure Checks ---
  if (range && parentElement) {
    // Helper to check if the parentElement is inside a specific tag
    const isInside = (selector: string): boolean => {
      // Use the single parentElement variable
      return parentElement.closest(selector) !== null;
    };

    // Check for specific HTML tags more reliably
    if (isInside("table")) {
      detected.add(SelectionType.TABLE);
    }
    if (isInside("ul, ol")) {
      detected.add(SelectionType.LIST);
    }
    if (isInside("pre, code")) {
      detected.add(SelectionType.CODE);
    }
    if (isInside("math")) {
      detected.add(SelectionType.MATH_FORMULA);
    }
    if (isInside("blockquote")) {
      detected.add(SelectionType.QUOTE);
    }
    if (isInside("h1, h2, h3, h4, h5, h6")) {
      detected.add(SelectionType.HEADER);
    }
    if (isInside("dl, dt, dd")) {
      detected.add(SelectionType.DEFINITION);
    }
    if (isInside("a[href]")) {
      // Check if the *entire* selection is the link text
      const linkElement = parentElement.closest("a[href]");
      if (
        linkElement &&
        linkElement.textContent?.trim() === cleanedText.trim()
      ) {
        detected.add(SelectionType.URL);
      }
    }
  }

  // --- Text Content Checks ---

  // JSON Check (keep try-catch)
  if (cleanedText.startsWith("{") || cleanedText.startsWith("[")) {
    try {
      JSON.parse(cleanedText);
      detected.add(SelectionType.JSON_DATA);
      detected.add(SelectionType.CODE); // JSON is also code
    } catch (e) {
      /* Ignore */
    }
  }

  // Math Formula (LaTeX-like) Check
  if (cleanedText.includes("\\(") || cleanedText.includes("\\[")) {
    detected.add(SelectionType.MATH_FORMULA);
    detected.add(SelectionType.CODE); // LaTeX is code-like
  }

  // Terminal Output Check
  if (/^\s*([$#%]| C:\\>)/m.test(cleanedText)) {
    detected.add(SelectionType.TERMINAL_OUTPUT);
    detected.add(SelectionType.CODE);
  }

  // Error Message Check
  const errorKeywords = [
    "error",
    "exception",
    "failed",
    "warning",
    "traceback",
    "uncaught",
    "undefined",
    "nullpointer",
    "segmentation fault",
  ];
  if (
    errorKeywords.some((keyword) => {
      return cleanedText.toLowerCase().includes(keyword);
    })
  ) {
    detected.add(SelectionType.ERROR_MESSAGE);
  }

  // Email Check
  // Basic regex, not perfect but covers common cases
  if (/^[\w\-\.]+@([\w-]+\.)+[\w-]{2,4}$/.test(cleanedText.trim())) {
    detected.add(SelectionType.EMAIL);
  }

  // URL Check (if not detected via tag)
  if (!detected.has(SelectionType.URL)) {
    // Basic regex for URLs
    if (/^https?:\/\/[^\s/$.?#].[^\s]*$/.test(cleanedText.trim())) {
      detected.add(SelectionType.URL);
    }
  }

  // Markdown Check (basic markers)
  if (/[\*\_\`\#\[\]\(\)!]/.test(cleanedText) && cleanedText.includes("\n")) {
    // Presence of markdown symbols and newlines is a weak indicator
    detected.add(SelectionType.MARKDOWN);
  }

  // Basic length/structure checks (Word, Sentence, Paragraph, Long Text)
  const sentenceTerminators = /[.!?]$/;
  const sentenceEndCount = (cleanedText.match(/[.!?](?:\s+|$)/g) || []).length;

  if (wordCount >= MIN_WORDS_FOR_LONG_TEXT) {
    detected.add(SelectionType.LONG_TEXT);
  }

  // Avoid classifying code/json/etc. simply as word/sentence/paragraph if already detected
  const hasSpecificType =
    detected.size > 0 && !detected.has(SelectionType.LONG_TEXT);

  if (!hasSpecificType) {
    if (wordCount <= MAX_WORDS_FOR_WORD_TYPE && sentenceEndCount === 0) {
      detected.add(SelectionType.WORD);
    } else if (
      sentenceEndCount <= 1 &&
      cleanedText.length < MAX_CHARS_FOR_SENTENCE_TYPE
    ) {
      if (
        sentenceEndCount === 1 &&
        sentenceTerminators.test(cleanedText.trim())
      ) {
        detected.add(SelectionType.SENTENCE);
      } else if (sentenceEndCount === 0) {
        detected.add(SelectionType.SENTENCE); // Treat short phrases as sentences
      } else {
        detected.add(SelectionType.PARAGRAPH); // Fragment
      }
    } else {
      detected.add(SelectionType.PARAGRAPH);
    }
  }

  const detectedArray = Array.from(detected);

  // Return detected types or default to PARAGRAPH if nothing specific found
  return detectedArray.length > 0 ? detectedArray : [SelectionType.PARAGRAPH];
}
