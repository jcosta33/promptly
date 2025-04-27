import type { ActionDefinition } from "../models/action_models";
import { PREDEFINED_ACTIONS } from "./actions_data";

/**
 * Get all available actions
 */
export function get_all_actions(): ActionDefinition[] {
  return [...PREDEFINED_ACTIONS];
}
