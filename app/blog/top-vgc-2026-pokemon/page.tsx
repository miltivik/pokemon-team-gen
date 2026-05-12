import type { Metadata } from "next";
import Link from "next/link";
import Script from "next/script";

export const metadata: Metadata = {
  title: "Top VGC 2026 Pokemon and Team Cores",
  description:
    "Explore the strongest Pokemon and cores dominating VGC 2026 Regulation F. From Flutter Mane to Incineroar, build winning doubles teams.",
  keywords: [
    "vgc 2026 pokemon",
    "best vgc pokemon",
    "vgc regulation f",
    "flutter mane vgc",
    "incineroar vgc",
  ],
  alternates: {
    canonical: "/blog/top-vgc-2026-pokemon",
  },
  openGraph: {
    title: "Top VGC 2026 Pokemon and Team Cores",
    description:
      "Explore the strongest Pokemon and cores dominating VGC 2026 Regulation F.",
    url: "/blog/top-vgc-2026-pokemon",
    type: "article",
  },
  twitter: {
    card: "summary_large_image",
    title: "Top VGC 2026 Pokemon and Team Cores",
    description:
      "Explore the strongest Pokemon and cores dominating VGC 2026 Regulation F.",
  },
};

const jsonLd = {
  "@context": "https://schema.org",
  "@type": "Article",
  headline: "Top VGC 2026 Pokemon and Team Cores",
  description:
    "Explore the strongest Pokemon and cores dominating VGC 2026 Regulation F.",
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
  mainEntityOfPage: "https://poketeambuilder.com/blog/top-vgc-2026-pokemon",
};

function slug(name: string) {
  return name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
}

