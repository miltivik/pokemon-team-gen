# Technical SEO Recovery Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Restore the existing Pokemon SEO surface, cacheable English-first HTML, and meaningful initial content without adding new dependencies or claiming unsupported Pokemon Champions functionality.

**Architecture:** Fix Pokemon eligibility in the existing shared resolver, remove cookie reads from the root server layout, and restore saved language after hydration. Server wrappers preload existing Smogon-derived view models for tier and guide client components, with static fallbacks when the upstream source is unavailable.

**Tech Stack:** Next.js 16 App Router, React 19, TypeScript 5, Node.js `assert`, existing Smogon/Pikalytics adapters, Tailwind CSS 4.

## Global Constraints

- Keep the existing `gen9vgc2026f` internal identifier and mark it legacy; do not implement Regulation M-B.
- Keep the current limit of exactly 300 eligible Pokemon profile pages.
- Serve canonical public HTML in English; `/en`, `/es`, and `hreflang` are out of scope.
- Add no dependencies and do not widen the task into unrelated refactoring.
- Preserve existing noindex behavior for localStorage/team-result routes.
- Do not modify Vercel, DNS, Cloudflare, or TLS state from the application repository.
- Use test-first red-green cycles for every behavior change.

## File Map

- Create `scripts/test-seo-regressions.cjs`: dependency-free HTTP regression checks against a local production server.
- Create `lib/meta-overview.ts`: shared server-side meta aggregation used by pages and the API.
- Create `app/tier-list/tier-list-page-client.tsx`: existing interactive tier UI with server-provided initial data.
- Create `app/guides/gen9-ou/gen9-ou-guide-client.tsx`: existing OU guide client UI with initial meta data.
- Create `app/guides/vgc/vgc-guide-client.tsx`: existing VGC guide client UI with initial meta data and honest legacy copy.
- Modify `package.json`: expose the SEO regression command.
- Modify `lib/competitive-sets.ts`: reuse case-insensitive competitive lookup.
- Modify `app/layout.tsx`, `components/Providers.tsx`, `lib/i18n.tsx`: static English shell and client language restoration.
- Modify `app/sitemap.ts`: restore Pokemon URLs, use the significant-update date, and exclude outdated VGC articles.
- Modify `components/page-skeletons.tsx`, `app/configurar/page.tsx`, `app/configurar/configurar-page-client.tsx`: meaningful H1 and copy before hydration.
- Modify `app/api/meta-overview/route.ts`, `components/guides/MetaOverview.tsx`, `app/tier-list/page.tsx`, `app/guides/gen9-ou/page.tsx`, `app/guides/vgc/page.tsx`: server-provided initial meta data.
- Modify `config/formats.ts`, `components/home/HeroSection.tsx`, `app/tier-list/layout.tsx`, `app/blog/page.tsx`, VGC article layouts/pages, and relevant i18n strings: identify Reg F as legacy and noindex outdated articles.

---

### Task 1: Add the SEO HTTP Regression Harness

**Files:**
- Create: `scripts/test-seo-regressions.cjs`
- Modify: `package.json`

**Interfaces:**
- Consumes: `SEO_BASE_URL` environment variable; defaults to `http://127.0.0.1:3007`.
- Produces: `npm run test:seo -- --check=<pseo|metadata|configurar|content|vgc|all>`.

- [ ] **Step 1: Write the regression script before changing production code**

