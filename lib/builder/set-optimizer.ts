import { FORMATS, FormatId } from "@/config/formats";
import { Template } from "@/config/templates";
import abilitiesData from "../../data/abilities.json";
import itemsData from "../../data/items.json";
import movesData from "../../data/moves.json";
import setsData from "../../data/gen9-sets.json";
import { getSmogonTierKey } from "@/lib/format-rules";
import { pokemonCanLearnMove } from "@/lib/pokemon-learnsets";
import { getLearnableMovesWithDetails, getRandomMovesWithDetails } from "@/lib/showdown-data";
import { PokemonSpecies } from "../data-sources/dex";
import { NormalizedMonData, NormalizedSmogonData } from "../data-sources/smogon";
import { toID } from "../utils";
import { getCompetitiveFormatProfile } from "../competitive-format-profile";
import {
  DOUBLES_SUPPORT_MOVES,
  getCandidateStatProfile,
  getTemplateId,
  HAZARD_MOVES,
  LEAD_PRESSURE_MOVES,
  PIVOT_MOVES,
  RAIN_PAYOFF_MOVES,
  RECOVERY_MOVES,
  REMOVAL_MOVES,
  SAND_PAYOFF_MOVES,
  SETUP_MOVES,
  STALL_PAYOFF_MOVES,
  STACKING_HAZARD_MOVES,
  SUN_PAYOFF_MOVES,
  WEATHER_FLEX_MOVES,
} from "./template-heuristics";

const Items = itemsData as Record<string, { name: string }>;
const Abilities = abilitiesData as Record<string, { name: string }>;
const Moves = movesData as Record<
  string,
  {
    name: string;
    category: string;
    type?: string;
    basePower?: number;
    accuracy?: number | true;
    priority?: number;
    target?: string;
    flags?: Record<string, unknown>;
  }
>;
type CompetitiveSetData = {
  ability?: string | string[];
  item?: string | string[];
  nature?: string | string[];
  evs?: Record<string, number> | Array<Record<string, number>>;
  moves?: unknown[];
  teratypes?: string | string[];
};
const CompetitiveSets = setsData as unknown as Record<
  string,
  Record<string, Record<string, CompetitiveSetData>>
>;

const CHOICE_ITEMS = new Set(["Choice Band", "Choice Specs", "Choice Scarf"]);
const STATUS_WHITELIST = new Set([
  "Trick",
  "Switcheroo",
  "Sleep Talk",
  "Healing Wish",
  "Memento",
  "Parting Shot",
]);
const FALLBACK_DISALLOWED_MOVE_IDS = new Set([
  "gigaimpact",
  "hyperbeam",
  "frenzyplant",
  "blastburn",
  "hydrocannon",
  "rockwrecker",
  "roaroftime",
  "prismaticlaser",
  "eternabeam",
  "meteorassault",
  "confide",
  "celebrate",
  "holdhands",
  "happyhour",
  "bestow",
  "teatime",
  "afteryou",
  "focuspunch",
  "splash",
]);
const PROTECT_LIKE_MOVE_IDS = new Set(
  [
    "Protect",
    "Detect",
    "Spiky Shield",
    "King's Shield",
    "Baneful Bunker",
    "Burning Bulwark",
    "Obstruct",
    "Silk Trap",
  ].map(toID)
);
const DOUBLES_UTILITY_MOVE_IDS = new Set(
  [
    ...DOUBLES_SUPPORT_MOVES,
    "Tailwind",
    "Trick Room",
    "Electroweb",
    "Thunder Wave",
    "Spore",
    "Encore",
    "Coaching",
  ].map(toID)
);
const DOUBLES_PREMIUM_SUPPORT_MOVE_IDS = new Set(
  [
    "Protect",
    "Detect",
    "Spiky Shield",
    "King's Shield",
    "Baneful Bunker",
    "Burning Bulwark",
    "Obstruct",
    "Silk Trap",
    "Fake Out",
    "Tailwind",
    "Trick Room",
    "Icy Wind",
    "Electroweb",
    "Follow Me",
    "Rage Powder",
    "Helping Hand",
    "Parting Shot",
    "Wide Guard",
    "Quick Guard",
    "Taunt",
    "Encore",
    "Spore",
  ].map(toID)
);
const DOUBLES_REDIRECTION_MOVE_IDS = new Set(["Follow Me", "Rage Powder"].map(toID));
const DOUBLES_SPEED_CONTROL_MOVE_IDS = new Set(
  ["Tailwind", "Trick Room", "Icy Wind", "Electroweb", "Thunder Wave"].map(toID)
);
const DOUBLES_BOARD_CONTROL_MOVE_IDS = new Set(
  [
    "Fake Out",
    "Helping Hand",
    "Wide Guard",
    "Quick Guard",
    "Taunt",
    "Encore",
    "Spore",
    "Rage Powder",
    "Follow Me",
    "Parting Shot",
  ].map(toID)
);
const DOUBLES_CONDITIONAL_LOW_VALUE_MOVE_IDS = new Set(
  [
    "Steel Roller",
    "Misty Explosion",
    "Meteor Beam",
    "Solar Beam",
    "Solar Blade",
    "Fly",
    "Bounce",
    "Dig",
    "Dive",
    "Phantom Force",
    "Shadow Force",
    "Skull Bash",
  ].map(toID)
);
const DOUBLES_FLEXIBLE_STATUS_MOVE_IDS = new Set(
  [
    "Will-O-Wisp",
    "Substitute",
    "Rain Dance",
    "Sunny Day",
    "Snowscape",
    "Nasty Plot",
    "Calm Mind",
    "Recover",
    "Roost",
    "Synthesis",
    "Morning Sun",
    "Wish",
    "Nuzzle",
  ].map(toID)
);
const PHYSICAL_SETUP_MOVE_IDS = new Set(
  [
    "Swords Dance",
    "Dragon Dance",
    "Bulk Up",
    "Howl",
    "Coil",
    "Trailblaze",
    "Curse",
    "Shell Smash",
    "Shift Gear",
    "Agility",
  ].map(toID)
);
const SPECIAL_SETUP_MOVE_IDS = new Set(
  ["Nasty Plot", "Calm Mind", "Quiver Dance", "Tail Glow"].map(toID)
);
const FALLBACK_UTILITY_MOVE_IDS = new Set(
  [
    ...PIVOT_MOVES,
    ...RECOVERY_MOVES,
    ...SETUP_MOVES,
    ...HAZARD_MOVES,
    ...REMOVAL_MOVES,
    ...STALL_PAYOFF_MOVES,
    ...DOUBLES_SUPPORT_MOVES,
    ...Array.from(PROTECT_LIKE_MOVE_IDS),
    "Knock Off",
    "Taunt",
    "Encore",
  ].map(toID)
);
const FALLBACK_PRIORITY_MOVE_IDS = new Set(
  [
    "Ice Shard",
    "Aqua Jet",
    "Bullet Punch",
    "Mach Punch",
    "Sucker Punch",
    "Shadow Sneak",
    "Extreme Speed",
    "Quick Attack",
    "First Impression",
    "Vacuum Wave",
  ].map(toID)
);
const FALLBACK_SLEEP_ENABLER_IDS = new Set(
  ["Spore", "Sleep Powder", "Hypnosis", "Sing", "Lovely Kiss", "Yawn", "Dark Void"].map(toID)
);
const ABILITY_PIVOT_MOVE_IDS = new Set([...PIVOT_MOVES, "Parting Shot", "U-turn"].map(toID));
const SHARPNESS_MOVE_IDS = new Set(
  [
    "Air Cutter",
    "Air Slash",
    "Aerial Ace",
    "Aqua Cutter",
    "Bitter Blade",
    "Ceaseless Edge",
    "Cross Poison",
    "Cut",
    "Fury Cutter",
    "Leaf Blade",
    "Night Slash",
    "Psycho Cut",
    "Razor Shell",
    "Sacred Sword",
    "Secret Sword",
    "Slash",
    "Solar Blade",
    "Stone Axe",
    "X-Scissor",
  ].map(toID)
);

export interface OptimizedSet {
  species: string;
  ability: string;
  item: string;
  nature: string;
  evs: {
    hp: number;
    atk: number;
    def: number;
    spa: number;
    spd: number;
    spe: number;
  };
  moves: string[];
  teraType?: string;
}

export interface SetBundle extends OptimizedSet {
  score: number;
  coherenceScore: number;
  source: {
    provider: "competitive-sets" | "smogon-chaos" | "fallback";
    format: string;
    setName?: string;
  };
  issues: string[];
}

interface OptimizerOptions {
  template?: Template;
  teamMoves?: Set<string>;
  teamMoveCounts?: Map<string, number>;
  teamAbilities?: Set<string>;
  teamItems?: Set<string>;
  format?: string;
}

interface ScoredMoveCandidate {
  move: {
    name: string;
    category: string;
    type?: string;
    basePower?: number;
    accuracy?: number | true;
    priority?: number;
    target?: string;
    flags?: Record<string, unknown>;
  };
  moveId: string;
  score: number;
  usage: number;
}

type FallbackMoveOptions = Pick<
  OptimizerOptions,
  "format" | "template" | "teamMoves" | "teamMoveCounts" | "teamItems"
> & {
  ability?: string;
  item?: string;
};

export class SetOptimizer {
  private data: NormalizedSmogonData;
  private cache: Map<string, SetBundle> = new Map();

  constructor(data: NormalizedSmogonData) {
    this.data = data;
  }

  public clearCache() {
    this.cache.clear();
  }

  public optimize(
    pokemon: PokemonSpecies,
    teamContext: PokemonSpecies[] = [],
    options: OptimizerOptions = {}
  ): OptimizedSet {
    return this.optimizeBundle(pokemon, teamContext, options);
  }

