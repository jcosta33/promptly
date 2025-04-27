import { listen_for_streams } from "../repositories/message_bus";
import type { EventType, PayloadForEvent } from "../models/event_types";
import type { TypedMessageHandler } from "../models/message_types";

/**
 * Set up a listener for incoming connections
 * 
 * @param connectionType - Base name for the connections to listen for
 * @param onConnection - Callback that receives the stream interface and connection identifier
 * @returns A function to call to remove the listener
 */
export function setup_connection_listener(
  connectionType: string,
  onConnection: (
    stream: {
      send: <TEventType extends EventType>(
        eventType: TEventType,
        payload: PayloadForEvent<TEventType>
      ) => void;
      close: () => void;
      onMessage: <TEventType extends EventType>(
        eventType: TEventType,
        handler: TypedMessageHandler<TEventType>
      ) => () => void;
    },
    identifier: number | string
  ) => void
): () => void {
  return listen_for_streams(connectionType, onConnection);
} 