```js
const assert = require("node:assert/strict");

const baseUrl = process.env.SEO_BASE_URL || "http://127.0.0.1:3007";
const selected = process.argv.find((arg) => arg.startsWith("--check="))?.split("=")[1] || "all";

async function get(path) {
  const response = await fetch(`${baseUrl}${path}`, { redirect: "manual" });
  return { response, text: await response.text() };
}

function count(html, pattern) {
  return [...html.matchAll(pattern)].length;
}

async function checkPseo() {
  for (const path of ["/pokemon/garchomp", "/pokemon/great-tusk", "/pokemon/ogerpon-wellspring"]) {
    const { response } = await get(path);
    assert.equal(response.status, 200, `${path} must return 200`);
  }

  const { response, text } = await get("/sitemap.xml");
  assert.equal(response.status, 200, "/sitemap.xml must return 200");
  const pokemonUrls = [...text.matchAll(/<loc>(https:\/\/poketeambuilder\.com\/pokemon\/[^<]+)<\/loc>/g)].map((match) => match[1]);
  assert.equal(pokemonUrls.length, 300, "sitemap must contain 300 Pokemon profiles");
  assert.equal(new Set(pokemonUrls).size, 300, "Pokemon sitemap URLs must be unique");
}

async function checkMetadata() {
  const { response, text } = await get("/");
  assert.equal(response.status, 200);
  assert.match(text, /<html[^>]+lang="en"/);
  assert.match(text, /Generate competitive Pokemon teams/i);
  assert.doesNotMatch(text, /Genera equipos Pokemon competitivos/i);
  assert.match(text, /<link[^>]+rel="canonical"[^>]+href="https:\/\/poketeambuilder\.com\/?"/);
}

async function checkConfigurar() {
  const { response, text } = await get("/configurar");
  assert.equal(response.status, 200);
  assert.equal(count(text, /<h1\b/gi), 1, "/configurar must render one H1");
  assert.match(text, /Generator Settings/);
  assert.match(text, /Configure your team preferences/);
}

async function checkContent() {
  for (const path of ["/tier-list", "/guides/gen9-ou", "/guides/vgc"]) {
    const { response, text } = await get(path);
    assert.equal(response.status, 200, `${path} must return 200`);
    assert.equal(count(text, /<h1\b/gi), 1, `${path} must render one H1`);
    assert.doesNotMatch(text, /animate-pulse[\s\S]*animate-pulse[\s\S]*animate-pulse/, `${path} must not be skeleton-only`);
  }
}

async function checkVgc() {
  const { text: guide } = await get("/guides/vgc");
  assert.doesNotMatch(guide, /current VGC regulation|Regulation F allows/i);
  assert.match(guide, /legacy/i);

  const { text: sitemap } = await get("/sitemap.xml");
  assert.doesNotMatch(sitemap, /blog\/(top-vgc-2026-pokemon|vgc-2026-guide)/);

  for (const path of ["/blog/top-vgc-2026-pokemon", "/blog/vgc-2026-guide"]) {
    const { text } = await get(path);
    assert.match(text, /<meta[^>]+name="robots"[^>]+content="noindex, follow"/);
  }
}

const checks = { pseo: checkPseo, metadata: checkMetadata, configurar: checkConfigurar, content: checkContent, vgc: checkVgc };

async function main() {
  const names = selected === "all" ? Object.keys(checks) : [selected];
  for (const name of names) {
    assert.ok(checks[name], `unknown check: ${name}`);
    await checks[name]();
    console.log(`PASS ${name}`);
  }
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
```

Add to `package.json`:

```json
"test:seo": "node scripts/test-seo-regressions.cjs"
```

- [ ] **Step 2: Verify the harness is RED against the current production build**

Run the existing build at port 3007, then run:

```powershell
$env:SEO_BASE_URL='http://127.0.0.1:3007'
npm run test:seo -- --check=pseo
```

Expected: FAIL because `/pokemon/garchomp` returns 500 or the sitemap contains 0 Pokemon profiles.

- [ ] **Step 3: Commit the failing regression harness**

```powershell
git add package.json scripts/test-seo-regressions.cjs
git commit -m "test(seo): add production regression checks"
```

### Task 2: Restore Pokemon Profiles and the Static English Shell

**Files:**
- Modify: `lib/competitive-sets.ts:253-255`
- Modify: `app/layout.tsx:1-3,25-84,111-167`
- Modify: `components/Providers.tsx:9-18`
- Modify: `lib/i18n.tsx:1205-1228`
- Modify: `app/sitemap.ts:10-14,126-140`

