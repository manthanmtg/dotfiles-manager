---
id: type-safety-enforcer
title: Type Safety Enforcer Prompt
category: verification
enabled: true
autonomousSafe: true
---
# Type Safety Enforcer Prompt

## Objective

Pick one file and remove weak TypeScript boundaries such as `any`, unsafe casts, missing Zod parsing, or ambiguous API response shapes.

## Workflow

### 1. Pick a Target

Search for:

```bash
grep -rE "\bany\b|@ts-ignore|@ts-expect-error|as unknown as|JSON\.parse" src scripts
```

Prioritize `src/lib/`, API routes, and `src/hooks/useDotfiles.ts`.

### 2. Audit

Look for:

- API request bodies or responses without schema validation.
- Client state inferred as overly broad types.
- Casts masking real parser or filesystem edge cases.
- Shared types duplicated instead of imported from `src/types` or `src/lib/schemas.ts`.

### 3. Fix

- Replace 1-3 weak boundaries with explicit types, Zod parsing, or shared type imports.
- Import Zod from `zod/v4`.
- Keep changes local to one behavior.

### 4. No-Op Conditions

If 3 candidate files are already strongly typed, no-op with "type safety looks robust".

If correct typing requires a larger data model rewrite, log it to `issues_to_look/`.

### 5. Verify

Run:

```bash
pnpm lint
pnpm build
```

### 6. Commit

Commit with a message like: `chore(types): tighten install response handling`.

## Issue Management

If an issue from `issues_to_look/` is resolved or found to be resolved, move it to `issues_to_look/resolved/`.
