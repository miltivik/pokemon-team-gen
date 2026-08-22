"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
    AlertTriangle,
    BarChart3,
    CheckCircle2,
    Flame,
    Gamepad2,
    Lightbulb,
    MoonStar,
    Rocket,
    Shield,
    Trophy,
    Wind,
    Zap,
} from "lucide-react";
import { AdBanner, AdHero, AdInline } from "@/components/monetization/Ads";
import { PokemonStatCard } from "@/components/guides/PokemonStatCard";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { analytics } from "@/lib/analytics";
import { useTranslation } from "@/lib/i18n";
import type { CombinedPokemonData } from "@/lib/pikalytics";
import { FORMATS, type FormatId } from "@/config/formats";
import { COLOR_THEMES, FORMAT_GUIDES, type PlaystyleIcon } from "@/config/format-guides";

function GuideStatsLoadingSkeleton() {
    return (
        <div aria-hidden="true" className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {Array.from({ length: 6 }, (_, index) => (
                <div
                    key={index}
                    className="h-48 animate-pulse rounded-xl border border-zinc-200 bg-white dark:border-zinc-800 dark:bg-zinc-900"
                />
            ))}
        </div>
    );
}

const playstyleIconMap: Record<PlaystyleIcon, typeof Shield> = {
    flame: Flame,
    moon: MoonStar,
    shield: Shield,
    wind: Wind,
    zap: Zap,
};

function hasRenderableName(mon: CombinedPokemonData) {
    return typeof mon.name === "string" && mon.name.trim().length > 0;
}

