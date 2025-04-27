Promptly Chrome Extension: Product Requirements Document
Version: 2.0
Date: April 12, 2025
Status: Draft

1. Introduction
   1.1. Product Vision
   Promptly is a free, local-first Chrome extension for intelligent writing assistance – an open alternative to services like Grammarly or Merlin. It leverages a local Large Language Model (LLM) via WebLLM to provide on-the-fly suggestions and transformations for selected text, entirely in the user's browser with no server calls or API keys required. This ensures user privacy (no data leaves the browser) and offline availability while providing context-aware actions for text selections.
   1.2. Goals

Provide immediate, contextually relevant AI actions on text selection
Operate entirely locally within the browser using WebLLM for maximum privacy and zero cost
Offer a seamless and intuitive user experience with a unique visual identity
Adapt behavior based on both selection type (word, sentence, paragraph) and website domain
Present AI responses in rich, well-formatted Markdown
Minimize dependencies and adhere to robust architectural principles for maintainability
Establish a foundation for future features like conversation history browsing

1.3. Scope (MVP)
This document defines the requirements for the Minimum Viable Product (MVP) of the Promptly Chrome Extension. Key features include:
In Scope:

Text selection trigger and floating overlay UI
Contextual action generation based on selection content and page URL
Local LLM inference via WebLLM integrated into the background script
Configuration popup for model selection, extension toggling, and theme switching
Smart text processing pipeline (cleaning, chunking)
Response formatting in Markdown with rich rendering
Basic conversation state persistence in chrome.storage.local
Implementation of a retro-modern neo-brutalist design aesthetic

Out of Scope for MVP:

Chrome sidebar UI for browsing conversation history
Advanced chat features beyond single-turn action/response and basic follow-up
Support for browsers other than Chrome
Function calling capabilities
Embedding models or multimodal models (e.g., Vision)

2. Functional Requirements: Core Interaction & AI Features
   2.1. Text Selection Trigger
   2.1.1. Activation: When the user selects text on any webpage, a small, unobtrusive button shall appear near the selection.
   2.1.2. Button Appearance: The button should be styled according to the defined visual identity (Section 4) and positioned consistently relative to the selection (e.g., top-right corner).
   2.1.3. Deactivation: The button shall disappear if the user deselects the text or clicks elsewhere on the page.
   2.2. Floating Overlay UI (Chat Interface)
   2.2.1. Invocation: The overlay will appear when the user clicks the text selection trigger button, positioned near the selected text by default.
   2.2.2. Core Structure: The overlay functions as a compact chat interface:

It displays a preview of the user's selection (shown as a message bubble from the user)
It lists available contextual actions based on the selection and page domain
It provides an area to prominently display the AI's response
It includes an input field for follow-up questions related to the current selection

2.2.3. Positioning:

The overlay will appear near the selected text if space allows
If the selection is near the edge of the viewport, the overlay will reposition to remain fully visible
The panel should include a small arrow or indicator pointing toward the text it relates to

2.2.4. Chat-Like Presentation:

Initial user input (the selected text) is displayed as a message bubble
The AI's response appears as a bubble from the assistant side
The user's original selection can be collapsed or de-emphasized to prioritize the AI response
Follow-up messages display in sequence as additional bubbles, creating a conversation thread

2.2.5. Minimal Chrome and Controls:

A simple close button (×) to dismiss the overlay
Minimal additional controls to keep the interface clean and unobtrusive
An "Ask a follow-up" placeholder or small prompt icon for continuing the interaction

2.2.6. Interaction Flow:

User selects an action from the list
The overlay displays a loading indicator while the LLM processes the request
The AI response is displayed prominently and streamed token-by-token
The user can type follow-up messages to continue the conversation in context

2.2.7. Collapsing and Resizing:

The overlay can be moved by the user (drag-and-drop) if it covers important content
The overlay should be dismissible via the close button or by clicking outside it

2.3. Contextual Action Generation
2.3.1. Selection Analysis:
The extension intelligently analyzes the selected text to determine its characteristics:

Input: Raw selected text obtained via window.getSelection()
Analysis: Determine characteristics like:

Length (word count, character count)
Structure (single word, sentence, paragraph, code snippet)
Content type (plain text, code, list, etc.)

Output: A set of tags describing the selection type (e.g., word, sentence, code)

