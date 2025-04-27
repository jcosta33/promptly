type AddSelectionListenerParams = {
  callback: (params: {
    selection: Selection | null;
    mousePosition: { x: number; y: number } | null;
  }) => void;
};

/**
 * Add a selection change listener
 *
 * @param callback Function called when selection changes
 * @returns Function to remove the listener
 */
export function add_selection_listener({
  callback,
}: AddSelectionListenerParams): () => void {
  let debounceTimeout: NodeJS.Timeout | null = null;

  const handleSelectionChange = (event: MouseEvent) => {
    const promptlyRoot = document.querySelector("promptly-root");

    if (promptlyRoot?.contains(event.target as Node)) {
      return;
    }

    // Clear existing timeout to debounce rapid selection changes
    if (debounceTimeout !== null) {
      window.clearTimeout(debounceTimeout);
    }

    const mousePosition = {
      x: event.pageX,
      y: event.pageY,
    };

    // Set a short timeout to avoid processing transient selections
    debounceTimeout = setTimeout(() => {
      const selection = window.getSelection();

      const selectionText = selection?.toString();

      if (!selectionText || selectionText.length === 0) {
        return;
      }

      callback({ selection, mousePosition });

      debounceTimeout = null;
    }, 150);
  };

  const handleMouseDown = (event: MouseEvent) => {
    // if the click is not inside our promptly-root element, clear the selection
    const promptlyRoot = document.querySelector("promptly-root");

    if (!promptlyRoot?.contains(event.target as Node)) {
      callback({ selection: null, mousePosition: null });
    }
  };

  // Add listeners for both mouseup (end of drag selection) and
  // selectionchange events (keyboard navigation, programmatic selection)
  document.addEventListener("mouseup", handleSelectionChange);
  document.addEventListener("mousedown", handleMouseDown);

  // Return function to clean up listeners
  return () => {
    if (debounceTimeout !== null) {
      window.clearTimeout(debounceTimeout);
    }
    document.removeEventListener("mouseup", handleSelectionChange);
    document.removeEventListener("mousedown", handleMouseDown);
  };
}
