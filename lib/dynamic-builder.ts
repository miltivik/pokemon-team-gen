import { FORMATS, FormatId, getGenFromFormat } from "@/config/formats";
import { SetOptimizer, type OptimizedSet } from "@/lib/builder/set-optimizer";
import { WeightedScoringEngine } from "@/lib/builder/scoring";
import {
  HAZARD_MOVES,
  LEAD_PRESSURE_MOVES,
  PIVOT_MOVES,
  RECOVERY_MOVES,
  REMOVAL_MOVES,
  SCREEN_MOVES,
  SETUP_MOVES,
  STACKING_HAZARD_MOVES,
} from "@/lib/builder/template-heuristics";
import {
  validateTeamForTemplate,
  type TeamValidationResult,
} from "@/lib/builder/team-validator";
import {
  getTeamGenerationFeasibility,
  type TeamGenerationFeasibility,
} from "@/lib/builder/generation-feasibility";
import { detectSetRole } from "@/lib/builder/roles";
import { Template, TemplateId, TEMPLATES, sanitizeTemplateForFormat } from "@/config/templates";
import { DexProvider, type PokemonSpecies } from "@/lib/data-sources/dex";
import type { NormalizedSmogonData } from "@/lib/data-sources/smogon-types";
import { SmogonDataSource } from "@/lib/data-sources/smogon";
import {
  getCompetitiveFormatProfile,
  getFallbackSpeciesPool,
  type CompetitiveFormatProfile,
} from "@/lib/competitive-format-profile";
import { getVGCArchetypes } from "@/lib/victory-road";
import { isAllowedInFormat } from "@/lib/format-rules";
import { getCanonicalSpeciesId } from "@/lib/pokemon-forms";
import { isLegendaryOrParadoxSpecies, isRestrictedLegendarySpecies } from "@/lib/pokemon-classification";
import {
  getTournamentPriorDiagnostics,
  getTournamentPriorSelectionPlan,
} from "@/lib/tournament-priors";
import {
  attachMemberAnalyses,
  generateTeamGuide,
  type GamePhase,
  type GeneratedTeamMember,
  type TeamGuideData,
} from "@/lib/team-guide";
import type { MoveData, Role } from "@/lib/showdown-data";
import { toID } from "@/lib/utils";

export type TeamMember = GeneratedTeamMember;

export interface DynamicTeamResponse {
  team: TeamMember[];
  archetype?: string;
  subarchetype?: string;
  dataProvenance?: NormalizedSmogonData["meta"]["sourceInfo"] | { provider: "local"; requestedFormat: string };
  recommendedModes?: TeamGuideData["recommendedModes"];
  gameplan?: {
    early: GamePhase;
    mid: GamePhase;
    late: GamePhase;
  };
  gameplanI18n: {
    en: { early: GamePhase; mid: GamePhase; late: GamePhase };
    es: { early: GamePhase; mid: GamePhase; late: GamePhase };
  };
  teamGuide?: TeamGuideData;
  teamGuideI18n: {
    en: TeamGuideData;
    es: TeamGuideData;
  };
  generationDiagnostics?: {
    ruleProfile: string;
    usedFallbackData: boolean;
    validationScore: number;
    validationIssues: string[];
    tournamentPriors?: {
      setId: string;
      sources: Array<{ source: string; sourceDate: string }>;
      activePackages: string[];
      activeLeadPairs: string[];
      modeMatch: "match" | "neutral" | "conflict" | "none";
    };
    feasibility?: TeamGenerationFeasibility;
  };
}

interface DynamicTeamOptions {
  format?: string;
  type?: string | null;
  excludeLegendaries?: boolean;
  fixedMembers?: string[] | null;
  templateId?: TemplateId;
  lang?: "en" | "es";
  dataOverride?: NormalizedSmogonData | null;
  rngSeed?: string;
}

interface CandidateTeamBuild {
  team: TeamMember[];
  guide: TeamGuideData;
  validation: TeamValidationResult;
}

interface TeamTrackingState {
  teamMoves: Set<string>;
  teamMoveCounts: Map<string, number>;
  teamAbilities: Set<string>;
  teamItems: Set<string>;
  teamCanonicalIds: Set<string>;
  restrictedCount: number;
}

interface RepairSwapCandidate extends CandidateTeamBuild {
  teamSpecies: PokemonSpecies[];
}

type RandomSource = () => number;

function createSeededRandom(seed?: string): RandomSource {
  if (!seed) {
    return Math.random;
  }

  let hash = 2166136261;
  for (let index = 0; index < seed.length; index += 1) {
    hash ^= seed.charCodeAt(index);
    hash = Math.imul(hash, 16777619);
  }

  return () => {
    hash += 0x6d2b79f5;
    let value = hash;
    value = Math.imul(value ^ (value >>> 15), value | 1);
    value ^= value + Math.imul(value ^ (value >>> 7), value | 61);
    return ((value ^ (value >>> 14)) >>> 0) / 4294967296;
  };
}

export async function generateDynamicTeam(
  options: DynamicTeamOptions = {}
): Promise<DynamicTeamResponse> {
  const {
    format = "gen9ou",
    type = null,
    excludeLegendaries = false,
    templateId = "balanced",
    lang = "en",
    fixedMembers,
    dataOverride,
    rngSeed,
  } = options;

  const rng = createSeededRandom(rngSeed);
  const gen = getGenFromFormat(format as FormatId) || 9;
  const formatProfile = getCompetitiveFormatProfile(format);
  const dataPromise = dataOverride ?? SmogonDataSource.getStats(format);
  const archetypeHintsPromise = formatProfile.isVgc
    ? getVGCArchetypes(format).catch(() => [])
    : Promise.resolve<string[]>([]);
  const [data, archetypeHints] = await Promise.all([
    dataPromise,
    archetypeHintsPromise,
  ]);
  const usedFallbackData = !data;
  const finalData: NormalizedSmogonData = data
    ? { ...data, meta: { ...data.meta } }
    : generateMockData(format, gen, formatProfile);

  if (type) {
    ensureTypeCandidateCoverage(finalData, {
      format,
      gen,
      type,
      excludeLegendaries,
    });
  }

  if (archetypeHints.length > 0) {
    finalData.meta.optionalArchetypeHints = archetypeHints;
  }
  const safeTemplateId = sanitizeTemplateForFormat(
    templateId as TemplateId | undefined,
    format as FormatId
  );
  const template: Template | undefined = TEMPLATES[safeTemplateId];
  const maxTeamSize = FORMATS[format as FormatId]?.maxTeamSize ?? 6;
  const feasibility = getTeamGenerationFeasibility({
    data: finalData,
    format,
    gen,
    type,
    excludeLegendaries,
    template,
    templateId: safeTemplateId,
  });
  const attempts = getGenerationAttempts(format, template, fixedMembers, maxTeamSize);
  let bestCandidate: CandidateTeamBuild | null = null;

  for (let attempt = 0; attempt < attempts; attempt += 1) {
    const candidate = buildCandidateTeam({
      data: finalData,
      format,
      gen,
      lang,
      type,
      maxTeamSize,
      template,
      templateId: safeTemplateId,
      excludeLegendaries,
      fixedMembers,
      formatProfile,
      feasibility,
      rng,
    });

    if (!bestCandidate || rankCandidate(candidate, maxTeamSize) > rankCandidate(bestCandidate, maxTeamSize)) {
      bestCandidate = candidate;
    }

    if (
      candidate.validation.score >= 0.94 &&
      candidate.validation.issues.length === 0 &&
      candidate.team.length === maxTeamSize
    ) {
      break;
    }
  }

  const selectedCandidate =
    bestCandidate ??
    buildCandidateTeam({
      data: finalData,
      format,
      gen,
      lang,
      type,
      maxTeamSize,
      template,
      templateId: safeTemplateId,
      excludeLegendaries,
      fixedMembers,
      formatProfile,
      feasibility,
      rng,
    });
  const finalizedCandidate = tryFinalizeTeamSets({
    candidate: selectedCandidate,
    data: finalData,
    format,
    gen,
    lang,
    maxTeamSize,
    template,
    templateId: safeTemplateId,
    formatProfile,
    feasibility,
  });

  const teamWithAnalysis = attachMemberAnalyses(
    finalizedCandidate.team,
    finalizedCandidate.guide
  );
  const tournamentPriorDiagnostics = getTournamentPriorDiagnostics({
    format,
    templateId: safeTemplateId,
    team: teamWithAnalysis,
    recommendedModes: finalizedCandidate.guide.recommendedModes,
  });
  const teamGuideEn =
    lang === "en"
      ? finalizedCandidate.guide
      : generateTeamGuide(teamWithAnalysis, {
        format,
        templateId: safeTemplateId,
        lang: "en",
      });
  const teamGuideEs =
    lang === "es"
      ? finalizedCandidate.guide
      : generateTeamGuide(teamWithAnalysis, {
        format,
        templateId: safeTemplateId,
        lang: "es",
      });

  return {
    team: teamWithAnalysis,
    archetype: selectedCandidate.guide.archetype,
    subarchetype: selectedCandidate.guide.subarchetype,
    dataProvenance:
      data?.meta.sourceInfo ?? {
        provider: "local",
        requestedFormat: format,
    },
    recommendedModes: finalizedCandidate.guide.recommendedModes,
    gameplan: finalizedCandidate.guide.phases,
    gameplanI18n: {
      en: teamGuideEn.phases,
      es: teamGuideEs.phases,
    },
    teamGuide: finalizedCandidate.guide,
    teamGuideI18n: {
      en: teamGuideEn,
      es: teamGuideEs,
    },
    generationDiagnostics: {
      ruleProfile: formatProfile.id,
      usedFallbackData,
      validationScore: finalizedCandidate.validation.score,
      validationIssues: finalizedCandidate.validation.issues,
      tournamentPriors: tournamentPriorDiagnostics ?? undefined,
      feasibility,
    },
  };
}