Selection categories:

Single Word or Short Phrase: Treats this as a query for definitions, synonyms, or explanations
One or More Sentences: Focuses on writing improvements and transformations (grammar, rephrasing, tone changes)
Paragraph or Longer Passage: Offers higher-level analyses (summarizing, outlining, critique)

2.3.2. Page Context Analysis:
The extension determines the category of website the user is visiting:

Input: The URL of the current tab
Analysis: Match the URL against a categorized list of website types
Output: A context tag (e.g., page:devdocs, page:news, page:social)

Domain categories:

Social Media: More casual or humorous tone, suggest replies, engagement options
Academic/Scientific: Formal and information-dense assistance, summarize findings, define terms
Coding/Technical: Code explanation, improvement suggestions, error analysis
Email/Office: Professional writing assistance, formal tone adjustments
General Web: Neutral behavior, summaries, fact-checking attempts

2.3.3. Action Filtering and Display:
Action Definitions: Each potential action includes:

name: User-facing action name
description: Brief explanation
contexts: Array of selection and page context tags where this action is relevant
systemPrompt: Specific system prompt template for the LLM
llmConfig: Optimal LLM parameters for this action

Filtering Logic: The system performs Selection Analysis and Page Context Analysis, then filters the action list to show contextually relevant options.
Contextual vs. All Actions Toggle: Allow users to switch between viewing only contextually relevant actions and the full list of all available actions.
2.3.4. Table: Example Contextual Actions
Selection TypePage ContextAction NameBrief DescriptionselectionpageDefine WordProvides dictionary definition(s)selectionpageFind SynonymsLists words with similar meaningsselectionpageCheck GrammarIdentifies and suggests correctionsselectionpageRephrase SentenceOffers alternative phrasingsselectionpageSummarizeProvides a concise summaryselectionpageChange Tone (Formal)Rewrites in a more formal styleselectionpageExplain CodeExplains what the code snippet doesselectionpageDebug CodeSuggests improvements or fixesselectionpageRoastGenerates a humorous critiqueselectionpageGenerate ReplySuggests possible repliesselectionpageSimplify TextRewrites using simpler language
2.3.5. Table: Website Context Categories
Category NameDescriptionExample URL Patterns/DomainspageNews outlets, online newspapersnytimes.com, bbc.com/newspageBlog posts, magazine articlesmedium.com, \*.blogspot.compageSoftware documentation, APIsreact.dev, developer.mozilla.orgpageScientific journals, papersarxiv.org, nature.compageSocial media platformstwitter.com, facebook.compageDiscussion forums, Q&A sitesstackoverflow.com, quora.compageOnline stores, marketplacesamazon.com, ebay.compageEncyclopedias, wikiswikipedia.org, britannica.compageDefault for unclassified sites(catch-all)
2.4. Smart Text Processing Pipeline
2.4.1. Selection Cleaning:

Obtain and clean the selected text, preserving essential structure
Remove undesirable artifacts (image alt text, excessive whitespace)
Normalize whitespace while preserving paragraph breaks

2.4.2. Text Chunking:

Determine word count of the cleaned text
If the count exceeds a threshold (e.g., 1000 words), initiate chunking
Split preferably at paragraph boundaries, then sentence boundaries if needed
Process each chunk sequentially for actions like summarization

2.4.3. Error Handling:

Handle empty selections or invalid text appropriately
Display user-friendly error messages for selections that are too large or improperly formatted

Sample Chunking Implementation:
typescript// text_chunker.ts – cleans and chunks selected text
const MAX_WORDS = 1000;

interface SelectionData {
cleanedText: string;
type: 'word' | 'sentence' | 'paragraph';
}