  public optimizeBundle(
    pokemon: PokemonSpecies,
    teamContext: PokemonSpecies[] = [],
    options: OptimizerOptions = {}
  ): SetBundle {
    const stats = this.data.pokemon[toID(pokemon.name)];
    const cacheKey = this.getCacheKey(pokemon, teamContext, options);
    const cached = this.cache.get(cacheKey);
    if (cached) {
      return cached;
    }

    const competitiveBundles = this.buildCompetitiveBundles(pokemon, options);
    if (!stats || !this.hasUsableMeta(stats)) {
      const bestBundle =
        competitiveBundles.sort((a, b) => b.score - a.score)[0] ??
        this.generateBlankSet(pokemon, options.format);

      this.cache.set(cacheKey, bestBundle);
      return bestBundle;
    }

    const bundles = [
      ...competitiveBundles,
      ...this.buildChaosBundles(stats, pokemon, options),
    ];

    const bestBundle =
      bundles.sort((a, b) => b.score - a.score)[0] ??
      this.generateBlankSet(pokemon, options.format);

    this.cache.set(cacheKey, bestBundle);
    return bestBundle;
  }

  private getCacheKey(
    pokemon: PokemonSpecies,
    teamContext: PokemonSpecies[],
    options: OptimizerOptions
  ) {
    const templateKey = options.template?.label || "none";
    const formatKey = options.format || "unknown";
    const movesKey = Array.from(options.teamMoves || []).sort().join(",");
    const protectCount = options.teamMoveCounts?.get(toID("Protect")) ?? 0;
    const abilitiesKey = Array.from(options.teamAbilities || []).sort().join(",");
    const itemsKey = Array.from(options.teamItems || []).sort().join(",");
    const teamKey = teamContext.map((member) => toID(member.name)).sort().join(",");
    return [
      toID(pokemon.name),
      templateKey,
      formatKey,
      teamKey,
      movesKey,
      abilitiesKey,
      itemsKey,
      String(protectCount),
    ].join("|");
  }

  private buildCompetitiveBundles(
    pokemon: PokemonSpecies,
    options: OptimizerOptions
  ): SetBundle[] {
    if (!(options.format || "").startsWith("gen9")) {
      return [];
    }

    const pokemonSets = CompetitiveSets[pokemon.name];
    if (!pokemonSets) {
      return [];
    }

    const formatKey = getSmogonTierKey((options.format || "gen9ou") as FormatId);
    const tiersToTry = Array.from(
      new Set([
        formatKey,
        FORMATS[options.format as FormatId]?.gameType === "doubles"
          ? "doublesou"
          : "ou",
        "uu",
        "vgc2025",
      ])
    ).filter(Boolean);

    const bundles: SetBundle[] = [];
    for (const tier of tiersToTry) {
      const tierSets = pokemonSets[tier];
      if (!tierSets) continue;

      for (const [setName, rawSet] of Object.entries(tierSets)) {
        const bundle: SetBundle = {
          species: pokemon.name,
          ability: this.pickFirstOption(rawSet.ability) ?? Object.values(pokemon.abilities)[0] ?? "No Ability",
          item: this.pickFirstOption(rawSet.item) ?? "Leftovers",
          nature: this.pickFirstOption(rawSet.nature) ?? "Serious",
          evs: this.normalizeEvs(this.pickFirstOption(rawSet.evs) ?? {}),
          moves: this.normalizeCompetitiveMoves(rawSet.moves),
          teraType: this.pickFirstOption(rawSet.teratypes),
          source: {
            provider: "competitive-sets",
            format: tier,
            setName,
          },
          score: 0,
          coherenceScore: 0,
          issues: [],
        };

        const scoredBundle = this.scoreBundle(bundle, pokemon, options);
        bundles.push(scoredBundle);
      }

      if (bundles.length > 0) {
        return bundles;
      }
    }

    return [];
  }

  private buildChaosBundles(
    stats: NormalizedMonData,
    pokemon: PokemonSpecies,
    options: OptimizerOptions
  ): SetBundle[] {
    const itemCandidates = this.getTopCandidates(stats.items, 3);
    const abilityCandidates = this.getAbilityCandidates(stats, pokemon, options, 3);
    const bundles: SetBundle[] = [];

    for (const itemId of itemCandidates) {
      const item = Items[itemId]?.name || itemId;
      for (const ability of abilityCandidates) {
        const spread = this.selectSpread(stats, pokemon, options);
        const preliminaryBundle: SetBundle = {
          species: pokemon.name,
          ability,
          item,
          nature: spread.nature,
          evs: spread.evs,
          teraType: this.selectTeraType(stats),
          moves: [],
          score: 0,
          coherenceScore: 0,
          source: {
            provider: "smogon-chaos",
            format: this.data.meta.sourceInfo.resolvedFormat,
          },
          issues: [],
        };

        preliminaryBundle.moves = this.selectMoves(stats, pokemon, 4, preliminaryBundle, options);
        bundles.push(this.scoreBundle(preliminaryBundle, pokemon, options));
      }
    }

    if (bundles.length === 0) {
      bundles.push(this.generateBlankSet(pokemon, options.format));
    }

    return bundles;
  }

  private scoreBundle(
    bundle: SetBundle,
    pokemon: PokemonSpecies,
    options: OptimizerOptions
  ): SetBundle {
    const stats = this.data.pokemon[toID(pokemon.name)];
    const bundleWithMoves =
      bundle.moves.length > 0
        ? bundle
        : { ...bundle, moves: this.selectMoves(stats, pokemon, 4, bundle, options) };
    const { coherenceScore, issues } = this.evaluateBundleCoherence(
      bundleWithMoves,
      pokemon,
      options
    );
    const templateBonus = bundleWithMoves.moves.reduce((sum, move) => {
      return sum + this.getTemplateMoveBonus(toID(move), pokemon, options);
    }, 0);
    const abilityUsage = stats?.abilities[toID(bundleWithMoves.ability)] ?? 0.1;
    const itemUsage = stats?.items[toID(bundleWithMoves.item)] ?? 0.1;
    const moveUsage =
      bundleWithMoves.moves.reduce(
        (sum, move) => sum + (stats?.moves[toID(move)] ?? 0.05),
        0
      ) / Math.max(bundleWithMoves.moves.length, 1);
    const teraUsage = bundleWithMoves.teraType
      ? stats?.teraTypes[toID(bundleWithMoves.teraType)] ?? 0.05
      : 0;
    const spreadUsage = this.findSpreadUsage(stats, bundleWithMoves);
    const abilityContextScore = this.getAbilityContextScore(bundleWithMoves);

    const sourceBase =
      bundleWithMoves.source.provider === "competitive-sets"
        ? 0.9
        : bundleWithMoves.source.provider === "smogon-chaos"
          ? 0.6
          : 0.2;

    const score =
      sourceBase +
      abilityUsage * 0.45 +
      itemUsage * 0.4 +
      moveUsage * 1.4 +
      spreadUsage * 0.35 +
      teraUsage * 0.2 +
      abilityContextScore * 0.35 +
      templateBonus * 0.2 +
      coherenceScore * 1.8;

    return {
      ...bundleWithMoves,
      score,
      coherenceScore,
      issues,
    };
  }

