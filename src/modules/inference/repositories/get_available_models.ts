/**
 * Categorization of model families
 */
export enum ModelFamily {
  LLAMA = "llama",
  PHI = "phi",
  MISTRAL = "mistral",
  GEMMA = "gemma",
  QWEN = "qwen",
  SMOL_LM = "smollm",
  WIZARD_MATH = "wizardmath",
  STABLE_LM = "stablelm",
  REDPAJAMA = "redpajama",
  DEEPSEEK = "DeepSeek",
}

/**
 * Configuration options for LLM inference
 */
export type LLMConfig = {
  /** Controls randomness in generation (0-1) */
  temperature?: number;
  /** Penalizes repeated tokens (0-2) */
  presence_penalty?: number;
  /** Penalizes token frequency (0-2) */
  frequency_penalty?: number;
  /** Nucleus sampling parameter (0-1) */
  top_p?: number;
};

export type BaseModel = {
  /** Unique identifier for the model */
  name: string;
  /** Display name shown in UI */
  display_name: string;
  /** Model provider (e.g. Meta, Microsoft) */
  provider: string;
  /** Model familyModelFamily classification */
  family: ModelFamily;
  /** Recommended configuration settings */
  recommended_config: LLMConfig;
  /** Size of the model (derived from name) */
  size?: string;
  /** Quantization details (derived from name) */
  quantization?: string;
};

