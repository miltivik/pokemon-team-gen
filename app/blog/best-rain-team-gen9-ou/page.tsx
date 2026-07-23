import type { Metadata } from "next";
import Link from "next/link";
import Script from "next/script";

export const metadata: Metadata = {
  title: "Best Rain Team Pokemon for Gen 9 OU",
  description:
    "Discover the best Rain team Pokemon in Gen 9 OU. From Drizzle setters to Swift Swim sweepers, build a dominant weather team for Pokemon Showdown.",
  keywords: [
    "rain team pokemon",
    "gen 9 ou rain",
    "pelipper rain team",
    "swift swim pokemon",
    "weather team gen 9",
  ],
  alternates: {
    canonical: "/blog/best-rain-team-gen9-ou",
  },
  openGraph: {
    title: "Best Rain Team Pokemon for Gen 9 OU",
    description:
      "Discover the best Rain team Pokemon in Gen 9 OU. From Drizzle setters to Swift Swim sweepers.",
    url: "/blog/best-rain-team-gen9-ou",
    type: "article",
    images: ["/og-image.png"],
  },
  twitter: {
    card: "summary_large_image",
    title: "Best Rain Team Pokemon for Gen 9 OU",
    description:
      "Discover the best Rain team Pokemon in Gen 9 OU. From Drizzle setters to Swift Swim sweepers.",
    images: ["/og-image.png"],
  },
};

const jsonLd = {
  "@context": "https://schema.org",
  "@type": "Article",
  headline: "Best Rain Team Pokemon for Gen 9 OU",
  description:
    "Discover the best Rain team Pokemon in Gen 9 OU. From Drizzle setters to Swift Swim sweepers.",
  datePublished: "2026-05-03",
  dateModified: "2026-05-03",
  author: { "@type": "Organization", name: "Pokemon Team Generator" },
  publisher: {
    "@type": "Organization",
    name: "Pokemon Team Generator",
    logo: {
      "@type": "ImageObject",
      url: "https://poketeambuilder.com/icons/logo-dark-nobg.png",
    },
  },
  image: "https://poketeambuilder.com/og-image.png",
  mainEntityOfPage: "https://poketeambuilder.com/blog/best-rain-team-gen9-ou",
};

function slug(name: string) {
  return name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
}

