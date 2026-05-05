---
id: security-auditor
title: Security Auditor Prompt
category: security
enabled: true
autonomousSafe: true
---
# Security Auditor Prompt

## Objective

Pick one security-sensitive file or flow and reduce risk around filesystem access, shell config mutation, variable substitution, or user-controlled content.

## Workflow

### 1. Pick a Target

Prioritize:

- API routes in `src/app/api/`
- `src/lib/shell.ts`
- `src/lib/dotfiles.ts`
- `src/lib/parser.ts`
- `src/lib/seed.ts`
- UI that previews shell content or accepts variable values

### 2. Audit

Check for:

- Path traversal through filenames or dotfile identifiers.
- Missing Zod (from `zod/v4`) validation for incoming payloads.
- Sensitive variable values shown in logs, URLs, or persistent client storage.
- Unsafe rendering of dotfile content.
- Broad regexes that can remove unrelated shell config lines.
- Platform guards missing from API routes.

### 3. Fix

- Make 1 small hardening change.
- Do not add auth, remote storage, encryption services, or cloud dependencies.
- Preserve local-only behavior and documented shell source-line semantics.

### 4. No-Op Conditions

If 3 inspected files show no meaningful security smell, no-op with "security posture is sound".

If the fix requires a larger design decision, log the risk to `issues_to_look/`.

### 5. Verify

Run:

```bash
pnpm lint
pnpm build
```

Run `pnpm validate` if any bundled dotfile changed.

### 6. Commit

Commit with a message like: `fix(security): reject unsafe dotfile identifiers`.

## Issue Management

If an issue from `issues_to_look/` is resolved or found to be resolved, move it to `issues_to_look/resolved/`.
