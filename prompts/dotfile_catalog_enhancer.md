# Dotfile Catalog Enhancer Prompt

## Objective

Improve one bundled dotfile under `dotfiles/` by making it clearer, safer, more useful, or better documented through its meta block.

## Workflow

### 1. Pick a Target

Select one `.sh` file under:

- `dotfiles/aliases/`
- `dotfiles/scripts/`
- `dotfiles/prompts/`
- `dotfiles/security/`
- `dotfiles/environment/`
- `dotfiles/functions/`

### 2. Audit

Check for:

- Missing or weak tags.
- Description that does not clearly explain the behavior.
- Shell code that is not portable across macOS/Linux where practical.
- Aliases/functions that can fail destructively or silently.
- Variables that should be configurable through the meta block.

### 3. Improve

- Make one small improvement to a single file.
- Keep the required meta block at the top.
- Use only supported categories: `aliases`, `scripts`, `prompts`, `security`, `environment`, `functions`.
- If adding variables, use the supported syntax:

```text
# variable: VAR_NAME | Label | Description | default_value | required | sensitive
```

### 4. No-Op Conditions

If the selected dotfile is already clear, safe, and validated, pick another. If 3 targets are clean, no-op with "dotfile catalog looks healthy".

### 5. Verify

Run:

```bash
pnpm validate
pnpm build
```

### 6. Commit

Commit with a message like: `chore(dotfiles): clarify docker aliases metadata`.

## Issue Management

If an issue from `issues_to_look/` is resolved or found to be resolved, move it to `issues_to_look/resolved/`.
