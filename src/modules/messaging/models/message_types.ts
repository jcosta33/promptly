import type { EventType, PayloadForEvent } from "./event_types";

/**
 * Function type for message handlers with event-specific payload typing
 */
export type TypedMessageHandler<TEventType extends EventType, TReturn = unknown> =
  (message: PayloadForEvent<TEventType>) => void | TReturn | Promise<TReturn>;

/**
 * Generic message handler for when event type isn't known at compile time
 */
export type MessageHandler<TPayload = unknown, TReturn = unknown> = (message: TPayload) => void | TReturn | Promise<TReturn>;

/**
 * Function type for message listeners that return an unsubscribe function
 */
export type MessageListener<TPayload = unknown> = (handler: MessageHandler<TPayload>) => () => void;

/**
 * Connection options for establishing persistent connections
 */
export type ConnectionOptions = {
  name: string;
  tabId?: number;
  frameId?: number;
};

/**
 * Message stream options for streaming data
 */
export type MessageStreamOptions = {
  connectionName: string;
  tabId?: number;
  frameId?: number;
}; 