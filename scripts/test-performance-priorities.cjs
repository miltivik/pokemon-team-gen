/* eslint-disable @typescript-eslint/no-require-imports -- Node source-contract regression runner. */
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");

const root = path.resolve(__dirname, "..");
const read = (relativePath) =>
  fs.readFileSync(path.join(root, relativePath), "utf8");

const configurar = read("app/(site)/configurar/configurar-page-client.tsx");
const equipo = read("app/(site)/equipo/equipo-page-client.tsx");
const teamForm = read("components/TeamForm.tsx");
const webVitals = read("components/WebVitalsTracker.tsx");
const renderStart = configurar.indexOf("return (");
const formIndex = configurar.indexOf("<TeamForm", renderStart);
const heroIndex = configurar.indexOf("<AdHero", renderStart);
const bannerIndex = configurar.indexOf("<AdBanner", renderStart);

assert.ok(renderStart >= 0, "configurar page must have a render body");
assert.ok(formIndex > renderStart, "configurar page must render TeamForm");
assert.ok(
  heroIndex < 0 || formIndex < heroIndex,
  "TeamForm must render before the first hero ad"
);
assert.ok(
  bannerIndex < 0 || formIndex < bannerIndex,
  "TeamForm must render before the first banner ad"
);

assert.match(
  equipo,
  /import dynamic from ["']next\/dynamic["'];/,
  "team page must use next/dynamic for below-the-fold sections"
);
assert.match(
  equipo,
  /dynamic\(\s*\(\)\s*=>\s*import\(["']@\/components\/TeamExplanation["']\)/,
  "TeamExplanation must be split into a separate client chunk"
);
assert.match(
  equipo,
  /dynamic\(\s*\(\)\s*=>\s*import\(["']@\/components\/SimilarTeams["']\)/,
  "SimilarTeams must be split into a separate client chunk"
);

assert.match(
  teamForm,
  /import dynamic from ["']next\/dynamic["'];/,
  "TeamForm should split the Pokemon search control from the initial chunk"
);
assert.match(
  teamForm,
  /dynamic\(\s*\(\)\s*=>\s*import\(["']\.\/PokemonCombobox["']\)/,
  "PokemonCombobox should load as an interaction chunk"
);
assert.match(
  webVitals,
  /import\(["']web-vitals["']\)/,
  "web-vitals should load only after analytics consent"
);
assert.doesNotMatch(
  webVitals,
  /import\s*\{[^}]*onLCP[^}]*\}\s*from\s*["']web-vitals["']/,
  "web-vitals must not be part of the static client import"
);

console.log("Performance priority regressions passed.");
