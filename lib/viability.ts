import gen9ouStats from '../data/stats/gen9ou.json';

export interface UsageMon {
    name: string;
    usage: number;
}

const STATS_MAP: Record<string, UsageMon[]> = {
    'gen9ou': gen9ouStats,
};

/**
 * Gets a pool of viable Pokémon for a given format.
 * Currently supports 'gen9ou'. Fallback to top 100 if available.
 */
export function getViablePool(format: string): UsageMon[] {
    // Normalize format to match STATS_MAP keys if needed
    // For now, we only have data for gen9ou
    const stats = STATS_MAP[format];
    if (stats) return stats;

    // Return empty if no specific stats found
    return [];
}

/**
 * Selects a Pokémon name from the pool using weighted random selection.
 * Higher usage % means higher chance of being selected.
 */
export function weightedRandom(pool: (UsageMon | string)[]): string {
    if (pool.length === 0) return '';

    // If the pool is just names (strings), fallback to uniform random
    if (typeof pool[0] === 'string') {
        return pool[Math.floor(Math.random() * pool.length)] as string;
    }

    const usagePool = pool as UsageMon[];
    const totalWeight = usagePool.reduce((sum, mon) => sum + mon.usage, 0);
    let rand = Math.random() * totalWeight;

    for (const mon of usagePool) {
        rand -= mon.usage;
        if (rand <= 0) return mon.name;
    }

    return usagePool[0].name;
}
