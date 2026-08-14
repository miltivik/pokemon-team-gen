import { FORMATS, FormatId } from "@/config/formats";
import { Template, TemplateId } from "@/config/templates";
import { getCompetitiveFormatProfile } from "@/lib/competitive-format-profile";
import {
  HAZARD_MOVES,
  PIVOT_MOVES,
  RECOVERY_MOVES,
  REMOVAL_MOVES,
  SCREEN_MOVES,
  SETUP_MOVES,
} from "@/lib/builder/template-heuristics";
import type { TeamGenerationFeasibility } from "@/lib/builder/generation-feasibility";
import { isAllowedInFormat } from "@/lib/format-rules";
import {
  GeneratedTeamMember,
  getMoveNames,
  TeamGuideData,
} from "@/lib/team-guide";
import { getMoveData } from "@/lib/showdown-data";
import { getTournamentPriorModeCoverage } from "@/lib/tournament-priors";
import { isRestrictedLegendarySpecies } from "@/lib/pokemon-classification";
import { toID } from "@/lib/utils";

interface TeamValidationOptions {
  format: string;
  templateId: TemplateId;
  template?: Template;
  archetypeHints?: string[];
  feasibility?: TeamGenerationFeasibility;
}

export interface TeamValidationResult {
  score: number;
  archetypeAlignment: number;
  coreCompletion: number;
  supportCoverage: number;
  forbiddenPenalty: number;
  issues: string[];
  missingCore: string[];
  missingSupportPackages: string[];
}

interface TeamSignals {
  isDoubles: boolean;
  allMoveIds: Set<string>;
  allAbilityIds: Set<string>;
  allItemIds: Set<string>;
  hazards: number;
  removers: number;
  pivots: number;
  setupMons: number;
  screenMoves: number;
  protectUsers: number;
  fakeOutUsers: number;
  redirectionUsers: number;
  knockOffUsers: number;
  speedControlUsers: number;
  rocksUsers: number;
  stackingHazardUsers: number;
  trickRoomSetters: number;
  tailwindSetters: number;
  weatherSetters: {
    rain: number;
    sun: number;
    sand: number;
    snow: number;
  };
  weatherAbusers: {
    rain: number;
    sun: number;
    sand: number;
    snow: number;
  };
  ghostAnchors: number;
  goodAsGoldUsers: number;
  recoveryMons: number;
  passiveSupportMons: number;
  bulkyMons: number;
  fastAttackers: number;
  slowBreakers: number;
  sweepers: number;
  duplicateItems: number;
}

const SUPPORT_PACKAGE_CHECKS: Record<
  string,
  (signals: TeamSignals) => boolean
> = {
  hazards: (signals) => signals.isDoubles || signals.hazards > 0,
  removal: (signals) => signals.isDoubles || signals.removers > 0,
  pivoting: (signals) =>
    signals.isDoubles
      ? signals.pivots > 0 || signals.redirectionUsers > 0 || signals.fakeOutUsers > 0
      : signals.pivots >= 2,
  "speed-control": (signals) => signals.speedControlUsers > 0,
  setup: (signals) => signals.setupMons >= 2,
  "lead-pressure": (signals) =>
    signals.hazards > 0 || signals.screenMoves > 0 || signals.speedControlUsers > 0,
  "screens-or-hazards": (signals) =>
    signals.screenMoves >= 2 || signals.hazards >= 2,
  "midgame-bulk": (signals) => signals.bulkyMons >= 2,
  protect: (signals) => !signals.isDoubles || signals.protectUsers >= 2,
  positioning: (signals) => signals.pivots > 0 || signals.redirectionUsers > 0,
  "fake-out": (signals) => signals.fakeOutUsers > 0,
  redirection: (signals) => signals.redirectionUsers > 0,
  "weather-control": (signals) => signals.pivots > 0 || signals.protectUsers > 0,
  rocks: (signals) => signals.rocksUsers > 0,
  spinblock: (signals) => signals.ghostAnchors > 0 || signals.goodAsGoldUsers > 0,
  "knock-off": (signals) => signals.knockOffUsers > 0,
};

