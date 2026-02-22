/**
 * Utility functions for Pokémon items and sprites.
 * Handles ID normalization and URL generation for sprites.
 */

/**
 * Converts a name string to an ID string.
 * This should match the behavior of Pokemon Showdown's toID function.
 * Removes all non-alphanumeric characters and converts to lowercase.
 */
export function toID(text: string): string {
    if (typeof text !== 'string') return '';
    return text.toLowerCase().replace(/[^a-z0-9]/g, '');
}

/**
 * Converts an item name to kebab-case for PokeAPI-style URLs.
 * e.g. "Heavy-Duty Boots" -> "heavy-duty-boots"
 */
export function toKebabCase(text: string): string {
    if (typeof text !== 'string') return '';
    return text
        .toLowerCase()
        .replace(/[^a-z0-9\s-]/g, '')  // remove non-alphanumeric except spaces/hyphens
        .replace(/\s+/g, '-')           // spaces to hyphens
        .replace(/-+/g, '-')            // collapse multiple hyphens
        .replace(/^-|-$/g, '');         // trim leading/trailing hyphens
}

/**
 * Returns the primary URL for an item sprite (Showdown CDN).
 */
export function getItemSpriteUrl(itemName: string): string {
    if (!itemName) return '';
    const kebabId = toKebabCase(itemName);
    return `https://play.pokemonshowdown.com/sprites/itemicons/${kebabId}.png`;
}

/**
 * Common item name mappings to handle differences between data sources.
 * Maps showdown names to pokeapi names when they differ.
 */
const ITEM_NAME_MAPPING: Record<string, string> = {
    'heavy-duty boots': 'heavy-duty-boots',
    'choice specs': 'choice-specs',
    'choice scarf': 'choice-scarf',
    'choice band': 'choice-band',
    'assault vest': 'assault-vest',
    'life orb': 'life-orb',
    'lefties': 'leftovers',
    'leftovers': 'leftovers',
    'lucky punch': 'lucky-punch',
    'light ball': 'light-ball',
    'thick club': 'thick-club',
    'focus sash': 'focus-sash',
    'focus band': 'focus-band',
    'zoom lens': 'zoom-lens',
    'wide lens': 'wide-lens',
    'scope lens': 'scope-lens',
    'muscle band': 'muscle-band',
    'wise glasses': 'wise-glasses',
    'lagging tail': 'lagging-tail',
    'full incense': 'full-incense',
    'lax incense': 'lax-incense',
    'sea incense': 'sea-incense',
    'rose incense': 'rose-incense',
    'wave incense': 'wave-incense',
    'rock incense': 'rock-incense',
    'odd incense': 'odd-incense',
    'pure incense': 'pure-incense',
    '_protector': 'protector',
    _electirizer: 'electirizer',
    _magmarizer: 'magmarizer',
    _deepseascale: 'deep-sea-scale',
    _deepseatooth: 'deep-sea-tooth',
    _thunderstone: 'thunder-stone',
    _waterstone: 'water-stone',
    _firestone: 'fire-stone',
    _leafstone: 'leaf-stone',
    _moonstone: 'moon-stone',
    _sunstone: 'sun-stone',
    _shinystone: 'shiny-stone',
    _duskstone: 'dusk-stone',
    _dawnstone: 'dawn-stone',
    _ovalstone: 'oval-stone',
    _happinycharm: 'happiny-charm',
    _ovalcharm: 'oval-charm',
    _catchcharm: 'catch-charm',
    _racegloves: 'race-gloves',
    _poweranklet: 'power-anklet',
    _powerband: 'power-band',
    _powerbelt: 'power-belt',
    _powerbracer: 'power-bracer',
    _powerlens: 'power-lens',
    _powerweight: 'power-weight',
};

/**
 * Converts item name to PokeAPI item ID format.
 * Handles special cases where names differ between sources.
 */
function toPokeAPIItemId(itemName: string): string {
    const kebabId = toKebabCase(itemName);

    // Check if we have a mapping
    if (ITEM_NAME_MAPPING[kebabId]) {
        return ITEM_NAME_MAPPING[kebabId];
    }

    return kebabId;
}

/**
 * Returns an ordered list of fallback URLs to try for an item sprite.
 * 1. Showdown CDN (toID-based) — works for most classic items
 * 2. PokéSprite GitHub (kebab-case) — covers Gen 8 items like Heavy-Duty Boots
 * 3. PokeAPI GitHub — additional coverage
 * Items not found in any source will gracefully show fallback icon.
 */
export function getItemSpriteUrls(itemName: string): string[] {
    if (!itemName) return [];
    const showdownId = toID(itemName);
    const kebabId = toKebabCase(itemName);
    const pokeapiId = toPokeAPIItemId(itemName);

    return [
        // Showdown CDN (primary source - kebab case)
        `https://play.pokemonshowdown.com/sprites/itemicons/${kebabId}.png`,
        // Showdown CDN (fallback - no spaces/hyphens)
        `https://play.pokemonshowdown.com/sprites/itemicons/${showdownId}.png`,
        // PokéSprite GitHub (secondary source)
        `https://raw.githubusercontent.com/msikma/pokesprite/master/items/hold-item/${kebabId}.png`,
        // PokeAPI GitHub (tertiary source)
        `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/items/${pokeapiId}.png`,
    ];
}
