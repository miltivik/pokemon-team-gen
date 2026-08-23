import { FORMATS, type FormatId } from "@/config/formats";
import type { Template, TemplateId } from "@/config/templates";
import { SetOptimizer, type OptimizedSet } from "@/lib/builder/set-optimizer";
import {
  HAZARD_MOVES,
  PIVOT_MOVES,
  RECOVERY_MOVES,
  REMOVAL_MOVES,
  SCREEN_MOVES,
  SETUP_MOVES,
  STACKING_HAZARD_MOVES,
} from "@/lib/builder/template-heuristics";
import {
  buildFullFormatCandidatePool,
  type CandidatePoolEntry,
} from "@/lib/builder/candidate-pool";
import type { PokemonSpecies } from "@/lib/data-sources/dex";
import type { NormalizedSmogonData } from "@/lib/data-sources/smogon-types";
import { pokemonCanLearnMove } from "@/lib/pokemon-learnsets";
import { toID } from "@/lib/utils";

export interface TeamGenerationFeasibility {
  infeasibleSupportPackages: string[];
  infeasibleCore: string[];
}

interface FeasibilityOptions {
  data: NormalizedSmogonData;
  format: string;
  gen: number;
  type?: string | null;
  excludeLegendaries?: boolean;
  template?: Template;
  templateId: TemplateId;
}

interface CandidateFeasibilityEntry {
  species: PokemonSpecies;
  set: OptimizedSet;
  moveIds: Set<string>;
  abilityId: string;
  bulk: number;
  maxOffense: number;
  speed: number;
}

const EMPTY_FEASIBILITY: TeamGenerationFeasibility = {
  infeasibleSupportPackages: [],
  infeasibleCore: [],
};

const FEASIBILITY_CACHE_TTL_MS = 1000 * 60 * 60;
const FEASIBILITY_CACHE_MAX_ENTRIES = 64;
interface FeasibilityCacheEntry {
  value: TeamGenerationFeasibility;
  expiresAt: number;
}

const feasibilityCache = new Map<string, FeasibilityCacheEntry>();

const SPEED_CONTROL_MOVES = [
  "Tailwind",
  "Trick Room",
  "Thunder Wave",
  "Icy Wind",
  "Electroweb",
];
const PROTECT_LIKE_MOVES = [
  "Protect",
  "Detect",
  "Spiky Shield",
  "King's Shield",
  "Baneful Bunker",
  "Burning Bulwark",
  "Obstruct",
  "Silk Trap",
];
const REDIRECTION_MOVES = ["Follow Me", "Rage Powder"];
const WEATHER_SETTER_ABILITIES = {
  rain: ["drizzle"],
  sun: ["drought", "orichalcumpulse"],
  sand: ["sandstream"],
  snow: ["snowwarning"],
};
const WEATHER_ABUSER_ABILITIES = {
  rain: ["swiftswim", "raindish", "dryskin", "hydration", "waterabsorb", "stormdrain"],
  sun: ["chlorophyll", "solarpower", "flowergift", "protosynthesis"],
  sand: ["sandrush", "sandforce", "sandveil"],
  snow: ["slushrush", "icebody"],
};
const WEATHER_ABUSER_MOVES = {
  rain: ["Weather Ball", "Hurricane", "Thunder"],
  sun: ["Weather Ball", "Growth", "Solar Beam", "Morning Sun"],
  sand: ["Rock Slide", "Earthquake"],
  snow: ["Blizzard", "Weather Ball"],
};

function cloneFeasibility(feasibility: TeamGenerationFeasibility = EMPTY_FEASIBILITY) {
  return {
    infeasibleSupportPackages: [...feasibility.infeasibleSupportPackages],
    infeasibleCore: [...feasibility.infeasibleCore],
  };
}

function getFeasibilityCacheKey(options: FeasibilityOptions) {
  const source = options.data.meta.sourceInfo;
  return [
    options.format,
    options.gen,
    options.type ?? "",
    options.excludeLegendaries ? "1" : "0",
    options.templateId,
    source.provider,
    source.requestedFormat,
    source.resolvedFormat,
    source.month,
    source.rating,
    source.fallbackType,
    Object.keys(options.data.pokemon).length,
  ].join("|");
}

function readCachedFeasibility(key: string) {
  const entry = feasibilityCache.get(key);
  if (!entry) return null;

  if (entry.expiresAt <= Date.now()) {
    feasibilityCache.delete(key);
    return null;
  }

  // Promote the entry so the Map also acts as a small LRU cache.
  feasibilityCache.delete(key);
  feasibilityCache.set(key, entry);
  return cloneFeasibility(entry.value);
}