**Interfaces:**
- Consumes: existing `getPokemonSets(displayName)` and `resolveLang(value)`.
- Produces: `hasCompetitiveData(displayName): boolean` with case-insensitive behavior and a cookie-independent root layout.

- [ ] **Step 1: Add source-level assertions to the PSEO check**

Before the HTTP assertions in `checkPseo()`, load the source and datasets:

```js
const fs = require("node:fs");
const path = require("node:path");

const root = path.resolve(__dirname, "..");
const competitiveSource = fs.readFileSync(path.join(root, "lib/competitive-sets.ts"), "utf8");
assert.match(competitiveSource, /return !!getPokemonSets\(displayName\)/, "hasCompetitiveData must reuse getPokemonSets");
```

- [ ] **Step 2: Run the source assertion and verify RED**

```powershell
npm run test:seo -- --check=pseo
```

Expected: FAIL with `hasCompetitiveData must reuse getPokemonSets`.

- [ ] **Step 3: Reuse the existing resolver**

Change `hasCompetitiveData` to:

```ts
export function hasCompetitiveData(displayName: string): boolean {
  return !!getPokemonSets(displayName);
}
```

- [ ] **Step 4: Remove the root server cookie dependency and align English metadata**

In `app/layout.tsx`:

```ts
// Remove imports from next/headers and the language cookie helpers.
const ENGLISH_DESCRIPTION =
  "Generate competitive Pokemon teams for Pokemon Showdown across Gen 9 OU, UU, RU, NU, VGC legacy formats and more, with optimized movesets and strategy.";
```

Use `ENGLISH_DESCRIPTION` for root description, Open Graph, Twitter, and WebApplication JSON-LD. Render:

```tsx
<html lang="en" suppressHydrationWarning>
  {/* unchanged body */}
  <Providers>
    {/* unchanged children */}
  </Providers>
</html>
```

In `components/Providers.tsx`, remove `initialLang`:

```tsx
export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
      <LanguageProvider>
        <TeamProvider>{children}</TeamProvider>
      </LanguageProvider>
      <Toaster position="bottom-center" richColors expand visibleToasts={3} />
    </ThemeProvider>
  );
}
```

In `LanguageProvider`, restore a valid cookie once after mount and keep the HTML attribute synchronized:

```tsx
useEffect(() => {
  const cookieLang = resolveLang(
    document.cookie
      .split("; ")
      .find((entry) => entry.startsWith(`${LANGUAGE_COOKIE_KEY}=`))
      ?.split("=")[1]
  );
  setLang(cookieLang);
}, []);

useEffect(() => {
  document.documentElement.lang = lang;
  document.cookie = createLangCookie(lang);
}, [lang]);
```

Import `LANGUAGE_COOKIE_KEY` and `resolveLang` from `i18n-shared`.

- [ ] **Step 5: Use the significant update date in the sitemap**

In `app/sitemap.ts`:

```ts
const sharedUpdatedAt = new Date("2026-07-16T00:00:00.000Z");
const now = sharedUpdatedAt;
```

Keep the existing 300-item limit and mapping.

- [ ] **Step 6: Build and run the PSEO check GREEN**

```powershell
npm run build
npm start -- -p 3007
$env:SEO_BASE_URL='http://127.0.0.1:3007'
npm run test:seo -- --check=pseo
npm run test:seo -- --check=metadata
```

Expected: build succeeds; both checks print `PASS`.

- [ ] **Step 7: Commit the root-cause fix**

```powershell
git add lib/competitive-sets.ts app/layout.tsx components/Providers.tsx lib/i18n.tsx app/sitemap.ts
git commit -m "fix(seo): restore pokemon profiles and static shell"
```

### Task 3: Render the Configurator Topic Before Hydration

**Files:**
- Modify: `components/page-skeletons.tsx:101-158`
- Modify: `app/configurar/page.tsx:1-35`
- Modify: `app/configurar/configurar-page-client.tsx:157-166`

