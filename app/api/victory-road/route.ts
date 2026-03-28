import { NextRequest, NextResponse } from "next/server";
import { getPrimaryProviderSlug } from "@/lib/data-sources/format-source-resolver";

export async function GET(request: NextRequest) {
  const requestedFormat =
    request.nextUrl.searchParams.get("format") || "gen9vgc2026f";
  const resolvedFormat = requestedFormat.startsWith("vgc")
    ? requestedFormat
    : getPrimaryProviderSlug(requestedFormat, "victoryroad");

  if (!resolvedFormat) {
    return NextResponse.json({
      format: requestedFormat,
      reports: [],
      lastUpdated: new Date().toISOString(),
    });
  }

  try {
    const response = await fetch(
      `https://victoryroad.dev/api/vgc/${resolvedFormat}/meta`,
      { cache: "no-store" }
    );

    if (!response.ok) {
      return NextResponse.json({
        format: requestedFormat,
        reports: [],
        lastUpdated: new Date().toISOString(),
      });
    }

    return NextResponse.json(await response.json());
  } catch (error) {
    console.error("Victory Road API proxy failed:", error);
    return NextResponse.json({
      format: requestedFormat,
      reports: [],
      lastUpdated: new Date().toISOString(),
    });
  }
}
