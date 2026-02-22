
import pokedexRaw from '../data/pokedex.json';
import learnsetsRaw from '../data/learnsets.json';
import movesRaw from '../data/moves.json';
import abilitiesRaw from '../data/abilities.json';
import itemsRaw from '../data/items.json';
import translationsEsRaw from '../data/translations-es.json';

export interface PokedexEntry {
    num: number;
    name: string;
    types: string[];
    baseStats: { hp: number; atk: number; def: number; spa: number; spd: number; spe: number };
    abilities: { [key: string]: string };
    tags?: string[];
    forme?: string;
    baseSpecies?: string;
    evos?: string[];
    prevo?: string;
    // Add other fields from pokedex.json if needed
}

export interface Learnset {
    [pokemon: string]: {
        [move: string]: string[];
    };
}

export interface MoveData {
    num: number;
    accuracy: number | true;
    basePower: number;
    category: "Physical" | "Special" | "Status";
    desc?: string;
    shortDesc?: string;
    name: string;
    pp: number;
    priority: number;
    flags: Record<string, any>;
    type: string;
}

// Type assertion for raw imports to match interfaces
const pokedex: Record<string, PokedexEntry> = pokedexRaw as any;
const learnsets: Record<string, any> = learnsetsRaw as any;
const moves: Record<string, MoveData> = movesRaw as any;
const abilities: Record<string, { name: string; desc: string; shortDesc: string }> = abilitiesRaw as any;
const items: Record<string, { name: string; desc: string; shortDesc: string }> = itemsRaw as any;
const translationsEs: {
    moves: Record<string, { name: string; desc?: string }>;
    abilities: Record<string, { name: string; desc?: string }>;
    items: Record<string, { name: string; desc?: string }>;
} = translationsEsRaw as any;

const MANUAL_ITEM_TRANSLATIONS: Record<string, string> = {
    "Booster Energy": "Energía Potenciadora",
    "Clear Amulet": "Amuleto Puro",
    "Covert Cloak": "Capa Furtiva",
    "Loaded Dice": "Dado Trucado",
    "Mirror Herb": "Hierba Copia",
    "Punching Glove": "Guante de Boxeo",
    "Reaper Cloth": "Tela Terrible",
    "Utility Umbrella": "Paraguas Multiuso"
};

