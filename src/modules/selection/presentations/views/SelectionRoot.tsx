import { useEffect, useState, type FC } from "react";
import { createRoot } from "react-dom/client";

import { get_settings } from "$/modules/configuration/use_cases/get_settings";
import { EventType } from "$/modules/messaging/models/event_types";
import { subscribe } from "$/modules/messaging/repositories/message_bus";
import { logger } from "$/utils/logger";

import { SelectionTrigger } from "../components/SelectionTrigger/SelectionTrigger";
import { useSelection } from "../hooks/useSelection";

import { PromptlyOverlay } from "./PromptOverlay/PromptOverlay";

import type { ExtensionSettings } from "$/modules/configuration/models/user_settings";
import type { MessageEvent } from "$/modules/messaging/helpers/create_message_event";

/**
 * Main component that serves as the entry point for the Promptly extension UI
 */
const PromptlyRoot: FC = () => {
  const [showOverlay, setShowOverlay] = useState(false);
  const [initialActionId, setInitialActionId] = useState<string | undefined>();
  const [omniboxText, setOmniboxText] = useState<string | undefined>();
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

    
    const unsubscribeContext = subscribe<{ actionId: string }>(
      EventType.TRIGGER_CONTEXT_ACTION as any,
      (event) => {
        setInitialActionId(event.payload.actionId);
        setShowOverlay(true);
      }
    );

    
    const unsubscribeOmnibox = subscribe<{ text: string }>(
      EventType.OMNIBOX_INPUT as any,
      (event) => {
        setOmniboxText(event.payload.text);
        setInitialActionId(undefined);
    setOmniboxText(undefined);
        setShowOverlay(true);
      }
    );

    const unsubscribe = subscribe<ExtensionSettings>(
      EventType.SETTINGS_UPDATE,
      (event: MessageEvent<ExtensionSettings>) => {
        setIsEnabled(event.payload.isEnabled);
      },
    );

    return () => {
      isMounted = false;
      unsubscribe();
      unsubscribeContext();
      unsubscribeOmnibox();
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
    setInitialActionId(undefined);
    setOmniboxText(undefined);
    setShowOverlay(false);
    clearSelection();
  };

  
  const mockSelection = omniboxText ? {
    text: omniboxText,
    llmFormattedText: omniboxText,
    rect: new DOMRect(window.innerWidth / 2 - 200, 100, 400, 500),
    pageUrl: window.location.href,
    pageTitle: document.title,
    contextTypes: ["text"],
    dataTypes: ["text"],
  } : null;
  
  const effectiveSelection = selection || mockSelection;
  const effectivePosition = mousePosition || { x: window.innerWidth / 2, y: 150 };

  return (
    <>
      {effectiveSelection && !showOverlay && mousePosition && !omniboxText && (
        <SelectionTrigger
          position={effectivePosition}
          onClick={handleTriggerClick}
        />
      )}

      {effectiveSelection && showOverlay && effectivePosition && (
        <PromptlyOverlay
          selectionData={effectiveSelection as any}
          initialActionId={initialActionId}
          position={effectivePosition}
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
