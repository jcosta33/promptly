import { initialize_message_bus } from "../repositories/message_bus";

/**
 * Initialize the messaging system
 * 
 * This sets up the event listeners needed for the message bus to function.
 * Should be called early in the extension lifecycle (background script and content script).
 * 
 * @returns A function to call to clean up event listeners
 */
export function initialize_messaging(): () => void {
  return initialize_message_bus();
} 