import { DEFAULT_SETTINGS, type ExtensionSettings } from "../models/user_settings";
import { logger } from "$/utils/logger";

// Storage key for extension settings
const SETTINGS_STORAGE_KEY = "promptly-settings";

/**
 * Save user settings to chrome.storage.local
 *
 * @param settings The settings object to save
 * @returns A promise that resolves when the settings are saved
 */
export async function save_settings(
  settings: ExtensionSettings
): Promise<void> {
  try {
    await chrome.storage.local.set({ [SETTINGS_STORAGE_KEY]: settings });
  } catch (error) {
    logger.error("Error saving settings:", error);
    throw new Error(
      `Failed to save settings: ${error instanceof Error ? error.message : "Unknown error"}`
    );
  }
}

/**
 * Load user settings from chrome.storage.local
 *
 * @returns A promise that resolves with the loaded settings, or the default settings if none are found
 */
export async function load_settings(): Promise<ExtensionSettings> {
  try {
    const result = await chrome.storage.local.get(SETTINGS_STORAGE_KEY);

    if (result && result[SETTINGS_STORAGE_KEY]) {
      return result[SETTINGS_STORAGE_KEY] as ExtensionSettings;
    }

    await save_settings(DEFAULT_SETTINGS);
    return DEFAULT_SETTINGS;
  } catch (error) {
    logger.error("Error loading settings:", error);
    return DEFAULT_SETTINGS;
  }
}

/**
 * Update specific setting fields
 *
 * @param partialSettings Object containing fields to update
 * @returns A promise that resolves with the complete updated settings
 */
export async function update_partial_settings(
  partialSettings: Partial<ExtensionSettings>
): Promise<ExtensionSettings> {
  try {
    const currentSettings = await load_settings();

    const updatedSettings: ExtensionSettings = {
      ...currentSettings,
      ...partialSettings,
    };

    await save_settings(updatedSettings);

    return updatedSettings;
  } catch (error) {
    logger.error("Error updating settings:", error);
    throw new Error(
      `Failed to update settings: ${error instanceof Error ? error.message : "Unknown error"}`
    );
  }
}
