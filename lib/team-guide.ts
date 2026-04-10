import { FORMATS, type FormatId } from "@/config/formats";
import { type TemplateId } from "@/config/templates";
import { detectSetRole } from "@/lib/builder/roles";
import {
  DOUBLES_SUPPORT_MOVES,
  HAZARD_MOVES,
  PIVOT_MOVES,
  RECOVERY_MOVES,
  REMOVAL_MOVES,
  SCREEN_MOVES,
  SETUP_MOVES,
} from "@/lib/builder/template-heuristics";
import {
  getCompetitiveFormatProfile,
  type CompetitiveFormatProfile,
} from "@/lib/competitive-format-profile";
import { getTournamentPriorSet } from "@/lib/tournament-priors";
import { inferPrimaryStrategicRole } from "@/lib/strategic-role";
import { getMoveData, type MoveData, type PokedexEntry, type Role } from "@/lib/showdown-data";
import { getEffectiveness } from "@/lib/type-chart";
import { toID } from "@/lib/utils";

const STATUS_MOVES = [
  "Toxic",
  "Will-O-Wisp",
  "Thunder Wave",
  "Spore",
  "Glare",
  "Encore",
  "Taunt",
  "Leech Seed",
  "Haze",
  "Roar",
  "Whirlwind",
];

const PRIORITY_MOVES = [
  "Sucker Punch",
  "Extreme Speed",
  "Ice Shard",
  "Mach Punch",
  "Bullet Punch",
  "Jet Punch",
  "Aqua Jet",
  "Shadow Sneak",
  "Vacuum Wave",
  "First Impression",
];

const SPEED_CONTROL_MOVES = [
  "Trick Room",
  "Tailwind",
  "Thunder Wave",
  "Icy Wind",
  "Electroweb",
  "String Shot",
];

const WEATHER_SETTER_ABILITIES: Record<"rain" | "sun" | "sand" | "snow", readonly string[]> = {
  rain: ["drizzle"],
  sun: ["drought", "orichalcumpulse"],
  sand: ["sandstream"],
  snow: ["snowwarning"],
};

const TYPE_NAMES = {
  en: {
    Normal: "Normal",
    Fire: "Fire",
    Water: "Water",
    Electric: "Electric",
    Grass: "Grass",
    Ice: "Ice",
    Fighting: "Fighting",
    Poison: "Poison",
    Ground: "Ground",
    Flying: "Flying",
    Psychic: "Psychic",
    Bug: "Bug",
    Rock: "Rock",
    Ghost: "Ghost",
    Dragon: "Dragon",
    Dark: "Dark",
    Steel: "Steel",
    Fairy: "Fairy",
  },
  es: {
    Normal: "Normal",
    Fire: "Fuego",
    Water: "Agua",
    Electric: "Electrico",
    Grass: "Planta",
    Ice: "Hielo",
    Fighting: "Lucha",
    Poison: "Veneno",
    Ground: "Tierra",
    Flying: "Volador",
    Psychic: "Psiquico",
    Bug: "Bicho",
    Rock: "Roca",
    Ghost: "Fantasma",
    Dragon: "Dragon",
    Dark: "Siniestro",
    Steel: "Acero",
    Fairy: "Hada",
  },
} as const;

const ATTACK_TYPES = [
  "Normal",
  "Fire",
  "Water",
  "Electric",
  "Grass",
  "Ice",
  "Fighting",
  "Poison",
  "Ground",
  "Flying",
  "Psychic",
  "Bug",
  "Rock",
  "Ghost",
  "Dragon",
  "Dark",
  "Steel",
  "Fairy",
];

export type GuideLang = "en" | "es";

export interface TeamSynergyNote {
  name: string;
  isActive: boolean;
  reason: string;
}

export interface TeamSynergyTip {
  kind: "pairing" | "support" | "positioning";
  headline: string;
  detail: string;
  teammate?: string;
}

export interface PokemonAnalysis {
  role?: string;
  howToPlay?: string;
  evs: string;
  nature: string;
  checks: string[];
  teammates: TeamSynergyNote[];
  synergyTip?: TeamSynergyTip;
  primaryFunction?: string;
  summary?: string;
  keyMoves?: string[];
  preserve?: string[];
  avoid?: string[];
  entryPoints?: string[];
  decisionRules?: string[];
}

export interface TeamBuildPreset {
  id: string;
  label: string;
  source: "algorithm" | "competitive";
  moves: string[];
  item?: string;
  nature?: string;
  evs?: string;
  ability?: string;
  teraType?: string;
  role?: Role;
  analysisRole?: string;
  analysisHowToPlay?: string;
}

export interface GeneratedTeamMember extends PokedexEntry {
  item: string;
  ability: string;
  moves: Array<string | MoveData>;
  nature: string;
  evs: string;
  role: Role;
  teraType?: string;
  analysis?: PokemonAnalysis;
  selectedBuildPresetId?: string;
  buildPresets?: Record<string, TeamBuildPreset>;
}

export interface GamePhase {
  summary: string;
  steps: string[];
  keyPokemon: string;
  threats: string[];
  objectives: string[];
  preserve: string[];
  avoid: string[];
  decisionRules: string[];
}

export interface TeamGuideOverview {
  identity: string;
  identitySummary: string;
  planSummary: string;
  secondaryPlans: string[];
  speedControl: string[];
  hazards: string[];
  removal: string[];
  pivots: string[];
  winConditions: string[];
  defensiveBackbone: string[];
  structuralWeaknesses: string[];
}

export interface TeamGuideMember {
  name: string;
  role: string;
  primaryFunction: string;
  summary: string;
  keyMoves: string[];
  preserve: string[];
  avoid: string[];
  entryPoints: string[];
  decisionRules: string[];
  checks: string[];
  teammates: TeamSynergyNote[];
  synergyTip?: TeamSynergyTip;
}

export interface TeamGuideMatchup {
  title: string;
  summary: string;
  tips: string[];
  keyPokemon?: string;
}

export interface TeamGuideMode {
  title: string;
  summary: string;
  members: string[];
}

export interface TeamGuideData {
  archetype: string;
  subarchetype?: string;
  overview: TeamGuideOverview;
  members: TeamGuideMember[];
  phases: {
    early: GamePhase;
    mid: GamePhase;
    late: GamePhase;
  };
  matchups: TeamGuideMatchup[];
  generalTips: string[];
  recommendedModes?: TeamGuideMode[];
}

interface MemberProfile {
  member: GeneratedTeamMember;
  moveNames: string[];
  moveIds: Set<string>;
  speed: number;
  maxOffense: number;
  bulk: number;
  abilityId: string;
  itemId: string;
  hazards: string[];
  removal: string[];
  pivots: string[];
  setupMoves: string[];
  recoveryMoves: string[];
  statusMoves: string[];
  speedControlMoves: string[];
  supportMoves: string[];
  priorityMoves: string[];
  screens: string[];
  weather: "rain" | "sun" | "sand" | "snow" | null;
  weatherAbuser: boolean;
  strategicRole: string;
  broadRole: Role;
  functions: string[];
  isBulky: boolean;
  isFast: boolean;
  isSlow: boolean;
  isWinCondition: boolean;
  isWallbreaker: boolean;
  isCleaner: boolean;
  isGlue: boolean;
  isEmergencyCheck: boolean;
}

interface TeamProfile {
  format: string;
  templateId: string;
  lang: GuideLang;
  isDoubles: boolean;
  formatProfile: CompetitiveFormatProfile;
  archetype: string;
  subarchetype?: string;
  profiles: MemberProfile[];
  hazardMembers: MemberProfile[];
  removalMembers: MemberProfile[];
  pivotMembers: MemberProfile[];
  winConditionMembers: MemberProfile[];
  setupMembers: MemberProfile[];
  supportMembers: MemberProfile[];
  wallMembers: MemberProfile[];
  breakerMembers: MemberProfile[];
  speedControlMembers: MemberProfile[];
  weatherSetter?: MemberProfile;
  weatherAbusers: MemberProfile[];
  structuralWeaknesses: string[];
  recommendedModes: TeamGuideMode[];
}

function text(lang: GuideLang, en: string, es: string) {
  return lang === "es" ? es : en;
}

function translateType(type: string, lang: GuideLang) {
  return TYPE_NAMES[lang][type as keyof (typeof TYPE_NAMES)[GuideLang]] ?? type;
}

function joinList(items: string[], lang: GuideLang) {
  if (items.length === 0) return text(lang, "none", "nada");
  if (items.length === 1) return items[0];
  if (items.length === 2) return `${items[0]} ${text(lang, "and", "y")} ${items[1]}`;
  return `${items.slice(0, -1).join(", ")}, ${text(lang, "and", "y")} ${items.at(-1)}`;
}

export function getMoveNames(member: Pick<GeneratedTeamMember, "moves">) {
  return (member.moves ?? [])
    .map((move) => (typeof move === "string" ? move : move.name))
    .filter(Boolean);
}

function parseEvs(evsString: string) {
  const evs = { hp: 0, atk: 0, def: 0, spa: 0, spd: 0, spe: 0 };
  const statMap: Record<string, keyof typeof evs> = {
    hp: "hp",
    atk: "atk",
    def: "def",
    spa: "spa",
    spd: "spd",
    spe: "spe",
  };

  for (const part of evsString.split("/").map((segment) => segment.trim())) {
    const match = part.match(/^(\d+)\s+(HP|Atk|Def|SpA|SpD|Spe)$/i);
    if (!match) continue;
    const stat = statMap[match[2].toLowerCase()];
    if (!stat) continue;
    evs[stat] = Number(match[1]);
  }

  return evs;
}

function hasMove(moveIds: Set<string>, moveName: string) {
  return moveIds.has(toID(moveName));
}

function archetypeLabel(archetype: string, lang: GuideLang) {
  switch (archetype) {
    case "trickroom":
      return text(lang, "Trick Room pressure", "Presion de Trick Room");
    case "tailwind":
      return text(lang, "Tailwind offense", "Ofensiva de Tailwind");
    case "rain":
      return text(lang, "Rain offense", "Ofensiva de lluvia");
    case "sun":
      return text(lang, "Sun offense", "Ofensiva de sol");
    case "sand":
      return text(lang, "Sand pressure", "Presion de arena");
    case "hazardstack":
      return text(lang, "Hazard stack", "Hazard stack");
    case "voltturn":
      return text(lang, "VoltTurn tempo", "Tempo de VoltTurn");
    case "offense":
      return text(lang, "Offensive pressure", "Presion ofensiva");
    case "bulkyoffense":
      return text(lang, "Bulky offense", "Bulky offense");
    case "stall":
      return text(lang, "Hard stall", "Stall duro");
    case "semistall":
      return text(lang, "Semi-stall", "Semi-stall");
    default:
      return text(lang, "Balanced gameplan", "Plan balanceado");
  }
}

