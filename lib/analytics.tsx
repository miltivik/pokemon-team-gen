"use client";

// Analytics tracking utility
// Supports Google Analytics 4 (gtag) and custom event tracking

import { useEffect, useCallback } from "react";
import { usePathname } from "next/navigation";

type EventParams = Record<string, string | number | boolean>;

// Check if we're in the browser
const isBrowser = typeof window !== "undefined";

// Read GA4 ID from env — set NEXT_PUBLIC_GA_ID in .env.local
const GA_ID = process.env.NEXT_PUBLIC_GA_ID;

// Track page views
export function trackPageView(pagePath: string, pageTitle: string) {
    if (!isBrowser) return;

    console.log(`[Analytics] Page View: ${pagePath} - ${pageTitle}`);

    // Google Analytics 4
    if (GA_ID && typeof window !== "undefined" && (window as any).gtag) {
        (window as any).gtag("config", GA_ID, {
            page_path: pagePath,
            page_title: pageTitle,
        });
    }


    // Custom event for internal tracking
    trackEvent("page_view", {
        page_path: pagePath,
        page_title: pageTitle,
    });
}

// Track custom events
export function trackEvent(eventName: string, params?: EventParams) {
    if (!isBrowser) return;

    console.log(`[Analytics] Event: ${eventName}`, params);

    // Google Analytics 4 event
    if (typeof window !== "undefined" && (window as any).gtag) {
        (window as any).gtag("event", eventName, params);
    }

    // Store event for batch sending (optional)
    const events = getStoredEvents();
    events.push({
        name: eventName,
        params,
        timestamp: new Date().toISOString(),
    });
    localStorage.setItem("analytics_events", JSON.stringify(events));
}

// Get stored events for batch processing
function getStoredEvents(): Array<{ name: string; params?: EventParams; timestamp: string }> {
    if (!isBrowser) return [];

    try {
        const stored = localStorage.getItem("analytics_events");
        return stored ? JSON.parse(stored) : [];
    } catch {
        return [];
    }
}

// Predefined event trackers for the app
export const analytics = {
    // Page views
    viewLanding: () => trackPageView("/", "Landing"),
    viewConfigurar: () => trackPageView("/configurar", "Configurar"),
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
};

// Helper to get page title from path
function getPageTitle(pathname: string): string {
    const titles: Record<string, string> = {
        "/": "Landing",
        "/configurar": "Configurar",
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
        if (!isBrowser) return;

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
        if (!isBrowser) return;

        window.addEventListener("scroll", trackScroll);
        return () => window.removeEventListener("scroll", trackScroll);
    }, [trackScroll]);
}
