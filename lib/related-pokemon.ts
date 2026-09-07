import {
  getAllPokemonNames,
  getPokemonDisplayName,
  getPokemonSummary,
} from "./pokemon-summary";
import { hasCompetitiveData } from "./competitive-sets";
import { getPokemonRole } from "./showdown-data";
import { getWeaknesses } from "./type-chart";
import { isAllowedInFormat } from "./format-rules";
import type { FormatId } from "@/config/formats";
import { getSmogonSourceInfo, getSmogonStats } from "./smogon-stats";
import type { SmogonSourceInfo } from "./data-sources/smogon-types";

/**
 * Build-time helpers for internal linking between Pokemon profile pages.
 *
 * Teammates come from real Smogon usage stats (co-occurrence weights) so the
 * links reflect the current meta. If stats are unavailable (e.g. offline
 * build), a deterministic static fallback based on shared role/type keeps the
 * sections populated and the build green.
 */

const TEAMMATES_FORMAT: FormatId = "gen9ou";

export interface RelatedPokemonResult {
  pokemon: string[];
  source: "smogon" | "heuristic";
  format: FormatId;
  sourceInfo: SmogonSourceInfo | null;
}

const teammatesIndexes = new Map<string, Record<string, string[]>>();

function baseStatTotal(summary: { baseStats: Record<string, number> }): number {
  return Object.values(summary.baseStats).reduce((a, b) => a + b, 0);
}

async function loadTeammatesIndex(format: FormatId): Promise<Record<string, string[]>> {
  const cached = teammatesIndexes.get(format);
  if (cached) return cached;

  const index: Record<string, string[]> = {};
  try {
    const stats = await getSmogonStats(format);
    for (const mon of Object.values(stats)) {
      const ranked = Object.entries(mon.teammates)
        .sort((a, b) => b[1] - a[1])
        .map(([teammateId]) => getPokemonDisplayName(teammateId))
        .filter((displayName): displayName is string => {
          if (!displayName) return false;
          return hasCompetitiveData(displayName) && isAllowedInFormat(displayName, format);
        })
        .slice(0, 8);

      const displayName = getPokemonDisplayName(mon.name) || mon.name;
      index[displayName] = ranked;
    }
  } catch {
    // Stats unavailable: callers fall back to static heuristics.
  }

  teammatesIndexes.set(format, index);
  return index;
}

function getStaticTeammates(name: string, format: FormatId, limit: number): string[] {
  const summary = getPokemonSummary(name);
  if (!summary) return [];

  const role = getPokemonRole(name);

  return getAllPokemonNames()
    .filter(
      (candidate) =>
        candidate !== name &&
        hasCompetitiveData(candidate) &&
        isAllowedInFormat(candidate, format)
    )
    .map((candidate) => {
      const candidateSummary = getPokemonSummary(candidate);
      if (!candidateSummary) return null;

      const sharesType = candidateSummary.types.some((type) =>
        summary.types.includes(type)
      );
      const sameRole = getPokemonRole(candidate) === role;

      return { candidate, sharesType, sameRole, bst: baseStatTotal(candidateSummary) };
    })
    .filter(
      (entry): entry is { candidate: string; sharesType: boolean; sameRole: boolean; bst: number } =>
        entry !== null && (entry.sharesType || entry.sameRole)
    )
    .sort(
      (a, b) =>
        Number(b.sharesType && b.sameRole) - Number(a.sharesType && a.sameRole) ||
        Number(b.sameRole) - Number(a.sameRole) ||
        b.bst - a.bst ||
        a.candidate.localeCompare(b.candidate)
    )
    .slice(0, limit)
    .map((entry) => entry.candidate);
}

/**
 * Pokemon that frequently appear on the same teams as `name` in real usage
 * data, falling back to a static role/type heuristic.
 */
export async function getTeammatesFor(
  name: string,
  format: FormatId,
  limit = 8
): Promise<RelatedPokemonResult> {
  const emptyResult: RelatedPokemonResult = {
    pokemon: [],
    source: "heuristic",
    format,
    sourceInfo: null,
  };
  if (!isAllowedInFormat(name, format)) return emptyResult;

  const index = await loadTeammatesIndex(format);
  const fromStats = index[name];

  if (fromStats && fromStats.length > 0) {
    return {
      pokemon: fromStats.slice(0, limit),
      source: "smogon",
      format,
      sourceInfo: getSmogonSourceInfo(format),
    };
  }

  return {
    pokemon: getStaticTeammates(name, format, limit),
    source: "heuristic",
    format,
    sourceInfo: getSmogonSourceInfo(format),
  };
}

/**
 * Pokemon whose STAB hits one of `name`'s weaknesses super effectively —
 * a deterministic, data-free approximation of "checks".
 */
export function getChecksFor(name: string, format: FormatId, limit = 6): string[] {
  const summary = getPokemonSummary(name);
  if (!summary || !isAllowedInFormat(name, format)) return [];

  const weaknesses = getWeaknesses(summary.types);
  if (weaknesses.length === 0) return [];

  return getAllPokemonNames()
    .filter(
      (candidate) =>
        candidate !== name &&
        hasCompetitiveData(candidate) &&
        isAllowedInFormat(candidate, format)
    )
    .map((candidate) => {
      const candidateSummary = getPokemonSummary(candidate);
      if (!candidateSummary) return null;

      const stabCoversWeakness = candidateSummary.types.some((type) =>
        weaknesses.includes(type)
      );
      if (!stabCoversWeakness) return null;

      return { candidate, bst: baseStatTotal(candidateSummary) };
    })
    .filter(
      (entry): entry is { candidate: string; bst: number } => entry !== null
    )
    .sort((a, b) => b.bst - a.bst || a.candidate.localeCompare(b.candidate))
    .slice(0, limit)
    .map((entry) => entry.candidate);
}

const POPULAR_FALLBACK = [
  "Great Tusk",
  "Kingambit",
  "Gholdengo",
  "Dragapult",
  "Iron Valiant",
  "Iron Moth",
  "Zamazenta",
  "Garganacl",
  "Dragonite",
  "Gliscor",
  "Samurott-Hisui",
  "Darkrai",
];

/**
 * Most used Pokemon in the current meta, for homepage internal links.
 * Falls back to a curated list of meta staples when stats are unavailable.
 */
export async function getPopularPokemon(limit = 12): Promise<string[]> {
  try {
    const stats = await getSmogonStats(TEAMMATES_FORMAT);
    const ranked = Object.values(stats)
      .sort((a, b) => b.usage - a.usage)
      .map((mon) => mon.name)
      .map((monName) => getPokemonDisplayName(monName))
      .filter((displayName): displayName is string => {
        if (!displayName) return false;
        return hasCompetitiveData(displayName) && isAllowedInFormat(displayName, TEAMMATES_FORMAT);
      })
      .slice(0, limit);

    if (ranked.length >= limit) return ranked;
  } catch {
    // Stats unavailable: fall through to the curated list.
  }

  return POPULAR_FALLBACK
    .filter((name) => hasCompetitiveData(name) && isAllowedInFormat(name, TEAMMATES_FORMAT))
    .slice(0, limit);
}
