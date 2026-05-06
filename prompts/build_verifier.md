---
id: build-verifier
title: Build Verifier Prompt
category: verification
enabled: true
autonomousSafe: true
---
# Build Verifier Prompt

## Objective

Ensure Dotfiles Manager validates, builds, and tests cleanly with zero errors. Fix only issues that prevent `pnpm validate`, `pnpm lint`, `pnpm build`, or `pnpm test` from passing.

## Workflow

### 1. Run Checks

Run:

```bash
pnpm validate
pnpm lint
pnpm test
pnpm build
```

If all pass, no-op.

### 2. Triage Failures

- `pnpm validate`: malformed dotfile meta blocks, unsupported categories, invalid variable declarations.
- `pnpm lint`: unused imports, React hook issues, invalid Next.js patterns, weak client/server boundaries.
- `pnpm test`: logic regressions in shared libraries, shell detection errors, or parser failures.
- `pnpm build`: TypeScript errors, App Router failures, server/client import mistakes, validation failures.

### 3. Fix Narrowly

- Fix only what is required to make the failing check pass.
- Do not refactor unrelated code.
- If the fix would touch more than 3 files or changes shell config behavior in a non-obvious way, log it to `issues_to_look/` and stop.

### 4. Verify

Re-run the failed command. If server code, shared schemas, or dotfile validation changed, run `pnpm build`.

### 5. Commit

Commit with a message like: `fix(build): resolve dotfile validation failure`.

## Issue Management

If an issue from `issues_to_look/` is resolved or found to be resolved, move it to `issues_to_look/resolved/`.
