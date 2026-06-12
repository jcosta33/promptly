import { MessageEvent } from "../helpers/create_message_event";
import { EventType } from "../models/event_types";
import { MessageHandler } from "../models/message_types";
import { subscribe } from "../repositories/message_bus";

/**
 * Listen for messages of a specific event type
 *
 * @param eventType - Type of event to listen for
 * @param handler - Function to call when a matching event is received
 * @returns A function to call to stop listening
 */
export function listen_to_messages<T = unknown>(
  eventType: EventType,
  handler: MessageHandler<T>,
): () => void {
  return subscribe<T>(eventType, (event: MessageEvent<T>) => {
    return handler(event.payload);
  });
}