export default function TopVgcPokemonArticle() {
  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-black font-sans">
      <Script
        id="article-jsonld-vgc"
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
              <span className="px-2 py-0.5 bg-violet-100 dark:bg-violet-900/50 text-violet-700 dark:text-violet-300 rounded text-xs font-medium">
                VGC 2026
              </span>
              <span className="px-2 py-0.5 bg-pink-100 dark:bg-pink-900/50 text-pink-700 dark:text-pink-300 rounded text-xs font-medium">
                Doubles
              </span>
            </div>
            <h1 className="text-3xl font-bold tracking-tight text-zinc-900 dark:text-zinc-50 mb-3">
              Top VGC 2026 Pokemon and Team Cores
            </h1>
            <p className="text-zinc-500 dark:text-zinc-400 text-sm">
              May 3, 2026 · 8 min read
            </p>
          </header>

          <div className="prose-custom space-y-6 text-zinc-700 dark:text-zinc-300 leading-relaxed">
            <p className="text-lg">
              VGC 2026 Regulation F has brought a diverse and dynamic metagame. With restricted legendaries banned and a wide Paldea dex available, teambuilding revolves around powerful cores that control speed, positioning, and damage output. Here are the top Pokemon and cores you need to know.
            </p>

            <h2 className="text-2xl font-bold text-zinc-900 dark:text-zinc-100 mt-8 mb-4">
              1. Flutter Mane — The Ghost Fairy Menace
            </h2>
            <p>
              {" "}
              <Link href={`/pokemon/${slug("Flutter Mane")}`} className="text-blue-600 dark:text-blue-400 hover:underline">
                Flutter Mane
              </Link>{" "}
              remains one of the most dominant Pokemon in VGC 2026. With incredible Speed, Special Attack, and a fantastic Ghost/Fairy typing, it threatens a huge portion of the metagame. Shadow Ball and Moonblast provide amazing coverage, while Dazzling Gleam lets it hit both opponents in doubles.
            </p>

            <h2 className="text-2xl font-bold text-zinc-900 dark:text-zinc-100 mt-8 mb-4">
              2. Incineroar — The Support King
            </h2>
            <p>
              No VGC format feels complete without{" "}
              <Link href={`/pokemon/${slug("Incineroar")}`} className="text-blue-600 dark:text-blue-400 hover:underline">
                Incineroar
              </Link>{" "}
              . Intimidate, Fake Out, Parting Shot, and U-turn make it the ultimate support Pokemon. It enables aggressive partners by reducing the opponent&apos;s damage output and creates free turns with Fake Out pressure. Every serious VGC team should consider Incineroar.
            </p>

            <h2 className="text-2xl font-bold text-zinc-900 dark:text-zinc-100 mt-8 mb-4">
              3. Rillaboom — Grassy Glide Priority
            </h2>
            <p>
              {" "}
              <Link href={`/pokemon/${slug("Rillaboom")}`} className="text-blue-600 dark:text-blue-400 hover:underline">
                Rillaboom
              </Link>{" "}
              brings Grassy Surge and priority Grassy Glide to VGC 2026. Under grassy terrain, Grassy Glide has +1 priority, letting Rillaboom pick off weakened threats before they move. It also provides valuable recovery to grounded allies and pairs well with Fire-types that appreciate reduced Earthquake damage.
            </p>

            <h2 className="text-2xl font-bold text-zinc-900 dark:text-zinc-100 mt-8 mb-4">
              4. Chi-Yu — The Glass Cannon
            </h2>
            <p>
              Beads of Ruin makes{" "}
              <Link href={`/pokemon/${slug("Chi-Yu")}`} className="text-blue-600 dark:text-blue-400 hover:underline">
                Chi-Yu
              </Link>{" "}
              one of the strongest special attackers in the format. Its ability reduces the Special Defense of all other Pokemon on the field, effectively giving its moves a permanent boost. Heat Wave and Dark Pulse provide excellent spread and single-target damage respectively.
            </p>

            <h2 className="text-2xl font-bold text-zinc-900 dark:text-zinc-100 mt-8 mb-4">
              5. Torkoal — The Trick Room Enabler
            </h2>
            <p>
              {" "}
              <Link href={`/pokemon/${slug("Torkoal")}`} className="text-blue-600 dark:text-blue-400 hover:underline">
                Torkoal
              </Link>{" "}
              is the face of Trick Room and sun cores in VGC 2026. With Drought and access to Eruption, it provides massive spread damage under sun. It pairs perfectly with Jumpluff for fast Sleep Powder and speed control, creating one of the most popular cores in the format.
            </p>

            <h2 className="text-2xl font-bold text-zinc-900 dark:text-zinc-100 mt-8 mb-4">
              Core Combinations to Try
            </h2>
            <ul className="list-disc pl-6 space-y-3 my-4">
              <li>
                <strong>Incineroar + Flutter Mane:</strong> Intimidate and Fake Out let Flutter Mane safely deal massive damage.
              </li>
              <li>
                <strong>Torkoal + Jumpluff:</strong> Speed control and sun-boosted Eruption overwhelm slower teams.
              </li>
              <li>
                <strong>Rillaboom + Heatran:</strong> Grassy Surge reduces Heatran&apos;s Ground weakness while providing priority cleanup.
              </li>
            </ul>

            <div className="mt-10 p-6 bg-violet-50 dark:bg-violet-950/30 rounded-xl border border-violet-200 dark:border-violet-800">
              <h3 className="font-semibold text-zinc-900 dark:text-zinc-100 mb-2">
                Build Your VGC 2026 Team
              </h3>
              <p className="text-sm mb-4">
                Use our team generator to create a VGC Regulation F team with optimal movesets, items and EV spreads.
              </p>
              <Link
                href="/configurar?format=gen9vgc2026f"
                className="inline-flex items-center gap-2 px-5 py-2 bg-violet-600 hover:bg-violet-700 text-white font-semibold rounded-lg transition-colors text-sm"
              >
                Generate VGC Team &rarr;
              </Link>
            </div>
          </div>
        </article>
      </main>
    </div>
  );
}
