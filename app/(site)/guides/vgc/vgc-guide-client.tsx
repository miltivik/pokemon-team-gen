"use client";

import Link from "next/link";
import {
    BookOpen,
    CheckCircle2,
    Flame,
    Gamepad2,
    Lightbulb,
    MoonStar,
    Rocket,
    Trophy,
    Wind,
} from "lucide-react";
import { AdBanner, AdHero, AdInline } from "@/components/monetization/Ads";
import { MetaOverview } from "@/components/guides/MetaOverview";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useTranslation } from "@/lib/i18n";
import { COLOR_THEMES, FORMAT_GUIDES } from "@/config/format-guides";
import { CURRENT_VGC_FORMAT } from "@/config/formats";
import type { MetaOverviewPayload } from "@/lib/meta-analysis";

const playstyleIcons = {
    flame: Flame,
    moon: MoonStar,
    wind: Wind,
};

export default function VGCGuideClient({
    initialData,
}: {
    initialData: MetaOverviewPayload | null;
}) {
    const { t, lang } = useTranslation();

    const guideData = FORMAT_GUIDES.vgc;

    return (
        <div className="min-h-screen bg-zinc-50 font-sans dark:bg-black">
            <main className="container mx-auto flex flex-col items-center gap-8 px-4 py-8">
                <header className="max-w-3xl space-y-4 text-center">
                    <div className="inline-flex items-center justify-center rounded-full bg-violet-100 px-3 py-1 text-sm font-semibold text-violet-700 dark:bg-violet-950/40 dark:text-violet-300">
                        <Trophy className="mr-2 h-4 w-4" />
                        {t("guides.vgcGuideTitle")}
                    </div>
                    <h1 className="text-3xl font-black tracking-tight text-zinc-900 dark:text-zinc-50 sm:text-4xl">
                        VGC 2026 Reg I Team Building Guide for Pokemon Showdown
                    </h1>
                    <p className="text-lg text-zinc-600 dark:text-zinc-400">
                        {t("guides.vgcGuideDesc")}
                    </p>
                    <div className="space-y-3 text-left">
                        <p className="rounded-xl border border-blue-300 bg-blue-50 px-4 py-3 text-sm font-medium text-blue-900 dark:border-blue-800 dark:bg-blue-950/30 dark:text-blue-200">
                            {lang === "es"
                                ? "Reglas de VGC 2026 Regulation I en Pokemon Showdown: maximo dos Pokemon restringidos, clausula de objetos unicos y prohibicion de Pokemon miticos."
                                : "VGC 2026 Regulation I rules on Pokemon Showdown: up to two restricted legendaries, a unique items clause, and no mythical Pokemon."}
                        </p>
                        <p className="rounded-xl border border-amber-300 bg-amber-50 px-4 py-3 text-sm font-medium text-amber-900 dark:border-amber-800 dark:bg-amber-950/30 dark:text-amber-200">
                            {lang === "es"
                                ? "Pokemon Champions usa una linea competitiva distinta: el circuito oficial ya migro a Champions y sus regulaciones actuales (Regulation M) no deben confundirse con este formato de Showdown."
                                : "Pokemon Champions runs a different competitive line: the official circuit has moved to Champions and its current regulations (Regulation M) should not be confused with this Showdown format."}
                        </p>
                    </div>
                    <p className="text-xs text-zinc-500 dark:text-zinc-400">
                        {lang === "es"
                            ? "Regulation F sigue disponible como formato historico."
                            : "Regulation F remains available as a legacy format."}
                    </p>
                    <p className="text-xs text-zinc-500 dark:text-zinc-400">
                        Updated August 13, 2026 · Sources: <a href="https://www.smogon.com/stats/" target="_blank" rel="noopener noreferrer" className="underline underline-offset-2 hover:text-zinc-700 dark:hover:text-zinc-200">Smogon usage data</a> and <a href="https://pikalytics.com/" target="_blank" rel="noopener noreferrer" className="underline underline-offset-2 hover:text-zinc-700 dark:hover:text-zinc-200">Pikalytics team data</a> when available.
                    </p>
                </header>

                <section className="flex w-full justify-center">
                    <AdHero />
                </section>

                <div className="flex justify-center">
                    <Link href={`/configurar?format=${CURRENT_VGC_FORMAT}`}>
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

                <div className="w-full max-w-4xl space-y-6">
                    <section className="rounded-xl border border-zinc-200 bg-white p-5 dark:border-zinc-800 dark:bg-zinc-900">
                        <h2 className="mb-2 text-xl font-bold text-zinc-900 dark:text-zinc-100">
                            {lang === "es" ? "Cómo construir un equipo VGC" : "How to build a VGC team"}
                        </h2>
                        <p className="text-sm leading-relaxed text-zinc-600 dark:text-zinc-400">
                            {lang === "es"
                                ? "Usa el resumen del metajuego, elige un estilo de juego y combina roles que cubran las amenazas actuales de Regulation I."
                                : "Use the metagame snapshot, choose a playstyle and combine roles that cover the current Regulation I threats."}
                        </p>
                    </section>
                    <MetaOverview format={CURRENT_VGC_FORMAT} initialData={initialData} />

                    <Card className="border-zinc-200 bg-white dark:border-zinc-800 dark:bg-zinc-900">
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <Gamepad2 className="h-5 w-5 text-violet-500" />
                                {t("guides.popularPlaystyles")}
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-4">
                                {guideData.playstyles.map((style) => {
                                    const theme = COLOR_THEMES[style.colorTheme];
                                    const Icon = playstyleIcons[style.icon as keyof typeof playstyleIcons];

                                    return (
                                        <div key={style.id} className={`rounded-lg p-4 ${theme.bg}`}>
                                            <h4 className={`mb-2 flex items-center gap-2 font-bold ${theme.text}`}>
                                                <Icon className="h-4 w-4" />
                                                {style.title[lang]}
                                            </h4>
                                            <p className="text-sm text-zinc-600 dark:text-zinc-400">
                                                {t(style.descKey)}
                                            </p>
                                            {style.templateId && (
                                                <Link
                                                    href={`/configurar?template=${style.templateId}&format=${CURRENT_VGC_FORMAT}`}
                                                >
                                                    <Button
                                                        size="sm"
                                                        className="mt-3 bg-blue-600 text-white hover:bg-blue-700"
                                                    >
                                                        {t("guides.tryIt")}
                                                    </Button>
                                                </Link>
                                            )}
                                        </div>
                                    );
                                })}
                            </div>
                        </CardContent>
                    </Card>

                    {guideData.tips && guideData.tips.length > 0 && (
                        <Card className="border-zinc-200 bg-white dark:border-zinc-800 dark:bg-zinc-900">
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <Lightbulb className="h-5 w-5 text-amber-500" />
                                    {t("guides.vgcKeyTips")}
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                <ul className="space-y-2 text-zinc-700 dark:text-zinc-300">
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

                <AdInline />

                <div className="flex flex-wrap justify-center gap-4">
                    <Link href="/guides/gen9-ou">
                        <Button variant="outline" className="gap-2">
                            <BookOpen className="h-4 w-4" />
                            {t("guides.ouGuide")}
                        </Button>
                    </Link>
                    <Link href="/tier-list">
                        <Button variant="outline" className="gap-2">
                            <Trophy className="h-4 w-4" />
                            {t("guides.fullTierList")}
                        </Button>
                    </Link>
                    <Button
                        asChild
                        variant="outline"
                        className="h-auto min-h-11 w-full min-w-0 whitespace-normal break-words text-center leading-snug sm:w-auto"
                    >
                        <Link href="/pokemon-showdown-team-builder">
                            <Rocket className="h-4 w-4" />
                            {t("seo.vgcShowdownBuilderLink")}
                        </Link>
                    </Button>
                </div>

                <section className="flex w-full justify-center py-4">
                    <AdBanner />
                </section>
            </main>
        </div>
    );
}
