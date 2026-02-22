/**
 * Pikalytics Integration
 *
 * Pikalytics provides detailed Pokemon usage statistics including win rates,
 * which Smogon doesn't provide.
 *
 * Note: Pikalytics doesn't have a public API, so we use scraping or proxy approaches.
 * This library handles fetching data with fallbacks.
 */

import localGen9ouStats from '../data/stats/gen9ou.json';
import type { SmogonMonData } from './smogon-stats';
import { getProperItemName, getProperAbilityName, getProperMoveName } from './showdown-data';

// Cache for Pikalytics data
const cachedDataV2: Map<string, PikalyticsData> = new Map();
const lastFetchTime: Map<string, number> = new Map();
const CACHE_TTL = 1000 * 60 * 60; // 1 hour

export interface PikalyticsPokemonData {
    name: string;
    usage: number;
    winRate: number;
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

// Format mapping from our app to Pikalytics URLs
const PIKALYTICS_FORMAT_MAP: Record<string, string> = {
    'gen9ou': 'gen9ou',
    'gen9vgc2026f': 'gen9vgc2026regf',
    'gen9vgc': 'gen9vgc2026regf',
    'gen9doublesou': 'gen9vgc2026regf',
    'gen9uu': 'gen9uu',
    'gen9ubers': 'gen9ubers',
    'gen9monotype': 'gen9mono',
    // Gen 8 mappings
    'gen8doublesou': 'gen8vgc2021', // Best proxy for Gen 8 Doubles
    'gen8ou': 'gen8ou',
    'gen8ubers': 'gen8ubers',
    'gen8uu': 'gen8uu',
    'gen8monotype': 'gen8monotype',
};

/**
 * Fetch Pokemon usage data from Pikalytics for a specific format
 * Uses proxy approach to avoid CORS issues
 */
export async function getPikalyticsData(format: string): Promise<PikalyticsData> {
    // Check cache first
    const cached = cachedDataV2.get(format);
    const fetchTime = lastFetchTime.get(format) || 0;
    if (cached && (Date.now() - fetchTime < CACHE_TTL)) {
        return cached;
    }

    const pikalyticsFormat = PIKALYTICS_FORMAT_MAP[format] || format;

    // Try to fetch via our API route (which can handle CORS)
    // Only try internal API if running in browser or with base URL
    if (typeof window !== 'undefined' || (process.env.NEXT_PUBLIC_BASE_URL)) {
        try {
            const baseUrl = typeof window !== 'undefined' ? '' : (process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000');
            const response = await fetch(`${baseUrl}/api/pikalytics?format=${pikalyticsFormat}`, { cache: 'no-store' });
            if (response.ok) {
                const data = await response.json();
                cachedDataV2.set(format, data);
                lastFetchTime.set(format, Date.now());
                return data;
            }
        } catch (error) {
            console.error('Pikalytics API fetch failed:', error);
        }
    }

    // Fallback: Try direct fetch with CORS proxy
    try {
        const proxyUrl = `https://api.allorigins.win/get?url=${encodeURIComponent(`https://pikalytics.com/pokedex/${pikalyticsFormat}`)}`;
        console.log(`[DEBUG] Fetching Pikalytics via proxy: ${proxyUrl}`);

        // Timeout after 3 seconds to fail fast
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 3000);

        const response = await fetch(proxyUrl, { signal: controller.signal });
        clearTimeout(timeoutId);

        if (response.ok) {
            const json = await response.json();
            if (json.contents) {
                console.log(`[DEBUG] Proxy response received, length: ${json.contents.length}`);
                const parsed = parsePikalyticsHTML(json.contents, format);
                if (parsed) {
                    console.log(`[DEBUG] Parsed ${Object.keys(parsed.pokemon).length} mons from Pikalytics HTML`);
                    cachedDataV2.set(format, parsed);
                    lastFetchTime.set(format, Date.now());
                    return parsed;
                } else {
                    console.log(`[DEBUG] Failed to parse Pikalytics HTML`);
                }
            } else {
                console.log(`[DEBUG] Proxy response has no contents`);
            }
        } else {
            console.log(`[DEBUG] Proxy fetch failed with status ${response.status}`);
        }
    } catch (error) {
        console.error('Pikalytics proxy fetch failed:', error);
    }

    // Ultimate fallback: Return empty data (will use Smogon data instead)
    return {
        format,
        pokemon: {},
        lastUpdated: new Date().toISOString()
    };
}

/**
 * Parse Pikalytics HTML to extract Pokemon data
 * This is a basic parser - may need updates if Pikalytics changes structure
 */
function parsePikalyticsHTML(html: string, format: string): PikalyticsData | null {
    try {
        const data: PikalyticsData = {
            format,
            pokemon: {},
            lastUpdated: new Date().toISOString()
        };

        // Look for JSON data embedded in the page
        // Pikalytics typically embeds data in script tags or data attributes
        const jsonMatch = html.match(/window\.pokedex\s*=\s*(\{[^}]+\})/);

        if (jsonMatch) {
            try {
                const pokedexData = JSON.parse(jsonMatch[1]);

                // Extract relevant data for each Pokemon
                for (const [name, pokeData] of Object.entries(pokedexData)) {
                    const poke = pokeData as any;
                    data.pokemon[name.toLowerCase()] = {
                        name: name,
                        usage: poke.usage || 0,
                        winRate: poke.wins / (poke.wins + poke.losses) * 100 || 50,
                        moves: poke.moves || {},
                        abilities: poke.abilities || {},
                        items: poke.items || {},
                        teraTypes: poke.tera_types || {}
                    };
                }

                return data;
            } catch (parseError) {
                console.error('Failed to parse Pikalytics JSON:', parseError);
            }
        }

        // Alternative: Try to extract from data-pokemon attributes
        const pokemonElements = html.match(/data-pokemon="[^"]+"/g);
        if (pokemonElements) {
            for (const el of pokemonElements) {
                try {
                    const jsonStr = el.replace('data-pokemon="', '').replace('"', '');
                    const pokeData = JSON.parse(decodeURIComponent(jsonStr));

                    const name = pokeData.pokemon || pokeData.name;
                    if (name) {
                        data.pokemon[name.toLowerCase()] = {
                            name: name,
                            usage: pokeData.usage || 0,
                            winRate: pokeData.win_rate || 50,
                            moves: pokeData.moves || {},
                            abilities: pokeData.abilities || {},
                            items: pokeData.items || {},
                            teraTypes: pokeData.tera_types || {}
                        };
                    }
                } catch (e) {
                    // Skip invalid entries
                }
            }

            if (Object.keys(data.pokemon).length > 0) {
                return data;
            }
        }

        console.warn('Could not parse Pikalytics data from HTML');
        return null;
    } catch (error) {
        console.error('Pikalytics parsing error:', error);
        return null;
    }
}

