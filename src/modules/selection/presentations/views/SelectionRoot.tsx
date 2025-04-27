import React, { useState, type FC } from "react";
import { createRoot } from "react-dom/client";
import { SelectionTrigger } from "../components/SelectionTrigger/SelectionTrigger";
import { PromptlyOverlay } from "./PromptOverlay/PromptOverlay";
import { useSelection } from "../hooks/useSelection";
import "../../../../normalize.css";

/**
 * Main component that serves as the entry point for the Promptly extension UI
 */
const PromptlyRoot: FC = () => {
  const { selection, mousePosition, clearSelection } = useSelection();
  const [showOverlay, setShowOverlay] = useState(false);

  // Handle trigger click
  const handleTriggerClick = () => {
    setShowOverlay(true);
  };

  // Handle overlay close
  const handleOverlayClose = () => {
    setShowOverlay(false);
    clearSelection();
  };

  return (
    <>
      {/* Selection trigger button */}
      {selection && !showOverlay && mousePosition && (
        <SelectionTrigger
          position={mousePosition}
          onClick={handleTriggerClick}
        />
      )}

      {/* Overlay with actions */}
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
  // Create shadow root container for style isolation
  const container = document.createElement("promptly-root");
  document.body.parentElement?.appendChild(container);

  // Mount React component
  const root = createRoot(container);
  root.render(<PromptlyRoot />);

  // Return cleanup function
  return () => {
    root.unmount();
    document.body.removeChild(container);
  };
}
