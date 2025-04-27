# Promptly Chrome Extension: Product Requirements Document

**Version:** 2.1
**Date:** April 27, 2025
**Status:** Draft

## 1. Introduction

### 1.1. Product Vision

Promptly is a free, local-first Chrome extension for intelligent writing assistance – an open alternative to services like Grammarly or Merlin. It leverages a local Large Language Model (LLM) via WebLLM to provide on-the-fly suggestions and transformations for selected text, entirely in the user's browser with no server calls or API keys required. This ensures user privacy (no data leaves the browser) and offline availability while providing context-aware actions for text selections.

### 1.2. Goals

* Provide immediate, contextually relevant AI actions on text selection.
* Operate entirely locally within the browser using WebLLM for maximum privacy and zero cost.
* Offer a seamless and intuitive user experience with a unique visual identity.
* Adapt behavior based on both selection type and website domain context.
* Present AI responses in rich, well-formatted Markdown.
* Minimize dependencies and adhere to robust architectural principles (DDD, SOLID, KISS, DRY) for maintainability.
* Establish a foundation for future features like conversation history browsing.

### 1.3. Scope (MVP)

This document defines the requirements for the Minimum Viable Product (MVP) of the Promptly Chrome Extension.

**In Scope:**

* Text selection trigger and floating overlay UI.
* Contextual action generation based on selection content and page URL.
* Local LLM inference via WebLLM integrated into the background script.
* Configuration popup for model selection, extension toggling, and theme switching.
* Smart text processing pipeline (cleaning, chunking).
* Response formatting in Markdown with rich rendering (syntax highlighting).
* Basic conversation state persistence in `chrome.storage.local`.
* Implementation of a retro-modern neo-brutalist design aesthetic.
* Event bus for cross-component communication (`messaging` module).

**Out of Scope for MVP:**

* Chrome sidebar UI for browsing conversation history.
* Advanced chat features beyond single-turn action/response and basic follow-up.
* Support for browsers other than Chrome.
* Function calling capabilities for the LLM.
* Embedding models or multimodal models (e.g., Vision).
* Advanced text chunking strategies (MVP handles basic truncation).

## 2. Functional Requirements: Core Interaction & AI Features

### 2.1. Text Selection Trigger

* **2.1.1. Activation:** When the user selects text on any webpage, a small, unobtrusive button MUST appear near the selection.
* **2.1.2. Button Appearance:** The button MUST be styled according to the defined visual identity (Section 4) and positioned consistently relative to the selection (e.g., top-right corner).
* **2.1.3. Deactivation:** The button MUST disappear if the user deselects the text or clicks elsewhere on the page.

### 2.2. Floating Overlay UI (Chat Interface)

* **2.2.1. Invocation:** The overlay MUST appear when the user clicks the text selection trigger button, positioned near the selected text by default.
* **2.2.2. Core Structure:** The overlay functions as a compact chat interface:
  * Displays a preview of the user's selection (user message bubble).
  * Lists available contextual actions.
  * Provides an area to prominently display the AI's response.
  * Includes an input field for follow-up questions related to the current selection.
* **2.2.3. Positioning:**
  * The overlay MUST appear near the selected text if space allows.
  * If the selection is near the edge of the viewport, the overlay MUST reposition to remain fully visible.
  * The panel SHOULD include a small arrow or indicator pointing toward the text it relates to.
* **2.2.4. Chat-Like Presentation:**
  * Initial user input (selected text) displayed as a message bubble.
  * AI's response appears as a message bubble.
  * Original selection MAY be collapsed or de-emphasized to prioritize the AI response.
  * Follow-up messages display sequentially.
* **2.2.5. Minimal Chrome and Controls:**
  * MUST include a simple close button (×).
  * MAY include an "Ask a follow-up" placeholder or icon.
  * Controls MUST be minimal and unobtrusive.
* **2.2.6. Interaction Flow:**
  * User selects an action.
  * Overlay MUST display a loading indicator during LLM processing.
  * AI response MUST be displayed prominently and streamed token-by-token.F
  * User can type follow-up messages.
* **2.2.7. User Control:**
  * Overlay MUST be movable via drag-and-drop.
  * Overlay MUST be dismissible via the close button or by clicking outside it.

### 2.3. Contextual Action Generation (`actions` module)

