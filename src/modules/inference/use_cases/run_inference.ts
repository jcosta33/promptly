import { MLCEngine } from "@mlc-ai/web-llm";

import { EventType } from "../../messaging/models/event_types";
import { create_stream_connection } from "../../messaging/use_cases/create_stream_connection";
import { send_message } from "../../messaging/use_cases/send_message";
import {
  DEFAULT_INFERENCE_PARAMETERS,
  InferenceRequest,
  InferenceResponse,
} from "../models/inference_model";
import { generate_text_stream } from "../repositories/generate_text_stream";

/**
 * Stream the inference output back to the client
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
 * Run inference using WebLLM
 *
 * @param engine The loaded LLM engine
 * @param request The inference request
 * @param requestId Unique request ID to track this inference operation
 * @param streamOptions Options for streaming the output
 * @returns A promise that resolves with the inference response
 */
export async function run_inference(
  engine: MLCEngine,
  request: InferenceRequest,
  requestId: string
): Promise<InferenceResponse> {
  if (!engine) {
    throw new Error("No LLM engine provided");
  }

  const { messages } = request;

  // Merge default parameters with any provided in the request
  const parameters = {
    ...DEFAULT_INFERENCE_PARAMETERS,
    ...request.parameters,
  };

  const stream: any = null;

  try {
    // Run inference
    let finalText = "";

    let usageInfo:
      | {
          prompt_tokens?: number;
          completion_tokens?: number;
          total_tokens?: number;
        }
      | undefined = undefined;

    await generate_text_stream({
      engine,
      messages,
      parameters,
      onToken: async (token: string) => {
        if (parameters.stream) {
          // Send token via connection or message
          stream.send(EventType.INFERENCE_CHUNK, { text: token, requestId });
        }
      },
      onComplete: (text: string, usage: any) => {
        finalText = text;
        usageInfo = usage;
      },
    });

    // Construct the final response
    const response: InferenceResponse = {
      text: finalText,
      usage: usageInfo,
    };

    // Send completion message
    if (stream) {
      stream.send(EventType.INFERENCE_COMPLETE, { response, requestId });
      stream.close();
    } else {
      await send_message(EventType.INFERENCE_COMPLETE, { response, requestId });
    }

    return response;
  } catch (error) {
    const errorMessage =
      error instanceof Error ? error.message : "Unknown error during inference";

    // Send error message
    try {
      if (stream) {
        stream.send(EventType.INFERENCE_ERROR, {
          message: errorMessage,
          code: "INFERENCE_FAILED",
          requestId,
        });
        stream.close();
      } else {
        await send_message(EventType.INFERENCE_ERROR, {
          message: errorMessage,
          code: "INFERENCE_FAILED",
          requestId,
        });
      }
    } catch (msgError) {
      console.error("Error sending inference error event:", msgError);
    }

    throw error;
  }
}
