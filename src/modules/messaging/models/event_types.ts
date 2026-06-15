import type { Message } from "../../inference/models/inference_model";

/**
 * Event types for the messaging system
 */
export const EventType = {
  // Configuration events
  SETTINGS_UPDATE: "settings_update",

  // Inference events
  MODEL_LOADING_PROGRESS: "model_loading_progress",
  MODEL_STATUS_REQUEST: "model_status_request",
  MODEL_STATUS_RESPONSE: "model_status_response",
  RUNTIME_CAPABILITIES_REQUEST: "runtime_capabilities_request",
  RUNTIME_CAPABILITIES_RESPONSE: "runtime_capabilities_response",
  INFERENCE_CHUNK: "inference_chunk",
  INFERENCE_COMPLETE: "inference_complete",
  INFERENCE_ERROR: "inference_error",
  STOP_INFERENCE: "stop_inference",
  KEEP_ALIVE: "keep_alive",

  // Action events
  REQUEST_ACTION: "request_action",
  FOLLOW_UP_MESSAGE: "follow_up_message",

  // Model management events
  LOAD_MODEL: "load_model",
  UNLOAD_MODEL: "unload_model",
  MODEL_LOAD_REQUEST: "model_load_request",

  // Selection events
  SELECTION_UPDATED: "selection_updated",

  // Context events
  PAGE_CONTEXT_UPDATED: "page_context_updated",
  TRIGGER_CONTEXT_ACTION: "trigger_context_action",
  OMNIBOX_INPUT: "omnibox_input",
  PERFORM_WEB_SEARCH: "perform_web_search",
  GENERATE_EMBEDDING: "generate_embedding",
  PERFORM_KNOWLEDGE_SEARCH: "perform_knowledge_search",
  DOWNLOAD_FILE: "download_file",
  TRANSCRIBE_AUDIO: "transcribe_audio",
  EXECUTE_CODE: "execute_code",
  STORE_KNOWLEDGE: "store_knowledge",
  GENERATE_IMAGE: "generate_image",
} as const;

export type EventType = (typeof EventType)[keyof typeof EventType];

export type DefaultPayload = Record<string, any>;

export type TriggerContextActionPayload = { actionId: string };

export type OmniboxInputPayload = { text: string };

export type ModelLoadingProgressPayload = {
  model: string;
  progress: number;
  status: string;
  text?: string;
  requestId: string;
};

export type ModelRuntimeStatus = {
  phase: "unavailable" | "unloaded" | "loading" | "loaded" | "error";
  modelId?: string;
  progress?: number;
  message?: string;
  error?: string;
};

export type ModelStatusRequestPayload = {
  requestId?: string;
};

export type ModelStatusResponsePayload = ModelRuntimeStatus & {
  requestId?: string;
};

export type RuntimeCapabilityStatus = {
  extension: "connected" | "unavailable";
  webGpu: "available" | "unavailable" | "unknown";
  selectedModelId?: string;
  model: ModelRuntimeStatus;
  message?: string;
};

export type RuntimeCapabilitiesRequestPayload = {
  requestId?: string;
};

export type RuntimeCapabilitiesResponsePayload = RuntimeCapabilityStatus & {
  requestId?: string;
};

export type ModelControlRequestPayload = {
  requestId?: string;
  modelId?: string;
};

export type InferenceErrorPayload = {
  requestId: string;
  message?: string;
  error?: string;
  code?: string;
};

export type InferenceChunkPayload = {
  requestId: string;
  token: string;
};

export type InferenceCompletePayload = {
  requestId: string;
  fullResponse: string;
  usage?: {
    prompt_tokens?: number;
    completion_tokens?: number;
    total_tokens?: number;
  };
};

export type ModelLoadRequestPayload = {
  modelId: string;
  requestId: string;
  useStream?: boolean;
};

export type RequestActionPayload = {
  messages?: Message[];
  parameters?: any;
  requestId?: string;
  action?: string;
  modelId?: string;
};

export type KeepAlivePayload = {
  requestId?: string;
};

export type StopInferencePayload = {
  requestId: string;
};

// Mapping between event types and their payload types
export type EventPayloadMap = {
  [EventType.MODEL_LOADING_PROGRESS]: ModelLoadingProgressPayload;
  [EventType.MODEL_STATUS_REQUEST]: ModelStatusRequestPayload;
  [EventType.MODEL_STATUS_RESPONSE]: ModelStatusResponsePayload;
  [EventType.RUNTIME_CAPABILITIES_REQUEST]: RuntimeCapabilitiesRequestPayload;
  [EventType.RUNTIME_CAPABILITIES_RESPONSE]: RuntimeCapabilitiesResponsePayload;
  [EventType.INFERENCE_ERROR]: InferenceErrorPayload;
  [EventType.INFERENCE_CHUNK]: InferenceChunkPayload;
  [EventType.INFERENCE_COMPLETE]: InferenceCompletePayload;
  [EventType.MODEL_LOAD_REQUEST]: ModelLoadRequestPayload;
  [EventType.UNLOAD_MODEL]: ModelControlRequestPayload;
  [EventType.REQUEST_ACTION]: RequestActionPayload;
  [EventType.STOP_INFERENCE]: StopInferencePayload;
  [EventType.TRIGGER_CONTEXT_ACTION]: TriggerContextActionPayload;
  [EventType.OMNIBOX_INPUT]: OmniboxInputPayload;
  [EventType.KEEP_ALIVE]: KeepAlivePayload;
  [key: string]: DefaultPayload; // Allow any EventType string with a default payload
};

// Utility type to get the payload type for a given event
export type PayloadForEvent<TEventType extends EventType> =
  TEventType extends keyof EventPayloadMap
    ? EventPayloadMap[TEventType]
    : DefaultPayload;