* **2.3.1. Selection Analysis (`selection` module):**
  * Input: Raw selected text (`window.getSelection()`).
  * Analysis: Determine characteristics (length, structure, content type).
  * Output: Set of selection type tags (e.g., `selection:word`, `selection:sentence`, `selection:paragraph`, `selection:code`).
  * Categories:
    * `selection:word`: Single Word or Short Phrase (Definitions, Synonyms).
    * `selection:sentence`: One or More Sentences (Grammar, Rephrasing, Tone).
    * `selection:paragraph`: Paragraph or Longer (Summarizing, Outlining, Critique).
* **2.3.2. Page Context Analysis (`context` module):**
  * Input: Current tab URL.
  * Analysis: Match URL against a categorized list (see Table 2.3.5).
  * Output: Page context tag (e.g., `page:devdocs`, `page:news`, `page:social`, `page:default`).
* **2.3.3. Action Filtering and Display:**
  * Action Definitions: Each action MUST have `name`, `description`, `contexts` (array of selection/page tags), `systemPrompt` template, `llmConfig`.
  * Filtering Logic: System MUST filter actions based on current selection tags and page context tag.
  * Contextual Toggle: MUST allow users to switch between viewing only contextually relevant actions and the full list.
* **2.3.4. Table: Example Contextual Actions**

    | Selection Context | Page Context | Action Name           | Brief Description                      |
    |-------------------|--------------|-----------------------|----------------------------------------|
    | `selection:word`  | `page:*`     | Define Word           | Provides dictionary definition(s)      |
    | `selection:word`  | `page:*`     | Find Synonyms         | Lists words with similar meanings      |
    | `selection:sentence`| `page:*`     | Check Grammar         | Identifies and suggests corrections    |
    | `selection:sentence`| `page:*`     | Rephrase Sentence     | Offers alternative phrasings           |
    | `selection:paragraph`|`page:*`     | Summarize             | Provides a concise summary             |
    | `selection:sentence`|`page:email` | Change Tone (Formal)  | Rewrites in a more formal style        |
    | `selection:code`  | `page:devdocs`| Explain Code          | Explains what the code snippet does    |
    | `selection:code`  | `page:devdocs`| Debug Code            | Suggests improvements or fixes         |
    | `selection:*`     | `page:social`| Roast                 | Generates a humorous critique          |
    | `selection:*`     | `page:social`| Generate Reply        | Suggests possible replies              |
    | `selection:paragraph`|`page:*`     | Simplify Text         | Rewrites using simpler language        |

* **2.3.5. Table: Website Context Categories (`context` module)**

    | Category Tag     | Description                      | Example URL Patterns/Domains             |
    |------------------|----------------------------------|------------------------------------------|
    | `page:news`      | News outlets, online newspapers  | nytimes.com, bbc.com/news                |
    | `page:blog`      | Blog posts, magazine articles    | medium.com, *.blogspot.com               |
    | `page:devdocs`   | Software documentation, APIs     | react.dev, developer.mozilla.org         |
    | `page:academic`  | Scientific journals, papers      | arxiv.org, nature.com                    |
    | `page:social`    | Social media platforms           | twitter.com, facebook.com, linkedin.com  |
    | `page:forum`     | Discussion forums, Q&A sites     | stackoverflow.com, quora.com, reddit.com |
    | `page:ecommerce` | Online stores, marketplaces      | amazon.com, ebay.com                     |
    | `page:wiki`      | Encyclopedias, wikis             | wikipedia.org, britannica.com            |
    | `page:email`     | Webmail interfaces               | mail.google.com, outlook.live.com        |
    | `page:office`    | Online office suites             | docs.google.com, office.com              |
    | `page:default`   | Default for unclassified sites   | (catch-all)                              |

### 2.4. Smart Text Processing Pipeline (`selection` module)

* **2.4.1. Selection Cleaning:**
  * MUST obtain and clean selected text via `selection` module helpers.
  * MUST remove common irrelevant patterns (e.g., "Show more", "Reply").
  * MUST normalize whitespace while preserving paragraph breaks.
* **2.4.2. Text Chunking (MVP: Truncation):**
  * Determine word count of cleaned text.
  * If count exceeds `MAX_WORDS` threshold (e.g., 1000 words), truncate the text and append an ellipsis (`…`).
  * Future versions may implement sequential chunk processing.
