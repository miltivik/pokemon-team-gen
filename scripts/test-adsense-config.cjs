/* eslint-disable @typescript-eslint/no-require-imports */
const assert = require("node:assert/strict");
const path = require("node:path");
const fs = require("node:fs");
const vm = require("node:vm");
const ts = require("typescript");

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

  checkConsent();

  console.log("PASS adsense-config");
}

function consentFixture() {
  const values = new Map();
  const scripts = new Set();
  const signals = [];
  let reloads = 0;
  const storage = {
    getItem: (key) => values.get(key) ?? null,
    setItem: (key, value) => values.set(key, value),
    removeItem: (key) => values.delete(key),
  };
  const document = {
    cookie: "ptb_region=other",
    getElementById: (id) => scripts.has(id) ? { id } : null,
  };
  const window = new EventTarget();
  window.gtag = (...args) => signals.push(args);
  window.location = { reload: () => { reloads += 1; } };
  const context = vm.createContext({ exports: {}, window, document, localStorage: storage, Event });
  const source = fs.readFileSync(path.join(rootDir, "lib/consent.ts"), "utf8");
  const compiled = ts.transpileModule(source, {
    compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2020 },
  });
  vm.runInContext(compiled.outputText, context);
  return { api: context.exports, values, scripts, storage, signals, context, reloads: () => reloads };
}

function checkConsent() {
  const fixture = consentFixture();
  const { api, values, scripts, context } = fixture;
  for (const stored of [
    "granted", "denied", "invalid json", "null", "[]",
    JSON.stringify({ analytics: true }),
    JSON.stringify({ analytics: true, timestamp: 0 }),
    JSON.stringify({ analytics: true, timestamp: "1" }),
  ]) {
    values.set(api.CONSENT_KEY, stored);
    assert.equal(api.hasConsent("analytics"), false, "malformed/legacy choices must fail closed");
  }

  values.set(api.CONSENT_KEY, JSON.stringify({ analytics: true, advertising: false, timestamp: 1 }));
  assert.equal(api.hasConsent("analytics"), true, "old valid analytics choice should migrate");
  values.set(api.CONSENT_KEY, "denied");
  assert.equal(api.getConsent(), "denied", "legacy denial remains a denial");

  api.setGranularConsent({ analytics: true });
  assert.equal(api.hasConsent("analytics"), true);
  assert.equal(fixture.reloads(), 0, "a first choice should not reload");
  scripts.add("ga4-script");
  api.setConsent("denied");
  assert.equal(fixture.reloads(), 1, "revoking loaded GA must reload");
  assert.equal(fixture.signals.at(-1)[2].analytics_storage, "denied");

  const beforeSync = fixture.reloads();
  api.syncConsentFromStorage({ key: "unrelated" });
  assert.equal(fixture.reloads(), beforeSync);
  api.syncConsentFromStorage({ key: api.CONSENT_KEY });
  assert.equal(fixture.reloads(), beforeSync + 1, "other tabs must stop a denied runtime");
  values.clear();
  api.syncConsentFromStorage({ key: null });
  assert.equal(api.getConsent(), "pending", "clearing storage removes permission");
  api.setConsent("pending");
  assert.equal(api.hasConsent("analytics"), false);

  const blocked = consentFixture();
  blocked.storage.getItem = () => { throw new Error("storage blocked"); };
  blocked.storage.setItem = () => { throw new Error("storage blocked"); };
  assert.equal(blocked.api.hasConsent("analytics"), false);
  blocked.api.setGranularConsent({ analytics: true });
  assert.equal(blocked.api.hasConsent("analytics"), true, "explicit choices work in memory");
  blocked.api.setConsent("denied");
  assert.equal(blocked.api.hasConsent("analytics"), false);

  const quota = consentFixture();
  quota.api.setConsent("granted");
  quota.storage.setItem = () => { throw new Error("quota exceeded"); };
  quota.scripts.add("ga4-script");
  quota.api.setConsent("denied");
  assert.equal(quota.values.has(quota.api.CONSENT_KEY), false, "failed writes must clear stale grants");
  assert.equal(quota.api.hasConsent("analytics"), false);
  assert.equal(quota.reloads(), 1);

  delete context.window;
  assert.equal(api.getConsent(), "pending");
  assert.equal(api.hasConsent("analytics"), false, "SSR must not grant consent");
  assert.doesNotThrow(() => api.setConsent("granted"));

  const scriptsSource = fs.readFileSync(path.join(rootDir, "components/ConsentAwareScripts.tsx"), "utf8");
  assert.doesNotMatch(scriptsSource, /useCategoryConsent\(["']advertising["']\)/, "local consent must not block Google CMP");
  const shell = fs.readFileSync(path.join(rootDir, "components/SiteShell.tsx"), "utf8");
  assert.match(shell, /id="adsense"[\s\S]*?adsbygoogle\.js\?client=/, "AdSense must load in the document head so Google CMP can render");
  const ads = fs.readFileSync(path.join(rootDir, "components/monetization/Ads.tsx"), "utf8");
  assert.doesNotMatch(ads, /useCategoryConsent\(["']advertising["']\)/, "Google CMP must own ad consent");
  const teamPage = fs.readFileSync(path.join(rootDir, "app/(site)/equipo/equipo-page-client.tsx"), "utf8");
  const skeleton = teamPage.split("function EquipoPageSkeleton()")[1].split("export function EquipoPageClient")[0];
  assert.doesNotMatch(skeleton, /<Ad(?:Hero|Banner|Inline)\b/, "loading screens must not request ads");
  const banner = fs.readFileSync(path.join(rootDir, "components/CookieConsent.tsx"), "utf8");
  assert.match(banner, /onClick=\{handleAcceptAnalytics\}/, "analytics must have an explicit accept action");
  assert.doesNotMatch(banner, /isConsentRequiredRegion/, "every new visitor must be asked");
  const settings = fs.readFileSync(path.join(rootDir, "components/CookieSettings.tsx"), "utf8");
  assert.match(settings, /openGoogleAdvertisingSettings/, "cookie settings must expose Google ad preferences");
}

run();
