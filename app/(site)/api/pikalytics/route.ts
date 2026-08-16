import { NextRequest, NextResponse } from "next/server";
import { SmogonDataSource } from "@/lib/data-sources/smogon";

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const requestedFormat = searchParams.get("format") || "gen9ou";

  try {
    const smogonData = await SmogonDataSource.getStats(requestedFormat);

    if (!smogonData || !smogonData.pokemon) {
      return NextResponse.json(
        {
          error: "Failed to fetch data",
          format: requestedFormat,
          pokemon: {},
          lastUpdated: new Date().toISOString(),
        },
        { status: 200 }
      );
    }

    const pikalyticsFormatted: Record<
      string,
      {
        name: string;
        usage: number;
        winRate: number | null;
        moves: Record<string, number>;
        abilities: Record<string, number>;
        items: Record<string, number>;
        teraTypes: Record<string, number>;
      }
    > = {};

    for (const [id, mon] of Object.entries(smogonData.pokemon)) {
      pikalyticsFormatted[id] = {
        name: mon.name,
        usage: mon.usageRate * 100,
        winRate: mon.optionalWinRate ?? null,
        moves: mon.moves || {},
        abilities: mon.abilities || {},
        items: mon.items || {},
        teraTypes: mon.teraTypes || {},
      };
    }

    return NextResponse.json({
      format: requestedFormat,
      resolvedFormat: smogonData.meta.sourceInfo.resolvedFormat,
      pokemon: pikalyticsFormatted,
      lastUpdated: new Date().toISOString(),
    });
  } catch (error) {
    console.error("API error in /api/pikalytics:", error);
    return NextResponse.json(
      {
        error: "Internal server error",
        format: requestedFormat,
        pokemon: {},
        lastUpdated: new Date().toISOString(),
      },
      { status: 500 }
    );
  }
}
