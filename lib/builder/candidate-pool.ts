import { FORMATS, type FormatId } from "@/config/formats";
import { getCompetitiveFormatProfile } from "@/lib/competitive-format-profile";
import { DexProvider, type PokemonSpecies } from "@/lib/data-sources/dex";
import type { NormalizedMonData, NormalizedSmogonData } from "@/lib/data-sources/smogon-types";
import { isAllowedInFormat } from "@/lib/format-rules";
import { isLegendaryOrParadoxSpecies } from "@/lib/pokemon-classification";
import { getCanonicalSpeciesId } from "@/lib/pokemon-forms";
import { toID } from "@/lib/utils";

export interface CandidatePoolOptions {
  data: NormalizedSmogonData;
  format: string;
  gen: number;
  currentTeam?: PokemonSpecies[];
  excludeLegendaries?: boolean;
  requiredType?: string | null;
}

export interface CandidatePoolEntry {
  species: PokemonSpecies;
  stats: NormalizedMonData;
  usageRate: number;
}

const REQUIRED_TYPE_TIER_WEIGHTS: Record<string, number> = {
  AG: 1.06,
  Uber: 1.04,
  OU: 1,
  UUBL: 0.97,
  UU: 0.94,
  RUBL: 0.91,
  RU: 0.88,
  NUBL: 0.85,
  NU: 0.82,
  PUBL: 0.79,
  PU: 0.76,
  ZUBL: 0.73,
  ZU: 0.7,
  NFE: 0.48,
  LC: 0.42,
};

function getRequiredTypePoolScore(
  species: PokemonSpecies,
  usageRate: number,
  allowLowTierFillers: boolean
) {
  const bst = Object.values(species.baseStats).reduce((sum, stat) => sum + stat, 0);
  const bulk =
    species.baseStats.hp + species.baseStats.def + species.baseStats.spd;
  const maxOffense = Math.max(species.baseStats.atk, species.baseStats.spa);
  const tierWeight =
    REQUIRED_TYPE_TIER_WEIGHTS[species.tier ?? ""] ??
    (species.tier === "NFE" ? 0.48 : species.tier === "LC" ? 0.42 : 0.64);

  let score = tierWeight * 1000;
  score += bst;
  score += bulk * 0.35;
  score += maxOffense * 0.45;
  score += species.baseStats.spe * 0.18;
  score += Math.log10(Math.max(usageRate, 0.000001) * 100000 + 1) * 90;

  if (species.types.length > 1) {
    score += 12;
  }
  if (species.evos && species.evos.length > 0) {
    score -= 180;
  }
  if (!allowLowTierFillers && (species.tier === "LC" || species.tier === "NFE")) {
    score -= 240;
  }

  return score;
}

export function buildCandidatePool(options: CandidatePoolOptions): CandidatePoolEntry[] {
  const currentIds = new Set(
    (options.currentTeam ?? []).map((pokemon) => getCanonicalSpeciesId(pokemon))
  );
  const requiredType = options.requiredType?.toLowerCase() ?? null;
  const validMons: CandidatePoolEntry[] = [];
  const isDoubles = FORMATS[options.format as FormatId]?.gameType === "doubles";
  const allowLowTierFillers = options.format.endsWith("lc");

  for (const stats of Object.values(options.data.pokemon)) {
    const species = DexProvider.getSpeciesForGen(stats.name, options.gen);
    if (!species) continue;
    if (currentIds.has(getCanonicalSpeciesId(species))) continue;
    if (options.gen === 9 && !isAllowedInFormat(species.name, options.format as FormatId)) continue;
    if (
      options.excludeLegendaries &&
      isLegendaryOrParadoxSpecies(species.name)
    ) {
      continue;
    }

    const hasRequiredType = requiredType
      ? species.types.some((type) => type.toLowerCase() === requiredType)
      : true;

    if (requiredType && !hasRequiredType) {
      continue;
    }

    if (!requiredType && stats.usageRate < 0.005) {
      continue;
    }

    validMons.push({
      species,
      stats,
      usageRate: stats.usageRate,
    });
  }

  if (!requiredType) {
    return validMons;
  }

  const maxRequiredTypePool = isDoubles ? 14 : 20;
  if (validMons.length <= maxRequiredTypePool) {
    return validMons;
  }

  return [...validMons]
    .sort(
      (left, right) =>
        getRequiredTypePoolScore(
          right.species,
          right.usageRate,
          allowLowTierFillers
        ) -
        getRequiredTypePoolScore(
          left.species,
          left.usageRate,
          allowLowTierFillers
        )
    )
    .slice(0, maxRequiredTypePool);
}

export function buildFullFormatCandidatePool(
  options: Omit<CandidatePoolOptions, "currentTeam">
) {
  const formatProfile = getCompetitiveFormatProfile(options.format);
  const allowLowTierFillers = options.format.endsWith("lc");
  const entries = buildCandidatePool({
    ...options,
    currentTeam: [],
  });

  return entries.filter(({ species }) => {
    if (formatProfile.isDoubles) {
      return true;
    }
    if (allowLowTierFillers) {
      return true;
    }
    return species.tier !== "LC" && species.tier !== "NFE";
  });
}

export function hasSpeciesInPool(
  entries: CandidatePoolEntry[],
  speciesName: string
) {
  const speciesId = toID(speciesName);
  return entries.some((entry) => toID(entry.species.name) === speciesId);
}
