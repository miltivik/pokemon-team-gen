import translationsEsRaw from "../data/translations-es.json";

type NameTranslationMap = Record<string, { name?: string }>;

const translationsEs = translationsEsRaw as {
    moves: NameTranslationMap;
    items: NameTranslationMap;
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

const normalizedMoveTranslations = createNormalizedMap(translationsEs.moves);
const normalizedItemTranslations = createNormalizedMap(translationsEs.items);

export function getTranslatedMoveLabel(moveName: string, lang: "en" | "es") {
    if (lang !== "es") {
        return moveName;
    }

    return MANUAL_MOVE_TRANSLATIONS[moveName]
        || translationsEs.moves[moveName]?.name
        || normalizedMoveTranslations[normalizeName(moveName)]
        || moveName;
}

export function getTranslatedItemLabel(itemName: string, lang: "en" | "es") {
    if (lang !== "es") {
        return itemName;
    }

    return MANUAL_ITEM_TRANSLATIONS[itemName]
        || translationsEs.items[itemName]?.name
        || normalizedItemTranslations[normalizeName(itemName)]
        || itemName;
}
