/* eslint-disable @typescript-eslint/no-require-imports -- Node CommonJS regression runner. */
const assert = require("node:assert/strict");
const fs = require("node:fs");
const os = require("node:os");
const path = require("node:path");

const root = path.resolve(__dirname, "..");
const packageJson = JSON.parse(fs.readFileSync(path.join(root, "package.json"), "utf8"));

assert.equal(
  packageJson.scripts.postbuild,
  "node scripts/prepare-standalone.cjs",
  "postbuild must prepare the standalone artifact"
);
assert.equal(
  packageJson.scripts.start,
  "node .next/standalone/server.js",
  "start must run the supported standalone server"
);

const prepareScript = path.join(root, "scripts/prepare-standalone.cjs");
assert.ok(fs.existsSync(prepareScript), "standalone postbuild script must exist");

const { prepareStandalone } = require(prepareScript);
const fixture = fs.mkdtempSync(path.join(os.tmpdir(), "pokemon-standalone-"));

try {
  fs.mkdirSync(path.join(fixture, "public", "nested"), { recursive: true });
  fs.mkdirSync(path.join(fixture, ".next", "static", "chunks"), { recursive: true });
  fs.mkdirSync(path.join(fixture, ".next", "standalone"), { recursive: true });
  fs.writeFileSync(path.join(fixture, "public", "ads.txt"), "publisher");
  fs.writeFileSync(path.join(fixture, "public", "nested", "favicon.ico"), "icon");
  fs.writeFileSync(path.join(fixture, ".next", "static", "chunks", "app.js"), "chunk");

  prepareStandalone(fixture);

  assert.equal(
    fs.readFileSync(path.join(fixture, ".next", "standalone", "public", "ads.txt"), "utf8"),
    "publisher"
  );
  assert.equal(
    fs.readFileSync(
      path.join(fixture, ".next", "standalone", "public", "nested", "favicon.ico"),
      "utf8"
    ),
    "icon"
  );
  assert.equal(
    fs.readFileSync(
      path.join(fixture, ".next", "standalone", ".next", "static", "chunks", "app.js"),
      "utf8"
    ),
    "chunk"
  );
} finally {
  const resolvedFixture = path.resolve(fixture);
  assert.equal(path.dirname(resolvedFixture), path.resolve(os.tmpdir()));
  assert.ok(path.basename(resolvedFixture).startsWith("pokemon-standalone-"));
  fs.rmSync(resolvedFixture, { recursive: true, force: true });
}

console.log("PASS standalone");