export default function DynamicGuidePageClient({
    format,
}: {
    format: FormatId;
}) {
    const formatInfo = FORMATS[format];
    const { t, lang } = useTranslation();
    const [pokemonStats, setPokemonStats] = useState<CombinedPokemonData[]>([]);
    const [loading, setLoading] = useState(true);

    const guideData = FORMAT_GUIDES[format] || FORMAT_GUIDES.default;
    const descriptionKey = `guides.${format}.desc`;
    const translatedDescription = t(descriptionKey);
    const formatDescription =
        translatedDescription === descriptionKey ? t("guides.genericDesc") : translatedDescription;

    useEffect(() => {
        analytics.viewGuides(format);

        const controller = new AbortController();

        async function fetchData() {
            try {
                setLoading(true);
                const response = await fetch(
                    `/api/meta-overview?format=${encodeURIComponent(format)}&limit=15`,
                    { signal: controller.signal }
                );

                if (!response.ok) {
                    throw new Error(`Failed to fetch guide stats for ${format}`);
                }

                const payload = (await response.json()) as { combined: CombinedPokemonData[] };
                setPokemonStats(
                    payload.combined.filter(hasRenderableName).sort((a, b) => b.usage - a.usage).slice(0, 15)
                );
            } catch (error) {
                if (error instanceof DOMException && error.name === "AbortError") {
                    return;
                }
                console.error("Failed to fetch combined stats", error);
            } finally {
                if (!controller.signal.aborted) {
                    setLoading(false);
                }
            }
        }

        void fetchData();

        return () => controller.abort();
    }, [format]);

    return (
        <div className="min-h-screen bg-zinc-50 font-sans dark:bg-black">
            <main className="container mx-auto flex flex-col items-center gap-8 px-4 py-8">
                <header className="max-w-3xl space-y-4 text-center">
                    <div className="inline-flex items-center justify-center rounded-full bg-amber-100 px-3 py-1 text-sm font-semibold text-amber-700 dark:bg-amber-950/40 dark:text-amber-300">
                        <Trophy className="mr-2 h-4 w-4" />
                        {t("guides.title")}
                    </div>
                    <h1 className="text-3xl font-black tracking-tight text-zinc-900 dark:text-zinc-50 sm:text-4xl">
                        {formatInfo.label}
                    </h1>
                    <p className="text-lg leading-relaxed text-zinc-600 dark:text-zinc-400">
                        {formatDescription}
                    </p>
                </header>

                <section className="flex w-full justify-center">
                    <AdHero />
                </section>

                <div className="flex justify-center">
                    <Link href={`/configurar?format=${format}`}>
                        <Button
                            size="lg"
                            className="gap-2 rounded-full bg-blue-600 px-8 font-semibold text-white shadow-md hover:bg-blue-700"
                        >
                            <Rocket className="h-4 w-4" />
                            {t("guides.generateTeam")}
                        </Button>
                    </Link>
                </div>

                <section className="flex w-full justify-center py-4">
                    <AdBanner />
                </section>

                <div className="w-full max-w-5xl space-y-8">
                    <section className="space-y-4">
                        <div className="mb-6 flex items-center gap-2">
                            <BarChart3 className="h-6 w-6 text-blue-500" />
                            <h2 className="text-2xl font-bold dark:text-zinc-100">
                                {t("guides.topPokemonMeta")}
                            </h2>
                        </div>

                        {loading ? (
                            <GuideStatsLoadingSkeleton />
                        ) : pokemonStats.length > 0 ? (
                            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                                {pokemonStats.map((mon, index) => (
                                    <PokemonStatCard key={`${mon.name}-${index}`} data={mon} rank={index + 1} />
                                ))}
                            </div>
                        ) : (
                            <div className="rounded-xl border border-zinc-200 bg-white py-12 text-center text-zinc-500 dark:border-zinc-800 dark:bg-zinc-900/50">
                                <AlertTriangle className="mx-auto mb-4 h-12 w-12 text-zinc-400" />
                                <p className="text-lg">{t("tierList.noData")}</p>
                                <p className="mt-2 text-sm opacity-75">
                                    {lang === "es"
                                        ? "No pudimos cargar los datos de Smogon o Pikalytics en este momento."
                                        : "We could not load Smogon or Pikalytics data right now."}
                                </p>
                            </div>
                        )}
                    </section>

                    <AdInline />

                    <Card className="overflow-hidden border-zinc-200 bg-white shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
                        <CardHeader className="border-b border-zinc-100 bg-zinc-50/50 dark:border-zinc-800 dark:bg-zinc-800/20">
                            <CardTitle className="flex items-center gap-2">
                                <Gamepad2 className="h-5 w-5 text-violet-500" />
                                {t("guides.popularPlaystyles")}
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="pt-6">
                            <div className="grid gap-6 md:grid-cols-2">
                                {guideData.playstyles.map((style) => {
                                    const theme = COLOR_THEMES[style.colorTheme];
                                    const Icon = playstyleIconMap[style.icon];

                                    return (
                                        <div
                                            key={style.id}
                                            className={`rounded-xl border bg-gradient-to-br p-5 ${theme.gradient} ${theme.border}`}
                                        >
                                            <h4 className={`mb-2 flex items-center gap-2 font-bold ${theme.text}`}>
                                                <Icon className="h-4 w-4" />
                                                {style.title[lang]}
                                            </h4>
                                            <p className="text-sm leading-relaxed text-zinc-700 dark:text-zinc-300">
                                                {t(style.descKey)}
                                            </p>
                                        </div>
                                    );
                                })}
                            </div>
                        </CardContent>
                    </Card>

                    {guideData.tips && guideData.tips.length > 0 && (
                        <Card className="overflow-hidden border-zinc-200 bg-white shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
                            <CardHeader className="border-b border-zinc-100 bg-zinc-50/50 dark:border-zinc-800 dark:bg-zinc-800/20">
                                <CardTitle className="flex items-center gap-2">
                                    <Lightbulb className="h-5 w-5 text-amber-500" />
                                    {t("guides.keyTips")}
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="pt-6">
                                <ul className="space-y-3 text-zinc-700 dark:text-zinc-300">
                                    {guideData.tips.map((tip, index) => (
                                        <li key={index} className="flex gap-3">
                                            <CheckCircle2 className="mt-0.5 h-4 w-4 flex-shrink-0 text-emerald-500" />
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
