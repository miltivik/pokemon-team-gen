"use client";

import Link from "next/link";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { useTranslation } from "@/lib/i18n";
import { getPokemonSpriteUrl } from "@/lib/pokemon-sprites";
import { getPokemonSlug } from "@/lib/pokemon-summary";

const HERO_PREVIEW_POKEMON = [
    "Great Tusk",
    "Kingambit",
    "Gholdengo",
    "Dragapult",
    "Ogerpon-Wellspring",
    "Ting-Lu",
];

const SUPPORTED_FORMATS = ["gen9ou", "gen9vgc2026regi", "gen9uu", "gen9monotype", "gen8ou"];

interface TrendingTeam {
    href: string;
    template: string;
    titleKey: string;
    badge: string;
    label: string;
    labelClass: string;
    titleClass: string;
    cardClass: string;
    pokemon: string[];
}

function getTrendingTeams(): TrendingTeam[] {
    return [
        {
            href: "/configurar?template=bulkyoffense&format=gen9ou",
            template: "bulkyoffense",
            titleKey: "bulkyOffense",
            badge: "Gen 9 OU",
            label: "BO",
            labelClass: "bg-blue-100 text-blue-700 dark:bg-blue-950/40 dark:text-blue-300",
            titleClass: "group-hover:text-blue-600 dark:group-hover:text-blue-400",
            cardClass: "hover:border-blue-500 hover:shadow-blue-500/10",
            pokemon: ["Great Tusk", "Kingambit", "Gholdengo", "Rillaboom", "Dragapult", "Gliscor"],
        },
        {
            href: "/configurar?template=offense&format=gen9ou",
            template: "offense",
            titleKey: "hyperOffense",
            badge: "Gen 9 OU",
            label: "HO",
            labelClass: "bg-amber-100 text-amber-700 dark:bg-amber-950/40 dark:text-amber-300",
            titleClass: "group-hover:text-amber-600 dark:group-hover:text-amber-400",
            cardClass: "hover:border-amber-500 hover:shadow-amber-500/10",
            pokemon: ["Glimmora", "Roaring Moon", "Iron Valiant", "Iron Boulder", "Gouging Fire", "Kingambit"],
        },
        {
            href: "/configurar?template=rain&format=gen9ou",
            template: "rain",
            titleKey: "rainTeam",
            badge: "Gen 9 OU",
            label: "RN",
            labelClass: "bg-cyan-100 text-cyan-700 dark:bg-cyan-950/40 dark:text-cyan-300",
            titleClass: "group-hover:text-cyan-600 dark:group-hover:text-cyan-400",
            cardClass: "hover:border-cyan-500 hover:shadow-cyan-500/10",
            pokemon: ["Pelipper", "Barraskewda", "Archaludon", "Swampert", "Tornadus-Therian", "Raging Bolt"],
        },
        {
            href: "/configurar?template=weatheroffense&format=gen9vgc2026regi",
            template: "weatheroffense",
            titleKey: "vgcWeather",
            badge: "VGC 2026 Reg I",
            label: "VGC",
            labelClass: "bg-orange-100 text-orange-700 dark:bg-orange-950/40 dark:text-orange-300",
            titleClass: "group-hover:text-orange-600 dark:group-hover:text-orange-400",
            cardClass: "hover:border-orange-500 hover:shadow-orange-500/10",
            pokemon: ["Torkoal", "Flutter Mane", "Incineroar", "Chi-Yu", "Venusaur", "Groudon"],
        },
    ];
}

const TRENDING_TEAM_TITLES: Record<string, { en: string; es: string }> = {
    bulkyOffense: { en: "Bulky Offense", es: "Ofensiva Masiva" },
    hyperOffense: { en: "Hyper Offense", es: "Hiper Ofensiva" },
    rainTeam: { en: "Rain Team", es: "Equipo de Lluvia" },
    vgcWeather: { en: "VGC Weather", es: "Clima VGC" },
};

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

