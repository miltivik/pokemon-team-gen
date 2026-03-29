import { getPokemonData, type PokedexEntry } from "@/lib/showdown-data";
import { toID } from "@/lib/utils";

type PokemonIdentityLike = {
  name: string;
  baseSpecies?: string;
};

function resolvePokemonIdentity(
  pokemon: string | PokemonIdentityLike
): PokemonIdentityLike | PokedexEntry | undefined {
  if (typeof pokemon !== "string") {
    return pokemon;
  }

  return getPokemonData(pokemon) ?? { name: pokemon };
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
