import {
  EventType,
  type ModelRuntimeStatus,
  type RuntimeCapabilityStatus,
} from "../modules/messaging/models/event_types";
import { listen_for_streams } from "../modules/messaging/repositories/message_bus";
import { DEFAULT_INFERENCE_PARAMETERS } from "../modules/inference/models/inference_model";
import type { Message } from "../modules/inference/models/inference_model";
import { get_settings } from "../modules/configuration/use_cases/get_settings";
import { MLCEngine } from "@mlc-ai/web-llm";
import { generate_text_stream } from "../modules/inference/repositories/generate_text_stream";
import { logger } from "../utils/logger";

logger.log("Promptly offscreen inference engine starting...");

let llmEngine: MLCEngine | null = null;
let currentModel = "";
let modelRuntimeStatus: ModelRuntimeStatus = {
  phase: "unloaded",
  message: "No model loaded",
};

const getWebGpuAvailability = (): RuntimeCapabilityStatus["webGpu"] => {
  if (typeof navigator === "undefined") return "unknown";
  return "gpu" in navigator ? "available" : "unavailable";
};

const hasWebGpu = () => {
  return getWebGpuAvailability() !== "unavailable";
};

const getModelRuntimeStatus = (): ModelRuntimeStatus => {
  if (!hasWebGpu() && modelRuntimeStatus.phase === "unloaded") {
    return {
      phase: "unavailable",
      message: "WebGPU is not available in this browser context",
    };
  }
  return modelRuntimeStatus;
};

const setModelRuntimeStatus = (status: ModelRuntimeStatus) => {
  modelRuntimeStatus = status;
};

const getRuntimeCapabilityStatus = async (): Promise<RuntimeCapabilityStatus> => {
  try {
    const settings = await get_settings();
    return {
      extension: "connected",
      webGpu: getWebGpuAvailability(),
      selectedModelId: settings.selectedModelId,
      model: getModelRuntimeStatus(),
    };
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    return {
      extension: "connected",
      webGpu: getWebGpuAvailability(),
      model: getModelRuntimeStatus(),
      message: `Unable to read saved settings: ${errorMessage}`,
    };
  }
};