// Process raw selection string: trim, cleanup, detect type, chunk if needed
function processSelection(raw: string): SelectionData | null {
const text = raw.trim();
if (!text) return null; // empty or only whitespace, ignore

// Remove common irrelevant patterns (example: "Show more" from social media)
const irrelevantPatterns = [/^\s*Show more\s*$/i, /^\s*Reply\s*$/i];
let cleaned = text;
for (const pat of irrelevantPatterns) {
cleaned = cleaned.replace(pat, '');
}
cleaned = cleaned.trim();
if (!cleaned) return null;

// Determine selection type by simple heuristics
let type: SelectionData['type'];
// Count sentence terminators as heuristic
const sentenceCount = (cleaned.match(/[.!?]\s/g) || []).length;
if (sentenceCount === 0 && cleaned.split(/\s+/).length <= 3) {
type = 'word';
} else if (sentenceCount <= 1 && cleaned.length < 200) {
type = 'sentence';
} else {
type = 'paragraph';
}

// Chunk the text if it's too long
const words = cleaned.split(/\s+/);
if (words.length > MAX_WORDS) {
const chunk = words.slice(0, MAX_WORDS).join(' ');
cleaned = chunk + '…'; // indicate truncation with ellipsis
// In a more advanced case, we could break into multiple chunks here
}

return { cleanedText: cleaned, type };
}
2.5. LLM Integration (WebLLM)
2.5.1. Engine Initialization:

Use CreateMLCEngine from @mlc-ai/web-llm to initialize the LLM engine in the background script
Load model on-demand when the user first triggers an action or explicitly loads it via the popup
Display progress updates during model loading

2.5.2. Inference Execution:

Run inference using engine.chat.completions.create with appropriate parameters
Stream tokens back to the content script to update the UI in real-time
Handle conversation context for follow-up questions

2.5.3. Communication Protocol (Event Bus):

All communication between components uses an abstracted event bus over Chrome messaging APIs
Events include model loading progress, inference tokens, settings updates, etc.

2.5.4. Per-Action LLM Configuration:

Configure optimal parameters for each action type:

temperature: Higher for creative tasks, lower for factual tasks
top_p: Controls response diversity
presence/frequency penalty: Discourages repetition

2.5.5. Output Formatting & Rendering:

Generate all AI responses in Markdown format
Render Markdown using react-markdown with custom components
Provide syntax highlighting for code blocks via react-highlight
Support multiple code highlight themes that users can select

Example WebLLM Integration:
typescriptimport { CreateMLCEngine, MLCEngine } from "@mlc-ai/web-llm";
import { LLMConfig, Message, ModelLoadingProgress } from "../models/ModelTypes";

type InitEngineArgs = {
modelName: string;
progressCallback: (progress: ModelLoadingProgress) => void;
};

export function initEngine({
modelName,
progressCallback,
}: InitEngineArgs): Promise<MLCEngine> {
return CreateMLCEngine(modelName, {
initProgressCallback: (progress) => {
progressCallback({
text: progress.text,
status: `Loading ${modelName}...`,
progress: progress.progress
});
},
});
}

export async function generateText({
engine,
messages,
config,
stream = true,
onToken,
onComplete,
}: GenerateTextArgs): Promise<string> {
try {
let completeText = "";
let usage = undefined;

    const chatMessages = messages.map((msg) => ({
      role: msg.role,
      content: msg.content,
    }));

    const chunks = await engine.chat.completions.create({
      messages: chatMessages,
      temperature: config.temperature,
      top_p: config.top_p,
      presence_penalty: config.presence_penalty,
      frequency_penalty: config.frequency_penalty,
      stream: stream,
      stream_options: { include_usage: true },
    });

    for await (const chunk of chunks) {
      if (chunk.usage) {
        usage = chunk.usage;
      }
      const token = chunk.choices?.delta?.content || "";
      if (token) {
        completeText += token;
        if (stream && onToken) {
          onToken(token);
        }
      }
    }

    if (onComplete) {
      onComplete(completeText, usage);
    }

    return completeText;

} catch (error) {
console.error("Error generating text:", error);
throw error;
}
}
2.6. Response Types and Presentation Variations
Different types of AI responses have tailored presentations:
2.6.1. Definitions & Explanations:

Format with the term being defined in bold
Use a dictionary-like style for definitions
List multiple meanings as separate points

2.6.2. Rewrites & Paraphrases:

Present the rewritten suggestion prominently
Potentially de-emphasize the original text
List multiple alternatives if provided

2.6.3. Code Generation & Explanation:

Render code in scrollable, syntax-highlighted blocks
Preserve explanation order alongside code
Use monospace font where appropriate

2.6.4. Humorous Responses:

Include subtle visual cues for humorous content
Include emoji/icon prefix to indicate tone

2.6.5. Fact-Checking / Analysis:

Emphasize clarity in true/false statements
Display any caveats clearly
Show sources as plain text or italics

2.6.6. Summaries & Highlights:

