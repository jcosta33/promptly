import type { PageCategory } from "$/modules/context/models/context";
import type { InferenceParameters } from "$/modules/inference/models/inference_model";
import type {
  SelectionContextType,
  SelectionDataType,
} from "$/modules/selection/models/selection";
import type { IconType } from "react-icons";

/**
 * Action definition type
 */
export type ActionDefinition = {
  id: string;
  /**
   * Display name for the action shown to the user
   */
  name: string;
  /**
   * Short description of what the action does
   */
  description: string;
  /**
   * Applicable selection types for this action
   */
  contextTypes: SelectionContextType[];
  /**
   * Applicable selection types for this action
   */
  dataTypes: SelectionDataType[];
  /**
   * Applicable page contexts for this action
   */
  pageCategories: PageCategory[];
  /**
   * System prompt template for the LLM
   * May include placeholders like {{selection}} to be replaced with actual content
   */
  systemPrompt: string;
  /**
   * User prompt template for the LLM
   * May include placeholders like {{selection}} to be replaced with actual content
   */
  userPrompt: string | null;
  /**
   * Custom LLM parameters for this action, if any
   * Will be merged with default parameters
   */
  llmParams?: Partial<InferenceParameters>;
  /**
   * Icon component (e.g., from react-icons) to display for the action.
   */
  icon: IconType;
  /**
   * Whether the action should be highlighted
   */
  highlight?: boolean;
};

/**
 * Context for generating a prompt
 */
export type PromptContext = {
  /**
   * Selected text
   */
  selection: string;

  /**
   * URL of the page
   */
  pageUrl: string;

  /**
   * Page title (if available)
   */
  pageTitle?: string;

  /**
   * Page category
   */
  pageCategory: PageCategory;
};
