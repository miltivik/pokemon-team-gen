import { NextRequest, NextResponse } from "next/server";
import { getPrimaryProviderSlug } from "@/lib/data-sources/format-source-resolver";

const VICTORY_ROAD_TIMEOUT_MS = 4000;

function buildEmptyResponse(format: string) {
  return {
    format,
    reports: [],
    lastUpdated: new Date().toISOString(),
  };
}

function getVictoryRoadOrigins() {
  return (process.env.VICTORY_ROAD_API_ORIGIN || "")
    .split(",")
    .map((origin) => origin.trim().replace(/\/+$/, ""))
    .filter(Boolean);
}

async function fetchVictoryRoadMeta(resolvedFormat: string) {
  const attempts: string[] = [];

  for (const origin of getVictoryRoadOrigins()) {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), VICTORY_ROAD_TIMEOUT_MS);
    const url = `${origin}/api/vgc/${resolvedFormat}/meta`;

    try {
      const response = await fetch(url, {
        cache: "no-store",
        signal: controller.signal,
        headers: {
          accept: "application/json",
        },
      });

      if (response.ok) {
        return {
          data: await response.json(),
          attempts,
        };
      }

      attempts.push(`${url} -> ${response.status}`);
    } catch (error) {
      const message =
        error instanceof Error
          ? `${error.name}:${error.message}`
          : String(error);
      attempts.push(`${url} -> ${message}`);
    } finally {
      clearTimeout(timeoutId);
    }
  }

  return {
    data: null,
    attempts,
  };
}

export async function GET(request: NextRequest) {
  const requestedFormat =
    request.nextUrl.searchParams.get("format") || "gen9vgc2026f";
  const resolvedFormat = requestedFormat.startsWith("vgc")
    ? requestedFormat
    : getPrimaryProviderSlug(requestedFormat, "victoryroad");

  if (!resolvedFormat) {
    return NextResponse.json(buildEmptyResponse(requestedFormat));
  }

  const origins = getVictoryRoadOrigins();
  if (origins.length === 0) {
    return NextResponse.json(buildEmptyResponse(requestedFormat));
  }

  try {
    const { data, attempts } = await fetchVictoryRoadMeta(resolvedFormat);
    if (data) {
      return NextResponse.json(data);
    }

    console.warn("Victory Road API proxy unavailable", {
      requestedFormat,
      resolvedFormat,
      attempts,
    });

    return NextResponse.json(buildEmptyResponse(requestedFormat));
  } catch (error) {
    console.warn("Victory Road API proxy failed unexpectedly", {
      requestedFormat,
      resolvedFormat,
      error: error instanceof Error ? error.message : String(error),
    });
    return NextResponse.json(buildEmptyResponse(requestedFormat));
  }
}
