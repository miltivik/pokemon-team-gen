"use client";

import Link from "next/link";
import { useEffect } from "react";
import { TeamAnalysis } from "@/components/TeamAnalysis";
import { Button } from "@/components/ui/button";
import { AdHero, AdBanner } from "@/components/monetization/Ads";
import { AnalysisPageSkeleton } from "@/components/page-skeletons";
import { useTranslation } from "@/lib/i18n";
import { useTeam } from "@/lib/team-context";
import { analytics } from "@/lib/analytics";

interface AnalisisPageClientProps {
    expectsTeam: boolean;
}

function AnalisisEmptyState() {
    const { t } = useTranslation();

    return (
        <div className="min-h-screen bg-zinc-50 dark:bg-black font-sans flex flex-col items-center justify-center gap-4">
            <div className="text-center space-y-4">
                <h1 className="text-2xl font-bold dark:text-white">{t("app.noTeam")}</h1>
                <p className="text-zinc-500 dark:text-zinc-400">{t("app.generateFirst")}</p>
            </div>
            <Link href="/configurar">
                <Button className="bg-blue-600 hover:bg-blue-700 text-white">{t("nav.configurar")}</Button>
            </Link>
        </div>
    );
}

export function AnalisisPageClient({ expectsTeam }: AnalisisPageClientProps) {
    const { team, teamGuide, teamGuideI18n, format, isHydrated } = useTeam();
    const { t, lang } = useTranslation();

    useEffect(() => {
        analytics.viewAnalisis();
    }, []);

    const resolvedTeamGuide = teamGuideI18n?.[lang] || teamGuide;

    const handleGoHome = () => {
        // Navigation is handled by route links.
    };

    if (!isHydrated) {
        return expectsTeam ? <AnalysisPageSkeleton /> : <AnalisisEmptyState />;
    }

    if (team.length === 0) {
        return <AnalisisEmptyState />;
    }

    return (
        <div className="min-h-screen bg-zinc-50 dark:bg-black font-sans">
            <main className="container mx-auto px-4 py-8 flex flex-col items-center gap-8">
                <section className="w-full flex justify-center">
                    <AdHero />
                </section>

                <div className="w-full max-w-5xl flex justify-start mb-2">
                    <Link href="/equipo">
                        <Button variant="outline" className="gap-2 border-zinc-300 dark:border-zinc-700 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors shadow-sm font-semibold">
                            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m15 18-6-6 6-6" /></svg>
                            {t("analysis.backToTeam")}
                        </Button>
                    </Link>
                </div>

                <TeamAnalysis
                    team={team}
                    guide={resolvedTeamGuide}
                    format={format}
                    onGoHome={handleGoHome}
                />

                <div className="flex items-center justify-center gap-3 flex-wrap pt-4">
                    <Link href="/equipo">
                        <Button variant="outline">
                            Ã¢â€ Â {t("app.yourTeam")}
                        </Button>
                    </Link>
                    <Link href="/configurar">
                        <Button variant="outline">
                            Ã°Å¸â€â€ž {t("app.generateAnother")}
                        </Button>
                    </Link>
                    <Link href="/exportar">
                        <Button className="bg-blue-600 hover:bg-blue-700 text-white">
                            Ã°Å¸â€œâ€¹ {t("nav.export")}
                        </Button>
                    </Link>
                </div>

                <section className="w-full flex justify-center py-4">
                    <AdBanner />
                </section>
            </main>
        </div>
    );
}
