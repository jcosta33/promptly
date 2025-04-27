import { EventType } from "../../messaging/models/event_types";
import {
  InferenceResponse,
  ModelLoadingProgress,
} from "../models/inference_model";

/**
 * Event payload for model loading progress updates
 */
export type ModelLoadingProgressEvent = {
  type: EventType.MODEL_LOADING_PROGRESS;
  payload: ModelLoadingProgress;
};

/**
 * Event payload for inference token chunks
 */
export type InferenceChunkEvent = {
  type: EventType.INFERENCE_CHUNK;
  payload: {
    /**
     * Text chunk
     */
    text: string;

    /**
     * Request ID to match with original request
     */
    requestId: string;
  };
};

/**
 * Event payload for inference completion
 */
export type InferenceCompleteEvent = {
  type: EventType.INFERENCE_COMPLETE;
  payload: {
    /**
     * Full response
     */
    response: InferenceResponse;

    /**
     * Request ID to match with original request
     */
    requestId: string;
  };
};

/**
 * Event payload for inference errors
 */
export type InferenceErrorEvent = {
  type: EventType.INFERENCE_ERROR;
  payload: {
    /**
     * Error message
     */
    message: string;

    /**
     * Error code if available
     */
    code?: string;

    /**
     * Request ID to match with original request
     */
    requestId: string;
  };
};