**Interfaces:**
- Consumes: `ConfigurarPageSkeleton` and existing English translations.
- Produces: `ConfigurarPageSkeleton({ title, description })` with one real H1 and descriptive paragraph.

- [ ] **Step 1: Verify the configurator check is RED**

```powershell
npm run test:seo -- --check=configurar
```

Expected: FAIL because raw HTML contains no H1.

- [ ] **Step 2: Give the existing fallback meaningful content**

Change the skeleton signature and header:

```tsx
export function ConfigurarPageSkeleton({
  title = "Generator Settings",
  description = "Configure your team preferences",
}: {
  title?: string;
  description?: string;
} = {}) {
  return (
    <ShellFrame>
      <header className="flex min-h-28 w-full flex-col items-center justify-center space-y-4 text-center">
        <h1 className="text-3xl font-bold tracking-tight text-zinc-900 dark:text-zinc-50">{title}</h1>
        <p className="text-lg text-zinc-600 dark:text-zinc-400">{description}</p>
        {/* retain only the format-pill skeletons here */}
      </header>
      {/* retain existing form skeleton */}
    </ShellFrame>
  );
}
```

Use translated text in the client hydration branch:

```tsx
if (!isHydrated) {
  return <ConfigurarPageSkeleton title={t("form.title")} description={t("form.description")} />;
}
```

- [ ] **Step 3: Add a Suspense fallback at the server boundary**

In `app/configurar/page.tsx`:

```tsx
import { Suspense } from "react";
import { ConfigurarPageSkeleton } from "@/components/page-skeletons";

export default function ConfigurarPage() {
  return (
    <Suspense fallback={<ConfigurarPageSkeleton />}>
      <ConfigurarPageClient />
    </Suspense>
  );
}
```

- [ ] **Step 4: Build and verify GREEN**

```powershell
npm run build
npm run test:seo -- --check=configurar
```

Expected: `PASS configurar`; exactly one H1 in raw HTML.

- [ ] **Step 5: Commit**

```powershell
git add components/page-skeletons.tsx app/configurar/page.tsx app/configurar/configurar-page-client.tsx
git commit -m "fix(seo): render configurator heading before hydration"
```

### Task 4: Share Meta Aggregation and Preload the Tier List

**Files:**
- Create: `lib/meta-overview.ts`
- Create: `app/tier-list/tier-list-page-client.tsx`
- Modify: `app/api/meta-overview/route.ts`
- Modify: `app/tier-list/page.tsx`

**Interfaces:**
- Consumes: `SmogonDataSource.getStats(format)` and `getCombinedStats(format, smogonStats)`.
- Produces: `getMetaOverview(format: string): Promise<MetaOverviewPayload | null>` and `TierListPageClient({ initialTierData })`.

- [ ] **Step 1: Extend the content check to require a server tier payload or explicit fallback**

Add inside `checkContent()` after fetching `/tier-list`:

```js
const tier = await get("/tier-list");
assert.match(
  tier.text,
  /href="\/pokemon\/|Live usage data is temporarily unavailable/,
  "/tier-list must render Pokemon links or an explicit server fallback"
);
```

- [ ] **Step 2: Run and verify RED**

```powershell
npm run test:seo -- --check=content
```

Expected: FAIL because the tier list initially renders only a loading skeleton.

- [ ] **Step 3: Extract the existing aggregation without changing its math**

Create `lib/meta-overview.ts` with the current `buildMetaOverview()` body from the API route and:

