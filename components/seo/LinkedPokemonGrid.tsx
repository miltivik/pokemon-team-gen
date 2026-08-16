import Link from "next/link";
import Image from "next/image";
import { getPokemonSlug } from "@/lib/pokemon-summary";
import { getPokemonSpriteUrl } from "@/lib/pokemon-sprites";

interface LinkedPokemonGridProps {
  pokemon: string[];
}

/**
 * Grid of internal links to Pokemon profile pages, used to connect pSEO
 * pages (teammates, checks, team cores) with sprite thumbnails.
 */
export function LinkedPokemonGrid({ pokemon }: LinkedPokemonGridProps) {
  return (
    <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-3">
      {pokemon.map((name) => (
        <Link
          key={name}
          href={`/pokemon/${getPokemonSlug(name)}`}
          className="flex flex-col items-center gap-2 p-3 bg-zinc-50 dark:bg-zinc-950/50 rounded-xl border border-zinc-200 dark:border-zinc-800 hover:shadow-md hover:border-blue-300 dark:hover:border-blue-700 transition-all"
        >
          <div className="relative w-12 h-12">
            <Image
              src={getPokemonSpriteUrl(name, "sprite")}
              alt={name}
              fill
              sizes="48px"
              className="object-contain"
              loading="lazy"
            />
          </div>
          <span className="text-xs font-semibold text-zinc-700 dark:text-zinc-300 text-center truncate w-full">
            {name}
          </span>
        </Link>
      ))}
    </div>
  );
}
