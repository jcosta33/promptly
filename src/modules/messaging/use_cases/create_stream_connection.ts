import { EventType, PayloadForEvent } from "../models/event_types";
import { create_stream } from "../repositories/message_bus";
import { MessageStreamOptions, TypedMessageHandler } from "../models/message_types";

/**
 * Create a stream connection for persistent bidirectional messaging
 * 
 * @param options - Connection options (name, target tab/frame)
 * @returns An object with methods to send messages, close the connection, and listen for incoming messages
 */
export function create_stream_connection(options: MessageStreamOptions): {
  send: <TEventType extends EventType>(eventType: TEventType, payload: PayloadForEvent<TEventType>) => void;
  close: () => void;
  onMessage: <TEventType extends EventType>(eventType: TEventType, handler: TypedMessageHandler<TEventType>) => () => void;
} {
  return create_stream(options);
} 