```ts
import { toClientSmogonStats, type SmogonMonData } from "@/lib/client-smogon-stats";
import { SmogonDataSource } from "@/lib/data-sources/smogon";
import { getCombinedStats, type CombinedPokemonData } from "@/lib/pikalytics";

export interface MetaOverviewPayload {
  meta: {
    topThreats: SmogonMonData[];
    tierGroups: Record<string, SmogonMonData[]>;
    topItems: { name: string; usage: number }[];
    topAbilities: { name: string; usage: number }[];
    loading: false;
  };
  combined: CombinedPokemonData[];
}

export async function getMetaOverview(format: string): Promise<MetaOverviewPayload | null> {
  const normalized = await SmogonDataSource.getStats(format);
  if (!normalized) return null;

  const stats = toClientSmogonStats(normalized);
  const [meta, combined] = await Promise.all([
    Promise.resolve(buildMetaOverview(stats)),
    getCombinedStats(format, stats),
  ]);

  return { meta, combined };
}
```

Export `buildMetaOverview(stats)` from the same file. Update the API route to call `getMetaOverview(format)` and retain its current 400, 404, 500, and cache headers.

- [ ] **Step 4: Split the tier server and client responsibilities**

Move the current `app/tier-list/page.tsx` implementation to `tier-list-page-client.tsx` and add:

```tsx
interface TierListPageClientProps {
  initialTierData: Record<string, SmogonMonData[]>;
}

export default function TierListPageClient({ initialTierData }: TierListPageClientProps) {
  const [format, setFormat] = useState("gen9ou");
  const [tierData, setTierData] = useState(initialTierData);
  const [loading, setLoading] = useState(false);
  // retain the existing fetchData for format changes and retries
}
```

Skip the first client fetch only when the current format is `gen9ou` and `initialTierData` is non-empty. Change the empty-state copy to:

```tsx
<p>Live usage data is temporarily unavailable. You can retry without leaving this page.</p>
```

Replace `app/tier-list/page.tsx` with:

```tsx
import TierListPageClient from "./tier-list-page-client";
import { getMetaOverview } from "@/lib/meta-overview";

export const revalidate = 3600;

export default async function TierListPage() {
  const payload = await getMetaOverview("gen9ou").catch(() => null);
  return <TierListPageClient initialTierData={payload?.meta.tierGroups ?? {}} />;
}
```

- [ ] **Step 5: Build and verify GREEN**

```powershell
npm run build
npm run test:seo -- --check=content
```

Expected: tier assertion passes with Pokemon links when data exists or explicit fallback copy when unavailable.

- [ ] **Step 6: Commit**

```powershell
git add lib/meta-overview.ts app/api/meta-overview/route.ts app/tier-list/page.tsx app/tier-list/tier-list-page-client.tsx
git commit -m "fix(seo): preload tier list data on the server"
```

### Task 5: Preload Guide Meta Content

**Files:**
- Create: `app/guides/gen9-ou/gen9-ou-guide-client.tsx`
- Create: `app/guides/vgc/vgc-guide-client.tsx`
- Modify: `app/guides/gen9-ou/page.tsx`
- Modify: `app/guides/vgc/page.tsx`
- Modify: `components/guides/MetaOverview.tsx`

**Interfaces:**
- Consumes: `MetaOverviewPayload` from `lib/meta-overview.ts`.
- Produces: `MetaOverview({ format, initialData? })` and server guide wrappers.

- [ ] **Step 1: Require substantive guide data or explicit fallback in the content check**

Add:

```js
for (const path of ["/guides/gen9-ou", "/guides/vgc"]) {
  const { text } = await get(path);
  assert.match(
    text,
    /Top Threats|Live competitive data is temporarily unavailable/,
    `${path} must render meta content or an explicit fallback`
  );
}
```

- [ ] **Step 2: Run and verify RED**

```powershell
npm run test:seo -- --check=content
```

Expected: FAIL because `MetaOverview` initially renders skeletons.

- [ ] **Step 3: Allow `MetaOverview` to initialize from server data**

