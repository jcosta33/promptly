import type { Message } from "../../inference/models/inference_model";

/**
 * Event types for the messaging system
 */
export const EventType = {
  // Configuration events
  SETTINGS_UPDATE: "settings_update",

  // Inference events
  MODEL_LOADING_PROGRESS: "model_loading_progress",
  INFERENCE_CHUNK: "inference_chunk",
  INFERENCE_COMPLETE: "inference_complete",
  INFERENCE_ERROR: "inference_error",
  CANCEL_INFERENCE: "cancel_inference",

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
} as const;

export type EventType = typeof EventType[keyof typeof EventType];

export type DefaultPayload = Record<string, any>;

export type ModelLoadingProgressPayload = {
  model: string;
  progress: number;
  status: string;
  text?: string;
  requestId: string;
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

export type CancelInferencePayload = {
  requestId: string;
};

// Mapping between event types and their payload types
export type EventPayloadMap = {
  [EventType.MODEL_LOADING_PROGRESS]: ModelLoadingProgressPayload;
  [EventType.INFERENCE_ERROR]: InferenceErrorPayload;
  [EventType.INFERENCE_CHUNK]: InferenceChunkPayload;
  [EventType.INFERENCE_COMPLETE]: InferenceCompletePayload;
  [EventType.MODEL_LOAD_REQUEST]: ModelLoadRequestPayload;
  [EventType.REQUEST_ACTION]: RequestActionPayload;
  [EventType.CANCEL_INFERENCE]: CancelInferencePayload;
  [key: string]: DefaultPayload; // Allow any EventType string with a default payload
};

// Utility type to get the payload type for a given event
export type PayloadForEvent<TEventType extends EventType> = TEventType extends keyof EventPayloadMap
  ? EventPayloadMap[TEventType]
  : DefaultPayload; 