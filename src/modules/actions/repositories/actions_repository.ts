import { PREDEFINED_ACTIONS } from "./actions_data";

import type { ActionDefinition } from "../models/action_models";

/**
 * Get all available actions
 */
export function get_all_actions(): ActionDefinition[] {
  return [...PREDEFINED_ACTIONS];
}
