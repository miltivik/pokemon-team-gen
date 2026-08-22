import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Button } from "@/components/ui/button";
import {
  getAllPokemonNames,
  getPokemonDisplayName,
  getPokemonSlug,
  getPokemonSummary,
} from "@/lib/pokemon-summary";
import { getPokemonSpriteUrl } from "@/lib/pokemon-sprites";
import { hasCompetitiveData, getAvailableRoles, getCompetitiveSetByRole, getAvailableFormats, getCompetitiveMoveNames } from "@/lib/competitive-sets";
import { CORE_FORMATS } from "@/config/format-labels";
import { CURATED_POKEMON } from "@/config/curated-pokemon";
import { getSmogonUrl } from "@/lib/pokemon-tier";
import { getAbilityDescription, getLearnableMovesWithDetails, getPokemonRole, getMoveData } from "@/lib/showdown-data";
import { getChecksFor, getTeammatesFor } from "@/lib/related-pokemon";
import { BreadcrumbJsonLd } from "@/components/seo/BreadcrumbJsonLd";
import { LinkedPokemonGrid } from "@/components/seo/LinkedPokemonGrid";

interface PokemonPageProps {
  params: Promise<{ name: string }>;
}

export const dynamicParams = false;

export async function generateStaticParams() {
  const allNames = getAllPokemonNames();
  // Filter to Pokémon with competitive data to avoid generating thousands of thin pages
  const competitiveNames = allNames.filter((name) => hasCompetitiveData(name));
  return competitiveNames.map((name) => ({ name: getPokemonSlug(name) }));
}

export async function generateMetadata({ params }: PokemonPageProps): Promise<Metadata> {
  const { name } = await params;
  const finalName = getPokemonDisplayName(name);

  if (!finalName || !hasCompetitiveData(finalName)) {
    return {
      title: "Pokemon Profile Not Available",
      robots: { index: false, follow: true },
      alternates: { canonical: null },
    };
  }

  const canonicalSlug = getPokemonSlug(finalName);

  return {
    title: `${finalName} - Stats, Movesets and Competitive Analysis`,
    description: `Explore ${finalName}'s base stats, abilities, and available competitive roles and movesets for Pokemon Showdown team building.`,
    keywords: [
      `${finalName.toLowerCase()} pokemon`,
      `${finalName.toLowerCase()} moveset`,
      `${finalName.toLowerCase()} competitive`,
      "pokemon showdown",
      "pokemon showdown movesets",
    ],
    alternates: {
      canonical: `/pokemon/${canonicalSlug}`,
    },
    openGraph: {
      title: `${finalName} - Stats, Movesets and Competitive Analysis`,
      description: `Explore ${finalName}'s base stats, abilities, and available competitive roles and movesets.`,
      url: `/pokemon/${canonicalSlug}`,
      type: "website",
      images: ["/og-image.png"],
    },
    twitter: {
      card: "summary_large_image",
      title: `${finalName} - Stats, Movesets and Competitive Analysis`,
      description: `Explore ${finalName}'s base stats, abilities, and available competitive roles and movesets.`,
      images: ["/og-image.png"],
    },
  };
}

function StatBar({ label, value, max = 180 }: { label: string; value: number; max?: number }) {
  const percentage = Math.min((value / max) * 100, 100);
  return (
    <div className="flex items-center gap-3">
      <span className="w-8 text-xs font-semibold text-zinc-500 dark:text-zinc-400">{label}</span>
      <div className="flex-1 h-2 bg-zinc-200 dark:bg-zinc-800 rounded-full overflow-hidden">
        <div
          className="h-full bg-blue-600 rounded-full"
          style={{ width: `${percentage}%` }}
        />
      </div>
      <span className="w-8 text-xs font-mono text-zinc-700 dark:text-zinc-300 text-right">{value}</span>
    </div>
  );
}

