/**
 * LLM model configuration
 */
export type InferenceModel = {
  /**
   * Unique model ID
   */
  id: string;

  /**
   * Display name for the model
   */
  name: string;

  /**
   * Base model family (e.g., Llama 3, Phi 3, etc.)
   */
  baseModel: string;

  /**
   * Parameter count in billions (e.g., 8 for 8B)
   */
  parameters: number;

  /**
   * Quantization method (e.g., q4f16_1)
   */
  quantization: string;

  /**
   * Context window size in tokens
   */
  contextWindow: number;

  /**
   * Estimated minimum RAM required in GB
   */
  estimatedMinRam: number;

  /**
   * Description of the model
   */
  description?: string;
};

/**
 * Inference parameters for customizing LLM behavior
 */
export type InferenceParameters = {
  /**
   * Controls output creativity (0.0-1.0)
   * Lower values produce more deterministic, focused outputs
   * Higher values allow more creative, varied responses
   */
  temperature: number;

  /**
   * Alternative to temperature, using nucleus sampling (0.0-1.0)
   * Considers only most likely tokens whose cumulative probability exceeds top_p
   */
  top_p: number;

  /**
   * Penalizes repetition of token sequences (-2.0-2.0)
   * Positive values discourage repetition
   */
  presence_penalty: number;

  /**
   * Penalizes token frequency (-2.0-2.0)
   * Positive values discourage frequent tokens
   */
  frequency_penalty: number;

  /**
   * Whether to stream tokens incrementally
   */
  stream: boolean;
};

/**
 * Default inference parameters
 */
export const DEFAULT_INFERENCE_PARAMETERS: InferenceParameters = {
  temperature: 0.7,
  top_p: 0.9,
  presence_penalty: 0.0,
  frequency_penalty: 0.0,
  stream: true,
};

/**
 * Parameter presets for different types of tasks
 */
export const PARAMETER_PRESETS = {
  CREATIVE: {
    temperature: 0.9,
    top_p: 0.95,
    presence_penalty: 0.3,
    frequency_penalty: 0.3,
    stream: true,
  },
  BALANCED: DEFAULT_INFERENCE_PARAMETERS,
  PRECISE: {
    temperature: 0.3,
    top_p: 0.85,
    presence_penalty: 0.0,
    frequency_penalty: 0.0,
    stream: true,
  },
  FACTUAL: {
    temperature: 0.1,
    top_p: 0.7,
    presence_penalty: 0.0,
    frequency_penalty: 0.0,
    stream: true,
  },
};

/**
 * Message in a conversation
 */
export type Message = {
  /**
   * Role of the message author (system, user, assistant)
   */
  role: "system" | "user" | "assistant";

  /**
   * Content of the message
   */
  content: string;
};

/**
 * Request to generate text from the LLM
 */
export type InferenceRequest = {
  /**
   * The conversation history
   */
  messages: Message[];

  /**
   * Inference parameters to control generation
   */
  parameters?: Partial<InferenceParameters>;
};

/**
 * Response from the LLM
 */
export type InferenceResponse = {
  /**
   * The generated text
   */
  text: string;

  /**
   * Usage statistics
   */
  usage?: {
    prompt_tokens?: number;
    completion_tokens?: number;
    total_tokens?: number;
  };
};

/**
 * Model loading progress information
 */
export type ModelLoadingProgress = {
  /**
   * Progress message
   */
  text: string;

  /**
   * Status message (for display)
   */
  status: string;

  /**
   * Progress value between 0 and 1
   */
  progress: number;
};
