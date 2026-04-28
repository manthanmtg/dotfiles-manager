---
id: accessibility-improver
title: Accessibility Improver Prompt
category: ui-quality
enabled: true
autonomousSafe: true
---
# Accessibility Improver Prompt

## Objective

Pick one UI component or page and improve accessibility for keyboard users, screen readers, and high-contrast usage.

## Workflow

### 1. Pick a Target

Choose one:

- `src/app/page.tsx`
- A component in `src/components/`
- The variable modal
- Install/uninstall controls
- Code preview and terminal console surfaces

### 2. Audit

Check for:

- Buttons without accessible names.
- Inputs without labels or descriptions.
- Modals without dialog semantics and focus handling.
- Interactive elements without visible focus states.
- Status messages not exposed through `aria-live`.
- Non-semantic containers where `main`, `nav`, `section`, or `aside` would fit.

### 3. Fix

- Fix 1-3 issues.
- Preserve the existing dark terminal-inspired UI.
- Keep touch targets comfortable and avoid layout churn.

### 4. No-Op Conditions

If 3 inspected components are already accessible, no-op with "a11y looks good".

If a fix needs a large focus-management refactor, log it to `issues_to_look/`.

### 5. Verify

Run:

```bash
pnpm lint
pnpm build
```

If a browser is available, manually tab through the changed component.

### 6. Commit

Commit with a message like: `a11y(modal): label variable inputs`.

## Issue Management

If an issue from `issues_to_look/` is resolved or found to be resolved, move it to `issues_to_look/resolved/`.
