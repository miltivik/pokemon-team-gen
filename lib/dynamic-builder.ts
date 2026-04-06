import { FORMATS, FormatId, getGenFromFormat } from "@/config/formats";
import { SetOptimizer, type OptimizedSet } from "@/lib/builder/set-optimizer";
import { WeightedScoringEngine } from "@/lib/builder/scoring";
import {
  validateTeamForTemplate,
  type TeamValidationResult,
} from "@/lib/builder/team-validator";
import { detectSetRole } from "@/lib/builder/roles";
import { Template, TemplateId, TEMPLATES, sanitizeTemplateForFormat } from "@/config/templates";
import { DexProvider, type PokemonSpecies } from "@/lib/data-sources/dex";
import { NormalizedSmogonData, SmogonDataSource } from "@/lib/data-sources/smogon";
import {
  getCompetitiveFormatProfile,
  getFallbackSpeciesPool,
  type CompetitiveFormatProfile,
} from "@/lib/competitive-format-profile";
import { getVGCArchetypes } from "@/lib/victory-road";
import { isAllowedInFormat } from "@/lib/format-rules";
import { getCanonicalSpeciesId } from "@/lib/pokemon-forms";
import { isLegendaryOrParadoxSpecies } from "@/lib/pokemon-classification";
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
  gameplan: {
    early: GamePhase;
    mid: GamePhase;
    late: GamePhase;
  };
  gameplanI18n: {
    en: { early: GamePhase; mid: GamePhase; late: GamePhase };
    es: { early: GamePhase; mid: GamePhase; late: GamePhase };
  };
  teamGuide: TeamGuideData;
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
}

