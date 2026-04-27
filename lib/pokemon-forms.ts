import pokemonNumbersRaw from "@/data/pokemon-numbers.json";
import { toID } from "@/lib/utils";

type PokemonIdentityLike = {
  name: string;
  baseSpecies?: string;
};

const pokemonNumbers = pokemonNumbersRaw as Record<string, number>;
const canonicalNameByNumber = new Map<number, string>();

for (const [name, number] of Object.entries(pokemonNumbers)) {
  if (!canonicalNameByNumber.has(number)) {
    canonicalNameByNumber.set(number, name);
  }
}

function resolvePokemonIdentity(pokemon: string | PokemonIdentityLike): PokemonIdentityLike {
  if (typeof pokemon !== "string") {
    return pokemon;
  }

  const number = pokemonNumbers[pokemon];
  return {
    name: number ? canonicalNameByNumber.get(number) ?? pokemon : pokemon,
  };
}

export function getCanonicalSpeciesName(
  pokemon: string | PokemonIdentityLike
): string {
  const resolved = resolvePokemonIdentity(pokemon);
  return resolved?.baseSpecies || resolved?.name || String(pokemon);
}

export function getCanonicalSpeciesId(
  pokemon: string | PokemonIdentityLike
): string {
  return toID(getCanonicalSpeciesName(pokemon));
}