function TypeBadge({ type }: { type: string }) {
  const colors: Record<string, string> = {
    Normal: "bg-zinc-300 text-zinc-900",
    Fire: "bg-orange-500 text-white",
    Water: "bg-blue-500 text-white",
    Electric: "bg-yellow-400 text-zinc-900",
    Grass: "bg-green-500 text-white",
    Ice: "bg-cyan-300 text-zinc-900",
    Fighting: "bg-red-700 text-white",
    Poison: "bg-purple-600 text-white",
    Ground: "bg-amber-600 text-white",
    Flying: "bg-sky-400 text-zinc-900",
    Psychic: "bg-pink-500 text-white",
    Bug: "bg-lime-500 text-zinc-900",
    Rock: "bg-yellow-700 text-white",
    Ghost: "bg-indigo-700 text-white",
    Dragon: "bg-violet-700 text-white",
    Dark: "bg-stone-700 text-white",
    Steel: "bg-slate-400 text-zinc-900",
    Fairy: "bg-rose-300 text-zinc-900",
  };

  return (
    <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase ${colors[type] || "bg-zinc-500 text-white"}`}>
      {type}
    </span>
  );
}

export default async function PokemonPage({ params }: PokemonPageProps) {
  const { name } = await params;
  const finalName = getPokemonDisplayName(name);

  if (!finalName || !hasCompetitiveData(finalName)) {
    notFound();
  }

  const canonicalSlug = getPokemonSlug(finalName);

  const finalSummary = getPokemonSummary(finalName);
  if (!finalSummary) {
    notFound();
  }

  const spriteUrl = getPokemonSpriteUrl(finalName, "artwork");
  const roles = getAvailableRoles(finalName, "ou");
  const smogonUrl = getSmogonUrl(finalName, "gen9ou");
  const teammates = await getTeammatesFor(finalName);
  const checks = getChecksFor(finalName);
  const coreFormats = getAvailableFormats(finalName)
    .map((key) => ({ key, info: CORE_FORMATS[key] }))
    .filter((entry): entry is { key: string; info: NonNullable<typeof entry.info> } => Boolean(entry.info))
    .sort((a, b) => a.info.order - b.info.order);

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "WebPage",
    name: `${finalName} - Stats, Movesets and Competitive Analysis`,
    description: `Explore ${finalName}'s base stats, abilities, and available competitive roles and movesets.`,
    url: `https://poketeambuilder.com/pokemon/${canonicalSlug}`,
    inLanguage: "en",
    about: {
      "@type": "Thing",
      name: finalName,
      additionalType: "https://bulbapedia.bulbagarden.net/wiki/Pok%C3%A9mon",
    },
    isPartOf: {
      "@type": "WebSite",
      name: "Pokemon Team Generator",
      url: "https://poketeambuilder.com",
    },
    image: spriteUrl,
    mainEntity: {
      "@type": "Thing",
      name: finalName,
    },
  };

  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-black font-sans">
      <BreadcrumbJsonLd
        items={[
          { name: "Home", item: "/" },
          { name: "Pokemon", item: "/pokemon" },
          { name: finalName, item: `/pokemon/${canonicalSlug}` },
        ]}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <main className="container mx-auto px-4 py-12 max-w-4xl">
        <div className="mb-8">
          <Link href="/" className="text-blue-600 dark:text-blue-400 hover:underline text-sm">
            &larr; Back to Home
          </Link>
        </div>

        <header className="flex flex-col md:flex-row items-center gap-8 mb-12">
          <div className="relative w-48 h-48 flex-shrink-0">
            <Image
              src={spriteUrl}
              alt={finalName}
              fill
              sizes="192px"
              className="object-contain"
              priority
            />
          </div>
          <div className="text-center md:text-left">
            <div className="flex flex-wrap gap-2 justify-center md:justify-start mb-3">
              {finalSummary.types.map((type) => (
                <TypeBadge key={type} type={type} />
              ))}
            </div>
            <h1 className="text-3xl sm:text-4xl font-black tracking-tight text-zinc-900 dark:text-zinc-50 mb-2">
              {finalName} — Stats, Movesets and Competitive Analysis
            </h1>
            <p className="text-zinc-600 dark:text-zinc-400 max-w-xl">
              #{String(finalSummary.num).padStart(3, "0")} — Smogon-verified competitive data for Pokemon Showdown team building.
            </p>
            <div className="flex flex-wrap gap-3 mt-4 justify-center md:justify-start">
              <Link href={`/configurar?fixedPokemon=${encodeURIComponent(finalName)}`}>
                <Button className="bg-blue-600 hover:bg-blue-700 text-white">
                  Build Team with {finalName}
                </Button>
              </Link>
              <a href={smogonUrl} target="_blank" rel="noopener noreferrer">
                <Button variant="outline">View on Smogon</Button>
              </a>
            </div>
          </div>
        </header>

        <PokemonCompetitiveDescription name={finalName} summary={finalSummary} />

        <HowToUseSection name={finalName} />

        <section className="bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-200 dark:border-zinc-800 p-6 mb-8">
          <h2 className="text-xl font-bold text-zinc-900 dark:text-zinc-100 mb-6">Base Stats</h2>
          <div className="space-y-3 max-w-md">
            <StatBar label="HP" value={finalSummary.baseStats.hp} />
            <StatBar label="Atk" value={finalSummary.baseStats.atk} />
            <StatBar label="Def" value={finalSummary.baseStats.def} />
            <StatBar label="SpA" value={finalSummary.baseStats.spa} />
            <StatBar label="SpD" value={finalSummary.baseStats.spd} />
            <StatBar label="Spe" value={finalSummary.baseStats.spe} />
          </div>
          <div className="mt-4 pt-4 border-t border-zinc-100 dark:border-zinc-800">
            <p className="text-sm text-zinc-500 dark:text-zinc-400">
              BST: <strong className="text-zinc-900 dark:text-zinc-100">
                {Object.values(finalSummary.baseStats).reduce((a, b) => a + b, 0)}
              </strong>
            </p>
          </div>
        </section>

        <section className="bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-200 dark:border-zinc-800 p-6 mb-8">
          <h2 className="text-xl font-bold text-zinc-900 dark:text-zinc-100 mb-4">Abilities</h2>
          <div className="grid gap-3 sm:grid-cols-2">
            {Object.entries(finalSummary.abilities).map(([slot, ability]) => {
              const desc = getAbilityDescription(ability);
              return (
                <div key={slot} className="p-3 bg-zinc-50 dark:bg-zinc-950/50 rounded-lg border border-zinc-100 dark:border-zinc-800">
                  <h3 className="font-semibold text-zinc-900 dark:text-zinc-100 text-sm">{ability}</h3>
                  <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-1">{desc.shortDesc || desc.desc}</p>
                </div>
              );
            })}
          </div>
        </section>

        {roles.length > 0 && (
          <section className="bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-200 dark:border-zinc-800 p-6 mb-8">
            <h2 className="text-xl font-bold text-zinc-900 dark:text-zinc-100 mb-4">Competitive Roles</h2>
            <div className="flex flex-wrap gap-2">
              {roles.map((role) => (
                <span
                  key={role}
                  className="px-3 py-1.5 bg-blue-50 dark:bg-blue-950/30 text-blue-700 dark:text-blue-300 rounded-lg text-sm font-medium border border-blue-100 dark:border-blue-900"
                >
                  {role}
                </span>
              ))}
            </div>
            <p className="text-sm text-zinc-500 dark:text-zinc-400 mt-4">
              Based on available Smogon competitive set data. Roles vary by format and tier.
            </p>
          </section>
        )}

        {coreFormats.length > 0 && (
          <section className="bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-200 dark:border-zinc-800 p-6 mb-8">
            <h2 className="text-xl font-bold text-zinc-900 dark:text-zinc-100 mb-2">Competitive Formats</h2>
            <p className="text-sm text-zinc-500 dark:text-zinc-400 mb-4">
              {finalName} has verified Smogon sets in {coreFormats.length} competitive format{coreFormats.length === 1 ? "" : "s"}:
            </p>
            <div className="flex flex-wrap gap-2">
              {coreFormats.map(({ key, info }) =>
                info.href ? (
                  <Link
                    key={key}
                    href={info.href}
                    className="px-3 py-1.5 bg-blue-50 dark:bg-blue-950/30 text-blue-700 dark:text-blue-300 rounded-lg text-sm font-medium border border-blue-100 dark:border-blue-900 hover:border-blue-300 dark:hover:border-blue-700 transition-colors"
                  >
                    {info.label}
                  </Link>
                ) : (
                  <span
                    key={key}
                    className="px-3 py-1.5 bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 rounded-lg text-sm font-medium border border-zinc-200 dark:border-zinc-700"
                  >
                    {info.label}
                  </span>
                )
              )}
            </div>
            <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-4">
              Linked formats can be used directly in the team generator.
            </p>
          </section>
        )}

        <PokemonMovesetsSection name={finalName} roles={roles} />

        <PokemonNotableMovesSection name={finalName} />

        {teammates.length > 0 && (
          <section className="bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-200 dark:border-zinc-800 p-6 mb-8">
            <h2 className="text-xl font-bold text-zinc-900 dark:text-zinc-100 mb-2">
              Best Teammates for {finalName}
            </h2>
            <p className="text-sm text-zinc-500 dark:text-zinc-400 mb-4">
              Pokemon that most frequently share teams with {finalName} in current Gen 9 OU usage data.
            </p>
            <LinkedPokemonGrid pokemon={teammates} />
          </section>
        )}

        {checks.length > 0 && (
          <section className="bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-200 dark:border-zinc-800 p-6 mb-8">
            <h2 className="text-xl font-bold text-zinc-900 dark:text-zinc-100 mb-2">
              Pokemon that Check {finalName}
            </h2>
            <p className="text-sm text-zinc-500 dark:text-zinc-400 mb-4">
              Strong Pokemon whose STAB attacks exploit the type weaknesses of {finalName}.
            </p>
            <LinkedPokemonGrid pokemon={checks} />
          </section>
        )}

        <section className="bg-gradient-to-br from-blue-50 to-cyan-50 dark:from-blue-950/30 dark:to-cyan-950/30 rounded-2xl border border-blue-200 dark:border-blue-800 p-6 text-center">
          <h2 className="text-lg font-semibold text-zinc-900 dark:text-zinc-100 mb-2">
            Build a Team Around {finalName}
          </h2>
          <p className="text-sm text-zinc-600 dark:text-zinc-400 mb-4 max-w-lg mx-auto">
            Use our team generator to create a competitive team featuring {finalName} with available moveset, item and EV spread data.
          </p>
          <Link href={`/configurar?fixedPokemon=${encodeURIComponent(finalName)}`}>
            <Button className="bg-blue-600 hover:bg-blue-700 text-white px-6">
              Generate Team &rarr;
            </Button>
          </Link>
        </section>
      </main>
    </div>
  );
}

