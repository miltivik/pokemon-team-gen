# SEO Release Readiness Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Remove the remaining SEO release blockers, make the current Showdown Regulation I data mapping explicit, and leave the site covered by focused checks before deployment.

**Architecture:** Keep the existing Next.js App Router structure and add crawlable links at existing navigation/content integration points. Treat Showdown's current Regulation I static set key as an explicit `vgc2025` mapping, preserve Regulation F tournament priors as legacy-only, and add regression coverage instead of inventing unsupported current tournament priors.

**Tech Stack:** Next.js 16 App Router, React 19, TypeScript, existing client-side i18n, Node.js regression scripts, `jiti`, ESLint.

## Global Constraints

- Preserve all unrelated local changes already present in the working tree.
- Keep the new landing at `/pokemon-showdown-team-builder` and the interactive tool at `/configurar`.
- Do not reuse Regulation F tournament priors for Regulation I.
- Keep English and Spanish UI copy aligned.
- Do not commit, push, or deploy unless separately requested.

---

### Task 1: Add failing release-regression checks

**Files:**
- Modify: `scripts/test-seo-regressions.cjs`
- Create: `scripts/test-format-source-resolver.cjs`
- Modify: `package.json`

**Interfaces:**
- The SEO regression script will assert the landing is linked from the home page, configurator, VGC guide, and footer-rendered HTML, and that important descriptions stay within 150–160 characters.
- The resolver test will assert `getCompetitiveSetsFormatKey("gen9vgc2026regi") === "vgc2025"` and that the first competitive-set candidate is the explicit mapped `vgc2025` candidate.

- [ ] **Step 1: Write the failing SEO assertions**

Add a helper that asserts a metadata description is between 150 and 160 characters. In `checkMetadata`, apply it to `/pokemon-showdown-team-builder`; in `checkVgc`, apply it to `/guides/vgc`. Fetch `/`, `/configurar`, and `/guides/vgc` and assert each contains `href="/pokemon-showdown-team-builder"`.

- [ ] **Step 2: Write the failing resolver test**

Create `scripts/test-format-source-resolver.cjs` that loads `resolveProviderFormatCandidates` and `getCompetitiveSetsFormatKey` with `jiti` and asserts:

```js
assert.equal(getCompetitiveSetsFormatKey("gen9vgc2026regi"), "vgc2025");
assert.deepEqual(
  resolveProviderFormatCandidates("gen9vgc2026regi", "competitiveSets").candidates[0],
  { slug: "vgc2025", reason: "mapped" }
);
```

- [ ] **Step 3: Register the focused test command**

Add `"test:format-sources": "node scripts/test-format-source-resolver.cjs"` to `package.json`.

- [ ] **Step 4: Run the new tests and verify the expected red state**

Run `npm run test:format-sources` and `npm run test:seo -- --check=metadata`; they must fail because the resolver currently exposes `vgc2026` and the current metadata/link implementation does not satisfy the new assertions.

### Task 2: Add crawlable internal links and localized copy

**Files:**
- Modify: `components/home/HeroSection.tsx`
- Modify: `components/Footer.tsx`
- Modify: `app/configurar/configurar-page-client.tsx`
- Modify: `app/guides/vgc/vgc-guide-client.tsx`
- Modify: `lib/i18n.tsx`

**Interfaces:**
- Existing client components continue to use `Link` and `useTranslation`; no new navigation component or route is introduced.
- The landing receives contextual links from the home explore section, footer tool section, configurator, and VGC guide.

- [ ] **Step 1: Add English and Spanish translation keys**

Add keys for the home Explore card, the configurator contextual link, and the VGC guide contextual link in both language maps. Use copy that naturally includes “Pokemon Showdown team builder” without keyword stuffing.

- [ ] **Step 2: Add the home Explore card**

Add `/pokemon-showdown-team-builder` to `exploreLinks` with localized title, description, label, and a distinct accent class.

- [ ] **Step 3: Add the footer tool link**

Add a crawlable `Link` under the footer’s Tool section, using localized anchor text.

- [ ] **Step 4: Add contextual links from the configurator and VGC guide**

Render a small text link below the configurator header and add a button/link in the VGC guide’s bottom CTA group. Both must point to `/pokemon-showdown-team-builder` and remain valid in both languages.

- [ ] **Step 5: Run the SEO regression checks**

Run `npm run test:seo -- --check=metadata`, `npm run test:seo -- --check=configurar`, and `npm run test:seo -- --check=vgc`. They must pass after the implementation.

### Task 3: Make Regulation I source resolution explicit and cover current-format matrices

**Files:**
- Modify: `lib/data-sources/format-source-resolver.ts`
- Modify: `scripts/test-style-matrix.cjs`
- Modify: `scripts/test-type-matrix.cjs`

**Interfaces:**
- `gen9vgc2026regi` maps directly to the repository’s `vgc2025` static set key because that is the stored Regulation I dataset; no Regulation F tournament prior is added or reused.
- Existing Regulation F legacy cases remain unchanged.

- [ ] **Step 1: Implement the explicit static-set mapping**

Change the `competitiveSets` override for `gen9vgc2026regi` to `{ slug: "vgc2025", reason: "mapped" }`, and add a short comment explaining the repository’s naming distinction between the Showdown format ID and the stored static dataset key.

- [ ] **Step 2: Add a current Reg I style case**

Add a `vgc-regi-balanced` case to `STYLE_MATRIX` using `gen9vgc2026regi`, the balanced template, allowed VGC archetypes, a conservative validation threshold, and no Regulation F prior IDs.

- [ ] **Step 3: Add a current Reg I type case**

Add a `vgc-regi-water` case to `TYPE_MATRIX` using `gen9vgc2026regi`, the balanced template, Water typing, and `excludeLegendaries: true`.

- [ ] **Step 4: Run focused current-format tests**

Run `npm run test:format-sources`, `npm run test:styles -- --case=vgc-regi-balanced --iterations=1`, and `npm run test:types -- --case=vgc-regi-water --iterations=1`. All must pass.

### Task 4: Shorten metadata and perform final verification

**Files:**
- Modify: `app/guides/vgc/layout.tsx`
- Modify: `app/pokemon-showdown-team-builder/page.tsx`

**Interfaces:**
- Keep the existing titles, canonicals, Open Graph metadata, JSON-LD, and visible content unchanged apart from concise descriptions.

- [ ] **Step 1: Shorten the VGC description**

Rewrite the description to retain VGC 2026 Reg I, Pokemon Showdown, doubles strategy, two restricted legendaries, unique item clause, and no Mythical Pokemon within 150–160 characters.

- [ ] **Step 2: Shorten the landing description**

Rewrite the description to retain Pokemon Showdown team builder intent, three-step value proposition, Gen 9 OU, and VGC 2026 Reg I within 150–160 characters.

- [ ] **Step 3: Run final static checks**

Run `git diff --check`, `npx tsc --noEmit`, focused ESLint on every changed TS/TSX file, `npm run test:format-sources`, `npm run test:seo`, the two focused current-format matrix commands, and `npm run build`.

- [ ] **Step 4: Review the final diff and deployment boundary**

Confirm the landing is internally linked, no Reg F prior IDs appear in Reg I cases, the sitemap still contains the landing, the build generates the route, and no commit/push/deploy was performed.
