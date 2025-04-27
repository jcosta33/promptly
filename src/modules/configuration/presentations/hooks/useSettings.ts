import { useEffect } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";

import { type ExtensionSettings, ThemePreference } from "$/modules/configuration/models/user_settings";
import { get_settings } from "$/modules/configuration/use_cases/get_settings";
import { update_settings } from "$/modules/configuration/use_cases/update_settings";
import type { MessageEvent } from "$/modules/messaging/helpers/create_message_event";
import { EventType } from "$/modules/messaging/models/event_types";
import { subscribe } from "$/modules/messaging/repositories/message_bus";
import { logger } from "$/utils/logger";

const SETTINGS_QUERY_KEY = ["settings"];

/**
 * Hook for managing extension settings
 * @returns Settings state and functions to update settings
 */
export function useSettings() {
  // Use useQuery to fetch initial settings
  const {
    data: settings,
    isLoading: loading, // Rename isLoading to loading for consistency
    error: loadingError
  } = useQuery<ExtensionSettings, Error>({
    queryKey: SETTINGS_QUERY_KEY,
    queryFn: get_settings,
    staleTime: Infinity, // Settings don't change often, refetch on explicit update
    gcTime: Infinity, // Keep settings data indefinitely
  });

  const queryClient = useQueryClient();

  // Update settings function - now needs to invalidate the query
  const updateSettings = async (
    partialSettings: Partial<ExtensionSettings>
  ) => {
    if (!settings) {
      logger.warn("Cannot update settings, current settings not available.");
      return;
    }
    try {
      // Optimistic update (optional but good UX)
      // queryClient.setQueryData(SETTINGS_QUERY_KEY, { ...settings, ...partialSettings });

      const updatedSettings = await update_settings(partialSettings);

      // Invalidate and refetch after successful update
      queryClient.setQueryData(SETTINGS_QUERY_KEY, updatedSettings); // Update cache directly
      // Or invalidate: await queryClient.invalidateQueries({ queryKey: SETTINGS_QUERY_KEY });

      return updatedSettings;
    } catch (error) {
      logger.error("Failed to update settings:", error);
      // Potentially roll back optimistic update if implemented
      // queryClient.setQueryData(SETTINGS_QUERY_KEY, settings); // Rollback
      throw error; // Re-throw for potential UI handling
    }
  };

  // Toggle enable/disable function
  const toggleEnabled = async () => {
    if (!settings) return;
    logger.info("Toggling extension enabled state", { from: settings.isEnabled, to: !settings.isEnabled });
    await updateSettings({ isEnabled: !settings.isEnabled });
  };

  // Update selected model function
  const setSelectedModel = async (modelId: string) => {
    if (!settings) return;
    logger.info("Updating selected model", { from: settings.selectedModelId, to: modelId });
    await updateSettings({ selectedModelId: modelId });
  };

  // Update theme preference
  const setThemePreference = async (theme: ThemePreference) => {
    if (!settings) return;
    logger.info("Updating theme preference", { from: settings.themePreference, to: theme });
    await updateSettings({ themePreference: theme });
  };

  // Effect for subscribing to live updates from other contexts (still needed)
  useEffect(() => {
    logger.debug("Setting up settings update subscription.");
    const unsubscribe = subscribe<ExtensionSettings>(
      EventType.SETTINGS_UPDATE,
      (event: MessageEvent<ExtensionSettings>) => {
        logger.info("Received settings update via subscription, updating query cache.", event.payload);
        // Update the query cache when an external update occurs
        queryClient.setQueryData(SETTINGS_QUERY_KEY, event.payload);
      }
    );

    // Cleanup subscription on unmount
    return () => {
      logger.debug("Cleaning up settings update subscription.");
      unsubscribe();
    };
  }, [queryClient]);

  return {
    settings: settings ?? null, // Return null if data is undefined initially
    loading,
    loadingError,
    updateSettings,
    toggleEnabled,
    setSelectedModel,
    setThemePreference,
  };
}
