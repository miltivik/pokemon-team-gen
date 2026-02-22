import { NextRequest, NextResponse } from 'next/server';
import { SmogonDataSource } from '@/lib/data-sources/smogon';

// Mantenemos este mapa para compatibilidad hacia atrás por si algún front-end lo usa
const PIKALYTICS_FORMAT_MAP: Record<string, string> = {
    'gen9ou': 'gen9ou',
    'gen9vgc2026f': 'gen9vgc2026regf',
    'gen9vgc': 'gen9vgc2026regf',
    'gen9doublesou': 'gen9vgc2026regf',
    'gen9uu': 'gen9uu',
    'gen9ubers': 'gen9ubers',
    'gen9monotype': 'gen9monotype', // Arreglado de gen9mono a gen9monotype para Smogon
};

export async function GET(request: NextRequest) {
    const searchParams = request.nextUrl.searchParams;
    const requestedFormat = searchParams.get('format') || 'gen9ou';

    // Para Smogon, usamos el formato real mapeado o el proveído
    const format = PIKALYTICS_FORMAT_MAP[requestedFormat] || requestedFormat;

    try {
        // Pedimos los datos normalizados de Smogon (ya en memoria si están cacheados)
        const smogonData = await SmogonDataSource.getStats(format);

        if (!smogonData || !smogonData.pokemon) {
             return NextResponse.json(
                { error: 'Failed to fetch data', format, pokemon: {}, lastUpdated: new Date().toISOString() },
                { status: 200 }
            );
        }

        const pikalyticsFormatted: Record<string, {
            name: string;
            usage: number;
            winRate: number;
            moves: Record<string, number>;
            abilities: Record<string, number>;
            items: Record<string, number>;
            teraTypes: Record<string, number>;
        }> = {};

        for (const [id, mon] of Object.entries(smogonData.pokemon)) {
            pikalyticsFormatted[id] = {
                name: mon.name,
                usage: mon.usageRate * 100, // Convertimos a porcentaje para igualar la UI anterior
                winRate: 50, // Smogon no provee winRate, mandamos un fallback visual
                moves: mon.moves || {},
                abilities: mon.abilities || {},
                items: mon.items || {},
                teraTypes: mon.teraTypes || {}
            };
        }

        return NextResponse.json({
            format,
            pokemon: pikalyticsFormatted,
            lastUpdated: new Date().toISOString()
        });

    } catch (error) {
        console.error('API error in /api/pikalytics:', error);
        return NextResponse.json(
            { error: 'Internal server error', format, pokemon: {}, lastUpdated: new Date().toISOString() },
            { status: 500 }
        );
    }
}
