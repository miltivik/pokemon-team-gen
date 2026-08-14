# Fixed Pokemon and AdSense Configuration Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Make Pokémon selected through profile links persist into generation, accept the canonical fixed-member API field, and remove fake AdSense slot configuration while keeping real slots deploy-configurable.

**Architecture:** Reuse the existing `TeamGenerationOptions` and `TeamForm` flow. Parse one or more `fixedPokemon` query parameters in the configuring page, normalize API aliases at the route boundary, and expose publisher/slot IDs through public environment variables with empty slots disabled. Add focused Node regression checks that exercise the shared helpers and route payload normalization without changing the generator algorithm.

**Tech Stack:** Next.js App Router, React, TypeScript, Zod, Node CommonJS regression scripts, PowerShell.

## Global Constraints

- Preserve existing `fijo` and `fijos` request compatibility.
- Never invent AdSense ad-slot IDs; empty slot configuration must render no ad unit.
- Keep the existing generator behavior and format validation unchanged.
- Do not alter unrelated local work.
- Run the focused regression test, TypeScript check, SEO regression test, production build, and live verification before claiming completion.

---

### Task 1: Fixed-member regression coverage

**Files:**
- Create: `scripts/test-fixed-pokemon.cjs`
- Modify: `package.json`

- [x] **Step 1: Write failing tests**

Cover the required behavior: query parameters provide fixed members, empty query values are ignored, and the API normalization accepts `fixedMembers` in addition to `fijo`/`fijos`.

- [x] **Step 2: Run the focused test and confirm RED**

Run `npm run test:fixed-pokemon`; it must fail because the shared query/API helpers do not exist yet.

- [x] **Step 3: Keep the test focused on public helper behavior**

Use real module imports through the repository's existing `jiti` setup and Node `assert`; do not mock the generator.

---

### Task 2: Wire fixed Pokémon from URL to generation

**Files:**
- Modify: `lib/team-generation-options.ts`
- Modify: `app/configurar/configurar-page-client.tsx`
- Modify: `app/api/generate-dynamic-team/route.ts`

- [x] **Step 1: Implement query parsing helper**

Add a small helper that reads all `fixedPokemon` values, trims them, removes empty values, and preserves order.

- [x] **Step 2: Seed the form from query parameters**

Prefer valid query fixed members when present; otherwise preserve stored generation options. Continue limiting the list to the format's maximum team size.

- [x] **Step 3: Normalize API aliases**

Accept `fixedMembers` at the Zod boundary and resolve it alongside the existing `fijos` and `fijo` fields before calling `generateDynamicTeam`.

- [x] **Step 4: Run the focused test and confirm GREEN**

Run `npm run test:fixed-pokemon` and verify the new behavior passes.

---

### Task 3: Make AdSense slots explicit and safe

**Files:**
- Modify: `components/monetization/Ads.tsx`
- Modify: `components/ConsentAwareScripts.tsx`
- Modify: `app/layout.tsx`
- Modify: `.env.local.example`

- [x] **Step 1: Replace hardcoded publisher configuration with public env fallbacks**

Keep the current publisher ID as a backward-compatible fallback, but allow deployment configuration through `NEXT_PUBLIC_ADSENSE_PUBLISHER_ID`.

- [x] **Step 2: Add explicit banner/display slot variables**

Read `NEXT_PUBLIC_ADSENSE_SLOT_BANNER` and `NEXT_PUBLIC_ADSENSE_SLOT_DISPLAY`; if absent, render no `<ins>` unit rather than a fake slot.

- [x] **Step 3: Reuse one publisher ID in metadata and loader**

Ensure the publisher ID used by the ad component, AdSense script, and `google-adsense-account` metadata is consistent.

- [x] **Step 4: Update the environment example**

Document the `ca-pub-` format and the two real slot variables without adding placeholder numeric IDs.

---

### Task 4: Verify local and production behavior

**Files:**
- Modify: `scripts/test-seo-regressions.cjs` only if a focused regression assertion is needed.

- [x] **Step 1: Run focused and existing tests**

Run `npm run test:fixed-pokemon`, `npm run test:seo`, and `npx tsc --noEmit`.

- [x] **Step 2: Build the production artifact**

Run `npm run build` and report any unrelated baseline issue precisely.

- [ ] **Step 3: Recheck live endpoints after deployment**

Verify the fixed-member API response, `/ads.txt`, the publisher metadata, and whether production contains configured ad units. A local commit or push alone does not prove production changed.

- [x] **Step 4: Review diff and working tree**

Run `git diff --check`, inspect the final diff, and report exact files and commit state.