  private evaluateBundleCoherence(
    bundle: SetBundle,
    pokemon: PokemonSpecies,
    options: OptimizerOptions
  ) {
    let coherenceScore = 1;
    const issues: string[] = [];
    const isDoubles = FORMATS[options.format as FormatId]?.gameType === "doubles";
    const formatProfile = getCompetitiveFormatProfile(
      options.format || this.data.meta.format || "gen9ou"
    );
    const moveEntries = bundle.moves
      .map((moveName) => {
        const move = Moves[toID(moveName)];
        return move ? { ...move, id: toID(moveName) } : null;
      })
      .filter(Boolean) as Array<{ id: string; name: string; category: string; type?: string }>;
    const physicalMoves = moveEntries.filter((move) => move.category === "Physical");
    const specialMoves = moveEntries.filter((move) => move.category === "Special");
    const statusMoves = moveEntries.filter((move) => move.category === "Status");
    const attackMoves = moveEntries.filter((move) => move.category !== "Status");
    const hasStab = attackMoves.some((move) =>
      move.type ? pokemon.types.includes(move.type) : false
    );
    const isChoiceItem = CHOICE_ITEMS.has(bundle.item);
    const isAssaultVest = bundle.item === "Assault Vest";
    const hasHeavyDutyBoots = bundle.item === "Heavy-Duty Boots";
    const hazardCount = bundle.moves.filter((move) =>
      HAZARD_MOVES.some((hazardMove) => toID(hazardMove) === toID(move))
    ).length;
    const supportMoves = bundle.moves.filter((move) =>
      DOUBLES_UTILITY_MOVE_IDS.has(toID(move))
    );
    const hasProtectLikeMove = bundle.moves.some((move) =>
      PROTECT_LIKE_MOVE_IDS.has(toID(move))
    );
    const protectUsers = this.getCurrentProtectLikeMoveCount(options);
    const protectSoftCap = this.getDoublesProtectSoftCap(options);
    const hasDuplicateItem =
      formatProfile.enforceItemClause &&
      options.teamItems?.has(bundle.item);
    const setupCount = bundle.moves.filter((move) =>
      SETUP_MOVES.some((setupMove) => toID(setupMove) === toID(move))
    ).length;
    const physicalSetupCount = bundle.moves.filter((move) =>
      PHYSICAL_SETUP_MOVE_IDS.has(toID(move))
    ).length;
    const specialSetupCount = bundle.moves.filter((move) =>
      SPECIAL_SETUP_MOVE_IDS.has(toID(move))
    ).length;

    if (isAssaultVest && statusMoves.length > 0) {
      coherenceScore -= 0.9;
      issues.push("assault-vest-status-conflict");
    }

    if (isChoiceItem) {
      const invalidStatus = statusMoves.filter(
        (move) => !STATUS_WHITELIST.has(move.name)
      );
      if (invalidStatus.length > 0) {
        coherenceScore -= 0.6;
        issues.push("choice-status-conflict");
      }
    }

    if (bundle.item === "Choice Band" && physicalMoves.length === 0) {
      coherenceScore -= 0.75;
      issues.push("choice-band-no-physical");
    }

    if (bundle.item === "Choice Specs" && specialMoves.length === 0) {
      coherenceScore -= 0.75;
      issues.push("choice-specs-no-special");
    }

    if (isDoubles && hasHeavyDutyBoots) {
      coherenceScore -= 0.35;
      issues.push("boots-low-value-in-doubles");
    }

    if (
      formatProfile.forbiddenAbilityIds.includes(toID(bundle.ability))
    ) {
      coherenceScore -= 1.5;
      issues.push("banned-ability-in-format");
    }

    if (hasDuplicateItem) {
      coherenceScore -= 1.5;
      issues.push("duplicate-item-clause");
    }

    if (isDoubles && hazardCount > 0) {
      coherenceScore -= formatProfile.allowHazards ? 0.3 * hazardCount : 0.8 * hazardCount;
      issues.push("hazard-set-in-doubles");
    }

    const lowValueDoublesMoves = bundle.moves.filter((move) =>
      DOUBLES_CONDITIONAL_LOW_VALUE_MOVE_IDS.has(toID(move))
    );
    if (isDoubles && lowValueDoublesMoves.length > 0) {
      coherenceScore -= 0.22 * lowValueDoublesMoves.length;
      issues.push("conditional-low-value-doubles-move");
    }

    if (attackMoves.length === 0 && supportMoves.length < 2) {
      coherenceScore -= 0.75;
      issues.push("no-real-progression");
    }

    if (attackMoves.length < 2 && supportMoves.length < 2) {
      coherenceScore -= isDoubles ? 0.45 : 0.2;
      issues.push("too-few-attacks");
    }

    if (attackMoves.length > 0 && !hasStab) {
      coherenceScore -= 0.15;
      issues.push("no-stab-attack");
    }

    if (
      attackMoves.length === 1 &&
      !hasStab &&
      supportMoves.length === 0
    ) {
      coherenceScore -= 0.2;
      issues.push("single-offtype-attack");
    }

    if (physicalSetupCount > 0 && physicalMoves.length === 0) {
      coherenceScore -= 0.35;
      issues.push("physical-setup-no-physical-attack");
    }

    if (specialSetupCount > 0 && specialMoves.length === 0) {
      coherenceScore -= 0.35;
      issues.push("special-setup-no-special-attack");
    }

    if (
      physicalSetupCount > 0 &&
      specialSetupCount > 0 &&
      (physicalMoves.length === 0 || specialMoves.length === 0)
    ) {
      coherenceScore -= 0.25;
      issues.push("mixed-setup-conflict");
    }

    if (setupCount > 1 && attackMoves.length < 3) {
      coherenceScore -= 0.18 * (setupCount - 1);
      issues.push("redundant-setup-stack");
    }

    if (isDoubles && statusMoves.length >= 3 && supportMoves.length < 2) {
      coherenceScore -= 0.3;
      issues.push("status-heavy-doubles-set");
    }

    if (
      isDoubles &&
      protectUsers >= protectSoftCap &&
      hasProtectLikeMove
    ) {
      coherenceScore -= 0.35;
      issues.push("protect-over-cap");
    }

    if (
      isDoubles &&
      !isChoiceItem &&
      !isAssaultVest &&
      attackMoves.length >= 2 &&
      (statusMoves.length > 0 || supportMoves.length > 0 || setupCount > 0) &&
      !hasProtectLikeMove
    ) {
      coherenceScore -= 0.05;
      issues.push("doubles-no-protect");
    }

    if (options.template && getTemplateId(options.template) === "trickroom") {
      const knowsTrickRoom = bundle.moves.some(
        (move) => toID(move) === toID("Trick Room")
      );
      const isSlowBreaker =
        pokemon.baseStats.spe <= 70 &&
        Math.max(pokemon.baseStats.atk, pokemon.baseStats.spa) >= 100;
      if (!knowsTrickRoom && !isSlowBreaker) {
        coherenceScore -= 0.2;
        issues.push("trick-room-template-mismatch");
      }
    }

    return {
      coherenceScore: Math.max(0, Math.min(1, coherenceScore)),
      issues,
    };
  }

  private getAbilityCandidates(
    stats: NormalizedMonData,
    pokemon: PokemonSpecies,
    options: OptimizerOptions,
    limit = 3
  ): string[] {
    const formatProfile = getCompetitiveFormatProfile(
      options.format || this.data.meta.format || "gen9ou"
    );
    const requiredAbilities = new Set(options.template?.requiredAbilities?.map(toID) ?? []);
    const preferredAbilities = new Set(options.template?.preferredAbilities?.map(toID) ?? []);
    const slotPriority = new Map<string, number>();
    Object.values(pokemon.abilities).forEach((abilityName, index) => {
      slotPriority.set(toID(abilityName), index);
    });
    const abilityIds = new Set<string>([
      ...Object.keys(stats.abilities),
      ...Object.values(pokemon.abilities).map(toID),
    ]);

    const abilityEntries = Array.from(abilityIds)
      .map((abilityId) => {
        const usage = stats.abilities[abilityId] ?? 0.01;
        let score = usage * 100;
        if (formatProfile.forbiddenAbilityIds.includes(abilityId)) {
          score -= 1000;
        }
        if (requiredAbilities.has(abilityId) && !options.teamAbilities?.has(abilityId)) {
          score += 40;
        }
        if (preferredAbilities.has(abilityId)) {
          score += 12;
        }
        score -= (slotPriority.get(abilityId) ?? 2) * 0.05;
        return [abilityId, score] as [string, number];
      })
      .sort((a, b) => b[1] - a[1]);

    return abilityEntries
      .slice(0, limit)
      .map(([abilityId]) => Abilities[abilityId]?.name || abilityId);
  }

  private selectAbility(
    stats: NormalizedMonData,
    pokemon: PokemonSpecies,
    options: OptimizerOptions
  ): string {
    return (
      this.getAbilityCandidates(stats, pokemon, options, 1)[0] ??
      Object.values(pokemon.abilities)[0] ??
      "No Ability"
    );
  }

  private getAbilityContextScore(bundle: SetBundle) {
    const abilityId = toID(bundle.ability);
    if (!abilityId) {
      return 0;
    }

    const moveIds = new Set(bundle.moves.map(toID));
    const moveEntries = bundle.moves
      .map((moveName) => Moves[toID(moveName)])
      .filter(Boolean) as Array<{ category: string; basePower?: number }>;
    const physicalAttacks = moveEntries.filter((move) => move.category === "Physical").length;
    const statusMoves = moveEntries.filter((move) => move.category === "Status").length;
    const hasProtectLikeMove = Array.from(moveIds).some((moveId) =>
      PROTECT_LIKE_MOVE_IDS.has(moveId)
    );
    const hasPivotMove = Array.from(moveIds).some((moveId) =>
      ABILITY_PIVOT_MOVE_IDS.has(moveId)
    );
    const hasBoardControl = Array.from(moveIds).some((moveId) =>
      DOUBLES_BOARD_CONTROL_MOVE_IDS.has(moveId)
    );
    const hasSpeedControl = Array.from(moveIds).some((moveId) =>
      DOUBLES_SPEED_CONTROL_MOVE_IDS.has(moveId)
    );
    const hasRedirection = Array.from(moveIds).some((moveId) =>
      DOUBLES_REDIRECTION_MOVE_IDS.has(moveId)
    );
    const hasLowBasePowerAttack = moveEntries.some(
      (move) =>
        move.category !== "Status" &&
        typeof move.basePower === "number" &&
        move.basePower > 0 &&
        move.basePower <= 60
    );

    let score = 0;

    switch (abilityId) {
      case "prankster":
        if (statusMoves > 0) score += 0.35;
        if (hasSpeedControl || hasBoardControl) score += 0.45;
        if (statusMoves === 0) score -= 0.35;
        break;
      case "intimidate":
        if (hasBoardControl || hasPivotMove) score += 0.5;
        if (statusMoves === 0 && physicalAttacks >= 3) score -= 0.15;
        break;
      case "regenerator":
        if (hasPivotMove || hasProtectLikeMove || hasRedirection) score += 0.45;
        break;
      case "guts":
        if (bundle.item === "Flame Orb") score += 0.7;
        if (moveIds.has(toID("Facade"))) score += 0.35;
        if (bundle.item !== "Flame Orb") score -= 0.35;
        break;
      case "poisonheal":
        if (bundle.item === "Toxic Orb") score += 0.75;
        if (hasProtectLikeMove || moveIds.has(toID("Substitute"))) score += 0.2;
        if (bundle.item !== "Toxic Orb") score -= 0.3;
        break;
      case "technician":
        if (hasLowBasePowerAttack) score += 0.45;
        break;
      case "sharpness":
        if (Array.from(moveIds).some((moveId) => SHARPNESS_MOVE_IDS.has(moveId))) {
          score += 0.55;
        }
        break;
      case "sniper":
        if (bundle.item === "Scope Lens" || moveIds.has(toID("Focus Energy"))) {
          score += 0.6;
        }
        break;
      case "protosynthesis":
      case "quarkdrive":
        if (bundle.item === "Booster Energy") {
          score += 0.35;
        }
        break;
      default:
        break;
    }

    return score;
  }

