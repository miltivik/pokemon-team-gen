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

  return (await response.json()) as Record<string, SmogonMonData>;
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
