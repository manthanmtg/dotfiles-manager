---
id: documentation-ghostwriter-prompt
title: Documentation Ghostwriter Prompt
category: documentation
enabled: true
autonomousSafe: true
---
# Documentation Ghostwriter Prompt

## Objective

Keep project documentation aligned with the actual Dotfiles Manager implementation. Update one document per run.

## Workflow

### 1. Pick a Document

Choose one:

- `README.md`
- `AGENTS.md`
- `CLAUDE.md`
- Relevant prompt files in `prompts/`
- A new `issues_to_look/` note when documentation drift is uncertain

### 2. Audit for Drift

Compare docs against:

- `package.json` commands.
- Current `src/app/api/` routes.
- Current `dotfiles/` catalog and supported categories.
- `src/lib/schemas.ts`, parser, scanner, shell, and seed behavior.
- UI features actually present in `src/app/page.tsx` and `src/components/`.

### 3. Update

- Make one accurate, evidence-backed documentation update.
- Keep docs concise and operational.
- Do not document planned behavior as implemented.
- Keep `AGENTS.md` as the authoritative project guide unless the repo intentionally changes that model.

### 4. No-Op Conditions

If the chosen document already matches the code, no-op with "documentation is current".

If the correct documentation depends on an ambiguous unfinished feature, log the uncertainty to `issues_to_look/`.

### 5. Verify

Run:

```bash
git diff --check
```

If command documentation changed, run or explain the affected command.

### 6. Commit

Commit with a message like: `docs: sync readme with dotfile catalog`.

## Issue Management

If an issue from `issues_to_look/` is resolved or found to be resolved, move it to `issues_to_look/resolved/`.
