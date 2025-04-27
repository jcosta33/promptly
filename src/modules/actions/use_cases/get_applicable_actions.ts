import { PageCategory } from "../../context/models/context";
import { SelectionType } from "../../selection/models/selection";
import { ActionDefinition } from "../models/action_models";
import { get_all_actions } from "../repositories/actions_repository";

/**
 * Type for filter criteria to find applicable actions
 */
export type ActionFilterCriteria = {
  selectionTypes: SelectionType[];
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
    // Check if the action supports this selection type
    const matchesSelectionType = action.selectionTypes.some((type) => {
      return criteria.selectionTypes.includes(type);
    });

    // Check if the action supports this page category
    const matchesPageCategory = action.pageCategories.includes(
      criteria.pageCategory
    );

    return matchesSelectionType && matchesPageCategory;
  });
}