export default function BestRainTeamArticle() {
  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-black font-sans">
      <Script
        id="article-jsonld-rain"
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <main className="container mx-auto px-4 py-12 max-w-3xl">
        <div className="mb-8">
          <Link href="/blog" className="text-blue-600 dark:text-blue-400 hover:underline text-sm">
            &larr; Back to Blog
          </Link>
        </div>

        <article>
          <header className="mb-8">
            <div className="flex gap-2 mb-3">
              <span className="px-2 py-0.5 bg-blue-100 dark:bg-blue-900/50 text-blue-700 dark:text-blue-300 rounded text-xs font-medium">
                Gen 9 OU
              </span>
              <span className="px-2 py-0.5 bg-cyan-100 dark:bg-cyan-900/50 text-cyan-700 dark:text-cyan-300 rounded text-xs font-medium">
                Weather
              </span>
            </div>
            <h1 className="text-3xl font-bold tracking-tight text-zinc-900 dark:text-zinc-50 mb-3">
              Best Rain Team Pokemon for Gen 9 OU
            </h1>
            <p className="text-zinc-500 dark:text-zinc-400 text-sm">
              May 3, 2026 · 7 min read
            </p>
          </header>

          <div className="prose-custom space-y-6 text-zinc-700 dark:text-zinc-300 leading-relaxed">
            <p className="text-lg">
              Rain teams have been a staple of competitive Pokemon since Gen 5, and Gen 9 OU is no exception. With Pelipper providing permanent rain via Drizzle and a host of Swift Swim sweepers available, rain offense remains one of the most threatening archetypes in the current metagame. In this guide, we break down the essential Pokemon for any competitive rain team.
            </p>

            <h2 className="text-2xl font-bold text-zinc-900 dark:text-zinc-100 mt-8 mb-4">
              1. Pelipper — The Rain Setter
            </h2>
            <p>
              No rain team functions without a Drizzle user, and{" "}
              <Link href={`/pokemon/${slug("Pelipper")}`} className="text-blue-600 dark:text-blue-400 hover:underline">
                Pelipper
              </Link>{" "}
              is the premier choice in Gen 9 OU. Its Water/Flying typing grants it crucial resistances, while U-turn provides momentum to bring in sweepers safely. Pelipper also packs Hurricane for a perfectly accurate, powerful STAB move in rain, and Knock Off for utility.
            </p>

            <h2 className="text-2xl font-bold text-zinc-900 dark:text-zinc-100 mt-8 mb-4">
              2. Barraskewda — The Swift Swim Cleaner
            </h2>
            <p>
              {" "}
              <Link href={`/pokemon/${slug("Barraskewda")}`} className="text-blue-600 dark:text-blue-400 hover:underline">
                Barraskewda
              </Link>{" "}
              is arguably the most dangerous Swift Swim sweeper in the tier. With a blistering 136 base Speed that doubles under rain, it outspeeds virtually every unboosted Pokemon in the game. Liquidation and Close Combat provide excellent coverage, making it a terrifying late-game win condition.
            </p>

            <h2 className="text-2xl font-bold text-zinc-900 dark:text-zinc-100 mt-8 mb-4">
              3. Archaludon — The Special Sweeper
            </h2>
            <p>
              {" "}
              <Link href={`/pokemon/${slug("Archaludon")}`} className="text-blue-600 dark:text-blue-400 hover:underline">
                Archaludon
              </Link>{" "}
              brings a unique Steel/Dragon typing and devastating special attacks to rain teams. With Electro Shot charging instantly in rain and Draco Meteor as a nuke, it handles Pokemon that resist Water moves. Its bulk also lets it switch into threats that trouble Barraskewda.
            </p>

            <h2 className="text-2xl font-bold text-zinc-900 dark:text-zinc-100 mt-8 mb-4">
              4. Raging Bolt — The Paradox Tank
            </h2>
            <p>
              {" "}
              <Link href={`/pokemon/${slug("Raging Bolt")}`} className="text-blue-600 dark:text-blue-400 hover:underline">
                Raging Bolt
              </Link>{" "}
              provides rain teams with a powerful Electric-type attacker. Thunder becomes perfectly accurate in rain, and its massive special attack combined with good bulk makes it a fantastic pivot. It handles Water-resistant Flying types and Corviknight that trouble other rain sweepers.
            </p>

            <h2 className="text-2xl font-bold text-zinc-900 dark:text-zinc-100 mt-8 mb-4">
              5. Tornadus-Therian — The Utility Pivot
            </h2>
            <p>
              {" "}
              <Link href={`/pokemon/${slug("Tornadus-Therian")}`} className="text-blue-600 dark:text-blue-400 hover:underline">
                Tornadus-Therian
              </Link>{" "}
              offers Regenerator, U-turn, and Hurricane for rain teams. It acts as a fantastic defensive pivot that can wear down opponents with Knock Off and check Grass-types that threaten Pelipper. Its versatility makes it a glue piece for many offensive teams.
            </p>

            <h2 className="text-2xl font-bold text-zinc-900 dark:text-zinc-100 mt-8 mb-4">
              Building Your Rain Team
            </h2>
            <p>
              A standard rain team core consists of Pelipper plus 2-3 Swift Swim or rain abusers, supported by pivot Pokemon and a defensive backbone. You need answers to Grass-types, Electric-types, and opposing weather. Consider our{" "}
              <Link href="/teams/rain" className="text-blue-600 dark:text-blue-400 hover:underline">
                Rain team archetype guide
              </Link>{" "}
              for a deeper breakdown of roles and strategy.
            </p>

            <div className="mt-10 p-6 bg-blue-50 dark:bg-blue-950/30 rounded-xl border border-blue-200 dark:border-blue-800">
              <h3 className="font-semibold text-zinc-900 dark:text-zinc-100 mb-2">
                Generate a Rain Team
              </h3>
              <p className="text-sm mb-4">
                Use our team generator to build a competitive Gen 9 OU rain team with optimal movesets and EV spreads.
              </p>
              <Link
                href="/configurar?template=rain&format=gen9ou"
                className="inline-flex items-center gap-2 px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg transition-colors text-sm"
              >
                Generate Rain Team &rarr;
              </Link>
            </div>
          </div>
        </article>
      </main>
    </div>
  );
}