function PokemonCompetitiveDescription({ name, summary }: { name: string; summary: { types: string[]; baseStats: { hp: number; atk: number; def: number; spa: number; spd: number; spe: number } } }) {
  const role = getPokemonRole(name);
  const bst = Object.values(summary.baseStats).reduce((a, b) => a + b, 0);
  const highestStat = Object.entries(summary.baseStats).sort((a, b) => b[1] - a[1])[0];
  const statNames: Record<string, string> = { hp: "HP", atk: "Attack", def: "Defense", spa: "Special Attack", spd: "Special Defense", spe: "Speed" };

  let description = `${name} is a ${summary.types.join(" / ")} Pokémon`;
  if (bst >= 570) {
    description += ` with an impressive Base Stat Total of ${bst}`;
  } else if (bst >= 500) {
    description += ` with a solid Base Stat Total of ${bst}`;
  } else {
    description += ` with a Base Stat Total of ${bst}`;
  }

  description += `. In competitive play, it typically functions as a ${role.toLowerCase()}`;

  if (highestStat[1] >= 120) {
    description += `, excelling thanks to its exceptional ${statNames[highestStat[0]]} of ${highestStat[1]}`;
  } else if (highestStat[1] >= 100) {
    description += `, backed by a strong ${statNames[highestStat[0]]} of ${highestStat[1]}`;
  }

  if (role === "Sweeper") {
    description += `. Its offensive presence makes it a constant threat that demands respect from the opponent.`;
  } else if (role === "Wall") {
    description += `. Its defensive profile allows it to check prominent meta threats and pivot into teammates.`;
  } else if (role === "Tank") {
    description += `. It can absorb hits while dishing out respectable damage, making it a reliable mid-game piece.`;
  } else {
    description += `. It provides valuable utility through support moves, enabling its teammates to shine.`;
  }

  const coreFormatList = getAvailableFormats(name)
    .map((key) => CORE_FORMATS[key])
    .filter((info): info is NonNullable<typeof info> => Boolean(info))
    .sort((a, b) => a.order - b.order);
  if (coreFormatList.length > 0) {
    const topLabels = coreFormatList.slice(0, 2).map((info) => info.label).join(" and ");
    description += ` It appears in verified competitive sets across ${coreFormatList.length} formats, including ${topLabels}.`;
  }

  return (
    <section className="bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-200 dark:border-zinc-800 p-6 mb-8">
      <h2 className="text-xl font-bold text-zinc-900 dark:text-zinc-100 mb-3">Competitive Overview</h2>
      <p className="text-zinc-700 dark:text-zinc-300 leading-relaxed">
        {CURATED_POKEMON[name]?.summary ?? description}
      </p>
    </section>
  );
}