/**
 * Get win rate for a specific Pokemon from Pikalytics
 */
export async function getPokemonWinRate(pokemonName: string, format: string): Promise<number | null> {
    const data = await getPikalyticsData(format);
    const normalizedName = pokemonName.toLowerCase().replace(/[- ]/g, '');

    for (const [key, pokeData] of Object.entries(data.pokemon)) {
        if (key.replace(/[- ]/g, '') === normalizedName) {
            return pokeData.winRate;
        }
    }

    return null;
}

/**
 * Get combined data with Smogon usage + Pikalytics win rates
 */
export async function getCombinedStats(format: string): Promise<CombinedPokemonData[]> {
    // Fetch both sources but handle failures independently
    let smogonData: Record<string, SmogonMonData> = {};
    let pikalyticsData: PikalyticsData = { format, pokemon: {}, lastUpdated: new Date().toISOString() };

    try {
        const smogonModule = await import('./smogon-stats');
        smogonData = await smogonModule.getSmogonStats(format);
    } catch (error) {
        console.error('Failed to fetch Smogon stats:', error);
    }

    try {
        pikalyticsData = await getPikalyticsData(format);
    } catch (error) {
        console.error('Failed to fetch Pikalytics data:', error);
    }

    const combined: CombinedPokemonData[] = [];

    // En versiones recientes, smogonData ya trae .usage como porcentaje directamente
    // pero si usamos rawCount, lo mantenemos por si acaso.
    const totalUsage = Object.values(smogonData).reduce((sum, m) => sum + (m.rawCount || 0), 0);

    for (const [key, smogonMon] of Object.entries(smogonData)) {
        // Usa el .usage directo si existe, si no, calcula desde rawCount
        const usage = smogonMon.usage !== undefined
            ? smogonMon.usage * 100
            : (totalUsage > 0 ? ((smogonMon.rawCount || 0) / totalUsage * 100) : 0);

        // Convertir key (ej. 'ironbundle') o usar startsWith para resolver variantes
        let pikalyticsMon = pikalyticsData.pokemon[key];

        if (!pikalyticsMon) {
            // Intentar buscar una coincidencia flexible (forma base para cosas como ogerpon)
            const matchedKey = Object.keys(pikalyticsData.pokemon).find(k => k.startsWith(key) || key.startsWith(k));
            if (matchedKey) {
                pikalyticsMon = pikalyticsData.pokemon[matchedKey];
            }
        }

        // Fallback a la data de Smogon si Pikalytics no da data de items/habilidades/movimientos
        let topAbility = pikalyticsMon && pikalyticsMon.abilities && Object.keys(pikalyticsMon.abilities).length > 0
            ? Object.entries(pikalyticsMon.abilities).sort((a, b) => b[1] - a[1])[0]?.[0]
            : (smogonMon.abilities ? Object.entries(smogonMon.abilities).sort((a, b) => b[1] - a[1])[0]?.[0] : null);

        let topItem = pikalyticsMon && pikalyticsMon.items && Object.keys(pikalyticsMon.items).length > 0
            ? Object.entries(pikalyticsMon.items).sort((a, b) => b[1] - a[1])[0]?.[0]
            : (smogonMon.items ? Object.entries(smogonMon.items).sort((a, b) => b[1] - a[1])[0]?.[0] : null);

        let topMoves = pikalyticsMon && pikalyticsMon.moves && Object.keys(pikalyticsMon.moves).length > 0
            ? Object.entries(pikalyticsMon.moves).sort((a, b) => b[1] - a[1]).slice(0, 4).map(m => m[0])
            : (smogonMon.moves ? Object.entries(smogonMon.moves).sort((a, b) => b[1] - a[1]).slice(0, 4).map(m => m[0]) : []);

        // Parse IDs to proper names
        if (topAbility) topAbility = getProperAbilityName(topAbility);
        if (topItem) topItem = getProperItemName(topItem);
        if (topMoves.length > 0) topMoves = topMoves.map(m => getProperMoveName(m));

        combined.push({
            name: smogonMon.name || key,
            usage: usage,
            winRate: pikalyticsMon?.winRate || null,
            topAbility: topAbility || null,
            topItem: topItem || null,
            topMoves: topMoves || []
        });
    }

    return combined.sort((a, b) => (b.usage || 0) - (a.usage || 0));
}

export interface CombinedPokemonData {
    name: string;
    usage: number;
    winRate: number | null;
    topAbility: string | null;
    topItem: string | null;
    topMoves: string[];
}
