import { SmogonDataSource } from "./data-sources/smogon";
import type { NormalizedSmogonData } from "./data-sources/smogon-types";

const cachedDataV2: Map<string, Record<string, SmogonMonData>> = new Map();
const lastFetchTime: Map<string, number> = new Map();
const CACHE_TTL = 1000 * 60 * 60;

export interface SmogonMonData {
  name: string;
  rawCount: number;
  usage: number;
  abilities: Record<string, number>;
  items: Record<string, number>;
  moves: Record<string, number>;
  teammates: Record<string, number>;
  checks: Record<string, number>;
  spreads: Record<string, number>;
}

export interface TopPokemonMeta {
  name: string;
  usage: number;
  rawCount: number;
  rank: number;
}

export interface TieredPokemon {
  name: string;
  tier: TierRank;
  types: string[];
  bst: number;
  usage?: number;
}

export type TierRank = "S" | "A+" | "A" | "A-" | "B+" | "B" | "B-" | "C" | "D";

function normalizeData(
  data: NormalizedSmogonData | null
): Record<string, SmogonMonData> {
  if (!data) {
    return {};
  }

  return Object.fromEntries(
    Object.entries(data.pokemon).map(([key, mon]) => [
      key,
      {
        name: mon.name,
        rawCount: Math.round(mon.usageRate * data.meta.totalBattles),
        usage: mon.usageRate,
        abilities: mon.abilities,
        items: mon.items,
        moves: mon.moves,
        teammates: mon.teammates,
        checks: {},
        spreads: Object.fromEntries(
          mon.spreads.map((spread) => [
            `${spread.nature}:${spread.evs.join("/")}`,
            spread.percentage,
          ])
        ),
      } satisfies SmogonMonData,
    ])
  );
}

async function fetchSmogonStatsFromApi(format: string) {
  const response = await fetch(
    `/api/smogon-stats?format=${encodeURIComponent(format)}`,
    { cache: "no-store" }
  );

  if (!response.ok) {
    throw new Error(`Failed to fetch Smogon stats for ${format}`);
  }

  const rawData =
    (await response.json()) as NormalizedSmogonData | null;
  return normalizeData(rawData);
}

export async function getSmogonStats(
  format: string = "gen9ou"
): Promise<Record<string, SmogonMonData>> {
  const cached = cachedDataV2.get(format);
  const fetchTime = lastFetchTime.get(format) || 0;
  if (cached && Date.now() - fetchTime < CACHE_TTL) {
    return cached;
  }

  try {
    const data = typeof window === "undefined"
      ? normalizeData(await SmogonDataSource.getStats(format))
      : await fetchSmogonStatsFromApi(format);
    cachedDataV2.set(format, data);
    lastFetchTime.set(format, Date.now());
    return data;
  } catch {
    cachedDataV2.set(format, {});
    lastFetchTime.set(format, Date.now());
    return {};
  }
}

export async function getTopPokemonForMeta(
  format: string,
  limit: number = 20
): Promise<TopPokemonMeta[]> {
  const stats = await getSmogonStats(format);
  return Object.values(stats)
    .sort((a, b) => b.usage - a.usage)
    .slice(0, limit)
    .map((pokemon, index) => ({
      name: pokemon.name,
      usage: pokemon.usage,
      rawCount: pokemon.rawCount,
      rank: index + 1,
    }));
}

export async function getViableMons(format: string): Promise<string[]> {
  const stats = await getSmogonStats(format);
  return Object.values(stats)
    .filter((pokemon) => pokemon.usage >= 0.01)
    .map((pokemon) => pokemon.name);
}

export async function getTieredPokemon(format: string): Promise<TieredPokemon[]> {
  void format;
  return [];
}

export function classifyTier(usage: number): TierRank {
  if (usage >= 0.15) return "S";
  if (usage >= 0.1) return "A+";
  if (usage >= 0.07) return "A";
  if (usage >= 0.0452) return "A-";
  if (usage >= 0.0341) return "B+";
  if (usage >= 0.02) return "B";
  if (usage >= 0.01) return "B-";
  if (usage >= 0.005) return "C";
  return "D";
}
