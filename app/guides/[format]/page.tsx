"use client";

import { useEffect, use, useState, useMemo } from "react";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { AdResponsive, AdBanner, AdInline } from "@/components/monetization/Ads";
import { useTranslation } from "@/lib/i18n";
import { analytics } from "@/lib/analytics";
import { FormatId, FORMATS } from "@/config/formats";
import { getCombinedStats, CombinedPokemonData } from "@/lib/pikalytics";
import { Badge } from "@/components/ui/badge";
import { PokemonStatCard } from "@/components/guides/PokemonStatCard";
import { Loader2, TrendingUp, ShieldAlert } from "lucide-react";
import { FORMAT_GUIDES, COLOR_THEMES } from "@/config/format-guides";

export default function DynamicGuidePage({ params }: { params: Promise<{ format: string }> }) {
    const { format: formatParam } = use(params);

    // Validate format
    if (!formatParam || !FORMATS[formatParam as FormatId]) {
        notFound();
    }

    const format = formatParam as FormatId;
    const formatInfo = FORMATS[format];
    const { t } = useTranslation();

    const [pokemonStats, setPokemonStats] = useState<CombinedPokemonData[]>([]);
    const [loading, setLoading] = useState(true);

    const guideData = FORMAT_GUIDES[format] || FORMAT_GUIDES.default;

    useEffect(() => {
        analytics.viewGuides(format);

        async function fetchData() {
            try {
                setLoading(true);
                // Get top 15 pokemon using combined stats (Smogon Usage + Pikalytics Win Rate/Details)
                const data = await getCombinedStats(format);
                const sorted = data.sort((a, b) => b.usage - a.usage);
                setPokemonStats(sorted.slice(0, 15));
            } catch (error) {
                console.error("Failed to fetch combined stats", error);
            } finally {
                setLoading(false);
            }
        }

        fetchData();
    }, [format]);

    return (
        <div className="min-h-screen bg-zinc-50 dark:bg-black font-sans">
            <main className="container mx-auto px-4 py-8 flex flex-col items-center gap-8">
                {/* Ad at top */}
                <section className="w-full flex justify-center">
                    <AdResponsive />
                </section>

                {/* Header */}
                <header className="text-center space-y-4 max-w-3xl">
                    <h1 className="text-3xl font-bold tracking-tight text-zinc-900 dark:text-zinc-50">
                        🏆 {t("guides.title")} - {formatInfo.label}
                    </h1>
                    <p className="text-lg text-zinc-600 dark:text-zinc-400 leading-relaxed">
                        {t(`guides.${format}.desc`) || t("guides.genericDesc")}
                    </p>
                </header>

                {/* Generate CTA */}
                <div className="flex gap-4">
                    <Link href={`/configurar?format=${format}`}>
                        <Button size="lg" className="bg-blue-600 hover:bg-blue-700 text-white font-semibold px-8 shadow-md">
                            🚀 {t("guides.generateTeam")}
                        </Button>
                    </Link>
                </div>

                {/* Ad Banner */}
                <section className="w-full flex justify-center py-4">
                    <AdBanner />
                </section>

                {/* Guide Content */}
                <div className="w-full max-w-5xl space-y-8">

                    {/* Top Pokemon Detailed Grid */}
                    <div className="space-y-4">
                        <div className="flex items-center gap-2 mb-6">
                            <TrendingUp className="w-6 h-6 text-blue-500" />
                            <h2 className="text-2xl font-bold dark:text-zinc-100">{t("guides.topPokemonMeta")}</h2>
                        </div>

                        {loading ? (
                            <div className="flex flex-col items-center justify-center py-24 text-zinc-500 gap-4 bg-white dark:bg-zinc-900/50 rounded-xl border border-zinc-200 dark:border-zinc-800">
                                <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
                                <p className="font-medium animate-pulse">Cargando datos competitivos...</p>
                            </div>
                        ) : pokemonStats.length > 0 ? (
                            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                                {pokemonStats.map((mon, index) => (
                                    <PokemonStatCard key={mon.name} data={mon} rank={index + 1} />
                                ))}
                            </div>
                        ) : (
                            <div className="text-center py-12 text-zinc-500 bg-white dark:bg-zinc-900/50 rounded-xl border border-zinc-200 dark:border-zinc-800">
                                <ShieldAlert className="w-12 h-12 mx-auto mb-4 text-zinc-400" />
                                <p className="text-lg">{t("tierList.noData")}</p>
                                <p className="text-sm mt-2 opacity-75">No pudimos cargar los datos de Smogon/Pikalytics en este momento.</p>
                            </div>
                        )}
                    </div>

                    <AdInline />

                    {/* Popular Playstyles Info */}
                    <Card className="bg-white dark:bg-zinc-900 border-zinc-200 dark:border-zinc-800 overflow-hidden shadow-sm">
                        <CardHeader className="bg-zinc-50/50 dark:bg-zinc-800/20 border-b border-zinc-100 dark:border-zinc-800">
                            <CardTitle className="flex items-center gap-2">
                                🎮 {t("guides.popularPlaystyles")}
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="pt-6">
                            <div className="grid gap-6 md:grid-cols-2">
                                {guideData.playstyles.map((style) => {
                                    const theme = COLOR_THEMES[style.colorTheme];
                                    return (
                                        <div key={style.id} className={`p-5 rounded-xl border bg-gradient-to-br ${theme.gradient} ${theme.border}`}>
                                            <h4 className={`font-bold mb-2 flex items-center gap-2 ${theme.text}`}>
                                                {style.icon} {style.title}
                                            </h4>
                                            <p className="text-sm text-zinc-700 dark:text-zinc-300 leading-relaxed">
                                                {t(style.descKey)}
                                            </p>
                                        </div>
                                    );
                                })}
                            </div>
                        </CardContent>
                    </Card>

                    {/* Key Tips */}
                    {guideData.tips && guideData.tips.length > 0 && (
                        <Card className="bg-white dark:bg-zinc-900 border-zinc-200 dark:border-zinc-800 overflow-hidden shadow-sm">
                            <CardHeader className="bg-zinc-50/50 dark:bg-zinc-800/20 border-b border-zinc-100 dark:border-zinc-800">
                                <CardTitle className="flex items-center gap-2">
                                    💡 {t("guides.vgcKeyTips")}
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="pt-6">
                                <ul className="space-y-3 text-zinc-700 dark:text-zinc-300">
                                    {guideData.tips.map((tip, idx) => (
                                        <li key={idx} className="flex gap-2">
                                            <span>✅</span>
                                            <div>
                                                <strong>{t(tip.titleKey)}:</strong> {t(tip.descKey)}
                                            </div>
                                        </li>
                                    ))}
                                </ul>
                            </CardContent>
                        </Card>
                    )}
                </div>

            </main>
        </div>
    );
}
