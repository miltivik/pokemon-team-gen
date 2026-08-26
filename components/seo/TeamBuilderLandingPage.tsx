import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { BreadcrumbJsonLd } from "@/components/seo/BreadcrumbJsonLd";
import { TeamBuilderLinkCluster } from "@/components/seo/TeamBuilderLinkCluster";
import { SeoLandingAnalytics, TrackedSeoLink } from "@/components/seo/SeoLandingAnalytics";
import { getPokemonSlug } from "@/lib/pokemon-summary";
import type { TeamBuilderLanding } from "@/config/team-builder-landings";

function JsonLd({ landing }: { landing: TeamBuilderLanding }) {
  const webPageJsonLd = {
    "@context": "https://schema.org",
    "@type": "WebPage",
    name: landing.title,
    description: landing.description,
    url: `https://poketeambuilder.com${landing.pathname}`,
    inLanguage: "en",
    isPartOf: {
      "@type": "WebSite",
      name: "Pokemon Team Generator",
      url: "https://poketeambuilder.com",
    },
    about: {
      "@type": "Thing",
      name: landing.formatLabel,
    },
  };
  const faqJsonLd = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: landing.faqs.map((faq) => ({
      "@type": "Question",
      name: faq.question,
      acceptedAnswer: {
        "@type": "Answer",
        text: faq.answer,
      },
    })),
  };

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(webPageJsonLd) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd) }} />
    </>
  );
}

export function TeamBuilderLandingPage({ landing }: { landing: TeamBuilderLanding }) {
  return (
    <div className="min-h-screen bg-zinc-50 font-sans dark:bg-black">
      <BreadcrumbJsonLd
        items={[
          { name: "Home", item: "/" },
          { name: "Team Builders", item: "/pokemon-showdown-team-builder" },
          { name: landing.h1, item: landing.pathname },
        ]}
      />
      <JsonLd landing={landing} />
      <SeoLandingAnalytics landingPath={landing.pathname} />
      <main className="container mx-auto flex flex-col items-center gap-10 px-4 py-12">
        <header className="max-w-3xl space-y-4 text-center">
          <div className="inline-flex items-center justify-center rounded-full bg-blue-100 px-3 py-1 text-sm font-semibold text-blue-700 dark:bg-blue-950/40 dark:text-blue-300">
            {landing.eyebrow}
          </div>
          <h1 className="text-4xl font-black tracking-tight text-zinc-900 dark:text-zinc-50 sm:text-5xl">
            {landing.h1}
          </h1>
          <p className="text-lg leading-relaxed text-zinc-600 dark:text-zinc-400">{landing.intro}</p>
          <TrackedSeoLink href={landing.builderHref} landingPath={landing.pathname}>
            <Button size="lg" className="mt-2 bg-blue-600 px-7 font-semibold text-white hover:bg-blue-700">
              {landing.builderCta} &rarr;
            </Button>
          </TrackedSeoLink>
        </header>

        <section className="w-full max-w-4xl">
          <h2 className="mb-6 text-center text-2xl font-bold text-zinc-900 dark:text-zinc-50">
            How to build with this team builder
          </h2>
          <div className="grid gap-5 md:grid-cols-3">
            {landing.steps.map((step, index) => (
              <Card key={step.title} className="border-zinc-200 bg-white dark:border-zinc-800 dark:bg-zinc-900">
                <CardHeader>
                  <div className="mb-2 flex h-10 w-10 items-center justify-center rounded-xl bg-blue-100 text-lg font-black text-blue-700 dark:bg-blue-950/40 dark:text-blue-300">
                    {index + 1}
                  </div>
                  <CardTitle className="text-lg">{step.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm leading-relaxed text-zinc-600 dark:text-zinc-400">{step.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>

        <section className="w-full max-w-4xl">
          <h2 className="mb-6 text-center text-2xl font-bold text-zinc-900 dark:text-zinc-50">
            What you can build with this preset
          </h2>
          <div className="grid gap-4 sm:grid-cols-3">
            {landing.useCases.map((useCase) => (
              <article key={useCase.title} className="rounded-xl border border-zinc-200 bg-white p-5 dark:border-zinc-800 dark:bg-zinc-900">
                <h3 className="font-semibold text-zinc-900 dark:text-zinc-100">{useCase.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-zinc-600 dark:text-zinc-400">{useCase.description}</p>
              </article>
            ))}
          </div>
        </section>

        <section className="w-full max-w-4xl rounded-2xl border border-zinc-200 bg-white p-6 dark:border-zinc-800 dark:bg-zinc-900">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h2 className="text-xl font-bold text-zinc-900 dark:text-zinc-50">Relevant competitive Pokemon</h2>
              <p className="mt-1 text-sm leading-relaxed text-zinc-600 dark:text-zinc-400">
                Review roles and movesets before fixing a Pokemon in your generated {landing.formatLabel} team.
              </p>
            </div>
            <Link href="/pokemon" className="shrink-0 text-sm font-semibold text-blue-600 hover:underline dark:text-blue-400">
              Browse all profiles &rarr;
            </Link>
          </div>
          <div className="mt-5 flex flex-wrap gap-2">
            {landing.featuredPokemon.map((name) => (
              <Link
                key={name}
                href={`/pokemon/${getPokemonSlug(name)}`}
                className="rounded-full border border-zinc-200 px-3 py-1.5 text-sm font-medium text-blue-700 hover:border-blue-300 hover:bg-blue-50 dark:border-zinc-700 dark:text-blue-300 dark:hover:border-blue-800 dark:hover:bg-blue-950/20"
              >
                {name}
              </Link>
            ))}
          </div>
        </section>

        <TeamBuilderLinkCluster excludePathname={landing.pathname} />

        <section className="w-full max-w-4xl">
          <h2 className="mb-5 text-center text-2xl font-bold text-zinc-900 dark:text-zinc-50">Frequently asked questions</h2>
          <div className="space-y-3">
            {landing.faqs.map((faq) => (
              <details key={faq.question} className="group rounded-xl border border-zinc-200 bg-white p-4 dark:border-zinc-800 dark:bg-zinc-900">
                <summary className="cursor-pointer list-none font-semibold text-zinc-900 marker:hidden dark:text-zinc-50">
                  <span className="mr-2 inline-block text-blue-600 transition-transform group-open:rotate-90 dark:text-blue-400" aria-hidden="true">&rsaquo;</span>
                  {faq.question}
                </summary>
                <p className="mt-3 pl-5 text-sm leading-relaxed text-zinc-600 dark:text-zinc-400">{faq.answer}</p>
              </details>
            ))}
          </div>
        </section>

        <section className="w-full max-w-3xl rounded-3xl bg-gradient-to-br from-blue-600 to-blue-800 px-6 py-12 text-center shadow-2xl">
          <h2 className="text-3xl font-black tracking-tight text-white">Start your {landing.formatLabel} team</h2>
          <p className="mx-auto mt-4 max-w-xl text-lg text-blue-100">
            Generate a first roster, export it to Pokemon Showdown and refine it after testing.
          </p>
          <div className="mt-8 flex flex-wrap justify-center gap-3">
            <TrackedSeoLink href={landing.builderHref} landingPath={landing.pathname}>
              <Button size="lg" className="rounded-full bg-white px-8 text-blue-700 hover:bg-zinc-100">{landing.builderCta}</Button>
            </TrackedSeoLink>
            <Link href={landing.guideHref}>
              <Button size="lg" variant="outline" className="rounded-full border-white/60 px-8 text-white hover:bg-white/10 hover:text-white">{landing.guideLabel}</Button>
            </Link>
          </div>
        </section>
      </main>
    </div>
  );
}
