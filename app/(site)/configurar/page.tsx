import type { Metadata } from "next";
import Link from "next/link";
import { Suspense } from "react";
import { ConfigurarPageSkeleton } from "@/components/page-skeletons";
import ConfigurarPageClient from "./configurar-page-client";

export const metadata: Metadata = {
  title: "Build Pokemon Showdown Teams | Gen 9 OU & VGC",
  description:
    "Configure and generate competitive Pokemon Showdown teams for Gen 9 OU, VGC, UU, RU, NU and more. Choose a format, archetype and playstyle.",
  keywords: [
    "pokemon team generator",
    "pokemon showdown team builder",
    "gen 9 ou team generator",
    "vgc team generator",
    "competitive pokemon teams",
  ],
  alternates: {
    canonical: "/configurar",
    languages: {
      en: "/configurar",
      es: "/es/configurar",
      "x-default": "/configurar",
    },
  },
  openGraph: {
    title: "Build Pokemon Showdown Teams | Gen 9 OU & VGC",
    description:
      "Configure and generate competitive Pokemon Showdown teams for Gen 9 OU, VGC, UU, RU, NU and more. Choose a format, archetype and playstyle.",
    url: "/configurar",
    type: "website",
    images: ["/og-image.png"],
  },
  twitter: {
    card: "summary_large_image",
    title: "Build Pokemon Showdown Teams | Gen 9 OU & VGC",
    description:
      "Configure and generate competitive Pokemon Showdown teams for Gen 9 OU, VGC, UU, RU, NU and more. Choose a format, archetype and playstyle.",
    images: ["/og-image.png"],
  },
};

export default function ConfigurarPage() {
  return (
    <>
      <p className="container mx-auto px-4 pt-4 text-center text-sm text-blue-600 dark:text-blue-400">
        <Link href="/pokemon-showdown-team-builder" className="underline-offset-4 hover:underline">
          Learn how to use the Pokemon Showdown team builder
        </Link>
      </p>
      <header className="container mx-auto flex min-h-28 flex-col items-center justify-center space-y-4 px-4 pt-8 text-center">
        <h1 className="text-3xl font-bold tracking-tight text-zinc-900 dark:text-zinc-50">
          Generator Settings
        </h1>
        <p className="text-lg text-zinc-600 dark:text-zinc-400">
          Configure your team preferences
        </p>
      </header>
      <Suspense fallback={<ConfigurarPageSkeleton showHeading={false} />}>
        <ConfigurarPageClient hideHeader />
      </Suspense>
      <section
        aria-labelledby="configurar-seo-heading"
        className="container mx-auto max-w-4xl px-4 pb-12 pt-4"
      >
        <div className="rounded-2xl border border-zinc-200 bg-white p-6 text-center shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
          <h2
            id="configurar-seo-heading"
            className="text-2xl font-bold text-zinc-900 dark:text-zinc-50"
          >
            Build a competitive Pokemon Showdown team
          </h2>
          <p className="mx-auto mt-3 max-w-2xl leading-relaxed text-zinc-600 dark:text-zinc-400">
            Choose a format such as Gen 9 OU or VGC, select an archetype and
            tune the playstyle before generating a legal six-Pokemon roster.
            The builder uses the same format rules and competitive set data as
            the team analysis pages.
          </p>
          <div className="mt-6 grid gap-4 text-left sm:grid-cols-3">
            <div>
              <h3 className="font-semibold text-zinc-900 dark:text-zinc-100">Choose a format</h3>
              <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">
                Start with the ruleset that matches the battles you want to play.
              </p>
            </div>
            <div>
              <h3 className="font-semibold text-zinc-900 dark:text-zinc-100">Pick a team style</h3>
              <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">
                Use Rain, Hyper Offense, Stall, Balanced and other practical cores.
              </p>
            </div>
            <div>
              <h3 className="font-semibold text-zinc-900 dark:text-zinc-100">Export and test</h3>
              <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">
                Export your finished team to Pokemon Showdown and refine it after testing.
              </p>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
