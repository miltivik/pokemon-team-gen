"use client";

import dynamic from "next/dynamic";
import Image from "next/image";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { useTranslation } from "@/lib/i18n";
import { getPokemonSpriteUrl } from "@/lib/pokemon-sprites";

const HomeQuickActions = dynamic(
  () => import("@/components/home/HomeQuickActions").then((module) => module.HomeQuickActions),
  {
    ssr: false,
    loading: () => null,
  }
);

function InlineAdShell() {
  return (
    <div className="w-full my-8 flex justify-center" aria-hidden="true">
      <div className="h-[250px] w-full max-w-[970px] animate-pulse rounded-lg bg-zinc-200 dark:bg-zinc-800/60" />
    </div>
  );
}

function BannerAdShell() {
  return (
    <div className="w-full flex justify-center py-4" aria-hidden="true">
      <div className="h-[90px] w-full max-w-[728px] animate-pulse rounded-lg bg-zinc-200 dark:bg-zinc-800/60" />
    </div>
  );
}

const HomeAdInline = dynamic(
  () => import("@/components/monetization/Ads").then((module) => module.AdInline),
  {
    ssr: false,
    loading: () => <InlineAdShell />,
  }
);

const HomeAdBanner = dynamic(
  () => import("@/components/monetization/Ads").then((module) => module.AdBanner),
  {
    ssr: false,
    loading: () => <BannerAdShell />,
  }
);

const HERO_PREVIEW_POKEMON = [
  "Great Tusk",
  "Kingambit",
  "Gholdengo",
  "Dragapult",
  "Ogerpon-Wellspring",
  "Ting-Lu",
];

const SUPPORTED_FORMATS = ["gen9ou", "gen9vgc2026f", "gen9uu", "gen9monotype", "gen8ou"];

const TRENDING_TEAMS = [
  {
    href: "/configurar?template=bulkyoffense&format=gen9ou",
    title: "Bulky Offense",
    badge: "Gen 9 OU",
    icon: "🛡️",
    iconClasses: "bg-blue-100 text-blue-600 dark:bg-blue-900/30",
    cardClasses:
      "hover:border-blue-500 hover:shadow-lg hover:shadow-blue-500/10",
    titleClasses:
      "group-hover:text-blue-600 dark:group-hover:text-blue-400",
    pokemon: [
      "Great Tusk",
      "Kingambit",
      "Gholdengo",
      "Rillaboom",
      "Dragapult",
      "Gliscor",
    ],
  },
  {
    href: "/configurar?template=offense&format=gen9ou",
    title: "Hyper Offense",
    badge: "Gen 9 OU",
    icon: "⚡",
    iconClasses: "bg-amber-100 text-amber-600 dark:bg-amber-900/30",
    cardClasses:
      "hover:border-amber-500 hover:shadow-lg hover:shadow-amber-500/10",
    titleClasses:
      "group-hover:text-amber-600 dark:group-hover:text-amber-400",
    pokemon: [
      "Glimmora",
      "Roaring Moon",
      "Iron Valiant",
      "Iron Boulder",
      "Gouging Fire",
      "Kingambit",
    ],
  },
  {
    href: "/configurar?template=rain&format=gen9ou",
    titleKey: "team.rainTeam",
    badge: "Gen 9 OU",
    icon: "🌧️",
    iconClasses: "bg-cyan-100 text-cyan-600 dark:bg-cyan-900/30",
    cardClasses:
      "hover:border-cyan-500 hover:shadow-lg hover:shadow-cyan-500/10",
    titleClasses:
      "group-hover:text-cyan-600 dark:group-hover:text-cyan-400",
    pokemon: [
      "Pelipper",
      "Barraskewda",
      "Archaludon",
      "Swampert",
      "Tornadus-Therian",
      "Raging Bolt",
    ],
  },
  {
    href: "/configurar?template=weatheroffense&format=gen9vgc2026f",
    title: "VGC Weather",
    badge: "VGC 2024",
    icon: "💨",
    iconClasses: "bg-orange-100 text-orange-600 dark:bg-orange-900/30",
    cardClasses:
      "hover:border-orange-500 hover:shadow-lg hover:shadow-orange-500/10",
    titleClasses:
      "group-hover:text-orange-600 dark:group-hover:text-orange-400",
    pokemon: [
      "Torkoal",
      "Flutter Mane",
      "Incineroar",
      "Chi-Yu",
      "Venusaur",
      "Raging Bolt",
    ],
  },
];

