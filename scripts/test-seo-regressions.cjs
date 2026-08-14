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

function getTitle(html, pathname) {
  const match = html.match(/<title>([^<]+)<\/title>/i);
  assert.ok(match, `${pathname} must render a title`);
  return match[1];
}

function getMetaContent(html, attribute, value, pathname) {
  const tag = html.match(
    new RegExp(`<meta[^>]+${attribute}="${escapeRegExp(value)}"[^>]*>`, "i")
  )?.[0];
  assert.ok(tag, `${pathname} must render ${value}`);
  const content = tag.match(/content="([^"]+)"/i)?.[1];
  assert.ok(content, `${pathname} ${value} must have content`);
  return content;
}

function assertMetaDescriptionLength(html, pathname) {
  const description = getMetaContent(html, "name", "description", pathname);
  assert.ok(
    description.length >= 150 && description.length <= 160,
    `${pathname} meta description must be 150-160 characters (got ${description.length})`
  );
}

function getJsonLd(html) {
  return [...html.matchAll(/<script[^>]+type="application\/ld\+json"[^>]*>([\s\S]*?)<\/script>/gi)]
    .map((match) => JSON.parse(match[1]));
}

async function checkPseo() {
  const competitiveSource = fs.readFileSync(path.join(root, "lib/competitive-sets.ts"), "utf8");
  const profileSource = fs.readFileSync(
    path.join(root, "app/pokemon/[name]/page.tsx"),
    "utf8"
  );
  assert.match(
    competitiveSource,
    /return getAvailableRoles\(displayName\)\.length > 0/,
    "published profiles must have roles that the page can render"
  );
  assert.match(
    profileSource,
    /return competitiveNames\.map\(/,
    "static generation must include every competitive Pokemon"
  );
  assert.doesNotMatch(
    profileSource,
    /competitiveNames\.slice\(/,
    "static generation must not cap competitive Pokemon"
  );

  const expectedProfiles = new Map([
    ["/pokemon/garchomp", "Garchomp"],
    ["/pokemon/flutter-mane", "Flutter Mane"],
    ["/pokemon/great-tusk", "Great Tusk"],
    ["/pokemon/ogerpon-wellspring", "Ogerpon-Wellspring"],
    ["/pokemon/pelipper", "Pelipper"],
    ["/pokemon/rillaboom", "Rillaboom"],
    ["/pokemon/roaring-moon", "Roaring Moon"],
    ["/pokemon/zamazenta", "Zamazenta"],
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
    assert.match(text, /Competitive Movesets/, `${pathname} must render competitive movesets`);
  }

  for (const pathname of ["/pokemon/abra", "/pokemon/abomasnow-mega"]) {
    const { text } = await get(pathname);
    assert.match(text, /<meta[^>]+name="robots"[^>]+content="noindex"/, `${pathname} must be noindex`);
    assert.doesNotMatch(text, /<link[^>]+rel="canonical"/, `${pathname} must not self-canonicalize`);
  }

  const profile = await get("/pokemon/garchomp");
  const profileLd = getJsonLd(profile.text).find((entry) => entry["@type"] === "WebPage");
  assert.ok(profileLd, "Pokemon profiles must render WebPage JSON-LD");
  assert.ok(
    profileLd.about && profileLd.about["@type"] === "Thing",
    "Pokemon profiles must annotate the species as a Thing, not an editorial Article"
  );
  assert.doesNotMatch(
    profile.text,
    /"@type":"Article"/,
    "Pokemon profiles must not be marked up as editorial Articles"
  );

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
  assert.doesNotMatch(text, /<(?:priority|changefreq)>/, "sitemap must omit ignored hints");
  for (const block of text.matchAll(/<url>([\s\S]*?)<\/url>/g)) {
    if (/\/(?:pokemon|teams)\//.test(block[1])) {
      assert.doesNotMatch(
        block[1],
        /<lastmod>/,
        "programmatic pages must not publish an invented last-modified date"
      );
    }
  }
  const pokemonUrls = [
    ...text.matchAll(/<loc>(https:\/\/poketeambuilder\.com\/pokemon\/[^<]+)<\/loc>/g),
  ].map((match) => match[1]);
  assert.ok(pokemonUrls.length > 300, "sitemap must not cap competitive Pokemon profiles at 300");
  assert.equal(
    new Set(pokemonUrls).size,
    pokemonUrls.length,
    "Pokemon sitemap URLs must be unique"
  );
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
  for (const slug of ["pelipper", "rillaboom", "roaring-moon", "zamazenta"]) {
    assert.ok(
      pokemonUrls.includes(`https://poketeambuilder.com/pokemon/${slug}`),
      `sitemap must include /pokemon/${slug}`
    );
  }

  const pokemonIndex = await get("/pokemon");
  assert.equal(pokemonIndex.response.status, 200, "/pokemon must return 200");
  const indexPokemonUrls = new Set(
    [...pokemonIndex.text.matchAll(/href="(\/pokemon\/[^"]+)"/g)]
      .map((match) => `https://poketeambuilder.com${match[1]}`)
  );
  assert.deepEqual(
    [...new Set(pokemonUrls)].sort(),
    [...indexPokemonUrls].sort(),
    "sitemap Pokemon URLs must match the complete Pokemon directory"
  );
  for (const url of pokemonUrls) {
    const pathname = new URL(url).pathname;
    assert.match(
      pokemonIndex.text,
      new RegExp(`href="${escapeRegExp(pathname)}"`),
      `/pokemon must link to ${pathname}`
    );
  }

}

async function checkMetadata() {
  const { response, text } = await get("/");
  assert.equal(response.status, 200);
  assert.match(text, /<html[^>]+lang="en"/);
  assert.equal(
    getTitle(text, "/"),
    "Competitive Pokemon Team Generator",
    "home title must match the primary search intent"
  );
  assert.match(text, /Generate competitive Pokemon teams/i);
  assert.doesNotMatch(text, /Genera equipos Pokemon competitivos/i);
  assert.match(
    text,
    /<h1[^>]*>\s*Competitive Pokemon Team Generator,/i,
    "the home H1 must state the primary search intent"
  );
  assert.ok(
    count(text, /href="\/pokemon-showdown-team-builder"/g) >= 2,
    "home must link to the Showdown builder from content and the footer"
  );
  assert.match(
    text,
    /<link[^>]+rel="canonical"[^>]+href="https:\/\/poketeambuilder\.com\/?"/
  );
  for (const [lang, href] of [
    ["en", "https://poketeambuilder.com"],
    ["es", "https://poketeambuilder.com/es"],
    ["x-default", "https://poketeambuilder.com"],
  ]) {
    assert.match(
      text,
      new RegExp(`<link[^>]+rel="alternate"[^>]+hrefLang="${lang}"[^>]+href="${href}/?"`, "i"),
      `/ must link to its ${lang} alternate`
    );
  }

  const spanishHome = await get("/es");
  assert.equal(spanishHome.response.status, 200, "/es must return 200");
  assert.match(spanishHome.text, /<main[^>]+lang="es"/, "/es content must declare Spanish");
  assert.match(
    spanishHome.text,
    /Generador de equipos (?:Pokémon|Pok&#xE9;mon) competitivos/i,
    "/es must render genuine Spanish content"
  );
  assert.match(
    spanishHome.text,
    /<link[^>]+rel="canonical"[^>]+href="https:\/\/poketeambuilder\.com\/es"/,
    "/es must self-canonicalize"
  );
  for (const [lang, href] of [
    ["en", "https://poketeambuilder.com"],
    ["es", "https://poketeambuilder.com/es"],
    ["x-default", "https://poketeambuilder.com"],
  ]) {
    assert.match(
      spanishHome.text,
      new RegExp(`<link[^>]+rel="alternate"[^>]+hrefLang="${lang}"[^>]+href="${href}/?"`, "i"),
      `/es must link to its ${lang} alternate`
    );
  }

  const sitemap = await get("/sitemap.xml");
  assert.match(sitemap.text, /<loc>https:\/\/poketeambuilder\.com\/es<\/loc>/);

  const routes = [
    "/about",
    "/tier-list",
    "/guides/gen9-ou",
    "/guides/vgc",
    "/pokemon-showdown-team-builder",
    "/privacy",
    "/terms",
    "/contact",
    "/changelog",
    "/configurar",
    "/pokemon",
    "/pokemon/garchomp",
    "/teams",
    "/teams/rain",
    "/blog",
    "/blog/best-rain-team-gen9-ou",
    "/blog/best-pokemon-gen9-ou",
    "/blog/how-to-build-competitive-team",
  ];

  for (const pathname of routes) {
    const page = await get(pathname);
    assert.equal(page.response.status, 200, `${pathname} must return 200`);
    const title = getTitle(page.text, pathname);
    assert.ok(title.length <= 60, `${pathname} title must be at most 60 characters`);
    assert.doesNotMatch(
      title,
      /\| Pokemon Team Generator$/,
      `${pathname} title must not repeat the site name`
    );
    assert.equal(
      getMetaContent(page.text, "property", "og:url", pathname),
      `https://poketeambuilder.com${pathname}`,
      `${pathname} must have a route-specific Open Graph URL`
    );
    assert.equal(
      getMetaContent(page.text, "property", "og:image", pathname),
      "https://poketeambuilder.com/og-image.png",
      `${pathname} must have an Open Graph image`
    );
    assert.equal(
      getMetaContent(page.text, "name", "twitter:image", pathname),
      "https://poketeambuilder.com/og-image.png",
      `${pathname} must have a Twitter image`
    );
    if (pathname === "/pokemon-showdown-team-builder") {
      assertMetaDescriptionLength(page.text, pathname);
    }
  }

  const breadcrumbCases = [
    ["/pokemon/garchomp", ["Home", "Pokemon", "Garchomp"]],
    ["/teams/rain", ["Home", "Team Archetypes", "Rain Teams"]],
  ];
  for (const [pathname, expectedNames] of breadcrumbCases) {
    const page = await get(pathname);
    const breadcrumb = getJsonLd(page.text)
      .find((entry) => entry["@type"] === "BreadcrumbList");
    assert.ok(breadcrumb, `${pathname} must render BreadcrumbList JSON-LD`);
    assert.deepEqual(
      breadcrumb.itemListElement.map((item) => item.name),
      expectedNames,
      `${pathname} must render the complete breadcrumb hierarchy`
    );
  }

  const rainPage = await get("/teams/rain");
  const rainArticle = getJsonLd(rainPage.text).find((entry) => entry["@type"] === "Article");
  assert.ok(rainArticle, "/teams/rain must render Article JSON-LD");
  assert.equal(
    rainArticle.dateModified,
    "2026-08-13",
    "archetype Articles must carry an explicit, static update date"
  );
}

async function checkConfigurar() {
  const { response, text } = await get("/configurar");
  assert.equal(response.status, 200);
  assert.equal(count(text, /<h1\b/gi), 1, "/configurar must render one H1");
  assert.match(text, /Generator Settings/);
  assert.match(text, /Configure your team preferences/);
  assert.ok(
    count(text, /href="\/pokemon-showdown-team-builder"/g) >= 2,
    "/configurar must link to the Showdown builder contextually and from the footer"
  );
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
  assert.ok(
    Buffer.byteLength(pages["/tier-list"], "utf8") < 500_000,
    "/tier-list must keep its server HTML below 500 KB"
  );
  assert.ok(
    new Set([...pages["/tier-list"].matchAll(/href="(\/pokemon\/[^"]+)"/g)].map((match) => match[1]))
      .size > 200,
    "/tier-list must preserve its crawlable Pokemon directory"
  );

  for (const pathname of ["/guides/gen9-ou", "/guides/vgc"]) {
    assert.match(
      pages[pathname],
      /Top Threats|Live competitive data is temporarily unavailable/,
      `${pathname} must render meta content or an explicit fallback`
    );
    assert.ok(
      Buffer.byteLength(pages[pathname], "utf8") < 250_000,
      `${pathname} must not serialize the full competitive dataset into HTML`
    );
    assert.match(
      pages[pathname],
      /Meta Snapshot/,
      `${pathname} must server-render the compact meta snapshot`
    );
    assert.doesNotMatch(
      pages[pathname],
      /"(?:rawCount|teammates|spreads)":/,
      `${pathname} must serialize only the overview fields used by the UI`
    );
    assert.doesNotMatch(
      pages[pathname],
      /"@type":"FAQPage"/,
      `${pathname} must not render hidden FAQ schema`
    );
    const format = pathname.split("/").at(-1);
    const guideSource = fs.readFileSync(
      path.join(root, "app/guides", format, `${format}-guide-client.tsx`),
      "utf8"
    );
    assert.doesNotMatch(guideSource, /FAQPage/, `${pathname} must not mark up hidden FAQ content`);
  }

  const compactMeta = await get("/api/meta-overview?format=gen9ou&limit=6");
  assert.equal(compactMeta.response.status, 200, "compact meta API request must return 200");
  assert.ok(
    JSON.parse(compactMeta.text).combined.length <= 6,
    "meta API must honor the requested result limit"
  );
}

async function checkVgc() {
  const { text: guide } = await get("/guides/vgc");
  assert.equal(count(guide, /<h1\b/gi), 1, "/guides/vgc must render one H1");
  assert.match(
    guide,
    /Reg I|Regulation I/i,
    "/guides/vgc must reference the current Regulation I format"
  );
  assert.match(
    guide,
    /Showdown/i,
    "/guides/vgc must reference Pokemon Showdown"
  );
  assert.match(
    guide,
    /Pokemon Champions/i,
    "/guides/vgc must distinguish the official Pokemon Champions circuit"
  );
  assert.doesNotMatch(
    guide,
    /current VGC regulation|Regulation F allows/i,
    "/guides/vgc must not present Regulation F as the current format"
  );
  assert.match(
    guide,
    /legacy/i,
    "/guides/vgc must label Regulation F as legacy"
  );
  assert.match(
    getTitle(guide, "/guides/vgc"),
    /Reg I/,
    "the VGC guide title must name Regulation I"
  );
  assertMetaDescriptionLength(guide, "/guides/vgc");
  assert.ok(
    count(guide, /href="\/pokemon-showdown-team-builder"/g) >= 2,
    "/guides/vgc must link to the Showdown builder contextually and from the footer"
  );

  const { response: landingResponse, text: landing } = await get(
    "/pokemon-showdown-team-builder"
  );
  assert.equal(landingResponse.status, 200, "landing must return 200");
  assert.equal(count(landing, /<h1\b/gi), 1, "landing must render one H1");
  assert.match(
    landing,
    /<h1[^>]*>\s*Pokemon Showdown Team Builder\s*<\/h1>/,
    "landing H1 must state the primary search intent"
  );
  assert.match(
    landing,
    /<link[^>]+rel="canonical"[^>]+href="https:\/\/poketeambuilder\.com\/pokemon-showdown-team-builder"/,
    "landing must self-canonicalize"
  );
  assert.equal(
    getMetaContent(
      landing,
      "property",
      "og:url",
      "/pokemon-showdown-team-builder"
    ),
    "https://poketeambuilder.com/pokemon-showdown-team-builder",
    "landing must have a route-specific Open Graph URL"
  );
  assert.match(
    landing,
    /href="\/configurar"/,
    "landing must include a CTA to the interactive builder"
  );
  const landingJsonLd = getJsonLd(landing);
  const faq = landingJsonLd.find((entry) => entry["@type"] === "FAQPage");
  assert.ok(faq, "landing must render FAQPage JSON-LD");
  assert.ok(
    Array.isArray(faq.mainEntity) && faq.mainEntity.length >= 3,
    "FAQPage must include the visible questions"
  );
  const webPage = landingJsonLd.find((entry) => entry["@type"] === "WebPage");
  assert.ok(webPage, "landing must render WebPage JSON-LD");
  const breadcrumb = landingJsonLd.find(
    (entry) => entry["@type"] === "BreadcrumbList"
  );
  assert.ok(breadcrumb, "landing must render BreadcrumbList JSON-LD");
  assert.match(
    landing,
    /What is a Pokemon Showdown team builder\?/,
    "FAQ content must be visible in the page, not only in schema"
  );

  const { text: sitemap } = await get("/sitemap.xml");
  assert.match(
    sitemap,
    /<loc>https:\/\/poketeambuilder\.com\/pokemon-showdown-team-builder<\/loc>/,
    "sitemap must include the landing page"
  );
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
