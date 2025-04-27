import { MessageHandler } from "../models/message_types";

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
        console.error("Error sending message:", error);
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
                        console.error("Error sending response:", error);
                    }
                }).catch((error) => {
                    console.error("Error in async handler:", error);
                    sendResponse({ error: error.message });
                });
                return true; // Indicates that sendResponse will be called asynchronously
            } else {
                // For synchronous handlers, send response immediately
                sendResponse(result);
            }
        } catch (error) {
            console.error("Error handling message:", error);
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