export function HeroSection() {
    const { t } = useTranslation();

    return (
        <section className="w-full max-w-5xl pt-6 sm:pt-10">
            <div className="space-y-10">
                <div className="mx-auto flex max-w-4xl flex-col items-center space-y-6 text-center">
                    <div className="inline-flex items-center justify-center rounded-full bg-blue-100 px-3 py-1 text-sm font-medium text-blue-700 dark:bg-blue-950/40 dark:text-blue-300">
                        {t("app.aiPowered")}
                    </div>

                    <div className="space-y-4">
                        <h1 className="mx-auto max-w-4xl text-4xl font-black tracking-tight text-zinc-900 dark:text-zinc-50 sm:text-5xl lg:text-6xl">
                            {t("app.titleNew")}
                        </h1>
                        <p className="mx-auto max-w-2xl text-lg leading-relaxed text-zinc-600 dark:text-zinc-400 sm:text-xl">
                            {t("app.subtitleNew")}
                        </p>
                    </div>

                    <div className="flex w-full max-w-md flex-col items-center gap-4">
                        <Button
                            asChild
                            size="lg"
                            className="h-12 w-full rounded-full bg-blue-600 px-8 text-base font-semibold text-white shadow-lg shadow-blue-500/20 hover:bg-blue-700"
                        >
                            <Link href="/configurar">{t("app.startGeneratingNew")}</Link>
                        </Button>
                        <p className="text-sm text-zinc-500 dark:text-zinc-400">
                            {t("app.freeNoReg")}
                        </p>
                    </div>
                </div>

                <HeroAccentPanel t={t} />
            </div>
        </section>
    );
}

