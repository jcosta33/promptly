import { useState, useRef, useCallback, useEffect } from "react";

import { EventType } from "$/modules/messaging/models/event_types";
import { create_stream_connection } from "$/modules/messaging/use_cases/create_stream_connection";
import { logger } from "$/utils/logger";

import type { InferenceRequest } from "$/modules/inference/models/inference_model";
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
  const stateRef = useRef<InferenceState>(INITIAL_STATE);

  const streamRef = useRef<ReturnType<typeof create_stream_connection> | null>(
    null,
  );
  const timeoutIdRef = useRef<number | null>(null);

  const setInferenceState = useCallback(
    (
      nextState:
        | InferenceState
        | ((currentState: InferenceState) => InferenceState),
    ) => {
      if (typeof nextState !== "function") {
        stateRef.current = nextState;
        setState(nextState);
        return;
      }

      setState((currentState) => {
        const resolvedState = nextState(currentState);

        stateRef.current = resolvedState;
        return resolvedState;
      });
    },
    [],
  );

  const cleanupStream = useCallback(() => {
    if (timeoutIdRef.current !== null) {
      clearTimeout(timeoutIdRef.current);
      timeoutIdRef.current = null;
    }
    if (streamRef.current) {
      logger.info("Closing inference stream connection", {
        requestId: stateRef.current.requestId,
      });
      streamRef.current.close();
      streamRef.current = null;
    }
  }, []);

  const sendStopInference = useCallback(() => {
    const currentState = stateRef.current;

    if (
      currentState.requestId &&
      currentState.status !== "idle" &&
      currentState.status !== "complete" &&
      streamRef.current
    ) {
      streamRef.current.send(EventType.STOP_INFERENCE, {
        requestId: currentState.requestId,
      });
    }
  }, []);

  useEffect(() => {
    return () => {
      sendStopInference();
      cleanupStream();
    };
  }, [cleanupStream, sendStopInference]);

  const runInference = (request: InferenceRequest) => {
    cleanupStream();
    const requestId = `req_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;

    const stream = create_stream_connection({
      connectionName: "promptly-inference",
    });

    streamRef.current = stream;

    setInferenceState({ status: "loading", requestId, error: undefined });

    stream.onMessage(
      EventType.INFERENCE_CHUNK,
      (payload: InferenceChunkPayload) => {
        if (payload.requestId !== requestId) {
          return;
        }

        setInferenceState((state) => {
          return { ...state, status: "streaming" };
        });

        options?.onUpdate?.(payload.token);
      },
    );

    stream.onMessage(
      EventType.INFERENCE_COMPLETE,
      (payload: InferenceCompletePayload) => {
        if (payload.requestId !== requestId) {
          return;
        }

        setInferenceState((state) => {
          return { ...state, status: "complete" };
        });
        options?.onComplete?.();
        setTimeout(cleanupStream, 1000);
      },
    );

    stream.onMessage(
      EventType.INFERENCE_ERROR,
      (payload: InferenceErrorPayload) => {
        if (payload.requestId !== requestId) {
          return;
        }

        const errorMessage =
          payload.error || payload.message || "Unknown error";

        setInferenceState((state) => {
          return { ...state, status: "error", error: errorMessage };
        });

        options?.onError?.(errorMessage);
        setTimeout(cleanupStream, 500);
      },
    );

    stream.send(EventType.REQUEST_ACTION, {
      ...request,
      requestId,
    });

    timeoutIdRef.current = window.setTimeout(() => {
      if (streamRef.current === stream) {
        const errorMsg = "Inference request timed out";
        setInferenceState((state) => {
          return state.requestId === requestId
            ? { ...state, status: "error", error: errorMsg }
            : state;
        });
        options?.onError?.(errorMsg);
        cleanupStream();
      }
    }, 600000);

    return requestId;
  };

  const stopInference = () => {
    sendStopInference();
  };

  const cancelInference = () => {
    sendStopInference();
    cleanupStream();
    setInferenceState(INITIAL_STATE);
  };

  return {
    inferenceState: state,
    runInference,
    cancelInference,
    stopInference,
  };
};
