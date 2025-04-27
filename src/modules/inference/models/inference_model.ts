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
   * Base model family
   * @example Llama 3, Phi 3, etc.
   */
  baseModel: string;

  /**
   * Parameter count in billions
   * @example 8 for 8B
   */
  parameters: number;

  /**
   * Quantization method
   * @example q4f16_1
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


/**
 * Categorization of model families
 */
export const ModelFamily = {
  LLAMA: "llama",
  PHI: "phi",
  MISTRAL: "mistral",
  GEMMA: "gemma",
  QWEN: "qwen",
  SMOL_LM: "smollm",
  WIZARD_MATH: "wizardmath",
  STABLE_LM: "stablelm",
  REDPAJAMA: "redpajama",
  DEEPSEEK: "DeepSeek",
} as const;

export type ModelFamily = typeof ModelFamily[keyof typeof ModelFamily];

/**
 * Configuration options for LLM inference parameters.
 * These supplement the main InferenceParameters type.
 */
export type LLMConfig = {
  /**
   * Controls randomness in generation (0-1)
   */
  temperature?: number;
  /**
   * Penalizes repeated tokens (0-2)
   */
  presence_penalty?: number;
  /**
   * Penalizes token frequency (0-2)
   */
  frequency_penalty?: number;
  /**
   * Nucleus sampling parameter (0-1)
   */
  top_p?: number;
};

/**
 * Information about an available LLM model record.
 */
export type ModelRecord = {
  /**
   * Unique identifier for the model
   * @example MLC model name
   */
  name: string;
  /**
   * Display name shown in UI
   */
  display_name: string;
  /**
   * Model provider
   * @example Meta, Microsoft
   */
  provider: string;
  /** 
   * Model family classification
   */
  family: ModelFamily;
  /**
   * Recommended configuration settings
   */
  recommended_config: LLMConfig;
  /**
   * Size of the model (derived from name)
   * @example 7B
   */
  size?: string;
  /**
   * Quantization details (derived from name)
   * @example q4f16_1
   */
  quantization?: string;
  /**
   * Version of the model
   * @example 2, 3.1
   */
  version?: number | string;
  /**
   * Parameter count string
   * @example "7B", "70B"
   */
  parameter_count?: string;
  /**
   * Precision description
   * @example "4-bit float16 hybrid"
   */
  precision?: string;
  /**
   * Type of the model
   * @example "chat", "instruct", "vision"
   */
  model_type?: string;
  /**
   * Estimated memory requirements string
   * @example "≈4 GB VRAM"
   */
  memory_requirements?: string;
  /**
   * Link to the model on Hugging Face or provider
   */
  huggingface_link?: string;
  /**
   * Descriptive tags for filtering/display
   */
  tags?: string[];
  /**
   * Short description of the model
   */
  short_description?: string;
};

export type ModelGroupName =
  | "Llama 2"
  | "Llama 3"
  | "Llama 3.1"
  | "Llama 3.2"
  | "Phi 1.5"
  | "Phi 2"
  | "Phi 3"
  | "Phi 3.5"
  | "Gemma 2"
  | "RedPajama INCITE Chat 3B v1"
  | "Mistral 7B v0.2"
  | "Mistral 7B v0.3"
  | "Hermes 2 (Mistral 7B)"
  | "Qwen 1.5"
  | "Qwen 2"
  | "Qwen 2.5"
  | "TinyLlama 1.1B Chat v0.4"
  | "TinyLlama 1.1B Chat v1.0"
  | "GPT-2"
  | "StableLM 2 (Zephyr 1.6B)"
  | "SmolLM 1.7B"
  | "SmolLM 360M"
  | "SmolLM 135M"
  | "SmolLM 2 1.7B"
  | "SmolLM 2 360M"
  | "SmolLM 2 135M";

/**
 * Structure holding groups of available models.
 * Uses the specific ModelGroupName union type for keys.
 * @example { "Llama 3": [ModelRecord, ...], ... }
 */
export type ModelGroups = Record<ModelGroupName, ModelRecord[]>;