const REQUIRED_CORE_CHECKS: Record<
  string,
  (signals: TeamSignals) => boolean
> = {
  "trick-room-setter": (signals) => signals.trickRoomSetters > 0,
  "slow-breakers": (signals) => signals.slowBreakers >= 2,
  "tailwind-setter": (signals) => signals.tailwindSetters > 0,
  "speed-abusers": (signals) => signals.fastAttackers >= 2,
  "rain-setter": (signals) => signals.weatherSetters.rain > 0,
  "rain-abusers": (signals) => signals.weatherAbusers.rain >= 2,
  "sun-setter": (signals) => signals.weatherSetters.sun > 0,
  "sun-abusers": (signals) => signals.weatherAbusers.sun >= 2,
  "sand-setter": (signals) => signals.weatherSetters.sand > 0,
  "sand-abusers": (signals) => signals.weatherAbusers.sand >= 2,
  rocks: (signals) => signals.rocksUsers > 0,
  "stacking-hazards": (signals) => signals.stackingHazardUsers > 0,
  "pivot-core": (signals) => signals.pivots >= 2,
  "recovery-backbone": (signals) => signals.recoveryMons >= 3,
  "weather-setter": (signals) =>
    signals.weatherSetters.rain +
      signals.weatherSetters.sun +
      signals.weatherSetters.sand +
      signals.weatherSetters.snow >
    0,
  "weather-abusers": (signals) =>
    signals.weatherAbusers.rain +
      signals.weatherAbusers.sun +
      signals.weatherAbusers.sand +
      signals.weatherAbusers.snow >=
    2,
};

const FORBIDDEN_PATTERN_CHECKS: Record<
  string,
  (signals: TeamSignals) => boolean
> = {
  "passive-double-wall-core": (signals) =>
    signals.bulkyMons >= 3 && signals.passiveSupportMons >= 3 && signals.sweepers <= 2,
  "fast-fragile-stack": (signals) =>
    signals.fastAttackers >= 3 && signals.slowBreakers <= 1,
};

const TEMPLATE_ARCHETYPE_MATCHES: Record<TemplateId, string[]> = {
  balanced: ["balanced", "bulkyoffense", "voltturn"],
  offense: ["offense", "hazardstack"],
  bulkyoffense: ["bulkyoffense", "balanced", "offense", "voltturn"],
  stall: ["stall", "semistall"],
  semistall: ["semistall", "stall", "balanced"],
  weatheroffense: ["rain", "sun", "sand"],
  rain: ["rain"],
  sun: ["sun"],
  sand: ["sand"],
  trickroom: ["trickroom"],
  tailwind: ["tailwind"],
  voltturn: ["voltturn", "balanced"],
  hazardstack: ["hazardstack", "offense"],
  random: [
    "balanced",
    "offense",
    "bulkyoffense",
    "stall",
    "semistall",
    "rain",
    "sun",
    "sand",
    "tailwind",
    "trickroom",
    "hazardstack",
    "voltturn",
  ],
};

function hasAnyMove(moveIds: Set<string>, moveNames: string[]) {
  return moveNames.some((moveName) => moveIds.has(toID(moveName)));
}

function countMembersWithMove(team: GeneratedTeamMember[], moveNames: string[]) {
  return team.reduce((count, member) => {
    const moveIds = new Set(getMoveNames(member).map((move) => toID(move)));
    return count + (hasAnyMove(moveIds, moveNames) ? 1 : 0);
  }, 0);
}

function hasDamagingMoveOfType(member: GeneratedTeamMember, targetType: string) {
  return member.moves.some((move) => {
    const resolvedMove = typeof move === "string" ? getMoveData(move) : move;
    if (!resolvedMove) {
      return false;
    }

    return (
      resolvedMove.category !== "Status" &&
      String(resolvedMove.type || "").toLowerCase() === targetType.toLowerCase()
    );
  });
}

