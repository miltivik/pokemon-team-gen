"use client";

import { useEffect } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { AdResponsive, AdBanner, AdInline, KoFiWidget } from "@/components/monetization/Ads";
import { useTranslation } from "@/lib/i18n";
import { analytics } from "@/lib/analytics";

export default function AboutPage() {
    const { t } = useTranslation();

    useEffect(() => {
        analytics.viewAbout();
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
                        ℹ️ {t("about.title")}
                    </h1>
                    <p className="text-lg text-zinc-600 dark:text-zinc-400">
                        {t("about.subtitle")}
                    </p>
                </header>

                {/* CTA */}
                <div className="flex gap-4">
                    <Link href="/configurar">
                        <Button className="bg-blue-600 hover:bg-blue-700">
                            🚀 {t("about.startGenerating")}
                        </Button>
                    </Link>
                </div>

                {/* Ad Banner */}
                <section className="w-full flex justify-center py-4">
                    <AdBanner />
                </section>

                {/* About Content */}
                <div className="w-full max-w-4xl space-y-6">
                    <Card className="bg-white dark:bg-zinc-900 border-zinc-200 dark:border-zinc-800">
                        <CardContent className="p-6">
                            <h2 className="text-xl font-bold dark:text-white mb-4">{t("about.whatIs")}</h2>
                            <p className="text-zinc-700 dark:text-zinc-300 mb-4">
                                {t("about.whatIsDesc")}
                            </p>
                            <ul className="space-y-2 text-zinc-700 dark:text-zinc-300">
                                <li>⚔️ <strong>{t("about.feature1Title")}:</strong> {t("about.feature1Desc")}</li>
                                <li>📊 <strong>{t("about.feature2Title")}:</strong> {t("about.feature2Desc")}</li>
                                <li>📤 <strong>{t("about.feature3Title")}:</strong> {t("about.feature3Desc")}</li>
                                <li>🌍 <strong>{t("about.feature4Title")}:</strong> {t("about.feature4Desc")}</li>
                            </ul>
                        </CardContent>
                    </Card>

                    <Card className="bg-white dark:bg-zinc-900 border-zinc-200 dark:border-zinc-800">
                        <CardContent className="p-6">
                            <h2 className="text-xl font-bold dark:text-white mb-4">{t("about.supportedFormats")}</h2>
                            <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                                {[
                                    "Gen 9 OU",
                                    "Gen 9 VGC 2026",
                                    "Gen 9 UU",
                                    "Gen 9 RU",
                                    "Gen 9 LC",
                                    "Gen 9 Monotype",
                                    "Gen 8 OU",
                                    "Gen 8 VGC",
                                    "Gen 7 OU",
                                ].map((format) => (
                                    <div key={format} className="p-2 bg-zinc-100 dark:bg-zinc-800 rounded text-center text-sm dark:text-zinc-300">
                                        {format}
                                    </div>
                                ))}
                            </div>
                        </CardContent>
                    </Card>

                    <Card className="bg-white dark:bg-zinc-900 border-zinc-200 dark:border-zinc-800">
                        <CardContent className="p-6">
                            <h2 className="text-xl font-bold dark:text-white mb-4">{t("about.howItWorks")}</h2>
                            <div className="space-y-4">
                                <div className="flex items-start gap-3">
                                    <span className="flex-shrink-0 w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center font-bold">1</span>
                                    <div>
                                        <h4 className="font-semibold dark:text-white">{t("about.step1Title")}</h4>
                                        <p className="text-sm text-zinc-600 dark:text-zinc-400">{t("about.step1Desc")}</p>
                                    </div>
                                </div>
                                <div className="flex items-start gap-3">
                                    <span className="flex-shrink-0 w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center font-bold">2</span>
                                    <div>
                                        <h4 className="font-semibold dark:text-white">{t("about.step2Title")}</h4>
                                        <p className="text-sm text-zinc-600 dark:text-zinc-400">{t("about.step2Desc")}</p>
                                    </div>
                                </div>
                                <div className="flex items-start gap-3">
                                    <span className="flex-shrink-0 w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center font-bold">3</span>
                                    <div>
                                        <h4 className="font-semibold dark:text-white">{t("about.step3Title")}</h4>
                                        <p className="text-sm text-zinc-600 dark:text-zinc-400">{t("about.step3Desc")}</p>
                                    </div>
                                </div>
                                <div className="flex items-start gap-3">
                                    <span className="flex-shrink-0 w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center font-bold">4</span>
                                    <div>
                                        <h4 className="font-semibold dark:text-white">{t("about.step4Title")}</h4>
                                        <p className="text-sm text-zinc-600 dark:text-zinc-400">{t("about.step4Desc")}</p>
                                    </div>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    <Card className="bg-white dark:bg-zinc-900 border-zinc-200 dark:border-zinc-800">
                        <CardContent className="p-6">
                            <h2 className="text-xl font-bold dark:text-white mb-4">☕ {t("about.support")}</h2>
                            <p className="text-zinc-700 dark:text-zinc-300 mb-4">
                                {t("about.supportDesc")}
                            </p>
                            <div className="flex gap-4">
                                <KoFiWidget />
                            </div>
                        </CardContent>
                    </Card>
                </div>

                <AdInline />

                {/* Quick Links */}
                <div className="flex flex-wrap gap-4 justify-center">
                    <Link href="/guides/gen9-ou">
                        <Button variant="outline">
                            📚 {t("about.ouGuide")}
                        </Button>
                    </Link>
                    <Link href="/guides/vgc">
                        <Button variant="outline">
                            🎮 {t("about.vgcGuide")}
                        </Button>
                    </Link>
                    <Link href="/tier-list">
                        <Button variant="outline">
                            📊 {t("about.tierList")}
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