const MANUAL_ITEM_DESC_ES: Record<string, string> = {
    "Leftovers": "Al final de cada turno, el portador recupera 1/16 de sus PS máximos.",
    "Life Orb": "Los ataques del portador hacen x1.3 de daño, pero pierde 1/10 de sus PS máximos tras atacar.",
    "Choice Scarf": "La Velocidad del portador es x1.5, pero solo puede usar el primer movimiento que seleccione.",
    "Choice Band": "El Ataque del portador es x1.5, pero solo puede usar el primer movimiento que seleccione.",
    "Choice Specs": "El Ataque Especial del portador es x1.5, pero solo puede usar el primer movimiento que seleccione.",
    "Focus Sash": "Si los PS del portador están al máximo, sobrevive un ataque que lo noquearía con 1 PS. Un solo uso.",
    "Heavy-Duty Boots": "Al entrar en combate, el portador no se ve afectado por los riesgos de su lado del campo.",
    "Assault Vest": "La Def. Especial del portador es x1.5, pero solo puede usar movimientos de daño.",
    "Rocky Helmet": "Si el portador es golpeado por un movimiento de contacto, el atacante pierde 1/6 de sus PS máximos.",
    "Eviolite": "Si la especie del portador puede evolucionar, su Defensa y Def. Especial son x1.5.",
    "Black Sludge": "Cada turno, si el portador es tipo Veneno, recupera 1/16 de PS máximos; pierde 1/8 si no lo es.",
    "Toxic Orb": "Al final de cada turno, intenta envenenar gravemente al portador.",
    "Flame Orb": "Al final de cada turno, intenta quemar al portador.",
    "Sitrus Berry": "Restaura 1/4 de los PS máximos cuando está a 1/2 de PS o menos. Un solo uso.",
    "Lum Berry": "El portador se cura si tiene un estado alterado no volátil o está confuso. Un solo uso.",
    "Covert Cloak": "El portador no se ve afectado por los efectos secundarios de los ataques de otros Pokémon.",
    "Booster Energy": "Activa las habilidades Paleosíntesis o Carga Cuark. Un solo uso.",
    "Clear Amulet": "Previene que otros Pokémon reduzcan las estadísticas del portador.",
    "Loaded Dice": "Los movimientos que golpean 2-5 veces golpean 4-5 veces; Proliferación golpea 4-10 veces.",
    "Safety Goggles": "El portador es inmune a movimientos de polvo y al daño de Tormenta de Arena o Granizo.",
    "Weakness Policy": "Si el portador recibe un golpe superefectivo, sube Ataque y At. Esp. 2 niveles. Un solo uso.",
    "Expert Belt": "Los ataques del portador que son superefectivos hacen x1.2 de daño.",
    "Air Balloon": "El portador es inmune a ataques tipo Tierra. Se revienta cuando el portador es golpeado.",
    "Mental Herb": "Cura al portador de Atracción, Anulación, Otra Vez, Anticura, Mofa y Tormento. Un solo uso.",
    "Power Herb": "Los movimientos de dos turnos del portador se completan en uno. Un solo uso.",
    "White Herb": "Restaura todas las estadísticas reducidas a 0 cuando alguna es menor que 0. Un solo uso.",
    "Throat Spray": "Sube el At. Especial del portador 1 nivel tras usar un movimiento de sonido. Un solo uso.",
    "Light Clay": "El uso de Velo Aurora, Pantalla de Luz o Reflejo del portador dura 8 turnos en vez de 5.",
    "Wide Lens": "La precisión de los ataques del portador es x1.1.",
    "Scope Lens": "El ratio de golpe crítico del portador se eleva 1 nivel.",
    "Mirror Herb": "Cuando un Pokémon rival sube una estadística, el portador la copia. Un solo uso.",
    "Terrain Extender": "Los terrenos activados por el portador duran 8 turnos en vez de 5.",
    "Protective Pads": "Los movimientos del portador están protegidos de efectos adversos de contacto.",
    "Shed Shell": "El portador no puede ser impedido de cambiar por ningún efecto.",
    "Red Card": "Si el portador sobrevive un golpe, el atacante cambia a un aliado aleatorio. Un solo uso.",
    "Muscle Band": "Los ataques físicos del portador tienen x1.1 de poder.",
    "Blunder Policy": "Si el portador falla por precisión, su Velocidad sube 2 niveles. Un solo uso.",
    "Chesto Berry": "El portador se despierta si está dormido. Un solo uso.",
    "Colbur Berry": "Reduce a la mitad el daño de un ataque superefectivo tipo Siniestro. Un solo uso.",
    "Custap Berry": "El portador se mueve primero en su rango de prioridad a 1/4 de PS o menos. Un solo uso.",
    "Haban Berry": "Reduce a la mitad el daño de un ataque superefectivo tipo Dragón. Un solo uso.",
    "Iron Ball": "El portador queda en tierra y su Velocidad se reduce a la mitad.",
    "Kasib Berry": "Reduce a la mitad el daño de un ataque superefectivo tipo Fantasma. Un solo uso.",
    "King's Rock": "Los ataques del portador sin probabilidad de retroceso ganan un 10% de causar retroceso.",
    "Metronome": "El daño de movimientos usados en turnos consecutivos aumenta. Máx. x2 tras 5 turnos.",
    "Mystic Water": "Los ataques tipo Agua del portador tienen x1.2 de poder.",
    "Occa Berry": "Reduce a la mitad el daño de un ataque superefectivo tipo Fuego. Un solo uso.",
    "Passho Berry": "Reduce a la mitad el daño de un ataque superefectivo tipo Agua. Un solo uso.",
    "Rindo Berry": "Reduce a la mitad el daño de un ataque superefectivo tipo Planta. Un solo uso.",
    "Shuca Berry": "Reduce a la mitad el daño de un ataque superefectivo tipo Tierra. Un solo uso.",
    "Silk Scarf": "Los ataques tipo Normal del portador tienen x1.2 de poder.",
    "Spell Tag": "Los ataques tipo Fantasma del portador tienen x1.2 de poder.",
    "Wacan Berry": "Reduce a la mitad el daño de un ataque superefectivo tipo Eléctrico. Un solo uso.",
    "Yache Berry": "Reduce a la mitad el daño de un ataque superefectivo tipo Hielo. Un solo uso.",
    "Zoom Lens": "La precisión de los ataques del portador es x1.2 si se mueve después del objetivo.",
    "Punching Glove": "Los movimientos de puñetazo del portador hacen x1.1 de daño y no hacen contacto.",
    "Utility Umbrella": "El portador ignora los efectos del clima en daño y precisión.",
    "Absorb Bulb": "Sube el At. Especial del portador 1 nivel si es golpeado por un ataque tipo Agua. Un solo uso.",
    "Bright Powder": "La precisión de los ataques contra el portador es x0.9.",
    "Pixie Plate": "Los ataques tipo Hada del portador tienen x1.2 de poder. Sentencia es tipo Hada.",
    "Reaper Cloth": "Objeto necesario para la evolución de ciertos Pokémon.",
};