function buildTeamSignals(
  team: GeneratedTeamMember[],
  format: string
): TeamSignals {
  const isDoubles = FORMATS[format as FormatId]?.gameType === "doubles";
  const allMoveIds = new Set<string>();
  const allAbilityIds = new Set<string>();
  const allItemIds = new Set<string>();

  let setupMons = 0;
  let protectUsers = 0;
  let fakeOutUsers = 0;
  let redirectionUsers = 0;
  let speedControlUsers = 0;
  let recoveryMons = 0;
  let passiveSupportMons = 0;
  let bulkyMons = 0;
  let fastAttackers = 0;
  let slowBreakers = 0;
  let sweepers = 0;
  let ghostAnchors = 0;
  let goodAsGoldUsers = 0;

  const weatherSetters = { rain: 0, sun: 0, sand: 0, snow: 0 };
  const weatherAbusers = { rain: 0, sun: 0, sand: 0, snow: 0 };

  for (const member of team) {
    const moveIds = new Set(getMoveNames(member).map((move) => toID(move)));
    const offense = Math.max(member.baseStats.atk, member.baseStats.spa);
    const bulk = member.baseStats.hp + member.baseStats.def + member.baseStats.spd;
    const speed = member.baseStats.spe;
    const abilityId = toID(member.ability);
    const hasSetup = hasAnyMove(moveIds, SETUP_MOVES);
    const hasRecovery = hasAnyMove(moveIds, RECOVERY_MOVES);
    const hasHazards = hasAnyMove(moveIds, HAZARD_MOVES);
    const hasDirectProgress =
      member.role === "Sweeper" || offense >= 100 || hasSetup || hasHazards;

    getMoveNames(member).forEach((move) => allMoveIds.add(toID(move)));
    allAbilityIds.add(toID(member.ability));
    allItemIds.add(toID(member.item));

    if (hasSetup) setupMons += 1;
    if (moveIds.has(toID("Protect"))) protectUsers += 1;
    if (moveIds.has(toID("Fake Out"))) fakeOutUsers += 1;
    if (moveIds.has(toID("Follow Me")) || moveIds.has(toID("Rage Powder"))) {
      redirectionUsers += 1;
    }
    if (
      moveIds.has(toID("Trick Room")) ||
      moveIds.has(toID("Tailwind")) ||
      moveIds.has(toID("Thunder Wave")) ||
      moveIds.has(toID("Icy Wind")) ||
      moveIds.has(toID("Electroweb"))
    ) {
      speedControlUsers += 1;
    }
    if (hasRecovery) recoveryMons += 1;
    if (bulk >= 280) bulkyMons += 1;
    if (member.role === "Sweeper") sweepers += 1;
    if (
      (isDoubles && speed >= 80 && offense >= 95) ||
      (!isDoubles && speed >= 95 && offense >= 100)
    ) {
      fastAttackers += 1;
    }
    if (speed <= 70 && offense >= 100) slowBreakers += 1;
    if (member.types.includes("Ghost")) ghostAnchors += 1;
    if (abilityId === "goodasgold") goodAsGoldUsers += 1;

    if (
      member.role === "Support" &&
      bulk >= 250 &&
      offense < 95 &&
      !hasSetup &&
      !hasHazards &&
      !hasDirectProgress
    ) {
      passiveSupportMons += 1;
    }

    if (abilityId === "drizzle" || moveIds.has(toID("Rain Dance"))) weatherSetters.rain += 1;
    if (
      abilityId === "drought" ||
      abilityId === "orichalcumpulse" ||
      moveIds.has(toID("Sunny Day"))
    ) {
      weatherSetters.sun += 1;
    }
    if (abilityId === "sandstream" || moveIds.has(toID("Sandstorm"))) weatherSetters.sand += 1;
    if (abilityId === "snowwarning" || moveIds.has(toID("Snowscape"))) weatherSetters.snow += 1;

    if (
      abilityId === "swiftswim" ||
      moveIds.has(toID("Hurricane")) ||
      moveIds.has(toID("Thunder"))
    ) {
      weatherAbusers.rain += 1;
    }
    if (
      ["chlorophyll", "solarpower", "protosynthesis"].includes(abilityId) ||
      moveIds.has(toID("Growth")) ||
      (member.types.includes("Fire") && hasDamagingMoveOfType(member, "Fire"))
    ) {
      weatherAbusers.sun += 1;
    }
    if (["sandrush", "sandforce", "sandveil"].includes(abilityId)) {
      weatherAbusers.sand += 1;
    }
    if (["slushrush", "icebody"].includes(abilityId) || moveIds.has(toID("Blizzard"))) {
      weatherAbusers.snow += 1;
    }
  }

  return {
    isDoubles,
    allMoveIds,
    allAbilityIds,
    allItemIds,
    hazards: countMembersWithMove(team, HAZARD_MOVES),
    removers: countMembersWithMove(team, REMOVAL_MOVES),
    pivots: countMembersWithMove(team, PIVOT_MOVES),
    setupMons,
    screenMoves: countMembersWithMove(team, SCREEN_MOVES),
    protectUsers,
    fakeOutUsers,
    redirectionUsers,
    knockOffUsers: countMembersWithMove(team, ["Knock Off"]),
    speedControlUsers,
    rocksUsers: countMembersWithMove(team, ["Stealth Rock"]),
    stackingHazardUsers: countMembersWithMove(team, [
      "Spikes",
      "Toxic Spikes",
      "Sticky Web",
      "Ceaseless Edge",
    ]),
    trickRoomSetters: countMembersWithMove(team, ["Trick Room"]),
    tailwindSetters: countMembersWithMove(team, ["Tailwind"]),
    weatherSetters,
    weatherAbusers,
    ghostAnchors,
    goodAsGoldUsers,
    recoveryMons,
    passiveSupportMons,
    bulkyMons,
    fastAttackers,
    slowBreakers,
    sweepers,
    duplicateItems: team.length - new Set(team.map((member) => toID(member.item))).size,
  };
}