function ensureTypeCandidateCoverage(
  data: NormalizedSmogonData,
  options: {
    format: string;
    gen: number;
    type: string;
    excludeLegendaries: boolean;
  }
) {
  const requestedType = options.type.toLowerCase();
  const allowLowTierFillers = options.format.endsWith("lc");
  const isDoubles = FORMATS[options.format as FormatId]?.gameType === "doubles";
  const maxAugmentedCandidates = isDoubles ? 16 : 24;
  const rankedCandidates = DexProvider.getAllSpecies()
    .map((dexSpecies) => DexProvider.getSpeciesForGen(dexSpecies.name, options.gen))
    .filter((species): species is PokemonSpecies => Boolean(species))
    .filter((species) =>
      species.types.some((type) => type.toLowerCase() === requestedType)
    )
    .filter((species) => {
      if (!allowLowTierFillers && (species.tier === "LC" || species.tier === "NFE")) {
        return false;
      }
      if (species.evos && species.evos.length > 0) {
        const baseStatTotal = Object.values(species.baseStats).reduce(
          (sum, stat) => sum + stat,
          0
        );
        if (baseStatTotal < 460) {
          return false;
        }
      }
      if (
        options.excludeLegendaries &&
        isLegendaryOrParadoxSpecies(species.name)
      ) {
        return false;
      }
      if (
        options.gen === 9 &&
        !isAllowedInFormat(species.name, options.format as FormatId)
      ) {
        return false;
      }
      return true;
    })
    .sort(
      (left, right) =>
        getFallbackSpeciesScore(right, allowLowTierFillers) -
        getFallbackSpeciesScore(left, allowLowTierFillers)
    )
    .slice(0, maxAugmentedCandidates);

  rankedCandidates.forEach((species, index) => {
    const speciesId = toID(species.name);
    if (data.pokemon[speciesId]) {
      return;
    }

    const usageRate = Math.max(
      0.0015,
      (rankedCandidates.length - index) / Math.max(rankedCandidates.length * 10, 1)
    );

    data.pokemon[speciesId] = {
      name: species.name,
      usageRate,
      teammates: {},
      moves: {},
      items: {},
      abilities: {},
      teraTypes: {},
      spreads: [],
    };
  });
}

function convertToTeamMember(
  species: PokemonSpecies,
  set: OptimizedSet
): TeamMember {
  const statMap: Record<string, string> = {
    hp: "HP",
    atk: "Atk",
    def: "Def",
    spa: "SpA",
    spd: "SpD",
    spe: "Spe",
  };
  const evsStr = Object.entries(set.evs)
    .filter((entry) => entry[1] > 0)
    .map(
      ([stat, value]) =>
        `${value} ${statMap[stat.toLowerCase()] || stat.toUpperCase()}`
    )
    .join(" / ");

  return {
    num: species.num,
    name: species.name,
    types: species.types,
    baseStats: species.baseStats,
    abilities: species.abilities,
    item: set.item,
    ability: set.ability,
    moves: set.moves,
    nature: set.nature,
    evs: evsStr,
    role: detectSetRole(set),
    teraType: set.teraType || "Stellar",
  };
}

function matchesTemplateRole(
  templateId: TemplateId,
  targetRole: Role,
  candidateRole: Role,
  species: PokemonSpecies,
  set: OptimizedSet
) {
  if (candidateRole === targetRole) {
    return true;
  }

  if (templateId === "trickroom") {
    const knowsTrickRoom = set.moves.some(
      (move) => toID(move) === toID("Trick Room")
    );
    if (targetRole === "Support" && knowsTrickRoom) {
      return true;
    }
    if (
      targetRole === "Sweeper" &&
      candidateRole === "Tank" &&
      species.baseStats.spe <= 70
    ) {
      return true;
    }
  }

  return false;
}

function pickWeightedSuggestionIndex(weights: number[], rng: RandomSource) {
  const totalWeight = weights.reduce((sum, weight) => sum + weight, 0);
  let roll = rng() * Math.max(totalWeight, 0.0001);
  let selectedIndex = 0;

  for (let i = 0; i < weights.length; i += 1) {
    roll -= weights[i];
    if (roll <= 0) {
      selectedIndex = i;
      break;
    }
  }

  return selectedIndex;
}

function getGenerationAttempts(
  format: string,
  template: Template | undefined,
  fixedMembers: string[] | null | undefined,
  maxTeamSize: number
) {
  if ((fixedMembers?.length ?? 0) >= maxTeamSize - 1) {
    return 1;
  }

  const isDoubles = FORMATS[format as FormatId]?.gameType === "doubles";
  let attempts = isDoubles ? 6 : 4;

  if ((template?.requiredCore?.length ?? 0) > 0) {
    attempts += 2;
  }
  if ((template?.forbiddenPatterns?.length ?? 0) > 0) {
    attempts += 1;
  }

  return Math.min(8, attempts);
}

function rankCandidate(candidate: CandidateTeamBuild, maxTeamSize: number) {
  const completeness = candidate.team.length / Math.max(maxTeamSize, 1);
  const issuePenalty = candidate.validation.issues.length * 0.015;
  return candidate.validation.score + completeness * 0.08 - issuePenalty;
}

const WEATHER_PAYOFF_RULES: Record<
  "rain" | "sun" | "sand" | "weatheroffense",
  { abilities: string[]; moves: string[] }
