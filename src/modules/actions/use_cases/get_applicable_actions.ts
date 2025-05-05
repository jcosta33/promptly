import type { PageCategory } from "../../context/models/context";
import type {
  SelectionContextType,
  SelectionDataType,
} from "../../selection/models/selection";
import type { ActionDefinition } from "../models/action_models";
import { get_all_actions } from "../repositories/actions_repository";

/**
 * Type for filter criteria to find applicable actions
 */
export type ActionFilterCriteria = {
  contextTypes: SelectionContextType[];
  dataTypes: SelectionDataType[];
  pageCategory: PageCategory;
};

/**
 * Get actions applicable to the current selection and page context
 *
 * @param criteria Filter criteria including selection type and page category
 * @returns Array of applicable action definitions
 */
export function get_applicable_actions(
  criteria: ActionFilterCriteria
): ActionDefinition[] {
  return get_all_actions().filter((action) => {
    const matchesContextType = action.contextTypes.some((type) => {
      return criteria.contextTypes.includes(type);
    });

    const matchesDataType = action.dataTypes.some((type) => {
      return criteria.dataTypes.includes(type);
    });

    const matchesPageCategory = action.pageCategories.some((category) => {
      return criteria.pageCategory.includes(category);
    });

    return matchesContextType && matchesDataType && matchesPageCategory;
  });
}
