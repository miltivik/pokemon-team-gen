import pokemonSummariesRaw from "../data/pokemon-summaries.json";
import pokedexRaw from "../data/pokedex.json";
export { getPokemonSlug } from "./pokemon-slug";

type BaseStats = {
    hp: number;
    atk: number;
    def: number;
    spa: number;
    spd: number;
    spe: number;
};

export interface PokemonSummary {
    num: number;
    types: string[];
    baseStats: BaseStats;
    abilities: Record<string, string>;
}

const pokemonSummaries = pokemonSummariesRaw as Record<string, PokemonSummary>;
const pokedex = pokedexRaw as Record<string, { name?: string }>;

function normalizePokemonName(name: string) {
    return name
        .normalize("NFKD")
        .replace(/[\u0300-\u036f]/g, "")
        .toLowerCase()
        .replace(/[^a-z0-9]/g, "");
}

const normalizedNameMap = Object.entries(pokemonSummaries).reduce<Record<string, PokemonSummary>>(
    (acc, [name, summary]) => {
        acc[normalizePokemonName(name)] = summary;
        return acc;
    },
    {}
);

const displayNameMap = Object.keys(pokemonSummaries).reduce<Record<string, string>>(
    (acc, id) => {
        const displayName = pokedex[id]?.name || id;
        acc[normalizePokemonName(displayName)] = displayName;
        return acc;
    },
    {}
);

const allPokemonNames = Object.values(displayNameMap).sort((a, b) => a.localeCompare(b));

export function getPokemonSummary(name: string): PokemonSummary | undefined {
    return pokemonSummaries[name] ?? normalizedNameMap[normalizePokemonName(name)];
}

export function getPokemonDisplayName(name: string): string | undefined {
    return displayNameMap[normalizePokemonName(name)];
}

export function getAllPokemonNames() {
    return allPokemonNames;
}
