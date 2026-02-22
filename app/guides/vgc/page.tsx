"use client";

import { useEffect } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { AdResponsive, AdBanner, AdInline } from "@/components/monetization/Ads";
import { useTranslation } from "@/lib/i18n";
import { analytics } from "@/lib/analytics";
import { MetaOverview } from "@/components/guides/MetaOverview";
import { CURRENT_VGC_FORMAT } from "@/config/formats";

import { FORMAT_GUIDES, COLOR_THEMES } from "@/config/format-guides";

export default function VGCGuidePage() {
    const { t } = useTranslation();

    useEffect(() => {
        analytics.viewGuides("vgc");
    }, []);

    const guideData = FORMAT_GUIDES.vgc;

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
                        🎮 {t("guides.vgcGuideTitle")}
                    </h1>
                    <p className="text-lg text-zinc-600 dark:text-zinc-400">
                        {t("guides.vgcGuideDesc")}
                    </p>
                </header>

                {/* Generate CTA */}
                <div className="flex gap-4">
                    <Link href={`/configurar?format=${CURRENT_VGC_FORMAT}`}>
                        <Button className="bg-blue-600 hover:bg-blue-700 text-white">
                            🚀 {t("guides.generateTeam")}
                        </Button>
                    </Link>
                </div>

                {/* Ad Banner */}
                <section className="w-full flex justify-center py-4">
                    <AdBanner />
                </section>

                {/* Guide Content */}
                <div className="w-full max-w-4xl space-y-6">
                    {/* Dynamic Meta Overview */}
                    <MetaOverview format={CURRENT_VGC_FORMAT} />

                    {/* Popular VGC Archetypes */}
                    <Card className="bg-white dark:bg-zinc-900 border-zinc-200 dark:border-zinc-800">
                        <CardHeader>
                            <CardTitle>⚔️ {t("guides.popularPlaystyles")}</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-4">
                                {guideData.playstyles.map((style) => {
                                    const theme = COLOR_THEMES[style.colorTheme];
                                    return (
                                        <div key={style.id} className={`p-4 rounded-lg ${theme.bg}`}>
                                            <h4 className={`font-bold mb-2 ${theme.text}`}>
                                                {style.icon} {style.title}
                                            </h4>
                                            <p className="text-sm text-zinc-600 dark:text-zinc-400">
                                                {t(style.descKey)}
                                            </p>
                                            {style.templateId && (
                                                <Link href={`/configurar?template=${style.templateId}&format=${CURRENT_VGC_FORMAT}`}>
                                                    <Button size="sm" className="mt-3 bg-blue-600 hover:bg-blue-700 text-white">
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

                    {/* Key Tips */}
                    {guideData.tips && guideData.tips.length > 0 && (
                        <Card className="bg-white dark:bg-zinc-900 border-zinc-200 dark:border-zinc-800">
                            <CardHeader>
                                <CardTitle>💡 {t("guides.vgcKeyTips")}</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <ul className="space-y-2 text-zinc-700 dark:text-zinc-300">
                                    {guideData.tips.map((tip, idx) => (
                                        <li key={idx}>
                                            ✅ <strong>{t(tip.titleKey)}:</strong> {t(tip.descKey)}
                                        </li>
                                    ))}
                                </ul>
                            </CardContent>
                        </Card>
                    )}
                </div>

                <AdInline />

                {/* Related Links */}
                <div className="flex flex-wrap gap-4 justify-center">
                    <Link href="/guides/gen9-ou">
                        <Button variant="outline">
                            ⚔️ {t("guides.ouGuide")}
                        </Button>
                    </Link>
                    <Link href="/tier-list">
                        <Button variant="outline">
                            📊 {t("guides.fullTierList")}
                        </Button>
                    </Link>
                </div>

                {/* Ad Banner at bottom */}
                <section className="w-full flex justify-center py-4">
                    <AdBanner />
                </section>
            </main>
        </div>
    );
}
