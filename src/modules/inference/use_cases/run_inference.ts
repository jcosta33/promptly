import { logger } from "$/utils/logger";

import { DEFAULT_INFERENCE_PARAMETERS } from "../models/inference_model";
import { generate_text_stream } from "../repositories/generate_text_stream";

import type {
  InferenceRequest,
  InferenceResponse,
} from "../models/inference_model";
import type { MLCEngine } from "@mlc-ai/web-llm";

/**
 * Run inference using WebLLM.
 * NOTE: This function's implementation does NOT handle streaming back to the client.
 * The streaming logic (sending INFERENCE_CHUNK etc.) seems to be handled directly
 * in the background script where generate_text_stream's callbacks are used.
 * This use case primarily wraps the call to generate_text_stream.
 *
 * @param engine The loaded LLM engine.
 * @param request The inference request.
 * @param requestId Unique request ID (currently unused in this implementation).
 * @returns A promise that resolves with the inference response.
 */
export async function run_inference(
  engine: MLCEngine,
  request: InferenceRequest,
  _requestId: string, // Retained parameter, though unused internally
): Promise<InferenceResponse> {
  if (!engine) {
    throw new Error("No LLM engine provided");
  }

    const { messages } = request;

  // Context Truncation: Sliding window to prevent WebGPU OOM
  const MAX_HISTORY = 10;
  let truncatedMessages = messages;
  if (messages.length > MAX_HISTORY + 1) {
    const systemMessage = messages[0];
    let recentMessages = messages.slice(-MAX_HISTORY);
    // Ensure the first message after system is a user message
    if (recentMessages.length > 0 && recentMessages[0].role === "assistant") {
      recentMessages = recentMessages.slice(1);
    }
    truncatedMessages = [systemMessage, ...recentMessages];
  }

  const parameters = {
    ...DEFAULT_INFERENCE_PARAMETERS,
    ...request.parameters,
    stream: true,
  };

  let finalText = "";
  let usageInfo: InferenceResponse["usage"] = undefined;

  try {
    // Call generate_text_stream, results handled by callbacks
    await generate_text_stream({
      engine,
      messages: truncatedMessages,
      parameters,
      onToken: (_token: string) => {
        // This callback is now handled by the caller (background script)
      },
      onComplete: (
        text: string,
        usage?: {
          prompt_tokens?: number;
          completion_tokens?: number;
          total_tokens?: number;
        },
      ) => {
        finalText = text;
        usageInfo = usage
          ? {
              prompt_tokens: usage.prompt_tokens,
              completion_tokens: usage.completion_tokens,
              total_tokens: usage.total_tokens,
            }
          : undefined;
      },
    });

    // Construct the final response object
    const response: InferenceResponse = {
      text: finalText,
      usage: usageInfo,
    };

    // Removed sending INFERENCE_COMPLETE or error messages here -
    // this should be handled by the background script using the stream.

    return response; // Return the final response
  } catch (error) {
    // Log error locally, but don't try to send error message here.
    logger.error("Error during generate_text_stream in run_inference:", error);

    // Re-throw the error to be handled by the caller (background script)
    throw error;
  }
}
