# project guidelines are current

## Prompt

- prompts/project_guidelines_sync.md

## Scope check

- Verified command contracts against `package.json` scripts.
- Verified repository structure against AGENTS architecture map (`dotfiles/`, `src/`, `scripts/`).
- Verified CLI syntax/command surface from `src/cli/index.ts` and `src/cli/core.ts`.
- Verified dotfiles count and file inventory.
- Verified no new unsafe CLI or shell-related drift (`src/lib/shell.ts`).

## Evidence

- `package.json` scripts match AGENTS command list.
- `dotfiles/` contains 13 `.sh` files across the documented categories.
- `src/cli/core.ts` includes usage matching README examples.

## Outcome

- No guideline files required changes.
- No code changes were made to AGENTS, CLAUDE.md, or prompt instructions.

## Why no code changes

- Changes requested by Project Guidelines Sync were not actionable for this run.
