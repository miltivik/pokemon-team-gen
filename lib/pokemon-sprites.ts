import pokemonNumbersRaw from "../data/pokemon-numbers.json";

type PokemonSpriteInput = string | { name?: string; num?: number | null };
export type PokemonSpriteVariant = "artwork" | "sprite";

const OFFICIAL_ARTWORK_BASE =
    "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork";
const POKEAPI_SPRITE_BASE =
    "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon";
const FALLBACK_SPRITE_URL =
    "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/0.png";

const pokemonNumbers = pokemonNumbersRaw as Record<string, number>;

const VARIANT_POKEAPI_IDS: Record<string, number> = {
    "Rattata-Alola": 10091,
    "Raticate-Alola": 10092,
    "Raichu-Alola": 10100,
    "Sandshrew-Alola": 10101,
    "Sandslash-Alola": 10102,
    "Vulpix-Alola": 10103,
    "Ninetales-Alola": 10104,
    "Diglett-Alola": 10105,
    "Dugtrio-Alola": 10106,
    "Meowth-Alola": 10107,
    "Persian-Alola": 10108,
    "Geodude-Alola": 10109,
    "Graveler-Alola": 10110,
    "Golem-Alola": 10111,
    "Grimer-Alola": 10112,
    "Muk-Alola": 10113,
    "Exeggutor-Alola": 10114,
    "Marowak-Alola": 10115,
    "Meowth-Galar": 10161,
    "Ponyta-Galar": 10162,
    "Rapidash-Galar": 10163,
    "Slowpoke-Galar": 10164,
    "Slowbro-Galar": 10165,
    "Farfetch'd-Galar": 10166,
    "Weezing-Galar": 10167,
    "Articuno-Galar": 10169,
    "Zapdos-Galar": 10170,
    "Moltres-Galar": 10171,
    "Slowking-Galar": 10172,
    "Corsola-Galar": 10173,
    "Zigzagoon-Galar": 10174,
    "Linoone-Galar": 10175,
    "Darumaka-Galar": 10176,
    "Darmanitan-Galar": 10177,
    "Darmanitan-Galar-Zen": 10178,
    "Yamask-Galar": 10179,
    "Stunfisk-Galar": 10180,
    "Mr. Mime-Galar": 10168,
    "Growlithe-Hisui": 10229,
    "Arcanine-Hisui": 10230,
    "Voltorb-Hisui": 10231,
    "Electrode-Hisui": 10232,
    "Typhlosion-Hisui": 10233,
    "Qwilfish-Hisui": 10234,
    "Sneasel-Hisui": 10235,
    "Samurott-Hisui": 10236,
    "Lilligant-Hisui": 10237,
    "Zorua-Hisui": 10238,
    "Zoroark-Hisui": 10239,
    "Braviary-Hisui": 10240,
    "Sliggoo-Hisui": 10241,
    "Goodra-Hisui": 10242,
    "Avalugg-Hisui": 10243,
    "Decidueye-Hisui": 10244,
    "Wooper-Paldea": 10253,
    "Tauros-Paldea-Combat": 10250,
    "Tauros-Paldea-Blaze": 10251,
    "Tauros-Paldea-Aqua": 10252,
    "Dialga-Origin": 10245,
    "Palkia-Origin": 10246,
    "Giratina-Origin": 10007,
    "Kyogre-Primal": 10077,
    "Groudon-Primal": 10078,
    "Tornadus-Therian": 10019,
    "Thundurus-Therian": 10020,
    "Landorus-Therian": 10021,
    "Enamorus-Therian": 10249,
    "Magearna-Original": 10147,
    "Venusaur-Gmax": 10195,
    "Charizard-Gmax": 10196,
    "Blastoise-Gmax": 10197,
    "Butterfree-Gmax": 10198,
    "Pikachu-Gmax": 10199,
    "Meowth-Gmax": 10200,
    "Machamp-Gmax": 10201,
    "Gengar-Gmax": 10202,
    "Kingler-Gmax": 10203,
    "Lapras-Gmax": 10204,
    "Eevee-Gmax": 10205,
    "Snorlax-Gmax": 10206,
    "Garbodor-Gmax": 10207,
    "Melmetal-Gmax": 10208,
    "Rillaboom-Gmax": 10209,
    "Cinderace-Gmax": 10210,
    "Inteleon-Gmax": 10211,
    "Corviknight-Gmax": 10212,
    "Orbeetle-Gmax": 10213,
    "Drednaw-Gmax": 10214,
    "Coalossal-Gmax": 10215,
    "Flapple-Gmax": 10216,
    "Appletun-Gmax": 10217,
    "Sandaconda-Gmax": 10218,
    "Centiskorch-Gmax": 10220,
    "Hatterene-Gmax": 10221,
    "Grimmsnarl-Gmax": 10222,
    "Alcremie-Gmax": 10223,
    "Copperajah-Gmax": 10224,
    "Duraludon-Gmax": 10225,
    "Urshifu-Rapid-Strike-Gmax": 10227,
    "Toxtricity-Low-Key-Gmax": 10228,
};

function toPokemonDbSlug(name: string) {
    return name
        .toLowerCase()
        .replace(/♀/g, "-f")
        .replace(/♂/g, "-m")
        .replace(/[.'’]/g, "")
        .replace(/[\s/]+/g, "-")
        .replace(/[^a-z0-9-]/g, "")
        .replace(/-+/g, "-")
        .replace(/^-|-$/g, "");
}

export function getPokemonSpriteUrl(
    pokemon: PokemonSpriteInput,
    variant: PokemonSpriteVariant = "artwork"
): string {
    const name = typeof pokemon === "string" ? pokemon : pokemon?.name ?? "";
    const num =
        typeof pokemon === "string"
            ? pokemonNumbers[name] ?? 0
            : pokemon?.num ?? pokemonNumbers[name] ?? 0;
    const baseUrl = variant === "sprite" ? POKEAPI_SPRITE_BASE : OFFICIAL_ARTWORK_BASE;

    if (!name) {
        return FALLBACK_SPRITE_URL;
    }

    const variantId = VARIANT_POKEAPI_IDS[name];
    if (variantId) {
        return `${baseUrl}/${variantId}.png`;
    }

    if (num > 0) {
        return `${baseUrl}/${num}.png`;
    }

    if (variant === "sprite") {
        return FALLBACK_SPRITE_URL;
    }

    return `https://img.pokemondb.net/artwork/large/${toPokemonDbSlug(name)}.jpg`;
}