const MANUAL_MOVE_TRANSLATIONS: Record<string, string> = {
    "Hydro Steam": "Hidrovapor",
    "Psyblade": "Psicohoja",
    "Gigaton Hammer": "Martillo Colosal",
    "Blood Moon": "Luna Roja",
    "Ivy Cudgel": "Garrote Hiedra",
    "Matcha Gotcha": "Cañón Matcha",
    "Syrup Bomb": "Bomba Jarabe",
    "Electro Shot": "Electrodisparo",
    "Tera Blast": "Teraexplosión",
    "Silk Trap": "Telatrampa",
    "Axe Kick": "Patada Hacha",
    "Last Respects": "Homenaje Póstumo",
    "Lumina Crash": "Fotocolisión",
    "Order Up": "Marcha",
    "Jet Punch": "Envite Acuático",
    "Spicy Extract": "Extracto Picante",
    "Spin Out": "Quemarrueda",
    "Population Bomb": "Proliferación",
    "Simple Beam": "Rayo Simple",
    "Ice Spinner": "Pirueta Helada",
    "Glaive Rush": "Asalto Espadón",
    "Revival Blessing": "Plegaria Vital",
    "Salt Cure": "Salazón",
    "Triple Dive": "Triple Inmersión",
    "Mortal Spin": "Giro Mortífero",
    "Doodle": "Decolorado",
    "Fillet Away": "Deslome",
    "Kowtow Cleave": "Genuflexo",
    "Flower Trick": "Truco Floral",
    "Torch Song": "Canto Ardiente",
    "Aqua Step": "Danza Acuática",
    "Raging Bull": "Furia Taurina",
    "Make It Rain": "Fiebre Dorada",
    "Ruination": "Calamidad",
    "Collision Course": "Electroderrape",
    "Electro Drift": "Nitrochoque",
    "Shed Tail": "Autotomía",
    "Chilly Reception": "Fría Acogida",
    "Tidy Up": "Limpiaorden",
    "Snowscape": "Paisaje Nevado",
    "Pounce": "Brinco",
    "Trailblaze": "Abrecaminos",
    "Chilling Water": "Agua Fría",
    "Hyper Drill": "Hipertaladradora",
    "Twin Beam": "Láser Doble",
    "Rage Fist": "Puño Furia",
    "Armor Cannon": "Cañón Armadura",
    "Bitter Blade": "Espada Lamento",
    "Double Shock": "Dobledeshock",
    "Knock Off": "Desarme",
    "U-turn": "Ida y Vuelta",
    "Triple Axel": "Triple Axel",
    "Thunder Wave": "Onda Trueno",
    "Will-O-Wisp": "Fuego Fatuo",
    "Spikes": "Púas",
    "Stealth Rock": "Trampa Rocas",
    "Toxic": "Tóxico",
    "Defog": "Despejar",
    "Roost": "Respiro",
    "Recover": "Recuperación",
    "Synthesis": "Síntesis",
    "Moonlight": "Luz Lunar",
    "Morning Sun": "Sol Matinal",
    "Protect": "Protección",
    "Wish": "Deseo",
    "Encore": "Otra Vez",
    "Taunt": "Mofa",
    "Substitute": "Sustituto",
    "Calm Mind": "Paz Mental",
    "Nasty Plot": "Maquinación",
    "Swords Dance": "Danza Espada",
    "Dragon Dance": "Danza Dragón",
    "Bulk Up": "Corpulencia",
    "Iron Defense": "Defensa Férrea",
    "Amnesia": "Amnesia",
    "Trick": "Truco",
    "Volt Switch": "Voltiocambio",
    "Flip Turn": "Viraje",
    "Teleport": "Teletransporte",
    "Parting Shot": "Última Palabra",
    "Rapid Spin": "Giro Rápido",
    "Court Change": "Cambio de Cancha",
    "Sticky Web": "Red Viscosa",
    "Toxic Spikes": "Púas Tóxicas",
    "Light Screen": "Pantalla de Luz",
    "Reflect": "Reflejo",
    "Aurora Veil": "Velo Aurora",
    "Trick Room": "Espacio Raro",
    "Tailwind": "Viento Afín",
    "Rain Dance": "Danza Lluvia",
    "Sunny Day": "Día Soleado",
    "Sandstorm": "Tormenta de Arena",
    "Double Iron Bash": "Ferropuño Doble",
    "Bleakwind Storm": "Elegía Helada",
    "Wildbolt Storm": "Fulgor Boreal",
    "Sandsear Storm": "Simún de Arena",
    "Springtide Storm": "Ciclón Primavera"
};