Display with bullet points if structured as a list
Keep summaries concise for readability

2.7. Conversation History
2.7.1. Data Persistence:

Save each interaction sequence as a "conversation"
Store in chrome.storage.local for future access

2.7.2. Data Structure:
typescriptinterface ChatLog {
id: string;
timestamp: number;
pageTitle: string;
pageUrl: string;
domainCategory: string;
messages: Array<{ role: 'user'|'assistant', content: string }>;
}
2.7.3. Storage Mechanism:

Use chrome.storage.local via a dedicated repository
Save conversations when a session completes or user closes the overlay

2.7.4. MVP Limitation:

No UI to browse saved conversations in the MVP
Data stored to enable future sidebar feature

3. Functional Requirements: Extension Popup & Settings
   3.1. Extension Popup Interface

Accessed by clicking the Promptly icon in the Chrome toolbar
Provides primary interface for extension configuration
Follows the defined visual identity (Section 4)

3.2. Model Selection UI
3.2.1. Model Identification:

Models identified by Provider, Name, and Variant/Quantization

3.2.2. Selection Controls:

Dropdown/Select components for model provider, name, and variant
Model list sourced from WebLLM's configurations

3.2.3. System Resource Awareness:

Detect available RAM and GPU/WebGPU capabilities
Filter model list based on system requirements
Highlight recommended model for user's system

3.2.4. Model Management Controls:

Display currently loaded model
Provide "Load Model" and "Unload Model" buttons
Allow users to free up resources when needed

3.2.5. Model Candidates (Illustrative Subset):
Model IDBase ModelParamsQuantizationEst. Min RAMContextNotesLlama-3-8B-Instruct-q4f16_1Llama 38Bq4f16_18GB+8kRequires WebGPUPhi-3-mini-4k-Instruct-q4f16_1Phi 33.8Bq4f16_14GB+4kGood balanceGemma-2b-it-q4f16_1Gemma2.5Bq4f16_14GB+8kEfficient optionQwen2-1.5B-Instruct-q4f16_1Qwen 21.5Bq4f16_14GB+32kVery efficient
3.3. Extension Enable/Disable Toggle

Master switch to enable/disable the extension globally
Toggles the content script functionality on/off
State persisted in chrome.storage.local

3.4. Theme Selection

Toggle switch for Dark Mode
Additional theme options based on the visual identity
Theme applies to both Popup and Floating Overlay
Settings stored in chrome.storage.local

4. Non-Functional Requirements: UI/UX & Styling
   4.1. Visual Identity
   Aesthetic: A fusion of neo-brutalism and skeuomorphic retro designs:

Neo-Brutalism: Raw structures, bold typography, minimal ornamentation, high contrast
90s/Early 2000s Nostalgia: Windows 95/98 UI elements, early web aesthetics
Skeuomorphism: Subtle real-world object mimicry in UI elements
Overall Feeling: "Under Construction," raw, honest, functional, retro-tech

4.2. Color Palette

