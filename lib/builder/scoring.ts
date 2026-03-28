import { NormalizedSmogonData, NormalizedMonData } from '../data-sources/smogon';
import { DexProvider, PokemonSpecies } from '../data-sources/dex';
import { getEffectiveness } from '../type-chart';
import { toID } from '../utils';
import { Template } from '@/config/templates';
import { Role } from '../showdown-data';
import { isLegendaryOrParadoxSpecies } from '@/lib/pokemon-classification';
import { FORMATS, FormatId } from '@/config/formats';
import type { SetBundle } from './set-optimizer';
import {
  countAvailableMoves,
  DOUBLES_SUPPORT_MOVES,
  getCandidateAbilityIds,
  getCandidateStatProfile,
  getTemplateId,
  HAZARD_MOVES,
  hasAvailableMove,
  hasAnyType,
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
  teamHasAnyAbility,
  teamHasAnyMove,
  VOLTTURN_ABILITY_IDS,
  WEATHER_FLEX_MOVES,
  WEATHER_SETTER_ABILITY_IDS,
} from './template-heuristics';

interface ScoredCandidate {
  species: PokemonSpecies;
  score: number;
  details: {
    usage: number;
    synergy: number;
    coverage: number;
    consistency: number;
    setCoherence?: number;
    templateSynergy?: number;
  };
}

interface ScoringOptions {
  excludeLegendaries?: boolean;
  requiredType?: string | null;
  template?: Template;
  getTeamMoves?: () => Set<string>;
  getTeamAbilities?: () => Set<string>;
  getTeamRoles?: () => Role[];
  getCandidateRole?: (candidate: PokemonSpecies, currentTeam: PokemonSpecies[]) => Role;
  getCandidateBundle?: (candidate: PokemonSpecies, currentTeam: PokemonSpecies[]) => SetBundle;
}

export class WeightedScoringEngine {

  private gen: number;
  private format: string;
  private data: NormalizedSmogonData;
  private options: ScoringOptions;

  constructor(format: string, gen: number, data: NormalizedSmogonData, options: ScoringOptions = {}) {
    this.format = format;
    this.gen = gen;
    this.data = data;
    this.options = options;
  }

  public suggestMembers(currentTeam: PokemonSpecies[], limit: number = 10): ScoredCandidate[] {
    const candidates = this.getCandidates(currentTeam);
    const scored: ScoredCandidate[] = [];

    // Analyze current team state
    const teamWeaknesses = this.analyzeTeamWeaknesses(currentTeam);
    for (const candidate of candidates) {
      const stats = this.data.pokemon[toID(candidate.name)];
      if (!stats) continue;

      const score = this.calculateScore(candidate, stats, currentTeam, teamWeaknesses);
      scored.push(score);
    }

    return scored.sort((a, b) => b.score - a.score).slice(0, limit);
  }

  private getCandidates(currentTeam: PokemonSpecies[]): PokemonSpecies[] {
    const currentIds = new Set(currentTeam.map(p => toID(p.name)));
    const validMons: PokemonSpecies[] = [];

    for (const [id, stats] of Object.entries(this.data.pokemon)) {
      if (currentIds.has(id)) continue; // Species Clause
      if (stats.usageRate < 0.005) continue; // Filter irrelevants (<0.5%)

      const species = DexProvider.getSpeciesForGen(stats.name, this.gen);
      if (!species) continue;

      if (this.options.excludeLegendaries && isLegendaryOrParadoxSpecies(species.name)) continue;

      if (this.options.requiredType) {
        // Normalize type names for comparison (e.g. 'dark' to 'Dark')
        const reqType = this.options.requiredType.toLowerCase();
        const hasType = species.types.some(t => t.toLowerCase() === reqType);
        if (!hasType) continue;
      }

      validMons.push(species);
    }
    return validMons;
  }