> = {
  rain: {
    abilities: ["Swift Swim", "Rain Dish", "Dry Skin", "Hydration", "Water Absorb", "Storm Drain"],
    moves: ["Weather Ball", "Hurricane", "Thunder"],
  },
  sun: {
    abilities: ["Chlorophyll", "Solar Power", "Flower Gift", "Protosynthesis"],
    moves: ["Weather Ball", "Growth", "Solar Beam", "Morning Sun"],
  },
  sand: {
    abilities: ["Sand Rush", "Sand Force", "Sand Veil"],
    moves: [],
  },
  weatheroffense: {
    abilities: [
      "Swift Swim",
      "Chlorophyll",
      "Sand Rush",
      "Solar Power",
      "Sand Force",
      "Protosynthesis",
      "Slush Rush",
    ],
    moves: ["Weather Ball", "Hurricane", "Thunder", "Blizzard", "Growth"],
  },
};

function teamHasAnyTemplateAbility(teamAbilities: Set<string>, abilities: string[] = []) {
  return abilities.some((ability) => teamAbilities.has(toID(ability)));
}

function setHasAnyMove(moves: Array<string | MoveData>, moveNames: string[]) {
  const moveIds = new Set(
    moves.map((move) => toID(typeof move === "string" ? move : move.name))
  );
  return moveNames.some((moveName) => moveIds.has(toID(moveName)));
}

function countWeatherPayoffMembers(team: TeamMember[], templateId: TemplateId) {
  const payoff = WEATHER_PAYOFF_RULES[templateId as keyof typeof WEATHER_PAYOFF_RULES];
  if (!payoff) return 0;

  return team.filter((member) =>
    payoff.abilities.some((ability) => toID(member.ability) === toID(ability)) ||
    setHasAnyMove(member.moves, payoff.moves)
  ).length;
}

function teamHasAnyRequiredMove(teamMoves: Set<string>, moves: string[] = []) {
  return moves.some((move) => teamMoves.has(toID(move)));
}

function createEmptyTeamTrackingState(): TeamTrackingState {
  return {
    teamMoves: new Set<string>(),
    teamMoveCounts: new Map<string, number>(),
    teamAbilities: new Set<string>(),
    teamItems: new Set<string>(),
    teamCanonicalIds: new Set<string>(),
    restrictedCount: 0,
  };
}

function rebuildTeamTrackingState(
  team: TeamMember[],
  teamSpecies: PokemonSpecies[],
  tracking: TeamTrackingState
) {
  tracking.teamMoves.clear();
  tracking.teamMoveCounts.clear();
  tracking.teamAbilities.clear();
  tracking.teamItems.clear();
  tracking.teamCanonicalIds.clear();
  tracking.restrictedCount = 0;

  team.forEach((member, index) => {
    const species = teamSpecies[index];
    if (species) {
      tracking.teamCanonicalIds.add(getCanonicalSpeciesId(species));
      if (isRestrictedLegendarySpecies(species.name)) {
        tracking.restrictedCount += 1;
      }
    }

    member.moves.forEach((move) => {
      const moveId = toID(typeof move === "string" ? move : move.name);
      tracking.teamMoves.add(moveId);
      tracking.teamMoveCounts.set(moveId, (tracking.teamMoveCounts.get(moveId) ?? 0) + 1);
    });
    tracking.teamAbilities.add(toID(member.ability));
    tracking.teamItems.add(member.item);
  });
}

const REPAIR_PRIORITY_ORDER = [
  "screens-or-hazards",
  "lead-pressure",
  "hazards",
  "removal",
  "pivoting",
  "setup",
  "speed-control",
  "knock-off",
  "rocks",
  "stacking-hazards",
  "pivot-core",
  "recovery-backbone",
  "rain-abusers",
  "sun-abusers",
  "sand-abusers",
];

function getRepairNeeds(validation: TeamValidationResult) {
  const needs = [
    ...validation.missingSupportPackages,
    ...validation.missingCore,
  ];
  const seen = new Set<string>();

  return needs
    .filter((need) => {
      if (seen.has(need)) {
        return false;
      }
      seen.add(need);
      return true;
    })
    .sort((left, right) => {
      const leftIndex = REPAIR_PRIORITY_ORDER.indexOf(left);
      const rightIndex = REPAIR_PRIORITY_ORDER.indexOf(right);
      return (
        (leftIndex === -1 ? REPAIR_PRIORITY_ORDER.length : leftIndex) -
        (rightIndex === -1 ? REPAIR_PRIORITY_ORDER.length : rightIndex)
      );
    });
}

function bundleMatchesRepairNeed(
  species: PokemonSpecies,
  set: OptimizedSet,
  repairNeed: string
) {
  const bulk =
    species.baseStats.hp + species.baseStats.def + species.baseStats.spd;
  const moveNames = set.moves.map((move) => String(move));
  const abilityId = toID(set.ability);

  switch (repairNeed) {
    case "screens-or-hazards":
      return setHasAnyMove(moveNames, [...SCREEN_MOVES, ...HAZARD_MOVES]);
    case "lead-pressure":
      return setHasAnyMove(moveNames, [...LEAD_PRESSURE_MOVES, ...HAZARD_MOVES, ...SCREEN_MOVES]);
    case "hazards":
      return setHasAnyMove(moveNames, HAZARD_MOVES);
    case "removal":
      return setHasAnyMove(moveNames, REMOVAL_MOVES);
    case "pivoting":
    case "pivot-core":
      return setHasAnyMove(moveNames, PIVOT_MOVES);
    case "setup":
      return setHasAnyMove(moveNames, SETUP_MOVES);
    case "speed-control":
      return setHasAnyMove(moveNames, [
        "Tailwind",
        "Thunder Wave",
        "Icy Wind",
        "Electroweb",
        "Trick Room",
      ]);
    case "knock-off":
      return setHasAnyMove(moveNames, ["Knock Off"]);
    case "rocks":
      return setHasAnyMove(moveNames, ["Stealth Rock"]);
    case "stacking-hazards":
      return setHasAnyMove(moveNames, STACKING_HAZARD_MOVES);
    case "recovery-backbone":
      return bulk >= 280 && setHasAnyMove(moveNames, RECOVERY_MOVES);
    case "rain-abusers":
      return (
        WEATHER_PAYOFF_RULES.rain.abilities.some((ability) => abilityId === toID(ability)) ||
        setHasAnyMove(moveNames, WEATHER_PAYOFF_RULES.rain.moves)
      );
    case "sun-abusers":
      return (
        WEATHER_PAYOFF_RULES.sun.abilities.some((ability) => abilityId === toID(ability)) ||
        setHasAnyMove(moveNames, WEATHER_PAYOFF_RULES.sun.moves) ||
        (species.types.includes("Fire") && moveNames.some((moveName) => {
          const moveId = toID(moveName);
          return moveId === toID("Flamethrower") || moveId === toID("Fire Blast") || moveId === toID("Lava Plume");
        }))
      );
    case "sand-abusers":
      return WEATHER_PAYOFF_RULES.sand.abilities.some((ability) => abilityId === toID(ability));
    default:
      return false;
  }
}

function bundleMatchesRepairNeeds(
  species: PokemonSpecies,
  set: OptimizedSet,
  repairNeeds: string[]
) {
  return repairNeeds.some((repairNeed) =>
    bundleMatchesRepairNeed(species, set, repairNeed)
  );
}

function getRepairCoverageCount(
  species: PokemonSpecies,
  set: OptimizedSet,
  repairNeeds: string[]
) {
  return repairNeeds.filter((repairNeed) =>
    bundleMatchesRepairNeed(species, set, repairNeed)
  ).length;
}