/**
 * Gets the description for an ability by its display name.
 */
export function getAbilityDescription(abilityName: string): { desc: string; shortDesc: string } {
    const id = abilityName.toLowerCase().replace(/[^a-z0-9]/g, '');
    const data = abilities[id];
    if (data) return { desc: data.desc, shortDesc: data.shortDesc };
    return { desc: '', shortDesc: '' };
}

export function getPokemonData(name: string): PokedexEntry | undefined {
    const id = name.toLowerCase().replace(/[^a-z0-9]/g, '');
    return pokedex[id];
}

export function getAllPokemonNames(): string[] {
    return Object.keys(pokedex).filter(key => {
        const entry = pokedex[key];
        return entry.num > 0; // Filter out customs/CAPs if they have num <= 0
    });
}

export function getMoveData(name: string): MoveData | undefined {
    const id = name.toLowerCase().replace(/[^a-z0-9]/g, '');
    return moves[id];
}

export function getProperItemName(id: string): string {
    if (!id) return '';
    const normalized = id.toLowerCase().replace(/[^a-z0-9]/g, '');
    return items[normalized]?.name || id;
}

export function getProperAbilityName(id: string): string {
    if (!id) return '';
    const normalized = id.toLowerCase().replace(/[^a-z0-9]/g, '');
    return abilities[normalized]?.name || id;
}

export function getProperMoveName(id: string): string {
    if (!id) return '';
    const normalized = id.toLowerCase().replace(/[^a-z0-9]/g, '');
    return moves[normalized]?.name || id;
}

export function getPokemonGeneration(name: string): number {
    const p = getPokemonData(name);
    if (!p) return 0;

    // Check specific forms first
    if (p.name.includes("-Alola")) return 7;
    if (p.name.includes("-Galar")) return 8;
    if (p.name.includes("-Hisui")) return 8; // Hisui is technically Gen 8 (Legends Arceus)
    if (p.name.includes("-Paldea")) return 9;

    // Mega Evolutions (Gen 6) - though user might want them in base gen, usually filtered out
    if (p.name.includes("-Mega")) return 6;
    if (p.name.includes("-Gmax")) return 8;

    // Base generation based on National Dex ID
    const num = p.num;
    if (num <= 151) return 1;
    if (num <= 251) return 2;
    if (num <= 386) return 3;
    if (num <= 493) return 4;
    if (num <= 649) return 5;
    if (num <= 721) return 6;
    if (num <= 809) return 7;
    if (num <= 905) return 8;
    return 9;
}

export function getTranslatedMoveName(moveName: string, lang: 'en' | 'es'): string {
    const properName = getProperMoveName(moveName);
    if (lang === 'es') {
        if (MANUAL_MOVE_TRANSLATIONS[properName]) return MANUAL_MOVE_TRANSLATIONS[properName];
        const translated = translationsEs.moves[properName];
        if (translated?.name) return translated.name;
    }
    return properName;
}

export function getTranslatedMoveDesc(moveName: string, lang: 'en' | 'es'): string | undefined {
    if (lang === 'es') {
        const translated = translationsEs.moves[moveName];
        if (translated?.desc) return translated.desc;
    }
    const id = moveName.toLowerCase().replace(/[^a-z0-9]/g, '');
    return moves[id]?.shortDesc || moves[id]?.desc;
}

export function getTranslatedAbilityName(abilityName: string, lang: 'en' | 'es'): string {
    const properName = getProperAbilityName(abilityName);
    if (lang === 'es') {
        const translated = translationsEs.abilities[properName];
        if (translated?.name) return translated.name;
    }
    return properName;
}

