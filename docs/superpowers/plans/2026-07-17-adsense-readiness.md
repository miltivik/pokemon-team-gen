# AdSense Readiness Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Make the SEO recovery branch safe to deploy for an AdSense review by aligning server caching, using AdSense as the only ad network, and delegating advertising consent to Google CMP.

**Architecture:** Keep `SmogonDataSource` as the shared data path and replace its uncached fetches with the existing one-hour revalidation policy. Keep the local consent system only for analytics, load AdSense independently so Google CMP can establish TCF consent, and delete unused competing ad-network loaders.

**Tech Stack:** Next.js 16 App Router, React 19, TypeScript 5, Node.js regression runner, Google AdSense Privacy & messaging.

## Global Constraints

- Do not add dependencies or new cache abstractions.
- Google CMP owns advertising consent; local consent owns only analytics.
- AdSense is the only advertising provider loaded by application code.
- Do not add real manual slot IDs; placeholder units must remain disabled.
- Do not automate Dokploy, Cloudflare, or AdSense account changes from this repository.
- Preserve existing `noindex` behavior for empty/localStorage routes.

---

### Task 1: Align Smogon fetches with ISR

**Files:**
- Modify: `scripts/test-seo-regressions.cjs:140-146`
- Modify: `lib/data-sources/smogon.ts:192-205,249`
- Test: `scripts/test-seo-regressions.cjs`

**Interfaces:**
- Consumes: existing `SmogonDataSource.getStats(format: string)` callers and their one-hour cache policy.
- Produces: the unchanged `SmogonDataSource.getStats(format: string)` API with Next-compatible one-hour upstream revalidation.

- [ ] **Step 1: Add the failing cache-policy regression check**

Add this function before `const checks` in `scripts/test-seo-regressions.cjs`:

```js
async function checkCachePolicy() {
  const source = fs.readFileSync(path.join(root, "lib/data-sources/smogon.ts"), "utf8");
  assert.doesNotMatch(source, /cache:\s*["']no-store["']/, "Smogon fetches must not force ISR pages dynamic");
  assert.equal(
    count(source, /next:\s*{\s*revalidate:\s*3600\s*}/g),
    3,
    "all three Smogon upstream fetches must use one-hour revalidation"
  );
}
```

Add it to `checks`:

```js
const checks = {
  pseo: checkPseo,
  metadata: checkMetadata,
  configurar: checkConfigurar,
  content: checkContent,
  vgc: checkVgc,
  cache: checkCachePolicy,
};
```

- [ ] **Step 2: Run the focused check and verify RED**

Run:

```powershell
npm run test:seo -- --check=cache
```

Expected: FAIL with `Smogon fetches must not force ISR pages dynamic` because `smogon.ts` still contains `cache: "no-store"`.

- [ ] **Step 3: Replace the three uncached fetch options**

In `lib/data-sources/smogon.ts`, replace each `cache: "no-store"` option with the shared one-hour policy:

```ts
next: { revalidate: 3600 },
```

The HEAD request becomes:

```ts
const headRes = await fetch(baselineUrl, {
  method: "HEAD",
  next: { revalidate: 3600 },
});
```

The two GET requests become:

```ts
const res = await fetch(url, { next: { revalidate: 3600 } });
```

- [ ] **Step 4: Run the focused check and verify GREEN**

Run:

```powershell
npm run test:seo -- --check=cache
```

Expected: `PASS cache`.

- [ ] **Step 5: Run TypeScript for the fetch option**

Run:

```powershell
npx tsc --noEmit --pretty false
```

Expected: exit 0.

- [ ] **Step 6: Commit the cache fix**

```powershell
git add scripts/test-seo-regressions.cjs lib/data-sources/smogon.ts
git diff --cached --check
git commit -m "fix(seo): align smogon fetches with isr"
```

---

### Task 2: Make Google CMP the advertising consent owner

