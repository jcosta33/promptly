import { AVAILABLE_MODELS } from "../repositories/get_available_models";

/**
 * Get the list of available WebLLM models
 * 
 * @param includeGpuModels Whether to include models that require WebGPU
 * @returns Array of available model configs
 */
export function get_available_models() {
  return AVAILABLE_MODELS
}
