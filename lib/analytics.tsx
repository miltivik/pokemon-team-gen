"use client";

// Analytics tracking utility
// Supports Google Analytics 4 (gtag) and custom event tracking

import { useEffect, useCallback } from "react";
import { usePathname } from "next/navigation";
import { hasConsent } from "@/lib/consent";

type EventParams = Record<string, string | number | boolean>;

interface Gtag {
    (command: "config", targetId: string, params?: EventParams): void;
    (command: "event", eventName: string, params?: EventParams): void;
    (command: "js", date: Date): void;
    (command: "consent", action: "update", params: { analytics_storage: "granted" | "denied" }): void;
}

declare global {
    interface Window {
        gtag?: Gtag;
    }
}

// Read GA4 ID from env — set NEXT_PUBLIC_GA_ID in .env.local
const GA_ID = process.env.NEXT_PUBLIC_GA_ID;

function getGtag() {
    if (typeof window === "undefined") {
        return null;
    }

    return window.gtag ?? null;
}

// Track page views
export function trackPageView(pagePath: string, pageTitle: string) {
    if (!hasConsent("analytics")) return;
    const gtag = getGtag();
    if (!GA_ID || !gtag) {
        return;
    }

    gtag("config", GA_ID, {
        page_path: pagePath,
        page_title: pageTitle,
    });
}

// Track custom events
export function trackEvent(eventName: string, params?: EventParams) {
    if (!hasConsent("analytics")) return;
    const gtag = getGtag();
    if (!gtag) {
        return;
    }

    gtag("event", eventName, params);
}

// Predefined event trackers for the app
export const analytics = {
    // Page views
    viewLanding: () => trackPageView("/", "Landing"),
    viewConfigurar: () => trackPageView("/configurar", "Configurar"),
    viewSeoLanding: (landingPath: string) => trackEvent("view_seo_landing", {
        landing_path: landingPath,
    }),
    clickSeoLanding: (landingPath: string, destination: string) => trackEvent("click_seo_landing", {
        landing_path: landingPath,
        destination,
    }),
    viewEquipo: () => trackPageView("/equipo", "Equipo"),
    viewAnalisis: () => trackPageView("/analisis", "Analisis"),
    viewExportar: () => trackPageView("/exportar", "Exportar"),
    viewSavedTeams: () => trackPageView("/saved-teams", "Saved Teams"),
    viewGuides: (guide: string) => trackPageView(`/guides/${guide}`, `Guides ${guide}`),
    viewTierList: () => trackPageView("/tier-list", "Tier List"),
    viewAbout: () => trackPageView("/about", "About"),
    viewChangelog: () => trackPageView("/changelog", "Changelog"),

    // User actions
    startConfig: () => trackEvent("start_config", {
        source: "landing_cta"
    }),

    generateTeam: (format: string, template: string) => trackEvent("generate_team", {
        format,
        template,
    }),

    viewTeam: (teamSize: number) => trackEvent("view_team", {
        team_size: teamSize,
    }),

    viewAnalysis: () => trackEvent("view_analysis", {}),

    exportTeam: (format: string) => trackEvent("export_team", {
        export_format: format,
    }),

    saveTeam: (format: string) => trackEvent("save_team", {
        format,
    }),

    clickSimilarTeams: (template: string) => trackEvent("click_similar_teams", {
        template,
    }),

    regenerateTeam: (source: string) => trackEvent("regenerate_team", {
        source,
    }),

    clickPokemon: (pokemonName: string) => trackEvent("click_pokemon", {
        pokemon_name: pokemonName,
    }),

    scrollDepth: (depth: number, page: string) => trackEvent("scroll_depth", {
        depth,
        page,
    }),

    // Ad interactions
    viewAd: (adPosition: string) => trackEvent("view_ad", {
        ad_position: adPosition,
    }),

    clickAd: (adPosition: string) => trackEvent("click_ad", {
        ad_position: adPosition,
    }),

    reportBugOpened: (page: string) => trackEvent("report_bug_opened", {
        page,
    }),

    reportBugSubmitted: (page: string) => trackEvent("report_bug_submitted", {
        page,
    }),

    reportBugFailed: (page: string) => trackEvent("report_bug_failed", {
        page,
    }),
};

// Helper to get page title from path
function getPageTitle(pathname: string): string {
    const titles: Record<string, string> = {
        "/": "Landing",
        "/configurar": "Configurar",
        "/gen-9-ou-team-builder": "Gen 9 OU Team Builder",
        "/vgc-team-builder": "VGC Team Builder",
        "/rain-team-builder": "Rain Team Builder",
        "/hyper-offense-team-builder": "Hyper Offense Team Builder",
        "/equipo": "Equipo",
        "/analisis": "Análisis",
        "/exportar": "Exportar",
        "/changelog": "Changelog",
    };
    return titles[pathname] || "Unknown";
}

// Hook for React components
export function useAnalytics() {
    const pathname = usePathname();

    // Track page views on route change
    useEffect(() => {
        if (pathname) {
            const pageTitle = getPageTitle(pathname);
            trackPageView(pathname, pageTitle);
        }
    }, [pathname]);

    return analytics;
}

// Scroll depth tracker hook
export function useScrollTracker(pageName: string) {
    const trackScroll = useCallback(() => {
        if (typeof window === "undefined") return;

        const scrollHeight = document.documentElement.scrollHeight - window.innerHeight;
        const scrollTop = window.scrollY;
        const scrollPercent = Math.round((scrollTop / scrollHeight) * 100);

        // Track at 25%, 50%, 75%, 100%
        const milestones = [25, 50, 75, 100];

        milestones.forEach((milestone) => {
            if (scrollPercent >= milestone) {
                const key = `scroll_${milestone}_${pageName}`;
                if (!sessionStorage.getItem(key)) {
                    trackEvent("scroll_depth", {
                        depth: milestone,
                        page: pageName,
                    });
                    sessionStorage.setItem(key, "true");
                }
            }
        });
    }, [pageName]);

    useEffect(() => {
        if (typeof window === "undefined") return;

        window.addEventListener("scroll", trackScroll, { passive: true });
        return () => window.removeEventListener("scroll", trackScroll);
    }, [trackScroll]);
}
