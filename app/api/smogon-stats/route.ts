import { NextRequest, NextResponse } from 'next/server';

// Cache for server-side stats
const statsCacheV2: Map<string, { data: any; timestamp: number }> = new Map();
const CACHE_TTL = 1000 * 60 * 60 * 24; // 24 hours

const BASE_URL = 'https://www.smogon.com/stats';
// Try recent months - extended range
const DATES_TO_TRY = ['2026-02', '2026-01', '2025-12', '2025-11', '2025-10', '2025-09'];
const RATING_LEVELS = ['1695', '1825', '1760', '1630', '1500', '0'];

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

async function fetchSmogonData(format: string): Promise<any | null> {
    const formatsToTry = FORMAT_FALLBACKS[format] || [format];

    for (const fmt of formatsToTry) {
        for (const date of DATES_TO_TRY) {
            // Check if month exists with a fast HEAD request to the baseline rating
            const testUrl = `${BASE_URL}/${date}/chaos/${fmt}-0.json`;
            try {
                const headRes = await fetch(testUrl, { method: 'HEAD', cache: 'no-store' });
                if (!headRes.ok) {
                    continue; // Skip this date if it doesn't exist
                }
            } catch (e) {
                continue;
            }

            // If we are here, the month exists for this format. Find the best rating.
            for (const rating of RATING_LEVELS) {
                const url = `${BASE_URL}/${date}/chaos/${fmt}-${rating}.json`;
                try {
                    console.log(`Fetching Smogon stats from: ${url}`);
                    const response = await fetch(url, { cache: 'no-store' });
                    if (response.ok) {
                        const data = await response.json();
                        // Validate data structure lightly
                        if (data && typeof data === 'object') {
                            return data;
                        }
                    }
                } catch (error) {
                    // Ignore errors and try next combination
                    console.warn(`Failed to fetch ${url}:`, error);
                }
            }
        }
    }
    return null;
}

export async function GET(request: NextRequest) {
    const searchParams = request.nextUrl.searchParams;
    const format = searchParams.get('format');

    if (!format) {
        return NextResponse.json({ error: 'Format is required' }, { status: 400 });
    }

    // Check cache
    const cached = statsCacheV2.get(format);
    if (cached && (Date.now() - cached.timestamp < CACHE_TTL)) {
        return NextResponse.json(cached.data);
    }

    try {
        const data = await fetchSmogonData(format);

        if (data) {
            statsCacheV2.set(format, { data, timestamp: Date.now() });
            return NextResponse.json(data);
        } else {
            return NextResponse.json({ error: 'Stats not found for this format' }, { status: 404 });
        }
    } catch (error) {
        console.error('Error in smogon-stats API:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}
