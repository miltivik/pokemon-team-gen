"use client";

import Link from "next/link";
import { useTeam } from "@/lib/team-context";
import { PokemonCard } from "@/components/PokemonCard";
import { TeamExplanation } from "@/components/TeamExplanation";
import { SimilarTeams } from "@/components/SimilarTeams";
import { Button } from "@/components/ui/button";
import { AdResponsive, AdBanner, AdInline } from "@/components/monetization/Ads";
import { useTranslation } from "@/lib/i18n";
import { getExportText } from "@/lib/export-text";
import { toast } from "sonner";
import { useEffect, useMemo, useState } from "react";
import { analytics } from "@/lib/analytics";
import { BugReportDialog } from "@/components/BugReportDialog";
import { buildBugReportGenerationContext } from "@/lib/bug-report";
import { cloneGenerationOptions } from "@/lib/team-generation-options";

export default function EquipoPage() {
    const { team, setTeam, gameplan, teamGuide, teamGuideI18n, format, addTeam, generationOptions, isHydrated } = useTeam();
    const { t, lang } = useTranslation();
    const [isRegenerating, setIsRegenerating] = useState(false);
    const regenerationOptions = useMemo(
        () => cloneGenerationOptions(generationOptions),
        [generationOptions]
    );
    const bugReportContext = buildBugReportGenerationContext(team, generationOptions);
    const resolvedTeamGuide = teamGuideI18n?.[lang] || teamGuide;

    interface StoredTeamRecord {
        id: string;
        team: typeof team;
        format: string;
        createdAt: string;
    }

    // Track page view
    useEffect(() => {
        if (team.length > 0) {
            analytics.viewTeam(team.length);
        }
    }, [team.length]);

    // Get team types for the new components
    const teamTypes = team
        .flatMap((pokemon) => pokemon.types || [])
        .filter((v, i, a) => a.indexOf(v) === i);

    const handleRegenerate = async () => {
        if (!regenerationOptions) {
            toast.error(t("form.error"));
            return;
        }

        setIsRegenerating(true);
        try {
            const response = await fetch('/api/generate-dynamic-team', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(regenerationOptions),
            });

            if (!response.ok) throw new Error('Generation failed');

            const data = await response.json();

            analytics.generateTeam(regenerationOptions.format ?? format, regenerationOptions.templateId || "balanced");
            addTeam(
                data.team,
                data.gameplan,
                data.gameplanI18n,
                data.teamGuide,
                data.teamGuideI18n,
                regenerationOptions
            );

            toast.success(t("app.generateAnother"));
        } catch (error) {
            console.error(error);
            toast.error(t("form.error"), {
                description: t("form.errorDesc"),
                duration: 5000,
            });
        } finally {
            setIsRegenerating(false);
        }
    };

    const handleExport = () => {
        if (team.length === 0) return;
        const text = getExportText(team);
        navigator.clipboard.writeText(text);
        toast.success(t("app.exported"));
        analytics.exportTeam("showdown");
    };

    const handleSaveTeam = () => {
        if (team.length === 0) return;
        const savedTeams = localStorage.getItem("saved-teams");
        let teams: StoredTeamRecord[] = [];
        if (savedTeams) {
            try {
                teams = JSON.parse(savedTeams) as StoredTeamRecord[];
            } catch (e) {
                console.error("Failed to parse saved teams:", e);
            }
        }
        const newTeam = {
            id: Date.now().toString(),
            team,
            format,
            createdAt: new Date().toISOString(),
        };
        teams.unshift(newTeam);
        localStorage.setItem("saved-teams", JSON.stringify(teams.slice(0, 50))); // Keep last 50 teams
        toast.success(t("app.teamSaved"));
    };

    if (!isHydrated) {
        return (
            <div className="min-h-screen bg-zinc-50 dark:bg-black font-sans flex items-center justify-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            </div>
        );
    }

    if (team.length === 0) {
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

    return (
        <div className="min-h-screen bg-zinc-50 dark:bg-black font-sans">
            <main className="container mx-auto px-4 py-8 flex flex-col items-center gap-8">
                {/* Ad at top */}
                <section className="w-full flex justify-center">
                    <AdResponsive />
                </section>

                {/* Header with format info */}
                <header className="text-center space-y-4">
                    <h1 className="text-3xl font-bold tracking-tight text-zinc-900 dark:text-zinc-50">
                        {t("app.yourTeam")}
                    </h1>
                    <p className="text-lg text-zinc-600 dark:text-zinc-400">
                        {t("app.format")}: <span className="font-bold text-zinc-900 dark:text-zinc-200">{format.toUpperCase()}</span>
                    </p>
                </header>

                {/* Action buttons */}
                <div className="flex items-center justify-center gap-3 flex-wrap">
                    {generationOptions && (
                        <Button onClick={handleRegenerate} disabled={isRegenerating} className="bg-blue-600 hover:bg-blue-700 text-white shadow-sm font-semibold">
                            {isRegenerating ? "🔄..." : "🔄 " + t("app.generateAnother")}
                        </Button>
                    )}
                    <Link href="/analisis">
                        <Button variant="secondary" className="bg-zinc-200 dark:bg-zinc-800 hover:bg-zinc-300 dark:hover:bg-zinc-700 text-zinc-900 dark:text-zinc-100 font-semibold shadow-sm">
                            📊 {t("nav.analysis")}
                        </Button>
                    </Link>
                    <Button onClick={handleExport} variant="outline" className="border-zinc-300 dark:border-zinc-700 font-medium">
                        📋 {t("app.exportShowdown")}
                    </Button>
                    <Button onClick={handleSaveTeam} variant="outline" className="border-zinc-300 dark:border-zinc-700 font-medium">
                        💾 {t("app.saveTeam")}
                    </Button>
                    <Link href="/configurar">
                        <Button variant="ghost" className="text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100 font-medium">
                            ✏️ {t("app.editOptions")}
                        </Button>
                    </Link>
                    <BugReportDialog
                        generationContext={bugReportContext}
                        trigger={
                            <Button variant="outline" className="border-zinc-300 dark:border-zinc-700 font-medium">
                                {lang === "es" ? "Reportar bug" : "Report Bug"}
                            </Button>
                        }
                    />
                </div>

                {/* Ad Banner before team */}
                <section className="w-full flex justify-center py-4">
                    <AdBanner />
                </section>

                {/* Team Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-10 pt-8 pb-32 mb-8 w-full max-w-5xl">
                    {team.map((pokemon, index) => (
                        <PokemonCard
                            key={`${pokemon.name}-${index}`}
                            pokemon={pokemon}
                            format={format}
                            onUpdate={(updatedPokemon) => {
                                const newTeam = [...team];
                                newTeam[index] = updatedPokemon;
                                setTeam(newTeam);
                            }}
                        />
                    ))}
                </div>

                {/* Ad Inline after team */}
                <AdInline />

                {/* Gameplan Section */}
                {gameplan && (
                    <div className="space-y-4 py-8 mt-8 w-full max-w-4xl">
                        <h3 className="text-xl font-bold text-center dark:text-white">{t("gameplan.title")}</h3>
                        {resolvedTeamGuide && (
                            <div className="rounded-2xl border border-zinc-200 bg-white p-5 shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
                                <div className="text-xs font-bold uppercase tracking-[0.18em] text-zinc-500">
                                    {t("analysis.quickGuide")}
                                </div>
                                <p className="mt-2 text-sm font-medium leading-relaxed text-zinc-700 dark:text-zinc-300">
                                    {resolvedTeamGuide.overview.identitySummary}
                                </p>
                                {resolvedTeamGuide.generalTips.length > 0 && (
                                    <div className="mt-4 grid gap-2 md:grid-cols-2">
                                        {resolvedTeamGuide.generalTips.slice(0, 2).map((tip) => (
                                            <div key={tip} className="rounded-xl border border-zinc-100 bg-zinc-50 px-3 py-2 text-sm text-zinc-600 dark:border-zinc-800 dark:bg-zinc-950/50 dark:text-zinc-400">
                                                {tip}
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        )}
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            {/* Early Game */}
                            <div className="bg-white dark:bg-zinc-900 p-6 rounded-xl border border-zinc-200 dark:border-zinc-800 shadow-sm flex flex-col gap-3">
                                <div className="flex items-center gap-2">
                                    <span className="w-2.5 h-2.5 rounded-full bg-rose-500 flex-shrink-0" />
                                    <h4 className="font-bold text-lg text-rose-600 dark:text-rose-400">{t("gameplan.early")}</h4>
                                </div>
                                <p className="text-zinc-800 dark:text-zinc-200 text-sm font-semibold leading-relaxed">{gameplan.early.summary}</p>
                            </div>

                            {/* Mid Game */}
                            <div className="bg-white dark:bg-zinc-900 p-6 rounded-xl border border-zinc-200 dark:border-zinc-800 shadow-sm flex flex-col gap-3">
                                <div className="flex items-center gap-2">
                                    <span className="w-2.5 h-2.5 rounded-full bg-blue-500 flex-shrink-0" />
                                    <h4 className="font-bold text-lg text-blue-600 dark:text-blue-400">{t("gameplan.mid")}</h4>
                                </div>
                                <p className="text-zinc-800 dark:text-zinc-200 text-sm font-semibold leading-relaxed">{gameplan.mid.summary}</p>
                            </div>

                            {/* Late Game */}
                            <div className="bg-white dark:bg-zinc-900 p-6 rounded-xl border border-zinc-200 dark:border-zinc-800 shadow-sm flex flex-col gap-3">
                                <div className="flex items-center gap-2">
                                    <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 flex-shrink-0" />
                                    <h4 className="font-bold text-lg text-emerald-600 dark:text-emerald-400">{t("gameplan.late")}</h4>
                                </div>
                                <p className="text-zinc-800 dark:text-zinc-200 text-sm font-semibold leading-relaxed">{gameplan.late.summary}</p>
                            </div>
                        </div>
                    </div>
                )}

                {/* Link to analysis */}
                <div className="text-center pt-4">
                    <Link href="/analisis">
                        <Button
                            variant="outline"
                            className="border-emerald-300 dark:border-emerald-700 text-emerald-700 dark:text-emerald-400 hover:bg-emerald-50 dark:hover:bg-emerald-950/30"
                        >
                            📊 {t("analysis.detailedStrategy")} →
                        </Button>
                    </Link>
                </div>

                {/* NEW: Team Explanation Section */}
                <section className="w-full max-w-4xl py-8">
                    <TeamExplanation team={team} format={format} guide={resolvedTeamGuide} />
                </section>

                {/* NEW: Similar Teams Section */}
                <section className="w-full max-w-4xl py-8">
                    <SimilarTeams format={format} teamTypes={teamTypes} />
                </section>

                {/* Ad Banner before export */}
                <section className="w-full flex justify-center py-4">
                    <AdBanner />
                </section>

                {/* Cross-links section - SEO pages */}
                <div className="w-full max-w-4xl pt-8 border-t border-zinc-200 dark:border-zinc-800">
                    <h3 className="text-lg font-bold dark:text-white mb-4 text-center">
                        {t("team.exploreMore")}
                    </h3>
                    <div className="flex flex-wrap gap-3 justify-center">
                        <Link href={`/guides/${format === "gen9vgc2026f" ? "vgc" : "gen9-ou"}`}>
                            <Button variant="outline" size="sm">
                                📚 {t("team.readGuide")}
                            </Button>
                        </Link>
                        <Link href="/tier-list">
                            <Button variant="outline" size="sm">
                                📊 {t("team.tierList")}
                            </Button>
                        </Link>
                        <Link href="/saved-teams">
                            <Button variant="outline" size="sm">
                                📁 {t("team.saveTeam")}
                            </Button>
                        </Link>
                    </div>
                </div>
            </main>
        </div>
    );
}
