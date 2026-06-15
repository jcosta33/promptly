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
import { semanticKnowledgeSearch, KnowledgeRecord } from "../modules/history/repositories/vector_db";
import { logger } from "../utils/logger";



async function handleCustomApiInference(payload: any, settings: any, stream: any, requestId: string) {
  try {
    const url = settings.customApiEndpoint;
    
    // Create an abort controller so we can listen for STOP_INFERENCE
    const controller = new AbortController();
    const cancelUnsubscribe = stream.onMessage(EventType.STOP_INFERENCE, (cancelPayload: any) => {
      if (cancelPayload.requestId === requestId) {
        controller.abort();
      }
    });

    const response = await fetch(url, {
      method: "POST",
      headers: { 
        "Content-Type": "application/json",
        ...(settings.customApiKey ? { "Authorization": `Bearer ${settings.customApiKey}` } : {})
      },
      body: JSON.stringify({
        model: settings.customApiModelId,
        messages: payload.messages,
        stream: true
      }),
      signal: controller.signal
    });

    if (!response.body) throw new Error("No response body from Custom API");

    const reader = response.body.getReader();
    const decoder = new TextDecoder();
    let fullText = "";

    try {
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        const chunk = decoder.decode(value, { stream: true });
        const lines = chunk.split('\n');
        for (const line of lines) {
          if (line.startsWith('data: ') && line.trim() !== 'data: [DONE]') {
            try {
              const data = JSON.parse(line.slice(6));
              const content = data.choices?.[0]?.delta?.content || "";
              if (content) {
                fullText += content;
                stream.send(EventType.INFERENCE_CHUNK, { requestId, token: content });
              }
            } catch (e) {
              // ignore parse errors for partial chunks
            }
          }
        }
      }

      stream.send(EventType.INFERENCE_COMPLETE, { 
        requestId, 
        fullResponse: fullText, 
        usage: { total_tokens: 0 } 
      });
    } finally {
      cancelUnsubscribe();
    }
  } catch (error: any) {
    if (error.name === 'AbortError') {
      stream.send(EventType.INFERENCE_ERROR, { requestId, error: "Inference interrupted" });
    } else {
      stream.send(EventType.INFERENCE_ERROR, { requestId, error: "Custom API Error: " + String(error) });
    }
  }
}

async function handleOllamaInference(payload: any, settings: any, stream: any, requestId: string) {
  try {
    const url = `${settings.ollamaEndpoint}/v1/chat/completions`;
    
    // Create an abort controller so we can listen for STOP_INFERENCE
    const controller = new AbortController();
    const cancelUnsubscribe = stream.onMessage(EventType.STOP_INFERENCE, (cancelPayload: any) => {
      if (cancelPayload.requestId === requestId) {
        controller.abort();
      }
    });

    const response = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        model: settings.ollamaModelId,
        messages: payload.messages,
        stream: true
      }),
      signal: controller.signal
    });

    if (!response.body) throw new Error("No response body from Ollama");

    const reader = response.body.getReader();
    const decoder = new TextDecoder();
    let fullText = "";

    try {
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        const chunk = decoder.decode(value, { stream: true });
        const lines = chunk.split('\n');
        for (const line of lines) {
          if (line.startsWith('data: ') && line.trim() !== 'data: [DONE]') {
            try {
              const data = JSON.parse(line.slice(6));
              const content = data.choices?.[0]?.delta?.content || "";
              if (content) {
                fullText += content;
                stream.send(EventType.INFERENCE_CHUNK, { requestId, token: content });
              }
            } catch (e) {
              // ignore parse errors for partial chunks
            }
          }
        }
      }

      stream.send(EventType.INFERENCE_COMPLETE, { 
        requestId, 
        fullResponse: fullText, 
        usage: { total_tokens: 0 } 
      });
    } finally {
      cancelUnsubscribe();
    }
  } catch (error: any) {
    if (error.name === 'AbortError') {
      stream.send(EventType.INFERENCE_ERROR, { requestId, error: "Inference interrupted" });
    } else {
      stream.send(EventType.INFERENCE_ERROR, { requestId, error: "Ollama Error: " + String(error) });
    }
  }
}

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
      
      if (settings.useCustomApi) {
        await handleCustomApiInference(payload, settings, stream, requestId);
        return;
      }
      if (settings.useOllama) {
        await handleOllamaInference(payload, settings, stream, requestId);
        return;
      }

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