function HowToUseSection({ name }: { name: string }) {
  const curated = CURATED_POKEMON[name];
  if (!curated) return null;

  return (
    <section className="bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-200 dark:border-zinc-800 p-6 mb-8">
      <h2 className="text-xl font-bold text-zinc-900 dark:text-zinc-100 mb-4">How to Use {name}</h2>
      <ul className="space-y-2 mb-5">
        {curated.whenToUse.map((tip) => (
          <li key={tip} className="flex gap-2.5 text-sm text-zinc-700 dark:text-zinc-300 leading-relaxed">
            <span className="mt-0.5 h-1.5 w-1.5 rounded-full bg-blue-600 dark:bg-blue-400 shrink-0" aria-hidden="true" />
            <span>{tip}</span>
          </li>
        ))}
      </ul>
      <div className="p-4 bg-amber-50 dark:bg-amber-950/30 rounded-lg border border-amber-200 dark:border-amber-900">
        <h3 className="text-sm font-semibold text-amber-800 dark:text-amber-300 mb-1">Watch out for</h3>
        <p className="text-sm text-amber-900/80 dark:text-amber-200/80 leading-relaxed">{curated.watchOut}</p>
      </div>
    </section>
  );
}

function PokemonMovesetsSection({ name, roles }: { name: string; roles: string[] }) {
  if (roles.length === 0) return null;

  const sets = roles
    .map((role) => getCompetitiveSetByRole(name, role, "ou"))
    .filter((s) => s !== null);

  if (sets.length === 0) return null;

  return (
    <section className="bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-200 dark:border-zinc-800 p-6 mb-8">
      <h2 className="text-xl font-bold text-zinc-900 dark:text-zinc-100 mb-4">Competitive Movesets</h2>
      <div className="space-y-4">
        {sets.map((set) => (
          <div key={set.setName} className="p-4 bg-zinc-50 dark:bg-zinc-950/50 rounded-xl border border-zinc-100 dark:border-zinc-800">
            <h3 className="font-semibold text-zinc-900 dark:text-zinc-100 text-sm mb-2">{set.setName}</h3>
            <div className="grid gap-2 text-sm">
              <div className="flex flex-wrap gap-x-4 gap-y-1">
                <span className="text-zinc-500 dark:text-zinc-400"><strong className="text-zinc-700 dark:text-zinc-300">Item:</strong> {set.item}</span>
                <span className="text-zinc-500 dark:text-zinc-400"><strong className="text-zinc-700 dark:text-zinc-300">Ability:</strong> {set.ability || "—"}</span>
                <span className="text-zinc-500 dark:text-zinc-400"><strong className="text-zinc-700 dark:text-zinc-300">Nature:</strong> {set.nature}</span>
                {set.teraType && (
                  <span className="text-zinc-500 dark:text-zinc-400"><strong className="text-zinc-700 dark:text-zinc-300">Tera Type:</strong> {set.teraType}</span>
                )}
              </div>
              <div className="flex flex-wrap gap-x-4 gap-y-1">
                <span className="text-zinc-500 dark:text-zinc-400"><strong className="text-zinc-700 dark:text-zinc-300">EVs:</strong> {Object.entries(set.evs).filter(([, v]) => v > 0).map(([k, v]) => `${v} ${statLabel(k)}`).join(" / ")}</span>
              </div>
              <div className="flex flex-wrap gap-2 mt-1">
                {set.moves.map((move) => (
                  <span key={move} className="px-2 py-0.5 bg-blue-50 dark:bg-blue-950/30 text-blue-700 dark:text-blue-300 rounded text-xs font-medium border border-blue-100 dark:border-blue-900">
                    {move}
                  </span>
                ))}
              </div>
            </div>
          </div>
        ))}
      </div>
      <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-4">
        Movesets are sourced from available Smogon competitive set data. Alternatives may vary by format, tier and team needs.
      </p>
    </section>
  );
}

