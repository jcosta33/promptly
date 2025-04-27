// DOM properties we extract from the selection
export type DomProperties = {
  tagName: string;
  className: string;
  id: string;
  role?: string; // ARIA role
  ariaLevel?: string | null; // ARIA level (for headings)
  parentTagName?: string;
  grandparentTagName?: string;
};

/**
 * Extract DOM properties from the selection
 */
export function extract_dom_properties(selection: Selection): DomProperties {
  const defaults: DomProperties = { tagName: "", className: "", id: "" };

  if (!selection.rangeCount) return defaults;

  const node = selection.anchorNode;
  if (!node) return defaults;

  // Get relevant element (either node itself or its parent if it's a text node)
  const element =
    node.nodeType === Node.TEXT_NODE
      ? node.parentElement
      : (node as HTMLElement);

  if (!element) return defaults;

  const parentElement = element.parentElement;
  const grandparentElement = parentElement?.parentElement;

  return {
    tagName: element.tagName?.toLowerCase() || "",
    className: element.className || "",
    id: element.id || "",
    role: element.getAttribute("role") || undefined,
    ariaLevel: element.getAttribute("aria-level"),
    parentTagName: parentElement?.tagName?.toLowerCase() || undefined,
    grandparentTagName: grandparentElement?.tagName?.toLowerCase() || undefined,
  };
}
