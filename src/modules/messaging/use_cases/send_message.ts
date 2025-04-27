import { EventType } from "../models/event_types";
import { publish } from "../repositories/message_bus";

/**
 * Send a message to a specific target (tab or extension)
 * 
 * @param eventType - Type of the event to send
 * @param payload - Data to send with the event
 * @param tabId - Optional tab ID to send to, or undefined for extension (background)
 * @param frameId - Optional frame ID within the tab
 * @returns A promise resolving to the response, if any
 */
export async function send_message<T = unknown, R = any>(
  eventType: EventType,
  payload: T,
  tabId?: number,
  frameId?: number
): Promise<R> {
  return await publish<T>(eventType, payload, tabId, frameId);
} 