function findBestRepairSwap(options: {
  team: TeamMember[];
  teamSpecies: PokemonSpecies[];
  data: NormalizedSmogonData;
  format: string;
  gen: number;
  lang: "en" | "es";
  type?: string | null;
  maxTeamSize: number;
  template?: Template;
  templateId: TemplateId;
  excludeLegendaries?: boolean;
  formatProfile: CompetitiveFormatProfile;
  fixedCanonicalIds: Set<string>;
  repairNeeds: string[];
  feasibility: TeamGenerationFeasibility;
  rng: RandomSource;
}): RepairSwapCandidate | null {
  const optimizer = new SetOptimizer(options.data);
  const needsExpandedHazardSearch = options.repairNeeds.some((repairNeed) =>
    [
      "screens-or-hazards",
      "lead-pressure",
      "hazards",
      "rocks",
      "stacking-hazards",
    ].includes(repairNeed)
  );
  const replaceableIndices = options.teamSpecies
    .map((_, index) => index)
    .filter(
      (index) =>
        !options.fixedCanonicalIds.has(
          getCanonicalSpeciesId(options.teamSpecies[index])
        )
    )
    .reverse()
    .slice(0, needsExpandedHazardSearch ? 3 : 2);
  let bestCandidate: RepairSwapCandidate | null = null;
  let bestScore = Number.NEGATIVE_INFINITY;

  for (const slotIndex of replaceableIndices) {
    const baseTeam = options.team.filter((_, index) => index !== slotIndex);
    const baseSpecies = options.teamSpecies.filter((_, index) => index !== slotIndex);
    const tracking = createEmptyTeamTrackingState();
    rebuildTeamTrackingState(baseTeam, baseSpecies, tracking);
    const engine = new WeightedScoringEngine(options.format, options.gen, options.data, {
      excludeLegendaries: options.excludeLegendaries,
      requiredType: options.type,
      template: options.template,
      getTeamMoves: () => tracking.teamMoves,
      getTeamMoveCounts: () => tracking.teamMoveCounts,
      getTeamAbilities: () => tracking.teamAbilities,
      getTeamItems: () => tracking.teamItems,
      getTeamRoles: () => baseTeam.map((member) => member.role),
      getCandidateBundle: (candidate, currentTeam) =>
        optimizer.optimizeBundle(candidate, currentTeam, {
          template: options.template,
          teamMoves: tracking.teamMoves,
          teamMoveCounts: tracking.teamMoveCounts,
          teamAbilities: tracking.teamAbilities,
          teamItems: tracking.teamItems,
          format: options.format,
        }),
    });
    const suggestions = engine.suggestMembers(
      baseSpecies,
      needsExpandedHazardSearch ? 64 : 48
    );

    if (suggestions.length === 0) {
      continue;
    }

    const prioritizedSuggestions = prioritizeSuggestionsWithTournamentPriors({
      format: options.format,
      templateId: options.templateId,
      currentTeam: baseTeam,
      suggestions,
      rng: options.rng,
    });
    const evaluationQueue = needsExpandedHazardSearch
      ? prioritizedSuggestions
      : prioritizedSuggestions.slice(0, 8);
    const shortlistedCandidates: Array<{
      suggestion: (typeof evaluationQueue)[number];
      set: OptimizedSet;
      candidateSpecies: PokemonSpecies;
      preliminaryScore: number;
    }> = [];

    for (const suggestion of evaluationQueue) {
      const set = optimizer.optimize(suggestion.species, baseSpecies, {
        template: options.template,
        teamMoves: tracking.teamMoves,
        teamMoveCounts: tracking.teamMoveCounts,
        teamAbilities: tracking.teamAbilities,
        teamItems: tracking.teamItems,
        format: options.format,
      });

      if (
        !isResolvedSetViable(
          set,
          tracking.teamCanonicalIds,
          tracking.teamItems,
          suggestion.species,
          options.formatProfile,
          tracking.restrictedCount
        )
      ) {
        continue;
      }

      if (
        options.repairNeeds.length > 0 &&
        !bundleMatchesRepairNeeds(suggestion.species, set, options.repairNeeds)
      ) {
        continue;
      }

      const repairCoverage = getRepairCoverageCount(
        suggestion.species,
        set,
        options.repairNeeds
      );
      const primaryNeedCovered = options.repairNeeds[0]
        ? bundleMatchesRepairNeed(suggestion.species, set, options.repairNeeds[0])
        : false;
      shortlistedCandidates.push({
        suggestion,
        set,
        candidateSpecies: suggestion.species,
        preliminaryScore:
          suggestion.score +
          repairCoverage * 0.32 +
          (primaryNeedCovered ? 0.18 : 0),
      });
    }

    const finalEvaluationQueue = shortlistedCandidates
      .sort((left, right) => right.preliminaryScore - left.preliminaryScore)
      .slice(0, needsExpandedHazardSearch ? 4 : 3);

    for (const candidate of finalEvaluationQueue) {
      const { suggestion, set } = candidate;

      const candidateTeam = [...baseTeam];
      const candidateSpecies = [...baseSpecies];
      candidateTeam.splice(slotIndex, 0, convertToTeamMember(suggestion.species, set));
      candidateSpecies.splice(slotIndex, 0, suggestion.species);

      const candidateGuide = generateTeamGuide(candidateTeam, {
        format: options.format,
        templateId: options.templateId,
        lang: options.lang,
      });
      const candidateValidation = validateTeamForTemplate(candidateTeam, candidateGuide, {
        format: options.format,
        templateId: options.templateId,
        template: options.template,
        archetypeHints: options.data.meta.optionalArchetypeHints,
        feasibility: options.feasibility,
      });
      const repairCoverage = getRepairCoverageCount(
        suggestion.species,
        set,
        options.repairNeeds
      );
      const candidateScore =
        rankCandidate(
          {
            team: candidateTeam,
            guide: candidateGuide,
            validation: candidateValidation,
          },
          options.maxTeamSize
        ) + repairCoverage * 0.025;

      if (candidateScore > bestScore) {
        bestScore = candidateScore;
        bestCandidate = {
          team: candidateTeam,
          teamSpecies: candidateSpecies,
          guide: candidateGuide,
          validation: candidateValidation,
        };
      }
    }
  }

  return bestCandidate;
}

function tryRepairCandidateTeam(options: {
  team: TeamMember[];
  teamSpecies: PokemonSpecies[];
  data: NormalizedSmogonData;
  format: string;
  gen: number;
  lang: "en" | "es";
  type?: string | null;
  maxTeamSize: number;
  template?: Template;
  templateId: TemplateId;
  excludeLegendaries?: boolean;
  formatProfile: CompetitiveFormatProfile;
  fixedCanonicalIds: Set<string>;
  guide: TeamGuideData;
  validation: TeamValidationResult;
  feasibility: TeamGenerationFeasibility;
  rng: RandomSource;
}): CandidateTeamBuild {
  const repairEligibleTemplates = new Set<TemplateId>([
    "offense",
    "bulkyoffense",
    "voltturn",
    "hazardstack",
  ]);
  if (
    options.formatProfile.isDoubles ||
    !repairEligibleTemplates.has(options.templateId) ||
    (options.validation.missingSupportPackages.length === 0 &&
      options.validation.missingCore.length === 0)
  ) {
    return {
      team: options.team,
      guide: options.guide,
      validation: options.validation,
    };
  }

  let currentTeam = [...options.team];
  let currentSpecies = [...options.teamSpecies];
  let currentGuide = options.guide;
  let currentValidation = options.validation;
  const maxRepairPasses = 1;

  for (let pass = 0; pass < maxRepairPasses; pass += 1) {
    const repairNeeds = getRepairNeeds(currentValidation);
    if (repairNeeds.length === 0) {
      break;
    }

    const repairedCandidate = findBestRepairSwap({
      ...options,
      team: currentTeam,
      teamSpecies: currentSpecies,
      repairNeeds,
    });
    if (!repairedCandidate) {
      break;
    }

    const currentScore = rankCandidate(
      {
        team: currentTeam,
        guide: currentGuide,
        validation: currentValidation,
      },
      options.maxTeamSize
    );
    const repairedScore = rankCandidate(repairedCandidate, options.maxTeamSize);

    if (repairedScore <= currentScore + 0.01) {
      break;
    }

    currentTeam = repairedCandidate.team;
    currentSpecies = repairedCandidate.teamSpecies;
    currentGuide = repairedCandidate.guide;
    currentValidation = repairedCandidate.validation;

    if (currentValidation.score >= 0.94 && currentValidation.issues.length === 0) {
      break;
    }
  }

  return {
    team: currentTeam,
    guide: currentGuide,
    validation: currentValidation,
  };
}

