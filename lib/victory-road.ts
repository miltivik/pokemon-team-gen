/**
 * Victory Road Integration
 *
 * Victory Road is used as a secondary VGC source for archetype and tournament
 * context. It should degrade cleanly when the source is not available.
 */

import { getPrimaryProviderSlug } from "./data-sources/format-source-resolver";

const cachedData: Map<string, VictoryRoadData> = new Map();
const lastFetchTime: Map<string, number> = new Map();
const CACHE_TTL = 1000 * 60 * 60 * 24;

export interface VictoryRoadPokemon {
  name: string;
  usage: number;
  winRate: number | null;
  topMoves: string[];
  topTeams: string[][];
}

export interface VictoryRoadMetaReport {
  format: string;
  title: string;
  date: string;
  topPokemon: VictoryRoadPokemon[];
  trends: {
    rising: string[];
    falling: string[];
    new: string[];
  };
  bestArchetypes: string[];
}

export interface VictoryRoadData {
  format: string;
  reports: VictoryRoadMetaReport[];
  lastUpdated: string;
}

export interface CombinedVGCData {
  name: string;
  usage: number;
  winRate: number | null;
  topMoves: string[];
  fromVictoryRoad: boolean;
}

export async function getVictoryRoadData(format: string): Promise<VictoryRoadData> {
  const cached = cachedData.get(format);
  const fetchTime = lastFetchTime.get(format) || 0;
  if (cached && Date.now() - fetchTime < CACHE_TTL) {
    return cached;
  }

  const vrFormat = getPrimaryProviderSlug(format, "victoryroad") || "vgc2026regf";

  if (typeof window === "undefined" && !process.env.NEXT_PUBLIC_BASE_URL) {
    return {
      format,
      reports: [],
      lastUpdated: new Date().toISOString(),
    };
  }

  try {
    const baseUrl =
      typeof window !== "undefined"
        ? ""
        : process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000";
    const response = await fetch(
      `${baseUrl}/api/victory-road?format=${vrFormat}`,
      { cache: "no-store" }
    );

    if (response.ok) {
      const data = await response.json();
      cachedData.set(format, data);
      lastFetchTime.set(format, Date.now());
      return data;
    }
  } catch (error) {
    console.error("Victory Road API fetch failed:", error);
  }

  return {
    format,
    reports: [],
    lastUpdated: new Date().toISOString(),
  };
}

export async function getLatestVGCMeta(
  format: string
): Promise<VictoryRoadMetaReport | null> {
  const data = await getVictoryRoadData(format);
  return data.reports?.[0] ?? null;
}

export async function getVGCRankings(
  format: string,
  limit: number = 20
): Promise<VictoryRoadPokemon[]> {
  const report = await getLatestVGCMeta(format);
  if (report?.topPokemon) {
    return report.topPokemon.slice(0, limit);
  }

  const { getTopPokemonForMeta } = await import("./smogon-stats");
  const smogonStats = await getTopPokemonForMeta(format, limit);
  return smogonStats.map((pokemon) => ({
    name: pokemon.name,
    usage: pokemon.usage,
    winRate: null,
    topMoves: [],
    topTeams: [],
  }));
}

export async function getVGCTrends(format: string): Promise<{
  rising: string[];
  falling: string[];
  new: string[];
}> {
  const report = await getLatestVGCMeta(format);
  return (
    report?.trends ?? {
      rising: [],
      falling: [],
      new: [],
    }
  );
}

export async function getVGCArchetypes(format: string): Promise<string[]> {
  const report = await getLatestVGCMeta(format);
  return report?.bestArchetypes ?? [];
}

export async function getCombinedVGCData(
  format: string
): Promise<CombinedVGCData[]> {
  const [vrRankings, smogonModule] = await Promise.all([
    getVGCRankings(format, 30),
    import("./smogon-stats"),
  ]);

  const smogonData = await smogonModule.getSmogonStats(format);
  const combined: CombinedVGCData[] = [];
  const totalUsage = Object.values(smogonData).reduce(
    (sum, pokemon) => sum + (pokemon.rawCount || 0),
    0
  );
  const usedNames = new Set<string>();

  for (const vrMon of vrRankings) {
    const smogonMon = smogonData[vrMon.name.toLowerCase()];
    const usage = smogonMon
      ? ((smogonMon.rawCount || 0) / Math.max(totalUsage, 1)) * 100
      : vrMon.usage;

    combined.push({
      name: vrMon.name,
      usage,
      winRate: vrMon.winRate,
      topMoves: vrMon.topMoves,
      fromVictoryRoad: true,
    });

    usedNames.add(vrMon.name.toLowerCase());
  }

  const smogonSorted = Object.values(smogonData).sort(
    (a, b) => (b.rawCount || 0) - (a.rawCount || 0)
  );

  for (const smogonMon of smogonSorted) {
    if (usedNames.has(smogonMon.name.toLowerCase()) || combined.length >= 50) {
      continue;
    }

    const usage =
      totalUsage > 0 ? ((smogonMon.rawCount || 0) / totalUsage) * 100 : 0;

    combined.push({
      name: smogonMon.name,
      usage,
      winRate: null,
      topMoves: Object.entries(smogonMon.moves || {})
        .sort((a, b) => b[1] - a[1])
        .slice(0, 4)
        .map(([move]) => move),
      fromVictoryRoad: false,
    });

    usedNames.add(smogonMon.name.toLowerCase());
  }

  return combined;
}