export function getTranslatedAbilityDesc(abilityName: string, lang: 'en' | 'es'): string {
    if (lang === 'es') {
        const translated = translationsEs.abilities[abilityName];
        if (translated?.desc) return translated.desc;
    }
    const id = abilityName.toLowerCase().replace(/[^a-z0-9]/g, '');
    return abilities[id]?.shortDesc || abilities[id]?.desc || '';
}

export function getTranslatedItemName(itemName: string, lang: 'en' | 'es'): string {
    const properName = getProperItemName(itemName);
    if (lang === 'es') {
        if (MANUAL_ITEM_TRANSLATIONS[properName]) return MANUAL_ITEM_TRANSLATIONS[properName];
        const translated = translationsEs.items[properName];
        if (translated?.name) return translated.name;
    }
    return properName;
}

/**
 * Gets the description for an item by its display name.
 */
export function getItemDescription(itemName: string): { desc: string; shortDesc: string } {
    const id = itemName.toLowerCase().replace(/[^a-z0-9]/g, '');
    const data = items[id];
    if (data) return { desc: data.desc, shortDesc: data.shortDesc };
    return { desc: '', shortDesc: '' };
}

export function getTranslatedItemDesc(itemName: string, lang: 'en' | 'es'): string {
    if (lang === 'es') {
        if (MANUAL_ITEM_DESC_ES[itemName]) return MANUAL_ITEM_DESC_ES[itemName];
        const translated = translationsEs.items[itemName];
        if (translated?.desc) return translated.desc;
    }
    const id = itemName.toLowerCase().replace(/[^a-z0-9]/g, '');
    return items[id]?.shortDesc || items[id]?.desc || '';
}



export function isLegendaryOrParadox(name: string): boolean {
    const p = getPokemonData(name);
    if (!p) return false;

    const legendaryTags = ["Restricted Legendary", "Sub-Legendary", "Mythical", "Paradox"];

    // 1. Use Tags if available (Best Source)
    if (p.tags && p.tags.some(tag => legendaryTags.includes(tag))) {
        return true;
    }

    // 2. Alternate forms (Therian, Galar, etc.) inherit from baseSpecies
    if (p.baseSpecies) {
        const base = getPokemonData(p.baseSpecies);
        if (base?.tags && base.tags.some(tag => legendaryTags.includes(tag))) {
            return true;
        }
    }

    // 3. Paradox prefix check (catches DLC paradox mons missing tags)
    const paradoxPrefixes = ["Iron ", "Scream ", "Flutter ", "Brute ", "Great ", "Sandy ", "Slither ", "Roaring ", "Walking ", "Gouging ", "Raging "];
    if (paradoxPrefixes.some(prefix => p.name.startsWith(prefix))) return true;

    // 4. Fallback: known box legendaries by name
    const legendaryKeywords = ["Mewtwo", "Lugia", "Ho-Oh", "Kyogre", "Groudon", "Rayquaza", "Dialga", "Palkia", "Giratina", "Reshiram", "Zekrom", "Kyurem", "Xerneas", "Yveltal", "Zygarde", "Cosmog", "Cosmoem", "Solgaleo", "Lunala", "Necrozma", "Zacian", "Zamazenta", "Eternatus", "Koraidon", "Miraidon"];
    if (legendaryKeywords.some(l => p.name.includes(l))) return true;

    // 5. BST Check (Last Resort — catches anything else 670+)
    const bst = Object.values(p.baseStats).reduce((a, b) => a + b, 0);
    if (bst >= 670) return true;

    return false;
}

export function isValidForGen(name: string, targetGen: number): boolean {
    // This function checks if a Pokemon was *introduced* in that gen (origin-based)
    return getPokemonGeneration(name) === targetGen;
}

/**
 * Max national dex number for each generation.
 * Used to determine which Pokémon existed in a given gen context.
 */
const MAX_DEX_BY_GEN: Record<number, number> = {
    1: 151,
    2: 251,
    3: 386,
    4: 493,
    5: 649,
    6: 721,
    7: 809,
    8: 905,
    9: 1025,
};

/**
 * Checks if a Pokémon is available in a target generation context.
 * Unlike isValidForGen (origin-based), this checks if the Pokémon's
 * national dex number falls within the gen's range (i.e., existed in that gen).
 * For example, Pikachu (dex 25) is available in Gen 1 through Gen 9.
 */
