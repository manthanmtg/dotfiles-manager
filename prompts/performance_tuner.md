# Performance Tuner Prompt

## Objective

Find and fix one small performance issue in the app, validation script, parser, scanner, or UI rendering path.

## Workflow

### 1. Pick a Target

Choose one:

- Dotfile scanning/parsing in `src/lib/`
- Validation in `scripts/validate.ts`
- Dotfile list rendering in `src/app/page.tsx` or `src/components/`
- Fetch behavior in `src/hooks/useDotfiles.ts`
- Bundle imports in client components

### 2. Audit

Look for:

- Repeated parsing or scanning that can be avoided.
- Heavy computations in render.
- Unnecessary client imports.
- Repeated fetches for the same state transition.
- Components rerendering because stable props are rebuilt unnecessarily.

### 3. Fix

- Make one measurable or clearly reasoned improvement.
- Avoid premature abstraction.
- Do not cache filesystem state in a way that hides dotfile changes from users.

### 4. No-Op Conditions

If no small, safe improvement is evident, no-op with "performance looks acceptable".

If the fix needs a larger caching or architecture decision, log it to `issues_to_look/`.

### 5. Verify

Run:

```bash
pnpm lint
pnpm build
```

Run `pnpm validate` if parser, scanner, or bundled dotfiles changed.

### 6. Commit

Commit with a message like: `perf(scanner): avoid duplicate metadata parsing`.

## Issue Management

If an issue from `issues_to_look/` is resolved or found to be resolved, move it to `issues_to_look/resolved/`.
