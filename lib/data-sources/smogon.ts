import { resolveProviderFormatCandidates } from "@/lib/data-sources/format-source-resolver";
import type {
  NormalizedSmogonData,
  SmogonSourceInfo,
} from "@/lib/data-sources/smogon-types";
import { mkdir, readFile, stat, writeFile } from "node:fs/promises";
import path from "node:path";
import { toID } from "../utils";

export interface ChaosData {
  info: {
    metagame: string;
    cutoff: number;
    cutoff_deviation?: number;
    "cutoff deviation"?: number;
    team_type?: string;
    "team type"?: string | null;
    number_of_battles?: number;
    "number of battles"?: number;
  };
  data: Record<string, ChaosMonData>;
}

export interface ChaosMonData {
  Moves: Record<string, number>;
  Teammates: Record<string, number>;
  Abilities: Record<string, number>;
  Items: Record<string, number>;
  Spreads: Record<string, number>;
  "Tera Types"?: Record<string, number>;
  usage: number;
  "Raw count": number;
}

interface FetchResult {
  data: ChaosData;
  leadData: Record<string, number>;
  sourceInfo: SmogonSourceInfo;
}

function normalizeUsageMap(values: Record<string, number> | undefined) {
  const normalized: Record<string, number> = {};
  const entries = Object.entries(values || {});
  const total = entries.reduce((sum, [, usage]) => sum + usage, 0) || 1;

  for (const [name, usage] of entries) {
    const id = toID(name);
    normalized[id] = (normalized[id] || 0) + usage / total;
  }

  return normalized;
}

function normalizeLeadData(text: string) {
  const leadData: Record<string, number> = {};
  const leadRegex = /\|\s*\d+\s*\|\s*([^|]+?)\s*\|\s*([\d.]+)%\s*\|/g;
  let match: RegExpExecArray | null;

  while ((match = leadRegex.exec(text)) !== null) {
    const pokemonId = toID(match[1]?.trim());
    const usageRate = Number(match[2]);
    if (!pokemonId || Number.isNaN(usageRate)) continue;
    leadData[pokemonId] = usageRate / 100;
  }

  return leadData;
}

const cache: Map<string, NormalizedSmogonData> = new Map();
const cacheTime: Map<string, number> = new Map();
const inFlightFetches: Map<string, Promise<NormalizedSmogonData | null>> = new Map();
const CACHE_TTL = 1000 * 60 * 60;
const STALE_CACHE_TTL = 1000 * 60 * 60 * 24 * 35;
const BASE_URL = "https://www.smogon.com/stats";
const RATINGS = [1760, 1695, 1500, 0];
const DISK_CACHE_DIR = path.join(process.cwd(), ".cache", "smogon");

interface DiskCacheEntry {
  cachedAt: number;
  data: NormalizedSmogonData;
}

function getRecentMonths(): string[] {
  const dates = [];
  const now = new Date();
  for (let i = 1; i <= 6; i += 1) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, "0");
    dates.push(`${year}-${month}`);
  }
  return dates;
}

function getDiskCachePath(format: string) {
  return path.join(
    DISK_CACHE_DIR,
    `${format.toLowerCase().replace(/[^a-z0-9-]+/g, "_")}.json`
  );
}

async function readDiskCache(format: string) {
  const cachePath = getDiskCachePath(format);

  try {
    const [rawEntry, fileStats] = await Promise.all([
      readFile(cachePath, "utf8"),
      stat(cachePath),
    ]);
    const parsed = JSON.parse(rawEntry) as Partial<DiskCacheEntry>;
    const cachedAt =
      typeof parsed.cachedAt === "number" ? parsed.cachedAt : fileStats.mtimeMs;

    if (!parsed.data) {
      return null;
    }

    return {
      cachedAt,
      data: parsed.data,
      isFresh: Date.now() - cachedAt < CACHE_TTL,
      isUsable: Date.now() - cachedAt < STALE_CACHE_TTL,
    };
  } catch {
    return null;
  }
}

async function writeDiskCache(format: string, data: NormalizedSmogonData) {
  try {
    await mkdir(DISK_CACHE_DIR, { recursive: true });
    await writeFile(
      getDiskCachePath(format),
      JSON.stringify({
        cachedAt: Date.now(),
        data,
      } satisfies DiskCacheEntry)
    );
  } catch {
    // Ignore cache persistence errors and keep the in-memory result.
  }
}

