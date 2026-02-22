"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { AdResponsive, AdBanner, AdInline } from "@/components/monetization/Ads";
import { useTranslation } from "@/lib/i18n";
import { useTeam } from "@/lib/team-context";
import { useEffect, useState } from "react";

export default function Home() {
  const { t } = useTranslation();
  const { team } = useTeam();
  const [savedTeamsCount, setSavedTeamsCount] = useState(0);

  // Check for saved teams
  useEffect(() => {
    const saved = localStorage.getItem("saved-teams");
    if (saved) {
      try {
        const teams = JSON.parse(saved);
        if (Array.isArray(teams)) {
          setSavedTeamsCount(teams.length);
        }
      } catch (e) {
        // ignore
      }
    }
  }, []);

  return (
    <div className="min-h-screen font-sans">
      {/* Skip to main content link for accessibility */}
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 focus:z-50 focus:px-4 focus:py-2 focus:bg-blue-600 focus:text-white focus:rounded-lg focus:font-semibold"
      >
        Skip to main content
      </a>
      <main id="main-content" className="container mx-auto px-4 py-12 flex flex-col items-center gap-12">
        <header className="text-center space-y-6 max-w-3xl">
          <div className="flex items-center justify-center" aria-hidden="true">
            <span className="text-5xl animate-bounce-slow">⚔️</span>
          </div>
          <div className="flex items-center justify-center">
            <h1 className="text-4xl font-extrabold tracking-tight text-zinc-900 dark:text-zinc-50 sm:text-6xl bg-clip-text text-transparent bg-gradient-to-b from-zinc-900 to-zinc-600 dark:from-white dark:to-zinc-500">
              {t("app.title")}
            </h1>
          </div>
          <p className="text-xl text-zinc-600 dark:text-zinc-400">
            {t("app.subtitle")}
          </p>
        </header>

        {/* Ad below header instead of very top */}
        <section className="w-full flex justify-center min-h-[100px]">
          <AdResponsive />
        </section>

        {/* Main CTA Button */}
        <section className="flex flex-col items-center gap-6 py-4">
          <Link href="/configurar">
            <Button size="lg" className="bg-blue-600 hover:bg-blue-700 shadow-lg shadow-blue-500/20 hover:shadow-blue-500/40 transition-all focus-visible:ring-2 focus-visible:ring-blue-400 focus-visible:ring-offset-2">
              <span aria-hidden="true" className="mr-2">🚀</span> {t("app.startGenerating")}
            </Button>
          </Link>

          {/* Quick access buttons */}
          <div className="flex flex-wrap gap-3 justify-center" role="group" aria-label="Quick actions">
            {team.length > 0 && (
              <Link href="/equipo">
                <Button variant="outline" size="sm" className="bg-white dark:bg-zinc-900 focus-visible:ring-2 focus-visible:ring-blue-400 focus-visible:ring-offset-2">
                  <span aria-hidden="true">📋</span> {t("app.viewPreviousTeam")}
                </Button>
              </Link>
            )}
            {savedTeamsCount > 0 && (
              <Link href="/saved-teams">
                <Button variant="outline" size="sm" className="bg-white dark:bg-zinc-900 focus-visible:ring-2 focus-visible:ring-blue-400 focus-visible:ring-offset-2">
                  <span aria-hidden="true">📁</span> {t("nav.savedTeams")} ({savedTeamsCount})
                </Button>
              </Link>
            )}
          </div>
        </section>

        {/* Quick Links Section - New Pages */}
        <section className="w-full max-w-5xl py-4" aria-labelledby="explore-title">
          <h2 id="explore-title" className="text-3xl font-bold dark:text-white mb-8 text-center">
            {t("home.explore.title")}
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6" role="list">

            <Link href="/guides/gen9-ou" className="block" role="listitem">
              <Card className="h-full bg-white dark:bg-zinc-900 border-zinc-200 dark:border-zinc-800 hover:border-orange-500 dark:hover:border-orange-500 transition-all hover:scale-[1.02] cursor-pointer focus-visible:ring-2 focus-visible:ring-orange-500 focus-visible:ring-offset-2 rounded-2xl overflow-hidden">
                <CardContent className="p-6 text-center">
                  <div className="text-4xl mb-3" aria-hidden="true">📚</div>
                  <h3 className="text-lg font-bold dark:text-white">{t("home.explore.guides")}</h3>
                  <p className="text-sm text-zinc-500 dark:text-zinc-400 mt-2">
                    {t("home.explore.guidesDesc")}
                  </p>
                </CardContent>
              </Card>
            </Link>

            <Link href="/tier-list" className="block" role="listitem">
              <Card className="h-full bg-white dark:bg-zinc-900 border-zinc-200 dark:border-zinc-800 hover:border-green-500 dark:hover:border-green-500 transition-all hover:scale-[1.02] cursor-pointer focus-visible:ring-2 focus-visible:ring-green-500 focus-visible:ring-offset-2 rounded-2xl overflow-hidden">
                <CardContent className="p-6 text-center">
                  <div className="text-4xl mb-3" aria-hidden="true">🏆</div>
                  <h3 className="text-lg font-bold dark:text-white">{t("home.explore.tier")}</h3>
                  <p className="text-sm text-zinc-500 dark:text-zinc-400 mt-2">
                    {t("home.explore.tierDesc")}
                  </p>
                </CardContent>
              </Card>
            </Link>

            <Link href="/about" className="block" role="listitem">
              <Card className="h-full bg-white dark:bg-zinc-900 border-zinc-200 dark:border-zinc-800 hover:border-cyan-500 dark:hover:border-cyan-500 transition-all hover:scale-[1.02] cursor-pointer focus-visible:ring-2 focus-visible:ring-cyan-500 focus-visible:ring-offset-2 rounded-2xl overflow-hidden">
                <CardContent className="p-6 text-center">
                  <div className="text-4xl mb-3" aria-hidden="true">ℹ️</div>
                  <h3 className="text-lg font-bold dark:text-white">{t("home.explore.about")}</h3>
                  <p className="text-sm text-zinc-500 dark:text-zinc-400 mt-2">
                    {t("home.explore.aboutDesc")}
                  </p>
                </CardContent>
              </Card>
            </Link>
          </div>
        </section>

        {/* Features section */}
        <section className="w-full max-w-5xl py-12" aria-labelledby="features-title">
          <h2 id="features-title" className="sr-only">{t("features.title")}</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="group text-center p-8 bg-white dark:bg-zinc-900/50 rounded-2xl border border-zinc-200 dark:border-zinc-800 transition-all hover:shadow-xl hover:border-blue-500/50" role="article" aria-labelledby="feature-competitive">
              <div className="text-5xl mb-4 transition-transform group-hover:scale-110" aria-hidden="true">⚔️</div>
              <h3 id="feature-competitive" className="text-xl font-bold dark:text-white mb-3">{t("features.competitive")}</h3>
              <p className="text-zinc-600 dark:text-zinc-400 leading-relaxed">{t("features.competitiveDesc")}</p>
            </div>
            <div className="group text-center p-8 bg-white dark:bg-zinc-900/50 rounded-2xl border border-zinc-200 dark:border-zinc-800 transition-all hover:shadow-xl hover:border-blue-500/50" role="article" aria-labelledby="feature-strategy">
              <div className="text-5xl mb-4 transition-transform group-hover:scale-110" aria-hidden="true">🎯</div>
              <h3 id="feature-strategy" className="text-xl font-bold dark:text-white mb-3">{t("features.strategy")}</h3>
              <p className="text-zinc-600 dark:text-zinc-400 leading-relaxed">{t("features.strategyDesc")}</p>
            </div>
            <div className="group text-center p-8 bg-white dark:bg-zinc-900/50 rounded-2xl border border-zinc-200 dark:border-zinc-800 transition-all hover:shadow-xl hover:border-blue-500/50" role="article" aria-labelledby="feature-export">
              <div className="text-5xl mb-4 transition-transform group-hover:scale-110" aria-hidden="true">📤</div>
              <h3 id="feature-export" className="text-xl font-bold dark:text-white mb-3">{t("features.export")}</h3>
              <p className="text-zinc-600 dark:text-zinc-400 leading-relaxed">{t("features.exportDesc")}</p>
            </div>
          </div>
        </section>

        <section className="w-full flex justify-center">
          <AdInline />
        </section>

        {/* Supported formats */}
        <section className="w-full max-w-3xl py-12 text-center" aria-labelledby="formats-title">
          <h2 id="formats-title" className="text-3xl font-bold dark:text-white mb-8">{t("features.supportedFormats")}</h2>
          <div className="flex flex-wrap justify-center gap-3" role="list">
            {["gen9ou", "gen9vgc2026f", "gen9uu", "gen9monotype", "gen8ou", "gen8vgc"].map((format) => (
              <Link key={format} href={`/configurar?format=${format}`} role="listitem">
                <span className="px-5 py-2 bg-zinc-200 dark:bg-zinc-800 rounded-full text-sm font-medium dark:text-zinc-300 hover:bg-blue-600 hover:text-white transition-all cursor-pointer focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2">
                  {format.toUpperCase()}
                </span>
              </Link>
            ))}
          </div>
        </section>

        {/* Trending Teams CTA */}
        <section className="w-full max-w-3xl py-12 text-center bg-blue-50 dark:bg-blue-950/20 rounded-3xl border border-blue-100 dark:border-blue-900/30" aria-labelledby="trending-title">
          <h2 id="trending-title" className="text-2xl font-bold dark:text-white mb-6">
            <span aria-hidden="true" className="mr-2">🔥</span> {t("home.trending")}
          </h2>
          <div className="flex flex-wrap gap-4 justify-center px-6" role="group" aria-label="Team templates">
            <Link href="/configurar?template=bulkyoffense&format=gen9ou">
              <Button variant="outline" className="bg-white dark:bg-zinc-900 border-zinc-200 dark:border-zinc-800 hover:border-blue-500 dark:hover:border-blue-500 focus-visible:ring-2 focus-visible:ring-blue-400 focus-visible:ring-offset-2">
                <span aria-hidden="true" className="mr-2">🛡️</span> Bulky Offense
              </Button>
            </Link>
            <Link href="/configurar?template=offense&format=gen9ou">
              <Button variant="outline" className="bg-white dark:bg-zinc-900 border-zinc-200 dark:border-zinc-800 hover:border-blue-500 dark:hover:border-blue-500 focus-visible:ring-2 focus-visible:ring-blue-400 focus-visible:ring-offset-2">
                <span aria-hidden="true" className="mr-2">⚡</span> Hyper Offense
              </Button>
            </Link>
            <Link href="/configurar?template=rain&format=gen9ou">
              <Button variant="outline" className="bg-white dark:bg-zinc-900 border-zinc-200 dark:border-zinc-800 hover:border-blue-500 dark:hover:border-blue-500 focus-visible:ring-2 focus-visible:ring-blue-400 focus-visible:ring-offset-2">
                <span aria-hidden="true" className="mr-2">🌧️</span> Rain
              </Button>
            </Link>
            <Link href="/configurar?template=weatheroffense&format=gen9vgc2026f">
              <Button variant="outline" className="bg-white dark:bg-zinc-900 border-zinc-200 dark:border-zinc-800 hover:border-blue-500 dark:hover:border-blue-500 focus-visible:ring-2 focus-visible:ring-blue-400 focus-visible:ring-offset-2">
                <span aria-hidden="true" className="mr-2">💨</span> VGC Weather
              </Button>
            </Link>
          </div>
        </section>

        {/* Ad Banner at bottom */}
        <section className="w-full flex justify-center py-4">
          <AdBanner />
        </section>
      </main>
    </div>
  );
}
