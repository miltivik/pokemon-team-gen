import { NormalizedSmogonData, NormalizedMonData } from '../data-sources/smogon';
import { PokemonSpecies } from '../data-sources/dex';
import { toID } from '../utils';
import itemsData from '../../data/items.json';
import abilitiesData from '../../data/abilities.json';
import movesData from '../../data/moves.json';
import { Template } from '@/config/templates';

const Items = itemsData as Record<string, { name: string }>;
const Abilities = abilitiesData as Record<string, { name: string }>;
const Moves = movesData as Record<string, { name: string }>;

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

interface OptimizerOptions {
    template?: Template;
    teamMoves?: Set<string>;
    teamAbilities?: Set<string>;
}

export class SetOptimizer {

  private data: NormalizedSmogonData;

  constructor(data: NormalizedSmogonData) {
    this.data = data;
  }

  public optimize(pokemon: PokemonSpecies, teamContext: PokemonSpecies[] = [], options: OptimizerOptions = {}): OptimizedSet {
    const stats = this.data.pokemon[toID(pokemon.name)];

    // If no stats, return a blank template
    if (!stats) {
      return this.generateBlankSet(pokemon);
    }

    return {
      species: pokemon.name,
      ability: this.selectAbility(stats, options),
      item: this.selectItem(stats),
      ...this.selectSpread(stats),
      moves: this.selectMoves(stats, 4, options),
      teraType: this.selectTeraType(stats)
    };
  }

  private selectAbility(stats: NormalizedMonData, options: OptimizerOptions): string {
    const abilitiesEntries = Object.entries(stats.abilities).map(([name, usage]) => {
        let score = usage;
        if (options.template?.requiredAbilities && !options.teamAbilities?.has(name)) {
            const req = options.template.requiredAbilities.map(toID);
            if (req.includes(name)) score += 2.0; // Force if required
        }
        if (options.template?.preferredAbilities) {
            const pref = options.template.preferredAbilities.map(toID);
            if (pref.includes(name)) score += 0.5; // Boost if preferred
        }
        return [name, score] as [string, number];
    });

    abilitiesEntries.sort((a, b) => b[1] - a[1]);
    if (abilitiesEntries.length === 0) return 'No Ability';

    const topAbility = abilitiesEntries[0][0];
    const abilityData = Abilities[toID(topAbility)];
    return abilityData ? abilityData.name : topAbility;
  }

  private selectItem(stats: NormalizedMonData): string {
    const items = Object.entries(stats.items).sort((a, b) => b[1] - a[1]);
    if (items.length === 0) return 'Leftovers';

    const topItem = items[0][0];
    const itemData = Items[toID(topItem)];
    return itemData ? itemData.name : topItem;
  }

  private selectTeraType(stats: NormalizedMonData): string | undefined {
    if (!stats.teraTypes) return undefined;
    const types = Object.entries(stats.teraTypes).sort((a, b) => b[1] - a[1]);
    if (types.length === 0) return undefined;
    return types[0][0];
  }

  private selectMoves(stats: NormalizedMonData, count: number, options: OptimizerOptions): string[] {
    const movesEntries = Object.entries(stats.moves).map(([name, usage]) => {
        let score = usage;
        if (options.template?.requiredMoves && !options.teamMoves?.has(name)) {
            const req = options.template.requiredMoves.map(toID);
            if (req.includes(name)) score += 2.0; // Force if required
        }
        if (options.template?.preferredMoves) {
            const pref = options.template.preferredMoves.map(toID);
            if (pref.includes(name)) score += 0.5; // Boost if preferred
        }
        return [name, score] as [string, number];
    });

    movesEntries.sort((a, b) => b[1] - a[1]);

    const moves = movesEntries
        .map(entry => {
            const rawMove = entry[0];
            const moveData = Moves[toID(rawMove)];
            return moveData ? moveData.name : rawMove;
        });

    // Filter out '' or invalid moves if necessary
    return moves.slice(0, count);
  }

  private selectSpread(stats: NormalizedMonData): { nature: string, evs: OptimizedSet['evs'] } {
    // Spreads are already sorted by usage in normalization
    if (stats.spreads && stats.spreads.length > 0) {
      const top = stats.spreads[0];
      return {
        nature: top.nature,
        evs: {
          hp: top.evs[0],
          atk: top.evs[1],
          def: top.evs[2],
          spa: top.evs[3],
          spd: top.evs[4],
          spe: top.evs[5]
        }
      };
    }

    // Fallback spread
    return {
      nature: 'Serious',
      evs: { hp: 0, atk: 0, def: 0, spa: 0, spd: 0, spe: 0 }
    };
  }

  private generateBlankSet(pokemon: PokemonSpecies): OptimizedSet {
    return {
      species: pokemon.name,
      ability: Object.values(pokemon.abilities)[0] || 'No Ability',
      item: 'Leftovers',
      nature: 'Serious',
      evs: { hp: 0, atk: 0, def: 0, spa: 0, spd: 0, spe: 0 },
      moves: []
    };
  }
}
