import { FORMATS, getGenFromFormat, type FormatId, type GameType } from "@/config/formats";

export type SourceProvider =
  | "smogon"
  | "pikalytics"
  | "victoryroad"
  | "competitiveSets";

export interface ResolvedFormatCandidate {
  slug: string;
  reason:
    | "exact"
    | "mapped"
    | "historical_regulation"
    | "same_game_fallback";
}

export interface ResolvedFormatPlan {
  requestedFormat: string;
  requestedGameType: GameType | null;
  candidates: ResolvedFormatCandidate[];
}

const PROVIDER_OVERRIDES: Record<SourceProvider, Record<string, ResolvedFormatCandidate[]>> = {
  smogon: {
    gen9vgc2026regi: [
      { slug: "gen9vgc2026regi", reason: "mapped" },
      { slug: "gen9vgc2025regg", reason: "historical_regulation" },
      { slug: "gen9vgc2025regh", reason: "historical_regulation" },
      { slug: "gen9vgc2024regg", reason: "historical_regulation" },
    ],
    gen9vgc2026f: [
      { slug: "gen9vgc2026regf", reason: "mapped" },
      { slug: "gen9vgc2025regh", reason: "historical_regulation" },
      { slug: "gen9vgc2025regg", reason: "historical_regulation" },
      { slug: "gen9vgc2024regg", reason: "historical_regulation" },
      { slug: "gen9vgc2024regf", reason: "historical_regulation" },
    ],
  },
  pikalytics: {
    gen9monotype: [{ slug: "gen9mono", reason: "mapped" }],
    gen9vgc2026regi: [
      { slug: "gen9vgc2026regi", reason: "mapped" },
      { slug: "gen9vgc2025regg", reason: "historical_regulation" },
    ],
    gen9vgc2026f: [
      { slug: "gen9vgc2026regf", reason: "mapped" },
      { slug: "gen9vgc2025regh", reason: "historical_regulation" },
    ],
    gen9vgc: [{ slug: "gen9vgc2026regf", reason: "mapped" }],
    gen9doublesou: [{ slug: "gen9vgc2026regf", reason: "mapped" }],
  },
  victoryroad: {
    gen9vgc2026regi: [
      { slug: "vgc2026regi", reason: "mapped" },
      { slug: "vgc2025regg", reason: "historical_regulation" },
    ],
    gen9vgc2026f: [
      { slug: "vgc2026regf", reason: "mapped" },
      { slug: "vgc2025regh", reason: "historical_regulation" },
    ],
    gen9vgc: [{ slug: "vgc2026regf", reason: "mapped" }],
    gen9doublesou: [{ slug: "vgc2026regf", reason: "mapped" }],
  },
  competitiveSets: {
    gen9ou: [{ slug: "ou", reason: "mapped" }],
    gen9ubers: [{ slug: "ubers", reason: "mapped" }],
    gen9uu: [{ slug: "uu", reason: "mapped" }],
    gen9ru: [{ slug: "ru", reason: "mapped" }],
    gen9lc: [{ slug: "lc", reason: "mapped" }],
    gen9monotype: [{ slug: "monotype", reason: "mapped" }],
    gen9doublesou: [{ slug: "doublesou", reason: "mapped" }],
    gen9nationaldex: [{ slug: "nationaldex", reason: "mapped" }],
    gen9nationaldexubers: [{ slug: "nationaldexubers", reason: "mapped" }],
    gen9vgc2026regi: [
      // Showdown exposes this as gen9vgc2026regi, while the bundled Regulation I sets are stored under vgc2025.
      { slug: "vgc2025", reason: "mapped" },
      { slug: "doublesou", reason: "same_game_fallback" },
    ],
    gen9vgc2026f: [
      { slug: "vgc2025", reason: "historical_regulation" },
      { slug: "doublesou", reason: "same_game_fallback" },
    ],
  },
};

function sanitizeSlug(format: string) {
  return format.toLowerCase().replace(/[^a-z0-9]/g, "");
}

