import { NextRequest, NextResponse } from "next/server";
import { SmogonDataSource } from "@/lib/data-sources/smogon";

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const format = searchParams.get("format");

  if (!format) {
    return NextResponse.json({ error: "Format is required" }, { status: 400 });
  }

  try {
    const data = await SmogonDataSource.getStats(format);
    if (!data) {
      return NextResponse.json(
        { error: "Stats not found for this format" },
        { status: 404 }
      );
    }

    return NextResponse.json(data);
  } catch (error) {
    console.error("Error in smogon-stats API:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
