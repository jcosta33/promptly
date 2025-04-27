# Promptly Chrome Extension

**Version:** (Reflects current package version)
**Status:** (e.g., MVP Development, Beta)

## 1. Overview

Promptly is a free, local-first Chrome extension for intelligent writing assistance. It leverages a local Large Language Model (LLM) via WebLLM to provide on-the-fly suggestions and transformations for selected text, entirely within the user's browser. This ensures maximum user privacy (no data leaves the browser), zero cost, and offline availability.

## 2. Key Features (MVP)

* **Local-First AI:** All LLM processing happens directly in the browser via WebLLM. No server calls, no API keys needed.
* **Contextual Actions:** Provides relevant AI actions based on selected text content (word, sentence, paragraph, code) and the context of the current webpage (e.g., dev docs, social media, email).
* **Floating Overlay UI:** An unobtrusive chat-like interface appears on text selection, showing available actions and AI responses.
* **Markdown Rendering:** AI responses are formatted in Markdown with syntax highlighting for code.
* **Configuration Popup:** Allows users to select LLM models, toggle the extension, and switch themes.
* **Privacy Focused:** User text selection and data never leave the browser.
* **Customizable:** Theme selection (Dark Mode) and model choice.
* **Unique Visual Identity:** Features a retro-modern neo-brutalist design aesthetic.

## 3. Architecture

Promptly follows a robust architecture based on these principles:

* **Domain-Driven Design (DDD):** Logic is organized into distinct domain modules (`src/modules/`) like `inference`, `selection`, `actions`, `configuration`, etc., each with clear responsibilities. See `arch.md` for details.
* **SOLID Principles:** Adherence to Single Responsibility, Open/Closed, Liskov Substitution, Interface Segregation, and Dependency Inversion principles.
* **Clean Code & Conventions:** Strict adherence to coding conventions defined in `promptly_conventions_mdc` (TypeScript strict mode, specific naming conventions, etc.).
* **Minimal Dependencies:** Relies only on essential libraries (React, TypeScript, WebLLM, Markdown/Highlighting libs). No external UI libraries or state managers.
* **Event Bus:** Uses an abstracted event bus (`messaging` module) built on Chrome APIs for all cross-component communication (content script, background, popup).
* **Local State & Storage:** Prefers local React state; uses `chrome.storage.local` for persisting settings and conversation history.

See the [Architecture Document (arch.md)](./arch.md) for a detailed breakdown.

## 4. Getting Started (WXT Project)

### Prerequisites

* [Node.js](https://nodejs.org/) (LTS version recommended)
* [pnpm](https://pnpm.io/) (or npm/yarn, though commands below use pnpm)
* Google Chrome or a Chromium-based browser that supports WebGPU (for optimal model performance).

### Installation

1. Clone the repository:

    ```bash
    git clone <repository-url>
    cd promptly-chrome-extension
    ```

2. Install dependencies:

    ```bash
    pnpm install
    ```

### Development

1. Start the WXT development server:

    ```bash
    pnpm dev
    ```

    This command will:
    * Build the extension for development.
    * Watch for file changes and automatically reload the extension.
    * Output a `promptly-chrome-extension-dev-<browser>` directory (e.g., `promptly-chrome-extension-dev-chrome`).

2. Load the extension in Chrome:
    * Open Chrome and navigate to `chrome://extensions/`.
    * Enable "Developer mode" (usually a toggle in the top-right corner).
    * Click "Load unpacked".
    * Select the generated development directory (e.g., `.output/chrome-mv3` or the specific dev directory mentioned by WXT, check WXT output).

3. Develop: Make changes to the code. WXT will automatically rebuild and reload the extension in your browser.

### Building for Production

1. Build the extension:

    ```bash
    pnpm build
    ```

    This command will:
    * Create an optimized production build.
    * Generate a `.zip` file in the `.output` directory, ready for distribution or uploading to the Chrome Web Store.

## 5. Dependencies

This project strictly limits external dependencies to:

* `react`
* `react-dom`
* `typescript`
* `@mlc-ai/web-llm`
* `react-markdown`
* `react-highlight`
* `highlight.js`
* `wxt` (Development Dependency)

No other external UI libraries, state managers, or CSS frameworks are permitted.

## 6. Coding Conventions

All code MUST adhere to the standards defined in the [Coding Conventions Document (promptly_conventions_mdc)](./promptly_conventions_mdc). ESLint and Prettier are configured to help enforce these rules.
