import type { Message } from "../models/inference_model";

/**
 * Dynamically prunes the message history to prevent WebGPU OOM errors,
 * while maintaining the system prompt and strict role alternation rules
 * (WebLLM requires user -> assistant -> user).
 */
export function pruneContext(messages: Message[], maxHistory: number = 20): Message[] {
  let truncatedMessages = messages;

  if (messages.length > maxHistory) {
    const hasSystem = messages[0]?.role === "system";
    const systemMessage = hasSystem ? messages[0] : null;
    
    // We keep the last N messages
    let recentMessages = messages.slice(-maxHistory);
    
    // Create a summarized placeholder for the pruned messages
    // The pruned count is (Total - N - (system ? 1 : 0))
    const prunedCount = messages.length - maxHistory - (hasSystem ? 1 : 0);
    
    if (prunedCount > 0) {
        // We inject a system note that messages were pruned
        const summaryMessage: Message = {
            role: "user", // Must be user to satisfy WebLLM role alternation rules
            content: `[System Note: The oldest ${prunedCount} messages in this conversation have been summarized and archived to conserve context memory. Maintain continuity with the user.]`
        };
        // If the array we are prepending to already starts with "user", remove it to prevent "user -> user"
        if (recentMessages.length > 0 && recentMessages[0].role === "user") {
            recentMessages.shift();
        }
        recentMessages = [summaryMessage, ...recentMessages];
    } else {
        // Ensure the array correctly alternates roles, starting with User
        if (recentMessages.length > 0 && recentMessages[0].role === "assistant") {
          recentMessages.shift(); // Remove the leading assistant message
        }
    }

    truncatedMessages = hasSystem && systemMessage ? [systemMessage, ...recentMessages] : recentMessages;
  }
  
  return truncatedMessages;
}
