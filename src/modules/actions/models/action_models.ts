import type { PageCategory } from "$/modules/context/models/context";
import type { InferenceParameters } from "$/modules/inference/models/inference_model";
import type { SelectionType } from "$/modules/selection/models/selection";

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
   * Whether this action primarily targets text being authored by the user (in inputs/textareas).
   * If true, it will generally only be shown when the selection is within such an element.
   * If false or undefined, it will generally only be shown for selections on static page content.
   */
   authoringAction?: boolean;
  /**
   * Applicable selection types for this action
   */
  selectionTypes: SelectionType[];
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
   * Emoji to use as the icon for this action
   */
  emoji: string;
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
   * Type of selection
   */
  selectionType: SelectionType;

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
