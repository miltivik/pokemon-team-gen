/**
 * Dynamic Competitive Sets — Parses Smogon sets from gen9-sets.json
 *
 * Replaces the old hardcoded 20-Pokémon list with a dynamic parser that
 * covers every Pokémon in Smogon's database across all formats.
 */

import setsData from '@/data/gen9-sets.json';

interface RawCompetitiveSet {
    moves?: Array<string | string[]>;
    item?: string | string[];
    ability?: string | string[];
    nature?: string | string[];
    evs?: Record<string, number | undefined> | Array<Record<string, number | undefined>>;
    teratypes?: string | string[];
}

type TierSetMap = Record<string, RawCompetitiveSet>;
type PokemonCompetitiveSets = Record<string, TierSetMap>;

const sets = setsData as Record<string, PokemonCompetitiveSets>;

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

function normalizeEvs(evs?: Record<string, number | undefined>) {
    return {
        hp: evs?.hp ?? 0,
        atk: evs?.atk ?? 0,
        def: evs?.def ?? 0,
        spa: evs?.spa ?? 0,
        spd: evs?.spd ?? 0,
        spe: evs?.spe ?? 0,
    };
}

function getPokemonSets(displayName: string) {
    let pokemonSets = sets[displayName];

    if (!pokemonSets) {
        const lowerName = displayName.toLowerCase();
        const foundKey = Object.keys(sets).find((key) => key.toLowerCase() === lowerName);
        if (foundKey) {
            pokemonSets = sets[foundKey];
        }
    }

    return pokemonSets as PokemonCompetitiveSets | undefined;
}

function getTierCandidates(formatTier: string = "ou"): string[] {
    const rawTier = formatTier.toLowerCase();
    const cleanTier = rawTier.replace(/^gen\d+/, "");
    const baseTier = cleanTier.replace(/[^a-z0-9]/g, "");
    const candidates: string[] = [];
    const pushCandidate = (tier: string) => {
        if (!tier || candidates.includes(tier)) return;
        candidates.push(tier);
    };

    pushCandidate(rawTier);
    pushCandidate(cleanTier);
    pushCandidate(baseTier);

    const vgcMatch = baseTier.match(/^vgc(\d{4})/);
    if (vgcMatch) {
        const requestedYear = Number(vgcMatch[1]);
        for (let year = requestedYear; year >= 2023; year -= 1) {
            pushCandidate(`vgc${year}`);
        }
        pushCandidate("doublesou");
    }

    if (baseTier === "doublesou") {
        pushCandidate("vgc2025");
        pushCandidate("vgc2024");
    }

    TIER_FALLBACK.forEach(pushCandidate);

    return candidates;
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
    const pokemonSets = getPokemonSets(displayName);
    if (!pokemonSets) return null;

    const tiersToTry = getTierCandidates(formatTier);

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
        const evs = normalizeEvs(raw.evs ? pickRandom(raw.evs) : { hp: 252, atk: 252, spe: 4 });

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
    const pokemonSets = getPokemonSets(displayName);
    if (!pokemonSets) return [];

    const tiersToTry = getTierCandidates(formatTier);

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
    const pokemonSets = getPokemonSets(displayName);
    if (!pokemonSets) return null;

    const tiersToTry = getTierCandidates(formatTier);

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
            const evs = normalizeEvs(raw.evs ? pickRandom(raw.evs) : { hp: 252, atk: 252, spe: 4 });

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
    return !!getPokemonSets(displayName);
}
