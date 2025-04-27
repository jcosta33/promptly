import { useEffect, useState } from "react";

import { ExtensionSettings } from "$/modules/configuration/models/user_settings";
import { get_settings } from "$/modules/configuration/use_cases/get_settings";
import { update_settings } from "$/modules/configuration/use_cases/update_settings";
import { MessageEvent } from "$/modules/messaging/helpers/create_message_event";
import { EventType } from "$/modules/messaging/models/event_types";
import { subscribe } from "$/modules/messaging/repositories/message_bus";

/**
 * Hook for managing extension settings
 * @returns Settings state and functions to update settings
 */
export function useSettings() {
  const [settings, setSettings] = useState<ExtensionSettings | null>(null);
  const [loading, setLoading] = useState(true);

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
    console.log("Toggling enabled:", settings.isEnabled);
    await updateSettings({ isEnabled: !settings.isEnabled });
  };

  // Update selected model
  const setSelectedModel = async (modelId: string) => {
    if (!settings) {
      return;
    }

    console.log("Setting selected model:", modelId);
    await updateSettings({ selectedModelId: modelId });
  };

  // Load settings on mount
  useEffect(() => {
    console.log("Loading settings...");

    const loadSettings = async () => {
      setLoading(true);
      const currentSettings = await get_settings();
      console.log("Current settings:", currentSettings);
      setSettings(currentSettings);
      setLoading(false);
    };

    loadSettings();

    // Subscribe to settings updates from other contexts
    const unsubscribe = subscribe<ExtensionSettings>(
      EventType.SETTINGS_UPDATE,
      (event: MessageEvent<ExtensionSettings>) => {
        setSettings(event.payload);
      }
    );

    return () => {
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
