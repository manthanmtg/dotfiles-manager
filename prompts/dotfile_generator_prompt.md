---
id: dotfile-generator-prompt
title: Dotfile Generator Prompt
category: code-quality
enabled: true
autonomousSafe: false
---
# Dotfile Generator Prompt

> Not for autonomous use. This prompt creates new user-facing dotfiles and should only run when a human explicitly asks for a specific new config. If `random_selector.md` selects this prompt, no-op and select a different safe prompt.

## Objective

Create a new bundled dotfile under `dotfiles/<category>/` with a valid meta block and safe shell content.

## Requirements

1. Choose one supported category:
   - `aliases`
   - `scripts`
   - `prompts`
   - `security`
   - `environment`
   - `functions`
2. Add a top meta block:

```sh
# @dotfiles-manager
# name: Human-Readable Name
# description: One-line description of what this dotfile does.
# category: aliases
# icon: Terminal
# tags: shell, productivity
# @end
```

3. Use variable declarations for user-configurable values:

```sh
# variable: VAR_NAME | Label | Description | default_value | required | sensitive
```

4. Keep shell code safe:
   - Avoid destructive commands.
   - Prefer functions or aliases over automatic side effects.
   - Keep macOS/Linux portability in mind.
   - Do not require cloud services unless the human explicitly requested that tool.

## Verify

Run:

```bash
pnpm validate
pnpm build
```

## Commit

Commit with a message like: `feat(dotfiles): add python helper aliases`.

## Issue Management

If an issue from `issues_to_look/` is resolved or found to be resolved, move it to `issues_to_look/resolved/`.
