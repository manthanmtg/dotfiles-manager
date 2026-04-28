---
id: metadata-validation-improver
title: Metadata Validation Improver Prompt
category: code-quality
enabled: true
autonomousSafe: true
---
# Metadata Validation Improver Prompt

## Objective

Improve validation for dotfile meta comments so malformed bundled `.sh` files fail early with clear errors.

## Workflow

### 1. Pick a Target

Choose one:

- `scripts/validate.ts`
- `src/lib/parser.ts`
- `src/lib/scanner.ts`
- `src/lib/schemas.ts`
- A bundled `dotfiles/**/*.sh` file that exposes a validation gap

### 2. Audit

Look for:

- Missing validation for required fields.
- Poor error messages without filenames or line context.
- Parser behavior that accepts malformed variable definitions.
- Category validation drifting from `CATEGORY_META`.
- Scanner behavior that misses nested `.sh` files or accepts non-shell files.

### 3. Fix

- Improve one validation behavior or one error message.
- Keep parser and schema responsibilities clear.
- Avoid changing runtime storage formats unless absolutely necessary.

### 4. No-Op Conditions

If validation is already strict for the inspected path, no-op with "metadata validation is clear".

If the improvement needs a full parser rewrite, log it to `issues_to_look/`.

### 5. Verify

Run:

```bash
pnpm validate
pnpm lint
pnpm build
```

### 6. Commit

Commit with a message like: `fix(validate): report malformed variable line numbers`.

## Issue Management

If an issue from `issues_to_look/` is resolved or found to be resolved, move it to `issues_to_look/resolved/`.
