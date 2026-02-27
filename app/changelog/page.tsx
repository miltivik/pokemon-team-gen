"use client";

import { useEffect } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { AdResponsive, AdBanner, AdInline } from "@/components/monetization/Ads";
import { useTranslation } from "@/lib/i18n";
import { analytics } from "@/lib/analytics";

export default function ChangelogPage() {
    const { t } = useTranslation();

    useEffect(() => {
        analytics.viewChangelog();
    }, []);

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
                        🔄 {t("changelog.title")}
                    </h1>
                    <p className="text-lg text-zinc-600 dark:text-zinc-400">
                        {t("changelog.subtitle")}
                    </p>
                </header>

                <div className="flex gap-4">
                    <Link href="/configurar">
                        <Button className="bg-blue-600 hover:bg-blue-700 text-white">
                            🚀 {t("app.startGenerating")}
                        </Button>
                    </Link>
                </div>

                <div className="w-full max-w-3xl mt-6 relative before:absolute before:inset-0 before:ml-5 before:-translate-x-px md:before:mx-auto md:before:translate-x-0 before:h-full before:w-0.5 before:bg-gradient-to-b before:from-transparent before:via-zinc-200 dark:before:via-zinc-800 before:to-transparent">

                    {/* v0.1.0 Release */}
                    <div className="relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group is-active mb-12">
                        {/* Timeline Icon */}
                        <div className="flex items-center justify-center w-10 h-10 rounded-full border border-white dark:border-zinc-900 bg-blue-100 dark:bg-blue-900 text-blue-500 shadow shrink-0 md:order-1 md:group-odd:-translate-x-1/2 md:group-even:translate-x-1/2 z-10">
                            <div className="w-3 h-3 bg-blue-500 rounded-full animate-pulse" />
                        </div>
                        {/* Changelog Card */}
                        <Card className="w-[calc(100%-4rem)] md:w-[calc(50%-2.5rem)] bg-white dark:bg-zinc-900/80 border-zinc-200 dark:border-zinc-800/80 shadow-sm hover:shadow-md transition-shadow">
                            <CardContent className="p-5 sm:p-6">
                                <div className="flex flex-col mb-4 gap-1">
                                    <div className="flex items-center justify-between gap-3">
                                        <h2 className="text-xl sm:text-2xl font-black text-zinc-900 dark:text-zinc-50 tracking-tight">
                                            {t("changelog.v010.title")}
                                        </h2>
                                        <span className="px-2 py-0.5 bg-blue-50 dark:bg-blue-500/10 text-blue-600 dark:text-blue-400 rounded text-[10px] font-bold border border-blue-200 dark:border-blue-500/20 uppercase tracking-widest leading-none">
                                            Latest
                                        </span>
                                    </div>
                                    <div className="text-xs font-semibold text-zinc-500 flex items-center gap-1.5 uppercase tracking-wider">
                                        <span>📅 {t("changelog.v010.date")}</span>
                                    </div>
                                </div>

                                <div className="text-sm text-zinc-700 dark:text-zinc-300">
                                    <ul className="space-y-2">
                                        <li className="flex items-start gap-2">
                                            <span className="shrink-0 mt-0.5 px-1.5 py-0.5 bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-400 text-[10px] uppercase font-black rounded-sm leading-none border border-emerald-200 dark:border-emerald-800/50">
                                                {t("changelog.new")}
                                            </span>
                                            <span className="leading-snug">{t("changelog.v010.item6")}</span>
                                        </li>
                                        <li className="flex items-start gap-2">
                                            <span className="shrink-0 mt-0.5 px-1.5 py-0.5 bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-400 text-[10px] uppercase font-black rounded-sm leading-none border border-emerald-200 dark:border-emerald-800/50">
                                                {t("changelog.new")}
                                            </span>
                                            <span className="leading-snug">{t("changelog.v010.item7")}</span>
                                        </li>
                                        <li className="flex items-start gap-2">
                                            <span className="shrink-0 mt-0.5 px-1.5 py-0.5 bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-400 text-[10px] uppercase font-black rounded-sm leading-none border border-emerald-200 dark:border-emerald-800/50">
                                                {t("changelog.new")}
                                            </span>
                                            <span className="leading-snug">{t("changelog.v010.item4")}</span>
                                        </li>
                                        <li className="flex items-start gap-2">
                                            <span className="shrink-0 mt-0.5 px-1.5 py-0.5 bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-400 text-[10px] uppercase font-black rounded-sm leading-none border border-blue-200 dark:border-blue-800/50">
                                                {t("changelog.improved")}
                                            </span>
                                            <span className="leading-snug">{t("changelog.v010.item1")}</span>
                                        </li>
                                        <li className="flex items-start gap-2">
                                            <span className="shrink-0 mt-0.5 px-1.5 py-0.5 bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-400 text-[10px] uppercase font-black rounded-sm leading-none border border-blue-200 dark:border-blue-800/50">
                                                {t("changelog.improved")}
                                            </span>
                                            <span className="leading-snug">{t("changelog.v010.item2")}</span>
                                        </li>
                                        <li className="flex items-start gap-2">
                                            <span className="shrink-0 mt-0.5 px-1.5 py-0.5 bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-400 text-[10px] uppercase font-black rounded-sm leading-none border border-blue-200 dark:border-blue-800/50">
                                                {t("changelog.improved")}
                                            </span>
                                            <span className="leading-snug">{t("changelog.v010.item8")}</span>
                                        </li>
                                        <li className="flex items-start gap-2">
                                            <span className="shrink-0 mt-0.5 px-1.5 py-0.5 bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-400 text-[10px] uppercase font-black rounded-sm leading-none border border-blue-200 dark:border-blue-800/50">
                                                {t("changelog.improved")}
                                            </span>
                                            <span className="leading-snug">{t("changelog.v010.item9")}</span>
                                        </li>
                                        <li className="flex items-start gap-2">
                                            <span className="shrink-0 mt-0.5 px-1.5 py-0.5 bg-orange-100 text-orange-700 dark:bg-orange-900/40 dark:text-orange-400 text-[10px] uppercase font-black rounded-sm leading-none border border-orange-200 dark:border-orange-800/50">
                                                {t("changelog.fixed")}
                                            </span>
                                            <span className="leading-snug">{t("changelog.v010.item3")}</span>
                                        </li>
                                        <li className="flex items-start gap-2">
                                            <span className="shrink-0 mt-0.5 px-1.5 py-0.5 bg-orange-100 text-orange-700 dark:bg-orange-900/40 dark:text-orange-400 text-[10px] uppercase font-black rounded-sm leading-none border border-orange-200 dark:border-orange-800/50">
                                                {t("changelog.fixed")}
                                            </span>
                                            <span className="leading-snug">{t("changelog.v010.item5")}</span>
                                        </li>
                                    </ul>
                                </div>
                            </CardContent>
                        </Card>
                    </div>

                    {/* Pre-launch / MVP placeholder */}
                    <div className="relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group mb-12 opacity-60 hover:opacity-100 transition-opacity">
                        {/* Timeline Icon */}
                        <div className="flex items-center justify-center w-8 h-8 rounded-full border border-white dark:border-zinc-900 bg-zinc-200 dark:bg-zinc-800 text-zinc-500 shadow-inner shrink-0 md:order-1 md:group-odd:-translate-x-1/2 md:group-even:translate-x-1/2 z-10">
                            <div className="w-2 h-2 bg-zinc-400 dark:bg-zinc-600 rounded-full" />
                        </div>
                        {/* Changelog Card */}
                        <Card className="w-[calc(100%-4rem)] md:w-[calc(50%-2.5rem)] bg-zinc-50 dark:bg-zinc-950 border-zinc-200 dark:border-zinc-800 shadow-sm">
                            <CardContent className="p-5 sm:p-6">
                                <div className="flex flex-col mb-4 gap-1">
                                    <div className="flex items-center justify-between gap-3">
                                        <h2 className="text-lg font-bold text-zinc-600 dark:text-zinc-400 tracking-tight">
                                            Miltivik Pokémon Team Generator
                                        </h2>
                                    </div>
                                    <div className="text-xs font-semibold text-zinc-400 flex items-center gap-1.5 uppercase tracking-wider">
                                        <span>📅 Early 2026</span>
                                    </div>
                                </div>
                                <div className="text-sm text-zinc-500 dark:text-zinc-400">
                                    <ul className="space-y-2">
                                        <li className="flex items-start gap-2 leading-snug">
                                            <span className="shrink-0">🚀</span> Initial public release with Support for Gen 9 OU and Gen 9 VGC formats.
                                        </li>
                                    </ul>
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                </div>

                <AdInline />

                {/* Ad Banner at bottom */}
                <section className="w-full flex justify-center py-4">
                    <AdBanner />
                </section>
            </main>
        </div>
    );
}
