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
  getCompetitiveSetsFormatKey,
  resolveProviderFormatCandidates,
} = jiti(path.join(rootDir, "lib/data-sources/format-source-resolver.ts"));

assert.equal(
  getCompetitiveSetsFormatKey("gen9vgc2026regi"),
  "vgc2025",
  "Regulation I must use the repository's stored Regulation I set key"
);
assert.deepEqual(
  resolveProviderFormatCandidates("gen9vgc2026regi", "competitiveSets").candidates[0],
  { slug: "vgc2025", reason: "mapped" },
  "Regulation I must resolve to the explicit mapped static-set candidate"
);
assert.equal(
  getCompetitiveSetsFormatKey("gen9vgc2026f"),
  "vgc2025",
  "legacy Regulation F must keep its existing static-set fallback"
);

console.log("PASS format-source-resolver");
