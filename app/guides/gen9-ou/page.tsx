"use client";

import { useEffect } from "react";
import Link from "next/link";
import { Rocket, Trophy } from "lucide-react";
import { AdBanner, AdHero, AdInline } from "@/components/monetization/Ads";
import { MetaOverview } from "@/components/guides/MetaOverview";
import { Button } from "@/components/ui/button";
import { analytics } from "@/lib/analytics";
import { useTranslation } from "@/lib/i18n";

export default function Gen9OUGuidePage() {
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

                <div className="w-full max-w-4xl space-y-6">
                    <MetaOverview format="gen9ou" />
                </div>

                <AdInline />
            </main>
        </div>
    );
}
