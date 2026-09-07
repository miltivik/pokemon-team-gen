/* eslint-disable @typescript-eslint/no-require-imports -- Node CommonJS regression runner. */
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");

const root = path.resolve(__dirname, "..");

function readJson(relativePath) {
  return JSON.parse(fs.readFileSync(path.join(root, relativePath), "utf8"));
}

function normalize(value) {
  return value
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]/g, "");
}

function parseManualMap(source, mapName) {
  const match = source.match(
    new RegExp(`const ${mapName}[^=]*= \\{([\\s\\S]*?)\\n\\};`)
  );
  const map = {};
  for (const entry of match?.[1]?.matchAll(/"([^"]+)"\s*:\s*"([^"]*)"/g) || []) {
    map[entry[1]] = entry[2];
  }
  return map;
}

function collectSetValues() {
  const sets = readJson("data/gen9-sets.json");
  const values = { moves: new Set(), abilities: new Set(), items: new Set() };
  const sourceFields = { moves: "moves", abilities: "ability", items: "item" };
  for (const pokemon of Object.values(sets)) {
    for (const tiers of Object.values(pokemon)) {
      for (const set of Object.values(tiers)) {
        for (const key of Object.keys(values)) {
          const value = set[sourceFields[key]];
          if (Array.isArray(value)) {
            value.flat(Infinity).forEach((entry) => values[key].add(entry));
          } else if (value) {
            values[key].add(value);
          }
        }
      }
    }
  }
  return values;
}

function getTranslation(name, category, generated, overrides, manual) {
  return (
    overrides[category]?.[name]?.name ||
    generated[category]?.[name]?.name ||
    manual[name] ||
    Object.entries(overrides[category] || {}).find(([key]) => normalize(key) === normalize(name))?.[1]?.name ||
    Object.entries(generated[category] || {}).find(([key]) => normalize(key) === normalize(name))?.[1]?.name ||
    Object.entries(manual).find(([key]) => normalize(key) === normalize(name))?.[1]
  );
}

function assertNoMojibake(relativePath) {
  const source = fs.readFileSync(path.join(root, relativePath), "utf8");
  assert.doesNotMatch(
    source,
    /[ÃÂâ�]/,
    `${relativePath} must not contain mojibake`
  );
}

function main() {
  const generated = readJson("data/translations-es.json");
  const overrides = readJson("data/translations-es-overrides.json");
  const showdownSource = fs.readFileSync(path.join(root, "lib/showdown-data.ts"), "utf8");
  const pokemonTranslationsSource = fs.readFileSync(
    path.join(root, "lib/pokemon-translations.ts"),
    "utf8"
  );
  const teamGuideSource = fs.readFileSync(path.join(root, "lib/team-guide.ts"), "utf8");
  const manual = {
    moves: parseManualMap(showdownSource, "MANUAL_MOVE_TRANSLATIONS"),
    abilities: parseManualMap(showdownSource, "MANUAL_ABILITY_TRANSLATIONS"),
    items: parseManualMap(showdownSource, "MANUAL_ITEM_TRANSLATIONS"),
  };

  const used = collectSetValues();
  for (const category of Object.keys(used)) {
    const missing = [...used[category]].filter(
      (name) => !getTranslation(name, category, generated, overrides, manual[category])
    );
    assert.deepEqual(missing, [], `${category} used by competitive sets must be translated`);
  }

  assert.ok(
    overrides.abilities?.Mountaineer?.desc,
    "custom ability overrides must include a Spanish description"
  );
  assert.equal(
    overrides.moves?.["Aqua Cutter"]?.name,
    "Tajo Acuático",
    "special moveset overrides must use the official Spanish move label"
  );
  assert.match(
    overrides.moves?.["Aqua Cutter"]?.desc || "",
    /probabilidad|golpe crítico/i,
    "special move overrides must include a Spanish description"
  );
  assert.equal(
    overrides.items?.["Ability Shield"]?.name,
    "Escudo Habilidad",
    "new competitive item overrides must use the Spanish label"
  );
  assert.equal(
    getTranslation("Stealth Rock", "moves", generated, overrides, manual.moves),
    "Trampa Rocas",
    "Stealth Rock must keep its official Spanish label"
  );
  assert.equal(
    getTranslation("Rapid Spin", "moves", generated, overrides, manual.moves),
    "Giro Rápido",
    "Rapid Spin must keep its official Spanish label"
  );
  assert.match(
    pokemonTranslationsSource,
    /export function translateCompetitiveText\(/,
    "Spanish guide text must have a shared competitive-label translation helper"
  );
  assert.match(
    teamGuideSource,
    /translateCompetitiveText\(/,
    "generated Spanish guides must pass their text through the shared translation helper"
  );

  for (const relativePath of [
    "data/translations-es.json",
    "data/translations-es-overrides.json",
    "lib/showdown-data.ts",
    "lib/pokemon-translations.ts",
  ]) {
    assertNoMojibake(relativePath);
  }

  const cardSource = fs.readFileSync(path.join(root, "components/PokemonCard.tsx"), "utf8");
  const detailsSource = fs.readFileSync(path.join(root, "components/PokemonDetailsPanel.tsx"), "utf8");
  const configurarSource = fs.readFileSync(
    path.join(root, "app/(site)/configurar/configurar-page-client.tsx"),
    "utf8"
  );
  const navbarSource = fs.readFileSync(path.join(root, "components/Navbar.tsx"), "utf8");
  const footerSource = fs.readFileSync(path.join(root, "components/Footer.tsx"), "utf8");
  const spanishTeamPage = path.join(root, "app/(es)/es/equipo/page.tsx");
  assert.ok(fs.existsSync(spanishTeamPage), "the Spanish generated-team route must exist");
  assert.match(configurarSource, /initialLang === "es" \? "\/es\/equipo"/);
  assert.match(navbarSource, /configurarPath = lang === "es" \? "\/es\/configurar"/);
  assert.match(navbarSource, /getLocalizedPath\(pathname/);
  assert.doesNotMatch(navbarSource, /setLang\(nextLang\)/);
  assert.match(footerSource, /href=\{lang === "es" \? "\/es\/configurar" : "\/configurar"\}/);
  assert.match(cardSource, /getTranslatedMoveLabel/);
  assert.match(cardSource, /getTranslatedItemLabel/);
  assert.match(detailsSource, /getTranslatedAbilityLabel/);
  assert.match(detailsSource, /getTranslatedCompetitiveSetLabel/);

  console.log(`PASS translations (${Object.values(used).reduce((sum, entries) => sum + entries.size, 0)} competitive values checked)`);
}

main();
