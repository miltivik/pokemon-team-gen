"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { AdResponsive, AdBanner } from "@/components/monetization/Ads";
import { useTranslation } from "@/lib/i18n";
import { analytics } from "@/lib/analytics";
import { getSmogonStats, classifyTier, TierRank, SmogonMonData } from "@/lib/smogon-stats";
import { getPokemonSpriteUrl, getPokemonData } from "@/lib/showdown-data";

// Format options
const FORMAT_OPTIONS = [
    { id: "gen9ou", name: "Gen 9 OU", nameEs: "Gen 9 OU" },
    { id: "gen9uu", name: "Gen 9 UU", nameEs: "Gen 9 UU" },
    { id: "gen9ubers", name: "Gen 9 Ubers", nameEs: "Gen 9 Ubers" },
    { id: "gen9monotype", name: "Monotype", nameEs: "Monotype" },
    { id: "gen9vgc2026f", name: "VGC 2026", nameEs: "VGC 2026" },
];

const TIER_ORDER: TierRank[] = ["S", "A+", "A", "A-", "B+", "B", "B-", "C", "D"];

const TIER_COLORS: Record<TierRank, string> = {
    "S": "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300 border-red-200 dark:border-red-800",
    "A+": "bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-300 border-orange-200 dark:border-orange-800",
    "A": "bg-orange-50 text-orange-700 dark:bg-orange-900/20 dark:text-orange-200 border-orange-100 dark:border-orange-900",
    "A-": "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300 border-yellow-200 dark:border-yellow-800",
    "B+": "bg-lime-100 text-lime-800 dark:bg-lime-900/30 dark:text-lime-300 border-lime-200 dark:border-lime-800",
    "B": "bg-lime-50 text-lime-700 dark:bg-lime-900/20 dark:text-lime-200 border-lime-100 dark:border-lime-900",
    "B-": "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300 border-green-200 dark:border-green-800",
    "C": "bg-cyan-100 text-cyan-800 dark:bg-cyan-900/30 dark:text-cyan-300 border-cyan-200 dark:border-cyan-800",
    "D": "bg-zinc-100 text-zinc-800 dark:bg-zinc-800 dark:text-zinc-300 border-zinc-200 dark:border-zinc-700",
};

export default function TierListPage() {
    const { t, lang } = useTranslation();
    const isSpanish = lang === "es";
    const [format, setFormat] = useState<string>("gen9ou");
    const [tierData, setTierData] = useState<Record<string, SmogonMonData[]>>({});
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        analytics.viewTierList();
    }, []);

    const fetchData = useCallback(async () => {
        setLoading(true);
        try {
            const stats = await getSmogonStats(format);
            const grouped: Record<string, SmogonMonData[]> = {};

            Object.values(stats).forEach((mon) => {
                const tier = classifyTier(mon.usage);
                if (!grouped[tier]) grouped[tier] = [];
                grouped[tier].push(mon);
            });

            // Sort within tiers
            Object.keys(grouped).forEach(tier => {
                grouped[tier].sort((a, b) => b.usage - a.usage);
            });

            setTierData(grouped);
        } catch (error) {
            console.error("Failed to fetch tier data", error);
        } finally {
            setLoading(false);
        }
    }, [format]);

    useEffect(() => {
        fetchData();
    }, [fetchData]);

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
                        📊 {t("tierList.title")}
                    </h1>
                    <p className="text-lg text-zinc-600 dark:text-zinc-400">
                        {t("tierList.description")}
                    </p>
                </header>

                {/* Format Selector */}
                <div className="flex flex-wrap gap-2 justify-center">
                    {FORMAT_OPTIONS.map((opt) => (
                        <Button
                            key={opt.id}
                            variant={format === opt.id ? "default" : "outline"}
                            onClick={() => setFormat(opt.id)}
                            className={format === opt.id ? "bg-blue-600 hover:bg-blue-700" : ""}
                        >
                            {isSpanish ? opt.nameEs : opt.name}
                        </Button>
                    ))}
                </div>

                {/* Tier List Content */}
                <div className="w-full max-w-5xl space-y-8">
                    {loading ? (
                        <div className="text-center py-12">
                            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
                            <p className="mt-4 text-zinc-500">{t("meta.loading") || "Loading data..."}</p>
                        </div>
                    ) : Object.keys(tierData).length > 0 ? (
                        TIER_ORDER.filter(tier => tierData[tier]?.length > 0).map((tier) => (
                            <div key={tier} className="space-y-3">
                                <div className={`flex items-center gap-3 px-4 py-2 rounded-lg border ${TIER_COLORS[tier] || TIER_COLORS["D"]}`}>
                                    <h3 className="text-xl font-bold">{tier} Tier</h3>
                                    <span className="text-sm opacity-80">
                                        {tier === 'S' ? '≥ 15% Usage' :
                                         tier === 'A+' ? '≥ 10% Usage' :
                                         tier === 'A' ? '≥ 7% Usage' :
                                         tier === 'A-' ? '≥ 4.52% Usage' :
                                         tier === 'B+' ? '≥ 3.41% Usage' :
                                         tier === 'B' ? '≥ 2% Usage' :
                                         '≥ 1% Usage'}
                                    </span>
                                </div>
                                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
                                    {tierData[tier].map((mon) => {
                                        // Fix for sprite URL: Get full pokemon data including 'num'
                                        const pokemonData = getPokemonData(mon.name);
                                        const spriteUrl = getPokemonSpriteUrl(pokemonData || { name: mon.name });

                                        return (
                                            <div key={mon.name} className="flex items-center gap-3 p-3 bg-white dark:bg-zinc-900 rounded-lg border border-zinc-200 dark:border-zinc-800 hover:shadow-md transition-shadow">
                                                <div className="w-10 h-10 relative flex-shrink-0">
                                                    {/* eslint-disable-next-line @next/next/no-img-element */}
                                                    <img
                                                        src={spriteUrl}
                                                        alt={mon.name}
                                                        className="w-full h-full object-contain pixelated"
                                                        loading="lazy"
                                                    />
                                                </div>
                                                <div className="flex flex-col min-w-0">
                                                    <span className="font-semibold text-sm truncate dark:text-zinc-200" title={mon.name}>
                                                        {mon.name}
                                                    </span>
                                                    <span className="text-xs text-zinc-500 font-mono">
                                                        {(mon.usage * 100).toFixed(2)}%
                                                    </span>
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>
                        ))
                    ) : (
                        <Card className="w-full max-w-2xl mx-auto bg-white dark:bg-zinc-900 border-zinc-200 dark:border-zinc-800">
                            <CardContent className="text-center py-12">
                                <p className="text-zinc-600 dark:text-zinc-400 mb-4">
                                    {t("tierList.noData")}
                                </p>
                                <Button variant="outline" onClick={fetchData}>
                                    Retry
                                </Button>
                            </CardContent>
                        </Card>
                    )}
                </div>

                {/* Ad Banner */}
                <section className="w-full flex justify-center py-4">
                    <AdBanner />
                </section>
            </main>
        </div>
    );
}