function inferGameType(format: string): GameType | null {
  const known = FORMATS[format as FormatId];
  if (known) {
    return known.gameType;
  }
  if (format.includes("vgc") || format.includes("doubles")) {
    return "doubles";
  }
  if (format.startsWith("gen")) {
    return "singles";
  }
  return null;
}

function getFormatSuffix(format: string) {
  return format.replace(/^gen\d+/, "").toLowerCase();
}

function getGenericProviderSlug(format: string, provider: SourceProvider) {
  if (provider === "victoryroad") {
    const suffix = getFormatSuffix(format);
    if (suffix.startsWith("vgc")) {
      return suffix;
    }
    return "";
  }

  if (provider === "competitiveSets") {
    const suffix = getFormatSuffix(format);
    if (suffix === "ubers") return "ubers";
    if (suffix === "doublesou") return "doublesou";
    if (suffix === "monotype") return "monotype";
    if (suffix === "nationaldex") return "nationaldex";
    if (suffix === "nationaldexubers") return "nationaldexubers";
    if (suffix === "lc") return "lc";
    if (suffix === "ou") return "ou";
    if (suffix === "uu") return "uu";
    if (suffix === "ru") return "ru";
  }

  return sanitizeSlug(format);
}

function buildSameGameFallbacks(
  format: string,
  provider: SourceProvider,
  requestedGameType: GameType | null
): ResolvedFormatCandidate[] {
  if (!requestedGameType) {
    return [];
  }

  const requestedSuffix = getFormatSuffix(format);
  const requestedGen = FORMATS[format as FormatId]
    ? getGenFromFormat(format as FormatId)
    : Number(format.match(/^gen(\d+)/)?.[1] ?? 9);

  return (Object.entries(FORMATS) as [FormatId, (typeof FORMATS)[FormatId]][])
    .filter(([candidateFormat, candidateDef]) => {
      if (candidateFormat === format) return false;
      if (candidateDef.gameType !== requestedGameType) return false;
      if (getFormatSuffix(candidateFormat) !== requestedSuffix) return false;
      return true;
    })
    .sort((a, b) => {
      const genA = getGenFromFormat(a[0]);
      const genB = getGenFromFormat(b[0]);
      const distanceA = Math.abs(genA - requestedGen);
      const distanceB = Math.abs(genB - requestedGen);
      if (distanceA !== distanceB) return distanceA - distanceB;
      return genB - genA;
    })
    .map(([candidateFormat]) => ({
      slug: getPrimaryProviderSlug(candidateFormat, provider),
      reason: "same_game_fallback" as const,
    }))
    .filter((candidate) => Boolean(candidate.slug));
}

function dedupeCandidates(candidates: ResolvedFormatCandidate[]) {
  const seen = new Set<string>();
  return candidates.filter((candidate) => {
    if (!candidate.slug || seen.has(candidate.slug)) {
      return false;
    }
    seen.add(candidate.slug);
    return true;
  });
}

export function resolveProviderFormatCandidates(
  format: string,
  provider: SourceProvider
): ResolvedFormatPlan {
  const requestedGameType = inferGameType(format);
  const exactSlug = getGenericProviderSlug(format, provider);
  const overrides = PROVIDER_OVERRIDES[provider][format] ?? [];
  const shouldPreferOverrides = overrides.length > 0;

  const candidates = dedupeCandidates([
    ...(shouldPreferOverrides ? overrides : []),
    ...(exactSlug ? [{ slug: exactSlug, reason: "exact" as const }] : []),
    ...(!shouldPreferOverrides ? overrides : []),
    ...buildSameGameFallbacks(format, provider, requestedGameType),
  ]);

  return {
    requestedFormat: format,
    requestedGameType,
    candidates,
  };
}

export function getPrimaryProviderSlug(format: string, provider: SourceProvider) {
  const override = PROVIDER_OVERRIDES[provider][format]?.[0];
  if (override?.slug) {
    return override.slug;
  }
  return getGenericProviderSlug(format, provider);
}

export function getCompetitiveSetsFormatKey(format: string) {
  return getPrimaryProviderSlug(format, "competitiveSets");
}
