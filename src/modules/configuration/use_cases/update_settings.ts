import { EventType } from "../../messaging/models/event_types";
import { send_message } from "../../messaging/use_cases/send_message";
import { ExtensionSettings } from "../models/user_settings";
import { update_partial_settings } from "../repositories/settings_repository";

/**
 * Update extension settings
 * 
 * @param settings Partial settings object containing only the fields to update
 * @returns A promise that resolves with the complete updated settings
 */
export async function update_settings(
  settings: Partial<ExtensionSettings>
): Promise<ExtensionSettings> {
  // Update settings in storage
  const updatedSettings = await update_partial_settings(settings);
  
  // Broadcast the settings update event to all contexts
  await send_message(EventType.SETTINGS_UPDATE, updatedSettings);
  
  return updatedSettings;
} 