# Changelog

All notable changes to the **Promptly** Chrome Extension will be documented in this file.

## [1.0.0] - 2026-06-15

### Major Milestones
Promptly graduates from a prototype to a full-fledged, offline-first AI operating system for the browser. This release culminates 7 waves of architectural enhancements, migrating inference entirely to the edge via WebGPU and WebAssembly.

### Added
- **Local WebGPU Inference Engine:** Integrated `@mlc-ai/web-llm` for 100% private, on-device AI generation.
- **Bleeding-Edge Model Registry:** Added support for state-of-the-art quantized local models including Llama 3.2 11B Vision, Phi-3.5 Vision, Qwen 2.5, and DeepSeek R1.
- **Offscreen Document Architecture:** Migrated heavy WebGPU and Vector DB workloads to a persistent Chrome Offscreen Document, bypassing Manifest V3 service worker timeouts.
- **Local RAG & Vector Database:** Integrated `@xenova/transformers` and IndexedDB to provide a multi-turn Workspace Knowledge Base with seamless text chunking and semantic search.
- **DOM-Aware Semantic Extraction:** Replaced raw text scraping with `@mozilla/readability` for pristine, ad-free page context extraction.
- **"Save to Brain" Web Clipper:** Added a 1-click action to instantly ingest web pages into the local vector database.
- **WASM Code Sandbox:** Embedded a Pyodide-powered WebAssembly environment allowing the agent to securely execute generated Python and JavaScript directly in the browser.
- **Multimodal & Image Generation:** Implemented a canvas-based image downscaler for local LLM vision analysis, and an OpenAI-compatible bridge to local Stable Diffusion/ComfyUI instances.
- **Audio Intelligence (STT/TTS):** Added Web Speech API integration for text-to-speech output and WebGPU Whisper transcription for local voice input.
- **Multi-Chat Session Management:** Introduced persistent, non-destructive chat threads that archive gracefully.
- **Performance & Quota Dashboard:** Built a developer telemetry view to track IndexedDB and CacheStorage consumption.
- **Generic API Provider Bridge:** Allowed users to override WebGPU and plug in external OpenAI-compatible endpoints (Groq, LMStudio, etc.).

### Fixed
- **WebGPU Role Alternation Crash:** Implemented a robust dynamic context pruner that semantically compresses long histories while strictly adhering to WebLLM's alternating role requirements.
- **IPC Worker Deadlocks:** Resolved silent UI hangs by implementing a preflight `WAKE_UP_OFFSCREEN` handshake before dispatching heavy background tasks.
- **React Strict Mode Memory Leaks:** Audited and refactored the UI overlay, resolving missing dependencies and unmemoized callback chains in `PromptOverlay` and `useDraggable`.
- **RAG Empty Chunk Bug:** Fixed a vector generation failure caused by whitespace-only strings bypassing the chunking tokenizer.

### Security
- **Strict Content Security Policy (CSP):** Hardened the Manifest V3 CSP, routing all dynamic blobs and base64 downloads through the background script to bypass host-page restrictions.

---
*Built autonomously by the Swarm.*
