"use client";

import Link from "next/link";
import { useTeam } from "@/lib/team-context";
import { TeamAnalysis } from "@/components/TeamAnalysis";
import { Button } from "@/components/ui/button";
import { AdResponsive, AdBanner } from "@/components/monetization/Ads";
import { useTranslation } from "@/lib/i18n";
import { useEffect } from "react";
import { analytics } from "@/lib/analytics";

export default function AnalisisPage() {
    const { team, gameplan, gameplanI18n, format } = useTeam();
    const { t, lang } = useTranslation();

    // Track page view
    useEffect(() => {
        analytics.viewAnalisis();
    }, []);

    // Resolve gameplan for current language (falls back to generation-time gameplan)
    const resolvedGameplan = gameplanI18n?.[lang] || gameplan;

    const handleGoHome = () => {
        // This won't be used since we have navigation
    };

    return (
        <div className="min-h-screen bg-zinc-50 dark:bg-black font-sans">
            <main className="container mx-auto px-4 py-8 flex flex-col items-center gap-8">
                {/* Ad at top */}
                <section className="w-full flex justify-center">
                    <AdResponsive />
                </section>

                {/* Back navigation */}
                <div className="w-full max-w-5xl flex justify-start mb-2">
                    <Link href="/equipo">
                        <Button variant="outline" className="gap-2 border-zinc-300 dark:border-zinc-700 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors shadow-sm font-semibold">
                            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m15 18-6-6 6-6" /></svg>
                            {t("analysis.backToTeam")}
                        </Button>
                    </Link>
                </div>

                {/* Analysis component */}
                <TeamAnalysis
                    team={team}
                    gameplan={resolvedGameplan}
                    format={format}
                    onGoHome={handleGoHome}
                />

                {/* Navigation buttons after analysis */}
                <div className="flex items-center justify-center gap-3 flex-wrap pt-4">
                    <Link href="/equipo">
                        <Button variant="outline">
                            ← {t("app.yourTeam")}
                        </Button>
                    </Link>
                    <Link href="/configurar">
                        <Button variant="outline">
                            🔄 {t("app.generateAnother")}
                        </Button>
                    </Link>
                    <Link href="/exportar">
                        <Button className="bg-blue-600 hover:bg-blue-700 text-white">
                            📋 {t("nav.export")}
                        </Button>
                    </Link>
                </div>

                {/* Ad Banner */}
                <section className="w-full flex justify-center py-4">
                    <AdBanner />
                </section>
            </main>
        </div>
    );
}