function writeCachedFeasibility(key: string, value: TeamGenerationFeasibility) {
  feasibilityCache.delete(key);
  feasibilityCache.set(key, {
    value: cloneFeasibility(value),
    expiresAt: Date.now() + FEASIBILITY_CACHE_TTL_MS,
  });

  while (feasibilityCache.size > FEASIBILITY_CACHE_MAX_ENTRIES) {
    const oldestKey = feasibilityCache.keys().next().value;
    if (!oldestKey) break;
    feasibilityCache.delete(oldestKey);
  }
}

function hasMove(entry: CandidateFeasibilityEntry, moveName: string) {
  return entry.moveIds.has(toID(moveName)) ||
    pokemonCanLearnMove(entry.species.name, moveName);
}

function hasAnyMove(entry: CandidateFeasibilityEntry, moveNames: string[]) {
  return moveNames.some((moveName) => hasMove(entry, moveName));
}

function hasAnyAbility(entry: CandidateFeasibilityEntry, abilityIds: string[]) {
  return abilityIds.some((abilityId) => entry.abilityId === toID(abilityId));
}

function hasAnySpeciesAbility(species: PokemonSpecies, abilityIds: string[]) {
  const candidateAbilityIds = new Set(Object.values(species.abilities).map(toID));
  return abilityIds.some((abilityId) => candidateAbilityIds.has(toID(abilityId)));
}

function hasType(entry: CandidateFeasibilityEntry, typeName: string) {
  return entry.species.types.some(
    (type) => type.toLowerCase() === typeName.toLowerCase()
  );
}

function isDoubles(format: string) {
  return FORMATS[format as FormatId]?.gameType === "doubles";
}

function supportPackageMinimum(supportPackage: string, format: string) {
  switch (supportPackage) {
    case "setup":
    case "screens-or-hazards":
      return 2;
    case "pivoting":
      return isDoubles(format) ? 1 : 2;
    case "protect":
      return isDoubles(format) ? 2 : 0;
    default:
      return 1;
  }
}

function coreMinimum(core: string) {
  switch (core) {
    case "slow-breakers":
    case "speed-abusers":
    case "rain-abusers":
    case "sun-abusers":
    case "sand-abusers":
    case "weather-abusers":
    case "pivot-core":
      return 2;
    case "recovery-backbone":
      return 3;
    default:
      return 1;
  }
}

function matchesSupportPackage(
  entry: CandidateFeasibilityEntry,
  supportPackage: string,
  format: string
) {
  switch (supportPackage) {
    case "hazards":
      return isDoubles(format) || hasAnyMove(entry, HAZARD_MOVES);
    case "removal":
      return isDoubles(format) || hasAnyMove(entry, REMOVAL_MOVES);
    case "pivoting":
      return isDoubles(format)
        ? hasAnyMove(entry, [...PIVOT_MOVES, ...REDIRECTION_MOVES, "Fake Out"])
        : hasAnyMove(entry, PIVOT_MOVES);
    case "speed-control":
      return hasAnyMove(entry, SPEED_CONTROL_MOVES);
    case "setup":
      return hasAnyMove(entry, SETUP_MOVES);
    case "lead-pressure":
      return hasAnyMove(entry, [
        ...HAZARD_MOVES,
        ...SCREEN_MOVES,
        ...SPEED_CONTROL_MOVES,
      ]);
    case "screens-or-hazards":
      return hasAnyMove(entry, [...SCREEN_MOVES, ...HAZARD_MOVES]);
    case "midgame-bulk":
      return entry.bulk >= 280;
    case "protect":
      return !isDoubles(format) || hasAnyMove(entry, PROTECT_LIKE_MOVES);
    case "positioning":
      return hasAnyMove(entry, [...PIVOT_MOVES, ...REDIRECTION_MOVES, "Fake Out"]);
    case "fake-out":
      return hasMove(entry, "Fake Out");
    case "redirection":
      return hasAnyMove(entry, REDIRECTION_MOVES);
    case "weather-control":
      return hasAnyMove(entry, [...PIVOT_MOVES, ...PROTECT_LIKE_MOVES]);
    case "rocks":
      return hasMove(entry, "Stealth Rock");
    case "spinblock":
      return hasType(entry, "Ghost") || entry.abilityId === "goodasgold";
    case "knock-off":
      return hasMove(entry, "Knock Off");
    default:
      return true;
  }
}

function weatherSetterMatches(entry: CandidateFeasibilityEntry, weather: keyof typeof WEATHER_SETTER_ABILITIES) {
  return (
    hasAnyAbility(entry, WEATHER_SETTER_ABILITIES[weather]) ||
    hasAnySpeciesAbility(entry.species, WEATHER_SETTER_ABILITIES[weather]) ||
    hasMove(entry, weather === "rain" ? "Rain Dance" : weather === "sun" ? "Sunny Day" : weather === "sand" ? "Sandstorm" : "Snowscape")
  );
}