```tsx
import type { MetaOverviewPayload } from "@/lib/meta-overview";

interface MetaOverviewProps {
  format: string;
  initialData?: MetaOverviewPayload | null;
}

export function MetaOverview({ format, initialData = null }: MetaOverviewProps) {
  const [data, setData] = useState(initialData?.meta ?? null);
  const [combinedData, setCombinedData] = useState(initialData?.combined ?? []);
  const [loading, setLoading] = useState(!initialData);

  useEffect(() => {
    if (initialData) return;
    // retain the existing abortable API request
  }, [format, initialData]);
```

When no data exists after loading, render:

```tsx
<p>Live competitive data is temporarily unavailable. The strategy guide below remains available.</p>
```

- [ ] **Step 4: Add thin server wrappers around the existing guide clients**

Move the current guide page bodies to their respective client files and add an `initialData` prop passed to `MetaOverview`.

Use this OU wrapper:

```tsx
import Gen9OUGuideClient from "./gen9-ou-guide-client";
import { getMetaOverview } from "@/lib/meta-overview";

export const revalidate = 3600;

export default async function Gen9OUGuidePage() {
  const initialData = await getMetaOverview("gen9ou").catch(() => null);
  return <Gen9OUGuideClient initialData={initialData} />;
}
```

Use the same pattern for VGC with `CURRENT_VGC_FORMAT`.

- [ ] **Step 5: Build and verify GREEN**

```powershell
npm run build
npm run test:seo -- --check=content
```

Expected: `PASS content`.

- [ ] **Step 6: Commit**

```powershell
git add lib/meta-overview.ts components/guides/MetaOverview.tsx app/guides/gen9-ou app/guides/vgc
git commit -m "fix(seo): render guide meta content on the server"
```

### Task 6: Remove Current-Regulation Claims From Indexable Pages

**Files:**
- Modify: `config/formats.ts:67,113`
- Modify: `components/home/HeroSection.tsx:18,64-68`
- Modify: `app/tier-list/layout.tsx:4-19`
- Modify: `app/tier-list/tier-list-page-client.tsx:17-24`
- Modify: `app/guides/vgc/layout.tsx:4-18`
- Modify: `app/guides/vgc/vgc-guide-client.tsx`
- Modify: `app/blog/page.tsx:5-50`
- Modify: `app/blog/top-vgc-2026-pokemon/layout.tsx`
- Modify: `app/blog/top-vgc-2026-pokemon/page.tsx`
- Modify: `app/blog/vgc-2026-guide/layout.tsx`
- Modify: `app/sitemap.ts:39-82`
- Modify: `lib/i18n.tsx` only for visible non-changelog Reg F/current-format strings.

**Interfaces:**
- Consumes: the existing legacy format identifier.
- Produces: honest legacy labels, evergreen VGC guide copy, and noindex outdated VGC articles.

- [ ] **Step 1: Verify the VGC check is RED**

```powershell
npm run test:seo -- --check=vgc
```

Expected: FAIL because the guide states Regulation F is current and both outdated articles remain in the sitemap.

- [ ] **Step 2: Mark the existing format legacy without changing its identifier**

```ts
gen9vgc2026f: {
  label: "[Gen 9] VGC 2026 Reg F (Legacy)",
  maxTeamSize: 6,
  gameType: "doubles",
},
```

Update homepage/tier visible badges to `Legacy VGC Reg F` and remove VGC 2026 from tier metadata keywords/descriptions.

- [ ] **Step 3: Make the guide evergreen and explicit**

Use this metadata direction in `app/guides/vgc/layout.tsx`:

```ts
title: "VGC Doubles Team Building Guide and Legacy Formats",
description:
  "Learn evergreen VGC doubles concepts including speed control, positioning, team preview and archetypes. The generator currently offers Regulation F as a legacy format.",
```

In visible guide copy, replace the current-regulation FAQ with:

```ts
{
  question: "Which VGC regulation does this generator support?",
  answer:
    "The generator currently retains VGC 2026 Regulation F as a legacy format for historical team building. It does not yet implement Pokemon Champions Regulation M-B legality or SP training.",
}
```

The H1 becomes `VGC Doubles Team Building Guide`; an adjacent notice contains `Legacy Regulation F support`.

