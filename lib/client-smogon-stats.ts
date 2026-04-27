import type { NormalizedMonData, NormalizedSmogonData } from "@/lib/data-sources/smogon-types";

export interface SmogonMonData {
  name: string;
  rawCount: number;
  usage: number;
  abilities: Record<string, number>;
  items: Record<string, number>;
  moves: Record<string, number>;
  teammates: Record<string, number>;
  checks: Record<string, number>;
  spreads: Record<string, number>;
}

export type TierRank = "S" | "A+" | "A" | "A-" | "B+" | "B" | "B-" | "C" | "D";

export async function getClientSmogonStats(
  format: string = "gen9ou"
): Promise<Record<string, SmogonMonData>> {
  const response = await fetch(
    `/api/smogon-stats?format=${encodeURIComponent(format)}`,
    { cache: "no-store" }
  );

  if (!response.ok) {
    throw new Error(`Failed to fetch Smogon stats for ${format}`);
  }

  const payload = (await response.json()) as NormalizedSmogonData;

  return toClientSmogonStats(payload);
}

export function toClientSmogonStats(payload: NormalizedSmogonData): Record<string, SmogonMonData> {
  return Object.fromEntries(
    Object.entries(payload.pokemon || {})
      .filter(([, mon]) => hasValidMonName(mon))
      .map(([id, mon]) => [id, toClientMonData(mon, payload.meta.totalBattles)])
  );
}

function hasValidMonName(mon: NormalizedMonData | undefined) {
  return typeof mon?.name === "string" && mon.name.trim().length > 0;
}

function toClientMonData(mon: NormalizedMonData, totalBattles: number): SmogonMonData {
  const spreads = Object.fromEntries(
    (mon.spreads || []).map((spread) => [
      `${spread.nature}:${spread.evs.join("/")}`,
      spread.percentage,
    ])
  );

  return {
    name: mon.name,
    rawCount: Math.round(mon.usageRate * Math.max(totalBattles, 1) * 2),
    usage: mon.usageRate,
    abilities: mon.abilities || {},
    items: mon.items || {},
    moves: mon.moves || {},
    teammates: mon.teammates || {},
    checks: {},
    spreads,
  };
}

export function classifyTier(usage: number): TierRank {
  if (usage >= 0.15) return "S";
  if (usage >= 0.1) return "A+";
  if (usage >= 0.07) return "A";
  if (usage >= 0.0452) return "A-";
  if (usage >= 0.0341) return "B+";
  if (usage >= 0.02) return "B";
  if (usage >= 0.01) return "B-";
  if (usage >= 0.005) return "C";
  return "D";
}
