/**
 * Utility functions for Pokémon items and sprites.
 * Handles ID normalization and URL generation for sprites.
 */
import itemsRaw from "../data/items.json";

const items = itemsRaw as Record<string, { name: string; desc?: string; shortDesc?: string }>;

/**
 * Normalizes text for resilient item lookups.
 * Unlike `toID`, this strips diacritics first so translated names like
 * "Energía Potenciadora" can still be matched against aliases.
 */
function normalizeLookupText(text: string): string {
    if (typeof text !== "string") return "";

    return text
        .toLowerCase()
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "")
        .replace(/[^a-z0-9]/g, "");
}

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
 * Input aliases that should resolve to the canonical item name used by the
 * Showdown/PokeAPI sprite sources.
 */
const ITEM_NAME_ALIAS_MAPPING: Record<string, string> = {
    energyboost: "Booster Energy",
    energiapotenciadora: "Booster Energy",
};

/**
 * Canonical sprite IDs for items whose remote filenames differ from the
 * straightforward kebab/showdown normalization.
 *
 * Keys use `toID(itemName)` so aliases like "Lefties" can be normalized too.
 */
const ITEM_SPRITE_ID_MAPPING: Record<string, string[]> = {
    lefties: ['leftovers'],
    leftovers: ['leftovers'],
    energyboost: ['booster-energy', 'boosterenergy'],
    energiapotenciadora: ['booster-energy', 'boosterenergy'],
    boosterenergy: ['booster-energy', 'boosterenergy'],
    deepseascale: ['deep-sea-scale', 'deepseascale'],
    deepseatooth: ['deep-sea-tooth', 'deepseatooth'],
    thickclub: ['thick-club', 'thickclub'],
    lightball: ['light-ball', 'lightball'],
    luckypunch: ['lucky-punch', 'luckypunch'],
    focussash: ['focus-sash', 'focussash'],
    focusband: ['focus-band', 'focusband'],
    choicespecs: ['choice-specs', 'choicespecs'],
    choicescarf: ['choice-scarf', 'choicescarf'],
    choiceband: ['choice-band', 'choiceband'],
    assaultvest: ['assault-vest', 'assaultvest'],
    lifeorb: ['life-orb', 'lifeorb'],
    heavydutyboots: ['heavy-duty-boots', 'heavydutyboots'],
    widelens: ['wide-lens', 'widelens'],
    zoomlens: ['zoom-lens', 'zoomlens'],
    scopelens: ['scope-lens', 'scopelens'],
    muscleband: ['muscle-band', 'muscleband'],
    wiseglasses: ['wise-glasses', 'wiseglasses'],
    laggingtail: ['lagging-tail', 'laggingtail'],
    fullincense: ['full-incense', 'fullincense'],
    laxincense: ['lax-incense', 'laxincense'],
    seaincense: ['sea-incense', 'seaincense'],
    roseincense: ['rose-incense', 'roseincense'],
    waveincense: ['wave-incense', 'waveincense'],
    rockincense: ['rock-incense', 'rockincense'],
    oddincense: ['odd-incense', 'oddincense'],
    pureincense: ['pure-incense', 'pureincense'],
    thunderstone: ['thunder-stone', 'thunderstone'],
    waterstone: ['water-stone', 'waterstone'],
    firestone: ['fire-stone', 'firestone'],
    leafstone: ['leaf-stone', 'leafstone'],
    moonstone: ['moon-stone', 'moonstone'],
    sunstone: ['sun-stone', 'sunstone'],
    shinystone: ['shiny-stone', 'shinystone'],
    duskstone: ['dusk-stone', 'duskstone'],
    dawnstone: ['dawn-stone', 'dawnstone'],
    ovalstone: ['oval-stone', 'ovalstone'],
    happinycharm: ['happiny-charm', 'happinycharm'],
    ovalcharm: ['oval-charm', 'ovalcharm'],
    catchcharm: ['catch-charm', 'catchcharm'],
    racegloves: ['race-gloves', 'racegloves'],
    poweranklet: ['power-anklet', 'poweranklet'],
    powerband: ['power-band', 'powerband'],
    powerbelt: ['power-belt', 'powerbelt'],
    powerbracer: ['power-bracer', 'powerbracer'],
    powerlens: ['power-lens', 'powerlens'],
    powerweight: ['power-weight', 'powerweight'],
    protector: ['protector'],
    electirizer: ['electirizer'],
    magmarizer: ['magmarizer'],
};

/**
 * Resolves a display label, translated label, or alias to the canonical item
 * name stored in our local dataset.
 */
function getCanonicalItemName(itemName: string): string {
    if (!itemName) return "";

    const normalized = normalizeLookupText(itemName);
    const aliasedName = ITEM_NAME_ALIAS_MAPPING[normalized];
    if (aliasedName) return aliasedName;

    return items[normalized]?.name || itemName;
}

/**
 * Converts item name to PokeAPI item ID format.
 * Handles special cases where names differ between sources.
 */
function getSpriteIdCandidates(itemName: string): string[] {
    const canonicalName = getCanonicalItemName(itemName);
    const showdownId = toID(canonicalName);
    const kebabId = toKebabCase(canonicalName);
    const rawLookupId = normalizeLookupText(itemName);
    const mapped = [
        ...(ITEM_SPRITE_ID_MAPPING[showdownId] || []),
        ...(ITEM_SPRITE_ID_MAPPING[rawLookupId] || []),
    ];

    return [...new Set([kebabId, showdownId, ...mapped].filter(Boolean))];
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
    const spriteIds = getSpriteIdCandidates(itemName);

    return [
        ...spriteIds.map((spriteId) => `https://play.pokemonshowdown.com/sprites/itemicons/${spriteId}.png`),
        ...spriteIds.map((spriteId) => `https://raw.githubusercontent.com/msikma/pokesprite/master/items/hold-item/${spriteId}.png`),
        ...spriteIds.map((spriteId) => `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/items/${spriteId}.png`),
    ];
}
