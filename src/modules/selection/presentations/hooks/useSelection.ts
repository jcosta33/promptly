import { useState, useEffect } from "react";

import { SelectionData } from "$/modules/selection/models/selection";
import { add_selection_listener } from "$/modules/selection/repositories/selection_repository";
import { process_selection } from "$/modules/selection/use_cases/analyze_selection";

/**
 * Custom hook to detect and track text selections on the page
 * @returns Current selection state and a function to clear the selection
 */
export function useSelection() {
  const [selection, setSelection] = useState<SelectionData | null>(null);
  const [mousePosition, setMousePosition] = useState<{
    x: number;
    y: number;
  } | null>(null);

  // Clear selection state
  const clearSelection = () => {
    setSelection(null);
    setMousePosition(null);
  };

  // Set up event listeners
  useEffect(() => {
    // Use the repository's selection listener functionality
    const removeListener = add_selection_listener({
      callback: ({ selection, mousePosition }) => {
        if (!selection) {
          clearSelection();
          return;
        }

        setMousePosition(mousePosition);
        const processedSelection = process_selection(selection);
        setSelection(processedSelection);
        // console.log("processed selection", processedSelection);
      },
    });

    // Clean up
    return () => {
      removeListener();
    };
  }, []);

  return { selection, mousePosition, clearSelection };
}