  private getAbilityMoveSynergyScore(
    abilityId: string,
    move: { category: string; basePower?: number },
    moveId: string,
    options: FallbackMoveOptions
  ) {
    if (!abilityId) {
      return 0;
    }

    const isStatus = move.category === "Status";
    const basePower = typeof move.basePower === "number" ? move.basePower : 0;

    switch (abilityId) {
      case "prankster":
        if (isStatus) return 4;
        if (DOUBLES_SPEED_CONTROL_MOVE_IDS.has(moveId) || DOUBLES_BOARD_CONTROL_MOVE_IDS.has(moveId)) {
          return 3;
        }
        return 0;
      case "intimidate":
        if (
          ["fakeout", "partingshot", "knockoff", "snarl", "taunt", "willowisp"].includes(moveId)
        ) {
          return 3;
        }
        return 0;
      case "regenerator":
        if (ABILITY_PIVOT_MOVE_IDS.has(moveId)) return 4;
        if (PROTECT_LIKE_MOVE_IDS.has(moveId) || DOUBLES_REDIRECTION_MOVE_IDS.has(moveId)) return 2;
        return 0;
      case "guts":
        if (moveId === "facade") return options.item === "Flame Orb" ? 10 : 4;
        if (options.item === "Flame Orb" && move.category === "Physical") return 2;
        return 0;
      case "poisonheal":
        if (options.item === "Toxic Orb" && (PROTECT_LIKE_MOVE_IDS.has(moveId) || moveId === "substitute")) {
          return 5;
        }
        return 0;
      case "technician":
        return !isStatus && basePower > 0 && basePower <= 60 ? 5 : 0;
      case "sharpness":
        return SHARPNESS_MOVE_IDS.has(moveId) ? 6 : 0;
      case "drizzle":
        return ["raindance", ...RAIN_PAYOFF_MOVES.map(toID)].includes(moveId) ? 5 : 0;
      case "drought":
        return ["sunnyday", ...SUN_PAYOFF_MOVES.map(toID)].includes(moveId) ? 5 : 0;
      case "sandstream":
        return ["sandstorm", ...SAND_PAYOFF_MOVES.map(toID)].includes(moveId) ? 4 : 0;
      case "snowwarning":
        return ["snowscape", "blizzard", "auroraveil"].includes(moveId) ? 5 : 0;
      case "protosynthesis":
        if (moveId === "sunnyday") return 3;
        return options.item === "Booster Energy" && !isStatus ? 2 : 0;
      case "quarkdrive":
        return options.item === "Booster Energy" && !isStatus ? 2 : 0;
      default:
        return 0;
    }
  }

  private getCurrentProtectLikeMoveCount(options: OptimizerOptions) {
    let count = 0;
    for (const moveId of PROTECT_LIKE_MOVE_IDS) {
      count += options.teamMoveCounts?.get(moveId) ?? 0;
    }
    return count;
  }

  private selectBestProtectLikeMove(
    pokemon: PokemonSpecies,
    currentSet: OptimizedSet,
    options: OptimizerOptions
  ) {
    const stats = this.data.pokemon[toID(pokemon.name)];
    return this.getDoublesMoveCandidates(stats, pokemon, currentSet, options).find((entry) =>
      PROTECT_LIKE_MOVE_IDS.has(entry.moveId)
    )?.move.name;
  }

  private selectTeraType(stats: NormalizedMonData): string | undefined {
    const teraEntries = Object.entries(stats.teraTypes || {}).sort((a, b) => b[1] - a[1]);
    return teraEntries[0]?.[0];
  }

  private selectMoves(
    stats: NormalizedMonData,
    pokemon: PokemonSpecies,
    count: number,
    currentSet: OptimizedSet,
    options: OptimizerOptions
  ): string[] {
    const structuredDoublesMoves = this.buildStructuredDoublesMoves(
      stats,
      pokemon,
      count,
      currentSet,
      options
    );
    if (structuredDoublesMoves.length === count) {
      return structuredDoublesMoves;
    }

    const isChoiceBand = currentSet.item === "Choice Band";
    const isChoiceSpecs = currentSet.item === "Choice Specs";
    const isChoiceScarf = currentSet.item === "Choice Scarf";
    const isAssaultVest = currentSet.item === "Assault Vest";
    const limitsStatus =
      isChoiceBand || isChoiceSpecs || isChoiceScarf || isAssaultVest;

    const candidateMoveIds = new Set<string>(Object.keys(stats.moves));
    options.template?.requiredMoves?.forEach((move) => {
      if (pokemonCanLearnMove(currentSet.species, move)) {
        candidateMoveIds.add(toID(move));
      }
    });
    options.template?.preferredMoves?.forEach((move) => {
      if (pokemonCanLearnMove(currentSet.species, move)) {
        candidateMoveIds.add(toID(move));
      }
    });

    const moveEntries = Array.from(candidateMoveIds).map((moveId) => {
      const moveData = Moves[moveId];
      let score = stats.moves[moveId] ?? 0.01;

      if (moveData) {
        if (
          limitsStatus &&
          moveData.category === "Status" &&
          !STATUS_WHITELIST.has(moveData.name)
        ) {
          score *= 0.04;
        }

        if (isChoiceBand && moveData.category === "Special") score *= 0.1;
        if (
          isChoiceSpecs &&
          moveData.category === "Physical" &&
          !["U-turn", "Flip Turn", "Knock Off"].includes(moveData.name)
        ) {
          score *= 0.1;
        }
      }

      if (options.template?.requiredMoves && !options.teamMoves?.has(moveId)) {
        const required = options.template.requiredMoves.map(toID);
        if (required.includes(moveId)) score += 2;
      }
      if (options.template?.preferredMoves) {
        const preferred = options.template.preferredMoves.map(toID);
        if (preferred.includes(moveId)) score += 0.5;
      }

      score += this.getTemplateMoveBonus(moveId, pokemon, options);
      return [moveId, score] as [string, number];
    });

    const chosen: string[] = [];
    const seen = new Set<string>();
    moveEntries
      .sort((a, b) => b[1] - a[1])
      .forEach(([moveId]) => {
        const moveName = Moves[moveId]?.name || moveId;
        if (seen.has(toID(moveName)) || chosen.length >= count) return;
        seen.add(toID(moveName));
        chosen.push(moveName);
      });

    if (chosen.length < count) {
      const fallbackMoves = this.selectCompetitiveFallbackMoves(
        pokemon,
        Math.max(count * 2, 6),
        {
          ability: currentSet.ability,
          format: options.format,
          item: currentSet.item,
        }
      );

      for (const moveName of fallbackMoves) {
        const moveId = toID(moveName);
        if (seen.has(moveId)) continue;
        seen.add(moveId);
        chosen.push(moveName);
        if (chosen.length >= count) break;
      }
    }

    return this.repairDoublesMoveSelection(
      chosen.slice(0, count),
      pokemon,
      count,
      currentSet,
      options
    );
  }

  private selectSpread(
    stats: NormalizedMonData,
    pokemon: PokemonSpecies,
    options: OptimizerOptions
  ): { nature: string; evs: OptimizedSet["evs"] } {
    if (stats.spreads && stats.spreads.length > 0) {
      let top = stats.spreads[0];
      const templateId = getTemplateId(options.template);
      const isDoubles = FORMATS[options.format as FormatId]?.gameType === "doubles";
      const findSpread = (
        predicate: (spread: NormalizedMonData["spreads"][number]) => boolean,
        sorter?: (
          a: NormalizedMonData["spreads"][number],
          b: NormalizedMonData["spreads"][number]
        ) => number
      ) =>
        [...stats.spreads]
          .filter(predicate)
          .sort(sorter ?? ((a, b) => b.percentage - a.percentage))[0];

      switch (templateId) {
        case "offense": {
          const offenseSpread = findSpread(
            (spread) =>
              Math.max(spread.evs[1] ?? 0, spread.evs[3] ?? 0) >= 160 &&
              ((spread.evs[5] ?? 0) >= 160 || maxStat(spread) >= 220),
            (a, b) => {
              const offenseDiff = maxStat(b) - maxStat(a);
              if (offenseDiff !== 0) return offenseDiff;
              return (b.evs[5] ?? 0) - (a.evs[5] ?? 0);
            }
          );
          if (offenseSpread) top = offenseSpread;
          break;
        }
        case "bulkyoffense": {
          const bulkyOffenseSpread = findSpread(
            (spread) => maxStat(spread) >= 150 && bulkStat(spread) >= 140,
            (a, b) => {
              const scoreA = maxStat(a) + bulkStat(a) * 0.8 + (a.evs[5] ?? 0) * 0.25;
              const scoreB = maxStat(b) + bulkStat(b) * 0.8 + (b.evs[5] ?? 0) * 0.25;
              return scoreB - scoreA;
            }
          );
          if (bulkyOffenseSpread) top = bulkyOffenseSpread;
          break;
        }
        case "tailwind": {
          const tailwindSpread = findSpread(
            (spread) => maxStat(spread) >= 140 && (spread.evs[5] ?? 0) <= 180,
            (a, b) => {
              const scoreA =
                maxStat(a) + bulkStat(a) * 0.35 - Math.abs((a.evs[5] ?? 0) - 120) * 0.2;
              const scoreB =
                maxStat(b) + bulkStat(b) * 0.35 - Math.abs((b.evs[5] ?? 0) - 120) * 0.2;
              return scoreB - scoreA;
            }
          );
          if (tailwindSpread) top = tailwindSpread;
          break;
        }
        case "trickroom": {
          const trickRoomSpread = findSpread(
            (spread) => {
              const speedInvestment = spread.evs[5] ?? 0;
              const offensiveInvestment = Math.max(spread.evs[1] ?? 0, spread.evs[3] ?? 0);
              return (
                speedInvestment <= 52 &&
                (Boolean(stats.moves[toID("trickroom")]) ||
                  pokemon.baseStats.spe <= 70 ||
                  offensiveInvestment >= 140)
              );
            },
            (a, b) => {
              const speedDiff = (a.evs[5] ?? 0) - (b.evs[5] ?? 0);
              if (speedDiff !== 0) return speedDiff;
              return b.percentage - a.percentage;
            }
          );
          if (trickRoomSpread) top = trickRoomSpread;
          break;
        }
        case "semistall":
        case "stall": {
          const defensiveSpread = findSpread(
            (spread) => bulkStat(spread) >= 220,
            (a, b) => {
              const scoreA = bulkStat(a) * 1.1 - maxStat(a) * 0.15;
              const scoreB = bulkStat(b) * 1.1 - maxStat(b) * 0.15;
              return scoreB - scoreA;
            }
          );
          if (defensiveSpread) top = defensiveSpread;
          break;
        }
        case "balanced": {
          const balancedSpread = findSpread(
            (spread) => maxStat(spread) >= 120 || bulkStat(spread) >= 160,
            (a, b) => {
              const scoreA =
                maxStat(a) * 0.85 + bulkStat(a) * 0.6 + (a.evs[5] ?? 0) * 0.2;
              const scoreB =
                maxStat(b) * 0.85 + bulkStat(b) * 0.6 + (b.evs[5] ?? 0) * 0.2;
              return scoreB - scoreA;
            }
          );
          if (balancedSpread) top = balancedSpread;
          break;
        }
        case "rain":
        case "sun":
        case "sand":
        case "weatheroffense": {
          const weatherSpread = findSpread(
            (spread) => maxStat(spread) >= 140 && (isDoubles ? bulkStat(spread) >= 60 : true),
            (a, b) => {
              const scoreA =
                maxStat(a) + (a.evs[5] ?? 0) * 0.55 + bulkStat(a) * (isDoubles ? 0.35 : 0.15);
              const scoreB =
                maxStat(b) + (b.evs[5] ?? 0) * 0.55 + bulkStat(b) * (isDoubles ? 0.35 : 0.15);
              return scoreB - scoreA;
            }
          );
          if (weatherSpread) top = weatherSpread;
          break;
        }
        default:
          break;
      }

      return {
        nature: top.nature,
        evs: {
          hp: top.evs[0],
          atk: top.evs[1],
          def: top.evs[2],
          spa: top.evs[3],
          spd: top.evs[4],
          spe: top.evs[5],
        },
      };
    }

    return {
      nature: "Serious",
      evs: { hp: 0, atk: 0, def: 0, spa: 0, spd: 0, spe: 0 },
    };
  }

