"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { AdHero, AdBanner, AdInline } from "@/components/monetization/Ads";
import { useTranslation } from "@/lib/i18n";

type ChangeType = "new" | "improved" | "fixed";

export default function ChangelogPage() {
    const { t } = useTranslation();

    const itemStyles: Record<ChangeType, string> = {
        new: "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-400 border-emerald-200 dark:border-emerald-800/50",
        improved: "bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-400 border-blue-200 dark:border-blue-800/50",
        fixed: "bg-orange-100 text-orange-700 dark:bg-orange-900/40 dark:text-orange-400 border-orange-200 dark:border-orange-800/50",
    };

    const releases = [
        {
            version: "v0.4.0",
            titleKey: "changelog.v040.title",
            dateKey: "changelog.v040.date",
            badgeLabel: t("changelog.latest"),
            badgeClass: "bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-200 dark:border-emerald-500/20",
            iconClass: "bg-emerald-100 dark:bg-emerald-900 text-emerald-500",
            dotClass: "bg-emerald-500",
            items: [
                { type: "new", key: "changelog.v040.item1" },
                { type: "new", key: "changelog.v040.item2" },
                { type: "improved", key: "changelog.v040.item3" },
                { type: "improved", key: "changelog.v040.item4" },
                { type: "fixed", key: "changelog.v040.item5" },
            ] as const,
        },
        {
            version: "v0.3.0",
            titleKey: "changelog.v030.title",
            dateKey: "changelog.v030.date",
            badgeLabel: t("changelog.latest"),
            badgeClass: "bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-200 dark:border-emerald-500/20",
            iconClass: "bg-emerald-100 dark:bg-emerald-900 text-emerald-500",
            dotClass: "bg-emerald-500",
            items: [
                { type: "new", key: "changelog.v030.item1" },
                { type: "improved", key: "changelog.v030.item2" },
                { type: "improved", key: "changelog.v030.item3" },
                { type: "improved", key: "changelog.v030.item4" },
                { type: "improved", key: "changelog.v030.item5" },
                { type: "improved", key: "changelog.v030.item6" },
            ] as const,
        },
        {
            version: "v0.2.0",
            titleKey: "changelog.v020.title",
            dateKey: "changelog.v020.date",
            badgeLabel: "v0.2.0",
            badgeClass: "bg-zinc-100 dark:bg-zinc-800 text-zinc-500 dark:text-zinc-400 border-zinc-200 dark:border-zinc-700",
            iconClass: "bg-blue-100 dark:bg-blue-900 text-blue-500",
            dotClass: "bg-blue-500",
            items: [
                { type: "new", key: "changelog.v020.item1" },
                { type: "improved", key: "changelog.v020.item2" },
                { type: "improved", key: "changelog.v020.item3" },
                { type: "improved", key: "changelog.v020.item4" },
            ] as const,
        },
        {
            version: "v0.1.0",
            titleKey: "changelog.v010.title",
            dateKey: "changelog.v010.date",
            badgeLabel: "v0.1.0",
            badgeClass: "bg-zinc-100 dark:bg-zinc-800 text-zinc-500 dark:text-zinc-400 border-zinc-200 dark:border-zinc-700",
            iconClass: "bg-blue-100 dark:bg-blue-900 text-blue-500",
            dotClass: "bg-blue-500",
            items: [
                { type: "new", key: "changelog.v010.item1" },
                { type: "new", key: "changelog.v010.item2" },
                { type: "new", key: "changelog.v010.item3" },
                { type: "improved", key: "changelog.v010.item4" },
                { type: "improved", key: "changelog.v010.item5" },
                { type: "fixed", key: "changelog.v010.item6" },
                { type: "fixed", key: "changelog.v010.item7" },
            ] as const,
        },
    ] as const;

    return (
        <div className="min-h-screen bg-zinc-50 dark:bg-black font-sans">
            <main className="container mx-auto px-4 py-8 flex flex-col items-center gap-8">
                {/* Ad at top */}
                <section className="w-full flex justify-center">
                    <AdHero />
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
                    {releases.map((release) => (
                        <div key={release.version} className="relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group is-active mb-12">
                            <div className={`flex items-center justify-center w-10 h-10 rounded-full border border-white dark:border-zinc-900 shadow shrink-0 md:order-1 md:group-odd:-translate-x-1/2 md:group-even:translate-x-1/2 z-10 ${release.iconClass}`}>
                                <div className={`w-3 h-3 rounded-full animate-pulse ${release.dotClass}`} />
                            </div>
                            <Card className="w-[calc(100%-4rem)] md:w-[calc(50%-2.5rem)] bg-white dark:bg-zinc-900/80 border-zinc-200 dark:border-zinc-800/80 shadow-sm hover:shadow-md transition-shadow">
                                <CardContent className="p-5 sm:p-6">
                                    <div className="flex flex-col mb-4 gap-1">
                                        <div className="flex items-center justify-between gap-3">
                                            <h2 className="text-xl sm:text-2xl font-black text-zinc-900 dark:text-zinc-50 tracking-tight">
                                                {t(release.titleKey)}
                                            </h2>
                                            <span className={`px-2 py-0.5 rounded text-[10px] font-bold border uppercase tracking-widest leading-none ${release.badgeClass}`}>
                                                {release.badgeLabel}
                                            </span>
                                        </div>
                                        <div className="text-xs font-semibold text-zinc-500 flex items-center gap-1.5 uppercase tracking-wider">
                                            <span>📅 {t(release.dateKey)}</span>
                                        </div>
                                    </div>

                                    <div className="text-sm text-zinc-700 dark:text-zinc-300">
                                        <ul className="space-y-2">
                                            {release.items.map((item) => (
                                                <li key={item.key} className="flex items-start gap-2">
                                                    <span className={`shrink-0 mt-0.5 px-1.5 py-0.5 text-[10px] uppercase font-black rounded-sm leading-none border ${itemStyles[item.type]}`}>
                                                        {t(`changelog.${item.type}`)}
                                                    </span>
                                                    <span className="leading-snug">{t(item.key)}</span>
                                                </li>
                                            ))}
                                        </ul>
                                    </div>
                                </CardContent>
                            </Card>
                        </div>
                    ))}

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
                                            {t("changelog.foundation.title")}
                                        </h2>
                                    </div>
                                    <div className="text-xs font-semibold text-zinc-400 flex items-center gap-1.5 uppercase tracking-wider">
                                        <span>📅 {t("changelog.foundation.date")}</span>
                                    </div>
                                </div>
                                <div className="text-sm text-zinc-500 dark:text-zinc-400">
                                    <ul className="space-y-2">
                                        <li className="flex items-start gap-2 leading-snug">
                                            <span className="shrink-0">🚀</span> {t("changelog.foundation.item1")}
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
