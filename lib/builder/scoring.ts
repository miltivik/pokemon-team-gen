import { NormalizedSmogonData, NormalizedMonData } from '../data-sources/smogon';
import { DexProvider, PokemonSpecies } from '../data-sources/dex';
import { getEffectiveness } from '../type-chart';
import { toID } from '../utils';
import { Template } from '@/config/templates';

interface ScoredCandidate {
  species: PokemonSpecies;
  score: number;
  details: {
    usage: number;
    synergy: number;
    coverage: number;
    consistency: number;
    templateSynergy?: number;
  };
}

interface ScoringOptions {
    excludeLegendaries?: boolean;
    requiredType?: string | null;
    template?: Template;
    getTeamMoves?: () => Set<string>;
    getTeamAbilities?: () => Set<string>;
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
    const teamResistances = this.analyzeTeamResistances(currentTeam);

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

      if (this.options.excludeLegendaries) {
        const isLegendary = species.tags?.some(t => t.includes('Legendary') || t.includes('Mythical')) ||
                            ['Uber', 'AG'].includes(species.tier || '');
        if (isLegendary) continue;
      }

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

    // Weights
    const W_USAGE = 0.3;
    const W_SYNERGY = 0.45; // High weight on real data
    const W_COVERAGE = 0.2;
    const W_CONSISTENCY = 0.05;
    const W_TEMPLATE = 0.5; // Significant boost for template requirements

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
        // Look up candidate in member's teammates OR member in candidate's teammates
        // Chaos data usually has mutual counts, but normalized we stored relative weights
        // We'll use the candidate's teammate entry for the team member if available
        const correlation = stats.teammates[memberId] || 0;

        // Normalize correlation roughly (max weight is variable, usually < 0.1 for specific pairings)
        // We cap it at some reasonable value derived from the data distribution
        synergySum += Math.min(1, correlation * 10);
      }
      synergyScore = synergySum / team.length;
    } else {
      synergyScore = usageScore; // First pick depends mostly on usage
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

        let moveSynergy = 0;

        if (t.requiredMoves) {
            for (const move of t.requiredMoves) {
                const moveId = toID(move);
                // If team doesn't have it yet, highly value a pokemon that learns it
                if (!currentMoves.has(moveId) && stats.moves[moveId]) {
                    // stats.moves[moveId] represents the frequency.
                    // Even if low frequency, if they learn it, we give a massive boost
                    moveSynergy += 2.0;
                }
            }
        }
        if (t.preferredMoves) {
            for (const move of t.preferredMoves) {
                const moveId = toID(move);
                if (stats.moves[moveId]) {
                    moveSynergy += (stats.moves[moveId] * 1.5);
                }
            }
        }
        if (t.requiredAbilities) {
            for (const ability of t.requiredAbilities) {
                const abilityId = toID(ability);
                if (!currentAbilities.has(abilityId) && stats.abilities[abilityId]) {
                    moveSynergy += 2.0;
                }
            }
        }
        if (t.preferredAbilities) {
            for (const ability of t.preferredAbilities) {
                const abilityId = toID(ability);
                if (stats.abilities[abilityId]) {
                    moveSynergy += (stats.abilities[abilityId] * 1.5);
                }
            }
        }

        templateScore = Math.min(1, moveSynergy);
    }

    // Final Calculation
    const totalScore =
      (usageScore * W_USAGE) +
      (synergyScore * W_SYNERGY) +
      (normCoverage * W_COVERAGE) +
      (consistencyScore * W_CONSISTENCY) +
      (templateScore * W_TEMPLATE);

    return {
      species: candidate,
      score: totalScore,
      details: {
        usage: usageScore,
        synergy: synergyScore,
        coverage: normCoverage,
        consistency: consistencyScore,
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

  private analyzeTeamResistances(team: PokemonSpecies[]) {
      // Helper for future expansion
      return {};
  }
}
