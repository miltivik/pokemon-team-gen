import { NextRequest, NextResponse } from "next/server";
import { getMetaOverview } from "@/lib/meta-analysis";

export const revalidate = 3600;

export async function GET(request: NextRequest) {
  const format = request.nextUrl.searchParams.get("format");
  const requestedLimit = Number(request.nextUrl.searchParams.get("limit") ?? 15);
  const limit =
    Number.isInteger(requestedLimit) && requestedLimit > 0
      ? Math.min(requestedLimit, 50)
      : 15;

  if (!format) {
    return NextResponse.json({ error: "Format is required" }, { status: 400 });
  }

  try {
    const payload = await getMetaOverview(format, limit);
    if (!payload) {
      return NextResponse.json({ error: "Stats not found for this format" }, { status: 404 });
    }

    return NextResponse.json(
      payload,
      { headers: { "Cache-Control": "public, s-maxage=3600, stale-while-revalidate=86400" } }
    );
  } catch (error) {
    console.error("Error in meta-overview API:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
