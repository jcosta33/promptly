import { AVAILABLE_MODELS } from "$/modules/inference/repositories/get_available_models";

/**
 * User theme preference constant object
 */
export const ThemePreference = {
  LIGHT: "light",
  DARK: "dark",
  SYSTEM: "system", // Follow system preference
} as const;

export type ThemePreference = typeof ThemePreference[keyof typeof ThemePreference];

/**
 * Code highlight theme constant object
 */
export const CodeHighlightTheme = {
  ATOM_ONE_DARK: "atom-one-dark",
  ATOM_ONE_LIGHT: "atom-one-light",
  MONOKAI: "monokai",
  DRACULA: "dracula",
  GITHUB: "github",
  GITHUB_DARK: "github-dark",
} as const;

export type CodeHighlightTheme = typeof CodeHighlightTheme[keyof typeof CodeHighlightTheme];

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
