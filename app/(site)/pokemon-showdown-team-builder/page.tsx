import type { Metadata } from "next";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { BreadcrumbJsonLd } from "@/components/seo/BreadcrumbJsonLd";

export const metadata: Metadata = {
  title: "Pokemon Showdown Team Builder | Gen 9 OU & VGC",
  description:
    "Build competitive Pokemon Showdown teams in three steps: choose a format, pick an archetype, optimize your roster and export a ready-to-use team for battle.",
  keywords: [
    "pokemon showdown team builder",
    "pokemon showdown team generator",
    "pokemon team builder",
    "gen 9 ou team builder",
    "vgc team builder",
    "pokemon showdown export team",
  ],
  alternates: {
    canonical: "/pokemon-showdown-team-builder",
  },
  openGraph: {
    title: "Pokemon Showdown Team Builder | Gen 9 OU & VGC",
    description:
      "Build competitive Pokemon Showdown teams in three steps: choose a format, pick an archetype, optimize your roster and export a ready-to-use team for battle.",
    url: "/pokemon-showdown-team-builder",
    type: "website",
    images: ["/og-image.png"],
  },
  twitter: {
    card: "summary_large_image",
    title: "Pokemon Showdown Team Builder | Gen 9 OU & VGC",
    description:
      "Build competitive Pokemon Showdown teams in three steps: choose a format, pick an archetype, optimize your roster and export a ready-to-use team for battle.",
    images: ["/og-image.png"],
  },
};

const FORMATS = [
  { id: "gen9ou", label: "[Gen 9] OU" },
  { id: "gen9vgc2026regi", label: "[Gen 9] VGC 2026 Reg I (Doubles)" },
  { id: "gen9uu", label: "[Gen 9] UU" },
  { id: "gen9ru", label: "[Gen 9] RU" },
  { id: "gen9nationaldex", label: "[Gen 9] National Dex" },
  { id: "gen9doublesou", label: "[Gen 9] Doubles OU" },
  { id: "gen9monotype", label: "[Gen 9] Monotype" },
  { id: "gen9vgc2026f", label: "[Gen 9] VGC Reg F (Legacy)" },
];

const ARCHETYPES = [
  {
    id: "balanced",
    label: "Balanced",
    description:
      "Flexible teams with defensive pivots and reliable attackers that adapt to any matchup.",
    href: "/teams/balanced",
    generateHref: "/configurar?template=balanced&format=gen9ou",
  },
  {
    id: "offense",
    label: "Hyper Offense",
    description:
      "Fast-paced pressure teams that overwhelm the opponent before they can recover.",
    href: "/teams/offense",
    generateHref: "/configurar?template=offense&format=gen9ou",
  },
  {
    id: "rain",
    label: "Rain",
    description:
      "Drizzle setters paired with Swift Swim sweepers for boosted Water attacks.",
    href: "/teams/rain",
    generateHref: "/configurar?template=rain&format=gen9ou",
  },
  {
    id: "trickroom",
    label: "Trick Room",
    description:
      "Slow, powerful Pokemon that move first under Trick Room. A doubles staple.",
    href: "/teams/trickroom",
    generateHref: "/configurar?template=trickroom&format=gen9vgc2026regi",
  },
  {
    id: "tailwind",
    label: "Tailwind",
    description:
      "Prankster setters and fast attackers that win the speed race in doubles.",
    href: "/teams/tailwind",
    generateHref: "/configurar?template=tailwind&format=gen9vgc2026regi",
  },
  {
    id: "stall",
    label: "Stall",
    description:
      "Defensive cores with hazard support that outlast opposing teams in long games.",
    href: "/teams/stall",
    generateHref: "/configurar?template=stall&format=gen9ou",
  },
];

const FAQ_ITEMS = [
  {
    question: "What is a Pokemon Showdown team builder?",
    answer:
      "A Pokemon Showdown team builder creates a complete six-Pokemon team with optimized movesets, items, abilities, natures and EV spreads, ready to copy into Pokemon Showdown. Our builder uses Smogon and Pikalytics usage data to pick Pokemon that work well together in the current metagame.",
  },
  {
    question: "Which formats does the team builder support?",
    answer:
      "The builder supports Gen 9 OU, VGC 2026 Reg I, UU, RU, National Dex, Doubles OU, Monotype and legacy VGC Reg F, plus older generations from Gen 1 to Gen 8. Each format applies its own rules for legal Pokemon, banned species and item clauses.",
  },
  {
    question: "Is the VGC team builder based on Regulation I rules?",
    answer:
      "Yes. VGC 2026 Reg I on Pokemon Showdown allows up to two restricted legendaries, enforces a unique items clause, and bans mythical Pokemon. The generator and validator enforce these rules when you build a VGC team.",
  },
  {
    question: "How do I export a team to Pokemon Showdown?",
    answer:
      "Click 'Export Team' after generating your team, copy the generated text, open Pokemon Showdown's Teambuilder, click 'New Team', then 'Import from text', and paste. The exported format is exactly what Showdown expects.",
  },
  {
    question: "Can I build a VGC doubles team with restricted legendaries?",
    answer:
      "Yes. Select the VGC 2026 Reg I format and the generator will include up to two restricted legendaries such as Miraidon, Koraidon, Calyrex or Zacian while keeping the rest of the team legal under Regulation I rules.",
  },
  {
    question: "How is this different from Pokemon Champions?",
    answer:
      "Pokemon Champions is the official competitive circuit's new game and uses a different regulation line (Regulation M). This team builder targets Pokemon Showdown, where the current VGC format is [Gen 9] VGC 2026 Reg I. The two rulesets are not interchangeable.",
  },
];

