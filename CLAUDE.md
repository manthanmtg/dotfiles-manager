# CLAUDE instructions for dotfiles-manager

Always follow:
- `AGENTS.md` as the primary project policy document.
- No network, no remote synchronization, no Windows support, local filesystem only.
- `pnpm` for all scripts (`dev`, `build`, `start`, `lint`, `validate`, `cli`, `test`).
- Any `src/` behavioral changes must preserve shell config safety rules in `src/lib/shell.ts`.
- macOS/Linux only; API routes must continue to enforce platform support via `assertSupported()`.

Guidance selection is run via `prompts/random_selector.md` each time.