function HeroAccentPanel({ t }: { t: (key: string) => string }) {
    const accents = [
        {
            key: "formats",
            value: t("home.heroAccentFormatsValue"),
            label: t("home.heroAccentFormats"),
        },
        {
            key: "meta",
            value: t("home.heroAccentMetaValue"),
            label: t("home.heroAccentMeta"),
        },
        {
            key: "export",
            value: t("home.heroAccentExportValue"),
            label: t("home.heroAccentExport"),
        },
    ];

    return (
        <div className="relative overflow-hidden rounded-[2rem] border border-blue-200/70 bg-gradient-to-br from-white via-blue-50 to-zinc-100 p-6 text-center shadow-xl shadow-blue-500/10 dark:border-zinc-800 dark:from-zinc-900 dark:via-zinc-900 dark:to-zinc-950">
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,_rgba(59,130,246,0.16),_transparent_40%)]" />
            <div className="absolute -right-16 top-0 h-40 w-40 rounded-full bg-blue-400/15 blur-3xl" />
            <div className="absolute -left-12 bottom-0 h-32 w-32 rounded-full bg-cyan-400/15 blur-3xl" />

            <div className="relative space-y-6">
                <div>
                    <div className="text-xs font-semibold uppercase tracking-[0.24em] text-blue-600 dark:text-blue-400">
                        {t("app.aiPowered")}
                    </div>
                    <h2 className="mx-auto mt-3 max-w-2xl text-2xl font-black tracking-tight text-zinc-900 dark:text-white">
                        {t("home.heroAccentTitle")}
                    </h2>
                </div>

                <div className="grid gap-3 sm:grid-cols-3">
                    {accents.map((accent) => (
                        <div
                            key={accent.key}
                            className="rounded-2xl border border-white/70 bg-white/80 px-4 py-4 shadow-sm backdrop-blur dark:border-zinc-800 dark:bg-zinc-950/70"
                        >
                            <div className="text-2xl font-black text-zinc-900 dark:text-white">
                                {accent.value}
                            </div>
                            <div className="mt-1 text-xs font-semibold uppercase tracking-[0.18em] text-zinc-500 dark:text-zinc-400">
                                {accent.label}
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}

export function SupportedFormatsSection() {
    const { t } = useTranslation();
    return (
        <section
            className="my-2 w-full max-w-5xl rounded-3xl border border-zinc-200/80 bg-white/80 px-6 py-6 text-center shadow-sm dark:border-zinc-800/80 dark:bg-zinc-900/60"
            aria-labelledby="formats-title"
        >
            <h2
                id="formats-title"
                className="mb-5 text-sm font-semibold uppercase tracking-[0.22em] text-zinc-500 dark:text-zinc-400"
            >
                {t("features.supportedFormats")}
            </h2>
            <div className="flex flex-wrap items-center justify-center gap-3 sm:gap-4" role="list">
                {SUPPORTED_FORMATS.map((format) => (
                    <Link
                        key={format}
                        href={`/configurar?format=${format}`}
                        prefetch={false}
                        role="listitem"
                        className="rounded-full border border-zinc-200 bg-zinc-50 px-4 py-2 text-sm font-semibold text-zinc-700 transition-colors hover:border-blue-300 hover:text-blue-600 dark:border-zinc-800 dark:bg-zinc-950/70 dark:text-zinc-300 dark:hover:border-blue-900 dark:hover:text-blue-400"
                    >
                        {format.toUpperCase().replace("GEN9", "GEN 9 ").replace("GEN8", "GEN 8 ")}
                    </Link>
                ))}
            </div>
        </section>
    );
}

export function DemoShowcase() {
    const { t } = useTranslation();
    return (
        <section className="w-full max-w-5xl py-12" aria-labelledby="demo-title">
            <div className="mb-8 text-center">
                <div className="text-sm font-semibold uppercase tracking-[0.24em] text-blue-600 dark:text-blue-400">
                    {t("home.demoTitle")}
                </div>
                <h2 id="demo-title" className="mt-3 text-3xl font-black tracking-tight text-zinc-900 dark:text-white">
                    {t("home.demoDesc")}
                </h2>
            </div>

            <div className="relative overflow-hidden rounded-[2rem] border border-zinc-200 bg-white/80 p-6 shadow-2xl shadow-zinc-900/5 dark:border-zinc-800 dark:bg-zinc-900/70">
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,_rgba(59,130,246,0.12),_transparent_45%)]" />
                <div className="relative">
                    <div className="mb-6 flex items-center justify-between border-b border-zinc-200 pb-4 dark:border-zinc-800">
                        <div className="flex gap-2">
                            <span className="h-3 w-3 rounded-full bg-rose-400" />
                            <span className="h-3 w-3 rounded-full bg-amber-400" />
                            <span className="h-3 w-3 rounded-full bg-emerald-400" />
                        </div>
                        <div className="text-sm font-medium text-zinc-500 dark:text-zinc-400">
                            pokemonshowdown.com
                        </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-6">
                        {HERO_PREVIEW_POKEMON.map((pokemon) => (
                            <div
                                key={pokemon}
                                className="group relative overflow-hidden rounded-2xl border border-zinc-200 bg-zinc-50 p-4 dark:border-zinc-800 dark:bg-zinc-950/70"
                            >
                                <div className="absolute inset-0 bg-gradient-to-br from-transparent to-black/5 dark:to-white/5" />
                                <div className="relative mx-auto flex h-20 w-20 items-center justify-center">
                                    <HomePokemonSprite
                                        name={pokemon}
                                        size={80}
                                        sizes="(max-width: 1024px) 72px, 80px"
                                        className="h-full w-full object-contain drop-shadow-md transition-transform group-hover:scale-110"
                                    />
                                </div>
                                <div className="mt-3 text-center text-xs font-semibold text-zinc-600 dark:text-zinc-400">
                                    {pokemon}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </section>
    );
}

export function HowItWorksSection() {
    const { t } = useTranslation();
    return (
        <section className="w-full max-w-5xl py-10" aria-labelledby="how-it-works-title">
            <div className="mb-12 text-center">
                <h2
                    id="how-it-works-title"
                    className="text-3xl font-black tracking-tight text-zinc-900 dark:text-white sm:text-4xl"
                >
                    {t("about.howItWorks")}
                </h2>
                <p className="mx-auto mt-4 max-w-2xl text-lg text-zinc-600 dark:text-zinc-400">
                    {t("about.howItWorksSubtitle")}
                </p>
            </div>

            <div className="grid gap-6 md:grid-cols-3">
                {[
                    {
                        step: "1",
                        titleKey: "about.step1Title",
                        descKey: "about.step1Desc",
                    },
                    {
                        step: "2",
                        titleKey: "about.step2Title",
                        descKey: "about.step2Desc",
                    },
                    {
                        step: "3",
                        titleKey: "about.step4Title",
                        descKey: "about.step4Desc",
                    },
                ].map((item) => (
                    <div
                        key={item.step}
                        className="rounded-[1.75rem] border border-zinc-200 bg-white p-7 text-center shadow-sm dark:border-zinc-800 dark:bg-zinc-900/70"
                    >
                        <div className="mx-auto mb-5 flex h-14 w-14 items-center justify-center rounded-2xl bg-blue-100 text-2xl font-black text-blue-700 dark:bg-blue-950/40 dark:text-blue-300">
                            {item.step}
                        </div>
                        <h3 className="text-xl font-bold text-zinc-900 dark:text-white">
                            {t(item.titleKey)}
                        </h3>
                        <p className="mt-3 text-zinc-600 dark:text-zinc-400">
                            {t(item.descKey)}
                        </p>
                    </div>
                ))}
            </div>
        </section>
    );
}

export function FeaturesSection() {
    const { t } = useTranslation();
    return (
        <section className="w-full max-w-5xl py-10" aria-labelledby="features-title">
            <h2 id="features-title" className="sr-only">
                {t("home.features.title")}
            </h2>
            <div className="grid gap-6 md:grid-cols-3">
                {[
                    {
                        titleKey: "features.benefit1Title",
                        descKey: "features.benefit1Desc",
                        accentClass: "from-blue-50 to-white dark:from-blue-950/20 dark:to-zinc-900",
                    },
                    {
                        titleKey: "features.benefit2Title",
                        descKey: "features.benefit2Desc",
                        accentClass: "from-violet-50 to-white dark:from-violet-950/20 dark:to-zinc-900",
                    },
                    {
                        titleKey: "features.benefit3Title",
                        descKey: "features.benefit3Desc",
                        accentClass: "from-emerald-50 to-white dark:from-emerald-950/20 dark:to-zinc-900",
                    },
                ].map((feature) => (
                    <div
                        key={feature.titleKey}
                        className={`rounded-[1.75rem] border border-zinc-200 bg-gradient-to-br p-8 shadow-sm dark:border-zinc-800 ${feature.accentClass}`}
                    >
                        <h3 className="text-xl font-bold text-zinc-900 dark:text-white">
                            {t(feature.titleKey)}
                        </h3>
                        <p className="mt-4 leading-relaxed text-zinc-600 dark:text-zinc-400">
                            {t(feature.descKey)}
                        </p>
                    </div>
                ))}
            </div>
        </section>
    );
}

export function TrendingTeamsSection() {
    const { t, lang } = useTranslation();
    const trendingTeams = getTrendingTeams();

    return (
        <section className="w-full max-w-5xl py-10 text-center" aria-labelledby="trending-title">
            <h2 id="trending-title" className="text-3xl font-black tracking-tight text-zinc-900 dark:text-white">
                {t("home.trending")}
            </h2>
            <p className="mt-3 text-zinc-600 dark:text-zinc-400">
                {t("home.trendingSubtitle")}
            </p>

            <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-4" role="list">
                {trendingTeams.map((team) => {
                    const title = TRENDING_TEAM_TITLES[team.titleKey]?.[lang] || team.titleKey;
                    return (
                        <div
                            key={team.href}
                            className="group relative flex h-full flex-col rounded-[1.75rem] border border-zinc-200 bg-white p-5 text-left transition-all hover:shadow-lg dark:border-zinc-800 dark:bg-zinc-900/80"
                            role="listitem"
                        >
                            <Link
                                href={`/teams/${team.template}`}
                                prefetch={false}
                                className="absolute inset-0 rounded-[1.75rem]"
                                aria-label={`${title} archetype guide`}
                            />

                            <div className="mb-4 flex items-start justify-between gap-4">
                                <div>
                                    <h3 className={`font-bold text-zinc-900 transition-colors dark:text-white ${team.titleClass}`}>
                                        {title}
                                    </h3>
                                    <span className="mt-1 inline-block rounded-full bg-zinc-100 px-2 py-0.5 text-xs font-medium text-zinc-500 dark:bg-zinc-800 dark:text-zinc-400">
                                        {team.badge}
                                    </span>
                                </div>
                                <span className={`rounded-full px-2 py-1 text-xs font-black uppercase tracking-[0.18em] ${team.labelClass}`}>
                                    {team.label}
                                </span>
                            </div>

                            <div className="mt-auto flex pt-3">
                                {team.pokemon.map((pokemon, index) => (
                                    <Link
                                        key={pokemon}
                                        href={`/pokemon/${getPokemonSlug(pokemon)}`}
                                        prefetch={false}
                                        title={pokemon}
                                        aria-label={`${pokemon} profile`}
                                        className="relative z-10 flex h-12 w-12 items-center justify-center overflow-hidden rounded-full border-2 border-white bg-zinc-100 drop-shadow-sm transition-transform hover:scale-110 first:ml-0 dark:border-zinc-900 dark:bg-zinc-800"
                                        style={{ marginLeft: index === 0 ? 0 : -14, zIndex: 10 - index }}
                                    >
                                        <HomePokemonSprite
                                            name={pokemon}
                                            size={48}
                                            sizes="48px"
                                            className="h-full w-full scale-110 object-contain"
                                        />
                                    </Link>
                                ))}
                            </div>

                            <Link
                                href={team.href}
                                prefetch={false}
                                className="relative z-10 mt-3 text-xs font-semibold text-blue-600 hover:underline dark:text-blue-400"
                            >
                                {lang === "es" ? "Generar este equipo →" : "Build this team →"}
                            </Link>
                        </div>
                    );
                })}
            </div>
        </section>
    );
}

export function ExploreSection() {
    const { t } = useTranslation();
    const exploreLinks = [
        {
            href: "/pokemon-showdown-team-builder",
            titleKey: "home.explore.showdownBuilder",
            descriptionKey: "home.explore.showdownBuilderDesc",
            labelKey: "home.explore.labelShowdownBuilder",
            fallbackTitle: "Showdown Team Builder",
            fallbackDescription: "Build and export competitive teams for Pokemon Showdown.",
            fallbackLabel: "Showdown",
            accentClass: "border-blue-200/70 bg-blue-50/60 text-blue-700 dark:border-blue-900/60 dark:bg-blue-950/20 dark:text-blue-300",
        },
        {
            href: "/pokemon",
            titleKey: "home.explore.pokemon",
            descriptionKey: "home.explore.pokemonDesc",
            labelKey: "home.explore.labelPokemon",
            fallbackTitle: "Pokemon Profiles",
            fallbackDescription: "Browse competitive Pokemon with stats, abilities and movesets.",
            fallbackLabel: "Pokedex",
            accentClass: "border-red-200/70 bg-red-50/60 text-red-700 dark:border-red-900/60 dark:bg-red-950/20 dark:text-red-300",
        },
        {
            href: "/teams",
            titleKey: "home.explore.teams",
            descriptionKey: "home.explore.teamsDesc",
            labelKey: "home.explore.labelTeams",
            fallbackTitle: "Team Archetypes",
            fallbackDescription: "Explore Rain, Hyper Offense, Stall, Trick Room and more strategies.",
            fallbackLabel: "Strategies",
            accentClass: "border-violet-200/70 bg-violet-50/60 text-violet-700 dark:border-violet-900/60 dark:bg-violet-950/20 dark:text-violet-300",
        },
        {
            href: "/guides/gen9-ou",
            titleKey: "home.explore.guides",
            descriptionKey: "home.explore.guidesDesc",
            labelKey: "home.explore.labelGuides",
            fallbackTitle: "Guides",
            fallbackDescription: "Learn the metagame with Gen 9 OU and VGC guides.",
            fallbackLabel: "Guides",
            accentClass: "border-orange-200/70 bg-orange-50/60 text-orange-700 dark:border-orange-900/60 dark:bg-orange-950/20 dark:text-orange-300",
        },
        {
            href: "/tier-list",
            titleKey: "home.explore.tier",
            descriptionKey: "home.explore.tierDesc",
            labelKey: "home.explore.labelTier",
            fallbackTitle: "Tier List",
            fallbackDescription: "Check viability rankings and usage stats for every format.",
            fallbackLabel: "Rankings",
            accentClass: "border-emerald-200/70 bg-emerald-50/60 text-emerald-700 dark:border-emerald-900/60 dark:bg-emerald-950/20 dark:text-emerald-300",
        },
        {
            href: "/about",
            titleKey: "home.explore.about",
            descriptionKey: "home.explore.aboutDesc",
            labelKey: "home.explore.labelAbout",
            fallbackTitle: "About",
            fallbackDescription: "Learn more about Pokemon Team Generator and how it works.",
            fallbackLabel: "Info",
            accentClass: "border-cyan-200/70 bg-cyan-50/60 text-cyan-700 dark:border-cyan-900/60 dark:bg-cyan-950/20 dark:text-cyan-300",
        },
    ];

    return (
        <section
            className="w-full max-w-5xl border-t border-zinc-200/80 py-10 dark:border-zinc-800/80"
            aria-labelledby="explore-title"
        >
            <h2 id="explore-title" className="text-center text-2xl font-black tracking-tight text-zinc-900 dark:text-white">
                {t("home.explore.title")}
            </h2>

            <div className="mt-8 grid gap-6 md:grid-cols-3" role="list">
                {exploreLinks.map((item) => {
                    const label = t(item.labelKey) === item.labelKey ? item.fallbackLabel : t(item.labelKey);
                    const title = t(item.titleKey) === item.titleKey ? item.fallbackTitle : t(item.titleKey);
                    const description = t(item.descriptionKey) === item.descriptionKey ? item.fallbackDescription : t(item.descriptionKey);
                    return (
                        <Link key={item.href} href={item.href} prefetch={false} role="listitem">
                            <div className="h-full rounded-[1.5rem] border border-zinc-200/80 bg-white/80 p-6 transition-all hover:-translate-y-1 hover:shadow-md dark:border-zinc-800/80 dark:bg-zinc-900/60">
                                <div className={`inline-flex rounded-full border px-3 py-1 text-xs font-black uppercase tracking-[0.18em] ${item.accentClass}`}>
                                    {label}
                                </div>
                                <h3 className="mt-4 text-lg font-bold text-zinc-900 dark:text-white">
                                    {title}
                                </h3>
                                <p className="mt-3 text-sm leading-relaxed text-zinc-600 dark:text-zinc-400">
                                    {description}
                                </p>
                            </div>
                        </Link>
                    );
                })}
            </div>
        </section>
    );
}

export function BottomCtaSection() {
    const { t } = useTranslation();
    return (
        <section className="relative w-full max-w-4xl overflow-hidden rounded-[2rem] bg-gradient-to-br from-blue-600 to-blue-800 px-6 py-14 text-center shadow-2xl">
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,_rgba(255,255,255,0.18),_transparent_40%)]" />
            <div className="relative z-10">
                <h2 className="text-3xl font-black tracking-tight text-white sm:text-4xl">
                    {t("home.bottomCtaTitle")}
                </h2>
                <p className="mx-auto mt-4 max-w-2xl text-lg text-blue-100">
                    {t("home.bottomCtaDesc")}
                </p>
                <Button asChild size="lg" className="mt-8 rounded-full bg-white px-8 text-blue-700 hover:bg-zinc-100">
                    <Link href="/configurar">{t("app.startGeneratingNew")}</Link>
                </Button>
            </div>
        </section>
    );
}
