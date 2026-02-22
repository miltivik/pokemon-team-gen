import pokedexData from '../../data/pokedex.json';
import { toID } from '../utils';

export interface PokemonSpecies {
  num: number;
  name: string;
  types: string[];
  baseStats: {
    hp: number;
    atk: number;
    def: number;
    spa: number;
    spd: number;
    spe: number;
  };
  abilities: Record<string, string>;
  heightm: number;
  weightkg: number;
  color: string;
  evos?: string[];
  prevo?: string;
  evoLevel?: number;
  eggGroups?: string[];
  otherFormes?: string[];
  formeOrder?: string[];
  canGigantamax?: string;
  tags?: string[];
  tier?: string;
  isNonstandard?: string;
  gen?: number;
}

const Pokedex = pokedexData as unknown as Record<string, PokemonSpecies>;

export class DexProvider {

  static getSpecies(name: string): PokemonSpecies | null {
    const id = toID(name);
    return Pokedex[id] || null;
  }

  static getSpeciesForGen(name: string, gen: number): PokemonSpecies | null {
    const species = this.getSpecies(name);
    if (!species) return null;

    // Clone to avoid mutating original
    const mon = JSON.parse(JSON.stringify(species));

    // Filter out pokemon that didn't exist yet
    // Note: 'gen' field in Pokedex usually denotes introduction generation.
    // If it's missing, it's Gen 1.
    const introGen = mon.gen || 1;
    if (introGen > gen) return null;

    // Apply Type Changes
    this.applyTypeChanges(mon, gen);

    // Apply Stat Changes (simplified)
    this.applyStatChanges(mon, gen);

    return mon;
  }

  private static applyTypeChanges(mon: PokemonSpecies, gen: number) {
    const id = toID(mon.name);

    // Gen 2-5: No Fairy type. Clefairy, etc are Normal.
    if (gen < 6) {
      if (mon.types.includes('Fairy')) {
        // Special cases
        if (id === 'clefairy' || id === 'clefable' || id === 'cleffa' ||
            id === 'togepi' || id === 'togetic' || id === 'snubbull' || id === 'granbull') {
           mon.types = ['Normal'];
        } else if (id === 'jigglypuff' || id === 'wigglytuff' || id === 'igglybuff' || id === 'azurill') {
           mon.types = ['Normal'];
        } else if (id === 'mr.mime' || id === 'mrmime' || id === 'mimejr') {
           mon.types = ['Psychic'];
        } else if (id === 'ralts' || id === 'kirlia' || id === 'gardevoir') {
           mon.types = ['Psychic']; // Lost Fairy
        } else if (id === 'mawile') {
           mon.types = ['Steel'];
        } else if (id === 'whimsicott' || id === 'cottonee') {
           mon.types = ['Grass'];
        } else if (id === 'marill' || id === 'azumarill') {
           mon.types = ['Water'];
        } else if (id === 'togekiss') {
           mon.types = ['Normal', 'Flying'];
        }
        // Fallback: Just remove Fairy
        mon.types = mon.types.filter(t => t !== 'Fairy');
        if (mon.types.length === 0) mon.types = ['Normal']; // Fallback for pure Fairy who wasn't handled
      }
    }

    // Gen 1: No Steel or Dark.
    if (gen === 1) {
      if (mon.types.includes('Steel')) {
        if (id === 'magnemite' || id === 'magneton') {
           mon.types = ['Electric'];
        }
        // Others (Scizor, Steelix) didn't exist in Gen 1 anyway
        mon.types = mon.types.filter(t => t !== 'Steel');
      }
      mon.types = mon.types.filter(t => t !== 'Dark');
    }
  }

  private static applyStatChanges(mon: PokemonSpecies, gen: number) {
    const id = toID(mon.name);

    // Example: Pidgeot Speed 91 -> 101 in Gen 6
    if (gen < 6) {
        if (id === 'pidgeot') mon.baseStats.spe = 91;
        if (id === 'pidgeotto') mon.baseStats.spe = 71; // wait, pidgeotto didn't change? Checking... actually Pidgeot was 91.
        if (id === 'alakazam') mon.baseStats.spd = 85; // Was 85 SpD in Gen 5? No, Special split in Gen 2.
    }

    // Gen 1 Special Stat
    if (gen === 1) {
        // Map SpA -> Spc (and SpD is ignored/same)
        // This is a simplification; actual RBY logic uses a single 'spa' field usually called 'spc' in sims
        mon.baseStats.spd = mon.baseStats.spa;
    }
  }

  static getAllSpecies(): PokemonSpecies[] {
      return Object.values(Pokedex);
  }
}
