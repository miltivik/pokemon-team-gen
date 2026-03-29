import learnsetsRaw from "@/data/learnsets.json";
import { getPokemonData } from "@/lib/showdown-data";
import { toID } from "@/lib/utils";

interface LearnsetRecord {
  learnset?: Record<string, unknown>;
  [key: string]: unknown;
}

const learnsets = learnsetsRaw as unknown as Record<string, LearnsetRecord>;

function getLearnsetSources(name: string) {
  const direct = learnsets[toID(name)];
  const pokemon = getPokemonData(name);
  const base = pokemon?.baseSpecies ? learnsets[toID(pokemon.baseSpecies)] : undefined;

  return {
    direct,
    base,
  };
}

function getMergedLearnset(name: string) {
  const { direct, base } = getLearnsetSources(name);
  if (!direct && !base) return undefined;

  const baseLearnset = (base?.learnset ?? base) as Record<string, unknown> | undefined;
  const directLearnset = (direct?.learnset ?? direct) as Record<string, unknown> | undefined;

  return {
    ...(baseLearnset ?? {}),
    ...(directLearnset ?? {}),
  };
}

export function pokemonCanLearnMove(name: string, moveName: string): boolean {
  const learnset = getMergedLearnset(name);
  if (!learnset || typeof learnset !== "object") {
    return false;
  }

  return Boolean(
    Reflect.get(learnset as Record<string, unknown>, toID(moveName))
  );
}
