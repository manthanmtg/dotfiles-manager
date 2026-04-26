# API Resilience Improver Prompt

## Objective

Harden one API route or client fetch path so filesystem, parsing, and shell operations fail clearly and safely.

## Workflow

### 1. Pick a Target

Select one:

- `src/app/api/shell/route.ts`
- `src/app/api/dotfiles/route.ts`
- `src/app/api/install/route.ts`
- `src/app/api/uninstall/route.ts`
- `src/app/api/seed/route.ts`
- `src/hooks/useDotfiles.ts`

### 2. Audit

Check for:

- Missing `assertSupported()` at the top of API routes.
- Request payloads not validated with schemas from `src/lib/schemas.ts`.
- Errors that leak sensitive local paths or variable values to the UI.
- Fetch calls that leave the UI stuck loading.
- Mutation paths that return ambiguous success/failure results.

### 3. Fix

- Fix 1-3 resilience issues.
- Do not retry non-idempotent filesystem or shell config mutations.
- Keep user-facing errors helpful but not overly revealing.

### 4. No-Op Conditions

If the selected flow already validates input, handles errors, and resets UI state properly, no-op with "API path is resilient".

If fixing the issue requires redesigning the entire data-fetching hook, log it to `issues_to_look/`.

### 5. Verify

Run:

```bash
pnpm lint
pnpm build
```

### 6. Commit

Commit with a message like: `fix(api): validate uninstall payload before shell mutation`.

## Issue Management

If an issue from `issues_to_look/` is resolved or found to be resolved, move it to `issues_to_look/resolved/`.
