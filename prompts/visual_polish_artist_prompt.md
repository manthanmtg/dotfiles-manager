# Visual Polish Artist Prompt

## Objective

Improve one visual or interaction detail in the Dotfiles Manager UI while preserving the existing dark, terminal-inspired design.

## Scope

- Pick one component or page section.
- Make one small visual improvement.
- Do not redesign the app or introduce a new theme.

## Aesthetic Checklist

1. Use existing Tailwind v4 and CSS variable patterns from `src/app/globals.css`.
2. Keep the dark zinc base with existing neon accents: cyan, emerald, purple, rose, amber, and sky.
3. Use Lucide React icons where an icon improves scannability.
4. Use Framer Motion only where the project already uses it and motion provides meaningful feedback.
5. Preserve keyboard focus visibility, contrast, and responsive behavior.
6. Do not add marketing-page sections; the app should open to the usable management interface.

## Workflow

### 1. Audit

Find one area that feels flat, cramped, visually inconsistent, or lacking interaction feedback.

### 2. Improve

- Refine spacing, hierarchy, hover/focus states, empty states, or transition behavior.
- Keep the diff small and local.
- Avoid hardcoded hex colors unless nearby code already requires them.

### 3. No-Op Conditions

If the selected target is already polished, pick another. If 3 targets are clean, no-op with "visual polish is solid".

If the desired improvement requires restructuring the page, log it to `issues_to_look/`.

### 4. Verify

Run:

```bash
pnpm lint
pnpm build
```

Use a browser screenshot check if the change affects layout substantially.

### 5. Commit

Commit with a message like: `style(ui): refine dotfile card hover states`.

## Issue Management

If an issue from `issues_to_look/` is resolved or found to be resolved, move it to `issues_to_look/resolved/`.
