import { useState, type FC } from "react";
import { createRoot } from "react-dom/client";
import { SelectionTrigger } from "../components/SelectionTrigger/SelectionTrigger";
import { PromptlyOverlay } from "./PromptOverlay/PromptOverlay";
import { useSelection } from "../hooks/useSelection";
import { logger } from "$/utils/logger";

/**
 * Main component that serves as the entry point for the Promptly extension UI
 */
const PromptlyRoot: FC = () => {
  const [showOverlay, setShowOverlay] = useState(false);
  const { selection, mousePosition, clearSelection } = useSelection({
    enabled: true,
  });

  const handleTriggerClick = () => {
    setShowOverlay(true);
  };

  const handleOverlayClose = () => {
    setShowOverlay(false);
    clearSelection();
  };

  return (
    <>
      {selection && !showOverlay && mousePosition && (
        <SelectionTrigger
          position={mousePosition}
          onClick={handleTriggerClick}
        />
      )}

      {selection && showOverlay && mousePosition && (
        <PromptlyOverlay
          selectionData={selection}
          position={mousePosition}
          onClose={handleOverlayClose}
        />
      )}
    </>
  );
};

/**
 * Creates and mounts the Promptly component tree to the DOM
 */
export function mountPromptlyRoot(): () => void {
  const container = document.createElement("promptly-root");
  container.id = "promptly-root";
  document.body.parentElement?.appendChild(container);

  const root = createRoot(container);
  root.render(<PromptlyRoot />);

  logger.info("Mounted Promptly root");

  return () => {
    root.unmount();
    document.body.removeChild(container);
  };
}