  private findSpreadUsage(stats: NormalizedMonData | undefined, bundle: SetBundle) {
    if (!stats) return 0;
    const spread = stats.spreads.find(
      (candidate) =>
        candidate.nature === bundle.nature &&
        candidate.evs.every((value, index) => value === Object.values(bundle.evs)[index])
    );
    return spread?.percentage ?? 0.05;
  }

  private normalizeCompetitiveMoves(rawMoves: unknown) {
    if (!Array.isArray(rawMoves)) {
      return [];
    }

    return rawMoves
      .map((moveSlot) => this.pickFirstOption(moveSlot))
      .filter((moveName): moveName is string => typeof moveName === "string")
      .slice(0, 4);
  }

  private normalizeEvs(rawEvs: Record<string, number>) {
    return {
      hp: rawEvs.hp ?? 0,
      atk: rawEvs.atk ?? 0,
      def: rawEvs.def ?? 0,
      spa: rawEvs.spa ?? 0,
      spd: rawEvs.spd ?? 0,
      spe: rawEvs.spe ?? 0,
    };
  }

  private pickFirstOption<T>(value: T | T[] | undefined): T | undefined {
    if (Array.isArray(value)) {
      return value[0];
    }
    return value;
  }

  private getTopCandidates(
    usageMap: Record<string, number>,
    count: number
  ): string[] {
    const sorted = Object.entries(usageMap)
      .sort((a, b) => b[1] - a[1])
      .slice(0, count)
      .map(([candidate]) => candidate);

    return sorted.length > 0 ? sorted : ["leftovers"];
  }

  private generateBlankSet(
    pokemon: PokemonSpecies,
    format = "gen9ou"
  ): SetBundle {
    const emptySet: OptimizedSet = {
      species: pokemon.name,
      ability: Object.values(pokemon.abilities)[0] || "No Ability",
      item: "Leftovers",
      nature: "Serious",
      evs: { hp: 0, atk: 0, def: 0, spa: 0, spd: 0, spe: 0 },
      moves: [],
    };
    const structuredFallbackMoves = this.buildStructuredDoublesMoves(
      undefined,
      pokemon,
      4,
      emptySet,
      {
        format,
      }
    );
    const fallbackMoves =
      structuredFallbackMoves.length > 0
        ? structuredFallbackMoves
        : this.selectCompetitiveFallbackMoves(pokemon, 4, {
            ability: emptySet.ability,
            format,
          });
    const fallbackSpread = this.selectFallbackSpreadAndNature(pokemon, fallbackMoves);
    const fallbackItem = this.selectFallbackItem(fallbackMoves, pokemon);

    return {
      species: pokemon.name,
      ability: Object.values(pokemon.abilities)[0] || "No Ability",
      item: fallbackItem,
      nature: fallbackSpread.nature,
      evs: fallbackSpread.evs,
      moves: fallbackMoves,
      score: 0.1,
      coherenceScore: fallbackMoves.length > 0 ? 0.45 : 0.25,
      source: {
        provider: "fallback",
        format,
      },
      issues: fallbackMoves.length > 0 ? ["missing-meta-data"] : ["missing-meta-data", "missing-fallback-moves"],
    };
  }

  private hasUsableMeta(stats: NormalizedMonData) {
    return (
      Object.keys(stats.moves || {}).length > 0 ||
      Object.keys(stats.items || {}).length > 0 ||
      Object.keys(stats.abilities || {}).length > 0 ||
      (stats.spreads?.length ?? 0) > 0
    );
  }

  private buildStructuredDoublesMoves(
    stats: NormalizedMonData | undefined,
    pokemon: PokemonSpecies,
    count: number,
    currentSet: OptimizedSet,
    options: OptimizerOptions,
    seededMoves: string[] = []
  ): string[] {
    const isDoubles = FORMATS[options.format as FormatId]?.gameType === "doubles";
    if (!isDoubles) {
      return [];
    }

    const scoredMoves = this.getDoublesMoveCandidates(
      stats,
      pokemon,
      currentSet,
      options,
      seededMoves
    );
    if (scoredMoves.length === 0) {
      return [];
    }

    const chosen: string[] = [];
    const seen = new Set<string>();
    const selectedAttackTypes = new Set<string>();
    const limitsStatus =
      currentSet.item === "Choice Band" ||
      currentSet.item === "Choice Specs" ||
      currentSet.item === "Choice Scarf" ||
      currentSet.item === "Assault Vest";
    const protectUsers = this.getCurrentProtectLikeMoveCount(options);
    const protectSoftCap = this.getDoublesProtectSoftCap(options);
    const canUseProtectLike =
      !limitsStatus &&
      protectUsers < protectSoftCap &&
      scoredMoves.some((entry) => PROTECT_LIKE_MOVE_IDS.has(entry.moveId));
    const structure = this.classifyDoublesMoveStructure(pokemon, options, scoredMoves);
    const attacks = scoredMoves.filter((entry) => entry.move.category !== "Status");
    const utilities = scoredMoves.filter((entry) => entry.move.category === "Status");
    const addEntry = (entry: ScoredMoveCandidate | undefined) => {
      if (!entry || seen.has(entry.moveId) || chosen.length >= count) {
        return false;
      }
      seen.add(entry.moveId);
      chosen.push(entry.move.name);
      if (entry.move.category !== "Status" && entry.move.type) {
        selectedAttackTypes.add(entry.move.type);
      }
      return true;
    };
    const findEntry = (
      pool: ScoredMoveCandidate[],
      predicate: (entry: ScoredMoveCandidate) => boolean
    ) => pool.find((entry) => !seen.has(entry.moveId) && predicate(entry));
    const addMoveId = (moveId: string) => addEntry(findEntry(scoredMoves, (entry) => entry.moveId === moveId));
    const addBestAttack = (config: {
      requireStab?: boolean;
      avoidRepeatedType?: boolean;
      preferSpread?: boolean;
      allowSameTypeUtility?: boolean;
    } = {}) => {
      const candidate = findEntry(attacks, (entry) => {
        if (!this.isReliableDoublesAttack(entry.move)) {
          return false;
        }
        if (config.requireStab && !pokemon.types.includes(entry.move.type || "")) {
          return false;
        }
        if (
          config.avoidRepeatedType &&
          entry.move.type &&
          selectedAttackTypes.has(entry.move.type) &&
          !(
            config.allowSameTypeUtility &&
            this.isDistinctDoublesAttack(entry.move, entry.moveId)
          )
        ) {
          return false;
        }
        if (config.preferSpread && entry.move.target !== "allAdjacentFoes") {
          return false;
        }
        return true;
      });

      if (candidate) {
        return addEntry(candidate);
      }

      if (config.preferSpread) {
        return addBestAttack({
          ...config,
          preferSpread: false,
        });
      }
      if (config.requireStab) {
        return addBestAttack({
          ...config,
          requireStab: false,
        });
      }
      if (config.avoidRepeatedType) {
        return addBestAttack({
          ...config,
          avoidRepeatedType: false,
        });
      }

      return false;
    };
    const addBestUtility = (preferredMoveIds?: Set<string>) =>
      addEntry(
        findEntry(utilities, (entry) =>
          preferredMoveIds ? preferredMoveIds.has(entry.moveId) : true
        )
      );
    const addBestProtectLike = () =>
      addEntry(
        findEntry(scoredMoves, (entry) => PROTECT_LIKE_MOVE_IDS.has(entry.moveId))
      );

    switch (structure) {
      case "trickroom-setter":
        addMoveId(toID("Trick Room"));
        addBestAttack({ requireStab: true });
        addBestUtility(DOUBLES_BOARD_CONTROL_MOVE_IDS);
        if (canUseProtectLike) addBestProtectLike();
        break;
      case "tailwind-support":
        addMoveId(toID("Tailwind"));
        addBestAttack({ requireStab: true, preferSpread: true });
        addBestAttack({ avoidRepeatedType: true, allowSameTypeUtility: true });
        if (canUseProtectLike) addBestProtectLike();
        break;
      case "redirector":
        addBestUtility(DOUBLES_REDIRECTION_MOVE_IDS);
        addBestUtility(DOUBLES_BOARD_CONTROL_MOVE_IDS);
        addBestAttack({ requireStab: true });
        if (canUseProtectLike) addBestProtectLike();
        break;
      case "fakeout-pivot":
        addMoveId(toID("Fake Out"));
        addBestAttack({ requireStab: true });
        addBestUtility(DOUBLES_BOARD_CONTROL_MOVE_IDS);
        if (canUseProtectLike) addBestProtectLike();
        break;
      case "setup-sweeper":
        addEntry(
          findEntry(scoredMoves, (entry) => {
            if (!SETUP_MOVES.map(toID).includes(entry.moveId)) {
              return false;
            }
            if (
              PHYSICAL_SETUP_MOVE_IDS.has(entry.moveId) &&
              pokemon.baseStats.atk + 10 < pokemon.baseStats.spa
            ) {
              return false;
            }
            if (
              SPECIAL_SETUP_MOVE_IDS.has(entry.moveId) &&
              pokemon.baseStats.spa + 10 < pokemon.baseStats.atk
            ) {
              return false;
            }
            return true;
          })
        );
        addBestAttack({ requireStab: true });
        addBestAttack({ avoidRepeatedType: true, allowSameTypeUtility: true });
        if (canUseProtectLike) addBestProtectLike();
        break;
      default:
        addBestAttack({ requireStab: true, preferSpread: true });
        addBestAttack({ avoidRepeatedType: true, allowSameTypeUtility: true });
        addBestAttack({ avoidRepeatedType: true, allowSameTypeUtility: true });
        if (canUseProtectLike) {
          addBestProtectLike();
        } else {
          addBestUtility(DOUBLES_BOARD_CONTROL_MOVE_IDS);
        }
        break;
    }

    const minimumAttacks =
      structure === "redirector" || structure === "trickroom-setter" ? 1 : 2;
    while (
      chosen.filter((moveName) => Moves[toID(moveName)]?.category !== "Status").length <
        minimumAttacks &&
      chosen.length < count
    ) {
      if (!addBestAttack({ avoidRepeatedType: true, allowSameTypeUtility: true })) {
        break;
      }
    }

    while (chosen.length < count) {
      if (addBestAttack({ avoidRepeatedType: true, allowSameTypeUtility: true })) {
        continue;
      }
      if (addBestUtility()) {
        continue;
      }
      break;
    }

    return chosen.slice(0, count);
  }

