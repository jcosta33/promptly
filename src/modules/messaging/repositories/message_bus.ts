import {
  MessageEvent,
  create_message_event,
} from "../helpers/create_message_event";
import { EventType, PayloadForEvent } from "../models/event_types";
import {
  ConnectionOptions,
  MessageHandler,
  MessageStreamOptions,
  TypedMessageHandler,
} from "../models/message_types";

import {
  create_connection,
  listen_to_connection,
  setup_connection_listener,
  track_connection,
  remove_connection,
  send_connection_message,
} from "./chrome_connection";
import { send_message, listen_for_messages } from "./chrome_message";

// Store event listeners by event type
const eventListeners = new Map<EventType, Set<MessageHandler<any>>>();

// Store connection handlers by connection name
const connectionHandlers = new Map<
  string,
  Set<(port: chrome.runtime.Port) => void>
>();

// Generate unique connection names
function generate_connection_name(baseType: string): string {
  return `${baseType}_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
}

/**
 * Subscribe to a specific event type
 */
export function subscribe<TPayload = unknown>(
  eventType: EventType,
  handler: MessageHandler<MessageEvent<TPayload>>
): () => void {
  if (!eventListeners.has(eventType)) {
    eventListeners.set(eventType, new Set());
  }

  const listeners = eventListeners.get(eventType)!;
  listeners.add(handler);

  // Return unsubscribe function
  return () => {
    listeners.delete(handler);
    if (listeners.size === 0) {
      eventListeners.delete(eventType);
    }
  };
}

/**
 * Publish an event
 */
export async function publish<TPayload = unknown>(
  eventType: EventType,
  payload: TPayload,
  tabId?: number,
  frameId?: number
): Promise<any> {
  console.log(`Publishing event: ${eventType}`, {
    payload,
    tabId: tabId || "none (to extension)",
    frameId: frameId || "none",
  });

  const event = create_message_event(eventType, payload);

  try {
    const result = await send_message(event, tabId, frameId);
    console.log(`Published event ${eventType} successfully:`, result);
    return result;
  } catch (error) {
    console.error(`Error publishing event ${eventType}:`, error);
    throw error;
  }
}

/**
 * Initialize the message bus to handle incoming messages
 */
export function initialize_message_bus(): () => void {
  // Listen for one-time messages
  const unsubscribeMessages = listen_for_messages<MessageEvent<any>>(
    (event, sender) => {
      if (!event || !event.type) {
        console.warn("Received malformed event:", event);
        return;
      }

      // We have access to sender information if needed for future message filtering
      // For now, just log it for debugging purposes
      if (process.env.NODE_ENV !== "production") {
        console.log("Message received from:", sender);
      }

      const listeners = eventListeners.get(event.type);

      if (listeners && listeners.size > 0) {
        listeners.forEach((handler) => {
          try {
            handler(event);
          } catch (error) {
            console.error(`Error in event handler for ${event.type}:`, error);
          }
        });
      }

      // Return any needed response data
      return { received: true, timestamp: Date.now() };
    }
  );

  // Return cleanup function
  return () => {
    unsubscribeMessages();
  };
}

/**
 * Register a handler for a specific connection type
 */
export function register_connection_handler(
  connectionType: string,
  handler: (port: chrome.runtime.Port) => void
): () => void {
  if (!connectionHandlers.has(connectionType)) {
    connectionHandlers.set(connectionType, new Set());

    // Set up listener for this connection type if it's the first handler
    setup_connection_listener(connectionType, (port) => {
      const handlers = connectionHandlers.get(connectionType);
      if (handlers) {
        handlers.forEach((h) => {
          try {
            h(port);
          } catch (error) {
            console.error(
              `Error in connection handler for ${connectionType}:`,
              error
            );
          }
        });
      }
    });
  }

  const handlers = connectionHandlers.get(connectionType)!;
  handlers.add(handler);

  // Return unregister function
  return () => {
    handlers.delete(handler);
    if (handlers.size === 0) {
      connectionHandlers.delete(connectionType);
    }
  };
}

/**
 * Create a stream connection for persistent messaging
 */
export function create_stream(options: MessageStreamOptions): {
  send: <TEventType extends EventType>(
    eventType: TEventType,
    payload: PayloadForEvent<TEventType>
  ) => void;
  close: () => void;
  onMessage: <TEventType extends EventType>(
    eventType: TEventType,
    handler: TypedMessageHandler<TEventType>
  ) => () => void;
} {
  const connectionName =
    options.connectionName || generate_connection_name("stream");
  const port = create_connection({
    name: connectionName,
    tabId: options.tabId,
    frameId: options.frameId,
  });

  // Message handler map by event type
  const handlers = new Map<EventType, Set<MessageHandler<any>>>();

  // Set up message listener for the port
  const unsubscribePortListener = listen_to_connection<MessageEvent<any>>(
    port,
    (event) => {
      if (!event || !event.type) {
        console.warn("Received malformed event via stream:", event);
        return;
      }

      const eventType = event.type as EventType;
      const eventHandlers = handlers.get(eventType);

      if (eventHandlers && eventHandlers.size > 0) {
        eventHandlers.forEach((handler) => {
          try {
            handler(event.payload);
          } catch (error) {
            console.error(`Error in stream handler for ${eventType}:`, error);
          }
        });
      }
    }
  );

  // Methods for the stream interface
  const send = <TEventType extends EventType>(
    eventType: TEventType,
    payload: PayloadForEvent<TEventType>
  ): void => {
    const event = create_message_event(eventType, payload);
    send_connection_message(port, event);
  };

  const close = (): void => {
    unsubscribePortListener();
    try {
      port.disconnect();
    } catch (error) {
      console.error("Error disconnecting port:", error);
    }
  };

  const onMessage = <TEventType extends EventType>(
    eventType: TEventType,
    handler: TypedMessageHandler<TEventType>
  ): (() => void) => {
    if (!handlers.has(eventType)) {
      handlers.set(eventType, new Set());
    }

    const eventHandlers = handlers.get(eventType)!;
    // Type cast is necessary here because TypedMessageHandler is compatible with MessageHandler
    eventHandlers.add(handler as MessageHandler<any>);

    // Return unsubscribe function
    return () => {
      eventHandlers.delete(handler as MessageHandler<any>);
      if (eventHandlers.size === 0) {
        handlers.delete(eventType);
      }
    };
  };

  return {
    send,
    close,
    onMessage,
  };
}

/**
 * Listen for incoming stream connections (for background script)
 */
export function listen_for_streams(
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
  // Use the register_connection_handler to avoid duplicate listeners
  return register_connection_handler(connectionType, (port) => {
    // Determine identifier (tabId, popupId, etc.)
    const identifier =
      port.sender?.tab?.id ||
      (port.sender?.url?.includes("popup.html") ? "popup" : "unknown");

    // Track the connection for potential future use
    track_connection(connectionType, identifier, port);

    // Create a stream interface for this connection
    const stream = {
      send: <TEventType extends EventType>(
        eventType: TEventType,
        payload: PayloadForEvent<TEventType>
      ): void => {
        const event = create_message_event(eventType, payload);

        console.log("Sending event", {
          eventType,
          payload,
        });

        send_connection_message(port, event);
      },
      close: (): void => {
        try {
          port.disconnect();
        } catch (error) {
          console.error("Error disconnecting port:", error);
        }
        remove_connection(connectionType, identifier);
      },
      onMessage: <TEventType extends EventType>(
        eventType: TEventType,
        handler: TypedMessageHandler<TEventType>
      ): (() => void) => {
        const messageHandler = (event: MessageEvent<any>) => {
          if (event.type === eventType) {
            handler(event.payload);
          }
        };

        port.onMessage.addListener(messageHandler);

        // Return unsubscribe function
        return () => {
          port.onMessage.removeListener(messageHandler);
        };
      },
    };

    try {
      onConnection(stream, identifier);
    } catch (error) {
      console.error(
        `Error handling new stream connection (${connectionType}/${identifier}):`,
        error
      );
    }
  });
}
