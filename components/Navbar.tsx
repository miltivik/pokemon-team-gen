"use client";

import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { useTranslation } from "@/lib/i18n";
import { useTeam } from "@/lib/team-context";
import { usePathname } from "next/navigation";
import { useTheme } from "next-themes";
import { ThemeSwitcher } from "./ThemeSwitcher";

export type NavTab = "home" | "analysis";

interface NavbarProps {
    activeTab?: NavTab;
    onTabChange?: (tab: NavTab) => void;
    hasTeam?: boolean;
}

export function Navbar({ activeTab = "home", onTabChange, hasTeam = false }: NavbarProps) {
    const { t, lang, setLang } = useTranslation();
    const pathname = usePathname();
    const { format } = useTeam();
    const { theme } = useTheme();
    const [guidesOpen, setGuidesOpen] = useState(false);
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
    const [isScrolled, setIsScrolled] = useState(false);
    const guidesRef = useRef<HTMLDivElement>(null);

    // Track scroll position
    useEffect(() => {
        const handleScroll = () => {
            setIsScrolled(window.scrollY > 20);
        };
        window.addEventListener("scroll", handleScroll);
        return () => window.removeEventListener("scroll", handleScroll);
    }, []);

    // Keyboard handler for dropdowns
    useEffect(() => {
        function handleKeyDown(event: KeyboardEvent) {
            if (event.key === "Escape") {
                setGuidesOpen(false);
            }
        }
        document.addEventListener("keydown", handleKeyDown);
        return () => document.removeEventListener("keydown", handleKeyDown);
    }, []);

    const isActive = (path: string) => pathname === path || pathname.startsWith(path + "/");

    return (
        <>
            {/* Main Navbar - Floating style */}
            <nav aria-label="Main navigation" className={`sticky top-0 z-50 w-full transition-colors transition-shadow duration-300 ${isScrolled
                ? "bg-white/95 dark:bg-black/95 backdrop-blur-lg shadow-lg border-zinc-200 dark:border-zinc-800"
                : "bg-transparent"
                }`}>
                <div className="container mx-auto px-4">
                    <div className="flex items-center h-14 gap-1">
                        {/* Logo */}
                        <Link href="/" className="flex items-center gap-2 px-2 mr-1">
                            <Image
                                src="/icons/logo-dark-nobg.png"
                                alt="Logo"
                                width={32}
                                height={32}
                                className="w-8 h-8 flex-shrink-0 dark:hidden"
                            />
                            <Image
                                src="/icons/logo-white-nobg.png"
                                alt="Logo"
                                width={32}
                                height={32}
                                className="w-8 h-8 flex-shrink-0 hidden dark:block"
                            />
                            <span className="font-bold text-zinc-900 dark:text-zinc-100 hidden lg:inline whitespace-nowrap overflow-hidden text-ellipsis max-w-[150px]">
                                {t("app.title")}
                            </span>
                        </Link>

                        {/* Main Navigation */}
                        <div className="hidden md:flex items-center gap-1">
                            <Link
                                href="/"
                                className={`relative px-4 py-2 text-sm font-semibold rounded-lg transition-colors transition-shadow duration-200 ${activeTab === "home" || pathname === "/"
                                    ? "text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-950/50"
                                    : "text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-200 hover:bg-zinc-100 dark:hover:bg-zinc-800"
                                    }`}
                            >
                                <span className="flex items-center gap-2">
                                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                        <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
                                        <polyline points="9 22 9 12 15 12 15 22" />
                                    </svg>
                                    {t("nav.home")}
                                </span>
                                {(activeTab === "home" || pathname === "/") && (
                                    <span className="absolute bottom-0 left-2 right-2 h-0.5 bg-blue-600 dark:bg-blue-400 rounded-full" />
                                )}
                            </Link>

                            <Link
                                href={hasTeam ? "/analisis" : "#"}
                                className={`relative px-4 py-2 text-sm font-semibold rounded-lg transition-all duration-200 ${activeTab === "analysis" || pathname === "/analisis"
                                    ? "text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/50"
                                    : hasTeam
                                        ? "text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-200 hover:bg-zinc-100 dark:hover:bg-zinc-800"
                                        : "text-zinc-300 dark:text-zinc-700 cursor-not-allowed pointer-events-none"
                                    }`}
                            >
                                <span className="flex items-center gap-2">
                                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                        <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z" />
                                        <polyline points="7.5 4.21 12 6.81 16.5 4.21" />
                                        <polyline points="7.5 19.79 7.5 14.6 3 12" />
                                        <polyline points="21 12 16.5 14.6 16.5 19.79" />
                                        <polyline points="3.27 6.96 12 12.01 20.73 6.96" />
                                        <line x1="12" y1="22.08" x2="12" y2="12" />
                                    </svg>
                                    {t("nav.analysis")}
                                </span>
                                {(activeTab === "analysis" || pathname === "/analisis") && (
                                    <span className="absolute bottom-0 left-2 right-2 h-0.5 bg-emerald-600 dark:bg-emerald-400 rounded-full" />
                                )}
                            </Link>

                            {/* Guides Dropdown */}
                            <div className="relative" ref={guidesRef}>
                                <button
                                    onClick={() => { setGuidesOpen(!guidesOpen); }}
                                    aria-expanded={guidesOpen}
                                    aria-haspopup="true"
                                    aria-label="Guides menu"
                                    className={`relative px-4 py-2 text-sm font-semibold rounded-lg transition-all duration-200 flex items-center gap-1 ${isActive("/guides") || isActive("/tier-list")
                                        ? "text-orange-600 dark:text-orange-400 bg-orange-50 dark:bg-orange-950/50"
                                        : "text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-200 hover:bg-zinc-100 dark:hover:bg-zinc-800"
                                        }`}
                                >
                                    <span className="flex items-center gap-2">
                                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                            <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" />
                                            <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z" />
                                        </svg>
                                        {t("nav.guides")}
                                        <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={`transition-transform ${guidesOpen ? 'rotate-180' : ''}`}>
                                            <polyline points="6 9 12 15 18 9" />
                                        </svg>
                                    </span>
                                    {(isActive("/guides") || isActive("/tier-list")) && (
                                        <span className="absolute bottom-0 left-2 right-2 h-0.5 bg-orange-600 dark:bg-orange-400 rounded-full" />
                                    )}
                                </button>
                                {guidesOpen && (
                                    <div
                                        className="absolute top-full left-0 mt-1 w-48 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-700 rounded-lg shadow-lg py-1 z-50"
                                        role="menu"
                                        aria-label="Guides submenu"
                                    >
                                        <Link
                                            href="/guides/gen9-ou"
                                            className="block px-4 py-2 text-sm text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800 focus-visible:ring-2 focus-visible:ring-orange-500 focus-visible:ring-inset"
                                            onClick={() => setGuidesOpen(false)}
                                            role="menuitem"
                                        >
                                            <span aria-hidden="true">📚</span> {t("guides.ouTitle")}
                                        </Link>
                                        <Link
                                            href="/guides/vgc"
                                            className="block px-4 py-2 text-sm text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800 focus-visible:ring-2 focus-visible:ring-orange-500 focus-visible:ring-inset"
                                            onClick={() => setGuidesOpen(false)}
                                            role="menuitem"
                                        >
                                            <span aria-hidden="true">🎮</span> {t("guides.vgcTitle")}
                                        </Link>
                                        <Link
                                            href="/tier-list"
                                            className="block px-4 py-2 text-sm text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800 focus-visible:ring-2 focus-visible:ring-orange-500 focus-visible:ring-inset"
                                            onClick={() => setGuidesOpen(false)}
                                            role="menuitem"
                                        >
                                            <span aria-hidden="true">📊</span> {t("guides.tierList")}
                                        </Link>
                                        <hr className="my-1 border-zinc-200 dark:border-zinc-700" />
                                        <Link
                                            href="/changelog"
                                            className="block px-4 py-2 text-sm text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800 focus-visible:ring-2 focus-visible:ring-orange-500 focus-visible:ring-inset"
                                            onClick={() => setGuidesOpen(false)}
                                            role="menuitem"
                                        >
                                            <span aria-hidden="true">🔄</span> {t("nav.changelog")}
                                        </Link>
                                        <Link
                                            href="/about"
                                            className="block px-4 py-2 text-sm text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800 focus-visible:ring-2 focus-visible:ring-orange-500 focus-visible:ring-inset"
                                            onClick={() => setGuidesOpen(false)}
                                            role="menuitem"
                                        >
                                            <span aria-hidden="true">ℹ️</span> {t("nav.about")}
                                        </Link>
                                    </div>
                                )}
                            </div>

                            {/* My Teams */}
                            <Link
                                href="/saved-teams"
                                className={`relative px-4 py-2 text-sm font-semibold rounded-lg transition-all duration-200 flex items-center gap-2 ${isActive("/saved-teams")
                                    ? "text-cyan-600 dark:text-cyan-400 bg-cyan-50 dark:bg-cyan-950/50"
                                    : "text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-200 hover:bg-zinc-100 dark:hover:bg-zinc-800"
                                    }`}
                            >
                                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                    <path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z" />
                                </svg>
                                <span className="hidden md:inline">{t("nav.savedTeams")}</span>
                                <span className="md:hidden">{t("nav.teams")}</span>
                                {isActive("/saved-teams") && (
                                    <span className="absolute bottom-0 left-2 right-2 h-0.5 bg-cyan-600 dark:bg-cyan-400 rounded-full" />
                                )}
                            </Link>
                        </div>

                        {/* Spacer */}
                        <div className="flex-1" />

                        {/* Generate New Button */}
                        <Link
                            href="/configurar"
                            className="hidden sm:flex items-center gap-2 px-4 py-2 text-sm font-semibold rounded-lg bg-blue-600 hover:bg-blue-700 text-white transition-all duration-200 shadow-md hover:shadow-lg focus-visible:ring-2 focus-visible:ring-blue-400 focus-visible:ring-offset-2"
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <path d="m21.64 3.64-1.28-1.28a1.21 1.21 0 0 0-1.72 0L2.36 18.64a1.21 1.21 0 0 0 0 1.72l1.28 1.28a1.2 1.2 0 0 0 1.72 0L21.64 5.36a1.2 1.2 0 0 0 0-1.72Z" />
                                <path d="m14 7 3 3" />
                                <path d="M5 6v4" />
                                <path d="M19 14v4" />
                                <path d="M10 2v2" />
                                <path d="M7 8H3" />
                                <path d="M21 16h-4" />
                                <path d="M11 3H9" />
                            </svg>
                            {t("nav.generate")}
                        </Link>

                        {/* Language Toggle */}
                        <ThemeSwitcher />

                        {/* Language Toggle */}
                        <button
                            onClick={() => setLang(lang === "en" ? "es" : "en")}
                            className="flex items-center gap-1.5 px-3 py-1.5 rounded-full border border-zinc-300 dark:border-zinc-600 bg-white dark:bg-zinc-800 hover:bg-zinc-100 dark:hover:bg-zinc-700 transition-colors text-sm font-semibold text-zinc-700 dark:text-zinc-300 shadow-sm focus-visible:ring-2 focus-visible:ring-blue-400 focus-visible:ring-offset-2"
                            aria-label={lang === "en" ? "Switch to Spanish" : "Cambiar a Inglés"}
                        >
                            <span aria-hidden="true">{lang === "en" ? "🇺🇸" : "🇪🇸"}</span>
                            <span className="uppercase text-xs tracking-wider">{lang === "en" ? "EN" : "ES"}</span>
                        </button>
                    </div>
                </div>
            </nav>

            {/* Floating Quick Navigation Bar - Mobile friendly */}
            <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-40 md:hidden" aria-label="Mobile navigation">
                {mobileMenuOpen && (
                    <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-4 w-56 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-700 rounded-2xl shadow-2xl py-2 flex flex-col">
                        <div className="px-4 py-2 text-xs font-semibold text-zinc-500 uppercase tracking-wider">
                            {t("nav.guides")}
                        </div>
                        <Link
                            href="/guides/gen9-ou"
                            className="block px-4 py-3 text-sm text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800"
                            onClick={() => setMobileMenuOpen(false)}
                        >
                            <span aria-hidden="true" className="mr-2">📚</span> {t("guides.ouTitle")}
                        </Link>
                        <Link
                            href="/guides/vgc"
                            className="block px-4 py-3 text-sm text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800"
                            onClick={() => setMobileMenuOpen(false)}
                        >
                            <span aria-hidden="true" className="mr-2">🎮</span> {t("guides.vgcTitle")}
                        </Link>
                        <Link
                            href="/tier-list"
                            className="block px-4 py-3 text-sm text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800"
                            onClick={() => setMobileMenuOpen(false)}
                        >
                            <span aria-hidden="true" className="mr-2">📊</span> {t("guides.tierList")}
                        </Link>
                        <hr className="my-2 border-zinc-200 dark:border-zinc-700" />
                        <Link
                            href="/changelog"
                            className="block px-4 py-3 text-sm text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800"
                            onClick={() => setMobileMenuOpen(false)}
                        >
                            <span aria-hidden="true" className="mr-2">🔄</span> {t("nav.changelog")}
                        </Link>
                        <Link
                            href="/about"
                            className="block px-4 py-3 text-sm text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800"
                            onClick={() => setMobileMenuOpen(false)}
                        >
                            <span aria-hidden="true" className="mr-2">ℹ️</span> {t("nav.about")}
                        </Link>
                    </div>
                )}
                <div className="flex items-center gap-1 px-2 py-2 bg-zinc-900/95 dark:bg-zinc-900/95 backdrop-blur-lg rounded-full shadow-2xl border border-zinc-700">
                    <Link
                        href="/"
                        aria-label="Home"
                        className={`p-2 rounded-full focus-visible:ring-2 focus-visible:ring-white ${pathname === "/" ? "bg-blue-600 text-white" : "text-zinc-400 hover:text-white"}`}
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
                        </svg>
                    </Link>
                    <Link
                        href="/configurar"
                        aria-label="Create team"
                        className={`p-2 rounded-full focus-visible:ring-2 focus-visible:ring-white ${pathname === "/configurar" ? "bg-blue-600 text-white" : "text-zinc-400 hover:text-white"}`}
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <line x1="12" y1="5" x2="12" y2="19" />
                            <line x1="5" y1="12" x2="19" y2="12" />
                        </svg>
                    </Link>
                    <Link
                        href="/saved-teams"
                        aria-label="Saved teams"
                        className={`p-2 rounded-full focus-visible:ring-2 focus-visible:ring-white ${pathname === "/saved-teams" ? "bg-cyan-600 text-white" : "text-zinc-400 hover:text-white"}`}
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z" />
                        </svg>
                    </Link>
                    <button
                        aria-label="Menu"
                        onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                        className={`p-2 rounded-full focus-visible:ring-2 focus-visible:ring-white ${mobileMenuOpen ? "bg-orange-600 text-white" : "text-zinc-400 hover:text-white"}`}
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <line x1="3" y1="12" x2="21" y2="12" />
                            <line x1="3" y1="6" x2="21" y2="6" />
                            <line x1="3" y1="18" x2="21" y2="18" />
                        </svg>
                    </button>
                </div>
            </div>
        </>
    );
}
