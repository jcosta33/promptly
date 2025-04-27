import { useState, useEffect, useRef } from "react";

import type { InferenceRequest } from "$/modules/inference/models/inference_model";
import { EventType } from "$/modules/messaging/models/event_types";
import { create_stream_connection } from "$/modules/messaging/use_cases/create_stream_connection";
import { logger } from "$/utils/logger";

import type {
  InferenceChunkPayload,
  InferenceCompletePayload,
  InferenceErrorPayload,
} from "$/modules/messaging/models/event_types";

export type InferenceStatus =
  | "idle"
  | "loading"
  | "streaming"
  | "complete"
  | "error";

// Simplified state: Only tracks process status, error, and ID
export type InferenceState = {
  status: InferenceStatus;
  error?: string;
  requestId?: string;
};

export type UseInferenceOptions = {
  onComplete?: () => void;
  onError?: (error: string) => void;
  onUpdate?: (chunk: string) => void;
};

const INITIAL_STATE: InferenceState = { status: "idle" };

export const useInference = (options?: UseInferenceOptions) => {
  const [state, setState] = useState<InferenceState>(INITIAL_STATE);

  const streamRef = useRef<ReturnType<typeof create_stream_connection> | null>(null);
  const timeoutIdRef = useRef<number | null>(null);

  const cleanupStream = () => {
    if (timeoutIdRef.current !== null) {
      clearTimeout(timeoutIdRef.current);
      timeoutIdRef.current = null;
    }
    if (streamRef.current) {
      logger.info("Closing inference stream connection", { requestId: state.requestId });
      streamRef.current.close();
      streamRef.current = null;
    }
  };

  const runInference = (request: InferenceRequest) => {
    cleanupStream();
    const requestId = `req_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;

    const stream = create_stream_connection({
      connectionName: "promptly-inference",
    });

    streamRef.current = stream;

    // --- Set Initial Loading State ---
    setState({ status: "loading", requestId, error: undefined });

    // --- Stream Event Handlers ---
    stream.onMessage(
      EventType.INFERENCE_CHUNK,
      (payload: InferenceChunkPayload) => {
        // Only process if it matches the current request
        if (payload.requestId !== requestId) {
          return;
        }

        setState((state) => {
          return { ...state, status: "streaming" };
        });

        options?.onUpdate?.(payload.token);
      }
    );

    stream.onMessage(
      EventType.INFERENCE_COMPLETE,
      (payload: InferenceCompletePayload) => {
        if (payload.requestId !== requestId) {
          return;
        }

        // --- Set Complete State ---
        setState((state) => {
          return { ...state, status: "complete" };
        });
        options?.onComplete?.();
        setTimeout(cleanupStream, 1000);
      }
    );

    stream.onMessage(
      EventType.INFERENCE_ERROR,
      (payload: InferenceErrorPayload) => {
        if (payload.requestId !== requestId) {
          return;
        }

        const errorMessage =
          payload.error || payload.message || "Unknown error";
        // --- Set Error State ---
        setState((state) => {
          return { ...state, status: "error", error: errorMessage };
        });

        options?.onError?.(errorMessage);
        setTimeout(cleanupStream, 500);
      }
    );

    // Send the request
    stream.send(EventType.REQUEST_ACTION, {
      ...request,
      requestId,
    });

    // Timeout
    timeoutIdRef.current = window.setTimeout(() => {
      // Check if the stream associated with *this* timeout is still active
      if (streamRef.current === stream) {
        const errorMsg = "Inference request timed out";
        // --- Set Error State (Timeout) ---
        setState((state) =>
        // Avoid setting state if request ID changed (e.g., new request started before timeout)
        {
          return state.requestId === requestId
            ? { ...state, status: "error", error: errorMsg }
            : state;
        }
        );
        options?.onError?.(errorMsg);
        cleanupStream(); // Clean up the timed-out stream
      }
    }, 600000); // 10 minute timeout

    return requestId;
  };

  const resetInference = () => {
    cleanupStream();
    setState(INITIAL_STATE);
  };

  const cancelInference = () => {
    if (
      state.requestId &&
      state.status !== "idle" &&
      state.status !== "complete" &&
      streamRef.current
    ) {
      streamRef.current.send(EventType.CANCEL_INFERENCE, {
        requestId: state.requestId,
      });
      cleanupStream();
      setState(INITIAL_STATE);
    }
  };

  useEffect(() => {
    return cleanupStream;
  }, []);

  return {
    inferenceState: state,
    runInference,
    resetInference,
    cancelInference,
  };
};
