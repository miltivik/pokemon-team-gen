export interface SmogonSourceInfo {
  provider: "smogon";
  requestedFormat: string;
  resolvedFormat: string;
  month: string;
  rating: number;
  fallbackType:
    | "exact"
    | "mapped"
    | "historical_regulation"
    | "same_game_fallback";
}

export interface NormalizedSmogonData {
  pokemon: Record<string, NormalizedMonData>;
  meta: {
    format: string;
    totalBattles: number;
    leadData: Record<string, number>;
    sourceInfo: SmogonSourceInfo;
    optionalArchetypeHints?: string[];
  };
}

export interface NormalizedMonData {
  name: string;
  usageRate: number;
  optionalWinRate?: number | null;
  teammates: Record<string, number>;
  moves: Record<string, number>;
  items: Record<string, number>;
  abilities: Record<string, number>;
  teraTypes: Record<string, number>;
  spreads: Array<{
    nature: string;
    evs: number[];
    percentage: number;
  }>;
}