function subarchetypeLabel(subarchetype: string | undefined, lang: GuideLang) {
  switch (subarchetype) {
    case "fat balance":
      return text(lang, "fat balance", "balance gordo");
    case "bulky balance":
      return text(lang, "bulky balance", "balance bulky");
    case "fast offense":
      return text(lang, "fast offense", "ofensiva rapida");
    case "hazard HO":
      return text(lang, "hazard hyper offense", "hyper offense con hazards");
    case "screens HO":
      return text(lang, "screens hyper offense", "hyper offense de pantallas");
    case "hard TR":
      return text(lang, "hard Trick Room", "Trick Room duro");
    case "semiroom":
      return text(lang, "semiroom", "semiroom");
    case "tailwind offense":
      return text(lang, "tailwind offense", "ofensiva de tailwind");
    case "tailroom":
      return text(lang, "tailroom", "tailroom");
    case "rain balance":
    case "sun balance":
    case "sand balance":
      return text(lang, subarchetype, subarchetype);
    case "rain offense":
    case "sun offense":
    case "sand offense":
      return text(lang, subarchetype, subarchetype);
    default:
      return subarchetype;
  }
}

function describeFunction(functionId: string, lang: GuideLang) {
  switch (functionId) {
    case "trickRoomSetter":
      return text(lang, "Primary Trick Room setter", "Setter principal de Trick Room");
    case "tailwindSetter":
      return text(lang, "Primary Tailwind setter", "Setter principal de Tailwind");
    case "weatherSetter":
      return text(lang, "Weather setter", "Setter de clima");
    case "hazardSetter":
      return text(lang, "Hazard setter", "Setter de hazards");
    case "hazardControl":
      return text(lang, "Hazard control", "Control de hazards");
    case "pivot":
      return text(lang, "Pivot and positioning piece", "Pivote y pieza de posicionamiento");
    case "wallbreaker":
      return text(lang, "Progress maker / wallbreaker", "Wallbreaker / generador de progreso");
    case "cleaner":
      return text(lang, "Late-game cleaner", "Cleaner de late game");
    case "winCondition":
      return text(lang, "Primary win condition", "Condicion de victoria principal");
    case "glue":
      return text(lang, "Glue / stabilizer", "Glue / estabilizador");
    case "wall":
      return text(lang, "Defensive anchor", "Ancla defensiva");
    case "tank":
      return text(lang, "Bulky trade piece", "Pieza bulky para intercambios");
    default:
      return text(lang, "Support piece", "Pieza de soporte");
  }
}

function detectWeatherFromAbility(abilityId: string): MemberProfile["weather"] {
  if (WEATHER_SETTER_ABILITIES.rain.includes(abilityId)) return "rain";
  if (WEATHER_SETTER_ABILITIES.sun.includes(abilityId)) return "sun";
  if (WEATHER_SETTER_ABILITIES.sand.includes(abilityId)) return "sand";
  if (WEATHER_SETTER_ABILITIES.snow.includes(abilityId)) return "snow";
  return null;
}

