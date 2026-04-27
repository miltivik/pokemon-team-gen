"use client";

import Link from "next/link";
import { useCallback, useEffect, useMemo, useRef, useState, type ComponentType } from "react";
import {
    BookOpen,
    Bug,
    ChartColumn,
    Copy,
    ExternalLink,
    RefreshCw,
    Save,
    Settings2,
} from "lucide-react";
import { toast } from "sonner";
import { PokemonCard } from "@/components/PokemonCard";
import { TeamExplanation } from "@/components/TeamExplanation";
import { SimilarTeams } from "@/components/SimilarTeams";
import { BugReportDialog } from "@/components/BugReportDialog";
import { AdHero, AdBanner, AdInline } from "@/components/monetization/Ads";
import { Button } from "@/components/ui/button";
import { analytics } from "@/lib/analytics";
import { buildBugReportGenerationContext } from "@/lib/bug-report";
import { getExportText } from "@/lib/export-text";
import { useTranslation } from "@/lib/i18n";
import { cloneGenerationOptions } from "@/lib/team-generation-options";
import { saveTeamToSavedTeams } from "@/lib/team-storage";
import { useTeam } from "@/lib/team-context";
import type { GeneratedTeamMember } from "@/lib/team-guide";
import type { PokemonDetailsDialogProps } from "@/components/PokemonDetailsPanel";

interface EquipoPageClientProps {
    expectsTeam: boolean;
}

type PokemonDetailsDialogComponent = ComponentType<PokemonDetailsDialogProps>;

function loadPokemonDetailsDialog(): Promise<PokemonDetailsDialogComponent> {
    return import("@/components/PokemonDetailsPanel").then((module) => module.PokemonDetailsDialog);
}

let pokemonDetailsDialogPreloadPromise: Promise<PokemonDetailsDialogComponent> | null = null;

function preloadPokemonDetailsDialog() {
    if (!pokemonDetailsDialogPreloadPromise) {
        pokemonDetailsDialogPreloadPromise = loadPokemonDetailsDialog();
    }

    return pokemonDetailsDialogPreloadPromise;
}

function SkeletonPill({ className }: { className: string }) {
    return (
        <div
            aria-hidden="true"
            className={`animate-pulse rounded-full bg-zinc-200 dark:bg-zinc-800 ${className}`}
        />
    );
}

function PokemonCardSkeleton({ index }: { index: number }) {
    return (
        <div
            aria-hidden="true"
            className="overflow-hidden rounded-lg border border-zinc-200 bg-white p-3 shadow-sm dark:border-zinc-800 dark:bg-zinc-900"
            style={{ animationDelay: `${index * 40}ms` }}
        >
            <div className="aspect-square animate-pulse rounded-md bg-zinc-200 dark:bg-zinc-800" />
            <div className="mt-3 space-y-2">
                <div className="mx-auto h-5 w-28 animate-pulse rounded bg-zinc-200 dark:bg-zinc-800" />
                <div className="mx-auto flex w-32 justify-center gap-2">
                    <div className="h-5 w-14 animate-pulse rounded-full bg-zinc-200 dark:bg-zinc-800" />
                    <div className="h-5 w-14 animate-pulse rounded-full bg-zinc-200 dark:bg-zinc-800" />
                </div>
                <div className="h-20 animate-pulse rounded bg-zinc-100 dark:bg-zinc-950" />
                <div className="h-16 animate-pulse rounded bg-zinc-100 dark:bg-zinc-800/60" />
            </div>
        </div>
    );
}

function EquipoEmptyState() {
    const { t } = useTranslation();

    return (
        <div className="flex min-h-screen flex-col items-center justify-center gap-4 bg-zinc-50 px-4 font-sans dark:bg-black">
            <div className="space-y-4 text-center">
                <h1 className="text-2xl font-bold dark:text-white">{t("app.noTeam")}</h1>
                <p className="text-zinc-500 dark:text-zinc-400">{t("app.generateFirst")}</p>
            </div>
            <Link href="/configurar">
                <Button className="bg-blue-600 text-white hover:bg-blue-700">
                    {t("nav.configurar")}
                </Button>
            </Link>
        </div>
    );
}

