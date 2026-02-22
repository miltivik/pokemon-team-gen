
import { getPokemonData } from './showdown-data';
import localGen9ouStats from '../data/stats/gen9ou.json';

// Cache the parsed data in memory — keyed by format
const cachedDataV2: Map<string, Record<string, SmogonMonData>> = new Map();
const lastFetchTime: Map<string, number> = new Map();
const CACHE_TTL = 1000 * 60 * 60; // 1 hour

export interface SmogonMonData {
    name: string;
    rawCount: number;
    usage: number; // Always normalized to 0-1 (e.g. 0.25 for 25%)
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

const BASE_URL = 'https://www.smogon.com/stats';

/**
 * Maps our app format IDs to the actual Smogon stats filenames.
 */
const FORMAT_FALLBACKS: Record<string, string[]> = {
    // Gen 9
    'gen9ou': ['gen9ou'],
    'gen9ubers': ['gen9ubers'],
    'gen9uu': ['gen9uu'],
    'gen9ru': ['gen9ru'],
    'gen9lc': ['gen9lc'],
    'gen9monotype': ['gen9monotype'],
    'gen9doublesou': ['gen9doublesou'],
    'gen9vgc2026f': ['gen9vgc2025regh', 'gen9vgc2024regf', 'gen9vgc2024regg', 'gen9doublesou', 'gen8vgc2019', 'gen7vgc'],
    // Gen 8
    'gen8ou': ['gen8ou', 'gen9ou'],
    'gen8ubers': ['gen8ubers', 'gen9ubers'],
    'gen8uu': ['gen8uu', 'gen9uu'],
    'gen8lc': ['gen8lc', 'gen9lc'],
    'gen8monotype': ['gen8monotype', 'gen9monotype', 'gen8ou'],
    'gen8doublesou': ['gen8doublesou', 'gen8vgc2021', 'gen8vgc2020', 'gen8ou', 'gen9doublesou'],
    // Gen 7
    'gen7ou': ['gen7ou', 'gen8ou', 'gen9ou'],
    'gen7ubers': ['gen7ubers', 'gen8ubers', 'gen9ubers'],
    'gen7uu': ['gen7uu', 'gen8uu', 'gen9uu'],
    'gen7lc': ['gen7lc', 'gen8lc', 'gen9lc'],
    'gen7monotype': ['gen7monotype', 'gen8monotype', 'gen9monotype', 'gen7ou'],
    'gen7doublesou': ['gen7doublesou', 'gen7ou', 'gen8doublesou', 'gen9doublesou'],
    // Gen 6
    'gen6ou': ['gen6ou', 'gen7ou', 'gen8ou', 'gen9ou'],
    'gen6ubers': ['gen6ubers', 'gen7ubers', 'gen8ubers', 'gen9ubers'],
    'gen6uu': ['gen6uu', 'gen7uu', 'gen8uu', 'gen9uu'],
    'gen6lc': ['gen6lc', 'gen7lc', 'gen8lc', 'gen9lc'],
    'gen6monotype': ['gen6monotype', 'gen7monotype', 'gen8monotype', 'gen9monotype', 'gen6ou'],
    // Gen 5
    'gen5ou': ['gen5ou'],
    'gen5ubers': ['gen5ou'],
    'gen5uu': ['gen5ou'],
    // Gen 4
    'gen4ou': ['gen4ou'],
    'gen4ubers': ['gen4ou'],
    'gen4uu': ['gen4ou'],
    // Gen 3
    'gen3ou': ['gen3ou'],
    'gen3ubers': ['gen3ou'],
    // Gen 2
    'gen2ou': ['gen2ou'],
    // Gen 1
    'gen1ou': ['gen1ou'],
};

/** Dates to try, newest first */
const DATES_TO_TRY = ['2026-01', '2025-12', '2025-11', '2025-10', '2025-09', '2025-08'];

/**
 * Rating tiers to try.
 */
const RATING_LEVELS = ['1695', '1825', '1760', '1630', '0'];

/**
 * Normalizes usage data to be a ratio (0-1) and structured as Record<string, SmogonMonData>
 */
function normalizeData(data: any): Record<string, SmogonMonData> {
    const normalized: Record<string, SmogonMonData> = {};

    // Si es formato chaos (tiene { info: {}, data: {} })
    const sourceData = (data && data.data && typeof data.data === 'object') ? data.data : data;

    if (Array.isArray(sourceData)) {
        sourceData.forEach(mon => {
            if (mon && mon.name) {
                let usage = typeof mon.usage === 'number' ? mon.usage : 0;
                if (usage > 1.0) usage = usage / 100;

                normalized[mon.name] = {
                    ...mon,
                    usage,
                    name: mon.name,
                    abilities: mon.Abilities || mon.abilities || {},
                    items: mon.Items || mon.items || {},
                    moves: mon.Moves || mon.moves || {},
                    teammates: mon.Teammates || mon.teammates || {},
                    checks: mon['Checks and Counters'] || mon.checks || {},
                    spreads: mon.Spreads || mon.spreads || {}
                };
            }
        });
    } else if (typeof sourceData === 'object' && sourceData !== null) {
        // If it's already a Record, iterate keys
        Object.keys(sourceData).forEach(key => {
            const mon = sourceData[key];
            if (mon && typeof mon === 'object') {
                const name = mon.name || key;
                let usage = typeof mon.usage === 'number' ? mon.usage : 0;
                if (usage > 1.0) usage = usage / 100;

                normalized[name] = {
                    ...mon,
                    usage,
                    name,
                    rawCount: mon['Raw count'] || mon.rawCount || 0,
                    abilities: mon.Abilities || mon.abilities || {},
                    items: mon.Items || mon.items || {},
                    moves: mon.Moves || mon.moves || {},
                    teammates: mon.Teammates || mon.teammates || {},
                    checks: mon['Checks and Counters'] || mon.checks || {},
                    spreads: mon.Spreads || mon.spreads || {}
                };
            }
        });
    }

    return normalized;
}

/**
 * Fetches and parses Smogon moveset data for a given format.
 */
export async function getSmogonStats(format: string = 'gen9ou'): Promise<Record<string, SmogonMonData>> {
    // Per-format caching
    const cached = cachedDataV2.get(format);
    const fetchTime = lastFetchTime.get(format) || 0;
    if (cached && (Date.now() - fetchTime < CACHE_TTL)) {
        return cached;
    }


    // Try fetching from our internal API
    try {
        const baseUrl = typeof window !== 'undefined' ? '' : (process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000');
        const response = await fetch(`${baseUrl}/api/smogon-stats?format=${format}`, { cache: 'no-store' });
        if (response.ok) {
            const rawData = await response.json();
            const data = normalizeData(rawData);
            cachedDataV2.set(format, data);
            lastFetchTime.set(format, Date.now());
            return data;
        }
    } catch (error) {
        console.warn(`Failed to fetch stats for ${format} from API, falling back to empty stats.`);
        cachedDataV2.set(format, {});
        lastFetchTime.set(format, Date.now());
    }

    return {};
}

export async function getTopPokemonForMeta(format: string, limit: number = 20): Promise<TopPokemonMeta[]> {
    const stats = await getSmogonStats(format);
    return Object.values(stats)
        .sort((a, b) => b.usage - a.usage)
        .slice(0, limit)
        .map((p, i) => ({
            name: p.name,
            usage: p.usage,
            rawCount: p.rawCount,
            rank: i + 1
        }));
}

export async function getViableMons(format: string): Promise<string[]> {
    const stats = await getSmogonStats(format);
    // Return pokemon with at least 1% usage (0.01)
    return Object.values(stats)
        .filter(p => p.usage >= 0.01)
        .map(p => p.name);
}

// Stub for Tier List functions if they are still imported somewhere I missed
export async function getTieredPokemon(format: string): Promise<TieredPokemon[]> {
    return [];
}

export function classifyTier(usage: number): TierRank {
    // Thresholds for usage ratio (0-1)
    if (usage >= 0.15) return "S";      // Top meta threats (15%+)
    if (usage >= 0.10) return "A+";     // Staples (10%+)
    if (usage >= 0.07) return "A";      // Common (7%+)
    if (usage >= 0.0452) return "A-";   // Standard OU cutoff (4.52%+)
    if (usage >= 0.0341) return "B+";   // Strong niche (3.41%+)
    if (usage >= 0.02) return "B";      // Niche (2%+)
    if (usage >= 0.01) return "B-";     // Rare niche (1%+)
    if (usage >= 0.005) return "C";     // Very rare (0.5%+)
    return "D";
}
