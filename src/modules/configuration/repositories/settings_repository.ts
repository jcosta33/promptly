import { DEFAULT_SETTINGS, ExtensionSettings } from "../models/user_settings";

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
    console.log("Settings saved:", settings);
  } catch (error) {
    console.error("Error saving settings:", error);
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
    console.log("Settings loaded:", result);

    if (result && result[SETTINGS_STORAGE_KEY]) {
      // Return the saved settings
      return result[SETTINGS_STORAGE_KEY] as ExtensionSettings;
    }

    // If no settings found, return defaults and save them
    await save_settings(DEFAULT_SETTINGS);
    return DEFAULT_SETTINGS;
  } catch (error) {
    console.error("Error loading settings:", error);

    // On error, return defaults but don't try to save them (might fail for the same reason)
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
    // Get current settings
    const currentSettings = await load_settings();

    // Create updated settings by merging current with partial
    const updatedSettings: ExtensionSettings = {
      ...currentSettings,
      ...partialSettings,
    };
    console.log("Current settings:", currentSettings);
    console.log("Partial settings:", partialSettings);

    // Save the updated settings
    await save_settings(updatedSettings);

    return updatedSettings;
  } catch (error) {
    console.error("Error updating settings:", error);
    throw new Error(
      `Failed to update settings: ${error instanceof Error ? error.message : "Unknown error"}`
    );
  }
}
