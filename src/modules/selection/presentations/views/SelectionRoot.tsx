import { useEffect, useState, type FC } from "react";
import { createRoot } from "react-dom/client";
import { SelectionTrigger } from "../components/SelectionTrigger/SelectionTrigger";
import { PromptlyOverlay } from "./PromptOverlay/PromptOverlay";
import { useSelection } from "../hooks/useSelection";
import { logger } from "$/utils/logger";
import { get_settings } from "$/modules/configuration/use_cases/get_settings";
import { subscribe } from "$/modules/messaging/repositories/message_bus";
import { EventType } from "$/modules/messaging/models/event_types";
import type { ExtensionSettings } from "$/modules/configuration/models/user_settings";
import type { MessageEvent } from "$/modules/messaging/helpers/create_message_event";

/**
 * Main component that serves as the entry point for the Promptly extension UI
 */
const PromptlyRoot: FC = () => {
  const [showOverlay, setShowOverlay] = useState(false);
  const [isEnabled, setIsEnabled] = useState(true);
  const { selection, mousePosition, clearSelection } = useSelection({
    enabled: isEnabled,
  });

  useEffect(() => {
    let isMounted = true;

    get_settings()
      .then((settings) => {
        if (isMounted) {
          setIsEnabled(settings.isEnabled);
        }
      })
      .catch((error) => {
        logger.warn("Unable to load Promptly enabled setting", error);
      });

    const unsubscribe = subscribe<ExtensionSettings>(
      EventType.SETTINGS_UPDATE,
      (event: MessageEvent<ExtensionSettings>) => {
        setIsEnabled(event.payload.isEnabled);
      },
    );

    return () => {
      isMounted = false;
      unsubscribe();
    };
  }, []);

  useEffect(() => {
    if (!isEnabled) {
      setShowOverlay(false);
      clearSelection();
    }
  }, [clearSelection, isEnabled]);

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
