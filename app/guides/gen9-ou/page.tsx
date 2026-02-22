"use client";

import { useEffect } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { AdResponsive, AdBanner, AdInline } from "@/components/monetization/Ads";
import { useTranslation } from "@/lib/i18n";
import { analytics } from "@/lib/analytics";
import { MetaOverview } from "@/components/guides/MetaOverview";

export default function Gen9OUGuidePage() {
    const { t } = useTranslation();

    useEffect(() => {
        analytics.viewGuides("gen9-ou");
    }, []);

    return (
        <div className="min-h-screen bg-zinc-50 dark:bg-black font-sans">
            <main className="container mx-auto px-4 py-8 flex flex-col items-center gap-8">
                {/* Ad at top */}
                <section className="w-full flex justify-center">
                    <AdResponsive />
                </section>

                {/* Header */}
                <header className="text-center space-y-4">
                    <h1 className="text-3xl font-bold tracking-tight text-zinc-900 dark:text-zinc-50">
                        🏆 {t("guides.gen9ouTitle")}
                    </h1>
                    <p className="text-lg text-zinc-600 dark:text-zinc-400">
                        {t("guides.gen9ouDesc")}
                    </p>
                </header>

                {/* Generate CTA */}
                <div className="flex gap-4">
                    <Link href="/configurar?format=gen9ou">
                        <Button className="bg-blue-600 hover:bg-blue-700 text-white">
                            🚀 {t("guides.generateTeam")}
                        </Button>
                    </Link>
                </div>

                {/* Ad Banner */}
                <section className="w-full flex justify-center py-4">
                    <AdBanner />
                </section>

                {/* Guide Content - Dynamic */}
                <div className="w-full max-w-4xl space-y-6">
                    <MetaOverview format="gen9ou" />
                </div>

                <AdInline />
            </main>
        </div>
    );
}
