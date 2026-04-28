---
id: project-guidelines-sync
title: Project Guidelines Sync Prompt
category: documentation
enabled: true
autonomousSafe: true
---
# Project Guidelines Sync Prompt

## Objective

Keep `AGENTS.md`, `CLAUDE.md`, and the prompt set aligned with the actual repository workflow, safety rules, commands, and architecture.

## Workflow

### 1. Audit for Drift

Review:

- `package.json` scripts and dependencies.
- Current `src/`, `scripts/`, `dotfiles/`, and `prompts/` structure.
- Recent implementation patterns in `src/lib/`, API routes, and client components.
- Existing shell safety guarantees in `AGENTS.md`.

### 2. Update Only With Evidence

Make a small update if:

- A command changed.
- A major directory, route, or workflow changed.
- A repeated implementation pattern has become a convention.
- Existing guidance contradicts code.
- A prompt mentions tools or commands this repo does not have.

Do not add aspirational rules.

### 3. Scope Guardrail

Change only:

- `AGENTS.md`
- `CLAUDE.md`
- Files under `prompts/`
- An `issues_to_look/` note created by this run

If both guideline files and prompts are current, no-op with "project guidelines are current".

### 4. Verify

Run:

```bash
git diff --check
```

Run `pnpm lint` if the guideline change documents code conventions that you also changed.

### 5. Commit

Commit with a message like: `docs(guidelines): sync agent prompts with validation workflow`.

## Issue Management

If an issue from `issues_to_look/` is resolved or found to be resolved, move it to `issues_to_look/resolved/`.
