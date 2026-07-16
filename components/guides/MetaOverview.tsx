"use client";

import { useEffect, useMemo, useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useTranslation } from "@/lib/i18n";
import { formatPercentage } from "@/lib/format-percent";
import type { MetaOverviewData, MetaOverviewPayload } from "@/lib/meta-analysis";
import type { CombinedPokemonData } from "@/lib/pikalytics";
import { AlertTriangle, BarChart3, Package, Shield, Sparkles, Swords } from "lucide-react";
import { PokemonStatCard } from "./PokemonStatCard";

interface MetaOverviewProps {
    format: string;
    initialData?: MetaOverviewPayload | null;
}

function hasRenderableCombinedData(entry: CombinedPokemonData) {
    return typeof entry.name === "string" && entry.name.trim().length > 0;
}

function MetaOverviewSkeleton() {
    return (
        <div className="w-full space-y-6" aria-hidden="true">
            <Card className="border-zinc-200 bg-white dark:border-zinc-800 dark:bg-zinc-900">
                <CardHeader>
                    <div className="h-7 w-48 animate-pulse rounded bg-zinc-200 dark:bg-zinc-800" />
                </CardHeader>
                <CardContent>
                    <div className="space-y-4">
                        {Array.from({ length: 3 }, (_, index) => (
                            <div key={index} className="rounded-lg bg-zinc-100 p-4 dark:bg-zinc-800/50">
                                <div className="h-5 w-24 animate-pulse rounded bg-zinc-200 dark:bg-zinc-700" />
                                <div className="mt-3 flex flex-wrap gap-2">
                                    {Array.from({ length: 5 }, (_, pillIndex) => (
                                        <div
                                            key={pillIndex}
                                            className="h-7 w-20 animate-pulse rounded-full bg-zinc-200 dark:bg-zinc-700"
                                        />
                                    ))}
                                </div>
                            </div>
                        ))}
                    </div>
                </CardContent>
            </Card>

            <div className="space-y-4">
                <div className="h-8 w-56 animate-pulse rounded bg-zinc-200 dark:bg-zinc-800" />
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                    {Array.from({ length: 6 }, (_, index) => (
                        <div
                            key={index}
                            className="h-48 animate-pulse rounded-xl border border-zinc-200 bg-white dark:border-zinc-800 dark:bg-zinc-900"
                        />
                    ))}
                </div>
            </div>

            <Card className="border-zinc-200 bg-white dark:border-zinc-800 dark:bg-zinc-900">
                <CardHeader>
                    <div className="h-7 w-64 animate-pulse rounded bg-zinc-200 dark:bg-zinc-800" />
                </CardHeader>
                <CardContent>
                    <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                        {Array.from({ length: 2 }, (_, index) => (
                            <div
                                key={index}
                                className="space-y-3 rounded-lg bg-zinc-100 p-4 dark:bg-zinc-800/50"
                            >
                                <div className="h-5 w-28 animate-pulse rounded bg-zinc-200 dark:bg-zinc-700" />
                                {Array.from({ length: 5 }, (_, rowIndex) => (
                                    <div
                                        key={rowIndex}
                                        className="h-4 w-full animate-pulse rounded bg-zinc-200 dark:bg-zinc-700"
                                    />
                                ))}
                            </div>
                        ))}
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}

export function MetaOverview({ format, initialData }: MetaOverviewProps) {
    const { t, lang } = useTranslation();
    const [data, setData] = useState<MetaOverviewData | null>(initialData?.meta ?? null);
    const [combinedData, setCombinedData] = useState<CombinedPokemonData[]>(
        initialData?.combined ?? []
    );
    const [loading, setLoading] = useState(initialData === undefined);

    useEffect(() => {
        if (initialData?.combined.some(hasRenderableCombinedData)) {
            return;
        }

        const controller = new AbortController();

        fetch(`/api/meta-overview?format=${encodeURIComponent(format)}`, { signal: controller.signal })
            .then(async (response) => {
                if (!response.ok) {
                    throw new Error(`Failed to fetch meta overview for ${format}`);
                }

                return response.json() as Promise<{
                    meta: MetaOverviewData;
                    combined: CombinedPokemonData[];
                }>;
            })
            .then((payload) => {
                setData(payload.meta);
                setCombinedData(payload.combined);
            })
            .catch((error) => {
                if (error instanceof DOMException && error.name === "AbortError") {
                    return;
                }
                console.error(error);
            })
            .finally(() => {
                if (!controller.signal.aborted) {
                    setLoading(false);
                }
            });

        return () => controller.abort();
    }, [format, initialData]);

    const combinedThreats = useMemo(
        () => combinedData.filter(hasRenderableCombinedData).slice(0, 6),
        [combinedData]
    );

    if (loading) {
        return <MetaOverviewSkeleton />;
    }

    if (!data) {
        return (
            <Card className="border-zinc-200 bg-white dark:border-zinc-800 dark:bg-zinc-900">
                <CardContent className="py-10 text-center">
                    <AlertTriangle className="mx-auto mb-3 h-8 w-8 text-amber-500" />
                    <p className="font-semibold text-zinc-800 dark:text-zinc-200">
                        Live competitive data is temporarily unavailable.
                    </p>
                    <p className="mt-2 text-sm text-zinc-600 dark:text-zinc-400">
                        The strategy guide below remains available.
                    </p>
                </CardContent>
            </Card>
        );
    }

    return (
        <div className="w-full space-y-6">
            <Card className="border-zinc-200 bg-white dark:border-zinc-800 dark:bg-zinc-900">
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <BarChart3 className="h-5 w-5 text-blue-500" />
                        {t("guides.tierOverview")}
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="space-y-4">
                        {["S", "A+", "A"].map((tier) => {
                            const mons = data.tierGroups[tier] || [];
                            if (mons.length === 0) {
                                return null;
                            }

                            const tierColor =
                                tier === "S"
                                    ? "bg-red-50 text-red-700 dark:bg-red-900/20 dark:text-red-300"
                                    : tier === "A+"
                                      ? "bg-orange-50 text-orange-700 dark:bg-orange-900/20 dark:text-orange-300"
                                      : "bg-yellow-50 text-yellow-700 dark:bg-yellow-900/20 dark:text-yellow-300";

                            return (
                                <div key={tier} className={`rounded-lg p-3 ${tierColor}`}>
                                    <h4 className="mb-2 font-bold">{tier}-Tier</h4>
                                    <div className="flex flex-wrap gap-2">
                                        {mons.slice(0, 6).map((mon) => (
                                            <Badge
                                                key={mon.name}
                                                variant="outline"
                                                className="border-0 bg-white/60 dark:bg-black/20"
                                            >
                                                {mon.name}
                                            </Badge>
                                        ))}
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </CardContent>
            </Card>

            <section className="space-y-4">
                <div className="mb-2 flex items-center gap-2">
                    <AlertTriangle className="h-5 w-5 text-amber-500" />
                    <h3 className="text-xl font-bold dark:text-zinc-100">
                        {t("guides.topThreats")}
                    </h3>
                </div>
                {combinedThreats.length > 0 ? (
                    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                        {combinedThreats.map((mon, index) => (
                            <PokemonStatCard key={`${mon.name}-${index}`} data={mon} rank={index + 1} />
                        ))}
                    </div>
                ) : data.topThreats.length > 0 ? (
                    <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                        {data.topThreats.slice(0, 6).map((mon, index) => (
                            <Card
                                key={mon.name}
                                className="border-zinc-200 bg-white dark:border-zinc-800 dark:bg-zinc-900"
                            >
                                <CardContent className="flex items-center justify-between gap-3 py-4">
                                    <span className="font-semibold text-zinc-900 dark:text-zinc-100">
                                        {index + 1}. {mon.name}
                                    </span>
                                    <Badge variant="secondary">
                                        {formatPercentage(mon.usage, { fromRatio: true })}
                                    </Badge>
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                ) : (
                    <Card className="border-zinc-200 bg-white dark:border-zinc-800 dark:bg-zinc-900">
                        <CardContent className="py-10 text-center">
                            <AlertTriangle className="mx-auto mb-3 h-8 w-8 text-zinc-400" />
                            <p className="text-zinc-600 dark:text-zinc-400">{t("tierList.noData")}</p>
                            <p className="mt-2 text-sm text-zinc-500 dark:text-zinc-500">
                                {lang === "es"
                                    ? "No pudimos cargar los datos en vivo de Smogon o Pikalytics en este momento."
                                    : "We could not load live Smogon or Pikalytics data right now."}
                            </p>
                        </CardContent>
                    </Card>
                )}
            </section>

            <Card className="border-zinc-200 bg-white dark:border-zinc-800 dark:bg-zinc-900">
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <Shield className="h-5 w-5 text-violet-500" />
                        {t("guides.mostUsedItemsAbilities")}
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                        <div className="rounded-lg bg-purple-50 p-4 dark:bg-purple-900/20">
                            <h4 className="mb-3 flex items-center gap-2 font-bold dark:text-white">
                                <Sparkles className="h-4 w-4 text-purple-500" />
                                {t("guides.abilities")}
                            </h4>
                            <div className="space-y-2 text-sm dark:text-zinc-300">
                                {data.topAbilities.map((ability, index) => (
                                    <div key={ability.name} className="flex justify-between gap-2">
                                        <span className="truncate" title={ability.name}>
                                            {index + 1}. {ability.name}
                                        </span>
                                        <span className="flex-shrink-0 font-mono text-purple-600">
                                            {formatPercentage(ability.usage, { fromRatio: true })}
                                        </span>
                                    </div>
                                ))}
                            </div>
                        </div>
                        <div className="rounded-lg bg-amber-50 p-4 dark:bg-amber-900/20">
                            <h4 className="mb-3 flex items-center gap-2 font-bold dark:text-white">
                                <Package className="h-4 w-4 text-amber-500" />
                                {t("guides.items")}
                            </h4>
                            <div className="space-y-2 text-sm dark:text-zinc-300">
                                {data.topItems.map((item, index) => (
                                    <div key={item.name} className="flex justify-between gap-2">
                                        <span className="truncate" title={item.name}>
                                            {index + 1}. {item.name}
                                        </span>
                                        <span className="flex-shrink-0 font-mono text-amber-600">
                                            {formatPercentage(item.usage, { fromRatio: true })}
                                        </span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </CardContent>
            </Card>

            {combinedThreats.length > 0 && (
                <Card className="border-zinc-200 bg-white dark:border-zinc-800 dark:bg-zinc-900">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <Swords className="h-5 w-5 text-emerald-500" />
                            {lang === "es" ? "Foto rápida del meta" : "Meta Snapshot"}
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="grid gap-3 md:grid-cols-3">
                        {combinedThreats.slice(0, 3).map((entry) => (
                            <div
                                key={`${entry.name}-insight`}
                                className="rounded-xl border border-zinc-100 bg-zinc-50 px-4 py-3 dark:border-zinc-800 dark:bg-zinc-950/50"
                            >
                                <div className="font-semibold text-zinc-900 dark:text-zinc-100">
                                    {entry.name}
                                </div>
                                <div className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">
                                    {entry.topAbility || "N/A"} · {entry.topItem || "N/A"}
                                </div>
                            </div>
                        ))}
                    </CardContent>
                </Card>
            )}
        </div>
    );
}
