/**
 * Pikalytics Integration
 *
 * Pikalytics provides detailed Pokemon usage statistics and sometimes exposes
 * richer grouped set information than the Smogon chaos endpoint.
 */

import { getPrimaryProviderSlug } from "./data-sources/format-source-resolver";
import type { SmogonMonData } from "./smogon-stats";
import {
  getProperAbilityName,
  getProperItemName,
  getProperMoveName,
} from "./showdown-data";

const cachedDataV2: Map<string, PikalyticsData> = new Map();
const lastFetchTime: Map<string, number> = new Map();
const CACHE_TTL = 1000 * 60 * 60;

export interface PikalyticsPokemonData {
  name: string;
  usage: number;
  winRate: number | null;
  moves: Record<string, number>;
  abilities: Record<string, number>;
  items: Record<string, number>;
  teraTypes: Record<string, number>;
}

export interface PikalyticsData {
  format: string;
  pokemon: Record<string, PikalyticsPokemonData>;
  lastUpdated: string;
}

export async function getPikalyticsData(format: string): Promise<PikalyticsData> {
  const cached = cachedDataV2.get(format);
  const fetchTime = lastFetchTime.get(format) || 0;
  if (cached && Date.now() - fetchTime < CACHE_TTL) {
    return cached;
  }

  const pikalyticsFormat = getPrimaryProviderSlug(format, "pikalytics") || format;

  if (typeof window !== "undefined" || process.env.NEXT_PUBLIC_BASE_URL) {
    try {
      const baseUrl =
        typeof window !== "undefined"
          ? ""
          : process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000";
      const response = await fetch(
        `${baseUrl}/api/pikalytics?format=${pikalyticsFormat}`,
        { cache: "no-store" }
      );
      if (response.ok) {
        const data = await response.json();
        cachedDataV2.set(format, data);
        lastFetchTime.set(format, Date.now());
        return data;
      }
    } catch (error) {
      console.error("Pikalytics API fetch failed:", error);
    }
  }

  try {
    const proxyUrl = `https://api.allorigins.win/get?url=${encodeURIComponent(
      `https://pikalytics.com/pokedex/${pikalyticsFormat}`
    )}`;

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 3000);
    const response = await fetch(proxyUrl, { signal: controller.signal });
    clearTimeout(timeoutId);

    if (response.ok) {
      const json = await response.json();
      if (json.contents) {
        const parsed = parsePikalyticsHTML(json.contents, format);
        if (parsed) {
          cachedDataV2.set(format, parsed);
          lastFetchTime.set(format, Date.now());
          return parsed;
        }
      }
    }
  } catch (error) {
    console.error("Pikalytics proxy fetch failed:", error);
  }

  return {
    format,
    pokemon: {},
    lastUpdated: new Date().toISOString(),
  };
}

function parsePikalyticsHTML(html: string, format: string): PikalyticsData | null {
  try {
    const data: PikalyticsData = {
      format,
      pokemon: {},
      lastUpdated: new Date().toISOString(),
    };

    const jsonMatch = html.match(/window\.pokedex\s*=\s*(\{[^]*?\})\s*;/);
    if (jsonMatch) {
      try {
        const pokedexData = JSON.parse(jsonMatch[1]);
        for (const [name, rawData] of Object.entries(pokedexData)) {
          const poke = rawData as {
            usage?: number;
            wins?: number;
            losses?: number;
            moves?: Record<string, number>;
            abilities?: Record<string, number>;
            items?: Record<string, number>;
            tera_types?: Record<string, number>;
          };

          const totalGames = (poke.wins || 0) + (poke.losses || 0);
          data.pokemon[name.toLowerCase()] = {
            name,
            usage: poke.usage || 0,
            winRate: totalGames > 0 ? ((poke.wins || 0) / totalGames) * 100 : null,
            moves: poke.moves || {},
            abilities: poke.abilities || {},
            items: poke.items || {},
            teraTypes: poke.tera_types || {},
          };
        }

        return data;
      } catch (parseError) {
        console.error("Failed to parse Pikalytics JSON:", parseError);
      }
    }

    const pokemonElements = html.match(/data-pokemon="[^"]+"/g);
    if (pokemonElements) {
      for (const element of pokemonElements) {
        try {
          const jsonStr = element.replace('data-pokemon="', "").replace('"', "");
          const pokeData = JSON.parse(decodeURIComponent(jsonStr)) as {
            pokemon?: string;
            name?: string;
            usage?: number;
            win_rate?: number | null;
            moves?: Record<string, number>;
            abilities?: Record<string, number>;
            items?: Record<string, number>;
            tera_types?: Record<string, number>;
          };

          const name = pokeData.pokemon || pokeData.name;
          if (!name) continue;

          data.pokemon[name.toLowerCase()] = {
            name,
            usage: pokeData.usage || 0,
            winRate: pokeData.win_rate ?? null,
            moves: pokeData.moves || {},
            abilities: pokeData.abilities || {},
            items: pokeData.items || {},
            teraTypes: pokeData.tera_types || {},
          };
        } catch {
          continue;
        }
      }

      if (Object.keys(data.pokemon).length > 0) {
        return data;
      }
    }

    return null;
  } catch (error) {
    console.error("Pikalytics parsing error:", error);
    return null;
  }
}

export async function getPokemonWinRate(
  pokemonName: string,
  format: string
): Promise<number | null> {
  const data = await getPikalyticsData(format);
  const normalizedName = pokemonName.toLowerCase().replace(/[- ]/g, "");

  for (const [key, pokeData] of Object.entries(data.pokemon)) {
    if (key.replace(/[- ]/g, "") === normalizedName) {
      return pokeData.winRate;
    }
  }

  return null;
}

export interface CombinedPokemonData {
  name: string;
  usage: number;
  winRate: number | null;
  topAbility: string | null;
  topItem: string | null;
  topMoves: string[];
}

export async function getCombinedStats(
  format: string
): Promise<CombinedPokemonData[]> {
  let smogonData: Record<string, SmogonMonData> = {};
  let pikalyticsData: PikalyticsData = {
    format,
    pokemon: {},
    lastUpdated: new Date().toISOString(),
  };

  try {
    const smogonModule = await import("./smogon-stats");
    smogonData = await smogonModule.getSmogonStats(format);
  } catch (error) {
    console.error("Failed to fetch Smogon stats:", error);
  }

  try {
    pikalyticsData = await getPikalyticsData(format);
  } catch (error) {
    console.error("Failed to fetch Pikalytics data:", error);
  }

  const combined: CombinedPokemonData[] = [];
  const totalUsage = Object.values(smogonData).reduce(
    (sum, pokemon) => sum + (pokemon.rawCount || 0),
    0
  );

  for (const [key, smogonMon] of Object.entries(smogonData)) {
    const usage =
      smogonMon.usage !== undefined
        ? smogonMon.usage * 100
        : totalUsage > 0
          ? ((smogonMon.rawCount || 0) / totalUsage) * 100
          : 0;

    let pikalyticsMon = pikalyticsData.pokemon[key];
    if (!pikalyticsMon) {
      const matchedKey = Object.keys(pikalyticsData.pokemon).find(
        (candidate) => candidate.startsWith(key) || key.startsWith(candidate)
      );
      if (matchedKey) {
        pikalyticsMon = pikalyticsData.pokemon[matchedKey];
      }
    }

    let topAbility =
      pikalyticsMon && Object.keys(pikalyticsMon.abilities).length > 0
        ? Object.entries(pikalyticsMon.abilities).sort((a, b) => b[1] - a[1])[0]?.[0]
        : smogonMon.abilities
          ? Object.entries(smogonMon.abilities).sort((a, b) => b[1] - a[1])[0]?.[0]
          : null;

    let topItem =
      pikalyticsMon && Object.keys(pikalyticsMon.items).length > 0
        ? Object.entries(pikalyticsMon.items).sort((a, b) => b[1] - a[1])[0]?.[0]
        : smogonMon.items
          ? Object.entries(smogonMon.items).sort((a, b) => b[1] - a[1])[0]?.[0]
          : null;

    let topMoves =
      pikalyticsMon && Object.keys(pikalyticsMon.moves).length > 0
        ? Object.entries(pikalyticsMon.moves)
            .sort((a, b) => b[1] - a[1])
            .slice(0, 4)
            .map(([move]) => move)
        : smogonMon.moves
          ? Object.entries(smogonMon.moves)
              .sort((a, b) => b[1] - a[1])
              .slice(0, 4)
              .map(([move]) => move)
          : [];

    if (topAbility) topAbility = getProperAbilityName(topAbility);
    if (topItem) topItem = getProperItemName(topItem);
    if (topMoves.length > 0) topMoves = topMoves.map((move) => getProperMoveName(move));

    combined.push({
      name: smogonMon.name || key,
      usage,
      winRate: pikalyticsMon?.winRate ?? null,
      topAbility: topAbility || null,
      topItem: topItem || null,
      topMoves: topMoves || [],
    });
  }

  return combined.sort((a, b) => (b.usage || 0) - (a.usage || 0));
}
