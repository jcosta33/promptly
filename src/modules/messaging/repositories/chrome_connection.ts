import { ConnectionOptions, MessageHandler } from "../models/message_types";

// Store active connections
const activeConnections = new Map<string, Map<number | string, chrome.runtime.Port>>();

/**
 * Create a connection to a tab or the extension
 */
export function create_connection(options: ConnectionOptions): chrome.runtime.Port {
  try {
    // Determine if this is a content script or popup connecting to background,
    // or a background script connecting to a tab
    let port: chrome.runtime.Port;
    
    if (options.tabId !== undefined) {
      // Background connecting to a tab
      port = chrome.tabs.connect(options.tabId, {
        name: options.name,
        frameId: options.frameId
      });
    } else {
      // Content script or popup connecting to background
      port = chrome.runtime.connect({ name: options.name });
    }
    
    return port;
  } catch (error) {
    console.error("Error creating connection:", error);
    throw error;
  }
}

/**
 * Set up listener for incoming connections
 */
export function setup_connection_listener(
  connectionName: string,
  onConnect: (port: chrome.runtime.Port) => void
): () => void {
  const listener = (port: chrome.runtime.Port) => {
    if (!port.name.startsWith(connectionName)) {
      return;
    }
    
    try {
      onConnect(port);
    } catch (error) {
      console.error(`Error handling connection ${port.name}:`, error);
    }
  };
  
  chrome.runtime.onConnect.addListener(listener);
  
  // Return function to remove listener
  return () => {
    chrome.runtime.onConnect.removeListener(listener);
  };
}

/**
 * Send a message through an existing connection
 */
export function send_connection_message<T = unknown>(
  port: chrome.runtime.Port,
  message: T
): void {
  try {
    port.postMessage(message);
  } catch (error) {
    console.error("Error sending message through connection:", error);
    throw error;
  }
}

/**
 * Listen for messages on a connection
 */
export function listen_to_connection<T = unknown>(
  port: chrome.runtime.Port,
  handler: MessageHandler<T>
): () => void {
  const messageListener = (message: T) => {
    try {
      handler(message);
    } catch (error) {
      console.error("Error handling connection message:", error);
    }
  };
  
  const disconnectListener = () => {
    port.onMessage.removeListener(messageListener);
    port.onDisconnect.removeListener(disconnectListener);
    
    // Cleanup from active connections store if this is used in the background script
    try {
      for (const [name, connections] of activeConnections.entries()) {
        for (const [id, storedPort] of connections.entries()) {
          if (storedPort === port) {
            connections.delete(id);
            console.log(`Removed disconnected port: ${name}/${id}`);
            if (connections.size === 0) {
              activeConnections.delete(name);
            }
            break;
          }
        }
      }
    } catch (error) {
      console.error("Error cleaning up disconnected port:", error);
    }
  };
  
  port.onMessage.addListener(messageListener);
  port.onDisconnect.addListener(disconnectListener);
  
  // Return cleanup function
  return () => {
    port.onMessage.removeListener(messageListener);
    port.onDisconnect.removeListener(disconnectListener);
  };
}

/**
 * Track a connection in the active connections store (for background script use)
 */
export function track_connection(
  connectionName: string,
  identifier: number | string,
  port: chrome.runtime.Port
): void {
  if (!activeConnections.has(connectionName)) {
    activeConnections.set(connectionName, new Map());
  }
  
  const connections = activeConnections.get(connectionName)!;
  connections.set(identifier, port);
}

/**
 * Get all active connections for a specific connection name
 */
export function get_connections(connectionName: string): Map<number | string, chrome.runtime.Port> | undefined {
  return activeConnections.get(connectionName);
}

/**
 * Get a specific connection by name and identifier
 */
export function get_connection(
  connectionName: string,
  identifier: number | string
): chrome.runtime.Port | undefined {
  const connections = activeConnections.get(connectionName);
  if (!connections) return undefined;
  return connections.get(identifier);
}

/**
 * Disconnect and remove a connection
 */
export function remove_connection(
  connectionName: string,
  identifier: number | string
): void {
  const connections = activeConnections.get(connectionName);
  if (!connections) return;
  
  const port = connections.get(identifier);
  if (port) {
    try {
      port.disconnect();
    } catch (error) {
      console.error("Error disconnecting port:", error);
    }
  }
  
  connections.delete(identifier);
  if (connections.size === 0) {
    activeConnections.delete(connectionName);
  }
} 