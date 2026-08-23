import { AdBanner, AdInline } from "@/components/monetization/Ads";
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
import { PopularPokemonSection } from "@/components/home/PopularPokemonSection";

export default function Home() {
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

                <div className="home-below-fold w-full">
                    <SupportedFormatsSection />
                </div>
                <div className="home-below-fold w-full">
                    <DemoShowcase />
                </div>
                <div className="home-below-fold w-full">
                    <HowItWorksSection />
                </div>
                <div className="home-below-fold w-full">
                    <FeaturesSection />
                </div>

                <section className="w-full flex justify-center">
                    <AdInline />
                </section>

                <div className="home-below-fold w-full">
                    <TrendingTeamsSection />
                </div>

                <div className="home-below-fold w-full">
                    <PopularPokemonSection />
                </div>

                <div className="home-below-fold w-full">
                    <ExploreSection />
                </div>

                <div className="home-below-fold w-full">
                    <BottomCtaSection />
                </div>

                <section className="w-full flex justify-center py-4">
                    <AdBanner />
                </section>
            </main>
        </div>
    );
}
