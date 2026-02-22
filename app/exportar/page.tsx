"use client";

import Link from "next/link";
import { useTeam } from "@/lib/team-context";
import { Button } from "@/components/ui/button";
import { AdResponsive, AdBanner, AdInline } from "@/components/monetization/Ads";
import { useTranslation } from "@/lib/i18n";
import { getExportText } from "@/lib/showdown-data";
import { toast } from "sonner";
import { useState, useEffect } from "react";
import { analytics } from "@/lib/analytics";

export default function ExportarPage() {
    const { team, format } = useTeam();
    const { t } = useTranslation();
    const [copied, setCopied] = useState(false);

    // Track page view
    useEffect(() => {
        analytics.viewExportar();
    }, []);

    if (team.length === 0) {
        return (
            <div className="min-h-screen bg-zinc-50 dark:bg-black font-sans flex flex-col items-center justify-center gap-4">
                <div className="text-center space-y-4">
                    <h1 className="text-2xl font-bold dark:text-white">{t("app.noTeam")}</h1>
                    <p className="text-zinc-500 dark:text-zinc-400">{t("app.generateFirst")}</p>
                </div>
                <Link href="/configurar">
                    <Button className="bg-blue-600 hover:bg-blue-700">{t("nav.configurar")}</Button>
                </Link>
            </div>
        );
    }

    const exportText = getExportText(team);

    const handleCopy = async () => {
        await navigator.clipboard.writeText(exportText);
        setCopied(true);
        toast.success(t("app.copied"));
        analytics.exportTeam("share_link");
        setTimeout(() => setCopied(false), 2000);
    };

    const handleCopyShowdown = async () => {
        await navigator.clipboard.writeText(exportText);
        toast.success(t("app.exported"));
        analytics.exportTeam("showdown");
    };

    return (
        <div className="min-h-screen bg-zinc-50 dark:bg-black font-sans">
            <main className="container mx-auto px-4 py-8 flex flex-col items-center gap-8">
                {/* Ad at top */}
                <section className="w-full flex justify-center">
                    <AdResponsive />
                </section>

                {/* Back navigation */}
                <div className="w-full max-w-4xl flex justify-start">
                    <Link href="/equipo">
                        <Button variant="ghost" className="text-zinc-600 dark:text-zinc-400">
                            ← {t("analysis.backToTeam")}
                        </Button>
                    </Link>
                </div>

                {/* Header */}
                <header className="text-center space-y-4">
                    <h1 className="text-3xl font-bold tracking-tight text-zinc-900 dark:text-zinc-50">
                        {t("nav.export")}
                    </h1>
                    <p className="text-lg text-zinc-600 dark:text-zinc-400">
                        {t("export.description")}
                    </p>
                </header>

                {/* Ad Banner */}
                <section className="w-full flex justify-center py-4">
                    <AdBanner />
                </section>

                {/* Export options */}
                <div className="w-full max-w-2xl space-y-6">
                    {/* Showdown format */}
                    <div className="bg-white dark:bg-zinc-900 p-6 rounded-xl border border-zinc-200 dark:border-zinc-800 shadow-sm">
                        <h2 className="text-xl font-bold dark:text-white mb-4">📋 {t("export.showdownFormat")}</h2>
                        <p className="text-zinc-600 dark:text-zinc-400 text-sm mb-4">
                            {t("export.showdownDescription")}
                        </p>
                        <div className="bg-zinc-100 dark:bg-zinc-800 p-4 rounded-lg overflow-auto max-h-64">
                            <pre className="text-xs text-zinc-700 dark:text-zinc-300 whitespace-pre-wrap font-mono">
                                {exportText}
                            </pre>
                        </div>
                        <div className="mt-4 flex gap-3">
                            <Button onClick={handleCopyShowdown} className="bg-blue-600 hover:bg-blue-700">
                                📋 {t("app.copyShowdown")}
                            </Button>
                        </div>
                    </div>

                    {/* Share link option */}
                    <div className="bg-white dark:bg-zinc-900 p-6 rounded-xl border border-zinc-200 dark:border-zinc-800 shadow-sm">
                        <h2 className="text-xl font-bold dark:text-white mb-4">🔗 {t("export.shareLink")}</h2>
                        <p className="text-zinc-600 dark:text-zinc-400 text-sm mb-4">
                            {t("export.shareDescription")}
                        </p>
                        <Button onClick={handleCopy} variant="outline" className="w-full">
                            {copied ? "✓ " + t("app.copied") : t("export.copyLink")}
                        </Button>
                    </div>
                </div>

                <AdInline />

                {/* Navigation buttons */}
                <div className="flex items-center justify-center gap-3 flex-wrap pt-4">
                    <Link href="/equipo">
                        <Button variant="outline">
                            ← {t("app.yourTeam")}
                        </Button>
                    </Link>
                    <Link href="/analisis">
                        <Button variant="outline">
                            📊 {t("nav.analysis")}
                        </Button>
                    </Link>
                    <Link href="/configurar">
                        <Button className="bg-blue-600 hover:bg-blue-700">
                            🔄 {t("app.generateAnother")}
                        </Button>
                    </Link>
                </div>

                {/* Cross-links section - SEO pages */}
                <div className="w-full max-w-4xl pt-8 border-t border-zinc-200 dark:border-zinc-800">
                    <h3 className="text-lg font-bold dark:text-white mb-4 text-center">
                        {t("export.exploreMore")}
                    </h3>
                    <div className="flex flex-wrap gap-3 justify-center">
                        <Link href={`/guides/${format === "gen9vgc2026f" ? "vgc" : "gen9-ou"}`}>
                            <Button variant="outline" size="sm">
                                📚 {t("export.readGuide")}
                            </Button>
                        </Link>
                        <Link href="/tier-list">
                            <Button variant="outline" size="sm">
                                📊 {t("export.tierList")}
                            </Button>
                        </Link>
                    </div>
                </div>

                {/* Ad Banner */}
                <section className="w-full flex justify-center py-4">
                    <AdBanner />
                </section>
            </main>
        </div>
    );
}