  private calculateScore(
    candidate: PokemonSpecies,
    stats: NormalizedMonData,
    team: PokemonSpecies[],
    teamWeaknesses: Record<string, number>
  ): ScoredCandidate {
    const isDoubles = FORMATS[this.format as FormatId]?.gameType === 'doubles';
    const templateId = getTemplateId(this.options.template);
    const { bulk, maxOffense, speed } = getCandidateStatProfile(candidate);
    const bundle = this.options.getCandidateBundle?.(candidate, team);
    const bundleMoveIds = new Set(bundle?.moves.map((move) => toID(move)) ?? []);
    const bundleAbilityId = bundle ? toID(bundle.ability) : null;
    const bundleCoherenceScore = bundle?.coherenceScore ?? 0.5;

    // Weights
    let W_USAGE = 0.24;
    const W_SYNERGY = 0.34;
    const W_COVERAGE = 0.16;
    const W_CONSISTENCY = 0.06;
    let W_TEMPLATE = 0.34;
    const W_ROLE = 0.24;
    const W_SET = 0.32;

    if (this.options.template?.label.includes('Stall')) {
      W_USAGE = 0.1; // Stall relies less on standard usage staples
      W_TEMPLATE = 0.55;
    }

    // 1. Usage Score (0 to 1)
    // Logarithmic scaling to avoid over-centralizing on top 1
    const usageScore = Math.min(1, Math.log10(stats.usageRate * 100 + 1) / 2);

    // 2. Synergy Score (0 to 1)
    // Mean correlation with existing team members
    let synergyScore = 0;
    if (team.length > 0) {
      let synergySum = 0;
      for (const member of team) {
        const memberId = toID(member.name);
        const memberStats = this.data.pokemon[memberId];
        const jointWeight = Math.max(
          stats.teammates[memberId] || 0,
          memberStats?.teammates[toID(candidate.name)] || 0
        );
        const expectedWeight = Math.max(
          0.0001,
          (stats.usageRate || 0.005) *
            (memberStats?.usageRate || 0.005) *
            this.data.meta.totalBattles
        );
        const lift = jointWeight > 0 ? jointWeight / expectedWeight : 0;
        const affinity = jointWeight > 0 ? Math.min(1, Math.log2(lift + 1) / 2) : 0;
        synergySum += affinity;
      }
      synergyScore = synergySum / team.length;
    } else {
      const leadUsage = this.data.meta.leadData[toID(candidate.name)] ?? 0;
      synergyScore = Math.max(usageScore, Math.min(1, leadUsage * 3));
    }

    // 3. Coverage Score (Defensive)
    // Does this mon resist the team's aggregated weaknesses?
    let coverageScore = 0;
    let weaknessCount = 0;

    for (const [type, count] of Object.entries(teamWeaknesses)) {
      if (count > 0) { // Team is weak to this
        const eff = getEffectiveness(type, candidate.types);
        if (eff < 1) { // Resists
          coverageScore += 1;
        } else if (eff > 1) { // Also weak -> Penalty
          coverageScore -= 0.5;
        }
        weaknessCount++;
      }
    }
    const normCoverage = weaknessCount > 0 ? Math.max(0, coverageScore / weaknessCount) : 0.5;

    // 4. Consistency (Base Stats Total / Viability)
    // Simple heuristic: higher BST is generally safer
    const bst = Object.values(candidate.baseStats).reduce((a, b) => a + b, 0);
    const consistencyScore = Math.min(1, bst / 700);

    // 5. Template Synergy Score
    let templateScore = 0;
    if (this.options.template) {
      const t = this.options.template;
      const currentMoves = this.options.getTeamMoves ? this.options.getTeamMoves() : new Set<string>();
      const currentAbilities = this.options.getTeamAbilities ? this.options.getTeamAbilities() : new Set<string>();
      const currentRoles = this.options.getTeamRoles ? this.options.getTeamRoles() : [];
      const candidateAbilityIds = getCandidateAbilityIds(candidate, stats);
      const hasPreferredAbility = (t.preferredAbilities ?? []).some((ability) =>
        bundleAbilityId ? bundleAbilityId === toID(ability) : candidateAbilityIds.has(toID(ability))
      );
      const bundleHasMove = (moveName: string) =>
        bundle ? bundleMoveIds.has(toID(moveName)) : hasAvailableMove(candidate, stats, moveName);
      const bundleMoveCount = (moveNames: string[]) =>
        bundle
          ? moveNames.reduce(
            (count, moveName) => count + (bundleMoveIds.has(toID(moveName)) ? 1 : 0),
            0
          )
          : countAvailableMoves(candidate, stats, moveNames);

      let moveSynergy = 0;

      if (t.requiredMoves) {
        for (const move of t.requiredMoves) {
          const moveId = toID(move);
          if (!currentMoves.has(moveId) && bundleHasMove(move)) {
            moveSynergy += 4.0;
          }
        }
      }
      if (t.preferredMoves) {
        for (const move of t.preferredMoves) {
          const moveId = toID(move);
          if (bundleHasMove(move)) {
            moveSynergy += ((stats.moves[moveId] ?? 0.05) * 1.5);
          }
        }
      }
      if (t.requiredAbilities) {
        for (const ability of t.requiredAbilities) {
          const abilityId = toID(ability);
          if (
            !currentAbilities.has(abilityId) &&
            (bundleAbilityId ? bundleAbilityId === abilityId : candidateAbilityIds.has(abilityId))
          ) {
            moveSynergy += 4.0;
          }
        }
      }
      if (t.preferredAbilities) {
        for (const ability of t.preferredAbilities) {
          const abilityId = toID(ability);
          if (bundleAbilityId ? bundleAbilityId === abilityId : candidateAbilityIds.has(abilityId)) {
            moveSynergy += ((stats.abilities[abilityId] ?? 0.05) * 1.5);
          }
        }
      }

      switch (templateId) {
        case "balanced":
          if (!isDoubles && !teamHasAnyMove(currentMoves, HAZARD_MOVES)) {
            moveSynergy += bundleMoveCount(HAZARD_MOVES) > 0 ? 0.7 : 0;
          }
          if (!isDoubles && !teamHasAnyMove(currentMoves, REMOVAL_MOVES)) {
            moveSynergy += bundleMoveCount(REMOVAL_MOVES) > 0 ? 0.7 : 0;
          }
          if (bundleMoveCount(PIVOT_MOVES) > 0) {
            moveSynergy += 0.35;
          }
          if (bundleMoveCount(RECOVERY_MOVES) > 0 && bulk >= 270) {
            moveSynergy += 0.35;
          }
          if (isDoubles && bundleMoveCount(DOUBLES_SUPPORT_MOVES) > 0) {
            moveSynergy += 0.45;
          }
          if (
            isDoubles &&
            bundleMoveCount([
              "Icy Wind",
              "Electroweb",
              "Thunder Wave",
              "Tailwind",
              "Trick Room",
            ]) > 0
          ) {
            moveSynergy += 0.8;
          }
          if (
            isDoubles &&
            bundleMoveCount([
              "Volt Switch",
              "U-turn",
              "Flip Turn",
              "Parting Shot",
              "Rage Powder",
              "Follow Me",
              "Fake Out",
            ]) > 0
          ) {
            moveSynergy += 0.6;
          }
          break;
        case "offense":
          if (bundleMoveCount(SETUP_MOVES) > 0) {
            moveSynergy += 1.1;
          }
          if (speed >= 95 && maxOffense >= 100) {
            moveSynergy += 1.0;
          }
          if (!isDoubles && team.length === 0 && bundleMoveCount(LEAD_PRESSURE_MOVES) > 0) {
            moveSynergy += 0.9;
          }
          if (isDoubles && bundleHasMove("Protect") && maxOffense >= 100) {
            moveSynergy += 0.35;
          }
          if (bulk >= 320 && maxOffense < 90 && bundleMoveCount(PIVOT_MOVES) === 0) {
            moveSynergy -= 0.55;
          }
          break;
        case "bulkyoffense":
          if (maxOffense >= 100 && bulk >= 250) {
            moveSynergy += 0.95;
          }
          if (countAvailableMoves(candidate, stats, PIVOT_MOVES) > 0) {
            moveSynergy += 0.35;
          }
          if (countAvailableMoves(candidate, stats, SETUP_MOVES) > 0) {
            moveSynergy += 0.4;
          }
          if (countAvailableMoves(candidate, stats, RECOVERY_MOVES) > 0) {
            moveSynergy += 0.35;
          }
          if (
            bulk >= 330 &&
            maxOffense < 90 &&
            countAvailableMoves(candidate, stats, PIVOT_MOVES) === 0 &&
            countAvailableMoves(candidate, stats, HAZARD_MOVES) === 0
          ) {
            moveSynergy -= 0.35;
          }
          break;
        case "voltturn": {
          const pivotCount = bundleMoveCount(PIVOT_MOVES);
          const existingPivotMoves = PIVOT_MOVES.filter((moveName) =>
            currentMoves.has(toID(moveName))
          ).length;

          if (pivotCount > 0) {
            moveSynergy += existingPivotMoves < 2 ? 1.35 : 0.9;
          }
          if ([...candidateAbilityIds].some((abilityId) => VOLTTURN_ABILITY_IDS.includes(abilityId))) {
            moveSynergy += 0.45;
          }
          if (bundleMoveCount(["Knock Off", "Taunt", "Stealth Rock"]) > 0) {
            moveSynergy += 0.35;
          }
          if (pivotCount === 0 && bulk >= 320 && maxOffense < 95) {
            moveSynergy -= 0.55;
          }
          break;
        }
        case "hazardstack":
          if (!teamHasAnyMove(currentMoves, ["Stealth Rock"]) && bundleHasMove("Stealth Rock")) {
            moveSynergy += 1.8;
          }
          if (teamHasAnyMove(currentMoves, ["Stealth Rock"]) && bundleMoveCount(STACKING_HAZARD_MOVES) > 0) {
            moveSynergy += 1.15;
          }
          if (teamHasAnyMove(currentMoves, HAZARD_MOVES) && hasAnyType(candidate, ["Ghost"])) {
            moveSynergy += 0.45;
          }
          if (bundleMoveCount(["Knock Off", "Taunt"]) > 0) {
            moveSynergy += 0.35;
          }
          break;
        case "trickroom": {
        const hasTrickRoomSetter = currentMoves.has(toID("Trick Room"));
        const learnsTrickRoom = bundleHasMove("Trick Room");
        const knowsProtect = bundleHasMove("Protect");
        const slowBreaker =
          candidate.baseStats.spe <= 70 &&
          Math.max(candidate.baseStats.atk, candidate.baseStats.spa) >= 100;
        const verySlowBreaker =
          candidate.baseStats.spe <= 55 &&
          Math.max(candidate.baseStats.atk, candidate.baseStats.spa) >= 85;
        const fastMon = candidate.baseStats.spe >= 95;
        const teamHasBreaker = currentRoles.some((role) => role === "Sweeper" || role === "Tank");

          if (!hasTrickRoomSetter) {
            if (learnsTrickRoom) moveSynergy += 2.5;
            if (learnsTrickRoom && candidate.baseStats.spe <= 80) moveSynergy += 0.5;
          if (!learnsTrickRoom && fastMon) moveSynergy -= 0.5;
        } else {
          if (slowBreaker) moveSynergy += 1.8;
          if (verySlowBreaker) moveSynergy += 0.7;
          if (knowsProtect) moveSynergy += 0.2;
          if (learnsTrickRoom) moveSynergy += 0.35;
          if (!teamHasBreaker && slowBreaker) moveSynergy += 0.5;
          if (fastMon) moveSynergy -= 0.85;
        }
          break;
        }
        case "tailwind": {
          const hasTailwindSetter = teamHasAnyMove(currentMoves, ["Tailwind"]);
          const supportCount = bundleMoveCount(DOUBLES_SUPPORT_MOVES);

          if (!hasTailwindSetter) {
            if (bundleHasMove("Tailwind")) {
              moveSynergy += 2.5;
            }
            if (supportCount > 0) {
              moveSynergy += 0.45;
            }
          } else {
            if (maxOffense >= 100 && speed >= 60 && speed <= 110) {
              moveSynergy += 1.0;
            }
            if (bundleHasMove("Protect")) {
              moveSynergy += 0.45;
            }
            if (bundleMoveCount(["Helping Hand", "Icy Wind", "Wide Guard", "Follow Me", "Rage Powder"]) > 0) {
              moveSynergy += 0.35;
            }
            if (bulk >= 330 && maxOffense < 90) {
              moveSynergy -= 0.35;
            }
          }
          break;
        }
        case "rain": {
          const hasRainSetter = teamHasAnyAbility(currentAbilities, ["Drizzle"]);

          if (!hasRainSetter && bundleHasMove("Rain Dance")) {
            moveSynergy += 0.35;
          }
          if (hasRainSetter) {
            if (hasPreferredAbility) {
              moveSynergy += 1.15;
            }
            if (hasAnyType(candidate, ["Water", "Flying", "Electric", "Steel"])) {
              moveSynergy += 0.45;
            }
            moveSynergy += Math.min(0.8, bundleMoveCount(RAIN_PAYOFF_MOVES) * 0.22);
            if (hasAnyType(candidate, ["Fire"]) && !candidateAbilityIds.has("dryskin")) {
              moveSynergy -= 0.45;
            }
          }
          break;
        }
        case "sun": {
          const hasSunSetter = teamHasAnyAbility(currentAbilities, ["Drought", "Orichalcum Pulse"]);

          if (!hasSunSetter && bundleHasMove("Sunny Day")) {
            moveSynergy += 0.35;
          }
          if (hasSunSetter) {
            if (hasPreferredAbility) {
              moveSynergy += 1.15;
            }
            if (hasAnyType(candidate, ["Fire", "Grass", "Ground"])) {
              moveSynergy += 0.45;
            }
            moveSynergy += Math.min(0.8, bundleMoveCount(SUN_PAYOFF_MOVES) * 0.22);
            if (candidate.types.length === 1 && hasAnyType(candidate, ["Water"]) && !candidateAbilityIds.has("protosynthesis")) {
              moveSynergy -= 0.35;
            }
          }
          break;
        }
        case "sand": {
          const hasSandSetter = teamHasAnyAbility(currentAbilities, ["Sand Stream"]);

          if (!hasSandSetter && bundleHasMove("Sandstorm")) {
            moveSynergy += 0.25;
          }
          if (hasSandSetter) {
            if (hasPreferredAbility) {
              moveSynergy += 1.15;
            }
            if (hasAnyType(candidate, ["Rock", "Ground", "Steel"])) {
              moveSynergy += 0.55;
            }
            moveSynergy += Math.min(0.7, bundleMoveCount(SAND_PAYOFF_MOVES) * 0.2);
          }
          break;
        }
        case "weatheroffense": {
          const hasWeatherSetter = teamHasAnyAbility(currentAbilities, WEATHER_SETTER_ABILITY_IDS);

          if (!hasWeatherSetter && bundleMoveCount(["Rain Dance", "Sunny Day", "Sandstorm", "Snowscape"]) > 0) {
            moveSynergy += 0.25;
          }
          if (hasWeatherSetter) {
            if (hasPreferredAbility) {
              moveSynergy += 1.1;
            }
            if (hasAnyType(candidate, ["Water", "Fire", "Grass", "Ice", "Rock", "Ground", "Steel", "Flying"])) {
              moveSynergy += 0.35;
            }
            moveSynergy += Math.min(0.8, bundleMoveCount(WEATHER_FLEX_MOVES) * 0.22);
          }
          break;
        }
        case "semistall": {
          if (!isDoubles && !teamHasAnyMove(currentMoves, ["Stealth Rock"]) && bundleHasMove("Stealth Rock")) {
            moveSynergy += 0.9;
          }
          if (!isDoubles && !teamHasAnyMove(currentMoves, REMOVAL_MOVES) && bundleMoveCount(REMOVAL_MOVES) > 0) {
            moveSynergy += 0.9;
          }
          moveSynergy += Math.min(1.6, bundleMoveCount([...RECOVERY_MOVES, ...STALL_PAYOFF_MOVES]) * 0.22);
          if (bulk >= 290) {
            moveSynergy += 0.65;
          }
          if (bundleMoveCount(SETUP_MOVES) > 0 && maxOffense >= 95) {
            moveSynergy += 0.55;
          }
          if (speed >= 105 && bulk < 260 && maxOffense >= 110) {
            moveSynergy -= 0.55;
          }
          break;
        }
        case "stall":
          if (!isDoubles && !teamHasAnyMove(currentMoves, ["Stealth Rock"]) && bundleHasMove("Stealth Rock")) {
            moveSynergy += 1.1;
          }
          if (!isDoubles && !teamHasAnyMove(currentMoves, REMOVAL_MOVES) && bundleMoveCount(REMOVAL_MOVES) > 0) {
            moveSynergy += 1.1;
          }
          moveSynergy += Math.min(2.1, bundleMoveCount([...RECOVERY_MOVES, ...STALL_PAYOFF_MOVES, ...HAZARD_MOVES]) * 0.24);
          if (bulk >= 300) {
            moveSynergy += 0.85;
          }
          if (speed >= 100 && maxOffense >= 110 && countAvailableMoves(candidate, stats, RECOVERY_MOVES) === 0) {
            moveSynergy -= 0.9;
          }
          break;
        default:
          break;
      }

      if (t.label.includes('Stall')) {
        templateScore = Math.min(4, moveSynergy);
      } else {
        // High limit allows proper Weather abusers (+Protosynthesis, +Swift Swim) to
        // confidently overtake generic meta staples (Gholdengo, Great Tusk, etc.)
        templateScore = Math.min(4, moveSynergy);
      }
    } // Close `if (this.options.template)` here

    // 6. Role Synergy Score
    let roleScore = 0;
    if (this.options.template && this.options.template.roles) {
      const neededRoles = [...this.options.template.roles];
      const currentRoles = this.options.getTeamRoles ? this.options.getTeamRoles() : [];

      // Remove roles already fulfilled by the team
      for (const memberRole of currentRoles) {
        const index = neededRoles.indexOf(memberRole);
        if (index !== -1) {
          neededRoles.splice(index, 1);
        }
      }

      // Check if candidate fulfills a needed role
      const candidateRole = this.options.getCandidateRole
        ? this.options.getCandidateRole(candidate, team)
        : this.getRoleFromStats(candidate.baseStats);
      const satisfiesRole =
        neededRoles.includes(candidateRole) ||
        (
          this.options.template?.label === "Trick Room" &&
          neededRoles.includes("Sweeper") &&
          candidateRole === "Tank" &&
          candidate.baseStats.spe <= 70
        );

      if (satisfiesRole) {
        roleScore = 1.0;
      } else if (neededRoles.length > 0) {
        roleScore = -0.15;
      }
    }

    // Final Calculation
      const totalScore =
      (usageScore * W_USAGE) +
      (synergyScore * W_SYNERGY) +
      (normCoverage * W_COVERAGE) +
      (consistencyScore * W_CONSISTENCY) +
      (templateScore * W_TEMPLATE) +
      (roleScore * W_ROLE) +
      (bundleCoherenceScore * W_SET);

    return {
      species: candidate,
      score: totalScore,
      details: {
        usage: usageScore,
        synergy: synergyScore,
        coverage: normCoverage,
        consistency: consistencyScore,
        setCoherence: bundleCoherenceScore,
        templateSynergy: templateScore
      }
    };
  }