export function isAvailableInGen(name: string, targetGen: number): boolean {
    const p = getPokemonData(name);
    if (!p) return false;
    if (p.num <= 0) return false; // Filter out CAP/custom Pokémon

    const maxDex = MAX_DEX_BY_GEN[targetGen];
    if (!maxDex) return true; // Unknown gen, allow all

    // Regional forms: only available from their introduction gen onwards
    if (p.name.includes('-Alola') && targetGen < 7) return false;
    if (p.name.includes('-Galar') && targetGen < 8) return false;
    if (p.name.includes('-Hisui') && targetGen < 8) return false;
    if (p.name.includes('-Paldea') && targetGen < 9) return false;
    if (p.name.includes('-Mega') && targetGen < 6) return false;
    if (p.name.includes('-Gmax') && targetGen < 8) return false;

    return p.num <= maxDex;
}


export function getRandomMovesWithDetails(pokemonName: string, count: number = 4): MoveData[] {
    const id = pokemonName.toLowerCase().replace(/[^a-z0-9]/g, '');
    let data = learnsets[id];

    // If no learnset found, try to find the base species learnset
    if (!data) {
        const pokemonData = getPokemonData(pokemonName);
        if (pokemonData?.baseSpecies) {
            const baseId = pokemonData.baseSpecies.toLowerCase().replace(/[^a-z0-9]/g, '');
            data = learnsets[baseId];
        }
    }

    if (!data) {
        // Fallback: If learnset still missing, return empty array
        return [];
    }

    const learnsetMoves = data.learnset || data;
    const allMoveIds = Object.keys(learnsetMoves);
    if (allMoveIds.length === 0) return [];

    // Filter moves to only include those that exist in our moves database
    const validMoveIds = allMoveIds.filter(mid => moves[mid]);

    const selectedIds = validMoveIds.sort(() => 0.5 - Math.random()).slice(0, count);

    return selectedIds.map(mid => moves[mid]);
}

export function getTypeColor(type: string): string {
    const colors: Record<string, string> = {
        normal: 'bg-zinc-400',
        fire: 'bg-orange-500',
        water: 'bg-blue-500',
        grass: 'bg-green-500',
        electric: 'bg-yellow-400',
        ice: 'bg-cyan-300',
        fighting: 'bg-red-600',
        poison: 'bg-purple-500',
        ground: 'bg-amber-600',
        flying: 'bg-indigo-300',
        psychic: 'bg-pink-500',
        bug: 'bg-lime-500',
        rock: 'bg-stone-500',
        ghost: 'bg-purple-700',
        dragon: 'bg-violet-600',
        steel: 'bg-slate-400',
        fairy: 'bg-pink-300',
        dark: 'bg-zinc-700',
    };
    return colors[type.toLowerCase()] || 'bg-zinc-400';
}

const COMMON_ITEMS = [
    "Leftovers", "Life Orb", "Choice Scarf", "Choice Band", "Choice Specs",
    "Focus Sash", "Heavy-Duty Boots", "Assault Vest", "Rocky Helmet", "Sitrus Berry"
];

const COMMON_NATURES = [
    "Adamant", "Jolly", "Modest", "Timid", "Bold", "Calm", "Impish", "Careful"
];