function validateRecommendedModes(
  team: GeneratedTeamMember[],
  guide: TeamGuideData,
  options: TeamValidationOptions,
  signals: TeamSignals
) {
  const formatProfile = getCompetitiveFormatProfile(options.format);
  const issues: string[] = [];
  const modes = guide.recommendedModes ?? [];

  if (!signals.isDoubles) {
    return {
      issues,
      score: 1,
    };
  }

  if (formatProfile.requireRecommendedModes && modes.length === 0) {
    return {
      issues: ["recommended-modes:missing"],
      score: 0,
    };
  }

  const teamNames = new Set(team.map((member) => member.name));
  let hasStandardMode = false;
  let hasTailwindMode = false;
  let hasTrickRoomMode = false;

  for (const mode of modes) {
    const uniqueMembers = Array.from(new Set(mode.members.filter(Boolean)));
    const missingMembers = uniqueMembers.filter((memberName) => !teamNames.has(memberName));

    if (uniqueMembers.length < 3 || uniqueMembers.length > 4) {
      issues.push(`recommended-mode:size:${mode.title}`);
    }
    if (missingMembers.length > 0) {
      issues.push(`recommended-mode:unknown-members:${mode.title}`);
    }

    const normalizedTitle = mode.title.toLowerCase();
    if (normalizedTitle.includes("standard") || normalizedTitle.includes("estandar")) {
      hasStandardMode = true;
    }
    if (normalizedTitle.includes("tailwind")) {
      hasTailwindMode = true;
    }
    if (normalizedTitle.includes("trick room")) {
      hasTrickRoomMode = true;
    }
  }

  if (formatProfile.requireRecommendedModes && !hasStandardMode) {
    issues.push("recommended-modes:missing-standard-mode");
  }
  if (
    options.templateId === "tailwind" &&
    signals.tailwindSetters > 0 &&
    !hasTailwindMode
  ) {
    issues.push("recommended-modes:missing-tailwind-mode");
  }
  if (
    options.templateId === "trickroom" &&
    signals.trickRoomSetters > 0 &&
    !hasTrickRoomMode
  ) {
    issues.push("recommended-modes:missing-trick-room-mode");
  }

  const tournamentPriorCoverage = getTournamentPriorModeCoverage({
    format: options.format,
    templateId: options.templateId,
    team,
    recommendedModes: modes,
  });
  if (tournamentPriorCoverage) {
    issues.push(...tournamentPriorCoverage.issues);
  }

  return {
    issues,
    score: Math.max(0, 1 - issues.length * 0.25),
  };
}

