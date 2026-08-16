"use client";

import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { Check, Pencil, Trash2, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { AdResponsive, AdBanner, AdInline } from "@/components/monetization/Ads";
import { SavedTeamsPageSkeleton } from "@/components/page-skeletons";
import { useTranslation } from "@/lib/i18n";
import { analytics } from "@/lib/analytics";
import { getPokemonSpriteUrl } from "@/lib/pokemon-sprites";
import { getPokemonSummary } from "@/lib/pokemon-summary";
import {
    readSavedTeamsFromStorage,
    type SavedTeamRecord,
    writeSavedTeamsToStorage,
} from "@/lib/team-storage";
import { useTeam } from "@/lib/team-context";
import type { GeneratedTeamMember } from "@/lib/team-guide";
import { toast } from "sonner";

function getSavedTeamDisplayName(team: SavedTeamRecord, lang: "en" | "es") {
    return team.name?.trim() || `${lang === "es" ? "Equipo" : "Team"} ${team.id.slice(0, 8)}`;
}

function SavedTeamPreviewMember({ pokemon }: { pokemon: GeneratedTeamMember }) {
    const summary = getPokemonSummary(pokemon.name);
    const displayTypes =
        pokemon.types.length > 0 ? pokemon.types : summary?.types ?? [];
    const spriteUrl = getPokemonSpriteUrl(
        {
            ...(summary ?? {}),
            ...pokemon,
            name: pokemon.name,
        },
        "sprite"
    );

    return (
        <div className="flex min-w-0 items-center gap-3 rounded-xl border border-zinc-200 bg-zinc-50 px-3 py-2 dark:border-zinc-800 dark:bg-zinc-950/60">
            <div className="relative h-10 w-10 shrink-0 rounded-lg bg-white dark:bg-zinc-900">
                <Image
                    src={spriteUrl}
                    alt={pokemon.name}
                    fill
                    sizes="40px"
                    className="object-contain p-1"
                />
            </div>
            <div className="min-w-0 flex-1">
                <div className="truncate text-sm font-semibold text-zinc-900 dark:text-zinc-100">
                    {pokemon.name}
                </div>
                <div className="mt-1 flex flex-wrap gap-1">
                    {displayTypes.slice(0, 2).map((type) => (
                        <span
                            key={`${pokemon.name}-${type}`}
                            className="rounded-full bg-zinc-200 px-2 py-0.5 text-[10px] font-medium text-zinc-600 dark:bg-zinc-800 dark:text-zinc-300"
                        >
                            {type}
                        </span>
                    ))}
                </div>
            </div>
        </div>
    );
}

export default function SavedTeamsPageClient() {
    const { t, lang } = useTranslation();
    const router = useRouter();
    const {
        setFormat,
        setGameplan,
        setGameplanI18n,
        setGenerationOptions,
        setTeam,
        setTeamGuide,
        setTeamGuideI18n,
    } = useTeam();
    const [savedTeams, setSavedTeams] = useState<SavedTeamRecord[]>([]);
    const [loading, setLoading] = useState(true);
    const [editingId, setEditingId] = useState<string | null>(null);
    const [editingName, setEditingName] = useState("");
    const hasSavedTeams = savedTeams.length > 0;

    useEffect(() => {
        const frameId = window.requestAnimationFrame(() => {
            setSavedTeams(readSavedTeamsFromStorage());
            setLoading(false);
        });

        analytics.viewSavedTeams();

        return () => {
            window.cancelAnimationFrame(frameId);
        };
    }, []);

    const handleLoadTeam = async (savedTeam: SavedTeamRecord) => {
        try {
            const { attachMemberAnalyses, generateTeamGuide } = await import("@/lib/team-guide");
            const templateId = savedTeam.generationOptions?.templateId;
            const teamGuideEn = generateTeamGuide(savedTeam.team, {
                format: savedTeam.format,
                templateId,
                lang: "en",
            });
            const teamGuideEs = generateTeamGuide(savedTeam.team, {
                format: savedTeam.format,
                templateId,
                lang: "es",
            });
            const localizedGuide = lang === "es" ? teamGuideEs : teamGuideEn;
            const localizedTeam = attachMemberAnalyses(savedTeam.team, localizedGuide);

            setTeam(localizedTeam);
            setFormat(savedTeam.format);
            setGameplan(localizedGuide.phases);
            setGameplanI18n({
                en: teamGuideEn.phases,
                es: teamGuideEs.phases,
            });
            setTeamGuide(localizedGuide);
            setTeamGuideI18n({
                en: teamGuideEn,
                es: teamGuideEs,
            });
            setGenerationOptions(savedTeam.generationOptions);

            router.push("/equipo");
        } catch (error) {
            console.error("Failed to restore saved team", error);
            toast.error(t("form.error"), {
                description: t("form.errorDesc"),
            });
        }
    };

    const handleDeleteTeam = (id: string) => {
        const updatedTeams = savedTeams.filter((team) => team.id !== id);
        setSavedTeams(updatedTeams);
        writeSavedTeamsToStorage(updatedTeams);
        toast.success(t("savedTeams.teamDeleted"));
    };

    const startEditing = (team: SavedTeamRecord) => {
        setEditingId(team.id);
        setEditingName(getSavedTeamDisplayName(team, lang));
    };

    const cancelEditing = () => {
        setEditingId(null);
        setEditingName("");
    };

    const saveEditing = () => {
        if (!editingId) {
            return;
        }

        const updatedTeams = savedTeams.map((team) => (
            team.id === editingId
                ? {
                    ...team,
                    name: editingName.trim() || undefined,
                }
                : team
        ));

        setSavedTeams(updatedTeams);
        writeSavedTeamsToStorage(updatedTeams);
        setEditingId(null);
        setEditingName("");
        toast.success(t("savedTeams.teamRenamed"));
    };

    const formatDate = (dateStr: string) => {
        const date = new Date(dateStr);
        return date.toLocaleDateString(undefined, {
            year: "numeric",
            month: "short",
            day: "numeric",
            hour: "2-digit",
            minute: "2-digit",
        });
    };

    if (loading) {
        return <SavedTeamsPageSkeleton />;
    }

    return (
        <div className="min-h-screen bg-zinc-50 dark:bg-black font-sans">
            <main className="container mx-auto flex flex-col items-center gap-8 px-4 py-8">
                {hasSavedTeams && (
                    <section className="w-full flex justify-center">
                        <AdResponsive />
                    </section>
                )}

                <header className="max-w-2xl space-y-4 text-center">
                    <h1 className="text-3xl font-bold tracking-tight text-zinc-900 dark:text-zinc-50">
                        {t("savedTeams.title")}
                    </h1>
                    <p className="text-lg text-zinc-600 dark:text-zinc-400">
                        {t("savedTeams.description")}
                    </p>
                </header>

                <div className="flex w-full justify-center">
                    <Link href="/configurar" className="block w-full max-w-xs sm:inline-flex sm:w-auto sm:max-w-none">
                        <Button className="w-full bg-blue-600 text-white hover:bg-blue-700 sm:w-auto">
                            {t("nav.generate")}
                        </Button>
                    </Link>
                </div>

                {hasSavedTeams && (
                    <section className="w-full flex justify-center py-4">
                        <AdBanner />
                    </section>
                )}

                {hasSavedTeams ? (
                    <div className="grid w-full max-w-5xl gap-4">
                        {savedTeams.map((team) => (
                            <Card
                                key={team.id}
                                className="overflow-hidden border-zinc-200 bg-white shadow-sm dark:border-zinc-800 dark:bg-zinc-900"
                            >
                                <CardContent className="p-4 sm:p-5">
                                    <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                                        <div className="min-w-0 flex-1 space-y-3">
                                            <div className="flex flex-wrap items-center gap-2">
                                                <span className="shrink-0 rounded-full bg-zinc-100 px-2.5 py-1 text-[11px] font-mono font-semibold text-zinc-700 dark:bg-zinc-800 dark:text-zinc-200">
                                                    {team.format.toUpperCase()}
                                                </span>
                                                <span className="rounded-full bg-blue-50 px-2.5 py-1 text-[11px] font-semibold text-blue-700 dark:bg-blue-900/30 dark:text-blue-300">
                                                    {team.team.length} Pokemon
                                                </span>
                                            </div>

                                            {editingId === team.id ? (
                                                <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
                                                    <Input
                                                        value={editingName}
                                                        onChange={(event) => setEditingName(event.target.value)}
                                                        onKeyDown={(event) => {
                                                            if (event.key === "Enter") saveEditing();
                                                            if (event.key === "Escape") cancelEditing();
                                                        }}
                                                        className="h-10 w-full sm:max-w-xs"
                                                        autoFocus
                                                    />
                                                    <div className="grid grid-cols-2 gap-2 sm:flex">
                                                        <Button
                                                            size="sm"
                                                            variant="outline"
                                                            className="gap-2"
                                                            onClick={saveEditing}
                                                        >
                                                            <Check className="h-4 w-4" />
                                                            {lang === "es" ? "Guardar" : "Save"}
                                                        </Button>
                                                        <Button
                                                            size="sm"
                                                            variant="ghost"
                                                            className="gap-2"
                                                            onClick={cancelEditing}
                                                        >
                                                            <X className="h-4 w-4" />
                                                            {lang === "es" ? "Cancelar" : "Cancel"}
                                                        </Button>
                                                    </div>
                                                </div>
                                            ) : (
                                                <div className="flex items-start justify-between gap-3">
                                                    <div className="min-w-0">
                                                        <h2 className="truncate text-lg font-semibold text-zinc-900 dark:text-zinc-100">
                                                            {getSavedTeamDisplayName(team, lang)}
                                                        </h2>
                                                        <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">
                                                            {formatDate(team.createdAt)}
                                                        </p>
                                                    </div>
                                                    <Button
                                                        size="icon"
                                                        variant="ghost"
                                                        className="h-9 w-9 shrink-0 text-zinc-500 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-100"
                                                        onClick={() => startEditing(team)}
                                                    >
                                                        <Pencil className="h-4 w-4" />
                                                        <span className="sr-only">
                                                            {lang === "es" ? "Editar nombre del equipo" : "Edit team name"}
                                                        </span>
                                                    </Button>
                                                </div>
                                            )}
                                        </div>

                                        <div className="grid grid-cols-2 gap-2 sm:flex sm:flex-wrap lg:min-w-[220px] lg:justify-end">
                                            <Button
                                                variant="outline"
                                                className="gap-2"
                                                onClick={() => handleDeleteTeam(team.id)}
                                            >
                                                <Trash2 className="h-4 w-4" />
                                                {lang === "es" ? "Eliminar" : "Delete"}
                                            </Button>
                                            <Button
                                                className="col-span-2 bg-blue-600 text-white hover:bg-blue-700 sm:col-span-1"
                                                onClick={() => void handleLoadTeam(team)}
                                            >
                                                {t("savedTeams.loadTeam")}
                                            </Button>
                                        </div>
                                    </div>

                                    <div className="mt-4 grid gap-2 sm:grid-cols-2 xl:grid-cols-3">
                                        {team.team.slice(0, 6).map((pokemon) => (
                                            <SavedTeamPreviewMember
                                                key={`${team.id}-${pokemon.name}`}
                                                pokemon={pokemon}
                                            />
                                        ))}
                                    </div>
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                ) : (
                    <div className="rounded-2xl border border-dashed border-zinc-300 bg-white px-6 py-12 text-center shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
                        <h2 className="text-xl font-bold text-zinc-900 dark:text-white">
                            {t("savedTeams.noTeams")}
                        </h2>
                        <p className="mt-2 text-zinc-600 dark:text-zinc-400">
                            {t("savedTeams.noTeamsDesc")}
                        </p>
                        <Link href="/configurar" className="mt-6 inline-flex">
                            <Button className="bg-blue-600 text-white hover:bg-blue-700">
                                {t("app.startGenerating")}
                            </Button>
                        </Link>
                    </div>
                )}

                {hasSavedTeams && <AdInline />}

                {hasSavedTeams && (
                    <section className="w-full flex justify-center py-4">
                        <AdBanner />
                    </section>
                )}
            </main>
        </div>
    );
}