**Files:**
- Modify: `scripts/test-seo-regressions.cjs:140-147`
- Modify: `components/ConsentAwareScripts.tsx`
- Modify: `components/monetization/Ads.tsx:3-24,72-126`
- Modify: `lib/consent.ts`
- Modify: `components/CookieConsent.tsx:12-16,69-117,126`
- Modify: `components/CookieSettings.tsx:12-17,49`
- Modify: `app/privacy/page.tsx:50-85`
- Modify: `.env.local.example`
- Test: `scripts/test-seo-regressions.cjs`

**Interfaces:**
- Consumes: `hasConsent("analytics")`, the `ConsentAwareScripts` root-layout mount, and Google AdSense publisher `ca-pub-7981415143867065`.
- Produces: `ConsentCategory = "analytics"`, an unconditional AdSense loader for Google CMP, analytics-gated GA4, and no Infolinks/Ezoic runtime path.

- [ ] **Step 1: Add the failing monetization-policy regression check**

Add this function before `const checks` in `scripts/test-seo-regressions.cjs`:

```js
async function checkAdsenseReadiness() {
  const scripts = fs.readFileSync(path.join(root, "components/ConsentAwareScripts.tsx"), "utf8");
  const ads = fs.readFileSync(path.join(root, "components/monetization/Ads.tsx"), "utf8");
  const consent = fs.readFileSync(path.join(root, "lib/consent.ts"), "utf8");
  const banner = fs.readFileSync(path.join(root, "components/CookieConsent.tsx"), "utf8");
  const settings = fs.readFileSync(path.join(root, "components/CookieSettings.tsx"), "utf8");
  const privacy = fs.readFileSync(path.join(root, "app/privacy/page.tsx"), "utf8");
  const envExample = fs.readFileSync(path.join(root, ".env.local.example"), "utf8");

  assert.match(scripts, /<AdSenseLoader\s*\/>/, "AdSense must load so Google CMP can render");
  assert.doesNotMatch(scripts, /hasAdvertising|Infolinks|Ezoic/, "only AdSense may own advertising runtime");
  assert.doesNotMatch(ads, /hasConsent\(["']advertising["']\)|ezoic|infolinks/i);
  assert.doesNotMatch(consent, /["']advertising["']\s*\||advertising:\s*boolean|advertising:\s*(true|false)/);
  assert.doesNotMatch(banner + settings, /["']advertising["']/);
  assert.match(privacy, /Google Privacy\s*&amp;\s*messaging|Google Privacy and messaging/);
  assert.doesNotMatch(privacy, /will not load analytics or advertising scripts/i);
  assert.doesNotMatch(envExample, /Ezoic|Combina ambas redes/i);
}
```

Add it to `checks` after `cache`:

```js
adsense: checkAdsenseReadiness,
```

- [ ] **Step 2: Run the focused check and verify RED**

Run:

```powershell
npm run test:seo -- --check=adsense
```

Expected: FAIL with `AdSense must load so Google CMP can render` or `only AdSense may own advertising runtime`.

- [ ] **Step 3: Reduce the local consent model to analytics**

In `lib/consent.ts`, use this public shape:

```ts
export type ConsentCategory = "analytics";

export interface GranularConsent {
  analytics: boolean;
  timestamp: number;
}
```

Remove `advertising` from `DEFAULT_CONSENT`, parsed values, legacy granted/denied values, `setConsent`, `getConsentCategories`, and `CONSENT_CATEGORY_INFO`. `getConsent()` must resolve the local state with:

```ts
return consent.analytics ? "granted" : "denied";
```

Use this category list:

```ts
export function getConsentCategories(): ConsentCategory[] {
  return ["analytics"];
}
```

- [ ] **Step 4: Remove advertising from both local consent interfaces**

In `components/CookieConsent.tsx` and `components/CookieSettings.tsx`:

```ts
const [consent, setConsentState] = useState<GranularConsent>({
  analytics: false,
  timestamp: 0,
});
```

Replace both category arrays with:

```ts
(["analytics"] as ConsentCategory[])
```

Replace the introductory banner copy with:

```tsx
Choose whether to allow analytics. Language and theme storage are essential. Advertising choices are managed separately by Google Privacy &amp; messaging where required.{" "}
```

Rename the two main buttons to `Reject Optional` and `Accept Optional` so they do not claim to control advertising.

- [ ] **Step 5: Make AdSense independent and delete other ad loaders**

