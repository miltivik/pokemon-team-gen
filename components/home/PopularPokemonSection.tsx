import { getPopularPokemon } from "@/lib/related-pokemon";
import { LinkedPokemonGrid } from "@/components/seo/LinkedPokemonGrid";

/**
 * Homepage strip of the most used Pokemon in the current meta, linking to
 * their profile pages to feed internal links toward the /pokemon pSEO cluster.
 */
export async function PopularPokemonSection() {
  const popular = await getPopularPokemon(12);

  if (popular.length === 0) return null;

  return (
    <section className="w-full max-w-5xl py-10 text-center" aria-labelledby="popular-title">
      <h2 id="popular-title" className="text-3xl font-black tracking-tight text-zinc-900 dark:text-white">
        Popular Pokemon Right Now
      </h2>
      <p className="mt-3 text-zinc-600 dark:text-zinc-400">
        The most used Pokemon in current Gen 9 OU battles. Open a profile for stats, movesets and teammates.
      </p>
      <div className="mt-8 text-left">
        <LinkedPokemonGrid pokemon={popular} />
      </div>
    </section>
  );
}