function hasDamagingMoveOfType(
  moves: Array<string | MoveData>,
  targetType: string
) {
  return moves.some((move) => {
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

function getWeatherAbuser(
  profile: Pick<MemberProfile, "abilityId" | "moveIds" | "weather" | "member">
) {
  if (profile.abilityId === "swiftswim" || profile.moveIds.has(toID("Hurricane")) || profile.moveIds.has(toID("Thunder"))) {
    return "rain";
  }
  if (
    ["chlorophyll", "solarpower", "protosynthesis"].includes(profile.abilityId) ||
    profile.moveIds.has(toID("Growth")) ||
    (profile.member.types.includes("Fire") &&
      hasDamagingMoveOfType(profile.member.moves, "Fire"))
  ) {
    return "sun";
  }
  if (["sandrush", "sandforce", "sandveil"].includes(profile.abilityId)) {
    return "sand";
  }
  if (["slushrush", "icebody"].includes(profile.abilityId) || profile.moveIds.has(toID("Blizzard"))) {
    return "snow";
  }
  return null;
}

function getPriorityFunctionIds(profile: MemberProfile) {
  const functions: string[] = [];

  if (profile.moveIds.has(toID("Trick Room"))) functions.push("trickRoomSetter");
  if (profile.moveIds.has(toID("Tailwind"))) functions.push("tailwindSetter");
  if (profile.weather) functions.push("weatherSetter");
  if (profile.hazards.length > 0) functions.push("hazardSetter");
  if (profile.removal.length > 0) functions.push("hazardControl");
  if (profile.pivots.length > 0) functions.push("pivot");
  if (profile.isWallbreaker) functions.push("wallbreaker");
  if (profile.isCleaner) functions.push("cleaner");
  if (profile.isWinCondition) functions.push("winCondition");
  if (profile.isGlue) functions.push("glue");
  if (profile.broadRole === "Wall") functions.push("wall");
  if (profile.broadRole === "Tank") functions.push("tank");

  if (functions.length === 0) {
    functions.push(profile.broadRole === "Sweeper" ? "winCondition" : "glue");
  }

  return functions;
}

function pickRelevantMoves(profile: MemberProfile) {
  const priorityOrder = [
    "Trick Room",
    "Tailwind",
    "Stealth Rock",
    "Spikes",
    "Toxic Spikes",
    "Sticky Web",
    "Rapid Spin",
    "Defog",
    "Mortal Spin",
    "Court Change",
    "U-turn",
    "Volt Switch",
    "Flip Turn",
    "Parting Shot",
    "Recover",
    "Roost",
    "Wish",
    "Protect",
    "Knock Off",
    "Taunt",
    "Thunder Wave",
    "Will-O-Wisp",
    "Icy Wind",
    "Rain Dance",
    "Sunny Day",
    "Sandstorm",
    "Snowscape",
    ...SETUP_MOVES,
  ];

  const selected: string[] = [];
  for (const moveName of priorityOrder) {
    if (profile.moveNames.includes(moveName) && !selected.includes(moveName)) {
      selected.push(moveName);
    }
    if (selected.length === 3) return selected;
  }

  for (const moveName of profile.moveNames) {
    if (!selected.includes(moveName)) {
      selected.push(moveName);
    }
    if (selected.length === 3) return selected;
  }

  return selected;
}

function buildMemberProfile(
  member: GeneratedTeamMember,
  team: GeneratedTeamMember[],
  templateId: string
): MemberProfile {
  const moveNames = getMoveNames(member);
  const moveIds = new Set(moveNames.map((move) => toID(move)));
  const broadRole = member.role ?? detectSetRole({ moves: moveNames, evs: parseEvs(member.evs) });
  const otherTeamSpeeds = team
    .filter((candidate) => candidate.name !== member.name)
    .map((candidate) => candidate.baseStats?.spe ?? 0)
    .filter((speed) => speed > 0);

  const maxOffense = Math.max(member.baseStats.atk, member.baseStats.spa);
  const speed = member.baseStats.spe;
  const bulk = member.baseStats.hp + member.baseStats.def + member.baseStats.spd;
  const hazards = HAZARD_MOVES.filter((moveName) => hasMove(moveIds, moveName));
  const removal = REMOVAL_MOVES.filter((moveName) => hasMove(moveIds, moveName));
  const pivots = PIVOT_MOVES.filter((moveName) => hasMove(moveIds, moveName));
  const setupMoves = SETUP_MOVES.filter((moveName) => hasMove(moveIds, moveName));
  const recoveryMoves = RECOVERY_MOVES.filter((moveName) => hasMove(moveIds, moveName));
  const statusMoves = STATUS_MOVES.filter((moveName) => hasMove(moveIds, moveName));
  const speedControlMoves = SPEED_CONTROL_MOVES.filter((moveName) => hasMove(moveIds, moveName));
  const supportMoves = DOUBLES_SUPPORT_MOVES.filter((moveName) => hasMove(moveIds, moveName));
  const priorityMoves = PRIORITY_MOVES.filter((moveName) => hasMove(moveIds, moveName));
  const screens = SCREEN_MOVES.filter((moveName) => hasMove(moveIds, moveName));
  const abilityId = toID(member.ability);
  const itemId = toID(member.item);
  const weather = detectWeatherFromAbility(abilityId) ??
    (hasMove(moveIds, "Rain Dance")
      ? "rain"
      : hasMove(moveIds, "Sunny Day")
        ? "sun"
        : hasMove(moveIds, "Sandstorm")
          ? "sand"
          : hasMove(moveIds, "Snowscape")
            ? "snow"
            : null);
  const strategicRole =
    inferPrimaryStrategicRole({
      species: { baseStats: member.baseStats },
      moves: moveNames,
      ability: member.ability,
      templateId,
      broadRole,
      otherTeamSpeeds,
    }) ?? broadRole;

  const isBulky = bulk >= 280 || broadRole === "Wall" || broadRole === "Tank";
  const isFast = speed >= 95;
  const isSlow = speed <= 70;
  const hasChoiceItem = ["choicescarf", "choiceband", "choicespecs"].includes(itemId);
  const hasPriority = priorityMoves.length > 0;
  const hasUtility = hazards.length > 0 || removal.length > 0 || pivots.length > 0 || statusMoves.length > 0 || supportMoves.length > 0;
  const isWallbreaker =
    (maxOffense >= 120 && speed <= 95) ||
    (hasChoiceItem && maxOffense >= 105) ||
    (setupMoves.length > 0 && maxOffense >= 110 && speed <= 90);
  const isCleaner =
    (isFast && maxOffense >= 100) ||
    (hasPriority && maxOffense >= 105) ||
    (templateId === "trickroom" && isSlow && maxOffense >= 105);
  const isWinCondition =
    setupMoves.length > 0 ||
    isCleaner ||
    strategicRole === "Trick Room Sweeper" ||
    strategicRole === "Tailwind Setter";
  const isGlue =
    strategicRole.endsWith("Setter") ||
    strategicRole === "Pivot" ||
    strategicRole === "Hazard Control" ||
    (hasUtility && !isWallbreaker);
  const isEmergencyCheck =
    hasPriority ||
    speedControlMoves.length > 0 ||
    statusMoves.includes("Thunder Wave") ||
    statusMoves.includes("Haze") ||
    (isBulky && statusMoves.length > 0);

  const profile: MemberProfile = {
    member,
    moveNames,
    moveIds,
    speed,
    maxOffense,
    bulk,
    abilityId,
    itemId,
    hazards,
    removal,
    pivots,
    setupMoves,
    recoveryMoves,
    statusMoves,
    speedControlMoves,
    supportMoves,
    priorityMoves,
    screens,
    weather,
    weatherAbuser: false,
    strategicRole,
    broadRole,
    functions: [],
    isBulky,
    isFast,
    isSlow,
    isWinCondition,
    isWallbreaker,
    isCleaner,
    isGlue,
    isEmergencyCheck,
  };

  profile.weatherAbuser = getWeatherAbuser(profile) !== null;
  profile.functions = getPriorityFunctionIds(profile);

  return profile;
}

function isTrickRoomSetter(profile: MemberProfile) {
  return profile.moveIds.has(toID("Trick Room"));
}

function isTailwindSetter(profile: MemberProfile) {
  return profile.moveIds.has(toID("Tailwind"));
}

function isDoublesPositioningPiece(profile: MemberProfile) {
  return (
    profile.pivots.length > 0 ||
    profile.supportMoves.length > 0 ||
    profile.moveIds.has(toID("Fake Out")) ||
    profile.moveIds.has(toID("Follow Me")) ||
    profile.moveIds.has(toID("Rage Powder")) ||
    profile.moveIds.has(toID("Parting Shot")) ||
    profile.moveIds.has(toID("Helping Hand")) ||
    profile.isGlue
  );
}

function isTailwindPayoff(profile: MemberProfile) {
  return (
    !isTailwindSetter(profile) &&
    ((profile.isFast && profile.maxOffense >= 95) ||
      (profile.maxOffense >= 110 && profile.speed >= 80) ||
      (profile.priorityMoves.length > 0 && profile.maxOffense >= 95))
  );
}

function isTrickRoomBreaker(profile: MemberProfile) {
  return !isTrickRoomSetter(profile) && profile.isSlow && profile.maxOffense >= 95;
}

function isBalancedCleaner(profile: MemberProfile) {
  return profile.isCleaner || (profile.isFast && profile.maxOffense >= 95);
}

function getDoublesModeSignals(profiles: MemberProfile[]) {
  return {
    trickRoomSetters: profiles.filter(isTrickRoomSetter).length,
    tailwindSetters: profiles.filter(isTailwindSetter).length,
    trickRoomBreakers: profiles.filter(isTrickRoomBreaker).length,
    tailwindPayoffs: profiles.filter(isTailwindPayoff).length,
    positioningPieces: profiles.filter(isDoublesPositioningPiece).length,
    speedControlPieces: profiles.filter((profile) => profile.speedControlMoves.length > 0).length,
    cleaners: profiles.filter(isBalancedCleaner).length,
  };
}

function inferArchetype(
  profiles: MemberProfile[],
  templateId: string,
  formatProfile: CompetitiveFormatProfile
) {
  const isDoubles = formatProfile.isDoubles;
  const doublesSignals = isDoubles ? getDoublesModeSignals(profiles) : null;

  if (isDoubles && doublesSignals) {
    if (templateId === "trickroom") {
      return "trickroom";
    }
    if (templateId === "tailwind") {
      return "tailwind";
    }
    if (
      doublesSignals.tailwindSetters >= 1 &&
      doublesSignals.tailwindPayoffs >= 2 &&
      (doublesSignals.trickRoomSetters === 0 || templateId === "balanced")
    ) {
      return "tailwind";
    }
    if (
      doublesSignals.trickRoomSetters >= 1 &&
      doublesSignals.trickRoomBreakers >= 2 &&
      doublesSignals.tailwindSetters === 0
    ) {
      return "trickroom";
    }
  }

  const bulkyCount = profiles.filter((profile) => profile.isBulky).length;
  const recoveryCount = profiles.filter((profile) => profile.recoveryMoves.length > 0).length;
  const sweepCount = profiles.filter((profile) => profile.broadRole === "Sweeper" || profile.isWinCondition).length;
  const pivotCount = profiles.filter((profile) => profile.pivots.length > 0).length;
  const hazardCount = profiles.reduce((sum, profile) => sum + profile.hazards.length, 0);
  const hazardSetters = profiles.filter((profile) => profile.hazards.length > 0).length;
  const strictHazardstack = templateId === "hazardstack";
  const strictVoltTurn = templateId === "voltturn";
  const strictStall = templateId === "stall" || templateId === "semistall";
  const weatherSetter = profiles.find((profile) => profile.weather);
  const weatherAbusers =
    weatherSetter?.weather
      ? profiles.filter((profile) => {
        const abuserWeather = getWeatherAbuser(profile);
        return (
          profile.member.name !== weatherSetter.member.name &&
          abuserWeather === weatherSetter.weather
        );
      }).length
      : 0;

  if (
    !isDoubles &&
    bulkyCount >= (strictStall ? 4 : 5) &&
    recoveryCount >= (strictStall ? 3 : 4)
  ) {
    return sweepCount <= 1 ? "stall" : "semistall";
  }
  if (weatherSetter?.weather && weatherAbusers >= 2) {
    return weatherSetter.weather;
  }
  if (
    !isDoubles &&
    hazardSetters >= 2 &&
    hazardCount >= (strictHazardstack ? 2 : 3)
  ) {
    return "hazardstack";
  }
  if (!isDoubles && pivotCount >= (strictVoltTurn ? 2 : 3) && sweepCount >= 2) {
    return "voltturn";
  }
  if (
    isDoubles &&
    doublesSignals &&
    doublesSignals.positioningPieces >= 1 &&
    doublesSignals.speedControlPieces >= 1 &&
    doublesSignals.cleaners >= 1
  ) {
    return bulkyCount >= 2 && sweepCount >= 2 ? "bulkyoffense" : "balanced";
  }
  if (sweepCount >= Math.max(3, profiles.length - 1)) {
    return "offense";
  }
  if (bulkyCount >= 2 && sweepCount >= 2) {
    return "bulkyoffense";
  }
  if (templateId && templateId !== "random") {
    return templateId;
  }
  return "balanced";
}

function inferSubarchetype(
  profiles: MemberProfile[],
  archetype: string,
  formatProfile: CompetitiveFormatProfile
) {
  const isDoubles = formatProfile.isDoubles;
  const bulkyCount = profiles.filter((profile) => profile.isBulky).length;
  const hazardCount = profiles.reduce((sum, profile) => sum + profile.hazards.length, 0);
  const screenCount = profiles.reduce((sum, profile) => sum + profile.screens.length, 0);
  const doublesSignals = isDoubles ? getDoublesModeSignals(profiles) : null;
  const weatherSetter = profiles.find((profile) => profile.weather)?.weather;
  const weatherAbusers = profiles.filter((profile) => profile.weatherAbuser).length;

  switch (archetype) {
    case "balanced":
      if (
        isDoubles &&
        doublesSignals &&
        doublesSignals.trickRoomSetters >= 1 &&
        doublesSignals.tailwindSetters >= 1
      ) {
        return "tailroom";
      }
      return bulkyCount >= 4 ? "fat balance" : "bulky balance";
    case "offense":
      if (!isDoubles && screenCount >= 2) return "screens HO";
      if (!isDoubles && hazardCount >= 2) return "hazard HO";
      return "fast offense";
    case "trickroom":
      return doublesSignals && doublesSignals.trickRoomSetters >= 2 && doublesSignals.trickRoomBreakers >= 3
        ? "hard TR"
        : "semiroom";
    case "tailwind":
      return "tailwind offense";
    case "rain":
    case "sun":
    case "sand":
      if (weatherSetter && weatherAbusers >= 2 && bulkyCount <= 2) {
        return `${weatherSetter} offense`;
      }
      return `${weatherSetter ?? archetype} balance`;
    default:
      return undefined;
  }
}

function pickUniqueModeMembers(
  teamProfile: TeamProfile,
  preferred: MemberProfile[],
  minimum = 3,
  maximum = 4
) {
  const ordered = [
    ...preferred,
    ...teamProfile.supportMembers,
    ...teamProfile.pivotMembers,
    ...teamProfile.winConditionMembers,
    ...teamProfile.breakerMembers,
    ...teamProfile.profiles,
  ];
  const names: string[] = [];

  for (const profile of ordered) {
    const name = profile?.member.name;
    if (!name || names.includes(name)) {
      continue;
    }
    names.push(name);
    if (names.length >= maximum) {
      break;
    }
  }

  return names.length >= minimum ? names : [];
}

function getTournamentPreferredProfiles(
  teamProfile: TeamProfile,
  mode?: "balanced" | "tailwind" | "trickroom" | "tempo",
  minimumOverlap: number = 3
) {
  const priorSet = getTournamentPriorSet(teamProfile.format);
  if (!priorSet) {
    return [];
  }

  const teamProfilesById = new Map(
    teamProfile.profiles.map((profile) => [toID(profile.member.name), profile])
  );
  const templateId = teamProfile.templateId;
  const matches = priorSet.bring4Priors
    .filter((entry) => !mode || entry.mode === mode)
    .map((entry) => {
      const profiles = entry.members
        .map((memberName) => teamProfilesById.get(toID(memberName)))
        .filter((profile): profile is MemberProfile => Boolean(profile));
      const overlap = profiles.length;
      const modeBoost =
        templateId === entry.mode ? 1.25 : templateId === "balanced" ? 1 : entry.mode === "balanced" ? 1 : 0.6;
      return {
        profiles,
        overlap,
        score: overlap * entry.weight * entry.confidence * modeBoost,
      };
    })
    .filter((match) => match.overlap >= minimumOverlap)
    .sort((a, b) => b.score - a.score);

  return matches[0]?.profiles ?? [];
}

function getTournamentLeadPairProfiles(
  teamProfile: TeamProfile,
  mode?: "balanced" | "tailwind" | "trickroom" | "tempo"
) {
  const priorSet = getTournamentPriorSet(teamProfile.format);
  if (!priorSet) {
    return [];
  }

  const teamProfilesById = new Map(
    teamProfile.profiles.map((profile) => [toID(profile.member.name), profile])
  );
  const templateId = teamProfile.templateId;
  const matches = priorSet.leadPairs
    .filter((entry) => !mode || entry.mode === mode)
    .map((entry) => {
      const profiles = entry.members
        .map((memberName) => teamProfilesById.get(toID(memberName)))
        .filter((profile): profile is MemberProfile => Boolean(profile));
      const overlap = profiles.length;
      const modeBoost =
        templateId === entry.mode ? 1.25 : templateId === "balanced" ? 1 : entry.mode === "balanced" ? 1 : 0.6;
      return {
        profiles,
        overlap,
        score: overlap * entry.weight * entry.confidence * modeBoost,
      };
    })
    .filter((match) => match.overlap >= 2)
    .sort((a, b) => b.score - a.score);

  return matches[0]?.profiles ?? [];
}

function buildRecommendedModes(teamProfile: TeamProfile): TeamGuideMode[] {
  if (!teamProfile.formatProfile.requireRecommendedModes) {
    return [];
  }

  const { lang } = teamProfile;
  const modes: TeamGuideMode[] = [];
  const trickRoomSetter = teamProfile.profiles.find(isTrickRoomSetter);
  const tailwindSetter = teamProfile.profiles.find(isTailwindSetter);
  const weatherSetter = teamProfile.weatherSetter;
  const slowBreakers = teamProfile.profiles.filter(isTrickRoomBreaker);
  const fastAttackers = teamProfile.profiles.filter(isTailwindPayoff);
  const positioningPieces = teamProfile.profiles.filter(isDoublesPositioningPiece);
  const balancedPriorProfiles = getTournamentPreferredProfiles(teamProfile, "balanced");
  const tempoPriorProfiles = getTournamentPreferredProfiles(teamProfile, "tempo");
  const standardPriorProfiles =
    balancedPriorProfiles.length > 0 ? balancedPriorProfiles : tempoPriorProfiles;
  const tailwindPriorProfiles = [
    ...getTournamentLeadPairProfiles(teamProfile, "tailwind"),
    ...getTournamentPreferredProfiles(teamProfile, "tailwind"),
  ];
  const trickRoomPriorProfiles = [
    ...getTournamentLeadPairProfiles(teamProfile, "trickroom"),
    ...getTournamentPreferredProfiles(teamProfile, "trickroom"),
  ];
  const standardModeMembers = pickUniqueModeMembers(
    teamProfile,
    [
      ...standardPriorProfiles,
      getEarlyKey(teamProfile),
      getMidKey(teamProfile),
      getLateKey(teamProfile),
      positioningPieces[0] ?? teamProfile.supportMembers[0],
    ].filter((profile): profile is MemberProfile => Boolean(profile))
  );

  if (standardModeMembers.length > 0) {
    modes.push({
      title: text(lang, "Standard Mode", "Modo estandar"),
      summary: text(
        lang,
        "Default to this four when you want the most stable mix of positioning, speed control, and endgame pressure.",
        "Este es el cuatro por defecto cuando quieres la mezcla mas estable de posicionamiento, speed control y presion de endgame."
      ),
      members: standardModeMembers,
    });
  }

  const addMode = (mode: TeamGuideMode, prioritize = false) => {
    if (mode.members.length < 3 || mode.members.length > 4) {
      return;
    }
    if (prioritize) {
      modes.unshift(mode);
      return;
    }
    modes.push(mode);
  };

  if (tailwindSetter) {
    const tailwindModeMembers = pickUniqueModeMembers(teamProfile, [
      ...tailwindPriorProfiles,
      tailwindSetter,
      ...fastAttackers.slice(0, 2),
      positioningPieces.find((profile) => profile.member.name !== tailwindSetter.member.name) ??
        teamProfile.supportMembers[0],
    ]);
    if (tailwindModeMembers.length > 0) {
      addMode(
        {
          title: text(lang, "Tailwind Mode", "Modo Tailwind"),
          summary: text(
            lang,
            `Lead with ${tailwindSetter.member.name} when you want immediate tempo and let ${joinList(tailwindModeMembers.slice(1), lang)} abuse the speed swing.`,
            `Abre con ${tailwindSetter.member.name} cuando quieras tempo inmediato y deja que ${joinList(tailwindModeMembers.slice(1), lang)} exploten el cambio de velocidad.`
          ),
          members: tailwindModeMembers,
        },
        teamProfile.templateId === "tailwind"
      );
    }
  }

  if (trickRoomSetter) {
    const trickRoomModeMembers = pickUniqueModeMembers(teamProfile, [
      ...trickRoomPriorProfiles,
      trickRoomSetter,
      ...slowBreakers.slice(0, 2),
      positioningPieces.find((profile) => profile.member.name !== trickRoomSetter.member.name) ??
        teamProfile.supportMembers[0],
    ]);
    if (trickRoomModeMembers.length > 0) {
      addMode(
        {
          title: text(lang, "Trick Room Mode", "Modo Trick Room"),
          summary: text(
            lang,
            `Use ${trickRoomSetter.member.name} to create room and convert those turns with ${joinList(trickRoomModeMembers.slice(1), lang)}.`,
            `Usa a ${trickRoomSetter.member.name} para poner room y convertir esos turnos con ${joinList(trickRoomModeMembers.slice(1), lang)}.`
          ),
          members: trickRoomModeMembers,
        },
        teamProfile.templateId === "trickroom"
      );
    }
  }

  if (weatherSetter && teamProfile.weatherAbusers.length > 0) {
    const weatherCore = pickUniqueModeMembers(teamProfile, [
      weatherSetter,
      ...teamProfile.weatherAbusers.slice(0, 2),
      positioningPieces[0] ?? teamProfile.supportMembers[0],
    ]);
    if (weatherCore.length > 0) {
      addMode({
        title: text(lang, "Weather Mode", "Modo de clima"),
        summary: text(
          lang,
          `Preserve ${weatherSetter.member.name}, refresh weather only when the next attacker can cash it in, and rotate through ${joinList(weatherCore.slice(1), lang)}.`,
          `Preserva a ${weatherSetter.member.name}, refresca el clima solo cuando el siguiente atacante lo pueda cobrar y rota con ${joinList(weatherCore.slice(1), lang)}.`
        ),
        members: weatherCore,
      });
    }
  }

  return modes
    .filter(
      (mode, index, array) =>
        array.findIndex((candidate) => candidate.title === mode.title) === index
    )
    .slice(0, 3);
}

function buildStructuralWeaknesses(team: GeneratedTeamMember[], lang: GuideLang, teamProfile: TeamProfile) {
  const weaknesses: string[] = [];
  const weakTypes = ATTACK_TYPES.map((type) => {
    const weakCount = team.reduce((count, member) => {
      const effectiveness = getEffectiveness(type, member.types);
      return count + (effectiveness > 1 ? 1 : 0);
    }, 0);

    return { type, weakCount };
  })
    .filter((entry) => entry.weakCount >= 2)
    .sort((a, b) => b.weakCount - a.weakCount)
    .slice(0, 3);

  weakTypes.forEach((entry) => {
    weaknesses.push(
      text(
        lang,
        `Repeated ${translateType(entry.type, lang)}-type pressure can force awkward sacks if you lose momentum.`,
        `La presion repetida de tipo ${translateType(entry.type, lang)} puede obligarte a sacrificar piezas si perdes el tempo.`
      )
    );
  });

  if (teamProfile.removalMembers.length === 0 && FORMATS[teamProfile.format as FormatId]?.gameType === "singles") {
    weaknesses.push(
      text(
        lang,
        "Long games get harder because you do not have true hazard removal.",
        "Las partidas largas se complican porque no tenes removal real de hazards."
      )
    );
  }

  if (teamProfile.speedControlMembers.length === 0 && !teamProfile.profiles.some((profile) => profile.isFast)) {
    weaknesses.push(
      text(
        lang,
        "Very fast teams can force reactive turns if your main speed control piece falls too early.",
        "Los equipos muy rapidos pueden forzarte a jugar a la defensiva si tu pieza principal de speed control cae demasiado pronto."
      )
    );
  }

  return weaknesses.slice(0, 4);
}

function buildTeamProfile(
  team: GeneratedTeamMember[],
  format: string,
  templateId: string,
  lang: GuideLang
): TeamProfile {
  const profiles = team.map((member) => buildMemberProfile(member, team, templateId));
  const formatProfile = getCompetitiveFormatProfile(format);
  const isDoubles = formatProfile.isDoubles || FORMATS[format as FormatId]?.gameType === "doubles";
  const archetype = inferArchetype(profiles, templateId, formatProfile);
  const subarchetype = inferSubarchetype(profiles, archetype, formatProfile);
  const hazardMembers = profiles.filter((profile) => profile.hazards.length > 0);
  const removalMembers = profiles.filter((profile) => profile.removal.length > 0);
  const pivotMembers = profiles.filter((profile) => profile.pivots.length > 0);
  const winConditionMembers = profiles.filter((profile) => profile.isWinCondition);
  const setupMembers = profiles.filter((profile) => profile.setupMoves.length > 0);
  const supportMembers = profiles.filter((profile) => profile.isGlue);
  const wallMembers = profiles.filter((profile) => profile.isBulky);
  const breakerMembers = profiles.filter((profile) => profile.isWallbreaker);
  const speedControlMembers = profiles.filter((profile) => profile.speedControlMoves.length > 0 || profile.priorityMoves.length > 0 || profile.isFast);
  const weatherSetter = profiles.find((profile) => profile.weather);
  const weatherAbusers =
    weatherSetter?.weather
      ? profiles.filter(
          (profile) =>
            profile.member.name !== weatherSetter.member.name &&
            getWeatherAbuser(profile) === weatherSetter.weather
        )
      : profiles.filter((profile) => profile.weatherAbuser);

  const teamProfile: TeamProfile = {
    format,
    templateId,
    lang,
    isDoubles,
    formatProfile,
    archetype,
    subarchetype,
    profiles,
    hazardMembers,
    removalMembers,
    pivotMembers,
    winConditionMembers,
    setupMembers,
    supportMembers,
    wallMembers,
    breakerMembers,
    speedControlMembers,
    weatherSetter,
    weatherAbusers,
    structuralWeaknesses: [],
    recommendedModes: [],
  };

  teamProfile.structuralWeaknesses = buildStructuralWeaknesses(team, lang, teamProfile);
  teamProfile.recommendedModes = buildRecommendedModes(teamProfile);
  return teamProfile;
}

function getPrimaryWinCondition(teamProfile: TeamProfile) {
  return teamProfile.winConditionMembers[0] ?? teamProfile.breakerMembers[0] ?? teamProfile.profiles[0];
}

function getEarlyKey(teamProfile: TeamProfile) {
  return (
    teamProfile.hazardMembers[0] ??
    teamProfile.profiles.find((profile) => profile.moveIds.has(toID("Trick Room")) || profile.moveIds.has(toID("Tailwind"))) ??
    teamProfile.pivotMembers[0] ??
    teamProfile.profiles[0]
  );
}

function getMidKey(teamProfile: TeamProfile) {
  return teamProfile.breakerMembers[0] ?? teamProfile.pivotMembers[0] ?? teamProfile.profiles[1] ?? teamProfile.profiles[0];
}

function getLateKey(teamProfile: TeamProfile) {
  return getPrimaryWinCondition(teamProfile) ?? teamProfile.profiles.at(-1) ?? teamProfile.profiles[0];
}

function buildOverview(teamProfile: TeamProfile): TeamGuideOverview {
  const { lang, archetype, subarchetype } = teamProfile;
  const lead = getEarlyKey(teamProfile);
  const breaker = getMidKey(teamProfile);
  const cleaner = getLateKey(teamProfile);
  const speedControl = teamProfile.profiles.flatMap((profile) => {
    if (profile.moveIds.has(toID("Trick Room"))) {
      return [text(lang, `${profile.member.name} provides Trick Room`, `${profile.member.name} aporta Trick Room`)];
    }
    if (profile.moveIds.has(toID("Tailwind"))) {
      return [text(lang, `${profile.member.name} provides Tailwind`, `${profile.member.name} aporta Tailwind`)];
    }
    if (profile.moveIds.has(toID("Thunder Wave")) || profile.moveIds.has(toID("Icy Wind"))) {
      return [text(lang, `${profile.member.name} gives soft speed control`, `${profile.member.name} da speed control suave`)];
    }
    if (profile.priorityMoves.length > 0) {
      return [text(lang, `${profile.member.name} carries priority for damage control`, `${profile.member.name} tiene prioridad para apagar incendios`)];
    }
    return [];
  });
  const hazards = teamProfile.hazardMembers.map((profile) =>
    `${joinList(profile.hazards, lang)} ${text(lang, "on", "en")} ${profile.member.name}`
  );
  const removal = teamProfile.removalMembers.map((profile) =>
    `${joinList(profile.removal, lang)} ${text(lang, "on", "en")} ${profile.member.name}`
  );
  const pivots = teamProfile.pivotMembers.map((profile) =>
    `${profile.member.name} ${text(lang, "creates safe entries", "genera entradas seguras")}`
  );
  const winConditions = teamProfile.winConditionMembers.slice(0, 3).map((profile) =>
    text(
      lang,
      `${profile.member.name} is your main closer once checks are softened`,
      `${profile.member.name} es tu cierre principal cuando los checks ya estan gastados`
    )
  );
  const defensiveBackbone = teamProfile.wallMembers.slice(0, 3).map((profile) =>
    text(
      lang,
      `${profile.member.name} absorbs pressure and buys turns`,
      `${profile.member.name} absorbe presion y compra turnos`
    )
  );

  const identitySummary = (() => {
    switch (archetype) {
      case "trickroom":
        return text(
          lang,
          `This team wants to open precise Trick Room windows with ${lead.member.name}, bring in slow breakers like ${breaker.member.name}, and cash those turns into immediate progress.`,
          `Este equipo quiere abrir ventanas precisas de Trick Room con ${lead.member.name}, meter breakers lentos como ${breaker.member.name} y convertir esos turnos en progreso inmediato.`
        );
      case "tailwind":
        return text(
          lang,
          `This team plays in bursts: establish Tailwind with ${lead.member.name}, force awkward positioning, and let attackers like ${cleaner.member.name} overwhelm the opposing board.`,
          `Este equipo juega por rafagas: activa Tailwind con ${lead.member.name}, forzando malas posiciones, y deja que atacantes como ${cleaner.member.name} desborden la mesa rival.`
        );
      case "rain":
      case "sun":
      case "sand":
        return text(
          lang,
          `This is a ${archetypeLabel(archetype, lang).toLowerCase()} team. Protect your weather setter, use pivots to refresh the field condition, and pressure with the abusers before the weather turns expire.`,
          `Este es un equipo de ${archetypeLabel(archetype, lang).toLowerCase()}. Protege al setter del clima, usa pivotes para refrescar la condicion de campo y presiona con los abusadores antes de que se acaben los turnos.`
        );
      case "hazardstack":
        return text(
          lang,
          `This team wins by forcing switches, keeping hazards up, and letting progress makers like ${breaker.member.name} convert every chip turn into a real advantage.`,
          `Este equipo gana forzando cambios, manteniendo los hazards y dejando que piezas de progreso como ${breaker.member.name} conviertan cada turno de chip en ventaja real.`
        );
      case "voltturn":
        return text(
          lang,
          `This team leans on repeated pivots to steal initiative, reveal the opposing answers, and bring in the right breaker without taking unnecessary hits.`,
          `Este equipo se apoya en pivoteos repetidos para robar la iniciativa, revelar las respuestas rivales y meter al breaker correcto sin comerse golpes gratis.`
        );
      case "stall":
      case "semistall":
        return text(
          lang,
          `This team is built to absorb pressure, deny explosive turns, and turn long games into a resource battle where your defensive backbone outlasts the opponent.`,
          `Este equipo esta armado para absorber presion, negar turnos explosivos y convertir las partidas largas en una guerra de recursos donde tu backbone defensivo dura mas que el rival.`
        );
      case "offense":
        return text(
          lang,
          `This team wants to keep the game moving forward, force bad trades early, and leave just enough room for ${cleaner.member.name} to close.`,
          `Este equipo quiere mantener la partida siempre hacia adelante, forzar intercambios malos desde temprano y dejarle la mesa servida a ${cleaner.member.name}.`
        );
      case "bulkyoffense":
        return text(
          lang,
          `This team mixes pressure and staying power: use your bulk to avoid bad trades, then let your stronger attackers take over the mid and late game.`,
          `Este equipo mezcla presion y aguante: usa tu bulk para evitar malos cambios y despues deja que tus atacantes mas fuertes se aduenen del mid y late game.`
        );
      default:
        return text(
          lang,
          `This is a balanced team that wants to establish solid positions early, trade on favorable terms, and preserve ${cleaner.member.name} for the most important closing turns.`,
          `Este es un equipo balanceado que quiere establecer buenas posiciones desde temprano, intercambiar en buenos terminos y preservar a ${cleaner.member.name} para los turnos de cierre.`
        );
    }
  })();

  const planSummary = text(
    lang,
    `Open with ${lead.member.name} when you need field control, use ${breaker.member.name} to make the first real hole, and protect ${cleaner.member.name} until the opposing checks are chipped enough to clean.`,
    `Abri con ${lead.member.name} cuando necesites control de campo, usa ${breaker.member.name} para abrir el primer hueco real y preserva a ${cleaner.member.name} hasta que los checks rivales esten lo bastante gastados como para cerrar.`
  );

  const secondaryPlans: string[] = [];
  if (teamProfile.hazardMembers.length > 0) secondaryPlans.push(text(lang, "Hazard pressure", "Presion con hazards"));
  if (teamProfile.pivotMembers.length > 0) secondaryPlans.push(text(lang, "Pivot positioning", "Posicionamiento por pivots"));
  if (teamProfile.setupMembers.length > 0) secondaryPlans.push(text(lang, "Setup endgame", "Endgame de setup"));
  if (teamProfile.weatherSetter) secondaryPlans.push(text(lang, "Weather turn management", "Gestion de turnos de clima"));

  return {
    identity: subarchetype
      ? `${archetypeLabel(archetype, lang)} (${subarchetypeLabel(subarchetype, lang)})`
      : archetypeLabel(archetype, lang),
    identitySummary,
    planSummary,
    secondaryPlans,
    speedControl,
    hazards,
    removal,
    pivots,
    winConditions,
    defensiveBackbone,
    structuralWeaknesses: teamProfile.structuralWeaknesses,
  };
}

function getDefensivePartner(profile: MemberProfile, teamProfile: TeamProfile) {
  const weaknesses = ATTACK_TYPES.filter((type) => getEffectiveness(type, profile.member.types) > 1);

  for (const teammate of teamProfile.profiles) {
    if (teammate.member.name === profile.member.name) continue;
    if (weaknesses.some((type) => getEffectiveness(type, teammate.member.types) < 1)) {
      return teammate;
    }
  }

  return teamProfile.profiles.find((teammate) => teammate.member.name !== profile.member.name);
}

function buildSynergyNotes(profile: MemberProfile, teamProfile: TeamProfile): TeamSynergyNote[] {
  const { lang } = teamProfile;
  const notes: TeamSynergyNote[] = [];

  if (profile.moveIds.has(toID("Trick Room"))) {
    const abuser = teamProfile.profiles.find(
      (candidate) =>
        candidate.member.name !== profile.member.name &&
        candidate.isSlow &&
        candidate.maxOffense >= 95
    );
    if (abuser) {
      notes.push({
        name: abuser.member.name,
        isActive: true,
        reason: text(
          lang,
          `${abuser.member.name} is the natural payoff once Trick Room is active.`,
          `${abuser.member.name} es el payoff natural una vez que Trick Room esta activo.`
        ),
      });
    }
  }

  if (profile.pivots.length > 0) {
    const breaker = teamProfile.breakerMembers.find((candidate) => candidate.member.name !== profile.member.name);
    if (breaker) {
      notes.push({
        name: breaker.member.name,
        isActive: true,
        reason: text(
          lang,
          `${profile.member.name} can pivot ${breaker.member.name} into the field without forcing it to tank chip first.`,
          `${profile.member.name} puede meter a ${breaker.member.name} al campo sin obligarlo a comerse chip antes.`
        ),
      });
    }
  }

  if (profile.hazards.length > 0) {
    const cleaner = teamProfile.winConditionMembers.find((candidate) => candidate.member.name !== profile.member.name);
    if (cleaner) {
      notes.push({
        name: cleaner.member.name,
        isActive: true,
        reason: text(
          lang,
          `${joinList(profile.hazards, lang)} makes ${cleaner.member.name}'s endgame much cleaner.`,
          `${joinList(profile.hazards, lang)} hace mucho mas limpio el endgame de ${cleaner.member.name}.`
        ),
      });
    }
  }

  if (notes.length < 2) {
    const defensivePartner = getDefensivePartner(profile, teamProfile);
    if (defensivePartner && defensivePartner.member.name !== profile.member.name) {
      notes.push({
        name: defensivePartner.member.name,
        isActive: true,
        reason: text(
          lang,
          `${defensivePartner.member.name} covers some of the switch-ins that punish ${profile.member.name}.`,
          `${defensivePartner.member.name} cubre varios de los cambios que castigan a ${profile.member.name}.`
        ),
      });
    }
  }

  return notes.slice(0, 3);
}

function buildSynergyTip(profile: MemberProfile, notes: TeamSynergyNote[], teamProfile: TeamProfile): TeamSynergyTip | undefined {
  const { lang } = teamProfile;
  const firstNote = notes[0];
  if (!firstNote) return undefined;

  if (profile.moveIds.has(toID("Trick Room")) || profile.moveIds.has(toID("Tailwind"))) {
    return {
      kind: "support",
      teammate: firstNote.name,
      headline: text(lang, "Pair this with your payoff turn", "Emparejalo con tu turno de payoff"),
      detail: text(
        lang,
        `Do not spend ${profile.member.name}'s speed control turns unless ${firstNote.name} or another attacker can exploit them immediately.`,
        `No gastes los turnos de speed control de ${profile.member.name} si ${firstNote.name} u otro atacante no los puede explotar enseguida.`
      ),
    };
  }

  if (profile.pivots.length > 0) {
    return {
      kind: "positioning",
      teammate: firstNote.name,
      headline: text(lang, "Use it to create the right entry", "Usalo para crear la entrada correcta"),
      detail: text(
        lang,
        `The value of ${profile.member.name} is not raw damage; it is getting ${firstNote.name} or another payoff piece onto the field on your terms.`,
        `El valor de ${profile.member.name} no es el dano directo; es meter a ${firstNote.name} u otra pieza de payoff al campo en tus terminos.`
      ),
    };
  }

  return {
    kind: "pairing",
    teammate: firstNote.name,
    headline: text(lang, "Plan around this pairing", "Planifica alrededor de esta pareja"),
    detail: firstNote.reason,
  };
}

function buildMemberSummary(profile: MemberProfile, teamProfile: TeamProfile) {
  const { lang, archetype } = teamProfile;
  const winCondition = getPrimaryWinCondition(teamProfile);

  if (profile.moveIds.has(toID("Trick Room"))) {
    return text(
      lang,
      `${profile.member.name} sets the pace of the game by choosing when Trick Room turns begin. It should usually act as the bridge that brings your slower attackers into a favorable board state.`,
      `${profile.member.name} marca el ritmo de la partida decidiendo cuando empiezan los turnos de Trick Room. Normalmente tiene que ser el puente que deja a tus atacantes lentos en un board favorable.`
    );
  }

  if (profile.moveIds.has(toID("Tailwind"))) {
    return text(
      lang,
      `${profile.member.name} is here to compress speed control and positioning. Treat Tailwind as a timing tool that lets your damage pieces take two or three decisive turns in a row.`,
      `${profile.member.name} esta para comprimir speed control y posicionamiento. Trata Tailwind como una herramienta de timing que deja a tus piezas de dano encadenar dos o tres turnos decisivos.`
    );
  }

  if (profile.hazards.length > 0) {
    return text(
      lang,
      `${profile.member.name} creates long-term progress by forcing every opposing switch to matter more. Its value grows when the rest of the team keeps the pressure high enough that the opponent cannot remove hazards comfortably.`,
      `${profile.member.name} crea progreso a largo plazo forzando que cada cambio rival cueste mas. Su valor crece cuando el resto del equipo mantiene la presion alta y no deja remover hazards con comodidad.`
    );
  }

  if (profile.removal.length > 0) {
    return text(
      lang,
      `${profile.member.name} keeps the rest of the team from bleeding too much chip. Do not waste it early if your win condition needs a clean field to keep switching in.`,
      `${profile.member.name} evita que el resto del equipo se desgaste de mas. No lo malgastes temprano si tu win condition necesita un campo limpio para seguir entrando.`
    );
  }

  if (profile.pivots.length > 0) {
    return text(
      lang,
      `${profile.member.name} is a tempo piece. It does not need to win exchanges by itself; it needs to keep the initiative on your side and feed the right breaker into the right matchup.`,
      `${profile.member.name} es una pieza de tempo. No necesita ganar intercambios por si solo; necesita mantener la iniciativa de tu lado y alimentar al breaker correcto en el matchup correcto.`
    );
  }

  if (profile.isWallbreaker) {
    return text(
      lang,
      `${profile.member.name} is one of the main progress makers. Aim it at the opposing backbone early enough to force damage, but do not expose it carelessly before the key checks are identified.`,
      `${profile.member.name} es uno de los principales generadores de progreso. Apuntalo contra el backbone rival lo bastante temprano como para forzar dano, pero no lo expongas de forma torpe antes de identificar los checks clave.`
    );
  }

  if (profile.isCleaner && winCondition.member.name === profile.member.name) {
    return text(
      lang,
      `${profile.member.name} is your cleanest late-game closer. The rest of the team should mainly be buying just enough chip, positioning, and resource denial to let it finish the game.`,
      `${profile.member.name} es tu mejor cerrador de late game. El resto del equipo deberia enfocarse en comprar el chip, el posicionamiento y la negacion de recursos necesarios para que cierre.`
    );
  }

  if (archetype === "stall" || archetype === "semistall" || profile.isBulky) {
    return text(
      lang,
      `${profile.member.name} stabilizes longer games. Its job is to absorb pressure, deny free setup, and keep the match from spiraling while your more proactive pieces make progress.`,
      `${profile.member.name} estabiliza las partidas largas. Su trabajo es absorber presion, negar setup gratis y evitar que la partida se descontrole mientras tus piezas mas proactivas generan progreso.`
    );
  }

  return text(
    lang,
    `${profile.member.name} is a flexible piece in this build. Use it to keep the board state clean, avoid unnecessary chip, and make sure the real win condition gets the turns it needs later.`,
    `${profile.member.name} es una pieza flexible de este equipo. Usalo para mantener limpio el board state, evitar chip innecesario y asegurarte de que la win condition real tenga los turnos que necesita mas adelante.`
  );
}

function buildMemberPreserve(profile: MemberProfile, teamProfile: TeamProfile) {
  const { lang } = teamProfile;
  const preserve: string[] = [];

  if (profile.moveIds.has(toID("Trick Room"))) {
    preserve.push(
      text(
        lang,
        "Keep it healthy enough to set Trick Room more than once if the matchup is not already won.",
        "Mantenelo con vida suficiente para poder poner Trick Room mas de una vez si el matchup todavia no esta ganado."
      )
    );
  }
  if (profile.removal.length > 0) {
    preserve.push(
      text(
        lang,
        "Preserve it if hazards make your pivots or cleaner noticeably worse.",
        "Preservalo si los hazards empeoran de forma clara a tus pivots o a tu cleaner."
      )
    );
  }
  if (profile.isWinCondition) {
    preserve.push(
      text(
        lang,
        "Do not cash it in for medium damage before the opposing checks are softened.",
        "No lo cambies por dano medio antes de que los checks rivales esten gastados."
      )
    );
  }
  if (profile.pivots.length > 0) {
    preserve.push(
      text(
        lang,
        "Its HP is a resource because every extra pivot sequence can create one more safe entry.",
        "Sus PS son un recurso porque cada secuencia extra de pivot puede crear una entrada segura mas."
      )
    );
  }

  if (preserve.length === 0) {
    preserve.push(
      text(
        lang,
        "Try to keep it healthy until you know exactly which opposing piece it is supposed to answer.",
        "Intenta conservarlo sano hasta tener claro que pieza rival esta supuesto a contestar."
      )
    );
  }

  return preserve.slice(0, 3);
}

function buildMemberAvoid(profile: MemberProfile, teamProfile: TeamProfile) {
  const { lang, archetype } = teamProfile;
  const avoid: string[] = [];

  if (profile.moveIds.has(toID("Trick Room"))) {
    avoid.push(
      text(
        lang,
        "Do not click Trick Room on a turn where none of your abusers can capitalize immediately.",
        "No hagas Trick Room en un turno donde ninguno de tus abusadores lo puede capitalizar enseguida."
      )
    );
  }
  if (profile.isWallbreaker) {
    avoid.push(
      text(
        lang,
        "Avoid exposing it to status or free chip before it has forced progress on the defensive core.",
        "Evita exponerlo a estados o chip gratis antes de que haya forzado progreso sobre el core defensivo."
      )
    );
  }
  if (profile.removal.length > 0 && archetype === "hazardstack") {
    avoid.push(
      text(
        lang,
        "Do not spend it only to clear one layer if the exchange leaves you without the field control piece you actually need later.",
        "No lo gastes solo para limpiar una capa si el intercambio te deja sin la pieza de control de campo que realmente necesitas despues."
      )
    );
  }
  if (profile.pivots.length > 0) {
    avoid.push(
      text(
        lang,
        "Avoid blind pivoting into obvious punishes; tempo only matters if the receiver actually likes the position.",
        "Evita pivotear a ciegas hacia castigos obvios; el tempo solo importa si la pieza que entra realmente agradece la posicion."
      )
    );
  }

  if (avoid.length === 0) {
    avoid.push(
      text(
        lang,
        "Avoid trading it for low-value chip when another teammate can take the same line with less risk.",
        "Evita cambiarlo por chip de poco valor cuando otro companero puede tomar la misma linea con menos riesgo."
      )
    );
  }

  return avoid.slice(0, 3);
}

function buildMemberEntryPoints(profile: MemberProfile, teamProfile: TeamProfile) {
  const { lang } = teamProfile;
  const entryPoints: string[] = [];

  if (profile.moveIds.has(toID("Trick Room")) || profile.moveIds.has(toID("Tailwind"))) {
    entryPoints.push(
      text(
        lang,
        "Bring it in on turns where the opponent is likely to Protect, switch, or respect a support move.",
        "Metelo en turnos donde el rival probablemente vaya a protegerse, cambiar o respetar una jugada de soporte."
      )
    );
  }
  if (profile.pivots.length > 0) {
    entryPoints.push(
      text(
        lang,
        "It likes entering on forced switches or on targets that cannot punish the pivot move.",
        "Le gusta entrar ante cambios forzados o sobre objetivos que no castigan bien el movimiento de pivot."
      )
    );
  }
  if (profile.isWallbreaker) {
    entryPoints.push(
      text(
        lang,
        "Try to bring it in after a slow pivot or after one of your support pieces has already forced a reaction.",
        "Intenta meterlo despues de un pivot lento o cuando una pieza de soporte ya haya forzado una reaccion."
      )
    );
  }
  if (profile.isBulky && entryPoints.length === 0) {
    entryPoints.push(
      text(
        lang,
        "It can enter on neutral hits and on the threats it is specifically meant to absorb.",
        "Puede entrar sobre golpes neutrales y sobre las amenazas que esta pensado para aguantar."
      )
    );
  }

  return entryPoints.slice(0, 3);
}

function buildMemberChecks(profile: MemberProfile, teamProfile: TeamProfile) {
  const { lang, archetype } = teamProfile;
  const checks: string[] = [];

  if (profile.isSlow && archetype !== "trickroom") checks.push(text(lang, "Faster revenge killers", "Revenge killers mas rapidos"));
  if (profile.moveIds.has(toID("Trick Room"))) {
    checks.push(text(lang, "Taunt and turn denial", "Mofa y negacion de turnos"));
    checks.push(text(lang, "Protect cycles that waste room turns", "Ciclos de Protect que gastan turnos de room"));
  }
  if (profile.isWallbreaker) checks.push(text(lang, "Chip damage plus status", "Chip damage mas estados"));
  if (profile.isCleaner) checks.push(text(lang, "Bulky priority users", "Usuarios de prioridad con bulk"));
  if (profile.removal.length > 0) checks.push(text(lang, "Pressure that forces removal too early", "Presion que te obliga a remover demasiado temprano"));
  if (checks.length === 0) checks.push(text(lang, "Repeated chip and forced trades", "Chip repetido e intercambios forzados"));

  return checks.slice(0, 3);
}

function buildMemberDecisionRules(profile: MemberProfile, teamProfile: TeamProfile) {
  const { lang } = teamProfile;
  const rules: string[] = [];

  if (profile.moveIds.has(toID("Trick Room"))) {
    rules.push(
      text(
        lang,
        "Only commit to Trick Room when the next one or two turns can be converted into real board progress.",
        "Comprometete con Trick Room solo cuando el siguiente turno o los dos siguientes se puedan convertir en progreso real de board."
      )
    );
  }
  if (profile.pivots.length > 0) {
    rules.push(
      text(
        lang,
        "If the pivot target is not threatening meaningful damage or utility, keep the initiative instead of gambling a read.",
        "Si el objetivo del pivot no amenaza dano o utilidad relevante, mantene la iniciativa en vez de jugar a leer por leer."
      )
    );
  }
  if (profile.isWinCondition) {
    rules.push(
      text(
        lang,
        "If this is your closer, your other turns should mainly be about removing the one or two pieces that stop it from snowballing.",
        "Si esta es tu win condition, tus otros turnos deberian enfocarse sobre todo en sacar del medio una o dos piezas que le impiden snowballear."
      )
    );
  }

  return rules.slice(0, 3);
}

function buildGuideMember(profile: MemberProfile, teamProfile: TeamProfile): TeamGuideMember {
  const notes = buildSynergyNotes(profile, teamProfile);
  return {
    name: profile.member.name,
    role: profile.strategicRole,
    primaryFunction: describeFunction(profile.functions[0] ?? "glue", teamProfile.lang),
    summary: buildMemberSummary(profile, teamProfile),
    keyMoves: pickRelevantMoves(profile),
    preserve: buildMemberPreserve(profile, teamProfile),
    avoid: buildMemberAvoid(profile, teamProfile),
    entryPoints: buildMemberEntryPoints(profile, teamProfile),
    decisionRules: buildMemberDecisionRules(profile, teamProfile),
    checks: buildMemberChecks(profile, teamProfile),
    teammates: notes,
    synergyTip: buildSynergyTip(profile, notes, teamProfile),
  };
}

function buildPhaseThreats(teamProfile: TeamProfile, phase: "early" | "mid" | "late") {
  const { lang, archetype } = teamProfile;
  const threats: string[] = [];

  if (phase === "early" && teamProfile.removalMembers.length === 0 && !teamProfile.isDoubles) {
    threats.push(text(lang, "Early hazard pressure", "Presion temprana de hazards"));
  }
  if (phase === "early" && teamProfile.speedControlMembers.length === 0) {
    threats.push(text(lang, "Immediate fast offense", "Ofensiva rapida inmediata"));
  }
  if (phase === "mid" && archetype === "trickroom") {
    threats.push(text(lang, "Protect and stalling lines", "Lineas de Protect y desgaste de turnos"));
  }
  if (phase === "mid" && teamProfile.breakerMembers.length === 0) {
    threats.push(text(lang, "Bulky defensive cores", "Cores defensivos con mucho bulk"));
  }
  if (phase === "late" && teamProfile.winConditionMembers.length === 0) {
    threats.push(text(lang, "Lack of a clean closer", "Falta de un cleaner realmente limpio"));
  }
  if (phase === "late" && !teamProfile.profiles.some((profile) => profile.priorityMoves.length > 0)) {
    threats.push(text(lang, "Priority from behind", "Prioridad rival cuando vas por delante"));
  }

  threats.push(...teamProfile.structuralWeaknesses.slice(0, Math.max(0, 3 - threats.length)));
  return threats.slice(0, 3);
}

function buildPhases(teamProfile: TeamProfile): TeamGuideData["phases"] {
  const { lang, archetype } = teamProfile;
  const earlyKey = getEarlyKey(teamProfile);
  const midKey = getMidKey(teamProfile);
  const lateKey = getLateKey(teamProfile);

  const earlyObjectives = [
    text(lang, "Identify the opposing remover, speed control piece, or main anti-lead tool.", "Identifica el remover rival, la pieza de speed control o la herramienta principal anti-lead."),
    text(lang, "Establish the first layer of field control without exposing your win condition too early.", "Establece la primera capa de control de campo sin exponer demasiado pronto tu win condition."),
    text(lang, "Map the trade you are willing to accept in order to keep tempo.", "Define que intercambio estas dispuesto a aceptar para mantener el tempo."),
  ];

  if (archetype === "trickroom") {
    earlyObjectives.unshift(text(lang, "Create a Trick Room turn only when the follow-up attacker can convert it immediately.", "Crea un turno de Trick Room solo cuando el atacante siguiente lo pueda convertir enseguida."));
  }
  if (archetype === "hazardstack") {
    earlyObjectives.unshift(text(lang, "Get hazards up before the opponent settles into safe pivot loops.", "Pon los hazards antes de que el rival se acomode en loops de pivot seguros."));
  }

  const early: GamePhase = {
    summary: text(
      lang,
      `The early game should be about claiming the first useful layer of control with ${earlyKey.member.name} and discovering what the opponent is willing to trade to stop your plan.`,
      `El early game deberia ir de reclamar la primera capa util de control con ${earlyKey.member.name} y descubrir que esta dispuesto a ceder el rival para frenar tu plan.`
    ),
    steps: [
      text(lang, "Lead in a way that reveals information while keeping your own resources flexible.", "Abre de forma que revele informacion mientras mantienes flexibles tus propios recursos."),
      text(lang, "If you have hazards or speed control, prioritize the version that creates the safest next turn, not just the flashiest immediate value.", "Si tienes hazards o speed control, prioriza la version que deja mas seguro el siguiente turno, no la que mas luce a corto plazo."),
      text(lang, `Use ${earlyKey.member.name} to shape the board, not to brute-force damage for its own sake.`, `Usa a ${earlyKey.member.name} para moldear el board, no para forzar dano porque si.`),
    ],
    keyPokemon: earlyKey.member.name,
    threats: buildPhaseThreats(teamProfile, "early"),
    objectives: earlyObjectives,
    preserve: [
      text(lang, "Keep at least one of your speed control or positioning tools healthy.", "Mantene sana al menos una herramienta de speed control o posicionamiento."),
      text(lang, "Do not burn your cleaner before the key opposing checks are known.", "No gastes tu cleaner antes de saber cuales son los checks importantes del rival."),
    ],
    avoid: [
      text(lang, "Avoid trading your field control piece for low-value chip.", "Evita cambiar tu pieza de control de campo por chip de poco valor."),
      text(lang, "Avoid revealing every pivot target in the first few turns.", "Evita revelar todos tus destinos de pivot en los primeros turnos."),
    ],
    decisionRules: [
      text(lang, "If your opening line only gains damage but loses tempo, it is usually not worth it.", "Si tu linea de apertura solo gana dano pero pierde tempo, normalmente no vale la pena."),
      text(lang, "If the opponent shows their answer to your main plan early, start tracking what needs to chip it down.", "Si el rival muestra temprano la respuesta a tu plan principal, empieza a contar que necesitas para desgastarla."),
    ],
  };

  const mid: GamePhase = {
    summary: text(
      lang,
      `The mid game is where ${midKey.member.name} and your support pieces should start converting positioning into real progress. This is the phase where you decide which defensive answer must be weakened or removed.`,
      `El mid game es donde ${midKey.member.name} y tus piezas de soporte tienen que empezar a convertir el posicionamiento en progreso real. Aqui decides que respuesta defensiva tiene que debilitarse o desaparecer.`
    ),
    steps: [
      text(lang, "Force the opponent into repeated uncomfortable switches or trades.", "Fuerza al rival a cambios o intercambios repetidos e incomodos."),
      text(lang, "Use pivoting, status, hazards, or speed control to keep your breaker attacking on your terms.", "Usa pivoteo, estados, hazards o speed control para que tu breaker siga atacando en tus terminos."),
      text(lang, "Once a key answer is chipped, start preserving the pieces you need for the endgame instead of overextending.", "Cuando un check clave ya este tocado, empieza a preservar las piezas del endgame en vez de sobreextenderte."),
    ],
    keyPokemon: midKey.member.name,
    threats: buildPhaseThreats(teamProfile, "mid"),
    objectives: [
      text(lang, "Turn your utility into tangible progress.", "Convierte tu utilidad en progreso tangible."),
      text(lang, "Identify the one opposing piece that actually blocks your win condition.", "Identifica la pieza rival que de verdad bloquea tu win condition."),
      text(lang, "Trade only if the exchange improves your late-game map.", "Intercambia solo si el cambio mejora tu mapa de late game."),
    ],
    preserve: [
      text(lang, "Preserve the specific answer you need for the opposing speed control or cleaner.", "Preserva la respuesta concreta que necesitas para el speed control o cleaner rival."),
      text(lang, "Keep one tempo piece alive so your closer does not have to raw-switch into damage later.", "Manten con vida una pieza de tempo para que tu cleaner no tenga que entrar en seco mas adelante."),
    ],
    avoid: [
      text(lang, "Avoid autopiloting into the same pivot loop if the opponent has started punishing it.", "Evita pilotear en automatico el mismo loop de pivot si el rival ya empezo a castigarlo."),
      text(lang, "Avoid cashing your win condition into a neutral trade before the endgame is actually ready.", "Evita cambiar tu win condition por un trade neutro antes de que el endgame este realmente preparado."),
    ],
    decisionRules: [
      text(lang, "If a turn can either gain chip or remove the only real answer to your closer, prefer the line that removes the answer.", "Si un turno puede ganar chip o sacar del medio la unica respuesta real a tu cleaner, prefiere la linea que quite esa respuesta."),
      text(lang, "If you are ahead on board but behind on resources, slow the game down and protect the key pieces.", "Si vas por delante en board pero por detras en recursos, baja el ritmo y protege las piezas clave."),
    ],
  };

  const late: GamePhase = {
    summary: text(
      lang,
      `${lateKey.member.name} should be the reference point of your late game. By this stage your goal is not to keep every option open; it is to convert the remaining resources into the cleanest possible closing sequence.`,
      `${lateKey.member.name} deberia ser el punto de referencia de tu late game. A esta altura ya no se trata de mantener todas las opciones abiertas; se trata de convertir los recursos que quedan en la secuencia de cierre mas limpia posible.`
    ),
    steps: [
      text(lang, "Count exactly which opposing pieces still stop your closer and play to remove or force them first.", "Cuenta exactamente que piezas rivales todavia frenan a tu cleaner y juega primero para quitarlas o forzarlas."),
      text(lang, "Use priority, speed control, or chip thresholds to make every remaining attack decisive.", "Usa prioridad, speed control o thresholds de chip para que cada ataque restante sea decisivo."),
      text(lang, "If you are ahead, take the line with the lowest variance rather than the prettiest knockout.", "Si vas por delante, toma la linea de menor varianza en vez del KO mas vistoso."),
    ],
    keyPokemon: lateKey.member.name,
    threats: buildPhaseThreats(teamProfile, "late"),
    objectives: [
      text(lang, "Close the game through your clearest win condition.", "Cerrar la partida a traves de tu win condition mas clara."),
      text(lang, "Protect the minimum number of resources needed to avoid a comeback.", "Proteger la cantidad minima de recursos necesaria para evitar una remontada."),
    ],
    preserve: [
      text(lang, "Preserve priority, speed control, or the one defensive stopgap that keeps the endgame stable.", "Preserva la prioridad, el speed control o la unica red defensiva que mantiene estable el endgame."),
    ],
    avoid: [
      text(lang, "Avoid unnecessary predictions if a safer line still keeps the closer on schedule.", "Evita predicciones innecesarias si una linea mas segura igual deja al cleaner a tiempo."),
      text(lang, "Avoid throwing away your backup answer to priority or opposing setup.", "Evita regalar tu respuesta de respaldo a prioridad o setup rival."),
    ],
    decisionRules: [
      text(lang, "If the board is already good enough for your closer, stop optimizing for extra chip and start optimizing for certainty.", "Si el board ya es suficientemente bueno para tu cleaner, deja de optimizar por chip extra y empieza a optimizar por certeza."),
      text(lang, "If you are behind, identify the one line that reopens the game and commit to it instead of splitting resources everywhere.", "Si vas por detras, identifica la unica linea que reabre la partida y comprometete con ella en lugar de repartir recursos por todos lados."),
    ],
  };

  return { early, mid, late };
}

function buildMatchups(teamProfile: TeamProfile): TeamGuideMatchup[] {
  const { lang } = teamProfile;
  const lead = getEarlyKey(teamProfile);
  const cleaner = getLateKey(teamProfile);
  const stallbreaker = teamProfile.breakerMembers[0] ?? cleaner;

  const matchupCards: TeamGuideMatchup[] = [
    {
      title: text(lang, "Versus fast offense", "Contra ofensiva rapida"),
      summary: text(lang, "Do not let the game become a raw damage race unless your own speed control is already secured.", "No dejes que la partida se convierta en una carrera de dano bruto salvo que tu propio speed control ya este asegurado."),
      keyPokemon: lead.member.name,
      tips: [
        text(lang, "Trade around your speed control and priority before exposing the cleaner.", "Intercambia alrededor de tu speed control y tu prioridad antes de exponer al cleaner."),
        text(lang, "Use bulky pivots or defensive anchors to absorb the first wave, then retaliate once the board is stable.", "Usa pivots bulky o anclas defensivas para aguantar la primera ola y contraataca cuando el board este estable."),
        text(lang, "If you cannot outspeed cleanly, aim to create chip thresholds instead of forcing risky reads.", "Si no puedes superar en velocidad de forma limpia, apunta a crear thresholds de chip en vez de forzar lecturas arriesgadas."),
      ],
    },
    {
      title: text(lang, "Versus balance and bulky offense", "Contra balance y bulky offense"),
      summary: text(lang, "This matchup is usually decided by which side converts positioning into real progress first.", "Este matchup suele decidirse por quien convierte antes el posicionamiento en progreso real."),
      keyPokemon: stallbreaker.member.name,
      tips: [
        text(lang, "Target the specific pivot or wall that blocks your closer instead of spreading chip evenly.", "Apunta al pivot o muro concreto que bloquea a tu cleaner en lugar de repartir chip de forma pareja."),
        text(lang, "Keep hazards, pivots, and status pressure aligned so every neutral turn still moves the game forward.", "Mantene alineados hazards, pivots y estados para que incluso los turnos neutros empujen la partida hacia adelante."),
        text(lang, "If the opponent has better raw stats, your edge usually comes from cleaner sequencing, not from brute force.", "Si el rival tiene mejores stats brutos, tu ventaja normalmente sale de secuenciar mejor, no de ir al frente sin pensar."),
      ],
    },
    {
      title: text(lang, "Versus defensive teams", "Contra equipos defensivos"),
      summary: text(lang, "Long games favor the player who understands exactly where progress comes from and who refuses low-value trades.", "Las partidas largas favorecen al jugador que entiende exactamente de donde sale el progreso y que se niega a aceptar trades de poco valor."),
      keyPokemon: stallbreaker.member.name,
      tips: [
        text(lang, "Route your game through the one or two pieces that can actually make progress rather than exposing everything at once.", "Encamina la partida por una o dos piezas que realmente generan progreso en vez de exponer todo a la vez."),
        text(lang, "Do not let your best progress maker get statused or chipped for free if it is your only clean path through the matchup.", "No permitas que tu mejor pieza de progreso se coma estado o chip gratis si es tu unico camino limpio en el matchup."),
        text(lang, "Use hazards, Knock Off, or repeated pivots to make every recovery turn cost something.", "Usa hazards, Knock Off o pivots repetidos para que cada turno de recuperacion le cueste algo al rival."),
      ],
    },
  ];

  matchupCards.push({
    title: teamProfile.archetype === "trickroom" ? text(lang, "Versus opposing speed control and Protect", "Contra speed control rival y Protect") : text(lang, "Versus setup and tempo swings", "Contra setup y cambios bruscos de tempo"),
    summary: teamProfile.archetype === "trickroom"
      ? text(lang, "Your room turns are finite. The matchup often comes down to whether you spend them on real damage or let the opponent waste them with defensive cycling.", "Tus turnos de room son finitos. El matchup muchas veces se decide por si los conviertes en dano real o si dejas que el rival los gaste con ciclos defensivos.")
      : text(lang, "Do not give setup teams free tempo. Make them prove they can take the hit before respecting every boost attempt.", "No regales tempo a equipos de setup. Obligalos a demostrar que pueden aguantar el golpe antes de respetar cada intento de boost."),
    keyPokemon: cleaner.member.name,
    tips: [
      text(lang, "Track opposing Protect, priority, and booster turns as carefully as your own resources.", "Cuenta los Protect, la prioridad y los turnos de boost rivales con el mismo cuidado que tus propios recursos."),
      text(lang, "If you have to spend a defensive piece to deny the opposing swing turn, it is often worth more than forcing medium damage elsewhere.", "Si tienes que gastar una pieza defensiva para negar el turno bisagra del rival, muchas veces vale mas que forzar dano medio en otro lado."),
      text(lang, "Reclaim tempo with your safest support or pivot tool before exposing the closer again.", "Recupera el tempo con tu herramienta de soporte o pivot mas segura antes de volver a exponer al cleaner."),
    ],
  });

  return matchupCards;
}

function buildGeneralTips(teamProfile: TeamProfile): string[] {
  const { lang } = teamProfile;
  const tips = [
    text(lang, "Identify the real win condition early. The rest of your turns should mostly be about enabling that piece, not about dealing random damage.", "Identifica pronto la win condition real. El resto de tus turnos deberia girar mas en habilitar esa pieza que en pegar dano al azar."),
    text(lang, "Keep track of which tool is unique on your side: removal, speed control, priority, or a specific defensive answer. Losing the unique tool usually matters more than losing generic HP.", "Lleva la cuenta de que herramienta es unica de tu lado: removal, speed control, prioridad o una respuesta defensiva concreta. Perder la herramienta unica suele importar mas que perder HP genericos."),
    text(lang, "When in doubt, choose the line that preserves initiative and resource clarity over the line that only chases chip.", "Cuando dudes, elige la linea que preserve la iniciativa y la claridad de recursos por encima de la que solo persigue chip."),
  ];

  if (teamProfile.hazardMembers.length > 0) {
    tips.push(text(lang, "If you invested in hazards, make the opponent prove they can remove them safely before you start playing as if they are gone.", "Si invertiste en hazards, obliga al rival a demostrar que puede removerlos de forma segura antes de jugar como si ya no existieran."));
  }
  if (teamProfile.weatherSetter) {
    tips.push(text(lang, "Weather turns are a resource. Refresh weather only when the next attacker can actually exploit the reset.", "Los turnos de clima son un recurso. Refresca el clima solo cuando el siguiente atacante realmente pueda explotar ese reset."));
  }
  if (teamProfile.archetype === "trickroom") {
    tips.push(text(lang, "Trick Room teams win by compressing progress into short windows, not by trying to play every turn under room.", "Los equipos de Trick Room ganan comprimiendo progreso en ventanas cortas, no intentando jugar todos los turnos bajo room."));
  }

  return tips.slice(0, 5);
}

function toPokemonAnalysis(member: GeneratedTeamMember, guideMember: TeamGuideMember): PokemonAnalysis {
  return {
    role: guideMember.role,
    howToPlay: guideMember.summary,
    evs: member.evs,
    nature: member.nature,
    checks: guideMember.checks,
    teammates: guideMember.teammates,
    synergyTip: guideMember.synergyTip,
    primaryFunction: guideMember.primaryFunction,
    summary: guideMember.summary,
    keyMoves: guideMember.keyMoves,
    preserve: guideMember.preserve,
    avoid: guideMember.avoid,
    entryPoints: guideMember.entryPoints,
    decisionRules: guideMember.decisionRules,
  };
}

export function generateTeamGuide(
  team: GeneratedTeamMember[],
  options: { format: string; templateId?: TemplateId | string; lang: GuideLang }
): TeamGuideData {
  const templateId = options.templateId ?? "balanced";
  const teamProfile = buildTeamProfile(team, options.format, templateId, options.lang);

  return {
    archetype: teamProfile.archetype,
    subarchetype: teamProfile.subarchetype,
    overview: buildOverview(teamProfile),
    members: teamProfile.profiles.map((profile) => buildGuideMember(profile, teamProfile)),
    phases: buildPhases(teamProfile),
    matchups: buildMatchups(teamProfile),
    generalTips: buildGeneralTips(teamProfile),
    recommendedModes: teamProfile.recommendedModes,
  };
}

export function attachMemberAnalyses(team: GeneratedTeamMember[], teamGuide: TeamGuideData) {
  const guideMap = new Map(teamGuide.members.map((member) => [member.name, member]));
  return team.map((member) => {
    const guideMember = guideMap.get(member.name);
    if (!guideMember) return member;
    return { ...member, analysis: toPokemonAnalysis(member, guideMember) };
  });
}
