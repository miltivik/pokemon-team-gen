/**
 * Format Rules - Tier-based Pokemon filtering
 */

import { FormatId } from "@/config/formats";
import { getCompetitiveFormatProfile } from "@/lib/competitive-format-profile";
import { getCompetitiveSetsFormatKey } from "@/lib/data-sources/format-source-resolver";
import pokedexData from "@/data/pokedex.json";

type PokedexEntry = {
  tier?: string;
  tags?: string[];
  isNonstandard?: string;
};
const pokedex = pokedexData as Record<string, PokedexEntry>;

const TIER_ORDER: string[] = [
  "ZU",
  "ZUBL",
  "PU",
  "PUBL",
  "NU",
  "NUBL",
  "RU",
  "RUBL",
  "UU",
  "UUBL",
  "OU",
  "Uber",
  "AG",
];

function getTierCeiling(formatId: FormatId): string | null {
  const tierPart = formatId.replace(/^gen\d+/, "").toLowerCase();

  switch (tierPart) {
    case "ou":
      return "OU";
    case "uu":
      return "UU";
    case "ru":
      return "RU";
    case "nu":
      return "NU";
    case "pu":
      return "PU";
    case "zu":
      return "ZU";
    case "ubers":
      return "Uber";
    case "doublesou":
    case "monotype":
    case "lc":
      return null;
    default:
      return null;
  }
}

function getTierRank(tier: string): number {
  return TIER_ORDER.indexOf(tier);
}

export function isAllowedInFormat(
  pokemon: string | { name?: string | null },
  formatId: FormatId
): boolean {
  const pokemonName =
    typeof pokemon === "string" ? pokemon : pokemon?.name || "";
  const id = pokemonName.toLowerCase().replace(/[^a-z0-9]/g, "");
  const data = pokedex[id];

  if (!data) return false;

  const tier = data.tier as string | undefined;
  if (!tier) return false;
  if (tier === "Illegal" || tier.startsWith("CAP")) return false;
  if (data.isNonstandard === "Custom") return false;

  const formatProfile = getCompetitiveFormatProfile(formatId);
  const speciesTags = Array.isArray(data.tags) ? data.tags : [];
  if (
    formatProfile.forbiddenTags.some((tag) => speciesTags.includes(tag))
  ) {
    return false;
  }

  const tierPart = formatId.replace(/^gen\d+/, "").toLowerCase();
  if (tierPart === "lc") {
    return tier === "LC";
  }

  if (formatId === "gen9doublesou" && tier === "DUber") {
    return false;
  }

  const ceiling = getTierCeiling(formatId);
  if (ceiling === null) return true;

  const pokemonRank = getTierRank(tier);
  const ceilingRank = getTierRank(ceiling);

  if (pokemonRank === -1) {
    if (tier === "NFE") return true;
    if (tier === "LC") return true;
    return false;
  }

  return pokemonRank <= ceilingRank;
}

export function getSmogonTierKey(formatId: FormatId): string {
  return getCompetitiveSetsFormatKey(formatId) || "ou";
}