  private analyzeTeamWeaknesses(team: PokemonSpecies[]): Record<string, number> {
    const weaknesses: Record<string, number> = {};
    const types = ['Normal', 'Fire', 'Water', 'Electric', 'Grass', 'Ice', 'Fighting', 'Poison', 'Ground', 'Flying', 'Psychic', 'Bug', 'Rock', 'Ghost', 'Dragon', 'Steel', 'Dark', 'Fairy'];

    if (team.length === 0) return {};

    for (const type of types) {
      let netWeakness = 0;
      for (const mon of team) {
        const eff = getEffectiveness(type, mon.types);
        if (eff > 1) netWeakness++;
        if (eff < 1) netWeakness--;
      }
      if (netWeakness > 0) {
        weaknesses[type] = netWeakness;
      }
    }
    return weaknesses;
  }
  private getRoleFromStats(baseStats: { hp: number, atk: number, spa: number, def: number, spd: number, spe: number }): Role {
    const { atk, spa, spe, def, spd, hp } = baseStats;
    const bulk = hp + def + spd;
    const offense = atk + spa + spe;

    // Primarily defensive Pokemon
    if (bulk >= 270) {
      if (def >= 110 || spd >= 110) return 'Wall';
      return 'Tank';
    }

    // Fast offenses
    if (spe >= 95 && (atk >= 95 || spa >= 95)) return 'Sweeper';

    // Slow offensive / mixed
    if (offense > bulk) return 'Sweeper'; // Classify slow breakers as sweepers for this builder's sake

    // Default fallback
    return 'Support';
  }
}