export function getExportText(team: any[]): string {
    return team.map(p => {
        // Use the pre-assigned item from team generation, or fall back to random
        const item = p.item || COMMON_ITEMS[Math.floor(Math.random() * COMMON_ITEMS.length)];
        const nature = p.nature || COMMON_NATURES[Math.floor(Math.random() * COMMON_NATURES.length)];
        const ability = p.ability || p.abilities?.['0'] || "Process";

        // If p already has styled moves (MoveData[]), use them. Else fetch random strings.
        let moveNames: string[] = [];
        if (p.moves && p.moves.length > 0 && typeof p.moves[0] !== 'string') {
            moveNames = p.moves.map((m: any) => m.name);
        } else if (p.moves && p.moves.length > 0) {
            moveNames = p.moves;
        } else {
            // Generate if not present
            const mData = getRandomMovesWithDetails(p.name);
            moveNames = mData.length > 0 ? mData.map(m => m.name) : ["Tackle"];
        }

        let evsText = "EVs: 252 Atk / 4 SpD / 252 Spe";
        if (p.evs) {
            // Handle both string and object formats for EVs
            if (typeof p.evs === 'string') {
                // Already formatted as string (e.g., "252 Atk / 4 SpD / 252 Spe")
                evsText = p.evs ? `EVs: ${p.evs}` : evsText;
            } else if (typeof p.evs === 'object') {
                // Object format (e.g., { hp: 252, atk: 0, def: 0, spa: 0, spd: 4, spe: 252 })
                const evEntries = Object.entries(p.evs as Record<string, number>).filter(([_, val]) => (val as number) > 0);
                if (evEntries.length > 0) {
                    evsText = "EVs: " + evEntries
                        .map(([stat, val]) => `${val} ${stat === 'spa' ? 'SpA' : stat === 'spd' ? 'SpD' : stat === 'spe' ? 'Spe' : stat === 'atk' ? 'Atk' : stat === 'def' ? 'Def' : 'HP'}`)
                        .join(' / ');
                }
            }
        }

        let teraText = "";
        if (p.teraType) {
            teraText = `Tera Type: ${p.teraType}\n`;
        } else if (p.types && p.types.length > 0) {
            teraText = `Tera Type: ${p.types[0]}\n`;
        }

        return `${p.name} @ ${item}
Ability: ${ability}
${teraText}${evsText}
${nature} Nature
${moveNames.map((m: string) => `- ${m}`).join('\n')}`;
    }).join('\n\n');
}

export type Role = 'Sweeper' | 'Wall' | 'Tank' | 'Support';

export function getPokemonRole(name: string): Role {
    const data = getPokemonData(name);
    if (!data) return 'Support';

    const { atk, spa, spe, def, spd, hp } = data.baseStats;

    if (spe > 95 && (atk > 95 || spa > 95)) return 'Sweeper';
    if (def > 95 || spd > 95) return 'Wall';
    if (hp > 90 && (def > 80 || spd > 80)) return 'Tank';

    return 'Support';
}

/**
 * PokeAPI form IDs for regional variants and special forms.
 * Maps Showdown-style names to their PokeAPI numeric IDs for official artwork.
 */
