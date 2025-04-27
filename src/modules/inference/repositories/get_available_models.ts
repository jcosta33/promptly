import { AVAILABLE_MODELS as AVAILABLE_MODELS_DATA } from "./available_models_data";
import type { ModelGroups } from "../models/inference_model";
/**
 * Retrieves the static list of available models.
 * @returns The grouped available models data.
 */
export function get_available_models_data(): ModelGroups {
  return AVAILABLE_MODELS_DATA as ModelGroups; // Return the imported data
}
