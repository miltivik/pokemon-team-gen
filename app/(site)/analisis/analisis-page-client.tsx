"use client";

import Link from "next/link";
import { ArrowLeft, FileOutput, RefreshCw } from "lucide-react";
import { TeamAnalysis } from "@/components/TeamAnalysis";
import { AdBanner, AdHero } from "@/components/monetization/Ads";
import { AnalysisPageSkeleton } from "@/components/page-skeletons";
import { Button } from "@/components/ui/button";
import { useTranslation } from "@/lib/i18n";
import { useTeam } from "@/lib/team-context";

interface AnalisisPageClientProps {
    expectsTeam: boolean;
}

function AnalisisEmptyState() {
    const { t } = useTranslation();

    return (
        <div className="flex min-h-screen flex-col items-center justify-center gap-4 bg-zinc-50 font-sans dark:bg-black">
            <div className="space-y-4 text-center">
                <h1 className="text-2xl font-bold dark:text-white">{t("app.noTeam")}</h1>
                <p className="text-zinc-500 dark:text-zinc-400">{t("app.generateFirst")}</p>
            </div>
            <Link href="/configurar">
                <Button className="bg-blue-600 text-white hover:bg-blue-700">{t("nav.configurar")}</Button>
            </Link>
        </div>
    );
}

export function AnalisisPageClient({ expectsTeam }: AnalisisPageClientProps) {
    const { team, teamGuide, teamGuideI18n, format, isHydrated } = useTeam();
    const { t, lang } = useTranslation();

    const resolvedTeamGuide = teamGuideI18n?.[lang] || teamGuide;

    if (!isHydrated) {
        return expectsTeam ? <AnalysisPageSkeleton /> : <AnalisisEmptyState />;
    }

    if (team.length === 0) {
        return <AnalisisEmptyState />;
    }

    return (
        <div className="min-h-screen bg-zinc-50 font-sans dark:bg-black">
            <main className="container mx-auto flex flex-col items-center gap-8 px-4 py-8">
                <section className="flex w-full justify-center">
                    <AdHero />
                </section>

                <div className="mb-2 flex w-full max-w-5xl justify-start">
                    <Link href="/equipo">
                        <Button
                            variant="outline"
                            className="gap-2 border-zinc-300 font-semibold shadow-sm transition-colors hover:bg-zinc-100 dark:border-zinc-700 dark:hover:bg-zinc-800"
                        >
                            <ArrowLeft className="h-4 w-4" />
                            {t("analysis.backToTeam")}
                        </Button>
                    </Link>
                </div>

                <TeamAnalysis
                    team={team}
                    guide={resolvedTeamGuide}
                    format={format}
                    onGoHome={() => {}}
                />

                <div className="flex flex-wrap items-center justify-center gap-3 pt-4">
                    <Link href="/equipo">
                        <Button variant="outline" className="gap-2">
                            <ArrowLeft className="h-4 w-4" />
                            {t("app.yourTeam")}
                        </Button>
                    </Link>
                    <Link href="/configurar">
                        <Button variant="outline" className="gap-2">
                            <RefreshCw className="h-4 w-4" />
                            {t("app.generateAnother")}
                        </Button>
                    </Link>
                    <Link href="/exportar">
                        <Button className="gap-2 bg-blue-600 text-white hover:bg-blue-700">
                            <FileOutput className="h-4 w-4" />
                            {t("nav.export")}
                        </Button>
                    </Link>
                </div>

                <section className="flex w-full justify-center py-4">
                    <AdBanner />
                </section>
            </main>
        </div>
    );
}