Reduce `components/ConsentAwareScripts.tsx` to the existing `useCategoryConsent`, `AdSenseLoader`, and `GA4Loader` functions. Delete `useConsent`, `InfolinksLoader`, and `EzoicLoader`. Return:

```tsx
export function ConsentAwareScripts() {
  return (
    <>
      <AdSenseLoader />
      <GA4Loader />
    </>
  );
}
```

Keep GA4's existing `hasConsent("analytics")` check.

- [ ] **Step 6: Remove obsolete ad-network and local advertising gates**

In `components/monetization/Ads.tsx`:

- delete the `hasConsent` import;
- delete `CONFIG.ezoic` and `CONFIG.infolinks`;
- delete `useAdvertisingConsent`;
- remove `hasAdvertising` from the `AdSlot` effect guard and dependency list.

The first effect guard becomes:

```ts
if (!hasConfiguredSlot || !mounted || pushedRef.current || !CONFIG.adsense.publisherId || !adRef.current) {
  return;
}
```

The dependency list becomes:

```ts
}, [hasConfiguredSlot, mounted]);
```

Do not change the placeholder-slot guard.

- [ ] **Step 7: Align privacy and environment documentation**

In `app/privacy/page.tsx`, state that:

- Google Privacy & messaging manages advertising consent where required;
- the local banner controls analytics only;
- rejecting optional local cookies prevents GA4 but does not replace Google's advertising choice;
- advertising cookies are governed by the Google CMP choice.

Remove the Ezoic section and the `Combina ambas redes` instruction from `.env.local.example`. Keep AdSense, GA4, bug-report, and Ko-fi variables unchanged.

- [ ] **Step 8: Run the focused check and verify GREEN**

Run:

```powershell
npm run test:seo -- --check=adsense
```

Expected: `PASS adsense`.

- [ ] **Step 9: Run compile and changed-file lint checks**

Run:

```powershell
npx tsc --noEmit --pretty false
npx eslint components/ConsentAwareScripts.tsx components/monetization/Ads.tsx components/CookieConsent.tsx components/CookieSettings.tsx lib/consent.ts app/privacy/page.tsx
```

Expected: both commands exit 0.

- [ ] **Step 10: Commit the AdSense readiness change**

```powershell
git add scripts/test-seo-regressions.cjs components/ConsentAwareScripts.tsx components/monetization/Ads.tsx components/CookieConsent.tsx components/CookieSettings.tsx lib/consent.ts app/privacy/page.tsx .env.local.example
git diff --cached --check
git commit -m "fix(adsense): prepare google cmp consent flow"
```

---

### Task 3: Verify the production artifact and prepare external handoff

**Files:**
- Modify: `package.json`
- Create: `scripts/prepare-standalone.cjs`
- Test: `scripts/test-standalone-build.cjs`
- Test: `scripts/test-seo-regressions.cjs`

**Interfaces:**
- Consumes: the completed cache and AdSense changes plus the existing SEO recovery branch.
- Produces: fresh release evidence and a concrete Dokploy/Cloudflare/AdSense dashboard checklist.

- [ ] **Step 1: Run all local static checks**

```powershell
npm run test:generations
npm run test:styles
npm run test:types
npm run test:standalone
npx tsc --noEmit --noUnusedLocals --noUnusedParameters --allowUnreachableCode false --pretty false
npx eslint scripts/test-seo-regressions.cjs scripts/test-standalone-build.cjs scripts/prepare-standalone.cjs components/ConsentAwareScripts.tsx components/monetization/Ads.tsx components/CookieConsent.tsx components/CookieSettings.tsx lib/consent.ts app/privacy/page.tsx lib/data-sources/smogon.ts
npm run build
```

Expected: standalone wiring, build, styles, types, TypeScript, and changed-file ESLint pass. If the known generation matrix failure remains, confirm it is the same pre-existing Gen 7 Doubles OU Mega legality case and not a changed path.

- [ ] **Step 2: Start the production build on port 3007**

```powershell
$env:PORT = '3007'
$env:HOSTNAME = '127.0.0.1'
npm start
```

