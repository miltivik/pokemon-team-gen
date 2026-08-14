# Generation Loading Feedback Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Make the existing team-generation request visibly active and accessible while it is pending.

**Architecture:** Extend the existing `TeamForm` client state without changing the API, request payload, navigation, or error handling. Reuse the installed `lucide-react` `Loader2` icon and the existing translated `form.generating` label; expose the form busy state and a polite status region.

**Tech Stack:** Next.js 16 App Router, React 19, TypeScript, Tailwind CSS v4, existing `lucide-react`, Node assertion-based regression scripts.

## Global Constraints

- Modify `components/TeamForm.tsx` only for production behavior.
- Do not add a dependency, endpoint, polling, streaming, overlay, fake percentage, or timer-based progress message.
- Preserve the current disabled-button guard, fetch body, success callback, error toast, and `finally` cleanup.
- Use `aria-busy={isLoading}` on the form and a visible `role="status"` message only while loading.
- Preserve the existing English/Spanish translation key by reusing `t("form.generating")`.
- Preserve unrelated dirty worktree changes; do not reset, checkout, commit, or push them.

---

### Task 1: Add the regression check

**Files:**
- Create: `scripts/test-generation-loading.cjs`
- Modify: `package.json` scripts

**Interfaces:**
- Consumes: the source text of `components/TeamForm.tsx`.
- Produces: a one-command check that fails until the loading affordances exist.

- [x] **Step 1: Write the failing test**

Create `scripts/test-generation-loading.cjs`:

```js
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");

const root = path.resolve(__dirname, "..");
const source = fs.readFileSync(path.join(root, "components", "TeamForm.tsx"), "utf8");

assert.match(source, /import \{ Loader2 \} from ["']lucide-react["']/);
assert.match(source, /aria-busy=\{isLoading\}/);
assert.match(source, /role="status"/);
assert.match(source, /animate-spin/);
assert.match(source, /disabled=\{isLoading\}/);
assert.match(source, /finally\s*\{[\s\S]*setLocalLoading\(false\)/);

console.log("Generation loading feedback regression checks passed.");
```

Add this script to `package.json`:

```json
"test:generation-loading": "node scripts/test-generation-loading.cjs"
```

- [x] **Step 2: Run test to verify it fails**

Run `npm run test:generation-loading`.

Expected: FAIL on the missing `Loader2` import (the current component has none of the new loading affordances).

### Task 2: Implement the minimal loading UI

**Files:**
- Modify: `components/TeamForm.tsx` at the imports and submit form near the current submit button

**Interfaces:**
- Consumes: existing `isLoading`, `t`, and `localLoading` flow.
- Produces: animated submit feedback, `aria-busy`, and a polite status message.

- [x] **Step 1: Add the existing icon import**

Add:

```tsx
import { Loader2 } from "lucide-react";
```

- [x] **Step 2: Mark the form busy and render the spinner**

Change the form opening tag to:

```tsx
<form onSubmit={handleSubmit} className="space-y-6" aria-busy={isLoading}>
```

Inside the existing submit button, keep the button disabled and label logic, then add:

```tsx
{isLoading && (
    <Loader2 className="mr-2 inline-block h-4 w-4 animate-spin" aria-hidden="true" />
)}
{isLoading ? t("form.generating") : t("form.generate")}
```

Immediately after the button, add:

```tsx
{isLoading && (
    <p role="status" className="text-center text-sm text-zinc-600 dark:text-zinc-400">
        {t("form.generating")}
    </p>
)}
```

Do not change `handleSubmit`, the request body, or any success/error path.

- [x] **Step 3: Run the regression check to verify it passes**

Run `npm run test:generation-loading`.

Expected: PASS with `Generation loading feedback regression checks passed.`

### Task 3: Verify the integration

**Files:**
- Test: `components/TeamForm.tsx`, existing project checks, and the local `/configurar` route

- [x] **Step 1: Run focused static checks**

Run:

```powershell
npx eslint components/TeamForm.tsx
npx tsc --noEmit
npm run test:generation-loading
```

Expected: all commands exit with code 0.

- [x] **Step 2: Run existing regression and production checks**

Run:

```powershell
npm run test:seo
npm run test:fixed-pokemon
npm run test:adsense-config
npm run build
```

Expected: all commands exit with code 0; existing non-blocking postbuild data warnings, if any, are recorded rather than treated as this UI change.

- [x] **Step 3: Validate the rendered flow**

Use the existing local dev server at `http://127.0.0.1:3007/configurar` if it is running; otherwise start `npm run dev -- --hostname 127.0.0.1 --port 3007`. The flow under test is:

`/configurar` loads -> submit the valid default form -> button disables and shows the spinner/status -> the request completes and the app navigates to `/equipo`.

If the Browser plugin is unavailable, use Playwright only as fallback and capture a screenshot outside the repository. Check page identity, meaningful content, absence of framework overlays, console errors, the disabled button, `aria-busy="true"`, `role="status"`, and final navigation.
