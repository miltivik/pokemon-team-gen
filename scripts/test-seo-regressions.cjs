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

async function checkPseo() {
  const competitiveSource = fs.readFileSync(path.join(root, "lib/competitive-sets.ts"), "utf8");
  assert.match(
    competitiveSource,
    /return !!getPokemonSets\(displayName\)/,
    "hasCompetitiveData must reuse getPokemonSets"
  );

  for (const pathname of [
    "/pokemon/garchomp",
    "/pokemon/great-tusk",
    "/pokemon/ogerpon-wellspring",
  ]) {
    const { response } = await get(pathname);
    assert.equal(response.status, 200, `${pathname} must return 200`);
  }

  const { response, text } = await get("/sitemap.xml");
  assert.equal(response.status, 200, "/sitemap.xml must return 200");
  const pokemonUrls = [
    ...text.matchAll(/<loc>(https:\/\/poketeambuilder\.com\/pokemon\/[^<]+)<\/loc>/g),
  ].map((match) => match[1]);
  assert.equal(pokemonUrls.length, 300, "sitemap must contain 300 Pokemon profiles");
  assert.equal(new Set(pokemonUrls).size, 300, "Pokemon sitemap URLs must be unique");
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

  for (const pathname of ["/blog/top-vgc-2026-pokemon", "/blog/vgc-2026-guide"]) {
    const { text } = await get(pathname);
    assert.match(text, /<meta[^>]+name="robots"[^>]+content="noindex, follow"/);
  }
}

const checks = {
  pseo: checkPseo,
  metadata: checkMetadata,
  configurar: checkConfigurar,
  content: checkContent,
  vgc: checkVgc,
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
