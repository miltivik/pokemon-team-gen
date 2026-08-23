import translationsEsRaw from "../data/translations-es.json";
import translationsEsOverridesRaw from "../data/translations-es-overrides.json";

type NameTranslationMap = Record<string, { name?: string; desc?: string }>;

const translationsEs = translationsEsRaw as {
    moves: NameTranslationMap;
    abilities: NameTranslationMap;
    items: NameTranslationMap;
};
const translationsEsOverrides = translationsEsOverridesRaw as {
    moves?: NameTranslationMap;
    abilities?: NameTranslationMap;
    items?: NameTranslationMap;
};

const MANUAL_ITEM_TRANSLATIONS: Record<string, string> = {
    "Booster Energy": "Energía Potenciadora",
    "Clear Amulet": "Amuleto Puro",
    "Covert Cloak": "Capa Furtiva",
    "Loaded Dice": "Dado Trucado",
    "Mirror Herb": "Hierba Copia",
    "Punching Glove": "Guante de Boxeo",
    "Reaper Cloth": "Tela Terrible",
    "Utility Umbrella": "Paraguas Multiuso",
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
};

function normalizeName(name: string) {
    return name.toLowerCase().replace(/[^a-z0-9]/g, "");
}

function createNormalizedMap(source: NameTranslationMap) {
    return Object.entries(source).reduce<Record<string, string>>((acc, [name, data]) => {
        if (data?.name) {
            acc[normalizeName(name)] = data.name;
        }
        return acc;
    }, {});
}

const normalizedMoveTranslations = createNormalizedMap({
    ...translationsEs.moves,
    ...translationsEsOverrides.moves,
});
const normalizedAbilityTranslations = createNormalizedMap({
    ...translationsEs.abilities,
    ...translationsEsOverrides.abilities,
});
const normalizedItemTranslations = createNormalizedMap({
    ...translationsEs.items,
    ...translationsEsOverrides.items,
});

function getTranslatedName(
    category: "moves" | "abilities" | "items",
    name: string,
    manual?: Record<string, string>
) {
    const manualMatch = Object.entries(manual ?? {}).find(
        ([key]) => normalizeName(key) === normalizeName(name)
    )?.[1];
    if (manualMatch) return manualMatch;

    const translatedEntry = getTranslatedEntry(category, name);
    if (translatedEntry?.name) return translatedEntry.name;

    const normalizedName = normalizeName(name);
    if (category === "moves") return normalizedMoveTranslations[normalizedName];
    if (category === "abilities") return normalizedAbilityTranslations[normalizedName];
    return normalizedItemTranslations[normalizedName];
}

function getTranslatedEntry(
    category: "moves" | "abilities" | "items",
    name: string
) {
    const normalizedName = normalizeName(name);
    const sources = [
        translationsEsOverrides[category] ?? {},
        translationsEs[category],
    ];

    for (const source of sources) {
        if (source[name]) return source[name];
        const match = Object.entries(source).find(
            ([key]) => normalizeName(key) === normalizedName
        );
        if (match) return match[1];
    }

    return undefined;
}

export function getTranslatedMoveLabel(moveName: string, lang: "en" | "es") {
    if (lang !== "es") {
        return moveName;
    }

    return getTranslatedName("moves", moveName, MANUAL_MOVE_TRANSLATIONS)
        || moveName;
}

export function getTranslatedAbilityLabel(abilityName: string, lang: "en" | "es") {
    if (lang !== "es") {
        return abilityName;
    }

    return getTranslatedName("abilities", abilityName)
        || abilityName;
}

export function getTranslatedAbilityDescription(abilityName: string, lang: "en" | "es") {
    if (lang !== "es") return "";
    return getTranslatedEntry("abilities", abilityName)?.desc || "";
}

export function getTranslatedItemLabel(itemName: string, lang: "en" | "es") {
    if (lang !== "es") {
        return itemName;
    }

    return getTranslatedName("items", itemName, MANUAL_ITEM_TRANSLATIONS)
        || itemName;
}

const SET_LABEL_REPLACEMENTS: Array<[string, string]> = [
    ["All-Out Attacker", "Atacante Ofensivo"],
    ["All Out Attacker", "Atacante Ofensivo"],
    ["All-out Attacker", "Atacante Ofensivo"],
    ["Physical Attacker", "Atacante Físico"],
    ["Special Attacker", "Atacante Especial"],
    ["Mixed Attacker", "Atacante Mixto"],
    ["Revenge Killer", "Vengador"],
    ["Wallbreaker", "Rompemuros"],
    ["Setup Sweeper", "Limpiador de mejoras"],
    ["Sweeper", "Limpiador"],
    ["Attacker", "Atacante"],
    ["Bulky", "Robusto"],
    ["Physical Wall", "Muralla Física"],
    ["Special Wall", "Muralla Especial"],
    ["Wall", "Muralla"],
    ["Support", "Apoyo"],
    ["Utility", "Utilidad"],
    ["Pivot", "Pivote"],
    ["Lead", "Líder"],
    ["Setter", "Colocador"],
    ["Offensive", "Ofensivo"],
    ["Defensive", "Defensivo"],
    ["Choice Band", "Cinta Elección"],
    ["Choice Specs", "Gafas Elección"],
    ["Choice Scarf", "Pañuelo Elección"],
    ["Assault Vest", "Chaleco Asalto"],
    ["Air Balloon", "Globo Helio"],
    ["Trick Room", "Espacio Raro"],
    ["Rain Dance", "Danza Lluvia"],
    ["Sunny Day", "Día Soleado"],
    ["Swords Dance", "Danza Espada"],
    ["Nasty Plot", "Maquinación"],
    ["Calm Mind", "Paz Mental"],
    ["Dragon Dance", "Danza Dragón"],
    ["Bulk Up", "Corpulencia"],
    ["Aurora Veil", "Velo Aurora"],
    ["Stealth Rock", "Trampa Rocas"],
    ["Spikes", "Púas"],
    ["Toxic Spikes", "Púas Tóxicas"],
    ["Sticky Web", "Red Viscosa"],
];

const DATA_LABEL_REPLACEMENTS = (() => {
    const labels = new Map<string, string>();
    const addEntries = (source: NameTranslationMap | undefined) => {
        for (const [name, data] of Object.entries(source ?? {})) {
            if (data.name) labels.set(name, data.name);
        }
    };

    addEntries(translationsEs.moves);
    addEntries(translationsEs.abilities);
    addEntries(translationsEs.items);
    addEntries(translationsEsOverrides.moves);
    addEntries(translationsEsOverrides.abilities);
    addEntries(translationsEsOverrides.items);

    for (const [name, label] of Object.entries(MANUAL_MOVE_TRANSLATIONS)) {
        labels.set(name, label);
    }
    for (const [name, label] of Object.entries(MANUAL_ITEM_TRANSLATIONS)) {
        labels.set(name, label);
    }

    return Array.from(labels.entries())
        .filter(([name, label]) => normalizeName(name) !== normalizeName(label))
        .sort(([left], [right]) => right.length - left.length);
})();

function escapeRegExp(value: string) {
    return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

export function getTranslatedCompetitiveSetLabel(setName: string, lang: "en" | "es") {
    if (lang !== "es") return setName;

    return [...DATA_LABEL_REPLACEMENTS, ...SET_LABEL_REPLACEMENTS]
        .slice()
        .sort(([left], [right]) => right.length - left.length)
        .reduce(
            (label, [source, translated]) => label.replace(
                new RegExp(`\\b${escapeRegExp(source)}\\b`, "gi"),
                translated
            ),
            setName
        );
}
