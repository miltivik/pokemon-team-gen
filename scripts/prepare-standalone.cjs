/* eslint-disable @typescript-eslint/no-require-imports -- Node CommonJS build script. */
const fs = require("node:fs");
const path = require("node:path");

function prepareStandalone(root = path.resolve(__dirname, "..")) {
  const standalone = path.join(root, ".next", "standalone");
  fs.cpSync(path.join(root, "public"), path.join(standalone, "public"), { recursive: true });
  fs.cpSync(
    path.join(root, ".next", "static"),
    path.join(standalone, ".next", "static"),
    { recursive: true }
  );
}

if (require.main === module) prepareStandalone();

module.exports = { prepareStandalone };
