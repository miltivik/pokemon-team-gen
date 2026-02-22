/**
 * Format Rules — Tier-based Pokémon filtering
 *
 * Uses the `tier` field from pokedex.json to determine
 * whether a Pokémon is allowed in a given Smogon format.
 *
 * Tier hierarchy (each tier includes all tiers below it):
 *   AG → Uber → OU → UUBL → UU → RUBL → RU → NUBL → NU → PUBL → PU → ZUBL → ZU
 *   LC is its own separate tier (basic Pokémon only)
 */

import { FormatId } from '@/config/formats';
import pokedexData from '@/data/pokedex.json';

const pokedex: Record<string, any> = pokedexData;

/**
 * Ordered tier hierarchy from lowest to highest.
 * A Pokémon's tier must be at or below the format's tier ceiling.
 */
const TIER_ORDER: string[] = [
    'ZU', 'ZUBL', 'PU', 'PUBL', 'NU', 'NUBL', 'RU', 'RUBL', 'UU', 'UUBL', 'OU', 'Uber', 'AG'
];

/**
 * Maps a format ID to the highest tier ceiling allowed.
 * null = no restriction (allow everything)
 */
function getTierCeiling(formatId: FormatId): string | null {
    // Extract the tier part from the format ID (e.g., 'gen9ou' → 'ou')
    const tierPart = formatId.replace(/^gen\d+/, '').toLowerCase();

    switch (tierPart) {
        case 'ou':
            return 'OU';
        case 'uu':
            return 'UU';
        case 'ru':
            return 'RU';
        case 'nu':
            return 'NU';
        case 'pu':
            return 'PU';
        case 'zu':
            return 'ZU';
        case 'ubers':
            return 'Uber';
        // These formats don't filter by tier
        case 'doublesou':
        case 'monotype':
        case 'lc':
            return null;
        default:
            // VGC and other special formats — no tier restriction
            return null;
    }
}

/**
 * Returns the numeric rank of a tier (higher = stronger).
 * Returns -1 for unknown tiers.
 */
function getTierRank(tier: string): number {
    return TIER_ORDER.indexOf(tier);
}

/**
 * Checks if a Pokémon is allowed in a given format based on tier.
 *
 * Rules:
 * - 'Illegal' and 'CAP' Pokémon are always excluded
 * - LC formats only allow Pokémon with the 'LC' tier
 * - VGC/Doubles/Monotype: no tier restriction (allow all non-Illegal)
 * - Other formats: the Pokémon's tier must be at or below the format's tier ceiling
 */
export function isAllowedInFormat(pokemonName: string, formatId: FormatId): boolean {
    const id = pokemonName.toLowerCase().replace(/[^a-z0-9]/g, '');
    const data = pokedex[id];

    if (!data) return false;

    const tier = data.tier as string | undefined;
    if (!tier) return false;

    // Always exclude Illegal, CAP, and NFE Pokémon that aren't tiered
    if (tier === 'Illegal' || tier.startsWith('CAP')) return false;

    // LC format: only allow Pokémon tiered as LC
    const tierPart = formatId.replace(/^gen\d+/, '').toLowerCase();
    if (tierPart === 'lc') {
        return tier === 'LC';
    }

    // Formats without tier restrictions
    const ceiling = getTierCeiling(formatId);
    if (ceiling === null) return true;

    // Check if the Pokémon's tier is at or below the ceiling
    const pokemonRank = getTierRank(tier);
    const ceilingRank = getTierRank(ceiling);

    // If the tier is not in our hierarchy (e.g. NFE, LC), 
    // allow it if the ceiling is OU or higher (NFE mons are generally allowed)
    if (pokemonRank === -1) {
        // NFE Pokémon are generally usable in any format
        if (tier === 'NFE') return true;
        // LC Pokémon are technically allowed in higher tiers
        if (tier === 'LC') return true;
        return false;
    }

    return pokemonRank <= ceilingRank;
}

/**
 * Extracts the Smogon tier key from a format ID for looking up
 * recommended sets in the Smogon data.
 * e.g., 'gen9ou' → 'ou', 'gen9vgc2026f' → 'vgc2025' (fallback)
 */
export function getSmogonTierKey(formatId: FormatId): string {
    const tierPart = formatId.replace(/^gen\d+/, '').toLowerCase();

    // Map our format IDs to Smogon sets data keys
    switch (tierPart) {
        case 'ou': return 'ou';
        case 'uu': return 'uu';
        case 'ru': return 'ru';
        case 'nu': return 'nu';
        case 'pu': return 'pu';
        case 'zu': return 'zu';
        case 'ubers': return 'ubers';
        case 'lc': return 'lc';
        case 'doublesou': return 'doublesou';
        case 'monotype': return 'monotype';
        case 'vgc2026f': return 'vgc2025'; // Fall back to latest VGC data
        default: return 'ou'; // Default fallback
    }
}