export default function PokemonShowdownTeamBuilderPage() {
  const webPageJsonLd = {
    "@context": "https://schema.org",
    "@type": "WebPage",
    name: "Pokemon Showdown Team Builder",
    description:
      "Build competitive Pokemon teams for Pokemon Showdown in three steps: pick a format, choose an archetype, and export your team.",
    url: "https://poketeambuilder.com/pokemon-showdown-team-builder",
    isPartOf: {
      "@type": "WebSite",
      name: "Pokemon Team Generator",
      url: "https://poketeambuilder.com",
    },
    about: {
      "@type": "Thing",
      name: "Pokemon Showdown Team Building",
    },
    inLanguage: "en",
  };

  const faqJsonLd = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: FAQ_ITEMS.map((item) => ({
      "@type": "Question",
      name: item.question,
      acceptedAnswer: {
        "@type": "Answer",
        text: item.answer,
      },
    })),
  };

  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-black font-sans">
      <BreadcrumbJsonLd
        items={[
          { name: "Home", item: "/" },
          { name: "Pokemon Showdown Team Builder", item: "/pokemon-showdown-team-builder" },
        ]}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(webPageJsonLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd) }}
      />
      <main className="container mx-auto flex flex-col items-center gap-10 px-4 py-12">
        <header className="max-w-3xl space-y-4 text-center">
          <div className="inline-flex items-center justify-center rounded-full bg-blue-100 px-3 py-1 text-sm font-semibold text-blue-700 dark:bg-blue-950/40 dark:text-blue-300">
            Free · No registration
          </div>
          <h1 className="text-4xl font-black tracking-tight text-zinc-900 dark:text-zinc-50 sm:text-5xl">
            Pokemon Showdown Team Builder
          </h1>
          <p className="text-lg leading-relaxed text-zinc-600 dark:text-zinc-400">
            Build a competitive team for Pokemon Showdown in three steps. The builder
            analyzes real Smogon and Pikalytics usage data to create synergistic,
            legal teams with optimized movesets, items and EV spreads.
          </p>
        </header>

        <section className="w-full max-w-4xl">
          <h2 className="mb-6 text-center text-2xl font-bold text-zinc-900 dark:text-zinc-50">
            How the Team Builder Works
          </h2>
          <div className="grid gap-6 md:grid-cols-3">
            {[
              {
                step: "1",
                title: "Choose your format",
                description:
                  "Pick Gen 9 OU, VGC 2026 Reg I, UU, RU, National Dex, Doubles OU, Monotype or a legacy format. The builder applies each format's rules automatically.",
              },
              {
                step: "2",
                title: "Pick a playstyle",
                description:
                  "Choose an archetype such as Balanced, Hyper Offense, Rain, Trick Room or Tailwind. The generator fills every slot with a Pokemon that fits the role.",
              },
              {
                step: "3",
                title: "Export and play",
                description:
                  "Copy the Showdown-format team text, paste it into the Showdown Teambuilder and start battling. Teams are fully legal for the selected format.",
              },
            ].map((item) => (
              <Card key={item.step} className="border-zinc-200 bg-white dark:border-zinc-800 dark:bg-zinc-900">
                <CardHeader>
                  <div className="mb-2 flex h-10 w-10 items-center justify-center rounded-xl bg-blue-100 text-lg font-black text-blue-700 dark:bg-blue-950/40 dark:text-blue-300">
                    {item.step}
                  </div>
                  <CardTitle className="text-lg">{item.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm leading-relaxed text-zinc-600 dark:text-zinc-400">
                    {item.description}
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>

        <section className="w-full max-w-4xl">
          <h2 className="mb-6 text-center text-2xl font-bold text-zinc-900 dark:text-zinc-50">
            Supported Formats
          </h2>
          <div className="flex flex-wrap justify-center gap-3">
            {FORMATS.map((format) => (
              <Link
                key={format.id}
                href={`/configurar?format=${format.id}`}
                className="rounded-full border border-zinc-200 bg-white px-4 py-2 text-sm font-semibold text-zinc-700 transition-colors hover:border-blue-300 hover:text-blue-600 dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-300 dark:hover:border-blue-900 dark:hover:text-blue-400"
              >
                {format.label}
              </Link>
            ))}
          </div>
          <p className="mt-4 text-center text-sm text-zinc-500 dark:text-zinc-400">
            VGC 2026 Reg I follows the current Showdown regulation: up to two
            restricted legendaries, unique items, and no mythical Pokemon.
          </p>
        </section>

        <section className="w-full max-w-4xl">
          <h2 className="mb-6 text-center text-2xl font-bold text-zinc-900 dark:text-zinc-50">
            Team Archetypes
          </h2>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {ARCHETYPES.map((archetype) => (
              <Card key={archetype.id} className="border-zinc-200 bg-white dark:border-zinc-800 dark:bg-zinc-900">
                <CardHeader>
                  <CardTitle className="text-lg">{archetype.label}</CardTitle>
                </CardHeader>
                <CardContent className="flex flex-col gap-4">
                  <p className="text-sm leading-relaxed text-zinc-600 dark:text-zinc-400">
                    {archetype.description}
                  </p>
                  <div className="flex gap-2">
                    <Link href={archetype.generateHref} className="flex-1">
                      <Button size="sm" className="w-full bg-blue-600 text-white hover:bg-blue-700">
                        Build Team
                      </Button>
                    </Link>
                    <Link href={archetype.href}>
                      <Button size="sm" variant="outline">
                        Guide
                      </Button>
                    </Link>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
          <p className="mt-6 text-center">
            <Link
              href="/guides/vgc"
              className="text-blue-600 hover:underline dark:text-blue-400"
            >
              VGC 2026 Reg I doubles guide →
            </Link>
            <span className="mx-3 text-zinc-400">·</span>
            <Link
              href="/guides/gen9-ou"
              className="text-blue-600 hover:underline dark:text-blue-400"
            >
              Gen 9 OU guide →
            </Link>
          </p>
        </section>

        <section className="w-full max-w-4xl">
          <h2 className="mb-6 text-center text-2xl font-bold text-zinc-900 dark:text-zinc-50">
            How to Export and Import Teams in Pokemon Showdown
          </h2>
          <Card className="border-zinc-200 bg-white dark:border-zinc-800 dark:bg-zinc-900">
            <CardContent className="space-y-4 pt-6">
              <ol className="list-decimal space-y-3 pl-6 text-sm leading-relaxed text-zinc-700 dark:text-zinc-300">
                <li>
                  Generate a team on <Link href="/configurar" className="text-blue-600 hover:underline dark:text-blue-400">/configurar</Link> and click the export button. The team text follows the standard Showdown format: name, item, ability, Tera type, EVs, nature and four moves.
                </li>
                <li>
                  Open <a href="https://play.pokemonshowdown.com/teambuilder" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline dark:text-blue-400">pokemonshowdown.com/teambuilder</a> and click &quot;New Team&quot;.
                </li>
                <li>
                  Click &quot;Import from text&quot;, paste the exported team and confirm. Your team is now saved in the Showdown Teambuilder, ready for the ladder or tournaments.
                </li>
              </ol>
              <p className="text-sm text-zinc-500 dark:text-zinc-400">
                You can also review and copy your team again later from the{" "}
                <Link href="/exportar" className="text-blue-600 hover:underline dark:text-blue-400">export page</Link>.
              </p>
            </CardContent>
          </Card>
        </section>

        <section className="w-full max-w-4xl">
          <h2 className="mb-6 text-center text-2xl font-bold text-zinc-900 dark:text-zinc-50">
            Frequently Asked Questions
          </h2>
          <div className="space-y-3">
            {FAQ_ITEMS.map((item) => (
              <details
                key={item.question}
                className="group rounded-xl border border-zinc-200 bg-white p-4 dark:border-zinc-800 dark:bg-zinc-900"
              >
                <summary className="cursor-pointer list-none font-semibold text-zinc-900 marker:hidden dark:text-zinc-50">
                  <span className="mr-2 inline-block text-blue-600 transition-transform group-open:rotate-90 dark:text-blue-400">›</span>
                  {item.question}
                </summary>
                <p className="mt-3 pl-5 text-sm leading-relaxed text-zinc-600 dark:text-zinc-400">
                  {item.answer}
                </p>
              </details>
            ))}
          </div>
        </section>

        <section className="w-full max-w-3xl rounded-3xl bg-gradient-to-br from-blue-600 to-blue-800 px-6 py-12 text-center shadow-2xl">
          <h2 className="text-3xl font-black tracking-tight text-white">
            Build your team now
          </h2>
          <p className="mx-auto mt-4 max-w-xl text-lg text-blue-100">
            Pick a format, choose a playstyle and get a battle-ready team in seconds.
          </p>
          <Link href="/configurar">
            <Button
              size="lg"
              className="mt-8 rounded-full bg-white px-8 text-blue-700 hover:bg-zinc-100"
            >
              Open the Team Builder →
            </Button>
          </Link>
        </section>
      </main>
    </div>
  );
}
