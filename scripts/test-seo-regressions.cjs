/* eslint-disable @typescript-eslint/no-require-imports -- Node CommonJS regression runner. */
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");

const baseUrl = process.env.SEO_BASE_URL || "http://127.0.0.1:3007";
const selected = process.argv.find((arg) => arg.startsWith("--check="))?.split("=")[1] || "all";
const root = path.resolve(__dirname, "..");

async function get(pathname) {
  const response = await fetch(`${baseUrl}${pathname}`, { redirect: "manual" });
  return { response, text: await response.text() };
}

function count(html, pattern) {
  return [...html.matchAll(pattern)].length;
}

function escapeRegExp(value) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

async function checkPseo() {
  const competitiveSource = fs.readFileSync(path.join(root, "lib/competitive-sets.ts"), "utf8");
  assert.match(
    competitiveSource,
    /return getAvailableRoles\(displayName\)\.length > 0/,
    "published profiles must have roles that the page can render"
  );

  const expectedProfiles = new Map([
    ["/pokemon/garchomp", "Garchomp"],
    ["/pokemon/flutter-mane", "Flutter Mane"],
    ["/pokemon/great-tusk", "Great Tusk"],
    ["/pokemon/ogerpon-wellspring", "Ogerpon-Wellspring"],
  ]);

  for (const [pathname, displayName] of expectedProfiles) {
    const { response, text } = await get(pathname);
    assert.equal(response.status, 200, `${pathname} must return 200`);
    assert.match(
      text,
      new RegExp(`<h1[^>]*>\\s*${escapeRegExp(displayName)}\\s*</h1>`),
      `${pathname} must render its proper display name`
    );
    assert.match(text, /Competitive Roles/, `${pathname} must render competitive data`);
  }

  const legacySlug = await get("/pokemon/greattusk");
  assert.ok(
    (legacySlug.response.status === 308 &&
      legacySlug.response.headers.get("location") === "/pokemon/great-tusk") ||
      (legacySlug.response.status === 200 &&
        /http-equiv="refresh" content="0;url=\/pokemon\/great-tusk"/.test(legacySlug.text)),
    "legacy compound slugs must use Next.js permanent redirect semantics"
  );

  const { response, text } = await get("/sitemap.xml");
  assert.equal(response.status, 200, "/sitemap.xml must return 200");
  const pokemonUrls = [
    ...text.matchAll(/<loc>(https:\/\/poketeambuilder\.com\/pokemon\/[^<]+)<\/loc>/g),
  ].map((match) => match[1]);
  assert.equal(pokemonUrls.length, 300, "sitemap must contain 300 Pokemon profiles");
  assert.equal(new Set(pokemonUrls).size, 300, "Pokemon sitemap URLs must be unique");
  assert.ok(
    pokemonUrls.includes("https://poketeambuilder.com/pokemon/flutter-mane"),
    "sitemap must use the canonical Flutter Mane slug"
  );
  assert.ok(
    pokemonUrls.includes("https://poketeambuilder.com/pokemon/great-tusk"),
    "sitemap must use the canonical Great Tusk slug"
  );
  assert.ok(
    !pokemonUrls.includes("https://poketeambuilder.com/pokemon/greattusk"),
    "sitemap must not publish legacy compound slugs"
  );

  for (let offset = 0; offset < pokemonUrls.length; offset += 25) {
    const profiles = await Promise.all(
      pokemonUrls.slice(offset, offset + 25).map(async (url) => ({
        pathname: new URL(url).pathname,
        result: await get(new URL(url).pathname),
      }))
    );

    for (const { pathname, result } of profiles) {
      assert.equal(result.response.status, 200, `${pathname} must return 200`);
      assert.match(result.text, /Competitive Roles/, `${pathname} must render competitive roles`);
      assert.match(result.text, /Competitive Movesets/, `${pathname} must render competitive movesets`);
    }
  }
}

async function checkMetadata() {
  const { response, text } = await get("/");
  assert.equal(response.status, 200);
  assert.match(text, /<html[^>]+lang="en"/);
  assert.match(text, /Generate competitive Pokemon teams/i);
  assert.doesNotMatch(text, /Genera equipos Pokemon competitivos/i);
  assert.match(
    text,
    /<link[^>]+rel="canonical"[^>]+href="https:\/\/poketeambuilder\.com\/?"/
  );
}

async function checkConfigurar() {
  const { response, text } = await get("/configurar");
  assert.equal(response.status, 200);
  assert.equal(count(text, /<h1\b/gi), 1, "/configurar must render one H1");
  assert.match(text, /Generator Settings/);
  assert.match(text, /Configure your team preferences/);
}

async function checkContent() {
  const tierSource = fs.readFileSync(
    path.join(root, "app/tier-list/tier-list-page-client.tsx"),
    "utf8"
  );
  assert.match(
    tierSource,
    /const \[loading, setLoading\] = useState\(false\)/,
    "empty server tier data must render the fallback before hydration"
  );

  const pages = {};
  for (const pathname of ["/tier-list", "/guides/gen9-ou", "/guides/vgc"]) {
    const result = await get(pathname);
    pages[pathname] = result.text;
    assert.equal(result.response.status, 200, `${pathname} must return 200`);
    assert.equal(count(result.text, /<h1\b/gi), 1, `${pathname} must render one H1`);
  }

  assert.match(
    pages["/tier-list"],
    /href="\/pokemon\/|Live usage data is temporarily unavailable/,
    "/tier-list must render Pokemon links or an explicit server fallback"
  );

  for (const pathname of ["/guides/gen9-ou", "/guides/vgc"]) {
    assert.match(
      pages[pathname],
      /Top Threats|Live competitive data is temporarily unavailable/,
      `${pathname} must render meta content or an explicit fallback`
    );
  }
}