function EquipoPageSkeleton() {
    return (
        <div className="min-h-screen bg-zinc-50 font-sans dark:bg-black">
            <main className="container mx-auto flex flex-col items-center gap-8 px-4 py-8">
                <header className="flex min-h-24 w-full max-w-3xl flex-col items-center justify-center gap-4 text-center">
                    <SkeletonPill className="h-10 w-48" />
                    <SkeletonPill className="h-6 w-64" />
                </header>

                <section className="w-full flex justify-center">
                    <AdHero />
                </section>

                <div className="flex w-full max-w-4xl flex-wrap items-center justify-center gap-3">
                    {Array.from({ length: 6 }, (_, index) => (
                        <SkeletonPill key={index} className="h-10 w-32 rounded-xl" />
                    ))}
                </div>

                <section className="w-full flex justify-center py-4">
                    <AdBanner />
                </section>

                <div className="mb-8 grid w-full max-w-5xl grid-cols-1 gap-10 pt-8 pb-32 sm:grid-cols-2 md:grid-cols-3">
                    {Array.from({ length: 6 }, (_, index) => (
                        <PokemonCardSkeleton key={index} index={index} />
                    ))}
                </div>

                <AdInline />

                <section className="w-full max-w-4xl space-y-4 py-8">
                    <SkeletonPill className="mx-auto h-6 w-40" />
                    <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
                        {Array.from({ length: 3 }, (_, index) => (
                            <div
                                key={index}
                                aria-hidden="true"
                                className="h-36 animate-pulse rounded-xl border border-zinc-200 bg-white dark:border-zinc-800 dark:bg-zinc-900"
                            />
                        ))}
                    </div>
                </section>

                <section className="w-full max-w-4xl py-8">
                    <div
                        aria-hidden="true"
                        className="h-40 animate-pulse rounded-2xl border border-zinc-200 bg-white dark:border-zinc-800 dark:bg-zinc-900"
                    />
                </section>

                <section className="w-full max-w-4xl py-8">
                    <div
                        aria-hidden="true"
                        className="h-48 animate-pulse rounded-2xl border border-zinc-200 bg-white dark:border-zinc-800 dark:bg-zinc-900"
                    />
                </section>

                <section className="w-full flex justify-center py-4">
                    <AdBanner />
                </section>
            </main>
        </div>
    );
}

