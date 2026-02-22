
export interface Pokemon {
  id: number;
  name: string;
  sprites: {
    front_default: string;
    other: {
      'official-artwork': {
        front_default: string;
      };
    };
  };
  types: {
    slot: number;
    type: {
      name: string;
      url: string;
    };
  }[];
  stats: {
    base_stat: number;
    stat: {
      name: string;
    };
  }[];
}

const BASE_URL = 'https://pokeapi.co/api/v2';

export async function getPokemon(name: string): Promise<Pokemon | null> {
  try {
    const formattedName = name.toLowerCase().trim().replace(/ /g, '-');
    const response = await fetch(`${BASE_URL}/pokemon/${formattedName}`);
    if (!response.ok) return null;
    return response.json();
  } catch (error) {
    console.error(`Error fetching pokemon ${name}:`, error);
    return null;
  }
}

export async function getPokemonTypes(): Promise<string[]> {
  try {
    const response = await fetch(`${BASE_URL}/type`);
    const data = await response.json();
    return data.results.map((type: { name: string }) => type.name);
  } catch (error) {
    console.error('Error fetching types:', error);
    return [];
  }
}

export async function getRandomPokemon(type?: string): Promise<Pokemon | null> {
  try {
    let id: number;

    if (type) {
      const response = await fetch(`${BASE_URL}/type/${type}`);
      const data = await response.json();
      const pokemonList = data.pokemon;
      if (!pokemonList.length) return null;

      const randomEntry = pokemonList[Math.floor(Math.random() * pokemonList.length)];
      // Extract ID from URL to avoid another fetch if possible, or just fetch by name
      const name = randomEntry.pokemon.name;
      return getPokemon(name);
    } else {
      // Gen 1-9 approx range, let's say up to 1000 to be safe
      id = Math.floor(Math.random() * 1000) + 1;
    }

    const response = await fetch(`${BASE_URL}/pokemon/${id}`);
    if (!response.ok) return null;
    return response.json();
  } catch (error) {
    console.error('Error fetching random pokemon:', error);
    return null;
  }
}


export type GenerateOptions = {
  size: number;
  tipo?: string;
  fijo?: string[];
};

export async function generateRandomTeam(options: GenerateOptions): Promise<Pokemon[]> {
  const newTeam: Pokemon[] = [];

  // 1. Add fixed pokemon
  if (options.fijo && options.fijo.length > 0) {
    for (const name of options.fijo) {
      const mon = await getPokemon(name);
      if (mon) newTeam.push(mon);
    }
  }

  // 2. Fill the rest with random pokemon
  let attempts = 0;
  const MAX_ATTEMPTS = 50;

  while (newTeam.length < options.size && attempts < MAX_ATTEMPTS) {
    attempts++;
    const slotsNeeded = options.size - newTeam.length;

    // Fetch a batch 
    const promises = Array(slotsNeeded)
      .fill(null)
      .map(() => getRandomPokemon(options.tipo));

    const randomMons = await Promise.all(promises);

    randomMons.forEach((mon) => {
      if (mon && !newTeam.some(p => p.id === mon.id)) {
        if (newTeam.length < options.size) {
          newTeam.push(mon);
        }
      }
    });
  }

  return newTeam;
}
