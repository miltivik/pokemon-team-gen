import { toID } from '../utils';

// Interfaces mapping the Smogon Chaos JSON structure
export interface ChaosData {
  info: {
    metagame: string;
    cutoff: number;
    cutoff_deviation: number;
    team_type: string;
    number_of_battles: number;
  };
  data: Record<string, ChaosMonData>;
}

export interface ChaosMonData {
  "Moves": Record<string, number>;
  "Teammates": Record<string, number>;
  "Abilities": Record<string, number>;
  "Items": Record<string, number>;
  "Spreads": Record<string, number>; // "Nature:HP/Atk/Def/SpA/SpD/Spe" -> usage
  "Tera Types"?: Record<string, number>;
  "usage": number; // Raw usage count usually, or weighted
  "Raw count": number;
}

// Normalized Data Structure for our App
export interface NormalizedSmogonData {
  pokemon: Record<string, NormalizedMonData>;
  meta: {
    format: string;
    totalBattles: number;
  };
}

export interface NormalizedMonData {
  name: string;
  usageRate: number; // 0.0 to 1.0
  teammates: Record<string, number>; // pokemonId -> correlation (-1.0 to 1.0 or probability)
  moves: Record<string, number>;
  items: Record<string, number>;
  abilities: Record<string, number>;
  teraTypes: Record<string, number>;
  spreads: Array<{
    nature: string;
    evs: number[];
    percentage: number;
  }>;
}

// In-memory cache
const cache: Map<string, NormalizedSmogonData> = new Map();
const cacheTime: Map<string, number> = new Map();
const CACHE_TTL = 1000 * 60 * 60 * 6; // 6 hours

// Helper to find valid URL
const BASE_URL = 'https://www.smogon.com/stats';

// Dates to check (Current + previous 6 months)
function getRecentMonths(): string[] {
  const dates = [];
  const now = new Date();
  for (let i = 1; i <= 6; i++) { // Start from previous month usually
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    dates.push(`${year}-${month}`);
  }
  return dates;
}

// Standard ratings to check
const RATINGS = [1760, 1695, 1500, 0];

export class SmogonDataSource {

  static async getStats(format: string): Promise<NormalizedSmogonData | null> {
    const cached = cache.get(format);
    if (cached && (Date.now() - (cacheTime.get(format) || 0) < CACHE_TTL)) {
      return cached;
    }

    // Try finding the data
    const chaosData = await this.fetchChaosData(format);
    if (!chaosData) return null;

    const normalized = this.normalize(chaosData, format);

    cache.set(format, normalized);
    cacheTime.set(format, Date.now());

    return normalized;
  }

  private static async fetchChaosData(format: string): Promise<ChaosData | null> {
    const months = getRecentMonths();

    // Hardcoded logic for known Gen9 formats to prioritize recent stats
    // Note: In a real app, we might want to configure this map externally
    const formatSlug = format.toLowerCase().replace(/[^a-z0-9]/g, '');

    for (const month of months) {
      const testUrl = `${BASE_URL}/${month}/chaos/${formatSlug}-0.json`;
      try {
          const headRes = await fetch(testUrl, { method: 'HEAD', cache: 'no-store' });
          if (!headRes.ok) continue;
      } catch (e) {
          continue;
      }

      for (const rating of RATINGS) {
        // https://www.smogon.com/stats/2024-11/chaos/gen9ou-1695.json
        const url = `${BASE_URL}/${month}/chaos/${formatSlug}-${rating}.json`;
        try {
          // console.log(`Trying to fetch ${url}...`);
          const res = await fetch(url, { cache: 'no-store' });
          if (res.ok) {
            const data = await res.json();
            // console.log(`Found stats for ${format} in ${month} (rating ${rating})`);
            return data as ChaosData;
          }
        } catch (e) {
            // Ignore errors, continue searching
        }
      }
    }

    // Fallback: Check for gen9ou specific if format is weird, or return null
    return null;
  }

  private static normalize(data: ChaosData, format: string): NormalizedSmogonData {
    const totalBattles = data.info.number_of_battles || 1000;
    const normalized: NormalizedSmogonData = {
      meta: {
        format,
        totalBattles
      },
      pokemon: {}
    };

    for (const [name, raw] of Object.entries(data.data)) {
      const id = toID(name);

      // Calculate real usage rate (approximate if raw usage not present, usually 'usage' in Chaos is weighted)
      // If 'usage' is < 1, it's a rate. If > 1, it's a count.
      let usageRate = raw.usage;
      if (usageRate > 1) {
          usageRate = usageRate / totalBattles;
      }

      // Normalize Spreads
      // Format key: "Nature:HP/Atk/Def/SpA/SpD/Spe"
      const spreads = Object.entries(raw.Spreads || {}).map(([key, val]) => {
         const [nature, evStr] = key.split(':');
         const evs = evStr ? evStr.split('/').map(Number) : [0,0,0,0,0,0];
         return {
           nature: nature || 'Serious',
           evs: evs.length === 6 ? evs : [0,0,0,0,0,0],
           percentage: val // usually raw count or weight
         };
      }).sort((a, b) => b.percentage - a.percentage);

      // Normalize Teammates
      // Chaos teammates are raw numbers (weighted or unweighted).
      // We want to know correlation.
      // P(A|B) = Count(A & B) / Count(B)
      // Here raw.Teammates[TeammateName] is roughly Count(A & B)
      const teammates: Record<string, number> = {};
      let totalTeammateWeight = 0;
      for (const tVal of Object.values(raw.Teammates || {})) totalTeammateWeight += tVal;

      for (const [tName, tVal] of Object.entries(raw.Teammates || {})) {
          // For simplicity in the MVP, we use the raw weight value as a synergy score relative to others
          // Ideally we'd calculate Lift or Jaccard index
          teammates[toID(tName)] = tVal;
      }

      normalized.pokemon[id] = {
        name,
        usageRate,
        teammates, // Map ID -> Score
        moves: raw.Moves || {}, // Already Name -> Usage
        items: raw.Items || {},
        abilities: raw.Abilities || {},
        teraTypes: raw["Tera Types"] || {},
        spreads
      };
    }

    return normalized;
  }
}