export const AVAILABLE_MODELS = {
  "Llama 2": [
    {
      name: "Llama-2-7b-chat-hf-q4f16_1-MLC",
      display_name: "Llama 2 7B Chat (4-bit)",
      provider: "Meta",
      family: "Llama",
      version: 2,
      parameter_count: "7B",
      quantization: "q4f16_1",
      precision: "4-bit float16 hybrid",
      model_type: "chat",
      recommended_config: {
        temperature: 0.6,
        top_p: 0.9,
      },
      memory_requirements: "≈4 GB VRAM (4-bit quantized)",
      huggingface_link:
        "https://huggingface.co/mlc-ai/Llama-2-7b-chat-hf-q4f16_1-MLC",
      tags: ["high-accuracy", "popular", "multilingual"],
      short_description:
        "Meta’s 7B-parameter Llama 2 chat model fine-tuned on instructions; it offers strong general performance and alignment with human guidance.",
    },
    {
      name: "Llama-2-7b-chat-hf-q4f32_1-MLC",
      display_name: "Llama 2 7B Chat (4-bit, high precision)",
      provider: "Meta",
      family: "Llama",
      version: 2,
      parameter_count: "7B",
      quantization: "q4f32_1",
      precision: "4-bit float32 hybrid",
      model_type: "chat",
      recommended_config: {
        temperature: 0.6,
        top_p: 0.9,
      },
      memory_requirements: "≈5 GB VRAM (4-bit, 32-bit scales)",
      huggingface_link:
        "https://huggingface.co/mlc-ai/Llama-2-7b-chat-hf-q4f32_1-MLC",
      tags: ["high-accuracy"],
      short_description:
        "Higher-precision 4-bit variant of Llama 2 7B Chat, offering slightly improved fidelity at the cost of additional memory usage.",
    },
    {
      name: "Llama-2-13b-chat-hf-q4f16_1-MLC",
      display_name: "Llama 2 13B Chat (4-bit)",
      provider: "Meta",
      family: "Llama",
      version: 2,
      parameter_count: "13B",
      quantization: "q4f16_1",
      precision: "4-bit float16 hybrid",
      model_type: "chat",
      recommended_config: {
        temperature: 0.6,
        top_p: 0.85,
      },
      memory_requirements: "≈8 GB VRAM (4-bit)",
      huggingface_link:
        "https://huggingface.co/mlc-ai/Llama-2-13b-chat-hf-q4f16_1-MLC",
      tags: ["high-accuracy"],
      short_description:
        "Meta’s 13B-parameter Llama 2 chat model offering higher accuracy than the 7B version. It excels in reasoning and coherence for its size.",
    },
    {
      name: "Llama-2-70b-chat-hf-q3f16_1-MLC",
      display_name: "Llama 2 70B Chat (3-bit)",
      provider: "Meta",
      family: "Llama",
      version: 2,
      parameter_count: "70B",
      quantization: "q3f16_1",
      precision: "3-bit float16 hybrid",
      model_type: "chat",
      recommended_config: {
        temperature: 0.7,
        top_p: 0.9,
      },
      memory_requirements: "≈30 GB VRAM (3-bit ultra-quantized)",
      huggingface_link:
        "https://huggingface.co/mlc-ai/Llama-2-70b-chat-hf-q3f16_1-MLC",
      tags: ["high-accuracy", "large-model"],
      short_description:
        "The largest Llama 2 chat model (70B params) in a heavily quantized form. Despite aggressive 3-bit quantization, it delivers state-of-the-art quality among open models, but requires substantial memory.",
    },
    {
      name: "Llama-2-70b-chat-hf-q4f16_1-MLC",
      display_name: "Llama 2 70B Chat (4-bit)",
      provider: "Meta",
      family: "Llama",
      version: 2,
      parameter_count: "70B",
      quantization: "q4f16_1",
      precision: "4-bit float16 hybrid",
      model_type: "chat",
      recommended_config: {
        temperature: 0.7,
        top_p: 0.9,
      },
      memory_requirements: "≈40 GB VRAM (4-bit)",
      huggingface_link:
        "https://huggingface.co/mlc-ai/Llama-2-70b-chat-hf-q4f16_1-MLC",
      tags: ["high-accuracy", "large-model"],
      short_description:
        "Standard 4-bit quantized Llama 2 70B chat model. It offers top-tier accuracy and knowledge, on par with the best open models, but is very resource-intensive.",
    },
  ],

  "Llama 3": [
    {
      name: "Llama-3-8B-Instruct-q4f16_1-MLC",
      display_name: "Llama 3 8B Instruct (4-bit)",
      provider: "Community (Meta base)",
      family: "Llama",
      version: 3,
      parameter_count: "8B",
      quantization: "q4f16_1",
      precision: "4-bit float16 hybrid",
      model_type: "instruct",
      recommended_config: {
        temperature: 0.7,
        top_p: 1.0,
      },
      memory_requirements: "≈5 GB VRAM",
      huggingface_link:
        "https://huggingface.co/mlc-ai/Llama-3-8B-Instruct-q4f16_1-MLC",
      tags: ["experimental"],
      short_description:
        "An 8B-parameter experimental instruct model based on the Llama architecture. Llama 3 (v3.0) models aim to improve upon Llama 2’s quality with community fine-tuning.",
    },
    {
      name: "Llama-3-8B-Instruct-q4f32_1-MLC",
      display_name: "Llama 3 8B Instruct (4-bit, high precision)",
      provider: "Community",
      family: "Llama",
      version: 3,
      parameter_count: "8B",
      quantization: "q4f32_1",
      precision: "4-bit float32 hybrid",
      model_type: "instruct",
      recommended_config: {
        temperature: 0.7,
        top_p: 1.0,
      },
      memory_requirements: "≈6 GB VRAM",
      huggingface_link:
        "https://huggingface.co/mlc-ai/Llama-3-8B-Instruct-q4f32_1-MLC",
      tags: ["experimental"],
      short_description:
        "The 8B Llama 3 instruct model with higher precision quantization for improved output quality. Suitable for experimentation with low-memory hardware.",
    },
    {
      name: "Llama-3-70B-Instruct-q3f16_1-MLC",
      display_name: "Llama 3 70B Instruct (3-bit)",
      provider: "Community",
      family: "Llama",
      version: 3,
      parameter_count: "70B",
      quantization: "q3f16_1",
      precision: "3-bit float16 hybrid",
      model_type: "instruct",
      recommended_config: {
        temperature: 0.7,
        top_p: 1.0,
      },
      memory_requirements: "≥30 GB VRAM",
      huggingface_link:
        "https://huggingface.co/mlc-ai/Llama-3-70B-Instruct-q3f16_1-MLC",
      tags: ["experimental", "large-model"],
      short_description:
        "A 70B-parameter Llama 3 instruct model in 3-bit form. It targets cutting-edge accuracy, but the size and quantization make it experimental and hardware-demanding.",
    },
  ],

  "Llama 3.1": [
    {
      name: "Llama-3.1-8B-Instruct-q4f16_1-MLC",
      display_name: "Llama 3.1 8B Instruct (4-bit)",
      provider: "Community",
      family: "Llama",
      version: 3.1,
      parameter_count: "8B",
      quantization: "q4f16_1",
      precision: "4-bit float16 hybrid",
      model_type: "instruct",
      recommended_config: {
        temperature: 0.7,
        top_p: 1.0,
      },
      memory_requirements: "≈5 GB VRAM",
      huggingface_link:
        "https://huggingface.co/mlc-ai/Llama-3.1-8B-Instruct-q4f16_1-MLC",
      tags: ["experimental"],
      short_description:
        "Refined 8B instruct model from the Llama 3.1 series. Offers improved instruction-following and coherence over earlier Llama 3 models through iterative fine-tuning.",
    },
    {
      name: "Llama-3.1-8B-Instruct-q4f32_1-MLC",
      display_name: "Llama 3.1 8B Instruct (4-bit, high precision)",
      provider: "Community",
      family: "Llama",
      version: 3.1,
      parameter_count: "8B",
      quantization: "q4f32_1",
      precision: "4-bit float32 hybrid",
      model_type: "instruct",
      recommended_config: {
        temperature: 0.7,
        top_p: 1.0,
      },
      memory_requirements: "≈6 GB VRAM",
      huggingface_link:
        "https://huggingface.co/mlc-ai/Llama-3.1-8B-Instruct-q4f32_1-MLC",
      tags: ["experimental"],
      short_description:
        "High-precision quantized variant of Llama 3.1 8B. Balances low memory footprint with better response quality; suitable for testing enhanced instruct-following abilities.",
    },
    {
      name: "Llama-3.1-70B-Instruct-q3f16_1-MLC",
      display_name: "Llama 3.1 70B Instruct (3-bit)",
      provider: "Community",
      family: "Llama",
      version: 3.1,
      parameter_count: "70B",
      quantization: "q3f16_1",
      precision: "3-bit float16 hybrid",
      model_type: "instruct",
      recommended_config: {
        temperature: 0.7,
        top_p: 1.0,
      },
      memory_requirements: "≥30 GB VRAM",
      huggingface_link:
        "https://huggingface.co/mlc-ai/Llama-3.1-70B-Instruct-q3f16_1-MLC",
      tags: ["experimental", "large-model"],
      short_description:
        "A 70B Llama 3.1 instruct model with advanced fine-tuning. It strives for top-tier performance, potentially rivaling Llama 2 70B, but is only practical on very high-end systems.",
    },
  ],

  "Llama 3.2": [
    {
      name: "Llama-3.2-1B-Instruct-q4f16_1-MLC",
      display_name: "Llama 3.2 1B Instruct (4-bit)",
      provider: "Community",
      family: "Llama",
      version: 3.2,
      parameter_count: "1B",
      quantization: "q4f16_1",
      precision: "4-bit float16 hybrid",
      model_type: "instruct",
      recommended_config: {
        temperature: 0.8,
        top_p: 1.0,
      },
      memory_requirements: "<1 GB VRAM",
      huggingface_link:
        "https://huggingface.co/mlc-ai/Llama-3.2-1B-Instruct-q4f16_1-MLC",
      tags: ["experimental", "compact"],
      short_description:
        "An extremely compact 1B-parameter Llama 3.2 instruct model. It demonstrates basic reasoning and instruction following in a minimal footprint, at the cost of accuracy.",
    },
    {
      name: "Llama-3.2-1B-Instruct-q4f32_1-MLC",
      display_name: "Llama 3.2 1B Instruct (4-bit, high precision)",
      provider: "Community",
      family: "Llama",
      version: 3.2,
      parameter_count: "1B",
      quantization: "q4f32_1",
      precision: "4-bit float32 hybrid",
      model_type: "instruct",
      recommended_config: {
        temperature: 0.8,
        top_p: 1.0,
      },
      memory_requirements: "<1 GB VRAM",
      huggingface_link:
        "https://huggingface.co/mlc-ai/Llama-3.2-1B-Instruct-q4f32_1-MLC",
      tags: ["experimental", "compact"],
      short_description:
        "A 1B Llama 3.2 model with higher quantization precision, yielding slightly better outputs than the standard 1B 4-bit model while remaining extremely lightweight.",
    },
    {
      name: "Llama-3.2-3B-Instruct-q4f16_1-MLC",
      display_name: "Llama 3.2 3B Instruct (4-bit)",
      provider: "Community",
      family: "Llama",
      version: 3.2,
      parameter_count: "3B",
      quantization: "q4f16_1",
      precision: "4-bit float16 hybrid",
      model_type: "instruct",
      recommended_config: {
        temperature: 0.7,
        top_p: 1.0,
      },
      memory_requirements: "≈2 GB VRAM",
      huggingface_link:
        "https://huggingface.co/mlc-ai/Llama-3.2-3B-Instruct-q4f16_1-MLC",
      tags: ["experimental", "compact"],
      short_description:
        "A 3B-parameter Llama 3.2 instruct model offering better accuracy than the 1B version while still being very memory-efficient. Suitable for low-latency applications on modest hardware.",
    },
    {
      name: "Llama-3.2-3B-Instruct-q4f32_1-MLC",
      display_name: "Llama 3.2 3B Instruct (4-bit, high precision)",
      provider: "Community",
      family: "Llama",
      version: 3.2,
      parameter_count: "3B",
      quantization: "q4f32_1",
      precision: "4-bit float32 hybrid",
      model_type: "instruct",
      recommended_config: {
        temperature: 0.7,
        top_p: 1.0,
      },
      memory_requirements: "≈2.5 GB VRAM",
      huggingface_link:
        "https://huggingface.co/mlc-ai/Llama-3.2-3B-Instruct-q4f32_1-MLC",
      tags: ["experimental", "compact"],
      short_description:
        "High-precision 4-bit quantized 3B Llama 3.2 model. It provides improved stability and output quality relative to the standard 3B quant, while maintaining a small size.",
    },
  ],

  "Phi 1.5": [
    {
      name: "phi-1_5-q4f16_1-MLC",
      display_name: "Phi 1.5 (1.3B) Instruct (4-bit)",
      provider: "Microsoft",
      family: "Phi",
      version: 1.5,
      parameter_count: "1.3B",
      quantization: "q4f16_1",
      precision: "4-bit float16 hybrid",
      model_type: "instruct",
      recommended_config: {
        temperature: 0.8,
        top_p: 0.95,
      },
      memory_requirements: "≈1 GB VRAM",
      huggingface_link: "https://huggingface.co/mlc-ai/phi-1_5-q4f16_1-MLC",
      tags: ["compact", "multilingual"],
      short_description:
        "Phi-1.5 is a 1.3B-parameter model that punches above its weight in reasoning ability, exhibiting traits of much larger LLMs&#8203;:contentReference[oaicite:0]{index=0}. It's an instruction-tuned model suitable for basic tasks.",
    },
    {
      name: "phi-1_5-q4f32_1-MLC",
      display_name: "Phi 1.5 (1.3B) Instruct (4-bit, high precision)",
      provider: "Microsoft",
      family: "Phi",
      version: 1.5,
      parameter_count: "1.3B",
      quantization: "q4f32_1",
      precision: "4-bit float32 hybrid",
      model_type: "instruct",
      recommended_config: {
        temperature: 0.8,
        top_p: 0.95,
      },
      memory_requirements: "≈1.2 GB VRAM",
      huggingface_link: "https://huggingface.co/mlc-ai/phi-1_5-q4f32_1-MLC",
      tags: ["compact"],
      short_description:
        "High-precision 4-bit variant of Phi-1.5, providing slightly more accurate outputs. It remains extremely lightweight and is ideal for experimentation on limited hardware.",
    },
  ],

  "Phi 2": [
    {
      name: "phi-2-q4f16_1-MLC",
      display_name: "Phi 2 (4-bit)",
      provider: "Microsoft",
      family: "Phi",
      version: 2,
      parameter_count: "???",
      quantization: "q4f16_1",
      precision: "4-bit float16 hybrid",
      model_type: "instruct",
      recommended_config: {
        temperature: 0.75,
        top_p: 0.95,
      },
      memory_requirements: "~2 GB VRAM",
      huggingface_link: "https://huggingface.co/mlc-ai/phi-2-q4f16_1-MLC",
      tags: ["compact"],
      short_description:
        "Phi-2 is an instruction-following model (second generation of Phi). It increases parameter count over Phi-1.5, improving accuracy while still being small and efficient.",
    },
    {
      name: "phi-2-q4f32_1-MLC",
      display_name: "Phi 2 (4-bit, high precision)",
      provider: "Microsoft",
      family: "Phi",
      version: 2,
      parameter_count: "???",
      quantization: "q4f32_1",
      precision: "4-bit float32 hybrid",
      model_type: "instruct",
      recommended_config: {
        temperature: 0.75,
        top_p: 0.95,
      },
      memory_requirements: "~2.5 GB VRAM",
      huggingface_link: "https://huggingface.co/mlc-ai/phi-2-q4f32_1-MLC",
      tags: ["compact"],
      short_description:
        "Phi-2 with higher quantization precision. Offers slightly better consistency in responses than standard Phi-2, at a minor memory cost.",
    },
  ],

  "Phi 3": [
    {
      name: "Phi-3-mini-4k-instruct-q4f16_1-MLC",
      display_name: "Phi 3 Mini Instruct (4-bit)",
      provider: "Microsoft",
      family: "Phi",
      version: 3.0,
      parameter_count: "Mini (≈1B)",
      quantization: "q4f16_1",
      precision: "4-bit float16 hybrid",
      model_type: "instruct",
      recommended_config: {
        temperature: 0.7,
        top_p: 1.0,
      },
      memory_requirements: "<1 GB VRAM",
      huggingface_link:
        "https://huggingface.co/mlc-ai/Phi-3-mini-4k-instruct-q4f16_1-MLC",
      tags: ["compact"],
      short_description:
        'A "mini" Phi 3 instruct model with a 4k context window. It’s a tiny model geared for instruction tasks, useful for quick, low-resource interactions.',
    },
    {
      name: "Phi-3-mini-4k-instruct-q4f32_1-MLC",
      display_name: "Phi 3 Mini Instruct (4-bit, high precision)",
      provider: "Microsoft",
      family: "Phi",
      version: 3.0,
      parameter_count: "Mini (≈1B)",
      quantization: "q4f32_1",
      precision: "4-bit float32 hybrid",
      model_type: "instruct",
      recommended_config: {
        temperature: 0.7,
        top_p: 1.0,
      },
      memory_requirements: "<1 GB VRAM",
      huggingface_link:
        "https://huggingface.co/mlc-ai/Phi-3-mini-4k-instruct-q4f32_1-MLC",
      tags: ["compact"],
      short_description:
        "High-precision mini Phi 3 instruct model. Maintains a 4k context and slightly better output quality than the standard mini model, while still being extremely lightweight.",
    },
  ],

  "Phi 3.5": [
    {
      name: "Phi-3.5-mini-instruct-q4f16_1-MLC",
      display_name: "Phi 3.5 Mini Instruct (4-bit)",
      provider: "Microsoft",
      family: "Phi",
      version: 3.5,
      parameter_count: "Mini",
      quantization: "q4f16_1",
      precision: "4-bit float16 hybrid",
      model_type: "instruct",
      recommended_config: {
        temperature: 0.7,
        top_p: 1.0,
      },
      memory_requirements: "<1 GB VRAM",
      huggingface_link:
        "https://huggingface.co/mlc-ai/Phi-3.5-mini-instruct-q4f16_1-MLC",
      tags: ["compact"],
      short_description:
        "An updated Phi 3.5 “mini” instruct model. It incorporates refinements over Phi 3, maintaining a very small size ideal for low-power devices.",
    },
    {
      name: "Phi-3.5-mini-instruct-q4f32_1-MLC",
      display_name: "Phi 3.5 Mini Instruct (4-bit, high precision)",
      provider: "Microsoft",
      family: "Phi",
      version: 3.5,
      parameter_count: "Mini",
      quantization: "q4f32_1",
      precision: "4-bit float32 hybrid",
      model_type: "instruct",
      recommended_config: {
        temperature: 0.7,
        top_p: 1.0,
      },
      memory_requirements: "<1 GB VRAM",
      huggingface_link:
        "https://huggingface.co/mlc-ai/Phi-3.5-mini-instruct-q4f32_1-MLC",
      tags: ["compact"],
      short_description:
        "High-precision version of Phi 3.5 mini. It delivers slightly more reliable responses than the standard mini instruct model while keeping the footprint extremely low.",
    },
    {
      name: "Phi-3.5-vision-instruct-q4f16_1-MLC",
      display_name: "Phi 3.5 Vision Instruct (4-bit)",
      provider: "Microsoft",
      family: "Phi",
      version: 3.5,
      parameter_count: "Mini",
      quantization: "q4f16_1",
      precision: "4-bit float16 hybrid",
      model_type: "vision",
      recommended_config: {
        temperature: 0.7,
        top_p: 1.0,
      },
      memory_requirements: "~1 GB VRAM",
      huggingface_link:
        "https://huggingface.co/mlc-ai/Phi-3.5-vision-instruct-q4f16_1-MLC",
      tags: ["vision", "multimodal"],
      short_description:
        "A Phi 3.5 model fine-tuned for vision-and-language tasks. It can ingest images (encoded as tokens) alongside text, enabling multimodal understanding in a small model.",
    },
    {
      name: "Phi-3.5-vision-instruct-q4f32_1-MLC",
      display_name: "Phi 3.5 Vision Instruct (4-bit, high precision)",
      provider: "Microsoft",
      family: "Phi",
      version: 3.5,
      parameter_count: "Mini",
      quantization: "q4f32_1",
      precision: "4-bit float32 hybrid",
      model_type: "vision",
      recommended_config: {
        temperature: 0.7,
        top_p: 1.0,
      },
      memory_requirements: "~1 GB VRAM",
      huggingface_link:
        "https://huggingface.co/mlc-ai/Phi-3.5-vision-instruct-q4f32_1-MLC",
      tags: ["vision", "multimodal"],
      short_description:
        "High-precision version of Phi 3.5 Vision Instruct. It provides improved multimodal response quality, handling image-based queries with greater accuracy.",
    },
  ],

  "Gemma 2": [
    {
      name: "gemma-2-2b-it-q4f16_1-MLC",
      display_name: "Gemma 2 2B Instruct (4-bit)",
      provider: "Google DeepMind",
      family: "Gemma",
      version: 2,
      parameter_count: "2B",
      quantization: "q4f16_1",
      precision: "4-bit float16 hybrid",
      model_type: "instruct",
      recommended_config: {
        temperature: 0.7,
        top_p: 0.9,
      },
      memory_requirements: "≈1.5 GB VRAM",
      huggingface_link: "https://huggingface.co/mlc-ai/gemma-2b-it-q4f16_1-MLC",
      tags: ["multilingual", "efficient"],
      short_description:
        "Gemma 2 (2B) is a lightweight instruction-tuned model from Google DeepMind’s Gemma family&#8203;:contentReference[oaicite:1]{index=1}. It’s designed for efficiency, providing decent performance in a small package.",
    },
    {
      name: "gemma-2-2b-jpn-it-q4f16_1-MLC",
      display_name: "Gemma 2 2B Japanese Instruct (4-bit)",
      provider: "Google DeepMind",
      family: "Gemma",
      version: 2,
      parameter_count: "2B",
      quantization: "q4f16_1",
      precision: "4-bit float16 hybrid",
      model_type: "instruct",
      recommended_config: {
        temperature: 0.7,
        top_p: 0.9,
      },
      memory_requirements: "≈1.5 GB VRAM",
      huggingface_link:
        "https://huggingface.co/mlc-ai/gemma-2-2b-jpn-it-q4f16_1-MLC",
      tags: ["multilingual", "japanese"],
      short_description:
        "A Japanese instruction-tuned variant of the Gemma 2 2B model. It specializes in Japanese outputs and understanding, making it useful for JP-language assistant tasks.",
    },
    {
      name: "gemma-2-9b-it-q4f16_1-MLC",
      display_name: "Gemma 2 9B Instruct (4-bit)",
      provider: "Google DeepMind",
      family: "Gemma",
      version: 2,
      parameter_count: "9B",
      quantization: "q4f16_1",
      precision: "4-bit float16 hybrid",
      model_type: "instruct",
      recommended_config: {
        temperature: 0.65,
        top_p: 0.9,
      },
      memory_requirements: "≈6 GB VRAM",
      huggingface_link:
        "https://huggingface.co/mlc-ai/gemma-2-9b-it-q4f16_1-MLC",
      tags: ["multilingual", "high-accuracy"],
      short_description:
        "Gemma 2 (9B) is the larger variant in the Gemma 2 family, offering improved accuracy and knowledge. It remains relatively compact while delivering state-of-the-art performance for its size&#8203;:contentReference[oaicite:2]{index=2}.",
    },
  ],

  "RedPajama INCITE Chat 3B v1": [
    {
      name: "RedPajama-INCITE-Chat-3B-v1-q4f16_1-MLC",
      display_name: "RedPajama INCITE Chat 3B v1 (4-bit)",
      provider: "Together",
      family: "RedPajama",
      version: "INCITE v1",
      parameter_count: "3B",
      quantization: "q4f16_1",
      precision: "4-bit float16 hybrid",
      model_type: "chat",
      recommended_config: {
        temperature: 0.75,
        top_p: 0.9,
      },
      memory_requirements: "≈2 GB VRAM",
      huggingface_link:
        "https://huggingface.co/mlc-ai/RedPajama-INCITE-Chat-3B-v1-q4f16_1-MLC",
      tags: ["multilingual", "compact"],
      short_description:
        "RedPajama-INCITE 3B is an open 3B-parameter chat model fine-tuned on RedPajama data. It outperforms older models of similar size (e.g. GPT-NeoX 2.7B) on many tasks&#8203;:contentReference[oaicite:3]{index=3}, making it a strong tiny chatbot.",
    },
    {
      name: "RedPajama-INCITE-Chat-3B-v1-q4f32_1-MLC",
      display_name: "RedPajama INCITE Chat 3B v1 (4-bit, high precision)",
      provider: "Together",
      family: "RedPajama",
      version: "INCITE v1",
      parameter_count: "3B",
      quantization: "q4f32_1",
      precision: "4-bit float32 hybrid",
      model_type: "chat",
      recommended_config: {
        temperature: 0.75,
        top_p: 0.9,
      },
      memory_requirements: "≈2.5 GB VRAM",
      huggingface_link:
        "https://huggingface.co/mlc-ai/RedPajama-INCITE-Chat-3B-v1-q4f32_1-MLC",
      tags: ["compact"],
      short_description:
        "High-precision 4-bit version of RedPajama-INCITE 3B Chat. Provides marginally better output stability while retaining the small footprint.",
    },
  ],

  "Mistral 7B v0.2": [
    {
      name: "Mistral-7B-Instruct-v0.2-q4f16_1-MLC",
      display_name: "Mistral 7B Instruct v0.2 (4-bit)",
      provider: "Mistral AI",
      family: "Mistral",
      version: "0.2",
      parameter_count: "7B",
      quantization: "q4f16_1",
      precision: "4-bit float16 hybrid",
      model_type: "instruct",
      recommended_config: {
        temperature: 0.7,
        top_p: 0.9,
      },
      memory_requirements: "≈4 GB VRAM",
      huggingface_link:
        "https://huggingface.co/mlc-ai/Mistral-7B-Instruct-v0.2-q4f16_1-MLC",
      tags: ["multilingual", "efficient"],
      short_description:
        "Mistral 7B v0.2 is an early instruction-tuned model from Mistral AI. Built on the powerful Mistral 7B base, it delivers strong performance for a 7B model, handling multiple languages and tasks with ease.",
    },
    {
      name: "Mistral-7B-Instruct-v0.2-q4f32_1-MLC",
      display_name: "Mistral 7B Instruct v0.2 (4-bit, high precision)",
      provider: "Mistral AI",
      family: "Mistral",
      version: "0.2",
      parameter_count: "7B",
      quantization: "q4f32_1",
      precision: "4-bit float32 hybrid",
      model_type: "instruct",
      recommended_config: {
        temperature: 0.7,
        top_p: 0.9,
      },
      memory_requirements: "≈5 GB VRAM",
      huggingface_link:
        "https://huggingface.co/mlc-ai/Mistral-7B-Instruct-v0.2-q4f32_1-MLC",
      tags: ["efficient"],
      short_description:
        "High-precision quantized Mistral 7B v0.2 instruct model. It offers slightly improved output correctness over the standard q4f16 model, useful if a bit more memory is available.",
    },
  ],

  "Mistral 7B v0.3": [
    {
      name: "Mistral-7B-Instruct-v0.3-q4f16_1-MLC",
      display_name: "Mistral 7B Instruct v0.3 (4-bit)",
      provider: "Mistral AI",
      family: "Mistral",
      version: "0.3",
      parameter_count: "7B",
      quantization: "q4f16_1",
      precision: "4-bit float16 hybrid",
      model_type: "instruct",
      recommended_config: {
        temperature: 0.65,
        top_p: 0.9,
      },
      memory_requirements: "≈4 GB VRAM",
      huggingface_link:
        "https://huggingface.co/mlc-ai/Mistral-7B-Instruct-v0.3-q4f16_1-MLC",
      tags: ["multilingual", "efficient"],
      short_description:
        "Mistral 7B v0.3 is an improved instruct model that leverages the highly capable Mistral base. It achieves performance on par with larger models like Llama 2 13B on many benchmarks&#8203;:contentReference[oaicite:4]{index=4}, in a 7B form factor.",
    },
    {
      name: "Mistral-7B-Instruct-v0.3-q4f32_1-MLC",
      display_name: "Mistral 7B Instruct v0.3 (4-bit, high precision)",
      provider: "Mistral AI",
      family: "Mistral",
      version: "0.3",
      parameter_count: "7B",
      quantization: "q4f32_1",
      precision: "4-bit float32 hybrid",
      model_type: "instruct",
      recommended_config: {
        temperature: 0.65,
        top_p: 0.9,
      },
      memory_requirements: "≈5 GB VRAM",
      huggingface_link:
        "https://huggingface.co/mlc-ai/Mistral-7B-Instruct-v0.3-q4f32_1-MLC",
      tags: ["efficient"],
      short_description:
        "High-precision quantized Mistral 7B v0.3. Maintains the strong performance of Mistral v0.3 while reducing generation errors slightly, at a minor memory cost.",
    },
  ],

  "Hermes 2 (Mistral 7B)": [
    {
      name: "Hermes-2-Pro-Mistral-7B-q4f16_1-MLC",
      display_name: "Hermes 2 Pro (Mistral 7B, 4-bit)",
      provider: "Stability/Community",
      family: "Mistral",
      version: "Hermes 2",
      parameter_count: "7B",
      quantization: "q4f16_1",
      precision: "4-bit float16 hybrid",
      model_type: "chat",
      recommended_config: {
        temperature: 0.65,
        top_p: 0.9,
      },
      memory_requirements: "≈4 GB VRAM",
      huggingface_link:
        "https://huggingface.co/mlc-ai/Hermes-2-Pro-Mistral-7B-q4f16_1-MLC",
      tags: ["aligned"],
      short_description:
        "Hermes 2 Pro is a fine-tuned variant of Mistral 7B focused on helpfulness and alignment. It produces polite, high-quality responses, leveraging Mistral’s strong base to maximize 7B performance.",
    },
  ],

  "Qwen 1.5": [
    {
      name: "Qwen1.5-1.8B-Chat-q4f16_1",
      display_name: "Qwen 1.5 1.8B Chat (4-bit)",
      provider: "Alibaba Cloud",
      family: "Qwen",
      version: "1.5",
      parameter_count: "1.8B",
      quantization: "q4f16_1",
      precision: "4-bit float16 hybrid",
      model_type: "chat",
      recommended_config: {
        temperature: 0.8,
        top_p: 0.9,
      },
      memory_requirements: "≈1.2 GB VRAM",
      huggingface_link:
        "https://huggingface.co/mlc-ai/Qwen1.5-1.8B-Chat-q4f16_1-MLC",
      tags: ["multilingual", "compact"],
      short_description:
        "Qwen 1.5 (通义千问 1.5) is Alibaba’s 1.8B-parameter chat model. It is bilingual, capable of fluent English and Chinese responses, and optimized for low-resource use.",
    },
    {
      name: "Qwen1.5-1.8B-Chat-q4f32_1",
      display_name: "Qwen 1.5 1.8B Chat (4-bit, high precision)",
      provider: "Alibaba Cloud",
      family: "Qwen",
      version: "1.5",
      parameter_count: "1.8B",
      quantization: "q4f32_1",
      precision: "4-bit float32 hybrid",
      model_type: "chat",
      recommended_config: {
        temperature: 0.8,
        top_p: 0.9,
      },
      memory_requirements: "≈1.5 GB VRAM",
      huggingface_link:
        "https://huggingface.co/mlc-ai/Qwen1.5-1.8B-Chat-q4f32_1-MLC",
      tags: ["compact"],
      short_description:
        "High-precision 4-bit Qwen 1.5 chat model. Yields slightly more accurate and stable outputs than the standard version, while remaining very lightweight.",
    },
  ],

  "Qwen 2": [
    {
      name: "Qwen2-0.5B-Instruct-q4f16_1-MLC",
      display_name: "Qwen 2 0.5B Instruct (4-bit)",
      provider: "Alibaba Cloud",
      family: "Qwen",
      version: "2",
      parameter_count: "0.5B",
      quantization: "q4f16_1",
      precision: "4-bit float16 hybrid",
      model_type: "instruct",
      recommended_config: {
        temperature: 0.9,
        top_p: 0.95,
      },
      memory_requirements: "<1 GB VRAM",
      huggingface_link:
        "https://huggingface.co/mlc-ai/Qwen2-0.5B-Instruct-q4f16_1-MLC",
      tags: ["compact", "multilingual"],
      short_description:
        "A tiny 500M-parameter Qwen 2 instruct model. Despite its size, it’s trained on diverse text and code&#8203;:contentReference[oaicite:5]{index=5}, making it useful for simple tasks with minimal resources.",
    },
    {
      name: "Qwen2-1.5B-Instruct-q4f16_1-MLC",
      display_name: "Qwen 2 1.5B Instruct (4-bit)",
      provider: "Alibaba Cloud",
      family: "Qwen",
      version: "2",
      parameter_count: "1.5B",
      quantization: "q4f16_1",
      precision: "4-bit float16 hybrid",
      model_type: "instruct",
      recommended_config: {
        temperature: 0.8,
        top_p: 0.95,
      },
      memory_requirements: "≈1 GB VRAM",
      huggingface_link:
        "https://huggingface.co/mlc-ai/Qwen2-1.5B-Instruct-q4f16_1-MLC",
      tags: ["compact", "multilingual"],
      short_description:
        "Qwen 2 1.5B is a small instruction model with improved capabilities over the 0.5B version. It can handle both English and Chinese queries with reasonable quality given its size.",
    },
    {
      name: "Qwen2-1.5B-Instruct-q4f32_1-MLC",
      display_name: "Qwen 2 1.5B Instruct (4-bit, high precision)",
      provider: "Alibaba Cloud",
      family: "Qwen",
      version: "2",
      parameter_count: "1.5B",
      quantization: "q4f32_1",
      precision: "4-bit float32 hybrid",
      model_type: "instruct",
      recommended_config: {
        temperature: 0.8,
        top_p: 0.95,
      },
      memory_requirements: "≈1.2 GB VRAM",
      huggingface_link:
        "https://huggingface.co/mlc-ai/Qwen2-1.5B-Instruct-q4f32_1-MLC",
      tags: ["compact"],
      short_description:
        "High-precision quantized Qwen 2 1.5B instruct model. It yields marginally better responses than the standard version, helpful when striving for quality within a small model.",
    },
    {
      name: "Qwen2-7B-Instruct-q4f16_1-MLC",
      display_name: "Qwen 2 7B Instruct (4-bit)",
      provider: "Alibaba Cloud",
      family: "Qwen",
      version: "2",
      parameter_count: "7B",
      quantization: "q4f16_1",
      precision: "4-bit float16 hybrid",
      model_type: "instruct",
      recommended_config: {
        temperature: 0.7,
        top_p: 0.9,
      },
      memory_requirements: "≈4 GB VRAM",
      huggingface_link:
        "https://huggingface.co/mlc-ai/Qwen2-7B-Instruct-q4f16_1-MLC",
      tags: ["multilingual"],
      short_description:
        "Qwen 2 7B is the largest of the Qwen 2 series, offering much stronger performance. It’s an instruction-tuned 7B model capable of handling complex prompts in multiple languages.",
    },
    {
      name: "Qwen2-7B-Instruct-q4f32_1-MLC",
      display_name: "Qwen 2 7B Instruct (4-bit, high precision)",
      provider: "Alibaba Cloud",
      family: "Qwen",
      version: "2",
      parameter_count: "7B",
      quantization: "q4f32_1",
      precision: "4-bit float32 hybrid",
      model_type: "instruct",
      recommended_config: {
        temperature: 0.7,
        top_p: 0.9,
      },
      memory_requirements: "≈5 GB VRAM",
      huggingface_link:
        "https://huggingface.co/mlc-ai/Qwen2-7B-Instruct-q4f32_1-MLC",
      tags: ["multilingual"],
      short_description:
        "High-precision 7B Qwen 2 instruct model. It produces more reliable and accurate outputs than the standard 7B quantization, leveraging Qwen’s diverse pretraining data for high-quality answers.",
    },
  ],

  "Qwen 2.5": [
    {
      name: "Qwen2.5-3B-Instruct-q4f16_1-MLC",
      display_name: "Qwen 2.5 3B Instruct (4-bit)",
      provider: "Alibaba Cloud",
      family: "Qwen",
      version: "2.5",
      parameter_count: "3B",
      quantization: "q4f16_1",
      precision: "4-bit float16 hybrid",
      model_type: "instruct",
      recommended_config: {
        temperature: 0.7,
        top_p: 0.9,
      },
      memory_requirements: "≈2 GB VRAM",
      huggingface_link:
        "https://huggingface.co/mlc-ai/Qwen2.5-3B-Instruct-q4f16_1-MLC",
      tags: ["multilingual"],
      short_description:
        "Qwen 2.5 (3B) is an intermediate update in the Qwen series, possibly incorporating improved training or specialization. It offers a balance between the small 1.5B and larger 7B, useful for moderate workloads.",
    },
    {
      name: "Qwen2.5-3B-Instruct-q4f32_1-MLC",
      display_name: "Qwen 2.5 3B Instruct (4-bit, high precision)",
      provider: "Alibaba Cloud",
      family: "Qwen",
      version: "2.5",
      parameter_count: "3B",
      quantization: "q4f32_1",
      precision: "4-bit float32 hybrid",
      model_type: "instruct",
      recommended_config: {
        temperature: 0.7,
        top_p: 0.9,
      },
      memory_requirements: "≈2.5 GB VRAM",
      huggingface_link:
        "https://huggingface.co/mlc-ai/Qwen2.5-3B-Instruct-q4f32_1-MLC",
      tags: ["multilingual"],
      short_description:
        "High-precision version of Qwen 2.5 3B instruct. It provides slightly improved output consistency, which can be beneficial for code or math-related instructions that Qwen 2.5 might be tuned for.",
    },
  ],

  "TinyLlama 1.1B Chat v0.4": [
    {
      name: "TinyLlama-1.1B-Chat-v0.4-q4f16_1-MLC",
      display_name: "TinyLlama 1.1B Chat v0.4 (4-bit)",
      provider: "Open Community",
      family: "TinyLlama",
      version: "0.4",
      parameter_count: "1.1B",
      quantization: "q4f16_1",
      precision: "4-bit float16 hybrid",
      model_type: "chat",
      recommended_config: {
        temperature: 0.9,
        top_p: 0.95,
      },
      memory_requirements: "<1 GB VRAM",
      huggingface_link:
        "https://huggingface.co/mlc-ai/TinyLlama-1.1B-Chat-v0.4-q4f16_1-MLC",
      tags: ["ultra-compact"],
      short_description:
        "TinyLlama 1.1B v0.4 is an ultra-compact chat model. It provides basic conversational ability in an extremely small footprint, useful for experimentation and devices with very limited memory.",
    },
    {
      name: "TinyLlama-1.1B-Chat-v0.4-q4f32_1-MLC",
      display_name: "TinyLlama 1.1B Chat v0.4 (4-bit, high precision)",
      provider: "Open Community",
      family: "TinyLlama",
      version: "0.4",
      parameter_count: "1.1B",
      quantization: "q4f32_1",
      precision: "4-bit float32 hybrid",
      model_type: "chat",
      recommended_config: {
        temperature: 0.9,
        top_p: 0.95,
      },
      memory_requirements: "<1 GB VRAM",
      huggingface_link:
        "https://huggingface.co/mlc-ai/TinyLlama-1.1B-Chat-v0.4-q4f32_1-MLC",
      tags: ["ultra-compact"],
      short_description:
        "High-precision TinyLlama v0.4. This version squeezes a bit more quality out of the 1.1B model, though it remains very limited compared to larger LLMs.",
    },
  ],

  "TinyLlama 1.1B Chat v1.0": [
    {
      name: "TinyLlama-1.1B-Chat-v1.0-q4f16_1-MLC",
      display_name: "TinyLlama 1.1B Chat v1.0 (4-bit)",
      provider: "Open Community",
      family: "TinyLlama",
      version: "1.0",
      parameter_count: "1.1B",
      quantization: "q4f16_1",
      precision: "4-bit float16 hybrid",
      model_type: "chat",
      recommended_config: {
        temperature: 0.85,
        top_p: 0.95,
      },
      memory_requirements: "<1 GB VRAM",
      huggingface_link:
        "https://huggingface.co/mlc-ai/TinyLlama-1.1B-Chat-v1.0-q4f16_1-MLC",
      tags: ["ultra-compact"],
      short_description:
        "The 1.1B TinyLlama (v1.0) chat model is a refined version with slightly improved conversational capability. It remains extremely resource-friendly, suitable for quick tests and simple queries.",
    },
    {
      name: "TinyLlama-1.1B-Chat-v1.0-q4f32_1-MLC",
      display_name: "TinyLlama 1.1B Chat v1.0 (4-bit, high precision)",
      provider: "Open Community",
      family: "TinyLlama",
      version: "1.0",
      parameter_count: "1.1B",
      quantization: "q4f32_1",
      precision: "4-bit float32 hybrid",
      model_type: "chat",
      recommended_config: {
        temperature: 0.85,
        top_p: 0.95,
      },
      memory_requirements: "<1 GB VRAM",
      huggingface_link:
        "https://huggingface.co/mlc-ai/TinyLlama-1.1B-Chat-v1.0-q4f32_1-MLC",
      tags: ["ultra-compact"],
      short_description:
        "High-precision quantized TinyLlama v1.0. Delivers marginally better outputs than the normal v1.0 quantization. Still best suited for only very simple tasks due to the tiny model size.",
    },
  ],

  "GPT-2": [
    {
      name: "gpt2-q0f16-ctx1k-MLC",
      display_name: "GPT-2 117M (FP16)",
      provider: "OpenAI",
      family: "GPT-2",
      version: "1.5b-era",
      parameter_count: "117M",
      quantization: "q0f16",
      precision: "16-bit (no quantization)",
      model_type: "base",
      recommended_config: {
        temperature: 1.0,
        top_p: 1.0,
      },
      memory_requirements: "≈0.5 GB VRAM",
      huggingface_link: "https://huggingface.co/mlc-ai/gpt2-q0f16-MLC",
      tags: ["base-model"],
      short_description:
        "The original GPT-2 (117M parameters) model, running in half-precision. It’s a general language model (not instruction-tuned) that can generate fluent text but may require careful prompting.",
    },
    {
      name: "gpt2-medium-q0f16-ML",
      display_name: "GPT-2 Medium 345M (FP16)",
      provider: "OpenAI",
      family: "GPT-2",
      version: "1.5b-era",
      parameter_count: "345M",
      quantization: "q0f16",
      precision: "16-bit (no quantization)",
      model_type: "base",
      recommended_config: {
        temperature: 1.0,
        top_p: 1.0,
      },
      memory_requirements: "≈1.3 GB VRAM",
      huggingface_link: "https://huggingface.co/mlc-ai/gpt2-medium-q0f16-MLC",
      tags: ["base-model"],
      short_description:
        "GPT-2 Medium (345M parameters) in FP16 precision. This is a larger variant of GPT-2 that produces more coherent and lengthy text than the 117M version, but it remains an older, unfine-tuned model.",
    },
  ],

  "StableLM 2 (Zephyr 1.6B)": [
    {
      name: "stablelm-2-zephyr-1_6b-q4f16_1-MLC",
      display_name: "StableLM 2 Zephyr 1.6B (4-bit)",
      provider: "Stability AI",
      family: "StableLM",
      version: 2,
      parameter_count: "1.6B",
      quantization: "q4f16_1",
      precision: "4-bit float16 hybrid",
      model_type: "chat",
      recommended_config: {
        temperature: 0.75,
        top_p: 0.9,
      },
      memory_requirements: "≈1.2 GB VRAM",
      huggingface_link:
        "https://huggingface.co/mlc-ai/stablelm-2-zephyr-1_6b-q4f16_1-MLC",
      tags: ["multilingual"],
      short_description:
        "StableLM 2 (Zephyr) is a 1.6B-parameter model from Stability AI’s second-generation StableLM. The Zephyr fine-tune focuses on chat and creative writing. Despite its small size, it performs reasonably well on casual dialogue.",
    },
    {
      name: "stablelm-2-zephyr-1_6b-q4f32_1-MLC",
      display_name: "StableLM 2 Zephyr 1.6B (4-bit, high precision)",
      provider: "Stability AI",
      family: "StableLM",
      version: 2,
      parameter_count: "1.6B",
      quantization: "q4f32_1",
      precision: "4-bit float32 hybrid",
      model_type: "chat",
      recommended_config: {
        temperature: 0.75,
        top_p: 0.9,
      },
      memory_requirements: "≈1.5 GB VRAM",
      huggingface_link:
        "https://huggingface.co/mlc-ai/stablelm-2-zephyr-1_6b-q4f32_1-MLC",
      tags: [],
      short_description:
        "High-precision 4-bit StableLM 2 Zephyr. It provides improved fluency and correctness compared to the standard 4-bit version, while still being lightweight.",
    },
  ],

  "SmolLM 1.7B": [
    {
      name: "SmolLM-1.7B-Instruct-q4f16_1-MLC",
      display_name: "SmolLM 1.7B Instruct (4-bit)",
      provider: "Open Community",
      family: "SmolLM",
      version: 1,
      parameter_count: "1.7B",
      quantization: "q4f16_1",
      precision: "4-bit float16 hybrid",
      model_type: "instruct",
      recommended_config: {
        temperature: 0.85,
        top_p: 0.9,
      },
      memory_requirements: "≈1.3 GB VRAM",
      huggingface_link:
        "https://huggingface.co/mlc-ai/SmolLM-1.7B-Instruct-q4f16_1-MLC",
      tags: ["compact"],
      short_description:
        "SmolLM 1.7B is a small-scale instruction-tuned model. It trades off accuracy for speed and memory efficiency, suitable for simple tasks or environments where larger models cannot run.",
    },
  ],

  "SmolLM 360M": [
    {
      name: "SmolLM-360M-Instruct-q4f16_1-MLC",
      display_name: "SmolLM 360M Instruct (4-bit)",
      provider: "Open Community",
      family: "SmolLM",
      version: 1,
      parameter_count: "360M",
      quantization: "q4f16_1",
      precision: "4-bit float16 hybrid",
      model_type: "instruct",
      recommended_config: {
        temperature: 0.9,
        top_p: 0.9,
      },
      memory_requirements: "≈0.3 GB VRAM",
      huggingface_link:
        "https://huggingface.co/mlc-ai/SmolLM-360M-Instruct-q4f16_1-MLC",
      tags: ["ultra-compact"],
      short_description:
        "An extremely small 360M parameter model tuned for instructions. SmolLM 360M can handle only very basic queries, but its footprint is tiny, enabling use on devices with minimal memory.",
    },
  ],

  "SmolLM 135M": [
    {
      name: "SmolLM2-135M-Instruct-q0f16-MLC",
      display_name: "SmolLM 135M Instruct (4-bit)",
      provider: "Open Community",
      family: "SmolLM",
      version: 1,
      parameter_count: "135M",
      quantization: "q4f16_1",
      precision: "4-bit float16 hybrid",
      model_type: "instruct",
      recommended_config: {
        temperature: 1.0,
        top_p: 0.9,
      },
      memory_requirements: "≈0.2 GB VRAM",
      huggingface_link:
        "https://huggingface.co/mlc-ai/SmolLM-135M-Instruct-q4f16_1-MLC",
      tags: ["ultra-compact"],
      short_description:
        "One of the smallest instruct-tuned models, SmolLM 135M can follow very simple instructions. Its capabilities are extremely limited, but it requires only a few hundred MB of memory to run.",
    },
  ],

  "SmolLM 2 1.7B": [
    {
      name: "SmolLM2-1.7B-Instruct-q4f16_1-MLC",
      display_name: "SmolLM2 1.7B Instruct (4-bit)",
      provider: "Open Community",
      family: "SmolLM",
      version: 2,
      parameter_count: "1.7B",
      quantization: "q4f16_1",
      precision: "4-bit float16 hybrid",
      model_type: "instruct",
      recommended_config: {
        temperature: 0.85,
        top_p: 0.9,
      },
      memory_requirements: "≈1.3 GB VRAM",
      huggingface_link:
        "https://huggingface.co/mlc-ai/SmolLM2-1.7B-Instruct-q4f16_1-MLC",
      tags: ["compact", "extended-context"],
      short_description:
        "SmolLM2 1.7B is the second-generation SmolLM with a 4k context window. It provides better instruction following than SmolLM v1 and supports longer prompts, all while remaining lightweight.",
    },
    {
      name: "SmolLM2-1.7B-Instruct-q4f32_1-MLC",
      display_name: "SmolLM2 1.7B Instruct (4-bit, high precision)",
      provider: "Open Community",
      family: "SmolLM",
      version: 2,
      parameter_count: "1.7B",
      quantization: "q4f32_1",
      precision: "4-bit float32 hybrid",
      model_type: "instruct",
      recommended_config: {
        temperature: 0.85,
        top_p: 0.9,
      },
      memory_requirements: "≈1.6 GB VRAM",
      huggingface_link:
        "https://huggingface.co/mlc-ai/SmolLM2-1.7B-Instruct-q4f32_1-MLC",
      tags: ["compact"],
      short_description:
        "High-precision SmolLM2 1.7B instruct. Improves output accuracy slightly relative to the standard SmolLM2, which can be helpful given the model’s small size.",
    },
  ],

  "SmolLM 2 360M": [
    {
      name: "SmolLM2-360M-Instruct-q4f16_1-MLC",
      display_name: "SmolLM2 360M Instruct (4-bit)",
      provider: "Open Community",
      family: "SmolLM",
      version: 2,
      parameter_count: "360M",
      quantization: "q4f16_1",
      precision: "4-bit float16 hybrid",
      model_type: "instruct",
      recommended_config: {
        temperature: 0.95,
        top_p: 0.9,
      },
      memory_requirements: "≈0.3 GB VRAM",
      huggingface_link:
        "https://huggingface.co/mlc-ai/SmolLM2-360M-Instruct-q4f16_1-MLC",
      tags: ["ultra-compact", "extended-context"],
      short_description:
        "SmolLM2 360M is an extremely small model with a 4k context. It’s useful only for trivial tasks but can handle longer inputs than the original SmolLM 360M due to the extended context length.",
    },
    {
      name: "SmolLM2-360M-Instruct-q4f32_1-MLC",
      display_name: "SmolLM2 360M Instruct (4-bit, high precision)",
      provider: "Open Community",
      family: "SmolLM",
      version: 2,
      parameter_count: "360M",
      quantization: "q4f32_1",
      precision: "4-bit float32 hybrid",
      model_type: "instruct",
      recommended_config: {
        temperature: 0.95,
        top_p: 0.9,
      },
      memory_requirements: "≈0.4 GB VRAM",
      huggingface_link:
        "https://huggingface.co/mlc-ai/SmolLM2-360M-Instruct-q4f32_1-MLC",
      tags: ["ultra-compact"],
      short_description:
        "High-precision SmolLM2 360M. It offers minimal improvements in output, but every bit helps for such a tiny model. Still only suitable for the simplest queries.",
    },
  ],

  "SmolLM 2 135M": [
    {
      name: "SmolLM2-135M-Instruct-q0f16-MLC",
      display_name: "SmolLM2 135M Instruct (FP16)",
      provider: "Open Community",
      family: "SmolLM",
      version: 2,
      parameter_count: "135M",
      quantization: "q0f16",
      precision: "16-bit (no quantization)",
      model_type: "instruct",
      recommended_config: {
        temperature: 1.0,
        top_p: 0.9,
      },
      memory_requirements: "≈0.25 GB VRAM",
      huggingface_link:
        "https://huggingface.co/mlc-ai/SmolLM2-135M-Instruct-q0f16-MLC",
      tags: ["ultra-compact", "extended-context"],
      short_description:
        "One of the absolute smallest LLMs with a 4k context. SmolLM2 135M can process long inputs but has extremely limited reasoning or fluency. It serves as a proof-of-concept for tiny extended-context models.",
    },
    {
      name: "SmolLM2-135M-Instruct-q4f16_1-MLC",
      display_name: "SmolLM2 135M Instruct (4-bit)",
      provider: "Open Community",
      family: "SmolLM",
      version: 2,
      parameter_count: "135M",
      quantization: "q4f16_1",
      precision: "4-bit float16 hybrid",
      model_type: "instruct",
      recommended_config: {
        temperature: 1.0,
        top_p: 0.9,
      },
      memory_requirements: "≈0.15 GB VRAM",
      huggingface_link:
        "https://huggingface.co/mlc-ai/SmolLM2-135M-Instruct-q4f16_1-MLC",
      tags: ["ultra-compact"],
      short_description:
        "A quantized version of the tiny SmolLM2 135M model. It’s essentially a novelty model – capable of only very rudimentary text interactions, but can run almost anywhere due to its size.",
    },
  ],
};
