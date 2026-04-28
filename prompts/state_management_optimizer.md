---
id: state-management-optimizer
title: State Management Optimizer Prompt
category: reliability
enabled: true
autonomousSafe: true
---
# State Management Optimizer Prompt

## Objective

Optimize one React state or derived-data path so the app avoids unnecessary work while preserving behavior.

## Workflow

### 1. Pick a Target

Prioritize:

- `src/app/page.tsx`
- `src/hooks/useDotfiles.ts`
- `src/components/CategorySection.tsx`
- `src/components/DotfileCard.tsx`
- `src/components/VariableModal.tsx`
- Search/filter/category rendering logic

### 2. Audit

Look for:

- Filtering or grouping recomputed on every render without need.
- Callback props recreated deeply across many cards.
- UI-only state living higher than necessary.
- Effects with broad dependencies causing extra fetches.
- Terminal log updates that force unrelated UI to rerender.

### 3. Fix

- Add `useMemo`, `useCallback`, `React.memo`, or state colocation for one clear issue.
- Keep hook dependency arrays correct.
- Do not introduce global state libraries.

### 4. No-Op Conditions

If the selected path is already simple and cheap, no-op with "state is already well scoped".

If optimization requires changing the page architecture, log it to `issues_to_look/`.

### 5. Verify

Run:

```bash
pnpm lint
pnpm build
```

### 6. Commit

Commit with a message like: `perf(ui): memoize filtered dotfile sections`.

## Issue Management

If an issue from `issues_to_look/` is resolved or found to be resolved, move it to `issues_to_look/resolved/`.
