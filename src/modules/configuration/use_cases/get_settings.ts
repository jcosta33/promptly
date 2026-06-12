import { load_settings } from "../repositories/settings_repository";

import type { ExtensionSettings } from "../models/user_settings";

/**
 * Get the current extension settings
 *
 * @returns A promise that resolves with the current settings
 */
export async function get_settings(): Promise<ExtensionSettings> {
  return await load_settings();
}