  private classifyDoublesMoveStructure(
    pokemon: PokemonSpecies,
    options: OptimizerOptions,
    scoredMoves: ScoredMoveCandidate[]
  ) {
    const templateId = getTemplateId(options.template);
    const moveIds = new Set(scoredMoves.map((entry) => entry.moveId));
    const { bulk, maxOffense, speed } = getCandidateStatProfile(pokemon);

    if (templateId === "trickroom" && moveIds.has(toID("Trick Room"))) {
      return "trickroom-setter" as const;
    }
    if (
      (templateId === "tailwind" || bulk >= 250 || speed >= 90) &&
      moveIds.has(toID("Tailwind"))
    ) {
      return "tailwind-support" as const;
    }
    if (
      moveIds.has(toID("Follow Me")) ||
      moveIds.has(toID("Rage Powder"))
    ) {
      return "redirector" as const;
    }
    if (
      moveIds.has(toID("Fake Out")) &&
      (bulk >= 250 || maxOffense >= 95)
    ) {
      return "fakeout-pivot" as const;
    }
    if (
      scoredMoves.some((entry) => SETUP_MOVES.map(toID).includes(entry.moveId)) &&
      maxOffense >= 105
    ) {
      return "setup-sweeper" as const;
    }
    return "attacker" as const;
  }

  private getDoublesMoveCandidates(
    stats: NormalizedMonData | undefined,
    pokemon: PokemonSpecies,
    currentSet: OptimizedSet,
    options: OptimizerOptions,
    seededMoves: string[] = []
  ): ScoredMoveCandidate[] {
    const learnableMoves = getLearnableMovesWithDetails(pokemon.name);
    if (learnableMoves.length === 0) {
      return [];
    }

    const preferredCategory =
      pokemon.baseStats.atk >= pokemon.baseStats.spa + 15
        ? "Physical"
        : pokemon.baseStats.spa >= pokemon.baseStats.atk + 15
          ? "Special"
          : pokemon.baseStats.atk >= pokemon.baseStats.spa
            ? "Physical"
            : "Special";
    const speed = pokemon.baseStats.spe;
    const bulk = pokemon.baseStats.hp + pokemon.baseStats.def + pokemon.baseStats.spd;
    const isFastAttacker = speed >= 85;
    const prefersOffense = Math.max(pokemon.baseStats.atk, pokemon.baseStats.spa) >= 100;
    const seededMoveIds = new Set(seededMoves.map(toID));

    return learnableMoves
      .map((move) => {
        const moveId = toID(move.name);
        const usage = stats?.moves[moveId] ?? 0;
        const fallbackScore = this.scoreCompetitiveFallbackMove(
          move,
          pokemon,
          preferredCategory,
          isFastAttacker,
          bulk,
          prefersOffense,
          {
            ability: currentSet.ability,
            format: options.format,
            item: currentSet.item,
            template: options.template,
            teamMoves: options.teamMoves,
            teamMoveCounts: options.teamMoveCounts,
          }
        );
        const score =
          fallbackScore +
          usage * 30 +
          (FORMATS[options.format as FormatId]?.gameType === "doubles" &&
          DOUBLES_PREMIUM_SUPPORT_MOVE_IDS.has(moveId)
            ? 3
            : 0) +
          this.getTemplateMoveBonus(moveId, pokemon, options) * 12 +
          (seededMoveIds.has(moveId) ? 6 : 0);
        return {
          move,
          moveId,
          score,
          usage,
        };
      })
      .sort((a, b) => b.score - a.score);
  }

  private isReliableDoublesAttack(move: {
    accuracy?: number | true;
    category: string;
  }) {
    if (move.category === "Status") {
      return false;
    }
    if (move.accuracy === true) {
      return true;
    }
    return (move.accuracy ?? 100) >= 85;
  }

  private isDistinctDoublesAttack(
    move: { priority?: number; target?: string },
    moveId: string
  ) {
    return (
      (move.priority ?? 0) > 0 ||
      move.target === "allAdjacentFoes" ||
      FALLBACK_PRIORITY_MOVE_IDS.has(moveId)
    );
  }

  private selectCompetitiveFallbackMoves(
    pokemon: PokemonSpecies,
    count: number,
    options: FallbackMoveOptions = {}
  ): string[] {
    const learnableMoves = getLearnableMovesWithDetails(pokemon.name);
    if (learnableMoves.length === 0) {
      return getRandomMovesWithDetails(pokemon.name, count).map((move) => move.name);
    }

    const preferredCategory =
      pokemon.baseStats.atk >= pokemon.baseStats.spa + 15
        ? "Physical"
        : pokemon.baseStats.spa >= pokemon.baseStats.atk + 15
          ? "Special"
          : pokemon.baseStats.atk >= pokemon.baseStats.spa
            ? "Physical"
            : "Special";
    const speed = pokemon.baseStats.spe;
    const bulk = pokemon.baseStats.hp + pokemon.baseStats.def + pokemon.baseStats.spd;
    const isFastAttacker = speed >= 85;
    const prefersOffense = Math.max(pokemon.baseStats.atk, pokemon.baseStats.spa) >= 100;
    const scoredMoves = learnableMoves
      .map((move) => ({
        move,
        moveId: toID(move.name),
        score: this.scoreCompetitiveFallbackMove(
          move,
          pokemon,
          preferredCategory,
          isFastAttacker,
          bulk,
          prefersOffense,
          options
        ),
      }))
      .sort((a, b) => b.score - a.score);

    const chosen: string[] = [];
    const seen = new Set<string>();
    const selectedAttackTypes = new Set<string>();
    let attackCount = 0;
    let statusCount = 0;
    let hasSleepEnabler = false;

    for (const { move, moveId, score } of scoredMoves) {
      if (seen.has(moveId) || chosen.length >= count) continue;
      if (score < 0) continue;

      const isAttack = move.category !== "Status";
      const repeatsAttackType =
        isAttack &&
        move.type &&
        selectedAttackTypes.has(move.type) &&
        !this.isDistinctDoublesAttack(move, moveId);
      if (!isAttack && statusCount >= 1 && attackCount < 2) continue;
      if (!isAttack && statusCount >= 2) continue;
      if (repeatsAttackType && attackCount >= 2) continue;

      chosen.push(move.name);
      seen.add(moveId);
      if (isAttack && move.type) {
        selectedAttackTypes.add(move.type);
      }
      attackCount += isAttack ? 1 : 0;
      statusCount += isAttack ? 0 : 1;
      hasSleepEnabler ||= FALLBACK_SLEEP_ENABLER_IDS.has(moveId);
    }

    if (!chosen.some((moveName) => {
      const move = Moves[toID(moveName)];
      return move && move.category !== "Status" && pokemon.types.includes(move.type || "");
    })) {
      const bestStabAttack = scoredMoves.find(({ move, moveId }) =>
        move.category !== "Status" &&
        pokemon.types.includes(move.type || "") &&
        !FALLBACK_DISALLOWED_MOVE_IDS.has(moveId)
      );
      if (bestStabAttack && !seen.has(bestStabAttack.moveId)) {
        chosen.unshift(bestStabAttack.move.name);
        seen.add(bestStabAttack.moveId);
      }
    }

    if (!hasSleepEnabler) {
      const dreamEaterIndex = chosen.findIndex((moveName) => toID(moveName) === "dreameater");
      if (dreamEaterIndex !== -1) {
        chosen.splice(dreamEaterIndex, 1);
      }
    }

    if (chosen.length < count) {
      for (const { move, moveId } of scoredMoves) {
        if (seen.has(moveId) || FALLBACK_DISALLOWED_MOVE_IDS.has(moveId)) continue;
        chosen.push(move.name);
        seen.add(moveId);
        if (move.category !== "Status" && move.type) {
          selectedAttackTypes.add(move.type);
        }
        if (chosen.length >= count) break;
      }
    }

    if (chosen.length < count) {
      const randomFallback = getRandomMovesWithDetails(pokemon.name, count * 3).map(
        (move) => move.name
      );
      for (const moveName of randomFallback) {
        const moveId = toID(moveName);
        if (seen.has(moveId) || FALLBACK_DISALLOWED_MOVE_IDS.has(moveId)) continue;
        chosen.push(moveName);
        seen.add(moveId);
        if (chosen.length >= count) break;
      }
    }

    return chosen.slice(0, count);
  }