* **2.4.3. Error Handling:**
  * MUST handle empty or invalid selections gracefully (e.g., do not show trigger button).
  * MAY display user-friendly messages for selections deemed too large after cleaning/truncation.

### 2.5. LLM Integration (WebLLM) (`inference` module)

* **2.5.1. Engine Initialization (Background Script):**
  * MUST use `CreateMLCEngine` from `@mlc-ai/web-llm`.
  * MUST load model on-demand (first action trigger or explicit load via popup).
  * MUST display progress updates during model loading via the event bus.
* **2.5.2. Inference Execution:**
  * MUST run inference using `engine.chat.completions.create`.
  * MUST stream tokens back via the event bus for real-time UI updates.
  * MUST handle conversation context for follow-up messages within a single overlay session.
* **2.5.3. Communication Protocol:**
  * All communication (progress, tokens, errors) MUST use the `messaging` module's event bus.
* **2.5.4. Per-Action LLM Configuration (`actions` module):**
  * Each action definition MUST include optimal LLM parameters (`temperature`, `top_p`, `presence_penalty`, `frequency_penalty`).
* **2.5.5. Output Formatting & Rendering:**
  * AI responses MUST be generated in Markdown format.
  * UI MUST render Markdown using `react-markdown` with custom components from `src/components`.
  * UI MUST provide syntax highlighting for code blocks using `react-highlight` and `highlight.js`.
  * MUST support selectable code highlight themes (linked to main theme selection).

### 2.6. Response Presentation Variations

* UI MUST adapt presentation based on the nature of the AI response (definitions, rewrites, code, summaries, etc.) using appropriate formatting and custom Markdown components.

### 2.7. Conversation History (`configuration` module - Persistence)

* **2.7.1. Data Persistence:**
  * MUST save interaction sequences (user selection -> action -> response -> follow-ups) as conversation logs.
  * MUST store logs in `chrome.storage.local` via the `configuration` module's repository.
* **2.7.2. Data Structure:**

    ```typescript
    interface ChatLog {
      id: string; // Unique ID for the log
      timestamp: number; // Unix timestamp (ms)
      pageTitle: string; // Title of the page where selection occurred
      pageUrl: string; // URL of the page
      domainCategory: string; // e.g., 'page:devdocs'
      messages: Array<{ role: 'user' | 'assistant', content: string }>; // Sequence of messages
    }
    ```

* **2.7.3. Storage Mechanism:**
  * Use `chrome.storage.local` abstracted by `settings_repository.ts` (or a dedicated `history_repository.ts`).
  * Save conversation log when an interaction session completes (e.g., overlay closed).
* **2.7.4. MVP Limitation:** No UI to browse saved conversations in MVP. Storage enables future features.

## 3. Functional Requirements: Extension Popup & Settings (`popup` module, `configuration` module)

### 3.1. Extension Popup Interface

* Accessed via the Promptly toolbar icon.
* Provides primary interface for configuration.
* MUST follow the defined visual identity (Section 4).

### 3.2. Model Selection UI

* **3.2.1. Model Identification:** Identify models by Provider, Name, Variant/Quantization (e.g., Llama-3-8B-Instruct-q4f16_1).
* **3.2.2. Selection Controls:** Use custom `Select` components for model selection. List sourced from WebLLM config.
* **3.2.3. System Resource Awareness:**
  * Attempt to detect available RAM/WebGPU capabilities (best effort).
  * Filter/recommend models based on detected resources.
* **3.2.4. Model Management Controls:**
  * Display currently loaded model status.
  * Provide "Load Model" / "Unload Model" buttons.
* **3.2.5. Model Candidates:** See `arch.md` for illustrative list.

### 3.3. Extension Enable/Disable Toggle

* MUST provide a master `Toggle` switch to enable/disable the extension globally.
* State MUST be persisted in `chrome.storage.local`.

### 3.4. Theme Selection

* MUST provide controls (e.g., `Toggle`, `Select`) for theme selection (Dark Mode, potentially others).
* Theme MUST apply to both Popup and Floating Overlay.
* Theme choice MUST be persisted in `chrome.storage.local`.

## 4. Non-Functional Requirements: UI/UX & Styling

### 4.1. Visual Identity

* **Aesthetic:** Fusion of neo-brutalism and skeuomorphic retro (90s/early 2000s) design. Raw, functional, bold, high-contrast, "under construction" feel with subtle real-world mimicry.
* **Implementation:** MUST be achieved using custom components and CSS Modules.

