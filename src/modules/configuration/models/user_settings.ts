import { AVAILABLE_MODELS } from "$/modules/inference/repositories/get_available_models";

/**
 * User theme preference enum
 */
export enum ThemePreference {
  LIGHT = "light",
  DARK = "dark",
  SYSTEM = "system", // Follow system preference
}

/**
 * Code highlight theme enum
 */
export enum CodeHighlightTheme {
  ATOM_ONE_DARK = "atom-one-dark",
  ATOM_ONE_LIGHT = "atom-one-light",
  MONOKAI = "monokai",
  DRACULA = "dracula",
  GITHUB = "github",
  GITHUB_DARK = "github-dark",
}

/**
 * Extension settings type
 */
export type ExtensionSettings = {
  /**
   * Whether the extension is enabled
   */
  isEnabled: boolean;

  /**
   * Currently selected WebLLM model ID
   */
  selectedModelId: string;

  /**
   * Theme preference (light/dark/system)
   */
  themePreference: ThemePreference;

  /**
   * Code highlight theme for syntax highlighting
   */
  codeHighlightTheme: CodeHighlightTheme;

  /**
   * Whether to show all available actions or only contextual ones
   */
  showAllActions: boolean;
};

/**
 * Default extension settings
 */
export const DEFAULT_SETTINGS: ExtensionSettings = {
  isEnabled: true,
  // Default to a smaller model for better compatibility
  selectedModelId: AVAILABLE_MODELS["Llama 3.2"][0].name,
  themePreference: ThemePreference.SYSTEM,
  codeHighlightTheme: CodeHighlightTheme.GITHUB,
  showAllActions: false,
};