function statLabel(key: string): string {
  const labels: Record<string, string> = { hp: "HP", atk: "Atk", def: "Def", spa: "SpA", spd: "SpD", spe: "Spe" };
  return labels[key] || key;
}

function PokemonNotableMovesSection({ name }: { name: string }) {
  // Primary source: moves that appear in verified Smogon sets across all of
  // this Pokemon's formats, ranked by how many sets use them. Filler (BP
  // filter over the learnset) only kicks in for thin set data.
  const SET_MOVE_LIMIT = 12;
  const TOTAL_LIMIT = 16;

  const setMoveEntries = getCompetitiveMoveNames(name)
    .map(({ name: moveName }) => ({ moveName, data: getMoveData(moveName) }))
    .slice(0, SET_MOVE_LIMIT);

  const includedIds = new Set(
    setMoveEntries.map(({ moveName }) => moveName.toLowerCase().replace(/[^a-z0-9]/g, ""))
  );

  const utilityMoveIds = new Set([
    "stealthrock", "spikes", "toxicspikes", "stickyweb", "defog", "rapidspin",
    "wish", "healbell", "aromatherapy", "roost", "recover", "synthesis",
    "uturn", "voltswitch", "flipturn", "partingshot", "teleport",
    "thunderwave", "willowisp", "toxic", "taunt", "encore", "substitute",
    "trickroom", "tailwind", "reflect", "lightscreen", "auroraveil",
    "dragondance", "swordsdance", "nastyplot", "calmmind", "bulkup", "cottonguard",
    "knockoff", "trick", "toxic", "rest", "sleeptalk",
  ]);

  const learnable = getLearnableMovesWithDetails(name);
  const filler = learnable
    .filter((m) => !includedIds.has(m.name.toLowerCase().replace(/[^a-z0-9]/g, "")))
    .filter((m) => {
      const id = m.name.toLowerCase().replace(/[^a-z0-9]/g, "");
      if (utilityMoveIds.has(id)) return true;
      if (m.basePower >= 80 && m.category !== "Status") return true;
      if (m.basePower >= 60 && m.category !== "Status" && m.accuracy === true) return true; // reliable attacks
      return false;
    })
    .map((m) => ({ moveName: m.name, data: m }))
    .slice(0, Math.max(0, TOTAL_LIMIT - setMoveEntries.length));

  const entries = [...setMoveEntries, ...filler];

  if (entries.length === 0) return null;

  return (
    <section className="bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-200 dark:border-zinc-800 p-6 mb-8">
      <h2 className="text-xl font-bold text-zinc-900 dark:text-zinc-100 mb-4">Notable Moves</h2>
      <div className="grid gap-2 sm:grid-cols-2">
        {entries.map(({ moveName, data }) => (
          <div key={moveName} className="flex items-center justify-between gap-2 p-2 bg-zinc-50 dark:bg-zinc-950/50 rounded-lg border border-zinc-100 dark:border-zinc-800">
            <div className="flex items-center gap-2 min-w-0">
              <span className="text-sm font-medium text-zinc-900 dark:text-zinc-100 truncate">{moveName}</span>
              {data && (
                <span className="shrink-0 text-[10px] font-bold uppercase tracking-wide px-1.5 py-0.5 rounded bg-zinc-200 dark:bg-zinc-700 text-zinc-700 dark:text-zinc-300">
                  {data.type}
                </span>
              )}
            </div>
            <div className="text-xs text-zinc-500 dark:text-zinc-400 shrink-0">
              {!data ? null : data.category === "Status" ? (
                <span>Status</span>
              ) : (
                <span>{data.basePower} bp</span>
              )}
            </div>
          </div>
        ))}
      </div>
      <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-4">
        Ranked by usage in verified Smogon competitive sets{filler.length > 0 ? ", with additional learnset highlights" : ""}. Full movepool may vary by generation and transfer compatibility.
      </p>
    </section>
  );
}
