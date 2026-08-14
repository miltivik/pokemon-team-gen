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
  getAdsenseSlot,
  normalizeAdsensePublisherId,
} = jiti(path.join(rootDir, "lib/adsense.ts"));

function run() {
  assert.equal(
    normalizeAdsensePublisherId("pub-1234567890123456"),
    "ca-pub-1234567890123456"
  );
  assert.equal(
    normalizeAdsensePublisherId("ca-pub-1234567890123456"),
    "ca-pub-1234567890123456"
  );
  assert.equal(getAdsenseSlot(undefined), "");
  assert.equal(getAdsenseSlot("  "), "");
  assert.equal(getAdsenseSlot("1234567890"), "1234567890");

  console.log("PASS adsense-config");
}

run();