export function EquipoPageClient({ expectsTeam }: EquipoPageClientProps) {
    const {
        team,
        setTeam,
        gameplan,
        teamGuide,
        teamGuideI18n,
        format,
        addTeam,
        generationOptions,
        isHydrated,
    } = useTeam();
    const { t, lang } = useTranslation();
    const [isRegenerating, setIsRegenerating] = useState(false);
    const [selectedPokemonIndex, setSelectedPokemonIndex] = useState<number | null>(null);
    const [isDetailsOpen, setIsDetailsOpen] = useState(false);
    const [PokemonDetailsDialog, setPokemonDetailsDialog] =
        useState<PokemonDetailsDialogComponent | null>(null);
    const mountedRef = useRef(true);
    const regenerationOptions = useMemo(
        () => cloneGenerationOptions(generationOptions),
        [generationOptions]
    );
    const bugReportContext = buildBugReportGenerationContext(team, generationOptions);
    const resolvedTeamGuide = teamGuideI18n?.[lang] || teamGuide;
    const selectedPokemon =
        selectedPokemonIndex === null ? null : (team[selectedPokemonIndex] ?? null);

    useEffect(() => {
        if (team.length > 0) {
            analytics.viewTeam(team.length);
        }
    }, [team.length]);

    useEffect(() => {
        return () => {
            mountedRef.current = false;
        };
    }, []);

    const teamTypes = useMemo(
        () =>
            team
                .flatMap((pokemon) => pokemon.types || [])
                .filter((value, index, values) => values.indexOf(value) === index),
        [team]
    );

    const handlePrefetchPokemonDetails = useCallback(() => {
        void preloadPokemonDetailsDialog().then((Dialog) => {
            if (mountedRef.current) {
                setPokemonDetailsDialog(() => Dialog);
            }
        });
    }, []);

    const handleOpenPokemonDetails = useCallback((index: number) => {
        setSelectedPokemonIndex(index);
        setIsDetailsOpen(true);
        void preloadPokemonDetailsDialog().then((Dialog) => {
            if (mountedRef.current) {
                setPokemonDetailsDialog(() => Dialog);
            }
        });
    }, []);

    const handlePokemonDetailsOpenChange = useCallback((open: boolean) => {
        setIsDetailsOpen(open);
        if (!open) {
            setSelectedPokemonIndex(null);
        }
    }, []);

    const handleSelectedPokemonUpdate = useCallback(
        (updatedPokemon: GeneratedTeamMember) => {
            if (selectedPokemonIndex === null) return;

            const nextTeam = [...team];
            nextTeam[selectedPokemonIndex] = updatedPokemon;
            setTeam(nextTeam);
        },
        [selectedPokemonIndex, setTeam, team]
    );

    const handleRegenerate = async () => {
        if (!regenerationOptions) {
            toast.error(t("form.error"));
            return;
        }

        setIsRegenerating(true);
        try {
            const response = await fetch("/api/generate-dynamic-team", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(regenerationOptions),
            });

            if (!response.ok) throw new Error("Generation failed");

            const data = await response.json();

            analytics.generateTeam(
                regenerationOptions.format ?? format,
                regenerationOptions.templateId || "balanced"
            );
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

        saveTeamToSavedTeams({
            team,
            format,
            generationOptions,
        });
        toast.success(t("app.teamSaved"));
    };

    if (!isHydrated) {
        return expectsTeam ? <EquipoPageSkeleton /> : <EquipoEmptyState />;
    }

    if (team.length === 0) {
        return <EquipoEmptyState />;
    }

    return (
        <div className="min-h-screen bg-zinc-50 font-sans dark:bg-black">
            <main className="container mx-auto flex flex-col items-center gap-8 px-4 py-8">
                <header className="space-y-4 text-center">
                    <h1 className="text-3xl font-bold tracking-tight text-zinc-900 dark:text-zinc-50">
                        {t("app.yourTeam")}
                    </h1>
                    <p className="text-lg text-zinc-600 dark:text-zinc-400">
                        {t("app.format")}:
                        {" "}
                        <span className="font-bold text-zinc-900 dark:text-zinc-200">
                            {format.toUpperCase()}
                        </span>
                    </p>
                </header>

                <section className="w-full flex justify-center">
                    <AdHero />
                </section>

                <div className="flex flex-wrap items-center justify-center gap-3">
                    {generationOptions && (
                        <Button
                            onClick={handleRegenerate}
                            disabled={isRegenerating}
                            className="gap-2 bg-blue-600 font-semibold text-white shadow-sm hover:bg-blue-700"
                        >
                            <RefreshCw className={`h-4 w-4 ${isRegenerating ? "animate-spin" : ""}`} />
                            {isRegenerating
                                ? lang === "es"
                                    ? "Actualizando..."
                                    : "Refreshing..."
                                : t("app.generateAnother")}
                        </Button>
                    )}
                    <Link href="/analisis">
                        <Button
                            variant="secondary"
                            className="gap-2 bg-zinc-200 font-semibold text-zinc-900 shadow-sm hover:bg-zinc-300 dark:bg-zinc-800 dark:text-zinc-100 dark:hover:bg-zinc-700"
                        >
                            <ChartColumn className="h-4 w-4" />
                            {t("nav.analysis")}
                        </Button>
                    </Link>
                    <Button
                        onClick={handleExport}
                        variant="outline"
                        className="gap-2 border-zinc-300 font-medium dark:border-zinc-700"
                    >
                        <Copy className="h-4 w-4" />
                        {t("app.exportShowdown")}
                    </Button>
                    <Button
                        onClick={handleSaveTeam}
                        variant="outline"
                        className="gap-2 border-zinc-300 font-medium dark:border-zinc-700"
                    >
                        <Save className="h-4 w-4" />
                        {t("app.saveTeam")}
                    </Button>
                    <Link href="/configurar">
                        <Button
                            variant="ghost"
                            className="gap-2 font-medium text-zinc-600 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-100"
                        >
                            <Settings2 className="h-4 w-4" />
                            {t("app.editOptions")}
                        </Button>
                    </Link>
                    <BugReportDialog
                        generationContext={bugReportContext}
                        trigger={(
                            <Button
                                variant="outline"
                                className="gap-2 border-zinc-300 font-medium dark:border-zinc-700"
                            >
                                <Bug className="h-4 w-4" />
                                {lang === "es" ? "Reportar bug" : "Report Bug"}
                            </Button>
                        )}
                    />
                </div>

                <section className="w-full flex justify-center py-4">
                    <AdBanner />
                </section>

                <div className="mb-8 grid w-full max-w-5xl grid-cols-1 gap-10 pt-8 pb-32 sm:grid-cols-2 md:grid-cols-3">
                    {team.map((pokemon, index) => (
                        <PokemonCard
                            key={`${pokemon.name}-${index}`}
                            pokemon={pokemon}
                            onSelect={() => handleOpenPokemonDetails(index)}
                            onPrefetchDetails={handlePrefetchPokemonDetails}
                        />
                    ))}
                </div>

                <AdInline />

                {gameplan && (
                    <div className="mt-8 w-full max-w-4xl space-y-4 py-8">
                        <h3 className="text-center text-xl font-bold dark:text-white">
                            {t("gameplan.title")}
                        </h3>
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
                                            <div
                                                key={tip}
                                                className="rounded-xl border border-zinc-100 bg-zinc-50 px-3 py-2 text-sm text-zinc-600 dark:border-zinc-800 dark:bg-zinc-950/50 dark:text-zinc-400"
                                            >
                                                {tip}
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        )}
                        <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
                            <div className="flex flex-col gap-3 rounded-xl border border-zinc-200 bg-white p-6 shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
                                <div className="flex items-center gap-2">
                                    <span className="h-2.5 w-2.5 flex-shrink-0 rounded-full bg-rose-500" />
                                    <h4 className="text-lg font-bold text-rose-600 dark:text-rose-400">
                                        {t("gameplan.early")}
                                    </h4>
                                </div>
                                <p className="text-sm font-semibold leading-relaxed text-zinc-800 dark:text-zinc-200">
                                    {gameplan.early.summary}
                                </p>
                            </div>

                            <div className="flex flex-col gap-3 rounded-xl border border-zinc-200 bg-white p-6 shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
                                <div className="flex items-center gap-2">
                                    <span className="h-2.5 w-2.5 flex-shrink-0 rounded-full bg-blue-500" />
                                    <h4 className="text-lg font-bold text-blue-600 dark:text-blue-400">
                                        {t("gameplan.mid")}
                                    </h4>
                                </div>
                                <p className="text-sm font-semibold leading-relaxed text-zinc-800 dark:text-zinc-200">
                                    {gameplan.mid.summary}
                                </p>
                            </div>

                            <div className="flex flex-col gap-3 rounded-xl border border-zinc-200 bg-white p-6 shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
                                <div className="flex items-center gap-2">
                                    <span className="h-2.5 w-2.5 flex-shrink-0 rounded-full bg-emerald-500" />
                                    <h4 className="text-lg font-bold text-emerald-600 dark:text-emerald-400">
                                        {t("gameplan.late")}
                                    </h4>
                                </div>
                                <p className="text-sm font-semibold leading-relaxed text-zinc-800 dark:text-zinc-200">
                                    {gameplan.late.summary}
                                </p>
                            </div>
                        </div>
                    </div>
                )}

                <div className="pt-4 text-center">
                    <Link href="/analisis">
                        <Button
                            variant="outline"
                            className="gap-2 border-emerald-300 text-emerald-700 hover:bg-emerald-50 dark:border-emerald-700 dark:text-emerald-400 dark:hover:bg-emerald-950/30"
                        >
                            <ExternalLink className="h-4 w-4" />
                            {t("analysis.detailedStrategy")}
                        </Button>
                    </Link>
                </div>

                <section className="w-full max-w-4xl py-8">
                    <TeamExplanation team={team} format={format} guide={resolvedTeamGuide} />
                </section>

                <section className="w-full max-w-4xl py-8">
                    <SimilarTeams format={format} teamTypes={teamTypes} />
                </section>

                <section className="w-full flex justify-center py-4">
                    <AdBanner />
                </section>

                <div className="w-full max-w-4xl border-t border-zinc-200 pt-8 dark:border-zinc-800">
                    <h3 className="mb-4 text-center text-lg font-bold dark:text-white">
                        {t("team.exploreMore")}
                    </h3>
                    <div className="flex flex-wrap justify-center gap-3">
                        <Link href={`/guides/${format === "gen9vgc2026f" ? "vgc" : "gen9-ou"}`}>
                            <Button variant="outline" size="sm">
                                <BookOpen className="h-4 w-4" />
                                {t("team.readGuide")}
                            </Button>
                        </Link>
                        <Link href="/tier-list">
                            <Button variant="outline" size="sm">
                                <ChartColumn className="h-4 w-4" />
                                {t("team.tierList")}
                            </Button>
                        </Link>
                        <Link href="/saved-teams">
                            <Button variant="outline" size="sm">
                                <Save className="h-4 w-4" />
                                {t("team.saveTeam")}
                            </Button>
                        </Link>
                    </div>
                </div>

                {selectedPokemon && PokemonDetailsDialog && (
                    <PokemonDetailsDialog
                        pokemon={selectedPokemon}
                        item={selectedPokemon.item}
                        format={format}
                        onUpdate={handleSelectedPokemonUpdate}
                        open={isDetailsOpen}
                        onOpenChange={handlePokemonDetailsOpenChange}
                    />
                )}
            </main>
        </div>
    );
}
