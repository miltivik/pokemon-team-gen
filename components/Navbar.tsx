"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
    BookOpen,
    Home,
    Info,
    Languages,
    ListOrdered,
    Menu,
    Plus,
    RefreshCw,
    Save,
    Sparkles,
} from "lucide-react";
import { useTranslation } from "@/lib/i18n";
import { ThemeSwitcher } from "./ThemeSwitcher";

export type NavTab = "home" | "analysis";

interface NavbarProps {
    activeTab?: NavTab;
    hasTeam?: boolean;
}

export function Navbar({ activeTab = "home", hasTeam = false }: NavbarProps) {
    const { t, lang, setLang } = useTranslation();
    const pathname = usePathname();
    const [guidesOpen, setGuidesOpen] = useState(false);
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
    const [isScrolled, setIsScrolled] = useState(false);
    const guidesRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const handleScroll = () => {
            const nextIsScrolled = window.scrollY > 20;
            setIsScrolled((current) => current === nextIsScrolled ? current : nextIsScrolled);
        };

        handleScroll();
        window.addEventListener("scroll", handleScroll, { passive: true });
        return () => window.removeEventListener("scroll", handleScroll);
    }, []);

    useEffect(() => {
        function handleKeyDown(event: KeyboardEvent) {
            if (event.key === "Escape") {
                setGuidesOpen(false);
                setMobileMenuOpen(false);
            }
        }

        function handleClickOutside(event: MouseEvent) {
            if (!guidesRef.current?.contains(event.target as Node)) {
                setGuidesOpen(false);
            }
        }

        document.addEventListener("keydown", handleKeyDown);
        document.addEventListener("mousedown", handleClickOutside);

        return () => {
            document.removeEventListener("keydown", handleKeyDown);
            document.removeEventListener("mousedown", handleClickOutside);
        };
    }, []);

    const isActive = (path: string) => pathname === path || pathname.startsWith(`${path}/`);
    const languageToggleLabel = lang === "en" ? "Switch to Spanish" : "Cambiar a ingles";

    return (
        <>
            <nav
                aria-label="Main navigation"
                className={`sticky top-0 z-50 w-full transition-colors transition-shadow duration-300 ${
                    isScrolled
                        ? "border-zinc-200 bg-white/95 shadow-lg backdrop-blur-lg dark:border-zinc-800 dark:bg-black/95"
                        : "bg-transparent"
                }`}
            >
                <div className="container mx-auto px-4">
                    <div className="flex h-14 items-center gap-1">
                        <Link href="/" className="mr-1 flex items-center gap-2 px-2">
                            <Image
                                src="/icons/logo-dark-nobg.png"
                                alt="Logo"
                                width={32}
                                height={32}
                                sizes="32px"
                                className="h-8 w-8 flex-shrink-0 dark:hidden"
                            />
                            <Image
                                src="/icons/logo-white-nobg.png"
                                alt="Logo"
                                width={32}
                                height={32}
                                sizes="32px"
                                className="hidden h-8 w-8 flex-shrink-0 dark:block"
                            />
                            <span className="hidden max-w-[150px] overflow-hidden text-ellipsis whitespace-nowrap font-bold text-zinc-900 dark:text-zinc-100 lg:inline">
                                {t("app.title")}
                            </span>
                        </Link>

                        <div className="hidden items-center gap-1 md:flex">
                            <Link
                                href="/"
                                className={`relative rounded-lg px-4 py-2 text-sm font-semibold transition-colors transition-shadow duration-200 ${
                                    activeTab === "home" || pathname === "/"
                                        ? "bg-blue-50 text-blue-600 dark:bg-blue-950/50 dark:text-blue-400"
                                        : "text-zinc-600 hover:bg-zinc-100 hover:text-zinc-900 dark:text-zinc-400 dark:hover:bg-zinc-800 dark:hover:text-zinc-200"
                                }`}
                            >
                                <span className="flex items-center gap-2">
                                    <Home className="h-4 w-4" />
                                    {t("nav.home")}
                                </span>
                                {(activeTab === "home" || pathname === "/") && (
                                    <span className="absolute bottom-0 left-2 right-2 h-0.5 rounded-full bg-blue-600 dark:bg-blue-400" />
                                )}
                            </Link>

                            <Link
                                href={hasTeam ? "/analisis" : "#"}
                                className={`relative rounded-lg px-4 py-2 text-sm font-semibold transition-all duration-200 ${
                                    activeTab === "analysis" || pathname === "/analisis"
                                        ? "bg-emerald-50 text-emerald-600 dark:bg-emerald-950/50 dark:text-emerald-400"
                                        : hasTeam
                                            ? "text-zinc-600 hover:bg-zinc-100 hover:text-zinc-900 dark:text-zinc-400 dark:hover:bg-zinc-800 dark:hover:text-zinc-200"
                                            : "pointer-events-none cursor-not-allowed text-zinc-300 dark:text-zinc-700"
                                }`}
                            >
                                <span className="flex items-center gap-2">
                                    <Sparkles className="h-4 w-4" />
                                    {t("nav.analysis")}
                                </span>
                                {(activeTab === "analysis" || pathname === "/analisis") && (
                                    <span className="absolute bottom-0 left-2 right-2 h-0.5 rounded-full bg-emerald-600 dark:bg-emerald-400" />
                                )}
                            </Link>

                            <div className="relative" ref={guidesRef}>
                                <button
                                    onClick={() => setGuidesOpen((open) => !open)}
                                    aria-expanded={guidesOpen}
                                    aria-haspopup="true"
                                    aria-label={lang === "es" ? "Menu de guias" : "Guides menu"}
                                    className={`relative flex items-center gap-1 rounded-lg px-4 py-2 text-sm font-semibold transition-all duration-200 ${
                                        isActive("/guides") || isActive("/tier-list")
                                            ? "bg-orange-50 text-orange-600 dark:bg-orange-950/50 dark:text-orange-400"
                                            : "text-zinc-600 hover:bg-zinc-100 hover:text-zinc-900 dark:text-zinc-400 dark:hover:bg-zinc-800 dark:hover:text-zinc-200"
                                    }`}
                                >
                                    <span className="flex items-center gap-2">
                                        <BookOpen className="h-4 w-4" />
                                        {t("nav.guides")}
                                        <svg
                                            xmlns="http://www.w3.org/2000/svg"
                                            width="12"
                                            height="12"
                                            viewBox="0 0 24 24"
                                            fill="none"
                                            stroke="currentColor"
                                            strokeWidth="2"
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                            className={`transition-transform ${guidesOpen ? "rotate-180" : ""}`}
                                        >
                                            <polyline points="6 9 12 15 18 9" />
                                        </svg>
                                    </span>
                                    {(isActive("/guides") || isActive("/tier-list")) && (
                                        <span className="absolute bottom-0 left-2 right-2 h-0.5 rounded-full bg-orange-600 dark:bg-orange-400" />
                                    )}
                                </button>

                                {guidesOpen && (
                                    <div
                                        className="absolute left-0 top-full z-50 mt-1 w-52 rounded-lg border border-zinc-200 bg-white py-1 shadow-lg dark:border-zinc-700 dark:bg-zinc-900"
                                        role="menu"
                                        aria-label={lang === "es" ? "Submenu de guias" : "Guides submenu"}
                                    >
                                        <Link
                                            href="/guides/gen9-ou"
                                            className="flex items-center gap-2 px-4 py-2 text-sm text-zinc-700 hover:bg-zinc-100 focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-orange-500 dark:text-zinc-300 dark:hover:bg-zinc-800"
                                            onClick={() => setGuidesOpen(false)}
                                            role="menuitem"
                                        >
                                            <BookOpen className="h-4 w-4" />
                                            {t("guides.ouTitle")}
                                        </Link>
                                        <Link
                                            href="/guides/vgc"
                                            className="flex items-center gap-2 px-4 py-2 text-sm text-zinc-700 hover:bg-zinc-100 focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-orange-500 dark:text-zinc-300 dark:hover:bg-zinc-800"
                                            onClick={() => setGuidesOpen(false)}
                                            role="menuitem"
                                        >
                                            <BookOpen className="h-4 w-4" />
                                            {t("guides.vgcTitle")}
                                        </Link>
                                        <Link
                                            href="/tier-list"
                                            className="flex items-center gap-2 px-4 py-2 text-sm text-zinc-700 hover:bg-zinc-100 focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-orange-500 dark:text-zinc-300 dark:hover:bg-zinc-800"
                                            onClick={() => setGuidesOpen(false)}
                                            role="menuitem"
                                        >
                                            <ListOrdered className="h-4 w-4" />
                                            {t("guides.tierList")}
                                        </Link>
                                        <hr className="my-1 border-zinc-200 dark:border-zinc-700" />
                                        <Link
                                            href="/changelog"
                                            className="flex items-center gap-2 px-4 py-2 text-sm text-zinc-700 hover:bg-zinc-100 focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-orange-500 dark:text-zinc-300 dark:hover:bg-zinc-800"
                                            onClick={() => setGuidesOpen(false)}
                                            role="menuitem"
                                        >
                                            <RefreshCw className="h-4 w-4" />
                                            {t("nav.changelog")}
                                        </Link>
                                        <Link
                                            href="/about"
                                            className="flex items-center gap-2 px-4 py-2 text-sm text-zinc-700 hover:bg-zinc-100 focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-orange-500 dark:text-zinc-300 dark:hover:bg-zinc-800"
                                            onClick={() => setGuidesOpen(false)}
                                            role="menuitem"
                                        >
                                            <Info className="h-4 w-4" />
                                            {t("nav.about")}
                                        </Link>
                                    </div>
                                )}
                            </div>

                            <Link
                                href="/saved-teams"
                                className={`relative flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-semibold transition-all duration-200 ${
                                    isActive("/saved-teams")
                                        ? "bg-cyan-50 text-cyan-600 dark:bg-cyan-950/50 dark:text-cyan-400"
                                        : "text-zinc-600 hover:bg-zinc-100 hover:text-zinc-900 dark:text-zinc-400 dark:hover:bg-zinc-800 dark:hover:text-zinc-200"
                                }`}
                            >
                                <Save className="h-4 w-4" />
                                <span className="hidden md:inline">{t("nav.savedTeams")}</span>
                                <span className="md:hidden">{t("nav.teams")}</span>
                                {isActive("/saved-teams") && (
                                    <span className="absolute bottom-0 left-2 right-2 h-0.5 rounded-full bg-cyan-600 dark:bg-cyan-400" />
                                )}
                            </Link>
                        </div>

                        <div className="flex-1" />

                        <Link
                            href="/configurar"
                            className="hidden items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white shadow-md transition-all duration-200 hover:bg-blue-700 hover:shadow-lg focus-visible:ring-2 focus-visible:ring-blue-400 focus-visible:ring-offset-2 sm:flex"
                        >
                            <Sparkles className="h-4 w-4" />
                            {t("nav.generate")}
                        </Link>

                        <ThemeSwitcher />

                        <button
                            onClick={() => setLang(lang === "en" ? "es" : "en")}
                            className="flex items-center gap-1.5 rounded-full border border-zinc-300 bg-white px-3 py-1.5 text-sm font-semibold text-zinc-700 shadow-sm transition-colors hover:bg-zinc-100 focus-visible:ring-2 focus-visible:ring-blue-400 focus-visible:ring-offset-2 dark:border-zinc-600 dark:bg-zinc-800 dark:text-zinc-300 dark:hover:bg-zinc-700"
                            aria-label={languageToggleLabel}
                        >
                            <Languages className="h-4 w-4" aria-hidden="true" />
                            <span className="text-xs uppercase tracking-wider">{lang === "en" ? "EN" : "ES"}</span>
                        </button>
                    </div>
                </div>
            </nav>

            <div className="fixed bottom-6 left-1/2 z-40 -translate-x-1/2 md:hidden" aria-label="Mobile navigation">
                {mobileMenuOpen && (
                    <div className="absolute bottom-full left-1/2 mb-4 flex w-56 -translate-x-1/2 flex-col rounded-2xl border border-zinc-200 bg-white py-2 shadow-2xl dark:border-zinc-700 dark:bg-zinc-900">
                        <div className="px-4 py-2 text-xs font-semibold uppercase tracking-wider text-zinc-500">
                            {t("nav.guides")}
                        </div>
                        <Link
                            href="/guides/gen9-ou"
                            className="flex items-center gap-2 px-4 py-3 text-sm text-zinc-700 hover:bg-zinc-100 dark:text-zinc-300 dark:hover:bg-zinc-800"
                            onClick={() => setMobileMenuOpen(false)}
                        >
                            <BookOpen className="h-4 w-4" />
                            {t("guides.ouTitle")}
                        </Link>
                        <Link
                            href="/guides/vgc"
                            className="flex items-center gap-2 px-4 py-3 text-sm text-zinc-700 hover:bg-zinc-100 dark:text-zinc-300 dark:hover:bg-zinc-800"
                            onClick={() => setMobileMenuOpen(false)}
                        >
                            <BookOpen className="h-4 w-4" />
                            {t("guides.vgcTitle")}
                        </Link>
                        <Link
                            href="/tier-list"
                            className="flex items-center gap-2 px-4 py-3 text-sm text-zinc-700 hover:bg-zinc-100 dark:text-zinc-300 dark:hover:bg-zinc-800"
                            onClick={() => setMobileMenuOpen(false)}
                        >
                            <ListOrdered className="h-4 w-4" />
                            {t("guides.tierList")}
                        </Link>
                        <hr className="my-2 border-zinc-200 dark:border-zinc-700" />
                        <Link
                            href="/changelog"
                            className="flex items-center gap-2 px-4 py-3 text-sm text-zinc-700 hover:bg-zinc-100 dark:text-zinc-300 dark:hover:bg-zinc-800"
                            onClick={() => setMobileMenuOpen(false)}
                        >
                            <RefreshCw className="h-4 w-4" />
                            {t("nav.changelog")}
                        </Link>
                        <Link
                            href="/about"
                            className="flex items-center gap-2 px-4 py-3 text-sm text-zinc-700 hover:bg-zinc-100 dark:text-zinc-300 dark:hover:bg-zinc-800"
                            onClick={() => setMobileMenuOpen(false)}
                        >
                            <Info className="h-4 w-4" />
                            {t("nav.about")}
                        </Link>
                    </div>
                )}

                <div className="flex items-center gap-1 rounded-full border border-zinc-700 bg-zinc-900/95 px-2 py-2 shadow-2xl backdrop-blur-lg dark:bg-zinc-900/95">
                    <Link
                        href="/"
                        aria-label={lang === "es" ? "Inicio" : "Home"}
                        className={`rounded-full p-2 focus-visible:ring-2 focus-visible:ring-white ${
                            pathname === "/" ? "bg-blue-600 text-white" : "text-zinc-400 hover:text-white"
                        }`}
                    >
                        <Home className="h-5 w-5" />
                    </Link>
                    <Link
                        href="/configurar"
                        aria-label={lang === "es" ? "Crear equipo" : "Create team"}
                        className={`rounded-full p-2 focus-visible:ring-2 focus-visible:ring-white ${
                            pathname === "/configurar" ? "bg-blue-600 text-white" : "text-zinc-400 hover:text-white"
                        }`}
                    >
                        <Plus className="h-5 w-5" />
                    </Link>
                    <Link
                        href="/saved-teams"
                        aria-label={lang === "es" ? "Equipos guardados" : "Saved teams"}
                        className={`rounded-full p-2 focus-visible:ring-2 focus-visible:ring-white ${
                            pathname === "/saved-teams" ? "bg-cyan-600 text-white" : "text-zinc-400 hover:text-white"
                        }`}
                    >
                        <Save className="h-5 w-5" />
                    </Link>
                    <button
                        aria-label={lang === "es" ? "Menu" : "Menu"}
                        onClick={() => setMobileMenuOpen((open) => !open)}
                        className={`rounded-full p-2 focus-visible:ring-2 focus-visible:ring-white ${
                            mobileMenuOpen ? "bg-orange-600 text-white" : "text-zinc-400 hover:text-white"
                        }`}
                    >
                        <Menu className="h-5 w-5" />
                    </button>
                </div>
            </div>
        </>
    );
}