Primary Color: "Construction Site Orange" (#FFA500 or similar vibrant orange)
Secondary Colors:

Grays (for backgrounds, containers)
Yellows (for highlights, warnings)
Blues/Greens (for accents, links)
Black/White/Off-White (for text and base backgrounds)

Dark Mode: Corresponding dark palette maintaining the same feel

4.3. Typography

Large headings potentially bold or uppercase
Regular body text (14-16px) for readability
Code font in monospace (Consolas or Courier New)
Possible decorative font for headings that fits the retro theme

4.4. Implementation Details

CSS Modules for component-specific styles
CSS Variables for theming and consistency
HTML5 semantic elements
Interactive feedback for buttons and clickable elements

5. Technical Architecture and Components
   5.1. Technology Stack

Language: TypeScript (strict mode)
UI Framework: React
Build Tool: Standard toolchain configured for Chrome extension (Manifest V3)

5.2. Component Library
Custom Implementation: All UI components built in-house in the src/components directory
Core UI Components:

Accordion
Badge
Button
Card
CodeBlock (with syntax highlighting)
Dropdown
FloatingOverlay
Input
Markdown
ProgressIndicator
Select
Tabs
Toast
Toggle
Tooltip

5.3. Extension Architecture
5.3.1. Content Script (Page Interaction Layer):

Injected into web pages
Detects text selections and user triggers
Displays the overlay UI
Communicates with background script via event bus

5.3.2. Background Script (Worker & AI Engine Layer):

Central coordinator for the extension
Hosts the WebLLM model engine
Performs inference and manages global state
Handles persistent data storage
Maintains model across multiple pages/tabs

5.3.3. Popup Script (Configuration UI):

Interface for settings and configuration
Allows users to select models and preferences
Writes preferences to chrome.storage

5.4. Event-Driven Messaging
5.4.1. Event Bus Implementation:

Lightweight wrapper over Chrome messaging APIs
Provides pub-sub style communication
Connects content, background, and popup scripts

5.4.2. Connection Management:

Manages port connections between components
Handles port lifecycle and disconnection
Routes messages to appropriate handlers

Example Event Bus Implementation:
typescript// chrome_connection_repository.ts
type ConnectionHandlers = {
onMessage: (message: any, port: chrome.runtime.Port) => void;
onDisconnect: (port: chrome.runtime.Port) => void;
};

type SetupConnectionListenerArgs = {
connectionName: string;
handlers: ConnectionHandlers;
};

// Store active connections
const activeConnections = new Map<string, Map<number | string, chrome.runtime.Port>>();

export function setup_connection_listener({
connectionName,
handlers,
}: SetupConnectionListenerArgs): void {
chrome.runtime.onConnect.addListener((port) => {
if (!port.name.startsWith(connectionName)) {
return;
}

    console.log(`Connection established: ${port.name}`);

    // Determine identifier (tabId or 'popup')
    const identifier = port.sender?.tab?.id ?? (port.sender?.url?.includes('popup.html') ? 'popup' : 'unknown');

    if (!activeConnections.has(connectionName)) {
        activeConnections.set(connectionName, new Map());
    }
    const nameConnections = activeConnections.get(connectionName)!;
    nameConnections.set(identifier, port);

    // Attach message listener
    port.onMessage.addListener((message) => {
      handlers.onMessage(message, port);
    });

    // Attach disconnect listener for cleanup
    port.onDisconnect.addListener((disconnectedPort) => {
      // Cleanup logic...
    });

});
}
5.5. Storage Architecture
5.5.1. User Settings:

Store configuration in chrome.storage.local
Abstract storage access via repository pattern

5.5.2. Conversation History:

Save chat logs to chrome.storage.local
Implement cleanup strategy for storage limits

Example Settings Repository:
typescript// settings_repository.ts
import { ExtensionSettings, DEFAULT_SETTINGS } from "../models/user_settings";

const SETTINGS_KEY = "promptly_settings";

export function save_settings({ settings }: { settings: ExtensionSettings }): Promise<void> {
return chrome.storage.local.set({ [SETTINGS_KEY]: settings });
}

export async function load_settings(): Promise<ExtensionSettings> {
const data = await chrome.storage.local.get(SETTINGS_KEY);

if (data[SETTINGS_KEY]) {
return data[SETTINGS_KEY] as ExtensionSettings;
}

return DEFAULT_SETTINGS;
}
5.6. Coding Conventions
5.6.1. Domain/Business Logic:

File Names: snake_case.ts
Variables: snake_case
Function/Method Names: snake_case
Class/Type/Interface Names: PascalCase

5.6.2. Presentation Logic:

File Names: PascalCase.tsx, PascalCase.module.css
Component Names: PascalCase
Variables/Props/State: camelCase

5.7. Architectural Principles

Domain-Driven Design (DDD)
SOLID Principles
DRY (Don't Repeat Yourself)
KISS (Keep It Simple, Stupid)

6. Development Constraints and Standards
   6.1. Dependencies
   Minimize External Code:

Allowed: react, react-dom, typescript, @mlc-ai/web-llm, react-markdown, react-highlight
Explicitly Forbidden: Redux/state libraries, CSS-in-JS libraries, Tailwind CSS, UI component libraries

6.2. Error Handling and Edge Cases

Handle model loading failures
Gracefully manage empty or invalid selections
Address WebGPU compatibility issues

6.3. Performance Considerations

Offload heavy inference to the background script
Stream responses for responsive UI
Manage model loading/unloading for resource efficiency

6.4. Security

Run the model locally to prevent data exfiltration
Sanitize markdown output to prevent injection
Validate input/output
