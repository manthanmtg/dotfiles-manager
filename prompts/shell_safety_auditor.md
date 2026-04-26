# Shell Safety Auditor Prompt

## Objective

Audit one shell config mutation path and harden it without broadening what the app can edit. The highest-risk code is `src/lib/shell.ts` and API routes that call install/uninstall helpers.

## Philosophy

Dotfiles Manager is local-only but still touches real shell startup files. A safe implementation must be exact, idempotent, and easy to reason about.

## Workflow

### 1. Pick a Target

Choose one:

- `src/lib/shell.ts`
- `src/app/api/install/route.ts`
- `src/app/api/uninstall/route.ts`
- `src/hooks/useDotfiles.ts` install/uninstall calls
- UI paths that trigger install or uninstall actions

### 2. Audit

Look for:

- Missing `isSourced()` checks before install.
- Regexes that could remove lines beyond the exact managed source line.
- Filename handling that could allow path traversal.
- Ambiguous errors when shell config paths are missing.
- Side effects that bypass `addSource` or `removeSource`.

### 3. Fix

- Make 1 small safety improvement.
- Preserve the exact line format: `source ~/.dotfiles-manager/<filename>`.
- Do not change the install/uninstall contract unless every call site is updated and verified.

### 4. No-Op Conditions

If the selected path is already exact and guarded, no-op with "shell mutation path is safe".

If the fix requires changing how user shell files are parsed globally, log it to `issues_to_look/`.

### 5. Verify

Run:

```bash
pnpm lint
pnpm build
```

If a bundled dotfile changed, also run `pnpm validate`.

### 6. Commit

Commit with a message like: `fix(shell): guard install path against duplicate sources`.

## Issue Management

If an issue from `issues_to_look/` is resolved or found to be resolved, move it to `issues_to_look/resolved/`.