function areEquivalentTeamMembers(left: TeamMember, right: TeamMember) {
  return (
    left.name === right.name &&
    left.item === right.item &&
    left.ability === right.ability &&
    left.nature === right.nature &&
    left.evs === right.evs &&
    left.teraType === right.teraType &&
    left.moves.length === right.moves.length &&
    left.moves.every((move, index) => move === right.moves[index])
  );
}

function tryFinalizeTeamSets(options: {
  candidate: CandidateTeamBuild;
  data: NormalizedSmogonData;
  format: string;
  gen: number;
  lang: "en" | "es";
  maxTeamSize: number;
  template?: Template;
  templateId: TemplateId;
  formatProfile: CompetitiveFormatProfile;
  feasibility: TeamGenerationFeasibility;
}): CandidateTeamBuild {
  const eligibleTemplates = new Set<TemplateId>([
    "semistall",
    "stall",
  ]);

  if (
    options.formatProfile.isDoubles ||
    options.candidate.team.length < 2 ||
    !eligibleTemplates.has(options.templateId) ||
    options.candidate.validation.score >= 0.9
  ) {
    return options.candidate;
  }

  const teamSpecies = options.candidate.team
    .map((member) => DexProvider.getSpeciesForGen(member.name, options.gen))
    .filter((species): species is PokemonSpecies => Boolean(species));

  if (teamSpecies.length !== options.candidate.team.length) {
    return options.candidate;
  }

  const optimizer = new SetOptimizer(options.data);
  const recalibratedTeam = options.candidate.team.map((member, index) => {
    const species = teamSpecies[index];
    const otherTeam = options.candidate.team.filter((_, teamIndex) => teamIndex !== index);
    const otherSpecies = teamSpecies.filter((_, teamIndex) => teamIndex !== index);
    const tracking = createEmptyTeamTrackingState();
    rebuildTeamTrackingState(otherTeam, otherSpecies, tracking);

    const set = optimizer.optimize(species, otherSpecies, {
      template: options.template,
      teamMoves: tracking.teamMoves,
      teamMoveCounts: tracking.teamMoveCounts,
      teamAbilities: tracking.teamAbilities,
      teamItems: tracking.teamItems,
      format: options.format,
    });

    if (
      !isResolvedSetViable(
        set,
        tracking.teamCanonicalIds,
        tracking.teamItems,
        species,
        options.formatProfile,
        tracking.restrictedCount
      )
    ) {
      return member;
    }

    return convertToTeamMember(species, set);
  });

  const changed = recalibratedTeam.some(
    (member, index) => !areEquivalentTeamMembers(member, options.candidate.team[index])
  );
  if (!changed) {
    return options.candidate;
  }

  const recalibratedGuide = generateTeamGuide(recalibratedTeam, {
    format: options.format,
    templateId: options.templateId,
    lang: options.lang,
  });
  const recalibratedValidation = validateTeamForTemplate(recalibratedTeam, recalibratedGuide, {
    format: options.format,
    templateId: options.templateId,
    template: options.template,
    archetypeHints: options.data.meta.optionalArchetypeHints,
    feasibility: options.feasibility,
  });
  const recalibratedCandidate = {
    team: recalibratedTeam,
    guide: recalibratedGuide,
    validation: recalibratedValidation,
  };
  const supportWorsened =
    recalibratedValidation.missingCore.length > options.candidate.validation.missingCore.length ||
    recalibratedValidation.missingSupportPackages.length >
      options.candidate.validation.missingSupportPackages.length;
  const recalibratedRank = rankCandidate(recalibratedCandidate, options.maxTeamSize);
  const currentRank = rankCandidate(options.candidate, options.maxTeamSize);

  if (
    supportWorsened ||
    recalibratedValidation.score + 0.01 < options.candidate.validation.score ||
    recalibratedRank + 0.005 < currentRank
  ) {
    return options.candidate;
  }

  return recalibratedCandidate;
}

const DOUBLES_SPEED_CONTROL_MOVE_IDS = new Set(
  ["Tailwind", "Trick Room", "Icy Wind", "Electroweb", "Thunder Wave"].map(toID)
);
const DOUBLES_POSITIONING_MOVE_IDS = new Set(
  [
    "Fake Out",
    "Follow Me",
    "Rage Powder",
    "Helping Hand",
    "Wide Guard",
    "Quick Guard",
    "Parting Shot",
    "U-turn",
    "Volt Switch",
    "Flip Turn",
  ].map(toID)
);
const HAZARD_MOVE_IDS = new Set(
  ["Stealth Rock", "Spikes", "Toxic Spikes", "Sticky Web", "Ceaseless Edge"].map(
    toID
  )
);

function getSetMoveIds(moves: Array<string | MoveData>) {
  return new Set(
    moves.map((move) => toID(typeof move === "string" ? move : move.name))
  );
}

function hasPositioningMove(moves: Array<string | MoveData>) {
  const moveIds = getSetMoveIds(moves);
  return Array.from(DOUBLES_POSITIONING_MOVE_IDS).some((moveId) =>
    moveIds.has(moveId)
  );
}

function hasSpeedControlMove(moves: Array<string | MoveData>) {
  const moveIds = getSetMoveIds(moves);
  return Array.from(DOUBLES_SPEED_CONTROL_MOVE_IDS).some((moveId) =>
    moveIds.has(moveId)
  );
}

function isFastDamageSet(
  species: Pick<PokemonSpecies, "baseStats">,
  moves: Array<string | MoveData>
) {
  const maxOffense = Math.max(species.baseStats.atk, species.baseStats.spa);
  const moveIds = getSetMoveIds(moves);

  return (
    species.baseStats.spe >= 90 &&
    maxOffense >= 100 &&
    (!moveIds.has(toID("Trick Room")) || moveIds.has(toID("Tailwind")))
  );
}

function isSlowBreakerSet(
  species: Pick<PokemonSpecies, "baseStats">,
  moves: Array<string | MoveData>
) {
  const maxOffense = Math.max(species.baseStats.atk, species.baseStats.spa);
  const moveIds = getSetMoveIds(moves);

  return (
    species.baseStats.spe <= 70 &&
    maxOffense >= 100 &&
    !moveIds.has(toID("Tailwind"))
  );
}

function hasCleanerProfile(
  species: Pick<PokemonSpecies, "baseStats">,
  moves: Array<string | MoveData>
) {
  const maxOffense = Math.max(species.baseStats.atk, species.baseStats.spa);
  const moveIds = getSetMoveIds(moves);

  return (
    maxOffense >= 105 &&
    (species.baseStats.spe >= 95 ||
      moveIds.has(toID("Tailwind")) ||
      moveIds.has(toID("Icy Wind")))
  );
}

