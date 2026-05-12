import type { Metadata } from "next";
import Link from "next/link";
import { TEMPLATES, TemplateId } from "@/config/templates";
import { BreadcrumbJsonLd } from "@/components/seo/BreadcrumbJsonLd";

export const metadata: Metadata = {
  title: "Team Archetypes and Strategies",
  description:
    "Explore competitive Pokemon team archetypes including Rain, Hyper Offense, Stall, Trick Room and more. Learn roles, cores and strategies.",
  keywords: [
    "pokemon team archetypes",
    "rain team pokemon",
    "hyper offense team",
    "trick room team",
    "competitive team strategies",
  ],
  alternates: {
    canonical: "/teams",
  },
  openGraph: {
    title: "Team Archetypes and Strategies",
    description: "Explore competitive Pokemon team archetypes and strategies.",
    url: "/teams",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Team Archetypes and Strategies",
    description: "Explore competitive Pokemon team archetypes and strategies.",
  },
};

const ARCHETYPE_DESCRIPTIONS: Record<string, string> = {
  balanced: "A well-rounded team with a mix of offensive and defensive Pokemon. Good for beginners learning competitive play.",
  offense: "An aggressive team focused on breaking through the opponent's defenses as quickly as possible.",
  bulkyoffense: "Offensive Pokemon with enough bulk to take hits and maintain momentum throughout the match.",
  stall: "A defensive team designed to outlast the opponent through recovery, status and residual damage.",
  semistall: "A hybrid between stall and balanced, with strong defensive cores and a single win condition.",
  weatheroffense: "A team built around weather conditions to boost the power of specific Pokemon and moves.",
  rain: "A rain team uses Drizzle setters and Swift Swim abusers to dominate with boosted Water moves and Speed.",
  sun: "A sun team leverages Drought and Chlorophyll to outspeed opponents and fire off powerful Fire attacks.",
  sand: "A sandstorm team uses Sand Stream to chip down opponents while Sand Rush users sweep.",
  trickroom: "A Trick Room team flips speed tiers, allowing slow but powerful Pokemon to move first.",
  tailwind: "A Tailwind team boosts the speed of all allies for a few turns, enabling fast sweepers in doubles.",
  voltturn: "A Volt-Turn team chains U-turn and Volt Switch to maintain momentum and scout the opponent.",
  hazardstack: "A Hazard Stack team layers entry hazards and prevents removal to wear down the opponent's team.",
  random: "A completely random team for fun or testing unexpected strategies.",
};

export default function TeamsIndexPage() {
  const templates = Object.entries(TEMPLATES) as [TemplateId, (typeof TEMPLATES)[TemplateId]][];

  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-black font-sans">
      <BreadcrumbJsonLd
        items={[
          { name: "Home", item: "/" },
          { name: "Team Archetypes", item: "/teams" },
        ]}
      />
      <main className="container mx-auto px-4 py-12 max-w-4xl">
        <header className="mb-10 text-center">
          <h1 className="text-3xl font-black tracking-tight text-zinc-900 dark:text-zinc-50 mb-3">
            Team Archetypes and Strategies
          </h1>
          <p className="text-lg text-zinc-600 dark:text-zinc-400 max-w-2xl mx-auto">
            Explore competitive Pokemon team archetypes. Understand the roles, required Pokemon and strategies behind each playstyle.
          </p>
        </header>

        <div className="grid gap-4 sm:grid-cols-2">
          {templates.map(([id, template]) => (
            <Link
              key={id}
              href={`/teams/${id}`}
              className="block p-5 bg-white dark:bg-zinc-900 rounded-xl border border-zinc-200 dark:border-zinc-800 hover:shadow-md hover:border-blue-300 dark:hover:border-blue-700 transition-all"
            >
              <div className="flex items-center justify-between mb-2">
                <h2 className="text-lg font-bold text-zinc-900 dark:text-zinc-100">{template.label}</h2>
                <span className="text-xs font-mono text-zinc-400 dark:text-zinc-500">{id}</span>
              </div>
              <p className="text-sm text-zinc-600 dark:text-zinc-400 leading-relaxed">
                {ARCHETYPE_DESCRIPTIONS[id] || `Build a competitive ${template.label} team.`}
              </p>
            </Link>
          ))}
        </div>
      </main>
    </div>
  );
}
