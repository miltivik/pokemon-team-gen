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
const Moves = movesData as Record<string, { name: string; category: string; type?: string }>;
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
  "splash",
]);
const FALLBACK_UTILITY_MOVE_IDS = new Set(
  [
    ...PIVOT_MOVES,
    ...RECOVERY_MOVES,
    ...SETUP_MOVES,
    ...HAZARD_MOVES,
    ...REMOVAL_MOVES,
    ...STALL_PAYOFF_MOVES,
    ...DOUBLES_SUPPORT_MOVES,
    "Protect",
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
  teamAbilities?: Set<string>;
  format?: string;
}

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
    if (!stats || !this.hasUsableMeta(stats)) {
      return this.generateBlankSet(pokemon, options.format);
    }

    const cacheKey = this.getCacheKey(pokemon, teamContext, options);
    const cached = this.cache.get(cacheKey);
    if (cached) {
      return cached;
    }

    const bundles = [
      ...this.buildCompetitiveBundles(pokemon, options),
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
    const abilitiesKey = Array.from(options.teamAbilities || []).sort().join(",");
    const teamKey = teamContext.map((member) => toID(member.name)).sort().join(",");
    return [toID(pokemon.name), templateKey, formatKey, teamKey, movesKey, abilitiesKey].join("|");
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
    const bundles: SetBundle[] = [];

    for (const itemId of itemCandidates) {
      const item = Items[itemId]?.name || itemId;
      const ability = this.selectAbility(stats, pokemon, options);
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
      DOUBLES_SUPPORT_MOVES.some((supportMove) => toID(supportMove) === toID(move))
    );

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

    if (isDoubles && hazardCount > 0) {
      coherenceScore -= 0.3 * hazardCount;
      issues.push("hazard-set-in-doubles");
    }

    if (attackMoves.length === 0 && supportMoves.length < 2) {
      coherenceScore -= 0.75;
      issues.push("no-real-progression");
    }

    if (attackMoves.length > 0 && !hasStab) {
      coherenceScore -= 0.15;
      issues.push("no-stab-attack");
    }

    if (
      isDoubles &&
      !isChoiceItem &&
      !isAssaultVest &&
      attackMoves.length >= 2 &&
      !bundle.moves.some((move) => toID(move) === toID("Protect"))
    ) {
      coherenceScore -= 0.08;
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

  private selectAbility(
    stats: NormalizedMonData,
    pokemon: PokemonSpecies,
    options: OptimizerOptions
  ): string {
    const abilityIds = new Set<string>([
      ...Object.keys(stats.abilities),
      ...Object.values(pokemon.abilities).map(toID),
    ]);

    const abilityEntries = Array.from(abilityIds).map((abilityId) => {
      const usage = stats.abilities[abilityId] ?? 0.01;
      let score = usage;
      if (options.template?.requiredAbilities && !options.teamAbilities?.has(abilityId)) {
        const required = options.template.requiredAbilities.map(toID);
        if (required.includes(abilityId)) score += 2;
      }
      if (options.template?.preferredAbilities) {
        const preferred = options.template.preferredAbilities.map(toID);
        if (preferred.includes(abilityId)) score += 0.5;
      }
      return [abilityId, score] as [string, number];
    });

    abilityEntries.sort((a, b) => b[1] - a[1]);
    const abilityId = abilityEntries[0]?.[0];
    if (!abilityId) return Object.values(pokemon.abilities)[0] || "No Ability";
    return Abilities[abilityId]?.name || abilityId;
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
        Math.max(count * 2, 6)
      );

      for (const moveName of fallbackMoves) {
        const moveId = toID(moveName);
        if (seen.has(moveId)) continue;
        seen.add(moveId);
        chosen.push(moveName);
        if (chosen.length >= count) break;
      }
    }

    return chosen.slice(0, count);
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
    const fallbackMoves = this.selectCompetitiveFallbackMoves(pokemon, 4);
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

  private selectCompetitiveFallbackMoves(
    pokemon: PokemonSpecies,
    count: number
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
          prefersOffense
        ),
      }))
      .sort((a, b) => b.score - a.score);

    const chosen: string[] = [];
    const seen = new Set<string>();
    let attackCount = 0;
    let statusCount = 0;
    let hasSleepEnabler = false;

    for (const { move, moveId, score } of scoredMoves) {
      if (seen.has(moveId) || chosen.length >= count) continue;
      if (score < 0) continue;

      const isAttack = move.category !== "Status";
      if (!isAttack && statusCount >= 1 && attackCount < 2) continue;
      if (!isAttack && statusCount >= 2) continue;

      chosen.push(move.name);
      seen.add(moveId);
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
    move: { name: string; category: string; type?: string; basePower?: number },
    pokemon: PokemonSpecies,
    preferredCategory: "Physical" | "Special",
    isFastAttacker: boolean,
    bulk: number,
    prefersOffense: boolean
  ) {
    const moveId = toID(move.name);
    const isStatus = move.category === "Status";
    const isStab = move.type ? pokemon.types.includes(move.type) : false;
    const basePower = typeof move.basePower === "number" ? move.basePower : 0;
    const isPreferredAttackCategory = move.category === preferredCategory;

    if (FALLBACK_DISALLOWED_MOVE_IDS.has(moveId)) {
      return -100;
    }

    let score = 0;

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
      if (prefersOffense && basePower >= 80) {
        score += 8;
      }
      if (!prefersOffense && isStab) {
        score += 5;
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
      if (moveId === "protect") {
        score += bulk >= 250 ? 10 : 4;
      }
      if (FALLBACK_SLEEP_ENABLER_IDS.has(moveId)) {
        score += 6;
      }
      if (moveId === "dreameater") {
        score -= 40;
      }
    }

    if (moveId === "dreameater") {
      score -= 40;
    }

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
    const matchesMove = (moveNames: string[]) =>
      moveNames.some((moveName) => toID(moveName) === moveId);

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
        if (isDoubles && moveId === toID("Protect") && maxOffense >= 100) return 0.25;
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
        if (teamMoves.has(toID("Trick Room")) && moveId === toID("Protect")) return 0.35;
        return 0;
      case "tailwind":
        if (!teamMoves.has(toID("Tailwind")) && moveId === toID("Tailwind")) return 2.4;
        if (
          matchesMove([
            "Protect",
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
}

function maxStat(spread: NormalizedMonData["spreads"][number]) {
  return Math.max(spread.evs[1] ?? 0, spread.evs[3] ?? 0);
}

function bulkStat(spread: NormalizedMonData["spreads"][number]) {
  return (spread.evs[0] ?? 0) + (spread.evs[2] ?? 0) + (spread.evs[4] ?? 0);
}
