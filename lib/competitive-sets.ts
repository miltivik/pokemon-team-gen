/**
 * Dynamic Competitive Sets — Parses Smogon sets from gen9-sets.json
 *
 * Replaces the old hardcoded 20-Pokémon list with a dynamic parser that
 * covers every Pokémon in Smogon's database across all formats.
 */

import setsData from '@/data/gen9-sets.json';

const sets: Record<string, any> = setsData;

export interface CompetitiveSet {
    pokemon: string;
    setName: string;
    moves: string[];     // Display names like "Knock Off"
    item: string;        // Display name like "Choice Specs"
    ability?: string;
    evs: Record<string, number>;
    nature: string;
    teraType?: string;
}

/**
 * Picks a random element from an array or returns the single value.
 * Smogon data uses arrays for alternatives (e.g. ["Timid", "Modest"]).
 */
function pickRandom<T>(value: T | T[]): T {
    if (Array.isArray(value)) {
        return value[Math.floor(Math.random() * value.length)];
    }
    return value;
}

/** Preferred tier search order when the exact tier has no data. */
const TIER_FALLBACK = [
    'ou', 'uu', 'ru', 'nu', 'pu', 'zu', 'ubers',
    'doublesou', 'vgc2025', 'vgc2024',
    'monotype', 'lc', 'nfe',
    'battlestadiumsingles', 'nationaldex',
    'nationaldexou', 'nationaldexuu', 'nationaldexru',
];

/**
 * Resolves a single move slot from the Smogon data.
 * Move slots can be either a string or an array of alternatives.
 */
function resolveMove(slot: string | string[]): string {
    return pickRandom(slot);
}

/**
 * Gets a competitive set for a Pokémon from the Smogon sets database.
 *
 * @param displayName - The display name of the Pokémon as used in Smogon
 *                      (e.g., "Dragapult", "Great Tusk", "Raichu-Alola")
 * @param formatTier  - The Smogon tier key (e.g., "ou", "uu", "vgc2025")
 * @returns A complete CompetitiveSet, or null if no Smogon data exists.
 */
export function getCompetitiveSet(
    displayName: string,
    formatTier: string = 'ou'
): CompetitiveSet | null {
    const pokemonSets = sets[displayName];
    if (!pokemonSets) return null;

    // Build list of tiers to try: exact match first, then fallbacks
    const tiersToTry = [formatTier, ...TIER_FALLBACK.filter(t => t !== formatTier)];

    for (const tier of tiersToTry) {
        const tierSets = pokemonSets[tier];
        if (!tierSets) continue;

        const setNames = Object.keys(tierSets);
        if (setNames.length === 0) continue;

        // Pick a random set from this tier for variety
        const setName = setNames[Math.floor(Math.random() * setNames.length)];
        const raw = tierSets[setName];
        if (!raw) continue;

        // Resolve move alternatives
        const moves = (raw.moves || []).map(resolveMove);

        // Resolve item, nature, ability (can all be arrays)
        const item = raw.item ? pickRandom(raw.item) : 'Leftovers';
        const nature = raw.nature ? pickRandom(raw.nature) : 'Adamant';
        const ability = raw.ability ? pickRandom(raw.ability) : undefined;

        // Resolve EVs (can be an array of EV spreads)
        const evs = raw.evs ? pickRandom(raw.evs) : { hp: 252, atk: 252, spe: 4 };

        // Resolve Tera Type
        const teraType = raw.teratypes ? pickRandom(raw.teratypes) : undefined;

        return {
            pokemon: displayName,
            setName,
            moves,
            item,
            ability,
            evs,
            nature,
            teraType,
        };
    }

    return null;
}

/**
 * Gets all available roles for a Pokémon in a specific format (and its fallbacks).
 */
export function getAvailableRoles(
    displayName: string,
    formatTier: string = 'ou'
): string[] {
    // Normalize display name to match Smogon data keys (Case sensitive usually, but let's be safe)
    // Smogon keys are usually "Pokemon Name" (capitalized).
    // But sets lookup is direct: sets[displayName].
    // If displayName is "ivysaur", sets["ivysaur"] is undefined.
    // We should try to find the key case-insensitively if direct lookup fails.
    
    let pokemonSets = sets[displayName];
    
    if (!pokemonSets) {
        // Try to find key case-insensitively
        const lowerName = displayName.toLowerCase();
        const foundKey = Object.keys(sets).find(k => k.toLowerCase() === lowerName);
        if (foundKey) {
            pokemonSets = sets[foundKey];
        }
    }

    if (!pokemonSets) return [];

    // Normalize formatTier (strip 'gen9' etc if present)
    const cleanTier = formatTier.replace(/^gen\d+/, '').toLowerCase();
    
    const tiersToTry = [formatTier, cleanTier, ...TIER_FALLBACK.filter(t => t !== formatTier && t !== cleanTier)];

    for (const tier of tiersToTry) {
        const tierSets = pokemonSets[tier];
        if (tierSets && Object.keys(tierSets).length > 0) {
            return Object.keys(tierSets);
        }
    }

    return [];
}

/**
 * Gets a specific competitive set by role name.
 */
export function getCompetitiveSetByRole(
    displayName: string,
    roleName: string,
    formatTier: string = 'ou'
): CompetitiveSet | null {
    let pokemonSets = sets[displayName];
    
    if (!pokemonSets) {
         const lowerName = displayName.toLowerCase();
         const foundKey = Object.keys(sets).find(k => k.toLowerCase() === lowerName);
         if (foundKey) {
             pokemonSets = sets[foundKey];
         }
    }
    
    if (!pokemonSets) return null;

    const cleanTier = formatTier.replace(/^gen\d+/, '').toLowerCase();
    const tiersToTry = [formatTier, cleanTier, ...TIER_FALLBACK.filter(t => t !== formatTier && t !== cleanTier)];

    for (const tier of tiersToTry) {
        const tierSets = pokemonSets[tier];
        if (!tierSets) continue;

        const raw = tierSets[roleName];
        if (raw) {
             // Resolve move alternatives
            const moves = (raw.moves || []).map(resolveMove);

            // Resolve item, nature, ability (can all be arrays)
            const item = raw.item ? pickRandom(raw.item) : 'Leftovers';
            const nature = raw.nature ? pickRandom(raw.nature) : 'Adamant';
            const ability = raw.ability ? pickRandom(raw.ability) : undefined;

            // Resolve EVs (can be an array of EV spreads)
            const evs = raw.evs ? pickRandom(raw.evs) : { hp: 252, atk: 252, spe: 4 };

            // Resolve Tera Type
            const teraType = raw.teratypes ? pickRandom(raw.teratypes) : undefined;

            return {
                pokemon: displayName,
                setName: roleName,
                moves,
                item,
                ability,
                evs,
                nature,
                teraType,
            };
        }
    }

    return null;
}

/**
 * Checks if a Pokémon has any Smogon sets data available.
 */
export function hasCompetitiveData(displayName: string): boolean {
    return !!sets[displayName];
}
