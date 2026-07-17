import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import { getAllPokemonNames, getPokemonSlug } from "@/lib/pokemon-summary";
import { getPokemonSpriteUrl } from "@/lib/pokemon-sprites";
import { hasCompetitiveData } from "@/lib/competitive-sets";
import { BreadcrumbJsonLd } from "@/components/seo/BreadcrumbJsonLd";

export const metadata: Metadata = {
  title: "Competitive Pokemon Profiles and Stats",
  description:
    "Browse competitive Pokemon profiles with base stats, abilities, and available roles and movesets from Smogon set data.",
  keywords: [
    "pokemon stats",
    "competitive pokemon",
    "pokemon movesets",
    "pokemon viability",
    "pokemon showdown movesets",
  ],
  alternates: {
    canonical: "/pokemon",
  },
  openGraph: {
    title: "Competitive Pokemon Profiles and Stats",
    description: "Browse competitive Pokemon profiles with base stats, abilities, and available roles and movesets.",
    url: "/pokemon",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Competitive Pokemon Profiles and Stats",
    description: "Browse competitive Pokemon profiles with base stats, abilities, and available roles and movesets.",
  },
};

export default function PokemonIndexPage() {
  const allNames = getAllPokemonNames();
  const competitiveNames = allNames.filter((name) => hasCompetitiveData(name));
  const featured = competitiveNames.slice(0, 60);

  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-black font-sans">
      <BreadcrumbJsonLd
        items={[
          { name: "Home", item: "/" },
          { name: "Pokemon", item: "/pokemon" },
        ]}
      />
      <main className="container mx-auto px-4 py-12 max-w-5xl">
        <header className="mb-10 text-center">
          <h1 className="text-3xl font-black tracking-tight text-zinc-900 dark:text-zinc-50 mb-3">
            Competitive Pokemon Profiles
          </h1>
          <p className="text-lg text-zinc-600 dark:text-zinc-400 max-w-2xl mx-auto">
            Browse base stats, abilities and available competitive roles and movesets for Pokemon with Smogon set data.
          </p>
        </header>

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
          {featured.map((name) => {
            const spriteUrl = getPokemonSpriteUrl(name, "sprite");
            return (
              <Link
                key={name}
              href={`/pokemon/${getPokemonSlug(name)}`}
                className="flex flex-col items-center gap-2 p-3 bg-white dark:bg-zinc-900 rounded-xl border border-zinc-200 dark:border-zinc-800 hover:shadow-md hover:border-blue-300 dark:hover:border-blue-700 transition-all"
              >
                <div className="relative w-12 h-12">
                  <Image
                    src={spriteUrl}
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
            );
          })}
        </div>
      </main>
    </div>
  );
}
