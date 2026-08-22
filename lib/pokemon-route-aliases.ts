import fs from "node:fs";
import path from "node:path";

interface PokemonRouteRedirect {
  source: string;
  destination: string;
  permanent: true;
}

function getCompactPokemonSlug(name: string) {
  return name
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]/g, "");
}

function getPokemonSlug(name: string) {
  return name
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[â€™']/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

export function getPokemonRouteRedirects(): PokemonRouteRedirect[] {
  const redirects = new Map<string, PokemonRouteRedirect>();
  const dataRoot = path.join(process.cwd(), "data");
  const summaries = JSON.parse(
    fs.readFileSync(path.join(dataRoot, "pokemon-summaries.json"), "utf8")
  ) as Record<string, unknown>;
  const pokedex = JSON.parse(
    fs.readFileSync(path.join(dataRoot, "pokedex.json"), "utf8")
  ) as Record<string, { name?: string }>;
  const competitiveSets = JSON.parse(
    fs.readFileSync(path.join(dataRoot, "gen9-sets.json"), "utf8")
  ) as Record<string, unknown>;
  const competitiveIds = new Set(
    Object.keys(competitiveSets).map((name) => getCompactPokemonSlug(name))
  );

  for (const id of Object.keys(summaries)) {
    const name = pokedex[id]?.name || id;
    if (!competitiveIds.has(getCompactPokemonSlug(name))) {
      continue;
    }

    const canonicalSlug = getPokemonSlug(name);
    const compactSlug = getCompactPokemonSlug(name);
    if (!compactSlug || compactSlug === canonicalSlug) {
      continue;
    }

    redirects.set(`/pokemon/${compactSlug}`, {
      source: `/pokemon/${compactSlug}`,
      destination: `/pokemon/${canonicalSlug}`,
      permanent: true,
    });
  }

  return [...redirects.values()];
}