listen_for_streams("promptly-inference", async (stream, identifier) => {
  logger.log("Inference connection established in offscreen", { identifier });

  const sendModelRuntimeStatus = (requestId?: string) => {
    stream.send(EventType.MODEL_STATUS_RESPONSE, {
      ...getModelRuntimeStatus(),
      requestId,
    });
  };

  stream.onMessage(EventType.MODEL_STATUS_REQUEST, (payload) => {
    sendModelRuntimeStatus(payload.requestId);
  });

  const sendRuntimeCapabilityStatus = async (requestId?: string) => {
    stream.send(EventType.RUNTIME_CAPABILITIES_RESPONSE, {
      ...(await getRuntimeCapabilityStatus()),
      requestId,
    });
  };

  stream.onMessage(EventType.RUNTIME_CAPABILITIES_REQUEST, (payload) => {
    void sendRuntimeCapabilityStatus(payload.requestId);
  });

  stream.onMessage(EventType.UNLOAD_MODEL, async (payload) => {
    try {
      if (llmEngine) {
        await llmEngine.interruptGenerate();
        await llmEngine.unload();
      }
      llmEngine = null;
      currentModel = "";
      setModelRuntimeStatus({
        phase: "unloaded",
        message: "No model loaded",
      });
      sendModelRuntimeStatus(payload.requestId);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      setModelRuntimeStatus({
        phase: "error",
        modelId: currentModel || payload.modelId,
        error: errorMessage,
      });
      sendModelRuntimeStatus(payload.requestId);
      stream.send(EventType.INFERENCE_ERROR, {
        requestId: payload.requestId || "",
        error: "Failed to unload model: " + errorMessage,
      });
    }
  });

  stream.onMessage(EventType.MODEL_LOAD_REQUEST, async (payload) => {
    const { modelId, requestId } = payload;
    try {
      let effectiveModelId = modelId;
      if (!effectiveModelId) {
        const settings = await get_settings();
        effectiveModelId = settings.selectedModelId;
        if (!effectiveModelId) {
          setModelRuntimeStatus({ phase: "error", error: "No model ID specified" });
          sendModelRuntimeStatus(requestId);
          stream.send(EventType.INFERENCE_ERROR, { requestId, error: "No model ID specified" });
          return;
        }
      }

      setModelRuntimeStatus({
        phase: "loading",
        modelId: effectiveModelId,
        progress: 0,
        message: "Starting model load...",
      });
      sendModelRuntimeStatus(requestId);
      stream.send(EventType.MODEL_LOADING_PROGRESS, {
        requestId,
        model: effectiveModelId,
        progress: 0,
        status: "Starting model load...",
      });

      try {
        llmEngine = new MLCEngine();
      } catch (engineError) {
        const errorMessage = engineError instanceof Error ? engineError.message : String(engineError);
        setModelRuntimeStatus({ phase: "error", modelId: effectiveModelId, error: errorMessage });
        sendModelRuntimeStatus(requestId);
        stream.send(EventType.INFERENCE_ERROR, { requestId, error: `Failed to create engine: ${errorMessage}` });
        return;
      }

      llmEngine.setInitProgressCallback((report) => {
        try {
          setModelRuntimeStatus({
            phase: "loading",
            modelId: effectiveModelId,
            progress: report.progress,
            message: report.text,
          });
          sendModelRuntimeStatus(requestId);
          stream.send(EventType.MODEL_LOADING_PROGRESS, {
            requestId,
            model: effectiveModelId,
            progress: report.progress,
            status: report.text,
          });
        } catch (progressError) {}
      });

      try {
        await llmEngine.reload(effectiveModelId);
        currentModel = effectiveModelId;
        setModelRuntimeStatus({
          phase: "loaded",
          modelId: effectiveModelId,
          progress: 1,
          message: "Model loaded successfully",
        });
      } catch (loadError) {
        const errorMessage = loadError instanceof Error ? loadError.message : String(loadError);
        setModelRuntimeStatus({ phase: "error", modelId: effectiveModelId, error: errorMessage });
        sendModelRuntimeStatus(requestId);
        stream.send(EventType.INFERENCE_ERROR, { requestId, error: `Error loading model: ${errorMessage}` });
        return;
      }

      sendModelRuntimeStatus(requestId);
      stream.send(EventType.MODEL_LOADING_PROGRESS, {
        requestId,
        model: effectiveModelId,
        progress: 1,
        status: "Model loaded successfully",
      });
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      setModelRuntimeStatus({ phase: "error", modelId: modelId || currentModel, error: errorMessage });
      sendModelRuntimeStatus(requestId);
      stream.send(EventType.INFERENCE_ERROR, { requestId, error: "Failed to load model: " + errorMessage });
    }
  });

  stream.onMessage(EventType.REQUEST_ACTION, async (payload) => {
    const { messages, parameters } = payload;
    const requestId = payload.requestId || `request-${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;

    try {
      if (!messages || !Array.isArray(messages) || messages.length === 0) {
        stream.send(EventType.INFERENCE_ERROR, { requestId, error: "No valid messages provided" });
        return;
      }

      const settings = await get_settings();
      const selectedModelId = settings.selectedModelId;

      if (!llmEngine || (selectedModelId && selectedModelId !== currentModel)) {
        stream.send(EventType.MODEL_LOADING_PROGRESS, { requestId, model: selectedModelId, progress: 0, status: "Loading model..." });
        try {
          llmEngine = new MLCEngine();
          setModelRuntimeStatus({ phase: "loading", modelId: selectedModelId, progress: 0, message: "Loading model..." });
          sendModelRuntimeStatus(requestId);

          llmEngine.setInitProgressCallback((report) => {
            setModelRuntimeStatus({ phase: "loading", modelId: selectedModelId, progress: report.progress, message: report.text });
            sendModelRuntimeStatus(requestId);
            stream.send(EventType.MODEL_LOADING_PROGRESS, { requestId, model: selectedModelId, progress: report.progress, status: report.text });
          });

          await llmEngine.reload(selectedModelId);
          currentModel = selectedModelId;
          setModelRuntimeStatus({ phase: "loaded", modelId: selectedModelId, progress: 1, message: "Model loaded successfully" });

          sendModelRuntimeStatus(requestId);
          stream.send(EventType.MODEL_LOADING_PROGRESS, { requestId, model: selectedModelId, progress: 1, status: "Model loaded successfully" });
        } catch (error) {
          const errorMessage = error instanceof Error ? error.message : String(error);
          setModelRuntimeStatus({ phase: "error", modelId: selectedModelId, error: errorMessage });
          sendModelRuntimeStatus(requestId);
          stream.send(EventType.INFERENCE_ERROR, { requestId, error: "Failed to load model: " + errorMessage });
          return;
        }
      }

      const cancelUnsubscribe = stream.onMessage(EventType.STOP_INFERENCE, async (cancelPayload) => {
        if (cancelPayload.requestId === requestId) {
          await llmEngine?.interruptGenerate();
        }
      });

      try {
        let fullResponseText = "";
        let usage: any = undefined;

        const inferenceParams = { ...DEFAULT_INFERENCE_PARAMETERS, ...(parameters || {}) };

        await generate_text_stream({
          engine: llmEngine,
          messages,
          parameters: inferenceParams,
          onToken: (token) => {
            stream.send(EventType.INFERENCE_CHUNK, { requestId, token });
          },
          onComplete: (text, usageInfo) => {
            fullResponseText = text;
            usage = usageInfo;
          },
        });

        if (!usage) {
          const inputLength = messages.reduce((acc, msg: Message) => acc + (msg.content?.length || 0), 0);
          usage = {
            prompt_tokens: Math.floor(inputLength / 4),
            completion_tokens: Math.floor(fullResponseText.length / 4),
            total_tokens: Math.floor((inputLength + fullResponseText.length) / 4),
          };
        }

        stream.send(EventType.INFERENCE_COMPLETE, { requestId, fullResponse: fullResponseText, usage });
        cancelUnsubscribe();
      } catch (inferenceError) {
        const errorMessage = inferenceError instanceof Error ? inferenceError.message : String(inferenceError);
        stream.send(EventType.INFERENCE_ERROR, { requestId, error: "Error during inference: " + errorMessage });
        cancelUnsubscribe();
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      stream.send(EventType.INFERENCE_ERROR, { requestId, error: "Error processing request: " + errorMessage });
    }
  });

  return () => {
    logger.log("Inference connection disconnected");
  };
});