function countTeamMembersWithPredicate(
  team: TeamMember[],
  predicate: (member: TeamMember) => boolean
) {
  return team.reduce((count, member) => count + (predicate(member) ? 1 : 0), 0);
}

function narrowDoublesSuggestionsForFormatProfile(options: {
  currentTeam: TeamMember[];
  withBundle: Array<{
    suggestion: ReturnType<WeightedScoringEngine["suggestMembers"]>[number];
    bundle: OptimizedSet;
  }>;
  templateId: TemplateId;
  formatProfile: CompetitiveFormatProfile;
}) {
  const { currentTeam, withBundle, templateId, formatProfile } = options;

  if (!formatProfile.isDoubles || withBundle.length === 0) {
    return withBundle;
  }

  const teamHasTailwind = countTeamMembersWithPredicate(currentTeam, (member) =>
    setHasAnyMove(member.moves, ["Tailwind"])
  ) > 0;
  const teamHasTrickRoom = countTeamMembersWithPredicate(currentTeam, (member) =>
    setHasAnyMove(member.moves, ["Trick Room"])
  ) > 0;
  const teamSpeedControlCount = countTeamMembersWithPredicate(
    currentTeam,
    (member) => hasSpeedControlMove(member.moves)
  );
  const teamPositioningCount = countTeamMembersWithPredicate(
    currentTeam,
    (member) => hasPositioningMove(member.moves)
  );
  const teamFastPayoffCount = countTeamMembersWithPredicate(currentTeam, (member) =>
    isFastDamageSet(member, member.moves)
  );
  const teamSlowBreakerCount = countTeamMembersWithPredicate(
    currentTeam,
    (member) => isSlowBreakerSet(member, member.moves)
  );
  const teamCleanerCount = countTeamMembersWithPredicate(currentTeam, (member) =>
    hasCleanerProfile(member, member.moves)
  );

  const filterMatching = (
    predicate: (entry: (typeof withBundle)[number]) => boolean
  ) => {
    const filtered = withBundle.filter(predicate);
    return filtered.length > 0 ? filtered : withBundle;
  };

  if (templateId === "tailwind") {
    if (!teamHasTailwind) {
      return filterMatching(({ bundle }) => setHasAnyMove(bundle.moves, ["Tailwind"]));
    }
    if (teamFastPayoffCount < 2) {
      return filterMatching(({ suggestion, bundle }) =>
        isFastDamageSet(suggestion.species, bundle.moves)
      );
    }
    if (teamPositioningCount === 0) {
      return filterMatching(({ bundle }) => hasPositioningMove(bundle.moves));
    }
    return withBundle;
  }

  if (templateId === "trickroom") {
    if (!teamHasTrickRoom) {
      return filterMatching(({ bundle }) =>
        setHasAnyMove(bundle.moves, ["Trick Room"])
      );
    }
    if (teamSlowBreakerCount < 2) {
      return filterMatching(({ suggestion, bundle }) =>
        isSlowBreakerSet(suggestion.species, bundle.moves)
      );
    }
    if (teamPositioningCount === 0) {
      return filterMatching(({ bundle }) => hasPositioningMove(bundle.moves));
    }
    return withBundle;
  }

  if (templateId === "balanced" && formatProfile.isDoubles) {
    if (teamSpeedControlCount === 0) {
      return filterMatching(({ bundle }) => hasSpeedControlMove(bundle.moves));
    }
    if (teamPositioningCount === 0) {
      return filterMatching(({ bundle }) => hasPositioningMove(bundle.moves));
    }
    if (teamCleanerCount === 0) {
      return filterMatching(({ suggestion, bundle }) =>
        hasCleanerProfile(suggestion.species, bundle.moves)
      );
    }
  }

  return withBundle;
}

function narrowSuggestionsForTemplateState(options: {
  suggestions: ReturnType<WeightedScoringEngine["suggestMembers"]>;
  optimizer: SetOptimizer;
  teamSpecies: PokemonSpecies[];
  template: Template | undefined;
  templateId: TemplateId;
  formatProfile: CompetitiveFormatProfile;
  teamMoves: Set<string>;
  teamMoveCounts: Map<string, number>;
  teamAbilities: Set<string>;
  format: string;
  currentTeam: TeamMember[];
}) {
  const {
    suggestions,
    optimizer,
    teamSpecies,
    template,
    templateId,
    formatProfile,
    teamMoves,
    teamMoveCounts,
    teamAbilities,
    format,
    currentTeam,
  } = options;

  if (!template || suggestions.length === 0) {
    return suggestions;
  }

  const withBundle = suggestions.map((suggestion) => {
    const bundle = optimizer.optimizeBundle(suggestion.species, teamSpecies, {
      template,
      teamMoves,
      teamMoveCounts,
      teamAbilities,
      format,
    });

    return {
      suggestion,
      bundle,
    };
  });

  const missingRequiredAbilities =
    (template.requiredAbilities ?? []).length > 0 &&
    !teamHasAnyTemplateAbility(teamAbilities, template.requiredAbilities);
  if (missingRequiredAbilities) {
    const matching = withBundle.filter(({ bundle }) =>
      (template.requiredAbilities ?? []).some(
        (ability) => toID(bundle.ability) === toID(ability)
      )
    );
    if (matching.length > 0) {
      return matching.map(({ suggestion }) => suggestion);
    }
  }

  const missingRequiredMoves =
    (template.requiredMoves ?? []).length > 0 &&
    !(template.requiredMoves ?? []).some((move) => teamMoves.has(toID(move)));
  if (missingRequiredMoves) {
    const matching = withBundle.filter(({ bundle }) =>
      setHasAnyMove(bundle.moves, template.requiredMoves ?? [])
    );
    if (matching.length > 0) {
      return matching.map(({ suggestion }) => suggestion);
    }
  }

  if (["rain", "sun", "sand", "weatheroffense"].includes(templateId)) {
    const payoff = WEATHER_PAYOFF_RULES[templateId as keyof typeof WEATHER_PAYOFF_RULES];
    const currentPayoffCount = countWeatherPayoffMembers(currentTeam, templateId);
    if (payoff && currentPayoffCount < 2) {
      const matching = withBundle.filter(({ bundle }) =>
        payoff.abilities.some((ability) => toID(bundle.ability) === toID(ability)) ||
        setHasAnyMove(bundle.moves, payoff.moves)
      );
      if (matching.length > 0) {
        return matching.map(({ suggestion }) => suggestion);
      }
    }
  }

  return narrowDoublesSuggestionsForFormatProfile({
    currentTeam,
    templateId,
    formatProfile,
    withBundle,
  }).map(({ suggestion }) => suggestion);
}

function prioritizeSuggestionsWithTournamentPriors(options: {
  format: string;
  templateId: TemplateId;
  currentTeam: TeamMember[];
  suggestions: ReturnType<WeightedScoringEngine["suggestMembers"]>;
  rng: RandomSource;
}) {
  const selectionPlan = getTournamentPriorSelectionPlan({
    format: options.format,
    templateId: options.templateId,
    currentTeam: options.currentTeam,
  });

  if (selectionPlan.candidates.length === 0) {
    return options.suggestions;
  }

  const candidatePlan = new Map(
    selectionPlan.candidates.map((entry) => [entry.candidateId, entry])
  );

  return options.suggestions
    .map((suggestion) => {
      const entry = candidatePlan.get(toID(suggestion.species.name));
      if (!entry) {
        return suggestion;
      }

      const boostApplied =
        options.rng() <= entry.pickRate
          ? entry.scoreBoost
          : 1 + (entry.scoreBoost - 1) * 0.3;
      const jitter =
        entry.tier === "anchor"
          ? 0.96 + options.rng() * 0.1
          : entry.tier === "core"
            ? 0.94 + options.rng() * 0.12
            : 0.92 + options.rng() * 0.14;

      return {
        ...suggestion,
        score: suggestion.score * boostApplied * jitter,
      };
    })
    .sort((a, b) => b.score - a.score);
}

