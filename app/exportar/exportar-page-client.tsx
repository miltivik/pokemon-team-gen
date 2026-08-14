"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ArrowLeft, BookOpen, Copy, FileText, Link2, ListOrdered, Sparkles } from "lucide-react";
import { toast } from "sonner";
import { AdBanner, AdHero, AdInline } from "@/components/monetization/Ads";
import { ExportPageSkeleton } from "@/components/page-skeletons";
import { Button } from "@/components/ui/button";
import { analytics } from "@/lib/analytics";
import { getExportText } from "@/lib/export-text";
import { useTranslation } from "@/lib/i18n";
import { useTeam } from "@/lib/team-context";

interface ExportarPageClientProps {
    expectsTeam: boolean;
}

function ExportarEmptyState() {
    const { t } = useTranslation();

    return (
        <div className="flex min-h-screen flex-col items-center justify-center gap-4 bg-zinc-50 font-sans dark:bg-black">
            <div className="space-y-4 text-center">
                <h1 className="text-2xl font-bold dark:text-white">{t("app.noTeam")}</h1>
                <p className="text-zinc-500 dark:text-zinc-400">{t("app.generateFirst")}</p>
            </div>
            <Link href="/configurar">
                <Button className="bg-blue-600 text-white hover:bg-blue-700">{t("nav.configurar")}</Button>
            </Link>
        </div>
    );
}

export function ExportarPageClient({ expectsTeam }: ExportarPageClientProps) {
    const { team, format, isHydrated } = useTeam();
    const { t } = useTranslation();
    const [copied, setCopied] = useState(false);

    useEffect(() => {
        analytics.viewExportar();
    }, []);

    if (!isHydrated) {
        return expectsTeam ? <ExportPageSkeleton /> : <ExportarEmptyState />;
    }

    if (team.length === 0) {
        return <ExportarEmptyState />;
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
        <div className="min-h-screen bg-zinc-50 font-sans dark:bg-black">
            <main className="container mx-auto flex flex-col items-center gap-8 px-4 py-8">
                <section className="flex w-full justify-center">
                    <AdHero />
                </section>

                <div className="flex w-full max-w-4xl justify-start">
                    <Link href="/equipo">
                        <Button variant="ghost" className="gap-2 text-zinc-600 dark:text-zinc-400">
                            <ArrowLeft className="h-4 w-4" />
                            {t("analysis.backToTeam")}
                        </Button>
                    </Link>
                </div>

                <header className="space-y-4 text-center">
                    <h1 className="text-3xl font-bold tracking-tight text-zinc-900 dark:text-zinc-50">
                        {t("nav.export")}
                    </h1>
                    <p className="text-lg text-zinc-600 dark:text-zinc-400">{t("export.description")}</p>
                </header>

                <section className="flex w-full justify-center py-4">
                    <AdBanner />
                </section>

                <div className="w-full max-w-2xl space-y-6">
                    <div className="rounded-xl border border-zinc-200 bg-white p-6 shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
                        <h2 className="mb-4 flex items-center gap-2 text-xl font-bold dark:text-white">
                            <FileText className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                            {t("export.showdownFormat")}
                        </h2>
                        <p className="mb-4 text-sm text-zinc-600 dark:text-zinc-400">
                            {t("export.showdownDescription")}
                        </p>
                        <div className="max-h-64 overflow-auto rounded-lg bg-zinc-100 p-4 dark:bg-zinc-800">
                            <pre className="whitespace-pre-wrap font-mono text-xs text-zinc-700 dark:text-zinc-300">
                                {exportText}
                            </pre>
                        </div>
                        <div className="mt-4 flex gap-3">
                            <Button onClick={handleCopyShowdown} className="gap-2 bg-blue-600 text-white hover:bg-blue-700">
                                <Copy className="h-4 w-4" />
                                {t("app.copyShowdown")}
                            </Button>
                        </div>
                    </div>

                    <div className="rounded-xl border border-zinc-200 bg-white p-6 shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
                        <h2 className="mb-4 flex items-center gap-2 text-xl font-bold dark:text-white">
                            <Link2 className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
                            {t("export.shareLink")}
                        </h2>
                        <p className="mb-4 text-sm text-zinc-600 dark:text-zinc-400">
                            {t("export.shareDescription")}
                        </p>
                        <Button onClick={handleCopy} variant="outline" className="w-full gap-2">
                            <Copy className="h-4 w-4" />
                            {copied ? t("app.copied") : t("export.copyLink")}
                        </Button>
                    </div>
                </div>

                <AdInline />

                <div className="flex flex-wrap items-center justify-center gap-3 pt-4">
                    <Link href="/equipo">
                        <Button variant="outline" className="gap-2">
                            <ArrowLeft className="h-4 w-4" />
                            {t("app.yourTeam")}
                        </Button>
                    </Link>
                    <Link href="/analisis">
                        <Button variant="outline" className="gap-2">
                            <Sparkles className="h-4 w-4" />
                            {t("nav.analysis")}
                        </Button>
                    </Link>
                    <Link href="/configurar">
                        <Button className="gap-2 bg-blue-600 text-white hover:bg-blue-700">
                            <Sparkles className="h-4 w-4" />
                            {t("app.generateAnother")}
                        </Button>
                    </Link>
                </div>

                <div className="w-full max-w-4xl border-t border-zinc-200 pt-8 dark:border-zinc-800">
                    <h3 className="mb-4 text-center text-lg font-bold dark:text-white">{t("export.exploreMore")}</h3>
                    <div className="flex flex-wrap justify-center gap-3">
                        <Link href={`/guides/${format === "gen9vgc2026f" || format === "gen9vgc2026regi" ? "vgc" : "gen9-ou"}`}>
                            <Button variant="outline" size="sm" className="gap-2">
                                <BookOpen className="h-4 w-4" />
                                {t("export.readGuide")}
                            </Button>
                        </Link>
                        <Link href="/tier-list">
                            <Button variant="outline" size="sm" className="gap-2">
                                <ListOrdered className="h-4 w-4" />
                                {t("export.tierList")}
                            </Button>
                        </Link>
                    </div>
                </div>

                <section className="flex w-full justify-center py-4">
                    <AdBanner />
                </section>
            </main>
        </div>
    );
}
