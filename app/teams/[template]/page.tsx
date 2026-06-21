import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Button } from "@/components/ui/button";
import { TEMPLATES, TemplateId } from "@/config/templates";
import { FORMATS, FormatId } from "@/config/formats";
import { getArchetypeStrategy } from "@/lib/archetype-strategies";
import { BreadcrumbJsonLd } from "@/components/seo/BreadcrumbJsonLd";

interface TeamArchetypePageProps {
  params: Promise<{ template: string }>;
}

export async function generateStaticParams() {
  const allTemplates = Object.keys(TEMPLATES) as TemplateId[];
  return allTemplates.map((template) => ({ template }));
}

export async function generateMetadata({ params }: TeamArchetypePageProps): Promise<Metadata> {
  const { template } = await params;
  const templateData = TEMPLATES[template as TemplateId];
  if (!templateData) {
    return {
      title: "Team Archetype",
    };
  }

  const title = `${templateData.label} Team Archetype Guide`;
  const description = `Learn how to build a ${templateData.label} team in competitive Pokemon. Roles, core requirements, and strategy for Gen 9 OU, VGC and more.`;

  return {
    title,
    description,
    keywords: [
      `${templateData.label.toLowerCase()} team`,
      "pokemon team archetype",
      "competitive pokemon teams",
      "pokemon showdown",
      `${template} team guide`,
    ],
    alternates: {
      canonical: `/teams/${template}`,
    },
    openGraph: {
      title,
      description,
      url: `/teams/${template}`,
      type: "article",
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
    },
  };
}

