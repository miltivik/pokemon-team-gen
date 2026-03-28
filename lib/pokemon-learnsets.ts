import learnsetsRaw from "@/data/learnsets.json";
import { getPokemonData } from "@/lib/showdown-data";
import { toID } from "@/lib/utils";

interface LearnsetRecord {
  learnset?: Record<string, unknown>;
  [key: string]: unknown;
}

const learnsets = learnsetsRaw as unknown as Record<string, LearnsetRecord>;

function getLearnsetRecord(name: string): LearnsetRecord | undefined {
  const direct = learnsets[toID(name)];
  if (direct) return direct;

  const pokemon = getPokemonData(name);
  if (!pokemon?.baseSpecies) return undefined;

  return learnsets[toID(pokemon.baseSpecies)];
}

export function pokemonCanLearnMove(name: string, moveName: string): boolean {
  const record = getLearnsetRecord(name);
  if (!record) return false;

  const learnsetSource = record.learnset ?? record;
  if (!learnsetSource || typeof learnsetSource !== "object") {
    return false;
  }

  return Boolean(
    Reflect.get(learnsetSource as Record<string, unknown>, toID(moveName))
  );
}
