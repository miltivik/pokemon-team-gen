import { getPokemonData } from "@/lib/showdown-data";

const EXCLUDED_TAGS = new Set([
  "Restricted Legendary",
  "Sub-Legendary",
  "Mythical",
  "Paradox",
]);

const PARADOX_PREFIXES = [
  "Iron ",
  "Scream ",
  "Flutter ",
  "Brute ",
  "Great ",
  "Sandy ",
  "Slither ",
  "Roaring ",
  "Walking ",
  "Gouging ",
  "Raging ",
];

const LEGENDARY_KEYWORDS = [
  "Mewtwo",
  "Lugia",
  "Ho-Oh",
  "Kyogre",
  "Groudon",
  "Rayquaza",
  "Dialga",
  "Palkia",
  "Giratina",
  "Reshiram",
  "Zekrom",
  "Kyurem",
  "Xerneas",
  "Yveltal",
  "Zygarde",
  "Cosmog",
  "Cosmoem",
  "Solgaleo",
  "Lunala",
  "Necrozma",
  "Zacian",
  "Zamazenta",
  "Eternatus",
  "Koraidon",
  "Miraidon",
];

function hasExcludedTags(tags?: string[]) {
  return tags?.some((tag) => EXCLUDED_TAGS.has(tag)) ?? false;
}

export function isRestrictedLegendarySpecies(name: string): boolean {
  const pokemon = getPokemonData(name);
  if (!pokemon) return false;

  if (pokemon.tags?.includes("Restricted Legendary")) return true;

  if (pokemon.baseSpecies) {
    const baseSpecies = getPokemonData(pokemon.baseSpecies);
    if (baseSpecies?.tags?.includes("Restricted Legendary")) return true;
  }

  return false;
}

export function isMythicalSpecies(name: string): boolean {
  const pokemon = getPokemonData(name);
  if (!pokemon) return false;

  if (pokemon.tags?.includes("Mythical")) return true;

  if (pokemon.baseSpecies) {
    const baseSpecies = getPokemonData(pokemon.baseSpecies);
    if (baseSpecies?.tags?.includes("Mythical")) return true;
  }

  return false;
}

export function isLegendaryOrParadoxSpecies(name: string): boolean {
  const pokemon = getPokemonData(name);
  if (!pokemon) return false;

  if (hasExcludedTags(pokemon.tags)) return true;

  if (pokemon.baseSpecies) {
    const baseSpecies = getPokemonData(pokemon.baseSpecies);
    if (hasExcludedTags(baseSpecies?.tags)) return true;
  }

  if (PARADOX_PREFIXES.some((prefix) => pokemon.name.startsWith(prefix))) {
    return true;
  }

  if (LEGENDARY_KEYWORDS.some((keyword) => pokemon.name.includes(keyword))) {
    return true;
  }

  return false;
}