export default async function TeamArchetypePage({ params }: TeamArchetypePageProps) {
  const { template } = await params;
  const templateData = TEMPLATES[template as TemplateId];
  if (!templateData) {
    notFound();
  }

  // Find compatible formats for this template
  const allFormats = Object.keys(FORMATS) as FormatId[];
  const compatibleFormats = allFormats.filter((f) => {
    const t = TEMPLATES[template as TemplateId];
    if (!t.supportedGameTypes) return true;
    return t.supportedGameTypes.includes(FORMATS[f].gameType);
  });

  const strategy = getArchetypeStrategy(template as TemplateId);

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: `${templateData.label} Team Archetype Guide`,
    description: `Learn how to build a ${templateData.label} team in competitive Pokemon.`,
    author: { "@type": "Organization", name: "Pokemon Team Generator" },
    publisher: {
      "@type": "Organization",
      name: "Pokemon Team Generator",
      logo: { "@type": "ImageObject", url: "https://poketeambuilder.com/icons/logo-dark-nobg.png" },
    },
    mainEntityOfPage: `https://poketeambuilder.com/teams/${template}`,
  };

  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-black font-sans">
      <BreadcrumbJsonLd
        items={[
          { name: "Home", item: "/" },
          { name: `${templateData.label} Teams`, item: `/teams/${template}` },
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

        <header className="mb-10">
          <h1 className="text-4xl font-black tracking-tight text-zinc-900 dark:text-zinc-50 mb-3">
            {templateData.label} Team Archetype
          </h1>
          <p className="text-lg text-zinc-600 dark:text-zinc-400 max-w-2xl">
            Learn how to build and play a <strong>{templateData.label}</strong> team in competitive Pokemon formats. Understand the required roles, core Pokemon, and strategic gameplan.
          </p>
        </header>

        <section className="bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-200 dark:border-zinc-800 p-6 mb-8">
          <h2 className="text-xl font-bold text-zinc-900 dark:text-zinc-100 mb-4">Recommended Roles</h2>
          <div className="flex flex-wrap gap-2">
            {templateData.roles.map((role, index) => (
              <span
                key={`${role}-${index}`}
                className="px-3 py-1.5 bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 rounded-lg text-sm font-medium"
              >
                {role}
              </span>
            ))}
          </div>
        </section>

        {templateData.requiredAbilities && templateData.requiredAbilities.length > 0 && (
          <section className="bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-200 dark:border-zinc-800 p-6 mb-8">
            <h2 className="text-xl font-bold text-zinc-900 dark:text-zinc-100 mb-4">Required Abilities</h2>
            <div className="flex flex-wrap gap-2">
              {templateData.requiredAbilities.map((ability) => (
                <span
                  key={ability}
                  className="px-3 py-1.5 bg-red-50 dark:bg-red-950/30 text-red-700 dark:text-red-300 rounded-lg text-sm font-medium border border-red-100 dark:border-red-900"
                >
                  {ability}
                </span>
              ))}
            </div>
            <p className="text-sm text-zinc-500 dark:text-zinc-400 mt-3">
              These abilities are mandatory for the lead or core Pokemon in this archetype.
            </p>
          </section>
        )}

        {templateData.requiredMoves && templateData.requiredMoves.length > 0 && (
          <section className="bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-200 dark:border-zinc-800 p-6 mb-8">
            <h2 className="text-xl font-bold text-zinc-900 dark:text-zinc-100 mb-4">Required Moves</h2>
            <div className="flex flex-wrap gap-2">
              {templateData.requiredMoves.map((move) => (
                <span
                  key={move}
                  className="px-3 py-1.5 bg-blue-50 dark:bg-blue-950/30 text-blue-700 dark:text-blue-300 rounded-lg text-sm font-medium border border-blue-100 dark:border-blue-900"
                >
                  {move}
                </span>
              ))}
            </div>
            <p className="text-sm text-zinc-500 dark:text-zinc-400 mt-3">
              These moves are essential for the archetype to function correctly.
            </p>
          </section>
        )}

        {templateData.preferredMoves && templateData.preferredMoves.length > 0 && (
          <section className="bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-200 dark:border-zinc-800 p-6 mb-8">
            <h2 className="text-xl font-bold text-zinc-900 dark:text-zinc-100 mb-4">Preferred Moves</h2>
            <div className="flex flex-wrap gap-2">
              {templateData.preferredMoves.map((move) => (
                <span
                  key={move}
                  className="px-3 py-1.5 bg-green-50 dark:bg-green-950/30 text-green-700 dark:text-green-300 rounded-lg text-sm font-medium border border-green-100 dark:border-green-900"
                >
                  {move}
                </span>
              ))}
            </div>
          </section>
        )}

        {templateData.supportPackages && templateData.supportPackages.length > 0 && (
          <section className="bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-200 dark:border-zinc-800 p-6 mb-8">
            <h2 className="text-xl font-bold text-zinc-900 dark:text-zinc-100 mb-4">Support Packages</h2>
            <div className="flex flex-wrap gap-2">
              {templateData.supportPackages.map((pkg) => (
                <span
                  key={pkg}
                  className="px-3 py-1.5 bg-purple-50 dark:bg-purple-950/30 text-purple-700 dark:text-purple-300 rounded-lg text-sm font-medium border border-purple-100 dark:border-purple-900"
                >
                  {pkg}
                </span>
              ))}
            </div>
          </section>
        )}

        {strategy && (
          <section className="bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-200 dark:border-zinc-800 p-6 mb-8">
            <h2 className="text-xl font-bold text-zinc-900 dark:text-zinc-100 mb-4">Strategy Guide</h2>
            <div className="space-y-5">
              <div>
                <h3 className="text-sm font-semibold uppercase tracking-wider text-zinc-500 dark:text-zinc-400 mb-1">Overview</h3>
                <p className="text-zinc-700 dark:text-zinc-300 leading-relaxed">{strategy.overview}</p>
              </div>
              <div className="grid gap-4 sm:grid-cols-3">
                <div className="p-4 bg-zinc-50 dark:bg-zinc-950/50 rounded-xl border border-zinc-100 dark:border-zinc-800">
                  <h3 className="text-sm font-semibold uppercase tracking-wider text-zinc-500 dark:text-zinc-400 mb-2">Early Game</h3>
                  <p className="text-sm text-zinc-700 dark:text-zinc-300 leading-relaxed">{strategy.earlyGame}</p>
                </div>
                <div className="p-4 bg-zinc-50 dark:bg-zinc-950/50 rounded-xl border border-zinc-100 dark:border-zinc-800">
                  <h3 className="text-sm font-semibold uppercase tracking-wider text-zinc-500 dark:text-zinc-400 mb-2">Mid Game</h3>
                  <p className="text-sm text-zinc-700 dark:text-zinc-300 leading-relaxed">{strategy.midGame}</p>
                </div>
                <div className="p-4 bg-zinc-50 dark:bg-zinc-950/50 rounded-xl border border-zinc-100 dark:border-zinc-800">
                  <h3 className="text-sm font-semibold uppercase tracking-wider text-zinc-500 dark:text-zinc-400 mb-2">Late Game</h3>
                  <p className="text-sm text-zinc-700 dark:text-zinc-300 leading-relaxed">{strategy.lateGame}</p>
                </div>
              </div>
              <div>
                <h3 className="text-sm font-semibold uppercase tracking-wider text-zinc-500 dark:text-zinc-400 mb-1">Core Requirements</h3>
                <p className="text-zinc-700 dark:text-zinc-300 leading-relaxed">{strategy.coreExplanation}</p>
              </div>
            </div>
          </section>
        )}

        <section className="bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-200 dark:border-zinc-800 p-6 mb-8">
          <h2 className="text-xl font-bold text-zinc-900 dark:text-zinc-100 mb-4">Compatible Formats</h2>
          <div className="flex flex-wrap gap-2">
            {compatibleFormats.map((formatId) => (
              <span
                key={formatId}
                className="px-3 py-1.5 bg-amber-50 dark:bg-amber-950/30 text-amber-700 dark:text-amber-300 rounded-lg text-sm font-medium border border-amber-100 dark:border-amber-900"
              >
                {formatId.toUpperCase()}
              </span>
            ))}
          </div>
        </section>

        <section className="bg-gradient-to-br from-blue-50 to-cyan-50 dark:from-blue-950/30 dark:to-cyan-950/30 rounded-2xl border border-blue-200 dark:border-blue-800 p-6 text-center">
          <h2 className="text-lg font-semibold text-zinc-900 dark:text-zinc-100 mb-2">
            Generate a {templateData.label} Team
          </h2>
          <p className="text-sm text-zinc-600 dark:text-zinc-400 mb-4 max-w-lg mx-auto">
            Use our team generator to create a competitive {templateData.label} team with optimal Pokemon, movesets and EV spreads.
          </p>
          <Link href={`/configurar?template=${template}`}>
            <Button className="bg-blue-600 hover:bg-blue-700 text-white px-6">
              Generate {templateData.label} Team &rarr;
            </Button>
          </Link>
        </section>
      </main>
    </div>
  );
}
