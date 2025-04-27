import type { SelectionData } from "../models/selection";
import { transform_raw_selection_to_selection_data } from "../transformers/transform_raw_selection_to_selection_data";

export function process_selection(selection: Selection): SelectionData | null {
  return transform_raw_selection_to_selection_data(selection);
}
