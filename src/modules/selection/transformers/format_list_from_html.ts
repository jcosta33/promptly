// Helper to format lists from HTML structure, handling nesting
export function format_list_from_html(html: string): string {
  const tempDiv = document.createElement("div");
  tempDiv.innerHTML = html;

  let markdownList = "";

  function processNode(node: Node, level = 0): void {
    const indent = "  ".repeat(level);

    if (node.nodeName === "LI") {
      const listItem = node as HTMLLIElement;
      const parentList = listItem.parentElement;
      // Determine marker based on the *immediate* parent list type
      const marker =
        parentList?.nodeName === "OL"
          ? `${getOlStartIndex(parentList, listItem)}.`
          : "-";

      // Get direct text content, excluding nested lists
      let directText = "";
      listItem.childNodes.forEach((child) => {
        if (child.nodeType === Node.TEXT_NODE) {
          directText += child.textContent;
        } else if (
          child.nodeType === Node.ELEMENT_NODE &&
          !["UL", "OL"].includes(child.nodeName)
        ) {
          // Include text from non-list child elements
          directText += (child as HTMLElement).textContent;
        }
      });

      markdownList += `${indent}${marker} ${directText.trim()}\n`;

      // Recursively process nested lists directly under this LI
      listItem.childNodes.forEach((child) => {
        if (
          child.nodeType === Node.ELEMENT_NODE &&
          ("UL" === child.nodeName || "OL" === child.nodeName)
        ) {
          processNode(child, level + 1);
        }
      });
    } else if (node.nodeName === "UL" || node.nodeName === "OL") {
      // Process child list items of the current list
      node.childNodes.forEach((child) => {
        if (child.nodeName === "LI") {
          processNode(child, level);
        }
      });
    }
  }

  // Helper to get the correct start index for OL items
  function getOlStartIndex(
    olElement: HTMLElement | null,
    currentLi: HTMLLIElement
  ): number {
    if (!olElement) return 1;
    const start = parseInt(olElement.getAttribute("start") || "1", 10);
    const items = Array.from(olElement.children).filter((el) => {
      return el.nodeName === "LI";
    });
    const index = items.indexOf(currentLi);
    return start + (index >= 0 ? index : 0);
  }

  // Start processing from the root children of the temporary div
  tempDiv.childNodes.forEach((child) => {
    if (
      child.nodeType === Node.ELEMENT_NODE &&
      ("UL" === child.nodeName || "OL" === child.nodeName)
    ) {
      processNode(child, 0);
    } else if (child.nodeName === "LI") {
      // Handle case where selection might start with an LI directly
      processNode(child, 0);
    } else if (child.nodeType === Node.TEXT_NODE && child.textContent?.trim()) {
      // Handle cases where selection might just be text within a list context
      markdownList += child.textContent.trim() + "\n";
    } else if (child.nodeType === Node.ELEMENT_NODE) {
      // Fallback for non-list elements if the type was detected as LIST
      markdownList += child.textContent?.trim() + "\n";
    }
  });

  // If no list structure was processed, return original HTML as fallback
  if (!markdownList.trim()) {
    return html;
  }

  return markdownList.trim();
}
