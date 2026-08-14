/* eslint-disable @typescript-eslint/no-require-imports */
const assert = require("node:assert/strict");
const path = require("node:path");

const rootDir = path.resolve(__dirname, "..");
const jiti = require("jiti")(__filename, {
  interopDefault: true,
  alias: {
    "@": rootDir,
    "@/": `${rootDir}${path.sep}`,
  },
});

const {
  getFixedMembersFromSearchParams,
  resolveFixedMembers,
} = jiti(path.join(rootDir, "lib/team-generation-options.ts"));

function run() {
  assert.deepEqual(
    getFixedMembersFromSearchParams(
      new URLSearchParams("fixedPokemon=Garchomp&fixedPokemon=&fixedPokemon=Rotom-Wash")
    ),
    ["Garchomp", "Rotom-Wash"],
    "fixedPokemon query values should be trimmed and preserve order"
  );

  assert.deepEqual(
    resolveFixedMembers({ fixedMembers: ["Garchomp"] }),
    ["Garchomp"],
    "the canonical fixedMembers field should be accepted"
  );

  assert.deepEqual(
    resolveFixedMembers({ fijos: ["Blissey"] }),
    ["Blissey"],
    "the existing fijos field should remain compatible"
  );

  assert.deepEqual(
    resolveFixedMembers({ fijo: "Skarmory" }),
    ["Skarmory"],
    "the existing fijo field should remain compatible"
  );

  assert.equal(
    resolveFixedMembers({ fixedMembers: [], fijos: [], fijo: "  " }),
    null,
    "empty fixed-member inputs should become null"
  );

  console.log("PASS fixed-pokemon");
}

run();