const EXPLORE_LINKS = [
  {
    href: "/guides/gen9-ou",
    icon: "📚",
    titleKey: "home.explore.guides",
    descriptionKey: "home.explore.guidesDesc",
    classes:
      "hover:bg-white hover:border-orange-500/50 dark:hover:bg-zinc-900 dark:hover:border-orange-500/50",
  },
  {
    href: "/tier-list",
    icon: "🏆",
    titleKey: "home.explore.tier",
    descriptionKey: "home.explore.tierDesc",
    classes:
      "hover:bg-white hover:border-green-500/50 dark:hover:bg-zinc-900 dark:hover:border-green-500/50",
  },
  {
    href: "/about",
    icon: "ℹ️",
    titleKey: "home.explore.about",
    descriptionKey: "home.explore.aboutDesc",
    classes:
      "hover:bg-white hover:border-cyan-500/50 dark:hover:bg-zinc-900 dark:hover:border-cyan-500/50",
  },
];

function HomePokemonSprite({
  name,
  className,
  size,
  sizes,
}: {
  name: string;
  className: string;
  size: number;
  sizes: string;
}) {
  return (
    <Image
      src={getPokemonSpriteUrl(name, "sprite")}
      alt={name}
      width={size}
      height={size}
      sizes={sizes}
      className={className}
    />
  );
}

function SupportedFormatsSection() {
  return (
    <section
      className="w-full max-w-4xl py-6 border-y border-zinc-200 dark:border-zinc-800/50 my-4 text-center"
      aria-labelledby="formats-title"
    >
      <h2
        id="formats-title"
        className="text-sm font-semibold text-zinc-500 dark:text-zinc-400 uppercase tracking-widest mb-6"
      >
        Supported Formats
      </h2>
      <div
        className="flex flex-wrap justify-center items-center gap-4 sm:gap-8 opacity-70 grayscale hover:grayscale-0 transition-all duration-500"
        role="list"
      >
        {SUPPORTED_FORMATS.map((format) => (
          <Link
            key={format}
            href={`/configurar?format=${format}`}
            prefetch={false}
            role="listitem"
          >
            <span className="text-sm sm:text-base font-bold text-zinc-700 dark:text-zinc-300 hover:text-blue-600 dark:hover:text-blue-400 transition-colors cursor-pointer">
              {format.toUpperCase().replace("GEN9", "GEN 9 ").replace("GEN8", "GEN 8 ")}
            </span>
          </Link>
        ))}
      </div>
    </section>
  );
}