  private scoreCompetitiveFallbackMove(
    move: {
      name: string;
      category: string;
      type?: string;
      basePower?: number;
      accuracy?: number | true;
      priority?: number;
      target?: string;
      flags?: Record<string, unknown>;
    },
    pokemon: PokemonSpecies,
    preferredCategory: "Physical" | "Special",
    isFastAttacker: boolean,
    bulk: number,
    prefersOffense: boolean,
    options: FallbackMoveOptions = {}
  ) {
    const moveId = toID(move.name);
    const isStatus = move.category === "Status";
    const isStab = move.type ? pokemon.types.includes(move.type) : false;
    const basePower = typeof move.basePower === "number" ? move.basePower : 0;
    const isPreferredAttackCategory = move.category === preferredCategory;
    const isDoubles = FORMATS[options.format as FormatId]?.gameType === "doubles";
    const protectUsers = this.getCurrentProtectLikeMoveCount(options);
    const protectSoftCap = this.getDoublesProtectSoftCap(options);
    const accuracy = move.accuracy === true ? 100 : move.accuracy ?? 100;
    const abilityId = toID(options.ability ?? "");
    const isProtectLike = PROTECT_LIKE_MOVE_IDS.has(moveId);

    if (FALLBACK_DISALLOWED_MOVE_IDS.has(moveId)) {
      return -100;
    }

    let score = 0;

    if (isDoubles && DOUBLES_PREMIUM_SUPPORT_MOVE_IDS.has(moveId)) {
      score += isProtectLike ? 4 : 6;
    }

    if (!isStatus) {
      score += isStab ? 28 : 12;
      score += isPreferredAttackCategory ? 12 : 2;
      score += Math.min(basePower, 120) / 5;
      if (basePower < 55 && !FALLBACK_PRIORITY_MOVE_IDS.has(moveId) && !FALLBACK_UTILITY_MOVE_IDS.has(moveId)) {
        score -= 14;
      }
      if (isFastAttacker && FALLBACK_PRIORITY_MOVE_IDS.has(moveId)) {
        score += 2;
      }
      if (isDoubles && moveId === "fakeout") {
        score += 16;
      }
      if (prefersOffense && basePower >= 80) {
        score += 8;
      }
      if (!prefersOffense && isStab) {
        score += 5;
      }
      if (accuracy < 70) {
        score -= 22;
      } else if (accuracy < 80) {
        score -= 12;
      } else if (accuracy < 90) {
        score -= 4;
      }
      if (isDoubles && move.target === "allAdjacentFoes") {
        score += basePower >= 60 ? 6 : 3;
      }
      if (isDoubles && move.target === "allAdjacent") {
        score -= 8;
      }
      if (isDoubles && DOUBLES_CONDITIONAL_LOW_VALUE_MOVE_IDS.has(moveId)) {
        score -= 18;
      }
    } else {
      score -= 16;
      if (FALLBACK_UTILITY_MOVE_IDS.has(moveId)) {
        score += bulk >= 255 ? 20 : 12;
      }
      if (SETUP_MOVES.map(toID).includes(moveId)) {
        score += prefersOffense ? 18 : 6;
      }
      if (RECOVERY_MOVES.map(toID).includes(moveId)) {
        score += bulk >= 255 ? 16 : 4;
      }
      if (DOUBLES_SUPPORT_MOVES.map(toID).includes(moveId)) {
        score += 8;
      }
      if (DOUBLES_SPEED_CONTROL_MOVE_IDS.has(moveId)) {
        score += 8;
      }
      if (DOUBLES_REDIRECTION_MOVE_IDS.has(moveId)) {
        score += 12;
      }
      if (DOUBLES_BOARD_CONTROL_MOVE_IDS.has(moveId)) {
        score += 6;
      }
      if (isProtectLike) {
        if (!isDoubles) {
          score += bulk >= 250 ? 10 : 4;
        } else if (protectUsers >= protectSoftCap) {
          score -= 10;
        } else if (protectUsers === protectSoftCap - 1) {
          score += bulk >= 260 ? 3 : 1;
        } else {
          score += bulk >= 260 ? 7 : 4;
        }
      }
      if (FALLBACK_SLEEP_ENABLER_IDS.has(moveId)) {
        score += 6;
      }
      if (isDoubles && DOUBLES_UTILITY_MOVE_IDS.has(moveId) && !isProtectLike) {
        score += 10;
      }
      if (
        isDoubles &&
        !isProtectLike &&
        !DOUBLES_UTILITY_MOVE_IDS.has(moveId) &&
        !SETUP_MOVES.map(toID).includes(moveId) &&
        !RECOVERY_MOVES.map(toID).includes(moveId) &&
        !DOUBLES_FLEXIBLE_STATUS_MOVE_IDS.has(moveId)
      ) {
        score -= 10;
      }
      if (isDoubles && SETUP_MOVES.map(toID).includes(moveId)) {
        score -= 6;
      }
      if (moveId === "dreameater") {
        score -= 40;
      }
    }

    if (moveId === "dreameater") {
      score -= 40;
    }

    score += this.getAbilityMoveSynergyScore(abilityId, move, moveId, options);

    return score;
  }

  private selectFallbackSpreadAndNature(
    pokemon: PokemonSpecies,
    moves: string[]
  ) {
    const moveEntries = moves
      .map((moveName) => Moves[toID(moveName)])
      .filter(Boolean) as Array<{ name: string; category: string; type?: string }>;
    const physicalCount = moveEntries.filter((move) => move.category === "Physical").length;
    const specialCount = moveEntries.filter((move) => move.category === "Special").length;
    const utilityCount = moveEntries.filter((move) => move.category === "Status").length;
    const prefersPhysical =
      physicalCount > specialCount ||
      (physicalCount === specialCount && pokemon.baseStats.atk >= pokemon.baseStats.spa);
    const speed = pokemon.baseStats.spe;
    const bulk = pokemon.baseStats.hp + pokemon.baseStats.def + pokemon.baseStats.spd;
    const hasSetup = moves.some((move) => SETUP_MOVES.map(toID).includes(toID(move)));
    const isOffensive =
      Math.max(pokemon.baseStats.atk, pokemon.baseStats.spa) >= 100 &&
      (speed >= 80 || hasSetup || utilityCount === 0);

    if (isOffensive) {
      return {
        nature: prefersPhysical ? (speed >= 85 ? "Jolly" : "Adamant") : (speed >= 85 ? "Timid" : "Modest"),
        evs: prefersPhysical
          ? { hp: 4, atk: 252, def: 0, spa: 0, spd: 0, spe: 252 }
          : { hp: 4, atk: 0, def: 0, spa: 252, spd: 0, spe: 252 },
      };
    }

    if (bulk >= 250 && utilityCount > 0) {
      return {
        nature: prefersPhysical ? "Adamant" : "Modest",
        evs: prefersPhysical
          ? { hp: 252, atk: 252, def: 0, spa: 0, spd: 4, spe: 0 }
          : { hp: 252, atk: 0, def: 0, spa: 252, spd: 4, spe: 0 },
      };
    }

    return {
      nature: prefersPhysical ? "Adamant" : "Modest",
      evs: prefersPhysical
        ? { hp: 4, atk: 252, def: 0, spa: 0, spd: 0, spe: 252 }
        : { hp: 4, atk: 0, def: 0, spa: 252, spd: 0, spe: 252 },
    };
  }

  private selectFallbackItem(moves: string[], pokemon: PokemonSpecies) {
    const hasUtility = moves.some((move) => FALLBACK_UTILITY_MOVE_IDS.has(toID(move)));
    const hasOnlyAttacks = moves.every((move) => {
      const moveData = Moves[toID(move)];
      return moveData && moveData.category !== "Status";
    });
    const highOffense = Math.max(pokemon.baseStats.atk, pokemon.baseStats.spa) >= 110;
    const bulk = pokemon.baseStats.hp + pokemon.baseStats.def + pokemon.baseStats.spd;

    if (hasOnlyAttacks && bulk >= 250) {
      return "Assault Vest";
    }
    if (!hasUtility && highOffense) {
      return "Life Orb";
    }
    return "Leftovers";
  }

