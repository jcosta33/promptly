# Promptly Chrome Extension: Architecture Document

## 1. Guiding Principles

The architecture of the Promptly Chrome Extension is guided by the following core software design principles:

* **Domain-Driven Design (DDD):** The application is structured around distinct business domains (`src/modules/`), each encapsulating a specific area of functionality. This promotes modularity, maintainability, and a clear understanding of the system's components.
* **SOLID:**
  * **Single Responsibility Principle:** Each module, class, and function should have one primary responsibility, clearly defined by its layer within the domain structure.
  * **Open/Closed Principle:** Software entities (modules, components) should be open for extension (e.g., adding new actions, supporting new context types) but closed for modification (avoiding changes to core module contracts).
  * **Liskov Substitution Principle:** Relevant primarily for potential class hierarchies (though composition is preferred). Subtypes must be substitutable for their base types.
  * **Interface Segregation Principle:** Clients (other modules, UI layers) should only depend on the necessary parts of a module's contract (`models`, `events`, `use_cases`). Internal implementation details should not be exposed unnecessarily.
  * **Dependency Inversion Principle:** High-level modules (e.g., `content` script orchestration) should not depend directly on low-level implementation details (e.g., specific Chrome APIs). Both should depend on abstractions (e.g., the `messaging` module's event bus, repository interfaces implicitly defined by use cases). Abstractions should not depend on details; details should depend on abstractions.
* **DRY (Don't Repeat Yourself):** Avoid duplication of code and logic. Utilize abstractions, helper functions (`helpers/` within domains), and reusable components (`src/components/`). Extract logic only when a clear, correct abstraction emerges (Avoid Premature Abstraction).
* **KISS (Keep It Simple, Stupid):** Favor straightforward solutions and avoid unnecessary complexity, especially given the constraint of minimal dependencies.
* **Clean Code & Professionalism:** Write code that is readable, maintainable, and adheres strictly to the defined coding conventions (`promptly_conventions_mdc`). Prioritize clarity.

## 2. High-Level Architecture: Domain Modules

The application is divided into distinct domain modules located under `src/modules/`. A shared UI component library resides in `src/components/`.

src/├── components/      # Shared, custom UI component library (Built in-house, see PRD Section 5.2)└── modules/├── inference/     # Handles LLM loading, execution via WebLLM, response processing.├── selection/     # Manages text selection detection, cleaning, chunking (truncation in MVP).├── actions/       # Defines available AI actions, prompts, LLM configurations, filtering logic.├── context/       # Analyzes webpage URL to determine page context category.├── messaging/     # Abstracted event bus wrapping Chrome communication APIs.├── configuration/ # Manages user settings (model, theme) & conversation history persistence via chrome.storage.├── popup/         # Handles the UI and logic for the extension's configuration popup.└── content/       # (Implicit Domain) Orchestrates the floating overlay UI and interaction flow within web pages. Integrates selection, context, actions, messaging, and inference results. Resides primarily within content script(s).

* **Note on `content` Domain:** While not having a dedicated module folder, the logic within the content script(s) acts as the `content` domain. It orchestrates the user-facing experience on the page, consuming services from other domains via the event bus and use cases where appropriate.

## 3. Domain Module Structure

Each explicit domain module (e.g., `inference`, `selection`, `actions`, `context`, `messaging`, `configuration`, `popup`) MUST follow this standardized internal structure:

DomainModule/├── events/         # (Optional) Defines event types emitted by this domain (Part of Contract).├── models/         # Defines domain-specific data structures and types (Part of Contract).├── repositories/   # Handles Input/Output operations (Chrome APIs, WebLLM, storage). INTERNAL.├── transformers/   # Contains pure functions for data transformation. INTERNAL.├── helpers/        # Utility functions containing pure, reusable business logic specific to the domain. INTERNAL.├── use_cases/      # Orchestrates domain logic; primary interaction points (Part of Contract).└── presentations/  # (Optional) Contains UI-related code (Components, Hooks, Views) specific to this domain (e.g., popup). INTERNAL (except potentially Views).

* **Part of Contract:** Elements marked (`events/`, `models/`, `use_cases/`, potentially `presentations/views/`) define the public interface. Other modules or presentation layers (like the `content` script or `popup`) CAN import and interact ONLY with these elements. They MUST be well-documented (JSDoc).
* **Internal Implementation:** All other folders are internal details and MUST NOT be imported directly from outside the domain module.

## 4. Layer Responsibilities

### 4.1. Models (`models/`) [Contract]

* Defines domain-specific data structures (`type` aliases). Examples: `InferenceRequest`, `SelectionData`, `ActionDefinition`, `ExtensionSettings`, `ChatLog`.
* MUST contain no business logic. Framework-agnostic TypeScript definitions.

### 4.2. Repositories (`repositories/`) [Internal]

* Encapsulates ALL interactions with external systems or browser APIs (WebLLM engine interaction, DOM events, `chrome.storage`, `chrome.runtime` messaging APIs).
* Implementations MUST be specific (e.g., `inference_repository.ts`, `settings_repository.ts`, `chrome_message_repository.ts`).
* MAY perform simple inline data transformations (key renaming). MUST use `transformers/` for complex mapping.
* Functions SHOULD return domain models defined in `models/`. Raw response types MUST remain internal.

### 4.3. Transformers (`transformers/`) [Internal]

* Contains ONLY pure functions for converting data between formats (e.g., raw selection -> `SelectionData`, LLM request prep, Markdown parsing).
* Focuses solely on transformation, no side effects or IO.

### 4.4. Helpers (`helpers/`) [Internal]

* Contains ONLY pure, reusable utility functions implementing domain-specific business logic algorithms or auxiliary tasks (e.g., `text_chunker.ts`, `detect_selection_types.ts`, `prompt_builder.ts`, `message_bus.ts` core logic).
* Focuses on calculation, detection, validation, etc., NOT primarily data format changes.

### 4.5. Use Cases (`use_cases/`) [Contract]

* Orchestrates the core business logic flows of the domain. Primary entry point for external interaction.
* Invokes repositories, transformers, and helpers within the same domain.
* MUST be framework-agnostic (no React/UI code).
* Examples: `run_inference.ts`, `analyze_selection.ts`, `get_available_actions.ts`, `determine_page_context.ts`, `send_message.ts`, `update_settings.ts`, `save_chat_log.ts`.

### 4.6. Presentations (`presentations/`) [Internal, except Views potentially]

* Contains React-specific UI code (primarily for `popup`, potentially complex elements in `content`).
* Internal Structure:
  * `components/`: Reusable React components specific to this domain's UI. Uses shared `src/components`.
  * `hooks/`: Custom React hooks for view logic (e.g., `use_popup_settings.ts`). Uses `useSyncExternalStore` for event bus subscription.
  * `views/`: Composes components/hooks into complete UI views (e.g., `PopupView.tsx`). MAY be part of the contract if intended for direct use by routing/pages.
  * `helpers/`: UI-specific pure utility functions (e.g., formatting for display).
* Styling: MUST use CSS Modules and `data-*` attributes as per conventions.

## 5. Communication and State Management

### 5.1. Event Bus (`messaging` module)F

* **Centralized Communication:** ALL inter-module and cross-context (content script, background, popup) communication MUST occur via the abstracted event bus provided by the `messaging` module.
* **Abstraction (Dependency Inversion):** The bus logic (`message_bus.ts` helper) MUST use repository implementations (`chrome_message_repository.ts`, `chrome_connection_repository.ts`) that wrap Chrome APIs (`chrome.runtime.connect`, `chrome.runtime.sendMessage`). No direct Chrome API calls outside these repositories.
* **Transport:** Use `chrome.runtime.connect` for streaming (LLM progress/tokens); use `chrome.runtime.sendMessage` for request/response or fire-and-forget.
* **Events:** Domains define event types in `events/` (Contract). Events are published/subscribed to via the event bus helper.

### 5.2. State Management

* **Minimalism:** MUST NOT use external global state management libraries (Redux, Zustand, etc.).
* **Local UI State:** MUST prefer local component state (`useState`, `useReducer`) within presentation layers.
* **Persistent Domain State:** Configuration (`ExtensionSettings`) and Conversation History (`ChatLog[]`) MUST be managed within the `configuration` domain and persisted via its repository using `chrome.storage.local`.
* **Cross-Domain Synchronization:** State changes requiring cross-domain awareness (e.g., settings updated) MUST be communicated via events on the event bus.
* **React UI Synchronization (`useSyncExternalStore`):** Presentation layer hooks (`hooks/`) MUST use `useSyncExternalStore` to subscribe to relevant events from the message bus (via the `messaging` module) and get snapshots of required state (e.g., current settings fetched via the `configuration` use case/repository). This ensures UI reactivity to state changes originating elsewhere. The snapshot logic needs careful implementation, potentially involving a small cache updated by event listeners.

## 6. Coding Conventions

* **MUST** strictly adhere to all rules defined in the `promptly_conventions_mdc` file. This includes:
  * Naming conventions (`snake_case` for domain logic, `camelCase` for presentation).
  * Import rules (`$/` alias, ordering).
  * Type usage (`type` over `interface`, `as const` over `enum`).
  * Styling (CSS Modules, `data-*` attributes, no external frameworks).
  * Code style (curly braces, no unclear shortcuts).
  * File structure adherence.

## 7. Dependencies

* **MUST** strictly limit external dependencies to those listed in the PRD (Section 6.1): `react`, `react-dom`, `typescript`, `@mlc-ai/web-llm`, `react-markdown`, `react-highlight`, `highlight.js`. (`useSyncExternalStore` is part of React).
* **MUST NOT** introduce other external libraries (UI, state, CSS, utility). All components and core logic must be built in-house.
