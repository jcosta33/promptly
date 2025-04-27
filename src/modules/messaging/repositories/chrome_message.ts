import type { MessageHandler } from "../models/message_types";
import { logger } from "$/utils/logger";

/**
 * Send a one-time message to a specific tab or to the extension
 */
export async function send_message<T = unknown, R = any>(
    message: T,
    tabId?: number,
    frameId?: number
): Promise<R> {
    try {
        if (tabId !== undefined) {
            // Send message to a specific tab
            if (frameId !== undefined) {
                return await chrome.tabs.sendMessage(tabId, message, { frameId }) as R;
            }
            return await chrome.tabs.sendMessage(tabId, message) as R;
        } else {
            // Send message to the extension (background script)
            return await chrome.runtime.sendMessage(message) as R;
        }
    } catch (error) {
        logger.error("Error sending message:", error);
        throw error;
    }
}

/**
 * Listen for one-time messages
 */
export function listen_for_messages<T = unknown, R = any>(handler: (message: T, sender: chrome.runtime.MessageSender) => R | Promise<R>): () => void {
    const listener = (
        message: T,
        sender: chrome.runtime.MessageSender,
        sendResponse: (response?: any) => void
    ) => {
        try {
            // Pass both message and sender to the handler
            const result = handler(message, sender);
            
            // Handle Promise results
            if (result instanceof Promise) {
                // For promises, send response asynchronously
                result.then((response) => {
                    try {
                        sendResponse(response);
                    } catch (error) {
                        logger.warn("Error sending response (might be normal if receiver disconnected):", error);
                    }
                }).catch((error) => {
                    logger.error("Error in async message handler:", error);
                    sendResponse({ error: error.message });
                });
                return true; // Indicates that sendResponse will be called asynchronously
            } else {
                // For synchronous handlers, send response immediately
                sendResponse(result);
            }
        } catch (error) {
            logger.error("Error handling message synchronously:", error);
            sendResponse({ error: error instanceof Error ? error.message : "Unknown error" });
        }
        return false; // Indicates that sendResponse has been called synchronously
    };

    chrome.runtime.onMessage.addListener(listener);

    // Return unsubscribe function
    return () => {
        chrome.runtime.onMessage.removeListener(listener);
    };
} 