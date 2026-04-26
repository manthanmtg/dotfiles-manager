# Dead Code Cleaner Prompt

## Objective

Find and remove one small batch of dead code: unused exports, orphaned components, commented-out implementation blocks, stale assets, or unused dependencies.

## Workflow

### 1. Scan

Pick one category:

- Unused exports in `src/lib/`, `src/hooks/`, `src/types/`, or `src/components/`.
- Commented-out code that no longer documents anything useful.
- Orphaned components not imported anywhere.
- Public assets not referenced by the app.
- Dependencies in `package.json` not imported anywhere.

### 2. Prove It Is Dead

- Use `rg` to confirm no references.
- Check dynamic references and string-based icon names before removing.
- Be conservative with bundled dotfiles; users may rely on names and content.

### 3. Remove

- Remove at most 5 dead items.
- Keep the total diff small.
- Do not remove public API or dotfile behavior unless clearly unused by the current app and docs.

### 4. No-Op Conditions

If there is ambiguity, do not delete. Log it to `issues_to_look/`.

If 3 scans find nothing safe to remove, no-op with "dead code scan is clean".

### 5. Verify

Run:

```bash
pnpm lint
pnpm build
```

Run `pnpm validate` if dotfiles changed.

### 6. Commit

Commit with a message like: `chore: remove unused preview helper`.

## Issue Management

If an issue from `issues_to_look/` is resolved or found to be resolved, move it to `issues_to_look/resolved/`.
