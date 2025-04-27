/**
 * Extracts the HTML content from a Selection object
 */
export function extract_selection_html(selection: Selection): string {
  if (!selection.rangeCount) {
    return "";
  }

  const range = selection.getRangeAt(0);
  const container = document.createElement("div");
  container.appendChild(range.cloneContents());

  return container.innerHTML;
}
