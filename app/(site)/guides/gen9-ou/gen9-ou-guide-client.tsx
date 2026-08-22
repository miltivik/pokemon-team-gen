"use client";

import { useEffect } from "react";
import Link from "next/link";
import { Rocket, Trophy } from "lucide-react";
import { AdBanner, AdHero, AdInline } from "@/components/monetization/Ads";
import { MetaOverview } from "@/components/guides/MetaOverview";
import { Button } from "@/components/ui/button";
import { analytics } from "@/lib/analytics";
import { useTranslation } from "@/lib/i18n";
import type { MetaOverviewPayload } from "@/lib/meta-analysis";

export default function Gen9OUGuideClient({
    initialData,
}: {
    initialData: MetaOverviewPayload | null;
}) {
    const { t } = useTranslation();

    useEffect(() => {
        analytics.viewGuides("gen9-ou");
    }, []);

    return (
        <div className="min-h-screen bg-zinc-50 font-sans dark:bg-black">
            <main className="container mx-auto flex flex-col items-center gap-8 px-4 py-8">
                <header className="max-w-3xl space-y-4 text-center">
                    <div className="inline-flex items-center justify-center rounded-full bg-amber-100 px-3 py-1 text-sm font-semibold text-amber-700 dark:bg-amber-950/40 dark:text-amber-300">
                        <Trophy className="mr-2 h-4 w-4" />
                        {t("guides.gen9ouTitle")}
                    </div>
                    <h1 className="text-3xl font-black tracking-tight text-zinc-900 dark:text-zinc-50 sm:text-4xl">
                        Gen 9 OU
                    </h1>
                    <p className="text-lg text-zinc-600 dark:text-zinc-400">
                        {t("guides.gen9ouDesc")}
                    </p>
                    <p className="text-sm text-zinc-500 dark:text-zinc-500">
                        Updated August 22, 2026 · Meta snapshot sourced from Smogon usage data and Pikalytics team data.
                    </p>
                </header>

                <section className="flex w-full justify-center">
                    <AdHero />
                </section>

                <div className="flex justify-center">
                    <Link href="/configurar?format=gen9ou">
                        <Button
                            size="lg"
                            className="gap-2 rounded-full bg-blue-600 px-8 font-semibold text-white shadow-md hover:bg-blue-700"
                        >
                            <Rocket className="h-4 w-4" />
                            {t("guides.generateTeam")}
                        </Button>
                    </Link>
                </div>

                <section className="flex w-full justify-center py-4">
                    <AdBanner />
                </section>

                <section className="w-full max-w-4xl space-y-4">
                    <h2 className="text-2xl font-bold text-zinc-900 dark:text-zinc-100">
                        How to Build a Gen 9 OU Team
                    </h2>
                    <p className="leading-relaxed text-zinc-600 dark:text-zinc-400">
                        Start with a clear win condition, then add defensive answers to the threats shown in the current meta snapshot. Build hazard control, speed control and reliable pivots around the core before exporting the team to Pokemon Showdown.
                    </p>
                    <div className="grid gap-4 md:grid-cols-3">
                        <article className="rounded-xl border border-zinc-200 bg-white p-4 dark:border-zinc-800 dark:bg-zinc-900">
                            <h3 className="font-semibold text-zinc-900 dark:text-zinc-100">Choose a win condition</h3>
                            <p className="mt-2 text-sm leading-relaxed text-zinc-600 dark:text-zinc-400">
                                Pick a sweeper or breaker that benefits from the pressure your team can create.
                            </p>
                        </article>
                        <article className="rounded-xl border border-zinc-200 bg-white p-4 dark:border-zinc-800 dark:bg-zinc-900">
                            <h3 className="font-semibold text-zinc-900 dark:text-zinc-100">Cover common threats</h3>
                            <p className="mt-2 text-sm leading-relaxed text-zinc-600 dark:text-zinc-400">
                                Use the usage snapshot to check speed tiers, defensive checks and hazard matchups.
                            </p>
                        </article>
                        <article className="rounded-xl border border-zinc-200 bg-white p-4 dark:border-zinc-800 dark:bg-zinc-900">
                            <h3 className="font-semibold text-zinc-900 dark:text-zinc-100">Test and refine</h3>
                            <p className="mt-2 text-sm leading-relaxed text-zinc-600 dark:text-zinc-400">
                                Test the six together, adjust movesets and keep the final export legal for Gen 9 OU.
                            </p>
                        </article>
                    </div>
                </section>

                <section className="w-full max-w-4xl space-y-6">
                    <h2 className="text-2xl font-bold text-zinc-900 dark:text-zinc-100">
                        Current Gen 9 OU Meta
                    </h2>
                    <MetaOverview format="gen9ou" initialData={initialData} />
                </section>

                <AdInline />
            </main>
        </div>
    );
}
