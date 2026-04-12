import { cookies } from "next/headers";
import { HomeQuickActions } from "@/components/home/HomeQuickActions";
import { AdBanner, AdInline } from "@/components/monetization/Ads";
import { LANGUAGE_COOKIE_KEY, resolveLang, type Lang } from "@/lib/i18n-shared";
import {
    HeroSection,
    SupportedFormatsSection,
    DemoShowcase,
    HowItWorksSection,
    FeaturesSection,
    TrendingTeamsSection,
    ExploreSection,
    BottomCtaSection,
} from "@/components/home/HeroSection";

interface TrendingTeam {
    href: string;
    title: string;
    badge: string;
    label: string;
    labelClass: string;
    titleClass: string;
    cardClass: string;
    pokemon: string[];
}

function getTrendingTeams(lang: Lang): TrendingTeam[] {
    return [
        {
            href: "/configurar?template=bulkyoffense&format=gen9ou",
            title: lang === "es" ? "Ofensiva Masiva" : "Bulky Offense",
            badge: "Gen 9 OU",
            label: "BO",
            labelClass: "bg-blue-100 text-blue-700 dark:bg-blue-950/40 dark:text-blue-300",
            titleClass: "group-hover:text-blue-600 dark:group-hover:text-blue-400",
            cardClass: "hover:border-blue-500 hover:shadow-blue-500/10",
            pokemon: ["Great Tusk", "Kingambit", "Gholdengo", "Rillaboom", "Dragapult", "Gliscor"],
        },
        {
            href: "/configurar?template=offense&format=gen9ou",
            title: lang === "es" ? "Hiper Ofensiva" : "Hyper Offense",
            badge: "Gen 9 OU",
            label: "HO",
            labelClass: "bg-amber-100 text-amber-700 dark:bg-amber-950/40 dark:text-amber-300",
            titleClass: "group-hover:text-amber-600 dark:group-hover:text-amber-400",
            cardClass: "hover:border-amber-500 hover:shadow-amber-500/10",
            pokemon: ["Glimmora", "Roaring Moon", "Iron Valiant", "Iron Boulder", "Gouging Fire", "Kingambit"],
        },
        {
            href: "/configurar?template=rain&format=gen9ou",
            title: lang === "es" ? "Equipo de lluvia" : "Rain Team",
            badge: "Gen 9 OU",
            label: "RN",
            labelClass: "bg-cyan-100 text-cyan-700 dark:bg-cyan-950/40 dark:text-cyan-300",
            titleClass: "group-hover:text-cyan-600 dark:group-hover:text-cyan-400",
            cardClass: "hover:border-cyan-500 hover:shadow-cyan-500/10",
            pokemon: ["Pelipper", "Barraskewda", "Archaludon", "Swampert", "Tornadus-Therian", "Raging Bolt"],
        },
        {
            href: "/configurar?template=weatheroffense&format=gen9vgc2026f",
            title: lang === "es" ? "Clima VGC" : "VGC Weather",
            badge: "VGC 2026",
            label: "VGC",
            labelClass: "bg-orange-100 text-orange-700 dark:bg-orange-950/40 dark:text-orange-300",
            titleClass: "group-hover:text-orange-600 dark:group-hover:text-orange-400",
            cardClass: "hover:border-orange-500 hover:shadow-orange-500/10",
            pokemon: ["Torkoal", "Flutter Mane", "Incineroar", "Chi-Yu", "Venusaur", "Raging Bolt"],
        },
    ];
}

export default async function Home() {
    const cookieStore = await cookies();
    const lang = resolveLang(cookieStore.get(LANGUAGE_COOKIE_KEY)?.value);

    return (
        <div className="min-h-screen font-sans">
            <a
                href="#main-content"
                className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-50 focus:rounded-lg focus:bg-blue-600 focus:px-4 focus:py-2 focus:font-semibold focus:text-white"
            >
                Skip to main content
            </a>

            <main id="main-content" className="container mx-auto flex flex-col items-center gap-12 px-4 py-12">
                <HeroSection />

                <SupportedFormatsSection />
                <DemoShowcase />
                <HowItWorksSection />
                <FeaturesSection />

                <section className="w-full flex justify-center">
                    <AdInline />
                </section>

                <TrendingTeamsSection />

                <ExploreSection />

                <BottomCtaSection />

                <section className="w-full flex justify-center py-4">
                    <AdBanner />
                </section>
            </main>
        </div>
    );
}