/* eslint-disable @typescript-eslint/no-require-imports */
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");

const root = path.resolve(__dirname, "..");
const source = fs.readFileSync(path.join(root, "components", "TeamForm.tsx"), "utf8");

assert.match(source, /import \{ Loader2 \} from ["']lucide-react["']/);
assert.match(source, /aria-busy=\{isLoading\}/);
assert.match(source, /role="status"/);
assert.match(source, /animate-spin/);
assert.match(source, /disabled=\{isLoading\}/);
assert.match(source, /finally\s*\{[\s\S]*setLocalLoading\(false\)/);

console.log("Generation loading feedback regression checks passed.");
