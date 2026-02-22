/**
 * Recommended Items — Assigns competitively viable items to Pokémon
 *
 * Uses Smogon sets data (gen9-sets.json from pkmn.github.io/smogon)
 * to look up the recommended item for a Pokémon in a given format.
 * Falls back to a stat-based heuristic for Pokémon without Smogon sets.
 */

import setsData from '@/data/gen9-sets.json';
import pokedexData from '@/data/pokedex.json';

const sets: Record<string, any> = setsData;
const pokedex: Record<string, any> = pokedexData;

/**
 * Resolves the display name of a Pokémon to match Smogon sets data keys.
 * Smogon uses display names like "Venusaur", "Charizard", "Ninetales-Alola"
 */
function toSmogonName(pokemonName: string): string {
    // The pokedex data uses lowercase IDs but the sets data uses display names
    // Try the name as-is first (it should already be display name from getPokemonData)
    return pokemonName;
}

/**
 * Picks a random element from an array or returns the single value.
 * Smogon data sometimes has arrays of items and sometimes a single string.
 */
function pickRandom<T>(value: T | T[]): T {
    if (Array.isArray(value)) {
        return value[Math.floor(Math.random() * value.length)];
    }
    return value;
}

/**
 * Gets the recommended item for a Pokémon from Smogon competitive sets.
 *
 * @param pokemonName - Display name of the Pokémon (e.g., "Dragonite")
 * @param formatTier - Smogon tier key (e.g., "ou", "uu", "vgc2025")
 * @returns The recommended item name, or a stat-based fallback
 */
export function getRecommendedItem(
    pokemonName: string,
    formatTier: string = 'ou'
): string {
    const smogonName = toSmogonName(pokemonName);
    const pokemonSets = sets[smogonName];

    if (pokemonSets) {
        // Try the exact format tier first
        const tierSets = pokemonSets[formatTier];
        if (tierSets) {
            // Pick the first set and get its item
            const firstSetName = Object.keys(tierSets)[0];
            if (firstSetName && tierSets[firstSetName]?.item) {
                return pickRandom(tierSets[firstSetName].item);
            }
        }

        // Fallback: try any tier available for this Pokémon
        const availableTiers = Object.keys(pokemonSets);
        // Prefer common competitive tiers in order
        const preferredOrder = ['ou', 'uu', 'ru', 'nu', 'pu', 'zu', 'ubers',
            'monotype', 'doublesou', 'vgc2025', 'vgc2024', 'lc', 'nfe',
            'battlestadiumsingles', 'nationaldex'];

        for (const tier of preferredOrder) {
            if (availableTiers.includes(tier)) {
                const tierData = pokemonSets[tier];
                const firstSet = Object.keys(tierData)[0];
                if (firstSet && tierData[firstSet]?.item) {
                    return pickRandom(tierData[firstSet].item);
                }
            }
        }

        // Last resort: use whichever tier is available
        if (availableTiers.length > 0) {
            const anyTier = pokemonSets[availableTiers[0]];
            const firstSet = Object.keys(anyTier)[0];
            if (firstSet && anyTier[firstSet]?.item) {
                return pickRandom(anyTier[firstSet].item);
            }
        }
    }

    // Stat-based fallback for Pokémon not in Smogon sets
    return getStatBasedItem(pokemonName);
}

/**
 * Gets a complete recommended set (item, nature, ability, EVs) for a Pokémon.
 * Returns null if no Smogon set is found.
 */
export function getRecommendedSet(
    pokemonName: string,
    formatTier: string = 'ou'
): { item: string; nature?: string; ability?: string; evs?: Record<string, number> } | null {
    const smogonName = toSmogonName(pokemonName);
    const pokemonSets = sets[smogonName];

    if (!pokemonSets) return null;

    // Try exact tier, then fallback tiers
    const tiersToTry = [formatTier, 'ou', 'uu', 'ru', 'nu', 'pu', 'zu', 'ubers', 'monotype'];

    for (const tier of tiersToTry) {
        const tierSets = pokemonSets[tier];
        if (tierSets) {
            const setNames = Object.keys(tierSets);
            // Pick a random set from the tier for variety
            const setName = setNames[Math.floor(Math.random() * setNames.length)];
            const set = tierSets[setName];

            if (set) {
                return {
                    item: pickRandom(set.item),
                    nature: set.nature ? pickRandom(set.nature) : undefined,
                    ability: set.ability ? pickRandom(set.ability) : undefined,
                    evs: set.evs ? (Array.isArray(set.evs) ? pickRandom(set.evs) : set.evs) : undefined,
                };
            }
        }
    }

    return null;
}

/**
 * Fallback: assigns an item based on the Pokémon's stat distribution.
 */
function getStatBasedItem(pokemonName: string): string {
    const id = pokemonName.toLowerCase().replace(/[^a-z0-9]/g, '');
    const data = pokedex[id];

    if (!data?.baseStats) {
        return 'Leftovers'; // Safe default
    }

    const { hp, atk, def: defense, spa, spd, spe } = data.baseStats;
    const totalBulk = hp + defense + spd;
    const totalOffense = Math.max(atk, spa);

    // Fast and offensive
    if (spe >= 100 && totalOffense >= 100) {
        if (atk > spa) {
            return spe >= 110 ? 'Choice Scarf' : 'Choice Band';
        } else {
            return spe >= 110 ? 'Choice Scarf' : 'Choice Specs';
        }
    }

    // Very bulky
    if (totalBulk >= 300) {
        return 'Leftovers';
    }

    // Strong but slow
    if (totalOffense >= 110 && spe < 80) {
        return atk > spa ? 'Choice Band' : 'Choice Specs';
    }

    // Mixed attacker
    if (atk >= 80 && spa >= 80) {
        return 'Life Orb';
    }

    // NFE / LC Pokémon
    if (data.evos) {
        return 'Eviolite';
    }

    // Focus Sash for frail Pokémon
    if (hp + defense < 150) {
        return 'Focus Sash';
    }

    // Default
    return 'Leftovers';
}