function weatherAbuserMatches(entry: CandidateFeasibilityEntry, weather: keyof typeof WEATHER_ABUSER_ABILITIES) {
  if (
    hasAnyAbility(entry, WEATHER_ABUSER_ABILITIES[weather]) ||
    hasAnySpeciesAbility(entry.species, WEATHER_ABUSER_ABILITIES[weather]) ||
    hasAnyMove(entry, WEATHER_ABUSER_MOVES[weather])
  ) {
    return true;
  }

  return weather === "sun" && hasType(entry, "Fire");
}

function matchesRequiredCore(entry: CandidateFeasibilityEntry, core: string) {
  switch (core) {
    case "trick-room-setter":
      return hasMove(entry, "Trick Room");
    case "slow-breakers":
      return entry.speed <= 70 && entry.maxOffense >= 100;
    case "tailwind-setter":
      return hasMove(entry, "Tailwind");
    case "speed-abusers":
      return entry.speed >= 80 && entry.maxOffense >= 95;
    case "rain-setter":
      return weatherSetterMatches(entry, "rain");
    case "rain-abusers":
      return weatherAbuserMatches(entry, "rain");
    case "sun-setter":
      return weatherSetterMatches(entry, "sun");
    case "sun-abusers":
      return weatherAbuserMatches(entry, "sun");
    case "sand-setter":
      return weatherSetterMatches(entry, "sand");
    case "sand-abusers":
      return weatherAbuserMatches(entry, "sand");
    case "rocks":
      return hasMove(entry, "Stealth Rock");
    case "stacking-hazards":
      return hasAnyMove(entry, STACKING_HAZARD_MOVES);
    case "pivot-core":
      return hasAnyMove(entry, PIVOT_MOVES);
    case "recovery-backbone":
      return entry.bulk >= 250 && hasAnyMove(entry, RECOVERY_MOVES);
    case "weather-setter":
      return (
        weatherSetterMatches(entry, "rain") ||
        weatherSetterMatches(entry, "sun") ||
        weatherSetterMatches(entry, "sand") ||
        weatherSetterMatches(entry, "snow")
      );
    case "weather-abusers":
      return (
        weatherAbuserMatches(entry, "rain") ||
        weatherAbuserMatches(entry, "sun") ||
        weatherAbuserMatches(entry, "sand") ||
        weatherAbuserMatches(entry, "snow")
      );
    default:
      return true;
  }
}

function countMatchingEntries(
  entries: CandidateFeasibilityEntry[],
  predicate: (entry: CandidateFeasibilityEntry) => boolean
) {
  return entries.reduce((count, entry) => count + (predicate(entry) ? 1 : 0), 0);
}

function buildFeasibilityEntries(
  data: NormalizedSmogonData,
  template: Template | undefined,
  format: string,
  pool: CandidatePoolEntry[]
): CandidateFeasibilityEntry[] {
  const optimizer = new SetOptimizer(data);

  return pool.map(({ species }) => {
    const set = optimizer.optimizeBundle(species, [], {
      template,
      format,
    });
    const moveIds = new Set(set.moves.map((move) => toID(move)));
    const bulk = species.baseStats.hp + species.baseStats.def + species.baseStats.spd;
    const maxOffense = Math.max(species.baseStats.atk, species.baseStats.spa);

    return {
      species,
      set,
      moveIds,
      abilityId: toID(set.ability),
      bulk,
      maxOffense,
      speed: species.baseStats.spe,
    };
  });
}

export function getTeamGenerationFeasibility(
  options: FeasibilityOptions
): TeamGenerationFeasibility {
  const supportPackages = options.template?.supportPackages ?? [];
  const requiredCore = options.template?.requiredCore ?? [];

  if (supportPackages.length === 0 && requiredCore.length === 0) {
    return cloneFeasibility();
  }

  const cacheKey = getFeasibilityCacheKey(options);
  const cached = readCachedFeasibility(cacheKey);
  if (cached) {
    return cached;
  }

  const pool = buildFullFormatCandidatePool({
    data: options.data,
    format: options.format,
    gen: options.gen,
    excludeLegendaries: options.excludeLegendaries,
    requiredType: options.type,
  });
  const entries = buildFeasibilityEntries(
    options.data,
    options.template,
    options.format,
    pool
  );
  const infeasibleSupportPackages = supportPackages.filter((supportPackage) => {
    const needed = supportPackageMinimum(supportPackage, options.format);
    if (needed <= 0) {
      return false;
    }

    return countMatchingEntries(entries, (entry) =>
      matchesSupportPackage(entry, supportPackage, options.format)
    ) < needed;
  });
  const infeasibleCore = requiredCore.filter((core) => {
    const needed = coreMinimum(core);
    return countMatchingEntries(entries, (entry) =>
      matchesRequiredCore(entry, core)
    ) < needed;
  });

  const result = {
    infeasibleSupportPackages,
    infeasibleCore,
  };
  writeCachedFeasibility(cacheKey, result);
  return result;
}
