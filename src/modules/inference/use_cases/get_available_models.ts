import { get_available_models_data } from "../repositories/get_available_models";
import type { ModelGroups } from "../models/inference_model"; // Use renamed type

/**
 * Get the list of available WebLLM models.
 * Currently retrieves the static list defined in the repository.
 * 
 * @returns Object containing available model groups.
 */
export function get_available_models(): ModelGroups {
  return get_available_models_data();
}
