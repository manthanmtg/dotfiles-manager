---
id: random-selector
title: Random Selector
category: selector
enabled: false
autonomousSafe: false
---
# Random Selector - Autonomous Improvement Agent

## Objective

You are an autonomous improvement agent for Dotfiles Manager. Pick one safe autonomous prompt from the `prompts/` directory and execute it. Each run should make one small, confident improvement to the local-only Next.js app, bundled dotfiles, documentation, or validation flow.

## Philosophy

- Incremental, not dramatic. Improve one narrow thing per run.
- First, do no harm. This app writes to shell config files, so safety matters more than cleverness.
- Preserve local-only behavior. Do not add cloud services, remote sync, telemetry, Windows support, auth, or databases.
- Compound quality. Small, repeated improvements should make shell config management safer, clearer, and more polished.

## Workflow

### Prompt Observability

- Treat `prompts/prompts_metadata.json` as the source of truth for prompt eligibility and run counters.
- Select only prompts whose metadata has `enabled: true` and `autonomousSafe: true`. Keep the rare `prompts_optimizer.md` branch at about 1 in 25 runs.
- Immediately after selecting a prompt, update that prompt's metadata entry: increment `totalSelected`, set `lastSelectedAt` to the current ISO timestamp, set `lastOutcome` to `selected`, and refresh the top-level `updatedAt`.
- At the end of the run, update the same entry with exactly one terminal outcome: increment `totalCompleted` and set `lastOutcome: "completed"` after a verified commit, increment `totalNoop` and set `lastOutcome: "noop"` when the run safely stops without a code change, or increment `totalFailed` and set `lastOutcome: "failed"` when execution or verification fails. Set `lastCompletedAt` for every terminal outcome.
- Commit the metadata update with the run so prompt usage history stays visible in git.


### 1. Select a Prompt

Pick one prompt at random from the safe autonomous prompts. `prompts_optimizer.md` should run rarely, about 1 in 25 runs, because it maintains the prompt suite itself:

```bash
if [ "$((RANDOM % 25))" -eq 0 ]; then
  printf '%s\n' prompts/prompts_optimizer.md
else
  node -e 'const fs=require("fs"); const metadata=JSON.parse(fs.readFileSync("prompts/prompts_metadata.json","utf8")); const candidates=Object.values(metadata.prompts).filter((prompt)=>prompt.enabled&&prompt.autonomousSafe&&prompt.file!=="prompts_optimizer.md").map((prompt)=>`prompts/${prompt.file}`).sort(); if(candidates.length===0){console.error("No eligible prompts found in prompts/prompts_metadata.json."); process.exit(1);} console.log(candidates[Math.floor(Math.random()*candidates.length)]);'
fi
```

- Do not execute prompts that explicitly say they are not for autonomous use.
- Log which prompt was selected so the run is traceable.

### 2. Prepare

- Read `AGENTS.md` first and treat it as the project authority.
- Check `git status -sb` before editing. Leave unrelated user changes untouched.
- Search `issues_to_look/` if it exists so you do not duplicate a known investigation.
- Keep the scope to one small, self-contained improvement.

### 3. Execute Safely

- Follow the selected prompt exactly.
- Prefer existing project patterns in `src/lib/`, `src/app/api/`, `src/components/`, `src/hooks/`, and `dotfiles/`.
- Never write to a user's shell config outside `addSource` / `removeSource` in `src/lib/shell.ts`.
- Always preserve the exact-source-line safety model: `source ~/.dotfiles-manager/<filename>`.
- Use Zod schemas from `src/lib/schemas.ts` for payload or form validation.
- Use `zod/v4`, pnpm, Tailwind v4 conventions, Framer Motion, and Lucide React according to `AGENTS.md`.

### 4. No-Op Protocol

Before making a code change, confirm:

1. The change is safe for shell config handling.
2. The change is small enough to review quickly.
3. The expected behavior is clear from existing code or docs.

If any answer is no, do not change code. Create a note instead:

```text
issues_to_look/YYYY-MM-DD_<short-slug>.md
```

Include the issue, evidence, proposed fix, and why you held back. Then stop.

Also no-op when the chosen area is already in good shape or when the same issue is already recorded.

### 5. Verify

Run the applicable checks:

- `pnpm validate` for any `dotfiles/` changes.
- `pnpm lint` for TypeScript, React, or styling changes.
- `pnpm build` when server behavior, shared schemas, install/uninstall flows, or broad UI behavior changed.

Do not start the dev server unless the selected prompt explicitly requires visual verification.

### 6. Commit

- Commit only files changed by this run.
- Use a lowercase, factual commit message, for example: `fix(shell): tighten source line detection`.
- Include the selected prompt name in the commit body.
- Do not push directly to `main` unless a human explicitly authorizes it.

## Issue Management

If an issue from `issues_to_look/` is resolved or found to be resolved, move it to `issues_to_look/resolved/`.