  private getTemplateMoveBonus(
    moveId: string,
    pokemon: PokemonSpecies,
    options: OptimizerOptions
  ) {
    const templateId = getTemplateId(options.template);
    if (!templateId) return 0;

    const { bulk, maxOffense } = getCandidateStatProfile(pokemon);
    const teamMoves = options.teamMoves ?? new Set<string>();
    const isDoubles = FORMATS[options.format as FormatId]?.gameType === "doubles";
    const protectUsers = this.getCurrentProtectLikeMoveCount(options);
    const protectSoftCap = this.getDoublesProtectSoftCap(options);
    const matchesMove = (moveNames: string[]) =>
      moveNames.some((moveName) => toID(moveName) === moveId);

    if (isDoubles && PROTECT_LIKE_MOVE_IDS.has(moveId)) {
      if (protectUsers >= protectSoftCap) {
        return -0.35;
      }

      switch (templateId) {
        case "tailwind":
          return teamMoves.has(toID("Tailwind")) ? 0.18 : 0.08;
        case "trickroom":
          return teamMoves.has(toID("Trick Room")) ? 0.16 : 0.06;
        case "rain":
        case "sun":
        case "sand":
        case "weatheroffense":
          return 0.08;
        case "offense":
          return maxOffense >= 100 ? 0.08 : 0.03;
        case "balanced":
        case "bulkyoffense":
          return bulk >= 270 ? 0.08 : 0.03;
        default:
          return 0.03;
      }
    }

    switch (templateId) {
      case "balanced":
        if (
          !isDoubles &&
          !HAZARD_MOVES.some((moveName) => teamMoves.has(toID(moveName))) &&
          matchesMove(HAZARD_MOVES)
        ) {
          return 0.8;
        }
        if (
          !isDoubles &&
          !REMOVAL_MOVES.some((moveName) => teamMoves.has(toID(moveName))) &&
          matchesMove(REMOVAL_MOVES)
        ) {
          return 0.8;
        }
        if (matchesMove(PIVOT_MOVES) || matchesMove(RECOVERY_MOVES)) return 0.25;
        return 0;
      case "offense":
        if (matchesMove(SETUP_MOVES)) return 0.85;
        if (!isDoubles && teamMoves.size === 0 && matchesMove(LEAD_PRESSURE_MOVES)) return 0.7;
        return 0;
      case "bulkyoffense":
        if (matchesMove(PIVOT_MOVES)) return 0.55;
        if (matchesMove(SETUP_MOVES)) return 0.45;
        if (matchesMove(RECOVERY_MOVES)) return 0.35;
        if (matchesMove(["Knock Off", "Stealth Rock"])) return 0.4;
        return 0;
      case "voltturn":
        if (matchesMove(PIVOT_MOVES)) return 1.1;
        if (matchesMove(["Knock Off", "Taunt", "Stealth Rock"])) return 0.35;
        return 0;
      case "hazardstack":
        if (!teamMoves.has(toID("Stealth Rock")) && moveId === toID("Stealth Rock")) return 2.2;
        if (
          teamMoves.has(toID("Stealth Rock")) &&
          matchesMove(STACKING_HAZARD_MOVES) &&
          !teamMoves.has(moveId)
        ) {
          return 1.4;
        }
        if (matchesMove(["Knock Off", "Taunt"])) return 0.35;
        return 0;
      case "trickroom":
        if (!teamMoves.has(toID("Trick Room")) && moveId === toID("Trick Room")) return 2.4;
        return 0;
      case "tailwind":
        if (!teamMoves.has(toID("Tailwind")) && moveId === toID("Tailwind")) return 2.4;
        if (
          matchesMove([
            "Protect",
            "Detect",
            "Spiky Shield",
            "Helping Hand",
            "Icy Wind",
            "Wide Guard",
            "Follow Me",
            "Rage Powder",
            "Taunt",
          ])
        ) {
          return teamMoves.has(toID("Tailwind")) ? 0.45 : 0.3;
        }
        return 0;
      case "rain":
        if (!teamMoves.has(toID("Rain Dance")) && moveId === toID("Rain Dance")) return 0.5;
        if (matchesMove(RAIN_PAYOFF_MOVES)) return 0.4;
        return 0;
      case "sun":
        if (!teamMoves.has(toID("Sunny Day")) && moveId === toID("Sunny Day")) return 0.5;
        if (matchesMove(SUN_PAYOFF_MOVES)) return 0.4;
        return 0;
      case "sand":
        if (!teamMoves.has(toID("Sandstorm")) && moveId === toID("Sandstorm")) return 0.35;
        if (matchesMove(SAND_PAYOFF_MOVES)) return 0.35;
        return 0;
      case "weatheroffense":
        if (matchesMove(WEATHER_FLEX_MOVES)) return 0.45;
        if (matchesMove(["Rain Dance", "Sunny Day", "Sandstorm", "Snowscape"])) return 0.35;
        return 0;
      case "semistall":
        if (!isDoubles && !teamMoves.has(toID("Stealth Rock")) && moveId === toID("Stealth Rock")) return 0.9;
        if (
          !isDoubles &&
          !REMOVAL_MOVES.some((moveName) => teamMoves.has(toID(moveName))) &&
          matchesMove(REMOVAL_MOVES)
        ) {
          return 0.9;
        }
        if (matchesMove([...RECOVERY_MOVES, ...STALL_PAYOFF_MOVES])) {
          return maxOffense >= 95 ? 0.8 : 0.7;
        }
        if (matchesMove(SETUP_MOVES) && maxOffense >= 95) return 0.25;
        return 0;
      case "stall":
        if (!isDoubles && !teamMoves.has(toID("Stealth Rock")) && moveId === toID("Stealth Rock")) return 1;
        if (
          !isDoubles &&
          !REMOVAL_MOVES.some((moveName) => teamMoves.has(toID(moveName))) &&
          matchesMove(REMOVAL_MOVES)
        ) {
          return 1;
        }
        if (matchesMove([...RECOVERY_MOVES, ...STALL_PAYOFF_MOVES])) {
          return bulk >= 280 ? 0.95 : 0.75;
        }
        if (matchesMove(HAZARD_MOVES)) return 0.45;
        return 0;
      default:
        return 0;
    }
  }

  private repairDoublesMoveSelection(
    chosenMoves: string[],
    pokemon: PokemonSpecies,
    count: number,
    currentSet: OptimizedSet,
    options: OptimizerOptions
  ) {
    const isDoubles = FORMATS[options.format as FormatId]?.gameType === "doubles";
    if (!isDoubles) {
      return chosenMoves.slice(0, count);
    }

    const moveEntries = chosenMoves
      .map((moveName) => {
        const move = Moves[toID(moveName)];
        return move ? { ...move, id: toID(moveName) } : null;
      })
      .filter(Boolean) as Array<{ id: string; name: string; category: string; type?: string }>;
    const attackMoves = moveEntries.filter((move) => move.category !== "Status");
    const physicalMoves = moveEntries.filter((move) => move.category === "Physical");
    const specialMoves = moveEntries.filter((move) => move.category === "Special");
    const statusMoves = moveEntries.filter((move) => move.category === "Status");
    const supportMoves = moveEntries.filter((move) => DOUBLES_UTILITY_MOVE_IDS.has(move.id));
    const physicalSetupCount = moveEntries.filter((move) =>
      PHYSICAL_SETUP_MOVE_IDS.has(move.id)
    ).length;
    const specialSetupCount = moveEntries.filter((move) =>
      SPECIAL_SETUP_MOVE_IDS.has(move.id)
    ).length;
    const setupCount = moveEntries.filter((move) =>
      SETUP_MOVES.some((setupMove) => toID(setupMove) === move.id)
    ).length;
    const hasStabAttack = attackMoves.some((move) =>
      move.type ? pokemon.types.includes(move.type) : false
    );
    const limitsStatus =
      currentSet.item === "Choice Band" ||
      currentSet.item === "Choice Specs" ||
      currentSet.item === "Choice Scarf" ||
      currentSet.item === "Assault Vest";
    const protectUsers = this.getCurrentProtectLikeMoveCount(options);
    const protectSoftCap = this.getDoublesProtectSoftCap(options);
    const needsProtectRepair =
      protectUsers >= protectSoftCap &&
      chosenMoves.some((moveName) => PROTECT_LIKE_MOVE_IDS.has(toID(moveName)));
    const isPathological =
      (attackMoves.length < 2 && supportMoves.length < 2) ||
      (statusMoves.length >= 3 && supportMoves.length < 2) ||
      (setupCount > 1 && supportMoves.length === 0) ||
      (physicalSetupCount > 0 && physicalMoves.length === 0) ||
      (specialSetupCount > 0 && specialMoves.length === 0) ||
      (
        physicalSetupCount > 0 &&
        specialSetupCount > 0 &&
        (physicalMoves.length === 0 || specialMoves.length === 0)
      ) ||
      (!hasStabAttack && attackMoves.length < 2 && supportMoves.length === 0) ||
      needsProtectRepair;

    if (!isPathological) {
      return chosenMoves.slice(0, count);
    }

    const structuredRebuild = this.buildStructuredDoublesMoves(
      this.data.pokemon[toID(pokemon.name)],
      pokemon,
      count,
      currentSet,
      options,
      chosenMoves
    );
    if (structuredRebuild.length === count) {
      return structuredRebuild;
    }

    const repaired: string[] = [];
    const seen = new Set<string>();
    const addMove = (moveName: string) => {
      const moveId = toID(moveName);
      if (!moveId || seen.has(moveId) || repaired.length >= count) {
        return;
      }
      seen.add(moveId);
      repaired.push(moveName);
    };

    const keepSupportMoves = chosenMoves.filter((moveName) => {
      const moveId = toID(moveName);
      if (!DOUBLES_UTILITY_MOVE_IDS.has(moveId)) {
        return false;
      }
      if (needsProtectRepair && PROTECT_LIKE_MOVE_IDS.has(moveId)) {
        return false;
      }
      return true;
    });
    keepSupportMoves.forEach(addMove);

    if (
      attackMoves.length >= 2 &&
      supportMoves.length === 0 &&
      !limitsStatus &&
      protectUsers < protectSoftCap &&
      !chosenMoves.some((moveName) => PROTECT_LIKE_MOVE_IDS.has(toID(moveName)))
    ) {
      const protectLikeMove = this.selectBestProtectLikeMove(pokemon, currentSet, options);
      if (protectLikeMove) {
        addMove(protectLikeMove);
      }
    }

    const fallbackMoves = this.selectCompetitiveFallbackMoves(pokemon, Math.max(count * 3, 8), {
      ability: currentSet.ability,
      format: options.format,
      item: currentSet.item,
    });
    fallbackMoves.forEach(addMove);

    chosenMoves
      .filter((moveName) => !(needsProtectRepair && PROTECT_LIKE_MOVE_IDS.has(toID(moveName))))
      .forEach(addMove);

    if (!needsProtectRepair) {
      chosenMoves.forEach(addMove);
    }

    return repaired.slice(0, count);
  }

  private getDoublesProtectSoftCap(options: OptimizerOptions) {
    const templateId = getTemplateId(options.template);
    const format = options.format || this.data.meta.format || "";

    if (format.includes("vgc")) {
      return 4;
    }
    if (templateId === "tailwind" || templateId === "trickroom") {
      return 4;
    }
    return 3;
  }
}

function maxStat(spread: NormalizedMonData["spreads"][number]) {
  return Math.max(spread.evs[1] ?? 0, spread.evs[3] ?? 0);
}

function bulkStat(spread: NormalizedMonData["spreads"][number]) {
  return (spread.evs[0] ?? 0) + (spread.evs[2] ?? 0) + (spread.evs[4] ?? 0);
}
