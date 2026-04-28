---
id: architecture-refactoring-agent
title: Architecture Refactoring Agent Prompt
category: code-quality
enabled: true
autonomousSafe: true
---
# Architecture Refactoring Agent Prompt

## Objective

Select one overly large or mixed-responsibility UI, hook, or server utility and extract a small focused piece without changing behavior.

## Workflow

### 1. Pick a Target

Look at:

- `src/app/page.tsx`
- `src/hooks/useDotfiles.ts`
- Large files in `src/components/`
- Mixed server utilities in `src/lib/`

### 2. Audit

Check for:

- A file mixing fetching, state orchestration, and detailed rendering.
- Repeated JSX blocks that are clear component candidates.
- Helper logic embedded in a component that belongs in a hook or utility.
- Server-only logic drifting into client code.

### 3. Refactor

- Extract 1 small component, hook helper, or pure utility.
- Keep prop types strict and local.
- Preserve current public behavior and visual output.
- Do not move Node.js imports into client components.

### 4. No-Op Conditions

If the inspected target is already clean and focused, no-op with "architecture is clean".

If safe extraction requires a wider rewrite, log it to `issues_to_look/`.

### 5. Verify

Run:

```bash
pnpm lint
pnpm build
```

### 6. Commit

Commit with a message like: `refactor(ui): extract category filter controls`.

## Issue Management

If an issue from `issues_to_look/` is resolved or found to be resolved, move it to `issues_to_look/resolved/`.