import { pipeline, env } from '@xenova/transformers';

// Configure transformers for the browser environment
env.allowLocalModels = false;
env.useBrowserCache = false; // We can set this to true if it causes issues, but false forces re-download if cache corrupted.

let extractor: any = null;

const getExtractor = async () => {
  if (!extractor) {
    logger.log("Loading Xenova feature extractor...");
    // Using a tiny quantized model for feature extraction
    extractor = await pipeline('feature-extraction', 'Xenova/all-MiniLM-L6-v2', {
      quantized: true,
    });
  }
  return extractor;
};

// Embedding Queue to prevent WebGPU OOM
interface QueueItem {
  type: EventType;
  text?: string;
  payload?: any;
  sendResponse: (response: any) => void;
}

const embeddingQueue: QueueItem[] = [];
let isProcessingQueue = false;

const processQueue = async () => {
  if (isProcessingQueue || embeddingQueue.length === 0) return;
  isProcessingQueue = true;

  while (embeddingQueue.length > 0) {
    const item = embeddingQueue.shift();
    if (!item) continue;

    try {
      if (item.type === EventType.PERFORM_KNOWLEDGE_SEARCH || item.type === EventType.GENERATE_EMBEDDING) {
      const extract = await getExtractor();
      const output = await extract(item.text, { pooling: 'mean', normalize: true });
      const embeddingArray = Array.from(output.data) as number[];

      if (item.type === EventType.PERFORM_KNOWLEDGE_SEARCH) {
        const results = await semanticKnowledgeSearch(embeddingArray, 3);
        const chunks = results.map((r: KnowledgeRecord) => r.text);
        item.sendResponse({ chunks });
      } else if (item.type === EventType.GENERATE_EMBEDDING) {
        item.sendResponse({ embedding: embeddingArray });
      }
    } else if (item.type === EventType.TRANSCRIBE_AUDIO) {
      await handleTranscribeAudio(item);
    }
    } catch (err: any) {
      logger.error("Failed to process embedding queue item", err);
      item.sendResponse({ error: err.message });
    }
  }

  isProcessingQueue = false;
};

// Listen for embedding requests
chrome.runtime.onMessage.addListener((message, _sender, sendResponse) => {
  if (message.type === EventType.PERFORM_KNOWLEDGE_SEARCH || message.type === EventType.GENERATE_EMBEDDING || message.type === EventType.TRANSCRIBE_AUDIO) {
    const text = message.payload?.text;
    if (!text) {
      sendResponse({ error: "No text provided" });
      return true;
    }

    embeddingQueue.push({
      type: message.type,
      text: message.payload?.text,
      payload: message.payload,
      sendResponse
    });
    
    processQueue();
    return true; // Keep the message channel open for async response
  }
});

let transcriber: any = null;

const getTranscriber = async () => {
  if (!transcriber) {
    logger.log("Loading Xenova Whisper transcriber...");
    transcriber = await pipeline('automatic-speech-recognition', 'Xenova/whisper-tiny.en', {
      quantized: true,
    });
  }
  return transcriber;
};

// Add to processQueue
const handleTranscribeAudio = async (item: QueueItem) => {
  try {
    const t = await getTranscriber();
    // Float32Array comes as a regular array in the message payload or Float32Array directly
    const audioData = new Float32Array(item.payload.audioData);
    const output = await t(audioData);
    item.sendResponse({ text: output.text });
  } catch (err: any) {
    logger.error("Failed to transcribe audio", err);
    item.sendResponse({ error: err.message });
  }
};
