import { useState, useEffect } from "react";

import { SelectionData } from "$/modules/selection/models/selection";
import { add_selection_listener } from "$/modules/selection/repositories/selection_repository";
import { process_selection } from "$/modules/selection/use_cases/analyze_selection";
import { logger } from "$/utils/logger";

type UseSelectionOptions = {
  enabled: boolean;
};

/**
 * Custom hook to detect and track text selections on the page
 * @returns Current selection state and a function to clear the selection
 */
export function useSelection({ enabled }: UseSelectionOptions) {
  const [selection, setSelection] = useState<SelectionData | null>(null);
  const [mousePosition, setMousePosition] = useState<{
    x: number;
    y: number;
  } | null>(null);

  const clearSelection = () => {
    setSelection(null);
    setMousePosition(null);
  };

  useEffect(() => {
    if (!enabled) {
      return;
    }

    const removeListener = add_selection_listener({
      callback: ({ selection, mouse_position: mousePosition }) => {
        if (!selection) {
          clearSelection();
          return;
        }

        setMousePosition(mousePosition);
        const processedSelection = process_selection(selection);
        setSelection(processedSelection);
        logger.info("processed selection", processedSelection);
      },
    });

    return () => {
      removeListener();
    };
  }, [enabled]);

  return { selection, mousePosition, clearSelection };
}
