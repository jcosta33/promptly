import { useEffect, useState } from "react";

import type { ExtensionSettings } from "$/modules/configuration/models/user_settings";
import { get_settings } from "$/modules/configuration/use_cases/get_settings";
import { update_settings } from "$/modules/configuration/use_cases/update_settings";
import type { MessageEvent } from "$/modules/messaging/helpers/create_message_event";
import { EventType } from "$/modules/messaging/models/event_types";
import { subscribe } from "$/modules/messaging/repositories/message_bus";
import { logger } from "$/utils/logger";

/**
 * Hook for managing extension settings
 * @returns Settings state and functions to update settings
 */
export function useSettings() {
  const [settings, setSettings] = useState<ExtensionSettings | null>(null);
  const [loading, setLoading] = useState(true);

  // Function to load settings initially
  const loadInitialSettings = async () => {
    logger.info("Attempting to load initial settings...");
    setLoading(true);
    try {
      const currentSettings = await get_settings();
      logger.debug("Initial settings loaded:", currentSettings);
      setSettings(currentSettings);
    } catch (error) {
      logger.error("Failed to load initial settings:", error);
      setSettings(null);
    }
    setLoading(false);
  };

  // Load settings once when the hook is first used
  useState(() => {
    loadInitialSettings();
  });

  // Update settings
  const updateSettings = async (
    partialSettings: Partial<ExtensionSettings>
  ) => {
    if (!settings) {
      return;
    }

    setLoading(true);
    const updatedSettings = await update_settings(partialSettings);
    setSettings(updatedSettings);
    setLoading(false);
  };

  // Toggle enable/disable
  const toggleEnabled = async () => {
    if (!settings) return;
    logger.info("Toggling extension enabled state", { from: settings.isEnabled, to: !settings.isEnabled });
    await updateSettings({ isEnabled: !settings.isEnabled });
  };

  // Update selected model
  const setSelectedModel = async (modelId: string) => {
    if (!settings) {
      return;
    }

    logger.info("Updating selected model", { from: settings.selectedModelId, to: modelId });
    await updateSettings({ selectedModelId: modelId });
  };

  // Effect for subscribing to live updates
  useEffect(() => {
    logger.debug("Setting up settings update subscription.");
    const unsubscribe = subscribe<ExtensionSettings>(
      EventType.SETTINGS_UPDATE,
      (event: MessageEvent<ExtensionSettings>) => {
        logger.info("Received settings update via subscription.", event.payload);
        setSettings(event.payload);
      }
    );

    // Cleanup subscription on unmount
    return () => {
      logger.debug("Cleaning up settings update subscription.");
      unsubscribe();
    };
  }, []);

  return {
    settings,
    loading,
    updateSettings,
    toggleEnabled,
    setSelectedModel,
  };
}
