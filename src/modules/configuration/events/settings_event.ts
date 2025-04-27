import { EventType } from "../../messaging/models/event_types";
import { ExtensionSettings } from "../models/user_settings";

/**
 * Settings update event type
 */
export type SettingsUpdateEvent = {
  type: EventType.SETTINGS_UPDATE;
  payload: ExtensionSettings;
};
