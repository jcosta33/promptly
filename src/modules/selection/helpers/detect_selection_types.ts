import { SelectionContextType, SelectionDataType } from "../models/selection";

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
): {
  dataTypes: SelectionDataType[];
  contextTypes: SelectionContextType[];
} {
  const detectedContextTypes: Set<SelectionContextType> = new Set();
  const detectedDataTypes: Set<SelectionDataType> = new Set();

  const range = selection.rangeCount > 0 ? selection.getRangeAt(0) : null;
  const container = range?.commonAncestorContainer;

  // Define the common parent element once, handling potential nulls
  const parentElement =
    container &&
    (container.nodeType === Node.ELEMENT_NODE
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
    if (isInside("input, textarea")) {
      detectedContextTypes.add(SelectionContextType.INPUT);
    } else if (isInside("table")) {
      detectedContextTypes.add(SelectionContextType.TABLE);
    } else if (isInside("ul, ol")) {
      detectedContextTypes.add(SelectionContextType.LIST);
    }
    if (isInside("pre, code")) {
      detectedContextTypes.add(SelectionContextType.CODE_BLOCK);
    }
    if (isInside("math")) {
      detectedContextTypes.add(SelectionContextType.MATH);
    }
    if (isInside("blockquote")) {
      detectedContextTypes.add(SelectionContextType.QUOTE);
    }
    if (isInside("h1, h2, h3, h4, h5, h6")) {
      detectedContextTypes.add(SelectionContextType.HEADER);
    }
    if (isInside("dl, dt, dd")) {
      detectedContextTypes.add(SelectionContextType.DEFINITION_LIST);
    }
    if (isInside("a[href]")) {
      const linkElement = parentElement.closest("a[href]");
      if (
        linkElement &&
        linkElement.textContent?.trim() === cleanedText.trim()
      ) {
        detectedContextTypes.add(SelectionContextType.LINK);
      }
    }
    if (isInside("p, div, span")) {
      detectedContextTypes.add(SelectionContextType.GENERAL);
    }
  }

  // JSON Check (keep try-catch)
  if (cleanedText.startsWith("{") || cleanedText.startsWith("[")) {
    try {
      JSON.parse(cleanedText);
      detectedDataTypes.add(SelectionDataType.JSON);
      detectedDataTypes.add(SelectionDataType.CODE_LIKE);
    } catch (e) {
      /* Ignore */
    }
  }

  if (cleanedText.includes("\\(") || cleanedText.includes("\\[")) {
    detectedDataTypes.add(SelectionDataType.LATEX);
    detectedDataTypes.add(SelectionDataType.CODE_LIKE);
  }

  if (/^\s*([$#%]| C:\\>)/m.test(cleanedText)) {
    detectedDataTypes.add(SelectionDataType.TERMINAL_LIKE);
    detectedDataTypes.add(SelectionDataType.CODE_LIKE);
  }

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
    detectedDataTypes.add(SelectionDataType.ERROR_LIKE);
  }

  if (/^[\w\-\.]+@([\w-]+\.)+[\w-]{2,4}$/.test(cleanedText.trim())) {
    detectedDataTypes.add(SelectionDataType.EMAIL);
  }

  if (!detectedDataTypes.has(SelectionDataType.URL)) {
    if (/^https?:\/\/[^\s/$.?#].[^\s]*$/.test(cleanedText.trim())) {
      detectedDataTypes.add(SelectionDataType.URL);
    }
  }

  if (/[\*\_\`\#\[\]\(\)!]/.test(cleanedText) && cleanedText.includes("\n")) {
    detectedDataTypes.add(SelectionDataType.MARKDOWN);
  }

  const sentenceTerminators = /[.!?]$/;
  const sentenceEndCount = (cleanedText.match(/[.!?](?:\s+|$)/g) || []).length;

  if (wordCount >= MIN_WORDS_FOR_LONG_TEXT) {
    detectedDataTypes.add(SelectionDataType.LONG_TEXT);
  }

  const hasSpecificType =
    detectedDataTypes.size > 0 &&
    !detectedDataTypes.has(SelectionDataType.LONG_TEXT);

  if (!hasSpecificType) {
    if (wordCount <= MAX_WORDS_FOR_WORD_TYPE && sentenceEndCount === 0) {
      detectedDataTypes.add(SelectionDataType.WORD);
    } else if (
      sentenceEndCount <= 1 &&
      cleanedText.length < MAX_CHARS_FOR_SENTENCE_TYPE
    ) {
      if (
        sentenceEndCount === 1 &&
        sentenceTerminators.test(cleanedText.trim())
      ) {
        detectedDataTypes.add(SelectionDataType.SENTENCE);
      } else if (sentenceEndCount === 0) {
      } else {
        detectedDataTypes.add(SelectionDataType.PARAGRAPH); // Fragment
      }
    } else {
      detectedDataTypes.add(SelectionDataType.PARAGRAPH);
    }
  }

  return {
    dataTypes: Array.from(detectedDataTypes),
    contextTypes: Array.from(detectedContextTypes),
  };
}
