"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Pencil, Check, X } from "lucide-react";
import { AdResponsive, AdBanner, AdInline } from "@/components/monetization/Ads";
import { useTranslation } from "@/lib/i18n";
import { useTeam } from "@/lib/team-context";
import { getPokemonData } from "@/lib/showdown-data";
import { analytics } from "@/lib/analytics";
import { toast } from "sonner";

interface SavedTeam {
    id: string;
    team: any[];
    format: string;
    createdAt: string;
    name?: string;
}

export default function SavedTeamsPage() {
    const { t } = useTranslation();
    const router = useRouter();
    const { setTeam, setFormat, setGameplan } = useTeam();
    const [savedTeams, setSavedTeams] = useState<SavedTeam[]>([]);
    const [loading, setLoading] = useState(true);
    const [editingId, setEditingId] = useState<string | null>(null);
    const [editingName, setEditingName] = useState<string>("");

    // Load saved teams from localStorage
    useEffect(() => {
        const teams = localStorage.getItem("saved-teams");
        if (teams) {
            try {
                setSavedTeams(JSON.parse(teams));
            } catch (e) {
                console.error("Failed to parse saved teams:", e);
            }
        }
        setLoading(false);
        analytics.viewSavedTeams();
    }, []);

    const handleLoadTeam = (savedTeam: SavedTeam) => {
        setTeam(savedTeam.team);
        setFormat(savedTeam.format as any);
        router.push("/equipo");
    };

    const handleDeleteTeam = (id: string) => {
        const updated = savedTeams.filter(t => t.id !== id);
        setSavedTeams(updated);
        localStorage.setItem("saved-teams", JSON.stringify(updated));
        toast.success(t("savedTeams.teamDeleted"));
    };

    const startEditing = (team: SavedTeam) => {
        setEditingId(team.id);
        setEditingName(team.name || `Team ${team.id.slice(0, 8)}`);
    };

    const saveEditing = () => {
        if (!editingId) return;

        const updated = savedTeams.map(t => {
            if (t.id === editingId) {
                return { ...t, name: editingName.trim() || undefined };
            }
            return t;
        });

        setSavedTeams(updated);
        localStorage.setItem("saved-teams", JSON.stringify(updated));
        setEditingId(null);
        toast.success(t("savedTeams.teamRenamed") || "Equipo renombrado exitosamente");
    };

    const cancelEditing = () => {
        setEditingId(null);
    };

    const formatDate = (dateStr: string) => {
        const date = new Date(dateStr);
        return date.toLocaleDateString(undefined, {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-zinc-50 dark:bg-black font-sans flex items-center justify-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
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

                {/* Header */}
                <header className="text-center space-y-4">
                    <h1 className="text-3xl font-bold tracking-tight text-zinc-900 dark:text-zinc-50">
                        {t("savedTeams.title")}
                    </h1>
                    <p className="text-lg text-zinc-600 dark:text-zinc-400">
                        {t("savedTeams.description")}
                    </p>
                </header>

                {/* Generate New Button */}
                <div className="flex gap-4">
                    <Link href="/configurar">
                        <Button className="bg-blue-600 hover:bg-blue-700">
                            🚀 {t("nav.generate")}
                        </Button>
                    </Link>
                </div>

                {/* Ad Banner */}
                <section className="w-full flex justify-center py-4">
                    <AdBanner />
                </section>

                {/* Saved Teams List */}
                {savedTeams.length > 0 ? (
                    <div className="w-full max-w-4xl grid gap-4">
                        {savedTeams.map((team) => (
                            <Card key={team.id} className="bg-white dark:bg-zinc-900 border-zinc-200 dark:border-zinc-800">
                                <CardHeader className="flex flex-row items-center justify-between pb-2">
                                    <div>
                                        <CardTitle className="text-lg flex items-center gap-2">
                                            <span className="px-2 py-1 bg-zinc-100 dark:bg-zinc-800 rounded text-xs font-mono shrink-0">
                                                {team.format.toUpperCase()}
                                            </span>
                                            {editingId === team.id ? (
                                                <div className="flex items-center gap-2 flex-1">
                                                    <Input
                                                        value={editingName}
                                                        onChange={(e) => setEditingName(e.target.value)}
                                                        onKeyDown={(e) => {
                                                            if (e.key === "Enter") saveEditing();
                                                            if (e.key === "Escape") cancelEditing();
                                                        }}
                                                        className="h-8 max-w-[200px]"
                                                        autoFocus
                                                    />
                                                    <Button size="icon" variant="ghost" className="h-8 w-8 text-green-600" onClick={saveEditing}>
                                                        <Check className="h-4 w-4" />
                                                    </Button>
                                                    <Button size="icon" variant="ghost" className="h-8 w-8 text-red-600" onClick={cancelEditing}>
                                                        <X className="h-4 w-4" />
                                                    </Button>
                                                </div>
                                            ) : (
                                                <div className="flex items-center gap-2 group">
                                                    <span className="truncate">
                                                        {team.name || `Team ${team.id.slice(0, 8)}`}
                                                    </span>
                                                    <Button
                                                        size="icon"
                                                        variant="ghost"
                                                        className="h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity"
                                                        onClick={() => startEditing(team)}
                                                    >
                                                        <Pencil className="h-3 w-3" />
                                                    </Button>
                                                </div>
                                            )}
                                        </CardTitle>
                                        <p className="text-sm text-zinc-500 dark:text-zinc-400 mt-1">
                                            {formatDate(team.createdAt)} • {team.team.length} Pokémon
                                        </p>
                                    </div>
                                    <div className="flex gap-2">
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            onClick={() => handleDeleteTeam(team.id)}
                                        >
                                            🗑️
                                        </Button>
                                        <Button
                                            className="bg-blue-600 hover:bg-blue-700"
                                            size="sm"
                                            onClick={() => handleLoadTeam(team)}
                                        >
                                            {t("savedTeams.loadTeam")}
                                        </Button>
                                    </div>
                                </CardHeader>
                                <CardContent>
                                    <div className="flex flex-wrap gap-2">
                                        {team.team.slice(0, 6).map((pokemon: any, index: number) => {
                                            const pokeData = getPokemonData(pokemon.name);
                                            const types = pokeData?.types || [];
                                            return (
                                                <div
                                                    key={index}
                                                    className="flex items-center gap-2 px-3 py-1.5 bg-zinc-100 dark:bg-zinc-800 rounded-full"
                                                >
                                                    <span className="text-sm font-medium dark:text-zinc-200">
                                                        {pokemon.name}
                                                    </span>
                                                    {types.length > 0 && (
                                                        <span className="text-xs px-1.5 py-0.5 rounded bg-zinc-200 dark:bg-zinc-700">
                                                            {types.join('/')}
                                                        </span>
                                                    )}
                                                </div>
                                            );
                                        })}
                                    </div>
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                ) : (
                    <div className="text-center py-12">
                        <div className="text-6xl mb-4">📭</div>
                        <h2 className="text-xl font-bold dark:text-white mb-2">
                            {t("savedTeams.noTeams")}
                        </h2>
                        <p className="text-zinc-600 dark:text-zinc-400 mb-6">
                            {t("savedTeams.noTeamsDesc")}
                        </p>
                        <Link href="/configurar">
                            <Button className="bg-blue-600 hover:bg-blue-700">
                                {t("app.startGenerating")}
                            </Button>
                        </Link>
                    </div>
                )}

                <AdInline />

                {/* Ad Banner at bottom */}
                <section className="w-full flex justify-center py-4">
                    <AdBanner />
                </section>
            </main>
        </div>
    );
}