function buildCandidateTeam(options: {
  data: NormalizedSmogonData;
  format: string;
  gen: number;
  lang: "en" | "es";
  type?: string | null;
  maxTeamSize: number;
  template?: Template;
  templateId: TemplateId;
  excludeLegendaries?: boolean;
  fixedMembers?: string[] | null;
  formatProfile: CompetitiveFormatProfile;
  feasibility: TeamGenerationFeasibility;
  rng: RandomSource;
}): CandidateTeamBuild {
  const {
    data,
    format,
    gen,
    lang,
    type,
    maxTeamSize,
    template,
    templateId,
    excludeLegendaries,
    fixedMembers,
    formatProfile,
    feasibility,
    rng,
  } = options;

  const team: TeamMember[] = [];
  const teamSpecies: PokemonSpecies[] = [];
  const teamMoves = new Set<string>();
  const teamMoveCounts = new Map<string, number>();
  const teamAbilities = new Set<string>();
  const teamItems = new Set<string>();
  const teamCanonicalIds = new Set<string>();
  const fixedCanonicalIds = new Set<string>();
  const processedFixedCanonicalIds = new Set<string>();
  let teamRestrictedCount = 0;
  const optimizer = new SetOptimizer(data);
  const trySelectViableSuggestion = (
    suggestions: ReturnType<WeightedScoringEngine["suggestMembers"]>
  ) => {
    const remaining = [...suggestions];

    while (remaining.length > 0) {
      const weights = remaining.map((suggestion, index) =>
        suggestion.score * Math.pow(0.6, index)
      );
      const selectedIndex = pickWeightedSuggestionIndex(weights, rng);
      const selected = remaining[selectedIndex];
      const set = optimizer.optimize(selected.species, teamSpecies, {
        template,
        teamMoves,
        teamMoveCounts,
        teamAbilities,
        teamItems,
        format,
      });

      if (
        isResolvedSetViable(
          set,
          teamCanonicalIds,
          teamItems,
          selected.species,
          formatProfile,
          teamRestrictedCount
        )
      ) {
        return { selected, set };
      }

      remaining.splice(selectedIndex, 1);
      optimizer.clearCache();
    }

    return null;
  };

  const engine = new WeightedScoringEngine(format, gen, data, {
    excludeLegendaries,
    requiredType: type,
    template,
    getTeamMoves: () => teamMoves,
    getTeamMoveCounts: () => teamMoveCounts,
    getTeamAbilities: () => teamAbilities,
    getTeamItems: () => teamItems,
    getTeamRoles: () => team.map((member) => member.role),
    getCandidateBundle: (candidate, currentTeam) =>
      optimizer.optimizeBundle(candidate, currentTeam, {
        template,
        teamMoves,
        teamMoveCounts,
        teamAbilities,
        teamItems,
        format,
      }),
    getCandidateRole: (candidate, currentTeam) => {
      const set = optimizer.optimizeBundle(candidate, currentTeam, {
        template,
        teamMoves,
        teamMoveCounts,
        teamAbilities,
        teamItems,
        format,
      });
      return detectSetRole(set);
    },
  });

  if (fixedMembers && fixedMembers.length > 0) {
    for (const fixed of fixedMembers) {
      if (team.length >= maxTeamSize) break;
      const species = DexProvider.getSpeciesForGen(fixed, gen);
      if (!species) continue;
      if (
        excludeLegendaries &&
        isLegendaryOrParadoxSpecies(species.name)
      ) {
        continue;
      }
      if (
        formatProfile.isDoubles &&
        gen === 9 &&
        !isAllowedInFormat(species.name, format as FormatId)
      ) {
        continue;
      }
      const canonicalId = getCanonicalSpeciesId(species);
      if (processedFixedCanonicalIds.has(canonicalId)) continue;
      processedFixedCanonicalIds.add(canonicalId);
      if (teamCanonicalIds.has(canonicalId)) continue;

      const set = optimizer.optimize(species, teamSpecies, {
        template,
        teamMoves,
        teamMoveCounts,
        teamAbilities,
        teamItems,
        format,
      });
      if (
        !isResolvedSetViable(
          set,
          teamCanonicalIds,
          teamItems,
          species,
          formatProfile,
          teamRestrictedCount
        )
      ) {
        optimizer.clearCache();
        continue;
      }

      const member = convertToTeamMember(species, set);
      team.push(member);
      teamSpecies.push(species);
      teamCanonicalIds.add(canonicalId);
      fixedCanonicalIds.add(canonicalId);
      if (isRestrictedLegendarySpecies(species.name)) {
        teamRestrictedCount += 1;
      }
      set.moves.forEach((move) => {
        const moveId = toID(move);
        teamMoves.add(moveId);
        teamMoveCounts.set(moveId, (teamMoveCounts.get(moveId) ?? 0) + 1);
      });
      teamAbilities.add(toID(set.ability));
      teamItems.add(set.item);
      optimizer.clearCache();
    }
  }

  while (team.length < maxTeamSize) {
    const missingRequiredAbilities =
      (template?.requiredAbilities?.length ?? 0) > 0 &&
      !teamHasAnyTemplateAbility(teamAbilities, template?.requiredAbilities);
    const missingRequiredMoves =
      (template?.requiredMoves?.length ?? 0) > 0 &&
      !teamHasAnyRequiredMove(teamMoves, template?.requiredMoves);
    const needsWeatherPayoff =
      ["rain", "sun", "sand", "weatheroffense"].includes(templateId) &&
      countWeatherPayoffMembers(team, templateId) < 2;
    const coreHunt = missingRequiredAbilities || missingRequiredMoves || needsWeatherPayoff;
    const suggestionLimit = coreHunt
      ? 200
      : (template?.requiredCore?.length ?? 0) > 0 ||
          (template?.requiredAbilities?.length ?? 0) > 0 ||
          (template?.requiredMoves?.length ?? 0) > 0
        ? 60
        : 25;
    const suggestions = engine.suggestMembers(teamSpecies, suggestionLimit);
    if (suggestions.length === 0) break;

    const prioritizedSuggestions = narrowSuggestionsForTemplateState({
      suggestions,
      optimizer,
      teamSpecies,
      template,
      templateId,
      formatProfile,
      teamMoves,
      teamMoveCounts,
      teamAbilities,
      format,
      currentTeam: team,
    });
    const tournamentPrioritizedSuggestions = prioritizeSuggestionsWithTournamentPriors({
      format,
      templateId,
      currentTeam: team,
      suggestions: prioritizedSuggestions,
      rng,
    });

    const targetRole = template?.roles?.[team.length];
    if (targetRole) {
      const roleSuggestions = tournamentPrioritizedSuggestions.filter((suggestion) => {
        const set = optimizer.optimize(suggestion.species, teamSpecies, {
          template,
          teamMoves,
          teamMoveCounts,
          teamAbilities,
          teamItems,
          format,
        });
        return matchesTemplateRole(
          templateId,
          targetRole,
          detectSetRole(set),
          suggestion.species,
          set
        );
      });

      if (roleSuggestions.length > 0) {
        tournamentPrioritizedSuggestions.splice(
          0,
          tournamentPrioritizedSuggestions.length,
          ...roleSuggestions
        );
      }
    }
    const prioritizedNames = new Set(
      tournamentPrioritizedSuggestions.map((suggestion) => toID(suggestion.species.name))
    );
    const fallbackSuggestions = suggestions.filter(
      (suggestion) => !prioritizedNames.has(toID(suggestion.species.name))
    );

    const viableSelection =
      trySelectViableSuggestion(tournamentPrioritizedSuggestions) ??
      trySelectViableSuggestion(fallbackSuggestions);
    if (!viableSelection) {
      break;
    }

    const { selected, set } = viableSelection;

    const member = convertToTeamMember(selected.species, set);

    team.push(member);
    teamSpecies.push(selected.species);
    teamCanonicalIds.add(getCanonicalSpeciesId(selected.species));
    if (isRestrictedLegendarySpecies(selected.species.name)) {
      teamRestrictedCount += 1;
    }
    set.moves.forEach((move) => {
      const moveId = toID(move);
      teamMoves.add(moveId);
      teamMoveCounts.set(moveId, (teamMoveCounts.get(moveId) ?? 0) + 1);
    });
    teamAbilities.add(toID(set.ability));
    teamItems.add(set.item);
    optimizer.clearCache();
  }

  const guide = generateTeamGuide(team, {
    format,
    templateId,
    lang,
  });
  const validation = validateTeamForTemplate(team, guide, {
    format,
    templateId,
    template,
    archetypeHints: data.meta.optionalArchetypeHints,
    feasibility,
  });
  return tryRepairCandidateTeam({
    team,
    teamSpecies,
    data,
    format,
    gen,
    lang,
    type,
    maxTeamSize,
    template,
    templateId,
    excludeLegendaries,
    formatProfile,
    fixedCanonicalIds,
    guide,
    validation,
    feasibility,
    rng,
  });
}