interface CandidateTeamBuild {
  team: TeamMember[];
  guide: TeamGuideData;
  validation: TeamValidationResult;
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
  } = options;

  const gen = getGenFromFormat(format as FormatId) || 9;
  const formatProfile = getCompetitiveFormatProfile(format);
  const data = dataOverride ?? (await SmogonDataSource.getStats(format));
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

  if (formatProfile.isVgc) {
    try {
      const archetypeHints = await getVGCArchetypes(format);
      if (archetypeHints.length > 0) {
        finalData.meta.optionalArchetypeHints = archetypeHints;
      }
    } catch {
      // Ignore secondary-source failures and keep Smogon as primary truth.
    }
  }
  const safeTemplateId = sanitizeTemplateForFormat(
    templateId as TemplateId | undefined,
    format as FormatId
  );
  const template: Template | undefined = TEMPLATES[safeTemplateId];
  const maxTeamSize = FORMATS[format as FormatId]?.maxTeamSize ?? 6;
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
    });

  const teamWithAnalysis = attachMemberAnalyses(
    selectedCandidate.team,
    selectedCandidate.guide
  );
  const tournamentPriorDiagnostics = getTournamentPriorDiagnostics({
    format,
    templateId: safeTemplateId,
    team: teamWithAnalysis,
    recommendedModes: selectedCandidate.guide.recommendedModes,
  });
  const teamGuideEn =
    lang === "en"
      ? selectedCandidate.guide
      : generateTeamGuide(teamWithAnalysis, {
        format,
        templateId: safeTemplateId,
        lang: "en",
      });
  const teamGuideEs =
    lang === "es"
      ? selectedCandidate.guide
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
    recommendedModes: selectedCandidate.guide.recommendedModes,
    gameplan: selectedCandidate.guide.phases,
    gameplanI18n: {
      en: teamGuideEn.phases,
      es: teamGuideEs.phases,
    },
    teamGuide: selectedCandidate.guide,
    teamGuideI18n: {
      en: teamGuideEn,
      es: teamGuideEs,
    },
    generationDiagnostics: {
      ruleProfile: formatProfile.id,
      usedFallbackData,
      validationScore: selectedCandidate.validation.score,
      validationIssues: selectedCandidate.validation.issues,
      tournamentPriors: tournamentPriorDiagnostics ?? undefined,
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

  for (const dexSpecies of DexProvider.getAllSpecies()) {
    const species = DexProvider.getSpeciesForGen(dexSpecies.name, options.gen);
    if (!species) continue;
    if (!species.types.some((type) => type.toLowerCase() === requestedType)) continue;
    if (
      !allowLowTierFillers &&
      (species.tier === "LC" || species.tier === "NFE")
    ) {
      continue;
    }
    if (
      options.excludeLegendaries &&
      isLegendaryOrParadoxSpecies(species.name)
    ) {
      continue;
    }
    if (
      options.gen === 9 &&
      !isAllowedInFormat(species.name, options.format as FormatId)
    ) {
      continue;
    }

    const speciesId = toID(species.name);
    if (data.pokemon[speciesId]) {
      continue;
    }

    data.pokemon[speciesId] = {
      name: species.name,
      usageRate: 0.001,
      teammates: {},
      moves: {},
      items: {},
      abilities: {},
      teraTypes: {},
      spreads: [],
    };
  }
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

function pickWeightedSuggestionIndex(weights: number[]) {
  const totalWeight = weights.reduce((sum, weight) => sum + weight, 0);
  let roll = Math.random() * Math.max(totalWeight, 0.0001);
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
    moves: ["Rock Slide", "Earthquake"],
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
        Math.random() <= entry.pickRate
          ? entry.scoreBoost
          : 1 + (entry.scoreBoost - 1) * 0.3;
      const jitter =
        entry.tier === "anchor"
          ? 0.96 + Math.random() * 0.1
          : entry.tier === "core"
            ? 0.94 + Math.random() * 0.12
            : 0.92 + Math.random() * 0.14;

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
  } = options;

  const team: TeamMember[] = [];
  const teamSpecies: PokemonSpecies[] = [];
  const teamMoves = new Set<string>();
  const teamMoveCounts = new Map<string, number>();
  const teamAbilities = new Set<string>();
  const teamItems = new Set<string>();
  const teamCanonicalIds = new Set<string>();
  const processedFixedCanonicalIds = new Set<string>();
  const optimizer = new SetOptimizer(data);
  const trySelectViableSuggestion = (
    suggestions: ReturnType<WeightedScoringEngine["suggestMembers"]>
  ) => {
    const remaining = [...suggestions];

    while (remaining.length > 0) {
      const weights = remaining.map((suggestion, index) =>
        suggestion.score * Math.pow(0.6, index)
      );
      const selectedIndex = pickWeightedSuggestionIndex(weights);
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
          formatProfile
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
        !isResolvedSetViable(set, teamCanonicalIds, teamItems, species, formatProfile)
      ) {
        optimizer.clearCache();
        continue;
      }

      const member = convertToTeamMember(species, set);
      team.push(member);
      teamSpecies.push(species);
      teamCanonicalIds.add(canonicalId);
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
  });

  return {
    team,
    guide,
    validation,
  };
}

function isResolvedSetViable(
  set: OptimizedSet,
  teamCanonicalIds: Set<string>,
  teamItems: Set<string>,
  species: PokemonSpecies,
  formatProfile: CompetitiveFormatProfile
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

  if (
    formatProfile.forbiddenAbilityIds.includes(toID(set.ability))
  ) {
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
  const speciesPool =
    requestedPool.length > 0
      ? requestedPool
          .map((speciesName) => DexProvider.getSpecies(speciesName))
          .filter((species): species is PokemonSpecies => Boolean(species))
      : DexProvider.getAllSpecies();
  const allowLowTierFillers = format.endsWith("lc");
  speciesPool.forEach((species, index) => {
    const mon = DexProvider.getSpeciesForGen(species.name, gen);
    if (!mon) return;
    if (gen === 9 && !isAllowedInFormat(mon.name, format as FormatId)) return;
    if (!allowLowTierFillers && (mon.tier === "LC" || mon.tier === "NFE")) return;
    if (mon.evos && mon.evos.length > 0) return;

    const usageRate = Math.max(
      0.01,
      (speciesPool.length - index) / Math.max(speciesPool.length * 12, 1)
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