const VARIANT_POKEAPI_IDS: Record<string, number> = {
    // Alolan forms
    'Rattata-Alola': 10091, 'Raticate-Alola': 10092, 'Raichu-Alola': 10100,
    'Sandshrew-Alola': 10101, 'Sandslash-Alola': 10102, 'Vulpix-Alola': 10103,
    'Ninetales-Alola': 10104, 'Diglett-Alola': 10105, 'Dugtrio-Alola': 10106,
    'Meowth-Alola': 10107, 'Persian-Alola': 10108, 'Geodude-Alola': 10109,
    'Graveler-Alola': 10110, 'Golem-Alola': 10111, 'Grimer-Alola': 10112,
    'Muk-Alola': 10113, 'Exeggutor-Alola': 10114, 'Marowak-Alola': 10115,
    // Galarian forms
    'Meowth-Galar': 10161, 'Ponyta-Galar': 10162, 'Rapidash-Galar': 10163,
    'Slowpoke-Galar': 10164, 'Slowbro-Galar': 10165, "Farfetch'd-Galar": 10166,
    'Weezing-Galar': 10167, 'Articuno-Galar': 10169, 'Zapdos-Galar': 10170,
    'Moltres-Galar': 10171, 'Slowking-Galar': 10172, 'Corsola-Galar': 10173,
    'Zigzagoon-Galar': 10174, 'Linoone-Galar': 10175, 'Darumaka-Galar': 10176,
    'Darmanitan-Galar': 10177, 'Darmanitan-Galar-Zen': 10178, 'Yamask-Galar': 10179,
    'Stunfisk-Galar': 10180, "Mr. Mime-Galar": 10168,
    // Hisuian forms
    'Growlithe-Hisui': 10229, 'Arcanine-Hisui': 10230, 'Voltorb-Hisui': 10231,
    'Electrode-Hisui': 10232, 'Typhlosion-Hisui': 10233, 'Qwilfish-Hisui': 10234,
    'Sneasel-Hisui': 10235, 'Samurott-Hisui': 10236, 'Lilligant-Hisui': 10237,
    'Zorua-Hisui': 10238, 'Zoroark-Hisui': 10239, 'Braviary-Hisui': 10240,
    'Sliggoo-Hisui': 10241, 'Goodra-Hisui': 10242, 'Avalugg-Hisui': 10243,
    'Decidueye-Hisui': 10244,
    // Paldean forms
    'Wooper-Paldea': 10253, 'Tauros-Paldea-Combat': 10250,
    'Tauros-Paldea-Blaze': 10251, 'Tauros-Paldea-Aqua': 10252,
    // Origin / Primal forms
    'Dialga-Origin': 10245, 'Palkia-Origin': 10246, 'Giratina-Origin': 10007,
    'Kyogre-Primal': 10077, 'Groudon-Primal': 10078,
    // Therian forms
    'Tornadus-Therian': 10019, 'Thundurus-Therian': 10020,
    'Landorus-Therian': 10021, 'Enamorus-Therian': 10249,
    // Special forms
    'Magearna-Original': 10147,
    // Gmax forms
    'Venusaur-Gmax': 10195, 'Charizard-Gmax': 10196, 'Blastoise-Gmax': 10197,
    'Butterfree-Gmax': 10198, 'Pikachu-Gmax': 10199, 'Meowth-Gmax': 10200,
    'Machamp-Gmax': 10201, 'Gengar-Gmax': 10202, 'Kingler-Gmax': 10203,
    'Lapras-Gmax': 10204, 'Eevee-Gmax': 10205, 'Snorlax-Gmax': 10206,
    'Garbodor-Gmax': 10207, 'Melmetal-Gmax': 10208, 'Rillaboom-Gmax': 10209,
    'Cinderace-Gmax': 10210, 'Inteleon-Gmax': 10211, 'Corviknight-Gmax': 10212,
    'Orbeetle-Gmax': 10213, 'Drednaw-Gmax': 10214, 'Coalossal-Gmax': 10215,
    'Flapple-Gmax': 10216, 'Appletun-Gmax': 10217, 'Sandaconda-Gmax': 10218,
    'Centiskorch-Gmax': 10220, 'Hatterene-Gmax': 10221, 'Grimmsnarl-Gmax': 10222,
    'Alcremie-Gmax': 10223, 'Copperajah-Gmax': 10224, 'Duraludon-Gmax': 10225,
    'Urshifu-Rapid-Strike-Gmax': 10227, 'Toxtricity-Low-Key-Gmax': 10228,
};

/**
 * Generates a sprite URL for a Pokémon.
 * Uses PokeAPI Official Artwork for all forms (high quality).
 * For regional variants, uses a pre-built map of PokeAPI form IDs.
 * Falls back to PokemonDB artwork for unmapped variants.
 */
export function getPokemonSpriteUrl(pokemon: any): string {
    // Handle both cases: passing the full object or just the string name
    const name: string = typeof pokemon === 'string' ? pokemon : (pokemon?.name || '');
    let num: number = pokemon?.num || 0;

    if (!name) return 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/0.png';

    if (!num) {
        const pData = getPokemonData(name);
        if (pData) num = pData.num;
    }

    // Check the variant map first (covers Alolan, Galarian, Hisuian, Paldean, Origin, Primal, Therian, Gmax)
    const variantId = VARIANT_POKEAPI_IDS[name];
    if (variantId) {
        return `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/${variantId}.png`;
    }

    // Check if it's a variant not in our map (e.g., fan-made Megas)
    const isVariant = name.includes('-') &&
        (name.includes('-Alola') || name.includes('-Galar') ||
            name.includes('-Hisui') || name.includes('-Paldea') ||
            name.includes('-Mega') || name.includes('-Primal') ||
            name.includes('-Origin') || name.includes('-Gmax') ||
            name.includes('-Therian'));

    if (!isVariant) {
        // High quality official artwork for base forms
        return `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/${num}.png`;
    }

    // Fallback for unmapped variants: PokeDB artwork
    let slug = name.toLowerCase().replace(/[^a-z0-9-]/g, '');
    if (slug.endsWith('-alola')) slug = slug.replace('-alola', '-alolan');
    else if (slug.endsWith('-galar')) slug = slug.replace('-galar', '-galarian');
    else if (slug.endsWith('-hisui')) slug = slug.replace('-hisui', '-hisuian');
    else if (slug.endsWith('-paldea')) slug = slug.replace('-paldea', '-paldean');

    return `https://img.pokemondb.net/artwork/large/${slug}.jpg`;
}
