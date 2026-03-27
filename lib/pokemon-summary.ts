import pokemonSummariesRaw from "../data/pokemon-summaries.json";

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

function normalizePokemonName(name: string) {
    return name.toLowerCase().replace(/[^a-z0-9]/g, "");
}

const normalizedNameMap = Object.entries(pokemonSummaries).reduce<Record<string, PokemonSummary>>(
    (acc, [name, summary]) => {
        acc[normalizePokemonName(name)] = summary;
        return acc;
    },
    {}
);

const allPokemonNames = Object.keys(pokemonSummaries).sort((a, b) => a.localeCompare(b));

export function getPokemonSummary(name: string): PokemonSummary | undefined {
    return pokemonSummaries[name] ?? normalizedNameMap[normalizePokemonName(name)];
}

export function getAllPokemonNames() {
    return allPokemonNames;
}