const HARD_SET_ISSUES = new Set([
  "assault-vest-status-conflict",
  "choice-status-conflict",
  "choice-band-no-physical",
  "choice-specs-no-special",
  "duplicate-item-clause",
  "banned-ability-in-format",
  "no-real-progression",
]);

function isResolvedSetViable(
  set: OptimizedSet & { issues?: string[] },
  teamCanonicalIds: Set<string>,
  teamItems: Set<string>,
  species: PokemonSpecies,
  formatProfile: CompetitiveFormatProfile,
  teamRestrictedCount = 0
) {
  if (teamCanonicalIds.has(getCanonicalSpeciesId(species))) {
    return false;
  }

  if (!set.item?.trim() || !set.ability?.trim() || !set.nature?.trim()) {
    return false;
  }

  if (
    formatProfile.enforceItemClause &&
    teamItems.has(set.item)
  ) {
    return false;
  }

  const maxRestricted = formatProfile.maxRestrictedPokemon;
  if (
    maxRestricted !== undefined &&
    teamRestrictedCount >= maxRestricted &&
    isRestrictedLegendarySpecies(species.name)
  ) {
    return false;
  }

  if (
    formatProfile.forbiddenAbilityIds.includes(toID(set.ability))
  ) {
    return false;
  }

  if ((set.issues ?? []).some((issue) => HARD_SET_ISSUES.has(issue))) {
    return false;
  }

  const uniqueMoves = new Set(
    (set.moves ?? [])
      .map((move) => String(move || "").trim())
      .filter(Boolean)
      .map((move) => toID(move))
  );

  if (
    !formatProfile.allowHazards &&
    Array.from(uniqueMoves).some((moveId) => HAZARD_MOVE_IDS.has(moveId))
  ) {
    return false;
  }

  return uniqueMoves.size >= 4;
}

const FALLBACK_TIER_WEIGHTS: Record<string, number> = {
  AG: 1.06,
  Uber: 1.04,
  OU: 1,
  UUBL: 0.97,
  UU: 0.94,
  RUBL: 0.91,
  RU: 0.88,
  NUBL: 0.85,
  NU: 0.82,
  PUBL: 0.79,
  PU: 0.76,
  ZUBL: 0.73,
  ZU: 0.7,
  NFE: 0.48,
  LC: 0.42,
};

function getFallbackSpeciesScore(
  species: PokemonSpecies,
  allowLowTierFillers: boolean
) {
  const bst = Object.values(species.baseStats).reduce((sum, stat) => sum + stat, 0);
  const bulk =
    species.baseStats.hp + species.baseStats.def + species.baseStats.spd;
  const maxOffense = Math.max(species.baseStats.atk, species.baseStats.spa);
  const tierWeight =
    FALLBACK_TIER_WEIGHTS[species.tier ?? ""] ??
    (species.tier === "NFE" ? 0.48 : species.tier === "LC" ? 0.42 : 0.64);

  let score = tierWeight * 1000;
  score += bst;
  score += bulk * 0.35;
  score += maxOffense * 0.45;
  score += species.baseStats.spe * 0.18;

  if (species.types.length > 1) {
    score += 12;
  }
  if (species.evos && species.evos.length > 0) {
    score -= 180;
  }
  if (!allowLowTierFillers && (species.tier === "LC" || species.tier === "NFE")) {
    score -= 240;
  }

  return score;
}

function generateMockData(
  format: string,
  gen: number,
  formatProfile: CompetitiveFormatProfile
): NormalizedSmogonData {
  const data: NormalizedSmogonData = {
    meta: {
      format,
      totalBattles: 100,
      leadData: {},
      sourceInfo: {
        provider: "smogon",
        requestedFormat: format,
        resolvedFormat: format,
        month: "local",
        rating: 0,
        fallbackType: "exact",
      },
    },
    pokemon: {},
  };

  const requestedPool = getFallbackSpeciesPool(formatProfile);
  const seedPool =
    requestedPool.length > 0
      ? requestedPool
          .map((speciesName) => DexProvider.getSpecies(speciesName))
          .filter((species): species is PokemonSpecies => Boolean(species))
      : DexProvider.getAllSpecies();
  const allowLowTierFillers = format.endsWith("lc");
  const seenSpecies = new Set<string>();
  const speciesPool = seedPool
    .map((species) => DexProvider.getSpeciesForGen(species.name, gen))
    .filter((mon): mon is PokemonSpecies => Boolean(mon))
    .filter((mon) => {
      if (gen === 9 && !isAllowedInFormat(mon.name, format as FormatId)) {
        return false;
      }
      if (!allowLowTierFillers && (mon.tier === "LC" || mon.tier === "NFE")) {
        return false;
      }
      if (mon.evos && mon.evos.length > 0) {
        return false;
      }

      const speciesId = toID(mon.name);
      if (seenSpecies.has(speciesId)) {
        return false;
      }
      seenSpecies.add(speciesId);
      return true;
    });

  const rankedSpecies =
    requestedPool.length > 0
      ? speciesPool
      : [...speciesPool].sort(
          (left, right) =>
            getFallbackSpeciesScore(right, allowLowTierFillers) -
            getFallbackSpeciesScore(left, allowLowTierFillers)
        );
  const cappedSpecies =
    requestedPool.length > 0
      ? rankedSpecies
      : rankedSpecies.slice(0, formatProfile.isDoubles ? 80 : allowLowTierFillers ? 60 : 120);

  cappedSpecies.forEach((mon, index) => {
    const usageRate = Math.max(
      0.01,
      (cappedSpecies.length - index) / Math.max(cappedSpecies.length * 7, 1)
    );

    data.pokemon[toID(mon.name)] = {
      name: mon.name,
      usageRate,
      teammates: {},
      moves: {},
      items: {},
      abilities: {},
      teraTypes: {},
      spreads: [],
    };
    data.meta.leadData[toID(mon.name)] = usageRate;
  });

  return data;
}
