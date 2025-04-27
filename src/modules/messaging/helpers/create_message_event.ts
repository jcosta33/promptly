import { EventType } from "../models/event_types";

/**
 * Base message event type
 */
export type MessageEvent<T = unknown> = {
  type: EventType;
  payload: T;
  source?: string;
  timestamp?: number;
};

/**
 * Create a new message event
 */
export function create_message_event<T>(
  type: EventType,
  payload: T,
  source: string = "unknown"
): MessageEvent<T> {
  return {
    type,
    payload,
    source,
    timestamp: Date.now(),
  };
}
