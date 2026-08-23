/* eslint-disable @typescript-eslint/no-require-imports */
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");

const rootDir = path.resolve(__dirname, "..");
const read = (relativePath) =>
  fs.readFileSync(path.join(rootDir, relativePath), "utf8");

const smogonSource = read("lib/data-sources/smogon.ts");
const builderSource = read("lib/dynamic-builder.ts");
const feasibilitySource = read("lib/builder/generation-feasibility.ts");
const routeSource = read("app/(site)/api/generate-dynamic-team/route.ts");

assert.doesNotMatch(
  smogonSource,
  /next:\s*\{\s*revalidate:\s*3600\s*\}/,
  "raw Smogon responses must not use Next Data Cache revalidation"
);
assert.match(
  builderSource,
  /const \[data, archetypeHints\] = await Promise\.all\(/,
  "primary stats and optional VGC hints should start in parallel"
);
assert.match(
  feasibilitySource,
  /FEASIBILITY_CACHE_MAX_ENTRIES/,
  "generation feasibility should use a bounded cross-request cache"
);
assert.match(
  routeSource,
  /delete compactResult\.gameplan;[\s\S]*delete compactResult\.teamGuide;/,
  "the HTTP response should strip duplicated active-language guide fields"
);

const jiti = require("jiti")(__filename, {
  interopDefault: true,
  alias: {
    "@": rootDir,
    "@/": `${rootDir}${path.sep}`,
  },
});
const { generateDynamicTeam } = jiti(
  path.join(rootDir, "lib/dynamic-builder.ts")
);

async function main() {
  const result = await generateDynamicTeam({
    format: "gen9ou",
    templateId: "balanced",
    lang: "es",
    rngSeed: "generator-performance-contract",
  });

  assert.equal(result.team.length, 6, "the compact response must keep the full team");
  assert.ok(result.gameplan, "internal generator consumers keep the active gameplan");
  assert.ok(result.teamGuide, "internal generator consumers keep the active guide");
  assert.deepEqual(Object.keys(result.gameplanI18n).sort(), ["en", "es"]);
  assert.deepEqual(Object.keys(result.teamGuideI18n).sort(), ["en", "es"]);
  const spanishGuideText = JSON.stringify(result.teamGuideI18n.es);
  assert.doesNotMatch(
    spanishGuideText,
    /\b(?:Stealth Rock|Rapid Spin)\b/,
    "Spanish guide narratives must not leak canonical English hazard or removal move labels"
  );

  console.log("Generator performance contract checks passed.");
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