Expected: `.next/standalone/server.js` reaches `Ready`. Keep the server output available for inspection.

- [ ] **Step 3: Run all HTTP regression checks**

In another PowerShell process:

```powershell
npm run test:seo -- --check=all
```

Expected: `PASS pseo`, `PASS metadata`, `PASS configurar`, `PASS content`, `PASS vgc`, `PASS cache`, and `PASS adsense`.

- [ ] **Step 4: Verify sitemap, profiles, cache, and scripts**

```powershell
$sitemap = (Invoke-WebRequest -Uri 'http://127.0.0.1:3007/sitemap.xml' -UseBasicParsing).Content
$locs = [regex]::Matches($sitemap, '<loc>(.*?)</loc>')
"total=$($locs.Count)"
"pokemon=$(($locs | ForEach-Object { $_.Groups[1].Value } | Where-Object { $_ -match '/pokemon/[^/]+$' }).Count)"
curl.exe -sS -o NUL -w "great-tusk=%{http_code}`n" http://127.0.0.1:3007/pokemon/great-tusk
curl.exe -sS -I http://127.0.0.1:3007/ | Select-String 'HTTP/|Cache-Control'
$homeHtml = (Invoke-WebRequest -Uri 'http://127.0.0.1:3007/' -UseBasicParsing).Content
"adsense=$([regex]::Matches($homeHtml, 'ca-pub-7981415143867065').Count)"
$cssPath = [regex]::Match($homeHtml, 'href="([^"]+\.css[^"]*)"').Groups[1].Value
$jsPath = [regex]::Match($homeHtml, 'src="([^"]+\.js[^"]*)"').Groups[1].Value
$fontPath = [regex]::Match($homeHtml, 'href="([^"]+\.woff2[^"]*)"').Groups[1].Value
curl.exe -sS -o NUL -w "css=%{http_code}`n" "http://127.0.0.1:3007$cssPath"
curl.exe -sS -o NUL -w "js=%{http_code}`n" "http://127.0.0.1:3007$jsPath"
curl.exe -sS -o NUL -w "font=%{http_code}`n" "http://127.0.0.1:3007$fontPath"
curl.exe -sS -o NUL -w "favicon=%{http_code}`n" http://127.0.0.1:3007/favicon.ico
$adsText = (Invoke-WebRequest -Uri 'http://127.0.0.1:3007/ads.txt' -UseBasicParsing).Content
if ($adsText -notmatch 'pub-7981415143867065') { throw 'ads.txt publisher missing' }
```

Expected: `total=330`, `pokemon=300`, `great-tusk=200`, a public cache header, at least one AdSense publisher marker, CSS/JS/font/favicon `200`, and `ads.txt` containing `pub-7981415143867065`.

- [ ] **Step 5: Inspect server output for the original regression**

Expected: no `Page changed from static to dynamic at runtime` entries after requesting `/tier-list`, `/guides/gen9-ou`, and `/guides/vgc`.

- [ ] **Step 6: Review final repository state**

```powershell
git diff master..HEAD --check
git status --short --branch
git log --oneline --decorate -6
```

Expected: clean worktree and only the scoped commits on `fix/technical-seo-recovery`.

- [ ] **Step 7: Execute the external release gate with the operator**

External steps, in order:

1. AdSense: enable the certified European regulations message under Privacy & messaging.
2. AdSense: enable Auto Ads and exclude `/equipo`, `/analisis`, `/exportar`, `/saved-teams`, and `/configurar`.
3. Git/Dokploy: merge or fast-forward the verified branch to the deployed branch and rebuild the application.
4. Dokploy/Cloudflare: add `www.poketeambuilder.com`, issue a valid certificate, and set a permanent `www` to apex redirect.
5. Public verification: confirm `https://www.poketeambuilder.com/` has valid TLS and returns 301/308 with `Location: https://poketeambuilder.com/`; confirm sitemap counts, profile `200`, legacy VGC `noindex`, Google CMP, one CSS and one JS URL under `/_next/static/` returning `200`, and `ads.txt` returning `200` with `pub-7981415143867065`.
6. AdSense: request review only after the site connection and `ads.txt` are reported valid.
