/* eslint-disable @typescript-eslint/no-require-imports -- Node CommonJS regression runner. */
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");

const rootDir = path.resolve(__dirname, "..");
const read = (relativePath) =>
  fs.readFileSync(path.join(rootDir, relativePath), "utf8");

const utilsSource = read("lib/utils.ts");
const heuristicsSource = read("lib/builder/template-heuristics.ts");
const optimizerSource = read("lib/builder/set-optimizer.ts");

assert.match(
  utilsSource,
  /const ID_SANITIZE_RE\s*=\s*\/\[\^a-z0-9\]\+\/g/,
  "ID normalization should reuse a module-level regexp"
);
assert.match(
  utilsSource,
  /replace\(ID_SANITIZE_RE,\s*[\"']\s*[\"']\s*\)/,
  "toID should use the hoisted regexp"
);
assert.match(
  heuristicsSource,
  /TEMPLATE_ID_BY_LABEL\s*=\s*new Map/,
  "template IDs should use a precomputed label lookup"
);
assert.match(
  heuristicsSource,
  /new WeakMap<\s*PokemonSpecies,\s*CandidateStatProfile\s*>/,
  "candidate stat profiles should use an object-identity cache"
);
assert.match(
  optimizerSource,
  /TEMPLATE_MOVE_ID_SETS\s*=\s*\{/,
  "template move groups should be normalized once"
);
assert.match(
  optimizerSource,
  /hasTeamMoveInSet\(/,
  "template scoring should use normalized team-move sets"
);

const jiti = require("jiti")(__filename, {
  interopDefault: true,
  alias: {
    "@": rootDir,
    "@/": `${rootDir}${path.sep}`,
  },
});
const { toID } = jiti(path.join(rootDir, "lib/utils.ts"));
const { getCandidateStatProfile, getTemplateId } = jiti(
  path.join(rootDir, "lib/builder/template-heuristics.ts")
);
const { TEMPLATES } = jiti(path.join(rootDir, "config/templates.ts"));
const { DexProvider } = jiti(
  path.join(rootDir, "lib/data-sources/dex.ts")
);

for (const [templateId, template] of Object.entries(TEMPLATES)) {
  assert.equal(
    getTemplateId(template),
    templateId,
    `template label should resolve to ${templateId}`
  );
  assert.equal(
    getTemplateId({ label: template.label }),
    templateId,
    `cloned template label should resolve to ${templateId}`
  );
}

assert.equal(toID("King's Shield"), "kingsshield");
assert.equal(toID("Porygon-Z"), "porygonz");
assert.equal(toID("  Multiple   Spaces  "), "multiplespaces");

const species = DexProvider.getSpeciesForGen("Great Tusk", 9);
assert.ok(species, "the regression species should exist in the Gen 9 dex");
const expectedProfile = {
  bulk: species.baseStats.hp + species.baseStats.def + species.baseStats.spd,
  offense: species.baseStats.atk + species.baseStats.spa + species.baseStats.spe,
  maxOffense: Math.max(species.baseStats.atk, species.baseStats.spa),
  speed: species.baseStats.spe,
};
const firstProfile = getCandidateStatProfile(species);
assert.deepEqual(firstProfile, expectedProfile);
assert.strictEqual(
  getCandidateStatProfile(species),
  firstProfile,
  "repeated stat-profile reads should reuse the cached object"
);

console.log("Generator CPU contract checks passed.");
