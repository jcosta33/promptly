Promptly Chrome Extension: Architecture Document (arch.md)
Version: 1.1
Date: July 27, 2024

1. Guiding Principles
   The architecture of the Promptly Chrome Extension is guided by the following core software design principles:

Domain-Driven Design (DDD): The application is structured around distinct business domains, each encapsulating a specific area of functionality. This promotes modularity, maintainability, and a clear understanding of the system's components.
SOLID:
Single Responsibility Principle: Each module, class, and function should have one primary responsibility.
Open/Closed Principle: Software entities should be open for extension but closed for modification.
Liskov Substitution Principle: Subtypes must be substitutable for their base types.
Interface Segregation Principle: Clients should not be forced to depend on interfaces they do not use.
Dependency Inversion Principle: High-level modules should not depend on low-level modules; both should depend on abstractions. Abstractions should not depend on details; details should depend on abstractions.
DRY (Don't Repeat Yourself): Avoid duplication of code and logic by utilizing abstractions, helper functions, and reusable components.
KISS (Keep It Simple, Stupid): Favor straightforward solutions and avoid unnecessary complexity.
Clean Code & Professionalism: Write code that is readable, maintainable, and adheres to professional standards. Avoid language shortcuts that obscure intent (e.g., omitting curly braces). Prioritize clarity over brevity where appropriate.

2. High-Level Architecture: Domain Modules
   The application is divided into the following domain modules located under src/modules/. This structure promotes separation of concerns and allows independent development and testing of different functional areas.

src/
├── components/ # Shared, custom UI component library (See PRD Section 5.2)
└── modules/
├── inference/ # Handles LLM loading, execution, and response processing via WebLLM.
├── selection/ # Manages text selection detection, cleaning, and chunking.
├── actions/ # Defines available AI actions, their prompts, and LLM configurations.
├── context/ # Analyzes webpage URL to determine page context category.
├── messaging/ # Abstracted event bus wrapping Chrome communication APIs.
├── configuration/ # Manages user settings (model choice, theme, etc.) via chrome.storage.
├── popup/ # Handles the UI and logic for the extension's configuration popup.
└── content/ # (Implicit Domain) Orchestrates the floating overlay UI and interaction flow within web pages. Connects selection, context, actions, and inference.

- **Note:** The `content` domain might not have a dedicated folder structure like the others but represents the logic within the content script(s) that integrates functionality from other modules to present the floating overlay.

## 3. Domain Module Structure

Each explicit domain module (`inference`, `selection`, `actions`, `context`, `messaging`, `configuration`, `popup`) follows a standardized internal structure:

DomainModule/
├── events/ # (Optional) Defines event types emitted by this domain (Part of Contract).
├── models/ # Defines domain-specific data structures and types (Part of Contract).
├── repositories/ # Handles Input/Output operations (e.g., Chrome API calls, WebLLM interaction, storage).
├── transformers/ # Contains pure functions for data transformation (e.g., DTOs <-> Domain Models).
├── helpers/ # Utility functions containing pure, reusable business logic specific to the domain.
├── use_cases/ # Orchestrates domain logic, interacting with repositories, helpers, and transformers (Part of Contract).
└── presentations/ # (Optional) Contains UI-related code (Components, Hooks, Views) specific to this domain.

- **Part of Contract:** These elements (`events`, `models`, `use_cases`) define the public interface of the domain module. Other modules or presentation layers can import and interact with these elements. They must be well-documented (JSDoc).

## 4. Layer Responsibilities

### 4.1. Models (`models/`)

- Defines domain-specific data structures, types, and interfaces (e.g., `InferenceRequest`, `SelectionData`, `ActionDefinition`, `UserSettings`).
- Contains no business logic.
- Framework-agnostic TypeScript definitions.

### 4.2. Repositories (`repositories/`)

- Encapsulates all interactions with external systems or browser APIs.
- Examples:
  - `inference_repository.ts`: Wraps WebLLM `CreateMLCEngine`, `generateText`, `unloadEngine`.
  - `selection_repository.ts`: Listens to DOM selection events (`window.getSelection`).
  - `context_repository.ts`: Matches URLs against the categorized website list.
  - `settings_repository.ts`: Wraps `chrome.storage.local` for saving/loading settings.
  - `chrome_message_repository.ts` / `chrome_connection_repository.ts`: Wraps `chrome.runtime.sendMessage`, `chrome.runtime.connect`, etc. (Used by the `messaging` module's event bus).

### 4.3. Transformers (`transformers/`)

- Contains pure functions responsible for converting data between different formats or structures.
- Primarily used for adapting data for different layers or external systems (e.g., preparing data for an LLM request, parsing a response, converting a raw data structure into a domain model).
- Should focus solely on the transformation task.
- Examples:
  - Mapping raw selection data to a structured `SelectionData` model.
  - Formatting LLM requests based on action definitions and user input.
  - Parsing LLM Markdown responses.
  - Formatting text for specific output (e.g., `format_long_text_for_llm`).

### 4.4. Helpers (`helpers/`)

- Contains pure, reusable utility functions implementing specific business logic algorithms or auxiliary tasks within the domain.
- Should not be primarily about data format transformation (that's for `transformers`).
- Focuses on calculation, detection, validation, or other self-contained logic units.
- Should return all relevant computed/detected information without imposing arbitrary priorities (e.g., `detect_selection_types` should return all detected types).
- Examples:
  - `text_chunker.ts` (in `selection`): Implements the logic for splitting large text selections (Note: `format_long_text_for_llm` is a transformer as it _formats_ for LLM).
  - `detect_selection_types.ts` (in `selection`): Analyzes selection and returns identified types.
  - `prompt_builder.ts` (in `actions`): Constructs the final LLM prompt based on templates and context.
  - `message_bus.ts` (in `messaging`): Implements the core event bus logic on top of repository abstractions.

### 4.5. Use Cases (`use_cases/`)

- Orchestrates the core business logic of the domain.
- Acts as the primary entry point for interacting with the domain's functionality from outside (e.g., from presentation layers or other domains via events).
- Invokes methods on repositories, transformers, and helpers.
- Framework-agnostic. Should not contain UI-specific code.
- Examples:
  - `run_inference.ts` (in `inference`): Takes a request, interacts with the `inference_repository`, handles streaming, returns the result.
  - `analyze_selection.ts` (in `selection`): Takes raw selection, uses helpers/transformers to clean/chunk/detect types, returns analyzed data.
  - `get_available_actions.ts` (in `actions`): Takes selection/page context, filters actions from the `actions_repository`.
  - `determine_page_context.ts` (in `context`): Takes a URL, uses `context_repository` to return the category.
  - `send_message.ts` / `listen_to_messages.ts` (in `messaging`): Expose event bus functionality.
  - `update_settings.ts` / `get_settings.ts` (in `configuration`): Interact with `settings_repository`.

### 4.6. Presentations (`presentations/`)

- Contains React-specific code for the domain's UI, if applicable (primarily used in `popup` and potentially for complex UI elements managed by `content`).
- Follows its own internal structure:
  - `components/`: Reusable React components specific to this domain's presentation needs. Uses shared components from `src/components`.
  - `hooks/`: Custom React hooks for managing view-specific state and logic (e.g., `use_popup_settings.ts`). May use `useSyncExternalStore` to subscribe to the event bus.
  - `views/`: Composes components and hooks into complete UI views (e.g., `PopupView.tsx`).
  - `helpers/`: UI-specific utility functions (e.g., formatting data for display).
- Styling: Prefer using `data-*` attributes for styling variations based on component state or props, rather than dynamically concatenating class names in component logic. CSS modules should define styles targeting these attributes (e.g., `.button[data-variant="primary"]`).

## 5. Communication and State Management

### 5.1. Event Bus (`messaging` module)

- **Centralized Communication:** All inter-module and cross-context (content script, background, popup) communication occurs via the abstracted event bus provided by the `messaging` module.
- **Abstraction:** The bus (`message_bus.ts`) uses repository implementations (`chrome_message_repository.ts`, `chrome_connection_repository.ts`) that wrap the underlying Chrome APIs (`chrome.runtime.connect`, `chrome.runtime.sendMessage`, etc.). This isolates the rest of the application from direct Chrome API dependencies.
- **Transport:** Uses `chrome.runtime.connect` for persistent connections needed for streaming (model loading progress, inference tokens) and `chrome.runtime.sendMessage` for request/response or fire-and-forget messages.
- **Events:** Domains define event types (`events/`) which are published via the bus. Subscribing domains import these event types and register listeners.

### 5.2. State Management

- **Minimalism:** Avoid complex global state management libraries (Redux, Zustand, etc.).
- **Local State:** Prefer local component state (`useState`, `useReducer`) within presentation layers (`views`, `hooks`).
- **Domain State:** Configuration and potentially conversation history are managed within their respective domains (`configuration`, implicitly `content`/`inference` for active conversation) and persisted via repositories (`chrome.storage.local`).
- **Cross-Domain Synchronization:** Use the event bus for cross-domain state updates. A change in one domain (e.g., settings updated in `configuration`) emits an event, which other interested domains (e.g., `content`, `popup`) listen for.
- **React Integration (`useSyncExternalStore`):** Leverage the `useSyncExternalStore` hook within presentation layers (`hooks/`) to reactively subscribe to relevant events from the message bus.
  - The `subscribe` function passed to `useSyncExternalStore` will register a listener with the event bus and return an unsubscribe function.
  - The `getSnapshot` function will retrieve the latest relevant state (e.g., current settings from the `configuration` module's use case or repository).
  - This pattern keeps UI components synchronized with underlying state changes triggered by events, without direct store dependencies.

```typescript
// Example Hook using useSyncExternalStore (conceptual)
// In popup/presentations/hooks/use_current_settings.ts

import { useSyncExternalStore } from 'react';
import { eventBus } from '../../messaging/helpers/message_bus'; // Assuming eventBus instance export
import { SettingsUpdateEvent } from '../../configuration/events/settings_event'; // Import specific event type
import { get_settings } from '../../configuration/use_cases/get_settings'; // Use case to get current settings
import { ExtensionSettings } from '../../configuration/models/user_settings';

export const use_current_settings = (): ExtensionSettings | null => {
  // get_settings might need to be adapted to be synchronous or cache last known value
  // For simplicity, assume get_settings can provide a synchronous snapshot or initial value
  const subscribe = (callback: () => void) => {
    const unsubscribe = eventBus.on(SettingsUpdateEvent, callback); // Subscribe to specific event
    // Potentially trigger an initial fetch if needed, or rely on initial load
    return unsubscribe;
  };

  // This function needs to synchronously return the current state.
  // It might involve a cached value updated by the event listener,
  // or an initial synchronous fetch if possible (less ideal).
  // Let's assume get_settings can return the last known settings synchronously.
  const get_snapshot = () => {
     // This is simplified. In reality, you'd likely need a small store/cache
     // within the configuration module updated by the event bus listener,
     // and this function would read from that cache.
     // Or, the event listener itself updates a local variable in this hook's scope.
     // For this example, we'll pretend get_settings is synchronous for simplicity.
     // A more robust approach involves a dedicated state holder updated via events.
     return get_settings_synchronous_snapshot(); // Placeholder for actual snapshot logic
  };

  // Server snapshot might be needed for SSR, less relevant for extension popup
  const get_server_snapshot = () => {
    return DEFAULT_SETTINGS; // Or null/undefined
  };

  const settings = useSyncExternalStore(subscribe, get_snapshot, get_server_snapshot);

  return settings;
};

// Placeholder - real implementation needs careful state handling
let cachedSettings: ExtensionSettings | null = null;
eventBus.on(SettingsUpdateEvent, (event) => {
    cachedSettings = event.payload; // Update cache on event
});
// Initial load
get_settings().then(initialSettings => { cachedSettings = initialSettings; });

const get_settings_synchronous_snapshot = () => {
    return cachedSettings?? DEFAULT_SETTINGS;
}

6. Coding Conventions
Strict adherence to coding conventions is required for consistency and maintainability.

Imports:
- **Direct React Imports:** Always import specific types, hooks, and functions directly from 'react' (e.g., `import { useState, FC } from 'react';`) instead of using namespace qualifiers (e.g., `React.useState`, `React.FC`).
- **Path Aliases:** Always use the `$/` path alias (pointing to `/src`) for absolute imports from within the `src` directory (e.g., `import { Box } from '$/components/Box/Box';` instead of `import { Box } from '../../components/Box/Box';`). Relative imports (`./` or `../`) are only acceptable for files within the *same* module directory.
- **Ordering:** Follow the import order defined in `eslint.config.js` (`builtin`, `external`, `internal` (`$/`), `parent`, `sibling`, `index`, `type`). Use ESLint/Prettier tooling to enforce this.

Domain/Business Logic (src/modules/* excluding presentations):
File Names: snake_case.ts (e.g., run_inference.ts, actions_repository.ts).
Variables: snake_case.
Function/Method Names: snake_case (e.g., get_available_actions(), clean_selection_text()).
Class Names: PascalCase (standard TypeScript).
Type/Interface Names: PascalCase (standard TypeScript).
Presentation Logic (src/components/*, src/modules/*/presentations/*):
File Names: PascalCase.tsx, PascalCase.module.css, camelCase.ts (for hooks/helpers).
Component Names: PascalCase (React standard).
Variables/Props/State/Functions: camelCase (React/JavaScript standard).
Code Style:
- Consistently use curly braces `{}` for all control flow statements (`if`, `else`, `for`, `while`, etc.), even single-line blocks.
- Avoid language shortcuts or overly terse code that sacrifices readability.
Comments:
- Comment only non-trivial logic, complex algorithms, or rationale that isn't immediately obvious from the code itself.
- **Do not** add comments that merely restate what the code clearly does (e.g., avoid `// Handle action selection` for a function named `handleActionSelect`). Assume the reader understands the language and common patterns.
Tooling: ESLint and Prettier should be configured to enforce these conventions automatically.
7. Dependencies
Minimize external dependencies. Only use the libraries explicitly listed in the PRD (React, TypeScript, WebLLM, react-markdown, react-highlight, highlight.js, potentially useSyncExternalStore). No external UI libraries, state managers, or CSS frameworks. Build all components in-house.
```
