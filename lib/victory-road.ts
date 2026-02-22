/**
 * Victory Road Integration
 * 
 * Victory Road (victoryroad.dev) provides VGC meta reports and analysis.
 * This library provides access to their data when available.
 * 
 * Note: Victory Road primarily provides articles/reports rather than raw stats API.
 */

import { SmogonMonData } from './smogon-stats';

// Cache for Victory Road data
const cachedData: Map<string, VictoryRoadData> = new Map();
const lastFetchTime: Map<string, number> = new Map();
const CACHE_TTL = 1000 * 60 * 60 * 24; // 24 hours - less frequent updates

export interface VictoryRoadPokemon {
    name: string;
    usage: number;
    winRate: number;
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

// Format mapping
const VR_FORMAT_MAP: Record<string, string> = {
    'gen9vgc2026f': 'vgc2026regf',
    'gen9vgc': 'vgc2026regf',
    'gen9doublesou': 'vgc2026regf',
};

/**
 * Fetch VGC meta reports from Victory Road
 */
export async function getVictoryRoadData(format: string): Promise<VictoryRoadData> {
    // Check cache first
    const cached = cachedData.get(format);
    const fetchTime = lastFetchTime.get(format) || 0;
    if (cached && (Date.now() - fetchTime < CACHE_TTL)) {
        return cached;
    }

    const vrFormat = VR_FORMAT_MAP[format] || 'vgc2026regf';

    // Try to fetch via API route
    try {
        const response = await fetch(`/api/victory-road?format=${vrFormat}`);
        if (response.ok) {
            const data = await response.json();
            cachedData.set(format, data);
            lastFetchTime.set(format, Date.now());
            return data;
        }
    } catch (error) {
        console.error('Victory Road API fetch failed:', error);
    }

    // Try direct fetch
    try {
        const response = await fetch(`https://victoryroad.dev/api/vgc/${vrFormat}/meta`);

        if (response.ok) {
            const data = await response.json();
            cachedData.set(format, data);
            lastFetchTime.set(format, Date.now());
            return data;
        }
    } catch (error) {
        console.error('Victory Road direct fetch failed:', error);
    }

    // Fallback: Return empty data
    return {
        format,
        reports: [],
        lastUpdated: new Date().toISOString()
    };
}

/**
 * Get the latest meta report for a format
 */
export async function getLatestVGCMeta(format: string): Promise<VictoryRoadMetaReport | null> {
    const data = await getVictoryRoadData(format);

    if (data.reports && data.reports.length > 0) {
        return data.reports[0];
    }

    return null;
}

/**
 * Get Pokemon rankings from Victory Road
 */
export async function getVGCRankings(format: string, limit: number = 20): Promise<VictoryRoadPokemon[]> {
    const report = await getLatestVGCMeta(format);

    if (report && report.topPokemon) {
        return report.topPokemon.slice(0, limit);
    }

    // Fallback to Smogon data
    const { getTopPokemonForMeta } = await import('./smogon-stats');
    const smogonStats = await getTopPokemonForMeta(format, limit);
    return smogonStats.map(p => ({
        name: p.name,
        usage: p.usage,
        winRate: 50,
        topMoves: [],
        topTeams: []
    }));
}

/**
 * Get trending Pokemon (rising/falling)
 */
export async function getVGCTrends(format: string): Promise<{
    rising: string[];
    falling: string[];
    new: string[];
}> {
    const report = await getLatestVGCMeta(format);

    if (report && report.trends) {
        return report.trends;
    }

    return {
        rising: [],
        falling: [],
        new: []
    };
}

/**
 * Get VGC team archetypes
 */
export async function getVGCArchetypes(format: string): Promise<string[]> {
    const report = await getLatestVGCMeta(format);

    if (report && report.bestArchetypes) {
        return report.bestArchetypes;
    }

    return [];
}

/**
 * Combine VGC data from Victory Road with Smogon data
 */
export async function getCombinedVGCData(format: string): Promise<CombinedVGCData[]> {
    const [vrRankings, smogonModule] = await Promise.all([
        getVGCRankings(format, 30),
        import('./smogon-stats')
    ]);

    const smogonData = await smogonModule.getSmogonStats(format);

    const combined: CombinedVGCData[] = [];
    const totalUsage = Object.values(smogonData).reduce((sum, m) => sum + (m.rawCount || 0), 0);
    const usedNames = new Set<string>();

    // First add VR data
    for (const vrMon of vrRankings) {
        const smogonMon = smogonData[vrMon.name.toLowerCase()];
        const usage = smogonMon ? ((smogonMon.rawCount || 0) / totalUsage * 100) : vrMon.usage;

        combined.push({
            name: vrMon.name,
            usage: usage,
            winRate: vrMon.winRate,
            topMoves: vrMon.topMoves,
            fromVictoryRoad: true
        });

        usedNames.add(vrMon.name.toLowerCase());
    }

    // Fill remaining from Smogon
    const smogonSorted = Object.values(smogonData)
        .sort((a, b) => (b.rawCount || 0) - (a.rawCount || 0));

    for (const smogonMon of smogonSorted) {
        if (!usedNames.has(smogonMon.name.toLowerCase()) && combined.length < 50) {
            const usage = totalUsage > 0 ? ((smogonMon.rawCount || 0) / totalUsage * 100) : 0;

            combined.push({
                name: smogonMon.name,
                usage: usage,
                winRate: null,
                topMoves: Object.entries(smogonMon.moves || {})
                    .sort((a, b) => b[1] - a[1])
                    .slice(0, 4)
                    .map(m => m[0]),
                fromVictoryRoad: false
            });

            usedNames.add(smogonMon.name.toLowerCase());
        }
    }

    return combined;
}

export interface CombinedVGCData {
    name: string;
    usage: number;
    winRate: number | null;
    topMoves: string[];
    fromVictoryRoad: boolean;
}