export class SmogonDataSource {
  static async getStats(format: string): Promise<NormalizedSmogonData | null> {
    const cached = cache.get(format);
    if (cached && Date.now() - (cacheTime.get(format) || 0) < CACHE_TTL) {
      return cached;
    }

    const diskCached = await readDiskCache(format);
    if (diskCached?.isFresh) {
      cache.set(format, diskCached.data);
      cacheTime.set(format, diskCached.cachedAt);
      return diskCached.data;
    }

    if (diskCached?.isUsable) {
      cache.set(format, diskCached.data);
      cacheTime.set(format, diskCached.cachedAt);

      if (!inFlightFetches.has(format)) {
        const refreshPromise = this.fetchAndCacheStats(format).finally(() => {
          inFlightFetches.delete(format);
        });
        inFlightFetches.set(format, refreshPromise);
      }

      return diskCached.data;
    }

    const existingFetch = inFlightFetches.get(format);
    if (existingFetch) {
      return existingFetch;
    }

    const fetchPromise = this.fetchAndCacheStats(format).finally(() => {
      inFlightFetches.delete(format);
    });
    inFlightFetches.set(format, fetchPromise);
    return fetchPromise;
  }

  private static async fetchChaosData(format: string): Promise<FetchResult | null> {
    const months = getRecentMonths();
    const plan = resolveProviderFormatCandidates(format, "smogon");

    for (const candidate of plan.candidates) {
      for (const month of months) {
        const baselineUrl = `${BASE_URL}/${month}/chaos/${candidate.slug}-0.json`;
        try {
          const headRes = await fetch(baselineUrl, {
            method: "HEAD",
            next: { revalidate: 3600 },
          });
          if (!headRes.ok) continue;
        } catch {
          continue;
        }

        for (const rating of RATINGS) {
          const url = `${BASE_URL}/${month}/chaos/${candidate.slug}-${rating}.json`;
          try {
            const res = await fetch(url, { next: { revalidate: 3600 } });
            if (!res.ok) continue;

            const data = JSON.parse(await res.text()) as ChaosData;
            const leadData = await this.fetchLeadData(candidate.slug, month);

            return {
              data,
              leadData,
              sourceInfo: {
                provider: "smogon",
                requestedFormat: format,
                resolvedFormat: candidate.slug,
                month,
                rating,
                fallbackType: candidate.reason,
              },
            };
          } catch {
            continue;
          }
        }
      }
    }

    return null;
  }

  private static async fetchAndCacheStats(format: string) {
    const fetchResult = await this.fetchChaosData(format);
    if (!fetchResult) {
      return null;
    }

    const normalized = this.normalize(fetchResult, format);
    cache.set(format, normalized);
    cacheTime.set(format, Date.now());
    await writeDiskCache(format, normalized);
    return normalized;
  }

  private static async fetchLeadData(formatSlug: string, month: string) {
    for (const rating of RATINGS) {
      const url = `${BASE_URL}/${month}/leads/${formatSlug}-${rating}.txt`;
      try {
        const res = await fetch(url, { next: { revalidate: 3600 } });
        if (!res.ok) continue;

        const text = await res.text();
        const leadData = normalizeLeadData(text);
        if (Object.keys(leadData).length > 0) {
          return leadData;
        }
      } catch {
        continue;
      }
    }

    return {};
  }

  private static normalize(fetchResult: FetchResult, format: string): NormalizedSmogonData {
    const { data, leadData, sourceInfo } = fetchResult;
    const totalBattles =
      data.info.number_of_battles ??
      data.info["number of battles"] ??
      1000;

    const normalized: NormalizedSmogonData = {
      meta: {
        format,
        totalBattles,
        leadData,
        sourceInfo,
      },
      pokemon: {},
    };

    for (const [name, raw] of Object.entries(data.data)) {
      const id = toID(name);
      const rawCount = raw["Raw count"] || 0;
      const usageRate =
        typeof raw.usage === "number" && Number.isFinite(raw.usage)
          ? raw.usage > 1
            ? raw.usage / 100
            : raw.usage
          : totalBattles > 0
            ? rawCount / (totalBattles * 2)
            : 0;
      const totalSpreadWeight =
        Object.values(raw.Spreads || {}).reduce((sum, value) => sum + value, 0) || 1;

      const spreads = Object.entries(raw.Spreads || {})
        .map(([key, value]) => {
          const [nature, evStr] = key.split(":");
          const evs = evStr ? evStr.split("/").map(Number) : [0, 0, 0, 0, 0, 0];
          return {
            nature: nature || "Serious",
            evs: evs.length === 6 ? evs : [0, 0, 0, 0, 0, 0],
            percentage: value / totalSpreadWeight,
          };
        })
        .sort((a, b) => b.percentage - a.percentage);

      const teammates: Record<string, number> = {};
      for (const [teammateName, teammateValue] of Object.entries(raw.Teammates || {})) {
        teammates[toID(teammateName)] = teammateValue;
      }

      normalized.pokemon[id] = {
        name,
        usageRate,
        teammates,
        moves: normalizeUsageMap(raw.Moves),
        items: normalizeUsageMap(raw.Items),
        abilities: normalizeUsageMap(raw.Abilities),
        teraTypes: normalizeUsageMap(raw["Tera Types"]),
        spreads,
      };
    }

    return normalized;
  }
}