### 4.2. Color Palette

* Primary: "Construction Site Orange" (`#FFA500` or similar, defined via CSS variable).
* Secondary: Grays, Yellows, Blues/Greens (defined via CSS variables).
* Base: Black/White/Off-White.
* Dark Mode: Corresponding dark palette MUST be available and maintain the core aesthetic.

### 4.3. Typography

* Headings: Bold, potentially uppercase, possibly a specific retro-themed decorative font (defined via CSS variables/classes).
* Body Text: Readable sans-serif, 14-16px.
* Code Font: Monospace (e.g., Consolas, Courier New, defined via CSS variable).

### 4.4. Implementation Details

* **MUST** use CSS Modules for all component styling.
* **MUST** use CSS Variables extensively for theming (colors, fonts, spacing).
* **MUST** use HTML5 semantic elements.
* **MUST** provide clear interactive feedback (hover, active states) for controls.
* **MUST** use `data-*` attributes for styling state/variants (See Conventions).

## 5. Technical Architecture and Components

### 5.1. Technology Stack

* Language: TypeScript (strict mode).
* UI Framework: React.
* Build Tool: Standard Chrome Extension toolchain (Manifest V3).
* LLM Engine: `@mlc-ai/web-llm`.
* Markdown Rendering: `react-markdown`.
* Syntax Highlighting: `react-highlight`, `highlight.js`.
* State Synchronization: `useSyncExternalStore`.

### 5.2. Component Library (`src/components`)

* **MUST** use the custom, in-house component library.
* Core components MUST include: Accordion, Badge, Button, Card, CodeBlock, Dropdown, FloatingOverlay, Input, Markdown, ProgressIndicator, Select, Tabs, Toast, Toggle, Tooltip.

### 5.3. Extension Architecture (`arch.md` Summary)

* **Content Script:** Page interaction layer (selection detection, overlay display, communication via event bus).
* **Background Script:** Central coordinator (hosts WebLLM engine, handles inference, manages global state/storage, event bus hub).
* **Popup Script:** Configuration UI (settings, model management).
* **Domain Modules (`src/modules/`):** Encapsulated logic (inference, selection, actions, context, messaging, configuration, popup). Follows defined internal structure (models, repositories, use_cases, etc.).

### 5.4. Event-Driven Messaging (`messaging` module)

* **MUST** use the abstracted event bus for ALL cross-component/context communication.
* Bus implementation MUST wrap Chrome APIs (`connect`, `sendMessage`) via repositories.
* Use `connect` for streaming (progress, tokens), `sendMessage` for request/response.

### 5.5. Storage Architecture (`configuration` module)

* **MUST** use `chrome.storage.local` abstracted via repositories.
* Store user settings and conversation history.

### 5.6. Coding Conventions

* **MUST** strictly adhere to the rules defined in `promptly_conventions_mdc`. This includes naming conventions (snake_case for domain logic, camelCase for presentation), import rules (`$/` alias), type usage (`type` over `interface`), styling (CSS Modules, `data-*` attributes), etc.

### 5.7. Architectural Principles

* **MUST** adhere to Domain-Driven Design (DDD), SOLID, DRY, and KISS principles as implemented through the defined architecture and coding conventions.

## 6. Development Constraints and Standards

### 6.1. Dependencies

* **MUST NOT** add external dependencies beyond the explicitly allowed list: `react`, `react-dom`, `typescript`, `@mlc-ai/web-llm`, `react-markdown`, `react-highlight`, `highlight.js`. (`useSyncExternalStore` is part of React).
* **MUST NOT** use external state management libraries, CSS frameworks (Tailwind), or UI component libraries.

### 6.2. Error Handling and Edge Cases

* MUST handle model loading failures gracefully.
* MUST manage empty/invalid selections.
* MUST address potential WebGPU compatibility issues (provide feedback).

### 6.3. Performance Considerations

* MUST offload heavy inference to the background script.
* MUST stream responses for responsive UI.
* MUST manage model loading/unloading efficiently via user controls in the popup.

### 6.4. Security

* Leverage local model execution for privacy.
* MUST sanitize Markdown output to prevent XSS (configure `react-markdown` appropriately).
* Validate inputs/outputs where necessary.

F
