# AGENTS.md - Promptly code repo

## Suspec

- Suspec workspace: `../promptly-works/` - read the task packet you are given before coding.
- Specs, tasks, reviews, findings, and decisions live in the workspace, not this code repo.
- Link implementation work back to the workspace task and review packets.

## Project Facts

- Promptly is a local-first Chrome Extension (Manifest V3) built with WXT.
- Stack: React 19, TypeScript strict mode, WebLLM (`@mlc-ai/web-llm`),
  React Query, React Markdown, React Highlight, Highlight.js, React Icons,
  CSS Modules, Vitest, Storybook, ESLint, and Prettier.
- Domain modules live under `src/modules/`; shared UI components live under
  `src/components/`.
- Cross-context messaging belongs in the `messaging` module wrappers around
  Chrome runtime messaging APIs.
- Persistent settings and conversation data go through `chrome.storage.local`
  repositories in the `configuration` domain.
- Use CSS Modules and `data-*` attributes for component state and variants.
- Import alias: `$/` maps to `src/`.

## Commands

| Slot         | Command                        | Purpose                     |
| ------------ | ------------------------------ | --------------------------- |
| cmdTest      | `pnpm exec vitest run`         | run the test suite          |
| cmdLint      | `pnpm lint`                    | static checks               |
| cmdBuild     | `pnpm build`                   | production build            |
| cmdTypecheck | `pnpm compile`                 | type checks                 |
| cmdFormat    | `pnpm exec prettier --check .` | formatting check            |
| cmdValidate  | `pnpm lint && pnpm compile`    | aggregate static validation |
