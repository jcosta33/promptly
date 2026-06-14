import { AVAILABLE_MODELS } from "$/modules/inference/repositories/available_models_data";

/**
 * User theme preference constant object
 */
export const ThemePreference = {
  LIGHT: "light",
  DARK: "dark",
  SYSTEM: "system", // Follow system preference
} as const;

export type ThemePreference =
  (typeof ThemePreference)[keyof typeof ThemePreference];

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

export type CodeHighlightTheme =
  (typeof CodeHighlightTheme)[keyof typeof CodeHighlightTheme];

export type PersistentMemory = {
  id: string;
  fact: string;
};

export type CustomAction = {
  id: string;
  name: string;
  prompt: string;
};

export type Persona = {
  id: string;
  name: string;
  instructions: string;
};

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

  /**
   * Custom global instructions merged into the LLM system prompt
   */
  customInstructions: string;

  /**
   * ID of currently active persona
   */
  activePersonaId?: string;

  /**
   * User-defined custom actions for the context menu
   */
  customActions: CustomAction[];

  /**
   * Atomic facts the LLM should always remember
   */
  persistentMemories: PersistentMemory[];
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
  customInstructions: "",
  customActions: [],
  persistentMemories: [],
};