async function checkVgc() {
  const { text: guide } = await get("/guides/vgc");
  assert.doesNotMatch(guide, /current VGC regulation|Regulation F allows/i);
  assert.match(guide, /legacy/i);

  const { text: sitemap } = await get("/sitemap.xml");
  assert.doesNotMatch(sitemap, /blog\/(top-vgc-2026-pokemon|vgc-2026-guide)/);

  const { text: blog } = await get("/blog");
  assert.doesNotMatch(blog, /blog\/(top-vgc-2026-pokemon|vgc-2026-guide)/);

  for (const pathname of ["/blog/top-vgc-2026-pokemon", "/blog/vgc-2026-guide"]) {
    const { text } = await get(pathname);
    assert.match(text, /<meta[^>]+name="robots"[^>]+content="noindex, follow"/);
  }
}

async function checkCachePolicy() {
  const source = fs.readFileSync(path.join(root, "lib/data-sources/smogon.ts"), "utf8");
  assert.doesNotMatch(source, /cache:\s*["']no-store["']/, "Smogon fetches must not force ISR pages dynamic");
  assert.match(
    source,
    /const CACHE_TTL = 1000 \* 60 \* 60;/,
    "the application cache must honor the one-hour freshness contract"
  );
  assert.equal(
    count(source, /next:\s*{\s*revalidate:\s*3600\s*}/g),
    3,
    "all three Smogon upstream fetches must use one-hour revalidation"
  );
}

async function checkAdsenseReadiness() {
  const scripts = fs.readFileSync(path.join(root, "components/ConsentAwareScripts.tsx"), "utf8");
  const ads = fs.readFileSync(path.join(root, "components/monetization/Ads.tsx"), "utf8");
  const consent = fs.readFileSync(path.join(root, "lib/consent.ts"), "utf8");
  const banner = fs.readFileSync(path.join(root, "components/CookieConsent.tsx"), "utf8");
  const settings = fs.readFileSync(path.join(root, "components/CookieSettings.tsx"), "utf8");
  const analytics = fs.readFileSync(path.join(root, "lib/analytics.tsx"), "utf8");
  const webVitals = fs.readFileSync(path.join(root, "components/WebVitalsTracker.tsx"), "utf8");
  const privacy = fs.readFileSync(path.join(root, "app/privacy/page.tsx"), "utf8");
  const envExample = fs.readFileSync(path.join(root, ".env.local.example"), "utf8");
  const design = fs.readFileSync(path.join(root, "docs/superpowers/specs/2026-07-17-adsense-readiness-design.md"), "utf8");
  const plan = fs.readFileSync(path.join(root, "docs/superpowers/plans/2026-07-17-adsense-readiness.md"), "utf8");

  assert.match(scripts, /<AdSenseLoader\s*\/>/, "AdSense must load so Google CMP can render");
  assert.doesNotMatch(scripts, /hasAdvertising|Infolinks|Ezoic/, "only AdSense may own advertising runtime");
  assert.doesNotMatch(ads, /hasConsent\(["']advertising["']\)|ezoic|infolinks/i);
  assert.doesNotMatch(consent, /["']advertising["']\s*\||advertising:\s*boolean|advertising:\s*(true|false)/);
  assert.doesNotMatch(banner + settings, /["']advertising["']/);
  assert.doesNotMatch(consent, /["']preferences["']\s*\||preferences:\s*boolean|preferences:\s*(true|false)/);
  assert.doesNotMatch(banner + settings, /["']preferences["']|preference storage/i);
  assert.match(
    consent,
    /gtag\("consent",\s*"update",\s*{\s*analytics_storage:/,
    "local analytics changes must update Google Consent Mode"
  );
  assert.equal(
    count(consent, /updateAnalyticsConsent\(/g),
    3,
    "both local consent setters must update Google Consent Mode"
  );
  assert.match(
    analytics,
    /function trackPageView\([^)]*\)\s*{\s*if \(!hasConsent\("analytics"\)\) return;/,
    "pageviews must check current analytics consent"
  );
  assert.match(
    analytics,
    /function trackEvent\([^)]*\)\s*{\s*if \(!hasConsent\("analytics"\)\) return;/,
    "events must check current analytics consent"
  );
  assert.match(
    webVitals,
    /function sendToAnalytics\([^)]*\)\s*{\s*if \(!hasConsent\("analytics"\)\) return;/,
    "Web Vitals must check current analytics consent at send time"
  );
  assert.match(
    webVitals,
    /addEventListener\("consentChanged"/,
    "Web Vitals must activate when analytics consent changes after mount"
  );
  assert.match(privacy, /Google Privacy\s*&amp;\s*messaging|Google Privacy and messaging/);
  assert.match(privacy, /Last updated: July 17, 2026/);
  assert.match(privacy, /local cookie banner controls analytics only/i);
  assert.doesNotMatch(privacy, /will not load analytics or advertising scripts/i);
  assert.doesNotMatch(design + plan, /\bpreferences\b/i);
  assert.doesNotMatch(envExample, /Ezoic|Combina ambas redes/i);
}

const checks = {
  pseo: checkPseo,
  metadata: checkMetadata,
  configurar: checkConfigurar,
  content: checkContent,
  vgc: checkVgc,
  cache: checkCachePolicy,
  adsense: checkAdsenseReadiness,
};

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