- [ ] **Step 4: Noindex and unlist the two outdated articles**

Add to both article metadata definitions that can override parent metadata:

```ts
robots: { index: false, follow: true },
```

Remove `/blog/top-vgc-2026-pokemon` and `/blog/vgc-2026-guide` from `app/sitemap.ts` and remove their cards from `app/blog/page.tsx`. Do not delete the routes or historical content.

- [ ] **Step 5: Verify source claims and the HTTP behavior**

```powershell
rg -n "current VGC|Regulation F allows|VGC 2026 Reg F" app components config lib -g '*.ts' -g '*.tsx'
npm run build
npm run test:seo -- --check=vgc
```

Expected: source matches are limited to explicit `Legacy` or historical changelog contexts; HTTP check prints `PASS vgc`.

- [ ] **Step 6: Commit**

```powershell
git add config/formats.ts components/home/HeroSection.tsx app/tier-list app/guides/vgc app/blog app/sitemap.ts lib/i18n.tsx
git commit -m "fix(seo): label regulation f content as legacy"
```

### Task 7: Full Verification and External Handoff

**Files:**
- Modify only if verification exposes a regression in files already in scope.

**Interfaces:**
- Consumes: all preceding task outputs.
- Produces: verified local release evidence and an explicit external `www` blocker.

- [ ] **Step 1: Run all repository checks**

```powershell
npm run test:seo -- --check=all
npm run test:generations
npm run test:styles
npm run test:types
npx tsc --noEmit --noUnusedLocals --noUnusedParameters --allowUnreachableCode false --pretty false
npm run lint
npm run build
```

Expected: SEO and matrix tests pass; TypeScript passes; build passes. If ESLint reports pre-existing debt, confirm no error points to a changed line before proceeding.

- [ ] **Step 2: Crawl 20 Pokemon URLs from the local sitemap**

```powershell
$sitemap = (Invoke-WebRequest -Uri 'http://127.0.0.1:3007/sitemap.xml' -UseBasicParsing).Content
$pokemonUrls = [regex]::Matches($sitemap, '<loc>(https://poketeambuilder.com/pokemon/[^<]+)</loc>') |
  Select-Object -First 20 |
  ForEach-Object { $_.Groups[1].Value.Replace('https://poketeambuilder.com', 'http://127.0.0.1:3007') }
$pokemonUrls | ForEach-Object {
  $response = Invoke-WebRequest -Uri $_ -UseBasicParsing
  "{0}`t{1}" -f [int]$response.StatusCode, $_
}
```

Expected: 20 lines with status 200.

- [ ] **Step 3: Verify cache and raw HTML**

```powershell
curl.exe -sS -I http://127.0.0.1:3007/
curl.exe -sS http://127.0.0.1:3007/configurar | Select-String '<h1'
curl.exe -sS http://127.0.0.1:3007/tier-list | Select-String 'href="/pokemon/|temporarily unavailable'
```

Expected: root no longer has `private, no-cache, no-store` solely because of language selection; raw pages contain the expected content.

- [ ] **Step 4: Review the final diff**

```powershell
git diff HEAD~6 --stat
git diff HEAD~6 --check
git status --short --branch
```

Expected: only scoped SEO files and documentation; no untracked build/cache artifacts.

- [ ] **Step 5: Record the external `www` handoff in the final report**

Do not change application code for HTTP 526. Report these required external actions:

1. Add `www.poketeambuilder.com` to the Vercel project.
2. Point Cloudflare DNS to Vercel using Vercel's current displayed target.
3. Wait for Vercel to issue a valid certificate.
4. Configure 301/308 `www` to apex while preserving path/query.
5. Verify with `curl.exe -sS -I https://www.poketeambuilder.com/`.

- [ ] **Step 6: Request code review before any push**

Use `superpowers:requesting-code-review`, address confirmed issues, rerun the affected checks, and leave the implementation unpushed unless the user separately requests a push.
