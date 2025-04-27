import { listen_for_streams } from "../repositories/message_bus";

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
      send: <T = unknown>(eventType: any, payload: T) => void;
      close: () => void;
      onMessage: <T = unknown>(eventType: any, handler: (data: T) => void) => () => void;
    }, 
    identifier: number | string
  ) => void
): () => void {
  return listen_for_streams(connectionType, onConnection);
} 