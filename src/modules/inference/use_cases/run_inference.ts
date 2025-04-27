import type { MLCEngine } from "@mlc-ai/web-llm";
import { EventType } from "../../messaging/models/event_types";
import {
    DEFAULT_INFERENCE_PARAMETERS,
} from "../models/inference_model";
import type {
    InferenceRequest,
    InferenceResponse,
} from "../models/inference_model";
import { generate_text_stream } from "../repositories/generate_text_stream";
import { logger } from "$/utils/logger";

/**
 * Stream the inference output back to the client
 * NOTE: This type seems unused as the function does not actually handle streaming options directly.
 */
type StreamOptions = {
  /**
   * Whether to use a persistent connection for streaming tokens
   */
  useConnection: boolean;

  /**
   * Target tab ID for streaming (if connection is used)
   */
  tabId?: number;

  /**
   * Frame ID for streaming (if connection is used)
   */
  frameId?: number;
};

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
  requestId: string // Retained parameter, though unused internally
): Promise<InferenceResponse> {
  if (!engine) {
    throw new Error("No LLM engine provided");
  }

  const { messages } = request;

  const parameters = {
    ...DEFAULT_INFERENCE_PARAMETERS,
    ...request.parameters,
    // Force stream true as generate_text_stream expects it for callbacks
    stream: true,
  };

  let finalText = "";
  let usageInfo: InferenceResponse["usage"] = undefined;

  try {
    // Call generate_text_stream, results handled by callbacks
    await generate_text_stream({
      engine,
      messages,
      parameters,
      onToken: (token: string) => {
        // This callback is now handled by the caller (background script)
      },
      onComplete: (text: string, usage?: { prompt_tokens?: number; completion_tokens?: number; total_tokens?: number; }) => {
        finalText = text;
        usageInfo = usage ? {
            prompt_tokens: usage.prompt_tokens,
            completion_tokens: usage.completion_tokens,
            total_tokens: usage.total_tokens
          } : undefined;
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
