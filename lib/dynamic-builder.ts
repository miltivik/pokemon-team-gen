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
import { getVGCArchetypes } from "@/lib/victory-road";
import { isAllowedInFormat } from "@/lib/format-rules";
import { getCanonicalSpeciesId } from "@/lib/pokemon-forms";
import { isLegendaryOrParadoxSpecies } from "@/lib/pokemon-classification";
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
  const data = dataOverride ?? (await SmogonDataSource.getStats(format));
  const finalData: NormalizedSmogonData = data
    ? { ...data, meta: { ...data.meta } }
    : generateMockData(format, gen);

  if (type) {
    ensureTypeCandidateCoverage(finalData, {
      format,
      gen,
      type,
      excludeLegendaries,
    });
  }

  if (FORMATS[format as FormatId]?.gameType === "doubles" && format.includes("vgc")) {
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
    });

  const teamWithAnalysis = attachMemberAnalyses(
    selectedCandidate.team,
    selectedCandidate.guide
  );
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

function narrowSuggestionsForTemplateState(options: {
  suggestions: ReturnType<WeightedScoringEngine["suggestMembers"]>;
  optimizer: SetOptimizer;
  teamSpecies: PokemonSpecies[];
  template: Template | undefined;
  templateId: TemplateId;
  teamMoves: Set<string>;
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
    teamMoves,
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

  return suggestions;
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
  } = options;

  const team: TeamMember[] = [];
  const teamSpecies: PokemonSpecies[] = [];
  const teamMoves = new Set<string>();
  const teamAbilities = new Set<string>();
  const teamCanonicalIds = new Set<string>();
  const processedFixedCanonicalIds = new Set<string>();
  const optimizer = new SetOptimizer(data);

  const engine = new WeightedScoringEngine(format, gen, data, {
    excludeLegendaries,
    requiredType: type,
    template,
    getTeamMoves: () => teamMoves,
    getTeamAbilities: () => teamAbilities,
    getTeamRoles: () => team.map((member) => member.role),
    getCandidateBundle: (candidate, currentTeam) =>
      optimizer.optimizeBundle(candidate, currentTeam, {
        template,
        teamMoves,
        teamAbilities,
        format,
      }),
    getCandidateRole: (candidate, currentTeam) => {
      const set = optimizer.optimizeBundle(candidate, currentTeam, {
        template,
        teamMoves,
        teamAbilities,
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
      const canonicalId = getCanonicalSpeciesId(species);
      if (processedFixedCanonicalIds.has(canonicalId)) continue;
      processedFixedCanonicalIds.add(canonicalId);
      if (teamCanonicalIds.has(canonicalId)) continue;

      const set = optimizer.optimize(species, teamSpecies, {
        template,
        teamMoves,
        teamAbilities,
        format,
      });
      if (!isResolvedSetViable(set, teamCanonicalIds, species)) {
        optimizer.clearCache();
        continue;
      }

      const member = convertToTeamMember(species, set);
      team.push(member);
      teamSpecies.push(species);
      teamCanonicalIds.add(canonicalId);
      set.moves.forEach((move) => teamMoves.add(toID(move)));
      teamAbilities.add(toID(set.ability));
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
    let suggestions = engine.suggestMembers(teamSpecies, suggestionLimit);
    if (suggestions.length === 0) break;

    suggestions = narrowSuggestionsForTemplateState({
      suggestions,
      optimizer,
      teamSpecies,
      template,
      templateId,
      teamMoves,
      teamAbilities,
      format,
      currentTeam: team,
    });

    const targetRole = template?.roles?.[team.length];
    if (targetRole) {
      const roleSuggestions = suggestions.filter((suggestion) => {
        const set = optimizer.optimize(suggestion.species, teamSpecies, {
          template,
          teamMoves,
          teamAbilities,
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
        suggestions = roleSuggestions;
      }
    }

    const weights = suggestions.map((suggestion, index) =>
      suggestion.score * Math.pow(0.6, index)
    );
    const selectedIndex = pickWeightedSuggestionIndex(weights);
    const selected = suggestions[selectedIndex];
    const set = optimizer.optimize(selected.species, teamSpecies, {
      template,
      teamMoves,
      teamAbilities,
      format,
    });
    if (!isResolvedSetViable(set, teamCanonicalIds, selected.species)) {
      optimizer.clearCache();
      suggestions.splice(selectedIndex, 1);
      if (suggestions.length === 0) {
        break;
      }
      continue;
    }

    const member = convertToTeamMember(selected.species, set);

    team.push(member);
    teamSpecies.push(selected.species);
    teamCanonicalIds.add(getCanonicalSpeciesId(selected.species));
    set.moves.forEach((move) => teamMoves.add(toID(move)));
    teamAbilities.add(toID(set.ability));
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
  species: PokemonSpecies
) {
  if (teamCanonicalIds.has(getCanonicalSpeciesId(species))) {
    return false;
  }

  if (!set.item?.trim() || !set.ability?.trim() || !set.nature?.trim()) {
    return false;
  }

  const uniqueMoves = new Set(
    (set.moves ?? [])
      .map((move) => String(move || "").trim())
      .filter(Boolean)
      .map((move) => toID(move))
  );

  return uniqueMoves.size >= 4;
}

function generateMockData(format: string, gen: number): NormalizedSmogonData {
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

  const allSpecies = DexProvider.getAllSpecies();
  const allowLowTierFillers = format.endsWith("lc");
  for (const species of allSpecies) {
    const mon = DexProvider.getSpeciesForGen(species.name, gen);
    if (!mon) continue;
    if (gen === 9 && !isAllowedInFormat(mon.name, format as FormatId)) continue;
    if (!allowLowTierFillers && (mon.tier === "LC" || mon.tier === "NFE")) continue;
    if (mon.evos && mon.evos.length > 0) continue;

    data.pokemon[toID(mon.name)] = {
      name: mon.name,
      usageRate: 0.1,
      teammates: {},
      moves: {},
      items: {},
      abilities: {},
      teraTypes: {},
      spreads: [],
    };
  }

  return data;
}