export default function Home() {
  const { t } = useTranslation();

  return (
    <div className="min-h-screen font-sans">
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 focus:z-50 focus:px-4 focus:py-2 focus:bg-blue-600 focus:text-white focus:rounded-lg focus:font-semibold"
      >
        Skip to main content
      </a>

      <main
        id="main-content"
        className="container mx-auto px-4 py-12 flex flex-col items-center gap-12"
      >
        <header className="text-center space-y-6 max-w-4xl pt-8">
          <div className="inline-flex items-center justify-center px-3 py-1 rounded-full bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 text-sm font-medium mb-4">
            {t("app.aiPowered")}
          </div>
          <div className="flex items-center justify-center">
            <h1 className="text-4xl sm:text-5xl md:text-7xl font-extrabold tracking-tight text-zinc-900 dark:text-zinc-50 bg-clip-text text-transparent bg-gradient-to-b from-zinc-900 to-zinc-600 dark:from-white dark:to-zinc-400 leading-tight pb-1">
              {t("app.titleNew")}
            </h1>
          </div>
          <p className="text-xl text-zinc-600 dark:text-zinc-400 max-w-2xl mx-auto leading-relaxed">
            {t("app.subtitleNew")}
          </p>
        </header>

        <section className="flex flex-col items-center gap-4 py-2 w-full max-w-md">
          <Link href="/configurar" className="w-full sm:w-auto">
            <Button
              size="lg"
              className="w-full sm:w-auto text-lg px-8 py-6 bg-blue-600 hover:bg-blue-700 shadow-xl shadow-blue-500/25 hover:shadow-blue-500/50 transition-all hover:-translate-y-1 focus-visible:ring-2 focus-visible:ring-blue-400 focus-visible:ring-offset-2 rounded-full text-white"
            >
              <span aria-hidden="true" className="mr-2 text-xl">
                🚀
              </span>{" "}
              {t("app.startGeneratingNew")}
            </Button>
          </Link>
          <p className="text-sm text-zinc-500 dark:text-zinc-400">
            {t("app.freeNoReg")}
          </p>
          <HomeQuickActions />
        </section>

        <section
          className="w-full max-w-4xl mx-auto my-8 relative flex flex-col items-center"
          aria-hidden="true"
        >
          <div className="text-center mb-6">
            <h2 className="text-sm font-bold text-blue-600 dark:text-blue-400 uppercase tracking-widest mb-2">
              {t("home.demoTitle")}
            </h2>
            <p className="text-lg sm:text-xl font-medium text-zinc-700 dark:text-zinc-300">
              {t("home.demoDesc")}
            </p>
          </div>

          <div className="absolute inset-0 top-16 bg-gradient-to-b from-blue-500/10 to-transparent dark:from-blue-500/5 blur-3xl rounded-full" />
          <div className="relative w-full bg-white/50 dark:bg-zinc-900/50 backdrop-blur-sm border border-zinc-200 dark:border-zinc-800 rounded-3xl p-6 shadow-2xl">
            <div className="flex items-center justify-between mb-6 border-b border-zinc-200 dark:border-zinc-800 pb-4">
              <div className="flex gap-2">
                <div className="w-3 h-3 rounded-full bg-red-400" />
                <div className="w-3 h-3 rounded-full bg-amber-400" />
                <div className="w-3 h-3 rounded-full bg-green-400" />
              </div>
              <div className="text-sm font-medium text-zinc-500">
                pokemonshowdown.com
              </div>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-6 gap-4">
              {HERO_PREVIEW_POKEMON.map((pokemon) => (
                <div
                  key={pokemon}
                  className="aspect-square bg-white dark:bg-zinc-800 rounded-2xl flex items-center justify-center border border-zinc-200 dark:border-zinc-700 relative overflow-hidden group hover:border-blue-500 dark:hover:border-blue-500 hover:shadow-lg hover:shadow-blue-500/10 transition-all cursor-default"
                >
                  <div className="absolute inset-0 bg-gradient-to-br from-transparent to-black/5 dark:to-white/5" />
                  <div className="relative z-10 flex h-16 w-16 items-center justify-center sm:h-20 sm:w-20">
                    <HomePokemonSprite
                      name={pokemon}
                      size={80}
                      sizes="(max-width: 640px) 64px, 80px"
                      className="h-full w-full object-contain drop-shadow-md transition-transform group-hover:scale-110"
                    />
                  </div>
                  <div className="absolute bottom-1 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    <span className="text-[10px] font-medium text-zinc-500 dark:text-zinc-400">
                      {pokemon}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        <SupportedFormatsSection />

        <section
          className="w-full max-w-5xl py-16"
          aria-labelledby="how-it-works-title"
        >
          <div className="text-center mb-12">
            <h2
              id="how-it-works-title"
              className="text-3xl sm:text-4xl font-bold text-zinc-900 dark:text-white mb-4"
            >
              {t("about.howItWorks")}
            </h2>
            <p className="text-lg text-zinc-600 dark:text-zinc-400 max-w-2xl mx-auto">
              {t("about.howItWorksSubtitle")}
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 relative">
            <div className="hidden md:block absolute top-1/2 left-[16%] right-[16%] h-0.5 bg-gradient-to-r from-transparent via-zinc-200 dark:via-zinc-800 to-transparent -translate-y-1/2 -z-10" />

            <div className="flex flex-col items-center text-center p-6 bg-white dark:bg-zinc-900/40 rounded-3xl border border-zinc-200 dark:border-zinc-800/80 shadow-sm relative">
              <div className="w-16 h-16 rounded-2xl bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 flex items-center justify-center text-3xl mb-6 shadow-inner ring-4 ring-white dark:ring-zinc-950">
                1
              </div>
              <h3 className="text-xl font-bold dark:text-white mb-3">
                {t("about.step1Title")}
              </h3>
              <p className="text-zinc-600 dark:text-zinc-400">
                {t("about.step1Desc")}
              </p>
            </div>
            <div className="flex flex-col items-center text-center p-6 bg-white dark:bg-zinc-900/40 rounded-3xl border border-zinc-200 dark:border-zinc-800/80 shadow-sm relative">
              <div className="w-16 h-16 rounded-2xl bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 flex items-center justify-center text-3xl mb-6 shadow-inner ring-4 ring-white dark:ring-zinc-950">
                2
              </div>
              <h3 className="text-xl font-bold dark:text-white mb-3">
                {t("about.step2Title")}
              </h3>
              <p className="text-zinc-600 dark:text-zinc-400">
                {t("about.step2Desc")}
              </p>
            </div>
            <div className="flex flex-col items-center text-center p-6 bg-white dark:bg-zinc-900/40 rounded-3xl border border-zinc-200 dark:border-zinc-800/80 shadow-sm relative">
              <div className="w-16 h-16 rounded-2xl bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 flex items-center justify-center text-3xl mb-6 shadow-inner ring-4 ring-white dark:ring-zinc-950">
                3
              </div>
              <h3 className="text-xl font-bold dark:text-white mb-3">
                {t("about.step4Title")}
              </h3>
              <p className="text-zinc-600 dark:text-zinc-400">
                {t("about.step4Desc")}
              </p>
            </div>
          </div>
        </section>

        <section
          className="w-full max-w-5xl py-16"
          aria-labelledby="features-title"
        >
          <h2 id="features-title" className="sr-only">
            {t("features.title")}
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div
              className="group text-left p-8 bg-gradient-to-br from-white to-blue-50/50 dark:from-zinc-900/80 dark:to-zinc-900/40 rounded-3xl border border-blue-100 dark:border-zinc-800 transition-all hover:shadow-xl hover:shadow-blue-500/10 hover:-translate-y-1"
              role="article"
              aria-labelledby="feature-competitive"
            >
              <div
                className="w-14 h-14 rounded-2xl bg-blue-100 dark:bg-blue-900/40 text-blue-600 flex items-center justify-center text-3xl mb-6 shadow-sm ring-1 ring-blue-200 dark:ring-blue-800/50 transition-transform group-hover:scale-110"
                aria-hidden="true"
              >
                📊
              </div>
              <h3
                id="feature-competitive"
                className="text-xl font-bold dark:text-white mb-3"
              >
                {t("features.benefit1Title")}
              </h3>
              <p className="text-zinc-600 dark:text-zinc-400 leading-relaxed">
                {t("features.benefit1Desc")}
              </p>
            </div>
            <div
              className="group text-left p-8 bg-gradient-to-br from-white to-purple-50/50 dark:from-zinc-900/80 dark:to-zinc-900/40 rounded-3xl border border-purple-100 dark:border-zinc-800 transition-all hover:shadow-xl hover:shadow-purple-500/10 hover:-translate-y-1"
              role="article"
              aria-labelledby="feature-strategy"
            >
              <div
                className="w-14 h-14 rounded-2xl bg-purple-100 dark:bg-purple-900/40 text-purple-600 flex items-center justify-center text-3xl mb-6 shadow-sm ring-1 ring-purple-200 dark:ring-purple-800/50 transition-transform group-hover:scale-110"
                aria-hidden="true"
              >
                🔄
              </div>
              <h3
                id="feature-strategy"
                className="text-xl font-bold dark:text-white mb-3"
              >
                {t("features.benefit2Title")}
              </h3>
              <p className="text-zinc-600 dark:text-zinc-400 leading-relaxed">
                {t("features.benefit2Desc")}
              </p>
            </div>
            <div
              className="group text-left p-8 bg-gradient-to-br from-white to-emerald-50/50 dark:from-zinc-900/80 dark:to-zinc-900/40 rounded-3xl border border-emerald-100 dark:border-zinc-800 transition-all hover:shadow-xl hover:shadow-emerald-500/10 hover:-translate-y-1"
              role="article"
              aria-labelledby="feature-export"
            >
              <div
                className="w-14 h-14 rounded-2xl bg-emerald-100 dark:bg-emerald-900/40 text-emerald-600 flex items-center justify-center text-3xl mb-6 shadow-sm ring-1 ring-emerald-200 dark:ring-emerald-800/50 transition-transform group-hover:scale-110"
                aria-hidden="true"
              >
                ⚔️
              </div>
              <h3
                id="feature-export"
                className="text-xl font-bold dark:text-white mb-3"
              >
                {t("features.benefit3Title")}
              </h3>
              <p className="text-zinc-600 dark:text-zinc-400 leading-relaxed">
                {t("features.benefit3Desc")}
              </p>
            </div>
          </div>
        </section>

        <section className="w-full flex justify-center">
          <HomeAdInline />
        </section>

        <section
          className="w-full max-w-5xl py-16 text-center"
          aria-labelledby="trending-title"
        >
          <h2 id="trending-title" className="text-3xl font-bold dark:text-white mb-2">
            <span aria-hidden="true" className="mr-2">
              🔥
            </span>{" "}
            {t("home.trending")}
          </h2>
          <p className="text-zinc-600 dark:text-zinc-400 mb-10">
            {t("home.trendingSubtitle")}
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6" role="list">
            {TRENDING_TEAMS.map((team) => (
              <Link
                key={team.href}
                href={team.href}
                prefetch={false}
                className="block text-left group"
                role="listitem"
              >
                <div
                  className={`bg-white dark:bg-zinc-900/80 rounded-2xl border border-zinc-200 dark:border-zinc-800 p-3 md:p-5 transition-all h-full flex flex-col ${team.cardClasses}`}
                >
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <h3
                        className={`font-bold text-zinc-900 dark:text-white transition-colors ${team.titleClasses}`}
                      >
                        {team.titleKey ? t(team.titleKey) : team.title}
                      </h3>
                      <span className="text-xs font-medium text-zinc-500 bg-zinc-100 dark:bg-zinc-800 px-2 py-0.5 rounded-full mt-1 inline-block">
                        {team.badge}
                      </span>
                    </div>
                    <div
                      className={`flex h-8 w-8 items-center justify-center rounded-full ${team.iconClasses}`}
                    >
                      {team.icon}
                    </div>
                  </div>
                  <div className="flex mt-auto pt-2">
                    {team.pokemon.map((pokemon, index) => (
                      <div
                        key={pokemon}
                        className="w-11 h-11 sm:w-12 sm:h-12 rounded-full bg-zinc-100 dark:bg-zinc-800 border-2 border-white dark:border-zinc-900 -ml-4 first:ml-0 flex items-center justify-center overflow-hidden z-10 group-hover:-translate-y-1 transition-transform drop-shadow-sm"
                        style={{ zIndex: 10 - index }}
                      >
                        <HomePokemonSprite
                          name={pokemon}
                          size={48}
                          sizes="(max-width: 640px) 44px, 48px"
                          className="h-full w-full object-contain scale-110"
                        />
                      </div>
                    ))}
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </section>

        <section
          className="w-full max-w-5xl py-12 border-t border-zinc-200 dark:border-zinc-800/50 mt-8"
          aria-labelledby="explore-title"
        >
          <h2 id="explore-title" className="text-2xl font-bold dark:text-white mb-8 text-center">
            {t("home.explore.title")}
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6" role="list">
            {EXPLORE_LINKS.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                prefetch={false}
                className="block"
                role="listitem"
              >
                <Card
                  className={`h-full bg-zinc-50/50 dark:bg-zinc-900/30 border-zinc-200/50 dark:border-zinc-800/50 transition-all hover:shadow-sm rounded-2xl overflow-hidden ${item.classes}`}
                >
                  <CardContent className="p-6 text-center">
                    <div className="text-3xl mb-3 opacity-80" aria-hidden="true">
                      {item.icon}
                    </div>
                    <h3 className="text-base font-bold dark:text-white">
                      {t(item.titleKey)}
                    </h3>
                    <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-2">
                      {t(item.descriptionKey)}
                    </p>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        </section>

        <section className="w-full max-w-4xl mx-auto py-16 px-6 bg-gradient-to-br from-blue-600 to-blue-800 rounded-3xl text-center shadow-2xl relative overflow-hidden mb-8">
          <div className="absolute inset-0 bg-[url('/icons/pokeball-bg.svg')] opacity-10 bg-no-repeat bg-right -mr-20 mix-blend-overlay" />
          <div className="relative z-10">
            <h2 className="text-3xl sm:text-4xl font-extrabold text-white mb-4">
              {t("home.bottomCtaTitle")}
            </h2>
            <p className="text-blue-100 mb-8 max-w-2xl mx-auto text-lg">
              {t("home.bottomCtaDesc")}
            </p>
            <Link href="/configurar">
              <Button
                size="lg"
                className="bg-white text-blue-700 hover:bg-zinc-100 hover:scale-105 transition-all text-lg px-8 py-6 rounded-full shadow-xl"
              >
                {t("app.startGeneratingNew")}
              </Button>
            </Link>
          </div>
        </section>

        <section className="w-full flex justify-center py-4">
          <HomeAdBanner />
        </section>
      </main>
    </div>
  );
}
