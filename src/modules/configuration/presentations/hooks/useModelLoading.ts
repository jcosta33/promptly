import { useCallback, useState } from "react";

import {
  EventType,
  type InferenceErrorPayload,
  type ModelRuntimeStatus,
  type ModelStatusResponsePayload,
  type RuntimeCapabilitiesResponsePayload,
  type RuntimeCapabilityStatus,
} from "$/modules/messaging/models/event_types";
import { create_stream_connection } from "$/modules/messaging/use_cases/create_stream_connection";
import { logger } from "$/utils/logger";

const initialModelRuntimeStatus: ModelRuntimeStatus = {
  phase: "unloaded",
  message: "No model loaded",
};

const initialRuntimeCapabilityStatus: RuntimeCapabilityStatus = {
  extension: "unavailable",
  webGpu: "unknown",
  model: initialModelRuntimeStatus,
  message: "Checking runtime readiness...",
};

export function useModelLoading() {
  const [progress, setProgress] = useState<number>(0);
  const [status, setStatus] = useState<string>("");
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [runtimeStatus, setRuntimeStatus] = useState<ModelRuntimeStatus>(
    initialModelRuntimeStatus,
  );
  const [runtimeCapabilities, setRuntimeCapabilities] =
    useState<RuntimeCapabilityStatus>(initialRuntimeCapabilityStatus);

  const applyRuntimeStatus = useCallback(
    (payload: ModelStatusResponsePayload) => {
      const { requestId: _requestId, ...statusPayload } = payload;
      setRuntimeStatus(statusPayload);
      setRuntimeCapabilities((currentStatus) => {
        return {
          ...currentStatus,
          model: statusPayload,
        };
      });

      if (statusPayload.phase === "error") {
        setError(statusPayload.error || statusPayload.message || "Model error");
      } else {
        setError(null);
      }
    },
    [],
  );

  const applyRuntimeCapabilities = useCallback(
    (payload: RuntimeCapabilitiesResponsePayload) => {
      const { requestId: _requestId, ...capabilityStatus } = payload;

      setRuntimeCapabilities(capabilityStatus);
      setRuntimeStatus(capabilityStatus.model);

      if (capabilityStatus.model.phase === "error") {
        setError(
          capabilityStatus.model.error ||
            capabilityStatus.model.message ||
            "Model error",
        );
      } else {
        setError(null);
      }
    },
    [],
  );

  // Function to load a model
  const loadModel = useCallback(
    async (modelId: string) => {
      if (!modelId) {
        setError("No model ID provided");
        return;
      }

      setIsLoading(true);
      setProgress(0);
      setStatus("Preparing to load model...");
      setError(null);

      try {
        logger.info("Starting model load for:", modelId);

        // Generate a random request ID for tracking
        const requestId = `req_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
        logger.debug("Generated model load request ID:", requestId);

        // Create a persistent connection for the model loading process
        const connection = create_stream_connection({
          connectionName: "promptly-inference",
        });

        const cleanup: {
          timeoutId?: number;
          unsubscribeProgress?: () => void;
          unsubscribeStatus?: () => void;
          unsubscribeError?: () => void;
        } = {};

        const finish = () => {
          if (cleanup.timeoutId) {
            window.clearTimeout(cleanup.timeoutId);
          }
          cleanup.unsubscribeProgress?.();
          cleanup.unsubscribeStatus?.();
          cleanup.unsubscribeError?.();
          connection.close();
        };

        // Set up listeners for progress and errors
        cleanup.unsubscribeProgress = connection.onMessage(
          EventType.MODEL_LOADING_PROGRESS,
          (payload) => {
            logger.debug("Received model loading progress:", payload);
            setProgress(payload.progress * 100);
            setStatus(payload.status || payload.text || "Loading model...");

            // Runtime status, not raw progress, is the authoritative completion signal.
          },
        );

        cleanup.unsubscribeStatus = connection.onMessage(
          EventType.MODEL_STATUS_RESPONSE,
          (payload) => {
            applyRuntimeStatus(payload);

            if (payload.phase === "loaded") {
              setProgress((payload.progress ?? 1) * 100);
              setStatus(payload.message || "Model loaded successfully");
              setIsLoading(false);
              finish();
            } else if (payload.phase === "error") {
              setIsLoading(false);
              finish();
            }
          },
        );

        cleanup.unsubscribeError = connection.onMessage(
          EventType.INFERENCE_ERROR,
          (payload: InferenceErrorPayload) => {
            const errorMessage =
              payload.error || payload.message || "Model loading failed";
            setError(errorMessage);
            setRuntimeStatus({
              phase: "error",
              modelId,
              error: errorMessage,
            });
            setIsLoading(false);
            finish();
          },
        );

        // Send the load model request
        connection.send(EventType.MODEL_LOAD_REQUEST, {
          requestId,
          modelId,
          useStream: true,
        });

        logger.info("Model load request sent via stream", { requestId });

        // Set up a timeout to close the connection if no response
        cleanup.timeoutId = window.setTimeout(() => {
          setError("Model loading timed out");
          setRuntimeStatus({
            phase: "error",
            modelId,
            error: "Model loading timed out",
          });
          setIsLoading(false);
          finish();
        }, 60000); // 1 minute timeout
      } catch (err) {
        logger.error("Error initiating model load:", err);
        setError(
          `Error loading model: ${err instanceof Error ? err.message : String(err)}`,
        );
        setIsLoading(false);
      }
    },
    [applyRuntimeStatus],
  );

  const requestModelStatus = useCallback(() => {
    const requestId = `status_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
    const connection = create_stream_connection({
      connectionName: "promptly-inference",
    });

    const cleanup: {
      timeoutId?: number;
      unsubscribeStatus?: () => void;
      unsubscribeError?: () => void;
    } = {};

    const finish = () => {
      if (cleanup.timeoutId) {
        window.clearTimeout(cleanup.timeoutId);
      }
      cleanup.unsubscribeStatus?.();
      cleanup.unsubscribeError?.();
      connection.close();
    };

    cleanup.unsubscribeStatus = connection.onMessage(
      EventType.MODEL_STATUS_RESPONSE,
      (payload) => {
        if (!payload.requestId || payload.requestId === requestId) {
          applyRuntimeStatus(payload);
          finish();
        }
      },
    );

    cleanup.unsubscribeError = connection.onMessage(
      EventType.INFERENCE_ERROR,
      (payload: InferenceErrorPayload) => {
        if (!payload.requestId || payload.requestId === requestId) {
          const errorMessage =
            payload.error || payload.message || "Unable to read model status";
          setError(errorMessage);
          setRuntimeStatus({
            phase: "error",
            error: errorMessage,
          });
          finish();
        }
      },
    );

    cleanup.timeoutId = window.setTimeout(() => {
      setError("Model status request timed out");
      finish();
    }, 5000);

    connection.send(EventType.MODEL_STATUS_REQUEST, { requestId });
  }, [applyRuntimeStatus]);

  const requestRuntimeCapabilities = useCallback(() => {
    const requestId = `capabilities_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;

    try {
      const connection = create_stream_connection({
        connectionName: "promptly-inference",
      });

      const cleanup: {
        timeoutId?: number;
        unsubscribeStatus?: () => void;
      } = {};

      const finish = () => {
        if (cleanup.timeoutId) {
          window.clearTimeout(cleanup.timeoutId);
        }
        cleanup.unsubscribeStatus?.();
        connection.close();
      };

      cleanup.unsubscribeStatus = connection.onMessage(
        EventType.RUNTIME_CAPABILITIES_RESPONSE,
        (payload) => {
          if (!payload.requestId || payload.requestId === requestId) {
            applyRuntimeCapabilities(payload);
            finish();
          }
        },
      );

      cleanup.timeoutId = window.setTimeout(() => {
        setRuntimeCapabilities((currentStatus) => {
          return {
            ...currentStatus,
            extension: "unavailable",
            message: "Unable to connect to the background runtime",
          };
        });
        finish();
      }, 5000);

      connection.send(EventType.RUNTIME_CAPABILITIES_REQUEST, { requestId });
    } catch (err) {
      logger.error("Error requesting runtime capabilities:", err);
      setRuntimeCapabilities((currentStatus) => {
        return {
          ...currentStatus,
          extension: "unavailable",
          message: `Unable to connect to the background runtime: ${
            err instanceof Error ? err.message : String(err)
          }`,
        };
      });
    }
  }, [applyRuntimeCapabilities]);

  const unloadModel = useCallback(
    (modelId?: string) => {
      const requestId = `unload_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
      const connection = create_stream_connection({
        connectionName: "promptly-inference",
      });

      const cleanup: {
        timeoutId?: number;
        unsubscribeStatus?: () => void;
        unsubscribeError?: () => void;
      } = {};

      const finish = () => {
        if (cleanup.timeoutId) {
          window.clearTimeout(cleanup.timeoutId);
        }
        cleanup.unsubscribeStatus?.();
        cleanup.unsubscribeError?.();
        connection.close();
      };

      cleanup.unsubscribeStatus = connection.onMessage(
        EventType.MODEL_STATUS_RESPONSE,
        (payload) => {
          if (!payload.requestId || payload.requestId === requestId) {
            applyRuntimeStatus(payload);
            finish();
          }
        },
      );

      cleanup.unsubscribeError = connection.onMessage(
        EventType.INFERENCE_ERROR,
        (payload: InferenceErrorPayload) => {
          if (!payload.requestId || payload.requestId === requestId) {
            const errorMessage =
              payload.error || payload.message || "Unable to unload model";
            setError(errorMessage);
            setRuntimeStatus({
              phase: "error",
              modelId,
              error: errorMessage,
            });
            finish();
          }
        },
      );

      cleanup.timeoutId = window.setTimeout(() => {
        setError("Model unload timed out");
        finish();
      }, 10000);

      connection.send(EventType.UNLOAD_MODEL, { requestId, modelId });
    },
    [applyRuntimeStatus],
  );

  return {
    loadModel,
    unloadModel,
    requestModelStatus,
    requestRuntimeCapabilities,
    progress,
    status,
    isLoading,
    error,
    runtimeStatus,
    runtimeCapabilities,
  };
}
