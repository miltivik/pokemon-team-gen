import { NormalizedSmogonData, NormalizedMonData } from '../data-sources/smogon';
import { PokemonSpecies } from '../data-sources/dex';
import { toID } from '../utils';
import itemsData from '../../data/items.json';
import abilitiesData from '../../data/abilities.json';
import movesData from '../../data/moves.json';
import { Template } from '@/config/templates';

const Items = itemsData as Record<string, { name: string }>;
const Abilities = abilitiesData as Record<string, { name: string }>;
const Moves = movesData as Record<string, { name: string, category: string }>;

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
  private cache: Map<string, OptimizedSet> = new Map();

  constructor(data: NormalizedSmogonData) {
    this.data = data;
  }

  public clearCache() {
    this.cache.clear();
  }

  public optimize(pokemon: PokemonSpecies, teamContext: PokemonSpecies[] = [], options: OptimizerOptions = {}): OptimizedSet {
    const stats = this.data.pokemon[toID(pokemon.name)];

    // If no stats, return a blank template
    if (!stats) {
      return this.generateBlankSet(pokemon);
    }

    // Cache key based on pokemon and context
    const contextKey = options.template?.label || 'none';
    const cacheKey = `${toID(pokemon.name)}-${contextKey}`;

    if (this.cache.has(cacheKey)) {
      return this.cache.get(cacheKey)!;
    }

    const result = {
      species: pokemon.name,
      ability: this.selectAbility(stats, options),
      item: this.selectItem(stats),
      ...this.selectSpread(stats),
      teraType: this.selectTeraType(stats),
      moves: [] as string[] // Will be populated next using the set context
    };

    result.moves = this.selectMoves(stats, 4, result, options);

    this.cache.set(cacheKey, result);
    return result;
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

  private selectMoves(stats: NormalizedMonData, count: number, currentSet: OptimizedSet, options: OptimizerOptions): string[] {
    const isChoiceBand = currentSet.item === "Choice Band";
    const isChoiceSpecs = currentSet.item === "Choice Specs";
    const isAssaultVest = currentSet.item === "Assault Vest";
    const isChoiceScarf = currentSet.item === "Choice Scarf";
    const limitsStatus = isChoiceBand || isChoiceSpecs || isChoiceScarf || isAssaultVest;

    // A small whitelist of "status" moves that are technically acceptable on choice items because of switch mechanics
    // e.g., Trick, Switcheroo, Sleep Talk
    const statusWhitelist = ['Trick', 'Switcheroo', 'Sleep Talk', 'Parting Shot', 'Memento', 'Healing Wish'];

    const movesEntries = Object.entries(stats.moves).map(([name, usage]) => {
      let score = usage;
      const moveData = Moves[toID(name)];

      // Set Integrity Validation
      if (moveData) {
        // If we are locked into an attacking item (Assault Vest, Choice Band/Specs/Scarf)
        if (limitsStatus && moveData.category === 'Status' && !statusWhitelist.includes(moveData.name)) {
          // Severely penalize generic status moves like Will-O-Wisp, Toxic, Stealth Rock on Choice sets
          score = score * 0.05;
        }

        // If Banded, penalize Special Attacks (unless it's something hyper niche, but generally we want to avoid it)
        if (isChoiceBand && moveData.category === 'Special') score = score * 0.1;

        // If Specs, penalize Physical Attacks (except maybe U-turn/Flip Turn, but reducing weight helps)
        if (isChoiceSpecs && moveData.category === 'Physical') {
          if (!['U-turn', 'Flip Turn', 'Knock Off'].includes(moveData.name)) {
            score = score * 0.1;
          }
        }
      }

      if (options.template?.requiredMoves && !options.teamMoves?.has(name)) {
        const req = options.template.requiredMoves.map(toID);
        if (req.includes(toID(name))) score += 2.0; // Force if required
      }
      if (options.template?.preferredMoves) {
        const pref = options.template.preferredMoves.map(toID);
        if (pref.includes(toID(name))) score += 0.5; // Boost if preferred
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
      moves: [] as string[]
    };
  }
}