function getArchetypeAlignmentScore(
  guide: TeamGuideData,
  templateId: TemplateId
) {
  const matches = TEMPLATE_ARCHETYPE_MATCHES[templateId] ?? [];
  if (matches.includes(guide.archetype)) {
    return 1;
  }

  if (
    templateId === "weatheroffense" &&
    guide.subarchetype &&
    guide.subarchetype.endsWith("offense")
  ) {
    return 0.92;
  }

  if (templateId === "balanced" && guide.subarchetype?.includes("balance")) {
    return 0.95;
  }

  if (templateId === "offense" && guide.subarchetype?.includes("offense")) {
    return 0.92;
  }

  return 0.25;
}

function getHintsBonus(guide: TeamGuideData, archetypeHints: string[] = []) {
  if (archetypeHints.length === 0) {
    return 0;
  }

  const normalizedGuideTerms = [
    guide.archetype.toLowerCase(),
    guide.subarchetype?.toLowerCase() ?? "",
  ].filter(Boolean);

  const matched = archetypeHints.some((hint) => {
    const normalizedHint = hint.toLowerCase();
    return normalizedGuideTerms.some((term) => normalizedHint.includes(term));
  });

  return matched ? 0.05 : 0;
}

export function validateTeamForTemplate(
  team: GeneratedTeamMember[],
  guide: TeamGuideData,
  options: TeamValidationOptions
): TeamValidationResult {
  const signals = buildTeamSignals(team, options.format);
  const formatProfile = getCompetitiveFormatProfile(options.format);
  const template = options.template;
  const infeasibleSupportPackages = new Set(
    options.feasibility?.infeasibleSupportPackages ?? []
  );
  const infeasibleCore = new Set(options.feasibility?.infeasibleCore ?? []);
  const feasibleSupportPackages = (template?.supportPackages ?? []).filter(
    (supportPackage) => !infeasibleSupportPackages.has(supportPackage)
  );
  const missingCore = (template?.requiredCore ?? []).filter((core) => {
    const check = REQUIRED_CORE_CHECKS[core];
    return check ? !check(signals) : false;
  });
  const missingSupportPackages = feasibleSupportPackages.filter((supportPackage) => {
    const check = SUPPORT_PACKAGE_CHECKS[supportPackage];
    return check ? !check(signals) : false;
  });
  const triggeredForbidden = (template?.forbiddenPatterns ?? []).filter((pattern) => {
    const check = FORBIDDEN_PATTERN_CHECKS[pattern];
    return check ? check(signals) : false;
  });
  const issues = [
    ...missingCore.map((core) => `missing-core:${core}`),
    ...missingCore
      .filter((core) => infeasibleCore.has(core))
      .map((core) => `infeasible-core:${core}`),
    ...missingSupportPackages.map((supportPackage) => `missing-support:${supportPackage}`),
    ...triggeredForbidden.map((pattern) => `forbidden-pattern:${pattern}`),
  ];
  const illegalMembers =
    options.format in FORMATS
      ? team.filter(
          (member) => !isAllowedInFormat(member.name, options.format as FormatId)
        )
      : [];
  const maxRestricted = formatProfile.maxRestrictedPokemon;
  const restrictedCount =
    maxRestricted === undefined
      ? 0
      : team.filter((member) => isRestrictedLegendarySpecies(member.name)).length;
  const restrictedCountExceeded =
    maxRestricted !== undefined && restrictedCount > maxRestricted;
  const recommendedModesCheck = validateRecommendedModes(
    team,
    guide,
    options,
    signals
  );

  if (
    options.templateId === "rain" &&
    (signals.weatherSetters.rain === 0 || signals.weatherAbusers.rain < 2)
  ) {
    issues.push("weather-core-incomplete:rain");
  }
  if (
    options.templateId === "sun" &&
    (signals.weatherSetters.sun === 0 || signals.weatherAbusers.sun < 2)
  ) {
    issues.push("weather-core-incomplete:sun");
  }
  if (
    options.templateId === "sand" &&
    (signals.weatherSetters.sand === 0 || signals.weatherAbusers.sand < 2)
  ) {
    issues.push("weather-core-incomplete:sand");
  }
  if (signals.isDoubles && options.templateId === "tailwind" && signals.tailwindSetters === 0) {
    issues.push("missing-core:tailwind-setter");
  }
  if (signals.isDoubles && options.templateId === "trickroom" && signals.trickRoomSetters === 0) {
    issues.push("missing-core:trick-room-setter");
  }
  if (signals.isDoubles && signals.hazards > 0) {
    issues.push("doubles:hazards-present");
  }
  if (formatProfile.enforceItemClause && signals.duplicateItems > 0) {
    issues.push("item-clause:duplicate-item");
  }
  if (illegalMembers.length > 0) {
    issues.push(
      `illegal-members:${illegalMembers.map((member) => member.name).join(",")}`
    );
  }
  if (restrictedCountExceeded) {
    issues.push(`restricted-count:${restrictedCount}>${maxRestricted}`);
  }
  issues.push(...recommendedModesCheck.issues);

  const archetypeAlignment = getArchetypeAlignmentScore(guide, options.templateId);
  const coreCompletion =
    template?.requiredCore && template.requiredCore.length > 0
      ? 1 - missingCore.length / template.requiredCore.length
      : 1;
  const supportCoverage =
    feasibleSupportPackages.length > 0
      ? 1 - missingSupportPackages.length / feasibleSupportPackages.length
      : 1;
  const forbiddenPenalty = template?.forbiddenPatterns?.length
    ? triggeredForbidden.length / template.forbiddenPatterns.length
    : 0;
  const hintsBonus = getHintsBonus(guide, options.archetypeHints);
  const itemClausePenalty =
    formatProfile.enforceItemClause && signals.duplicateItems > 0 ? 0.18 : 0;
  const illegalMemberPenalty = illegalMembers.length > 0 ? 0.24 : 0;
  const restrictedCountPenalty = restrictedCountExceeded ? 0.24 : 0;
  const doublesHazardPenalty = signals.isDoubles && signals.hazards > 0 ? 0.18 : 0;

  const score = Math.max(
    0,
    Math.min(
      1,
      archetypeAlignment * 0.34 +
        coreCompletion * 0.34 +
        supportCoverage * 0.22 +
        recommendedModesCheck.score * (signals.isDoubles ? 0.1 : 0) +
        hintsBonus -
        forbiddenPenalty * 0.25 -
        itemClausePenalty -
        illegalMemberPenalty -
        restrictedCountPenalty -
        doublesHazardPenalty
    )
  );

  return {
    score,
    archetypeAlignment,
    coreCompletion,
    supportCoverage,
    forbiddenPenalty,
    issues,
    missingCore,
    missingSupportPackages,
  };
}
