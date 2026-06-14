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
  startedAt?: number;
  lastActivityAt?: number;
  isStalled: boolean;
  usage?: {
    prompt_tokens?: number;
    completion_tokens?: number;
    total_tokens?: number;
  };
};

export type UseInferenceOptions = {
  onComplete?: () => void;
  onError?: (error: string) => void;
  onUpdate?: (chunk: string) => void;
};

const STALL_THRESHOLD_MS = 30000;
const STALL_CHECK_INTERVAL_MS = 1000;

const INITIAL_STATE: InferenceState = { status: "idle", isStalled: false };

const isActiveInferenceStatus = (status: InferenceStatus) => {
  return status === "loading" || status === "streaming";
};

const getIsStalled = (
  state: InferenceState,
  currentTime: number = Date.now(),
) => {
  return (
    isActiveInferenceStatus(state.status) &&
    state.lastActivityAt !== undefined &&
    currentTime - state.lastActivityAt >= STALL_THRESHOLD_MS
  );
};

export const useInference = (options?: UseInferenceOptions) => {
  const [state, setState] = useState<InferenceState>(INITIAL_STATE);
  const stateRef = useRef<InferenceState>(INITIAL_STATE);

  const streamRef = useRef<ReturnType<typeof create_stream_connection> | null>(
    null,
  );
  const stallIntervalIdRef = useRef<number | null>(null);

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

  const stopStallMonitoring = useCallback(() => {
    if (stallIntervalIdRef.current !== null) {
      window.clearInterval(stallIntervalIdRef.current);
      stallIntervalIdRef.current = null;
    }
  }, []);

  const cleanupStream = useCallback(() => {
    stopStallMonitoring();

    if (streamRef.current) {
      logger.info("Closing inference stream connection", {
        requestId: stateRef.current.requestId,
      });
      streamRef.current.close();
      streamRef.current = null;
    }
  }, [stopStallMonitoring]);

  const startStallMonitoring = useCallback(
    (requestId: string) => {
      stopStallMonitoring();

      stallIntervalIdRef.current = window.setInterval(() => {
        setInferenceState((state) => {
          if (state.requestId !== requestId) {
            return state;
          }

          const isStalled = getIsStalled(state);

          return state.isStalled === isStalled
            ? state
            : { ...state, isStalled };
        });
      }, STALL_CHECK_INTERVAL_MS);
    },
    [setInferenceState, stopStallMonitoring],
  );

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

  const runInference = async (request: InferenceRequest) => {
    cleanupStream();
    const requestId = `req_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;

    
    try {
      await chrome.runtime.sendMessage({ type: "WAKE_UP_OFFSCREEN" });
    } catch (e) {
      logger.warn("Failed to wake up offscreen document, inference might fail if offscreen is suspended", e);
    }

    const stream = create_stream_connection({
      connectionName: "promptly-inference",
    });

    streamRef.current = stream;

    const startedAt = Date.now();

    setInferenceState({
      status: "loading",
      requestId,
      error: undefined,
      startedAt,
      lastActivityAt: startedAt,
      isStalled: false,
      usage: undefined,
    });
    startStallMonitoring(requestId);

    stream.onMessage(
      EventType.INFERENCE_CHUNK,
      (payload: InferenceChunkPayload) => {
        if (payload.requestId !== requestId) {
          return;
        }

        const lastActivityAt = Date.now();

        setInferenceState((state) => {
          return state.requestId === requestId
            ? {
                ...state,
                status: "streaming",
                lastActivityAt,
                isStalled: false,
              }
            : state;
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

        stopStallMonitoring();
        const lastActivityAt = Date.now();

                setInferenceState((state) => {
          return state.requestId === requestId
            ? {
                ...state,
                status: "complete",
                lastActivityAt,
                isStalled: false,
                usage: payload.usage,
              }
            : state;
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

        stopStallMonitoring();
        const lastActivityAt = Date.now();

        setInferenceState((state) => {
          return state.requestId === requestId
            ? {
                ...state,
                status: "error",
                error: errorMessage,
                lastActivityAt,
                isStalled: false,
              }
            : state;
        });

        options?.onError?.(errorMessage);
        setTimeout(cleanupStream, 500);
      },
    );

    stream.send(EventType.REQUEST_ACTION, {
      ...request,
      requestId,
    });

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
