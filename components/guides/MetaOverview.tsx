"use client";

import { useEffect, useState } from "react";
import { getMetaAnalysis, MetaOverviewData } from "@/lib/meta-analysis";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useTranslation } from "@/lib/i18n";
import { getCombinedStats, CombinedPokemonData } from "@/lib/pikalytics";
import { PokemonStatCard } from "./PokemonStatCard";

interface MetaOverviewProps {
    format: string;
}

export function MetaOverview({ format }: MetaOverviewProps) {
    const { t } = useTranslation();
    const [data, setData] = useState<MetaOverviewData | null>(null);
    const [combinedData, setCombinedData] = useState<CombinedPokemonData[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        Promise.all([
            getMetaAnalysis(format),
            getCombinedStats(format)
        ])
            .then(([meta, combined]) => {
                setData(meta);
                setCombinedData(combined);
            })
            .catch(console.error)
            .finally(() => setLoading(false));
    }, [format]);

    if (loading) {
        return (
            <div className="w-full text-center py-12">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
                <p className="mt-4 text-muted-foreground">{t("meta.loading") || "Loading data..."}</p>
            </div>
        );
    }

    if (!data) return null;

    return (
        <div className="w-full space-y-6">
            {/* Tier List Overview */}
            <Card className="bg-white dark:bg-zinc-900 border-zinc-200 dark:border-zinc-800">
                <CardHeader>
                    <CardTitle>📊 {t("guides.tierOverview")}</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="space-y-4">
                        {["S", "A+", "A"].map((tier) => {
                            const mons = data.tierGroups[tier] || [];
                            if (mons.length === 0) return null;

                            const tierColor = tier === "S" ? "bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400" :
                                tier === "A+" ? "bg-orange-50 dark:bg-orange-900/20 text-orange-600 dark:text-orange-400" :
                                    "bg-yellow-50 dark:bg-yellow-900/20 text-yellow-600 dark:text-yellow-400";

                            return (
                                <div key={tier} className={`p-3 rounded-lg ${tierColor}`}>
                                    <h4 className="font-bold mb-2">{tier}-Tier</h4>
                                    <div className="flex flex-wrap gap-2">
                                        {mons.slice(0, 6).map(mon => (
                                            <Badge key={mon.name} variant="outline" className="bg-white/50 dark:bg-black/20 border-0">
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

            {/* Top Threats Detailed */}
            <div className="space-y-4">
                <div className="flex items-center gap-2 mb-2">
                    <h3 className="text-xl font-bold dark:text-zinc-100">⚠️ {t("guides.topThreats")}</h3>
                </div>
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                    {combinedData.slice(0, 6).map((mon, index) => (
                        <PokemonStatCard key={mon.name} data={mon} rank={index + 1} />
                    ))}
                </div>
            </div>

            {/* Most Used Items & Abilities */}
            <Card className="bg-white dark:bg-zinc-900 border-zinc-200 dark:border-zinc-800">
                <CardHeader>
                    <CardTitle>🎯 {t("guides.mostUsedItemsAbilities")}</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="p-4 bg-purple-50 dark:bg-purple-900/20 rounded-lg">
                            <h4 className="font-bold dark:text-white mb-3">⭐ {t("guides.abilities")}</h4>
                            <div className="space-y-2 text-sm dark:text-zinc-300">
                                {data.topAbilities.map((ability, i) => (
                                    <div key={ability.name} className="flex justify-between gap-2">
                                        <span className="truncate cursor-help" title={ability.name}>
                                            {i + 1}. {ability.name}
                                        </span>
                                        <span className="text-purple-600 font-mono flex-shrink-0">
                                            {(ability.usage * 100).toFixed(1)}%
                                        </span>
                                    </div>
                                ))}
                            </div>
                        </div>
                        <div className="p-4 bg-amber-50 dark:bg-amber-900/20 rounded-lg">
                            <h4 className="font-bold dark:text-white mb-3">📦 {t("guides.items")}</h4>
                            <div className="space-y-2 text-sm dark:text-zinc-300">
                                {data.topItems.map((item, i) => (
                                    <div key={item.name} className="flex justify-between gap-2">
                                        <span className="truncate cursor-help" title={item.name}>
                                            {i + 1}. {item.name}
                                        </span>
                                        <span className="text-amber-600 font-mono flex-shrink-0">
                                            {(item.usage * 100).toFixed(1)}%
                                        </span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
