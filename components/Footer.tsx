"use client";

import Link from "next/link";
import { useState } from "react";
import { useTranslation } from "@/lib/i18n";
import { CookieSettingsModal } from "@/components/CookieSettings";

export function Footer() {
    const { t, lang } = useTranslation();
    const [showCookieSettings, setShowCookieSettings] = useState(false);
    const currentYear = new Date().getFullYear();
    const copy = {
        brandName: "PokeTeamBuilder",
        brandDescription:
            lang === "es"
                ? "Genera equipos competitivos de Pokémon basados en datos reales del meta. Hecho para la comunidad competitiva de Pokémon."
                : "Generate competitive Pokemon teams based on real meta data. Built for the competitive Pokemon community.",
        tool: lang === "es" ? "Herramienta" : "Tool",
        generator: lang === "es" ? "Generador de equipos" : "Team Generator",
        guides: lang === "es" ? "Guías" : "Guides",
        blog: "Blog",
        legal: lang === "es" ? "Legal" : "Legal",
        privacy: lang === "es" ? "Política de privacidad" : "Privacy Policy",
        terms: lang === "es" ? "Términos del servicio" : "Terms of Service",
        cookies: lang === "es" ? "Configuración de cookies" : "Cookie Settings",
        contact: lang === "es" ? "Contacto" : "Contact",
        disclaimer:
            lang === "es"
                ? "Pokémon y todos los nombres relacionados son marcas de Nintendo, The Pokémon Company y Game Freak. Esta es una herramienta hecha por fans, sin afiliación ni respaldo oficial de esas compañías."
                : "Pokemon and all related names are trademarks of Nintendo, The Pokemon Company, and Game Freak. This is a fan-made tool, not affiliated with or endorsed by any of these companies.",
        copyright:
            lang === "es"
                ? `(c) ${currentYear} PokeTeamBuilder. Todos los derechos reservados.`
                : `(c) ${currentYear} PokeTeamBuilder. All rights reserved.`,
    };

    return (
        <footer className="mt-auto w-full border-t border-zinc-200 bg-white dark:border-zinc-800 dark:bg-zinc-950">
            <div className="container mx-auto px-4 py-10">
                <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-4">
                    <div className="space-y-3">
                        <h3 className="font-bold text-zinc-900 dark:text-zinc-100">
                            {copy.brandName}
                        </h3>
                        <p className="text-sm leading-relaxed text-zinc-600 dark:text-zinc-400">
                            {copy.brandDescription}
                        </p>
                    </div>

                    <div className="space-y-3">
                        <h4 className="text-sm font-semibold uppercase tracking-wider text-zinc-900 dark:text-zinc-100">
                            {copy.tool}
                        </h4>
                        <ul className="space-y-2 text-sm">
                            <li>
                                <Link
                                    href="/configurar"
                                    className="text-zinc-600 transition-colors hover:text-blue-600 dark:text-zinc-400 dark:hover:text-blue-400"
                                >
                                    {copy.generator}
                                </Link>
                            </li>
                            <li>
                                <Link
                                    href="/pokemon-showdown-team-builder"
                                    className="text-zinc-600 transition-colors hover:text-blue-600 dark:text-zinc-400 dark:hover:text-blue-400"
                                >
                                    {t("home.explore.showdownBuilder")}
                                </Link>
                            </li>
                            <li>
                                <Link
                                    href="/saved-teams"
                                    className="text-zinc-600 transition-colors hover:text-blue-600 dark:text-zinc-400 dark:hover:text-blue-400"
                                >
                                    {t("nav.savedTeams")}
                                </Link>
                            </li>
                            <li>
                                <Link
                                    href="/tier-list"
                                    className="text-zinc-600 transition-colors hover:text-blue-600 dark:text-zinc-400 dark:hover:text-blue-400"
                                >
                                    Tier List
                                </Link>
                            </li>
                        </ul>
                    </div>

                    <div className="space-y-3">
                        <h4 className="text-sm font-semibold uppercase tracking-wider text-zinc-900 dark:text-zinc-100">
                            {copy.guides}
                        </h4>
                        <ul className="space-y-2 text-sm">
                            <li>
                                <Link
                                    href="/guides/gen9-ou"
                                    className="text-zinc-600 transition-colors hover:text-blue-600 dark:text-zinc-400 dark:hover:text-blue-400"
                                >
                                    {lang === "es" ? "Guía Gen 9 OU" : "Gen 9 OU Guide"}
                                </Link>
                            </li>
                            <li>
                                <Link
                                    href="/guides/vgc"
                                    className="text-zinc-600 transition-colors hover:text-blue-600 dark:text-zinc-400 dark:hover:text-blue-400"
                                >
                                    {lang === "es" ? "Guía VGC" : "VGC Guide"}
                                </Link>
                            </li>
                            <li>
                                <Link
                                    href="/blog"
                                    className="text-zinc-600 transition-colors hover:text-blue-600 dark:text-zinc-400 dark:hover:text-blue-400"
                                >
                                    {copy.blog}
                                </Link>
                            </li>
                        </ul>
                    </div>

                    <div className="space-y-3">
                        <h4 className="text-sm font-semibold uppercase tracking-wider text-zinc-900 dark:text-zinc-100">
                            {copy.legal}
                        </h4>
                        <ul className="space-y-2 text-sm">
                            <li>
                                <Link
                                    href="/privacy"
                                    className="text-zinc-600 transition-colors hover:text-blue-600 dark:text-zinc-400 dark:hover:text-blue-400"
                                >
                                    {copy.privacy}
                                </Link>
                            </li>
                            <li>
                                <Link
                                    href="/terms"
                                    className="text-zinc-600 transition-colors hover:text-blue-600 dark:text-zinc-400 dark:hover:text-blue-400"
                                >
                                    {copy.terms}
                                </Link>
                            </li>
                            <li>
                                <Link
                                    href="/contact"
                                    className="text-zinc-600 transition-colors hover:text-blue-600 dark:text-zinc-400 dark:hover:text-blue-400"
                                >
                                    {copy.contact}
                                </Link>
                            </li>
                            <li>
                                <button
                                    onClick={() => setShowCookieSettings(true)}
                                    className="text-left text-zinc-600 transition-colors hover:text-blue-600 dark:text-zinc-400 dark:hover:text-blue-400"
                                >
                                    {copy.cookies}
                                </button>
                            </li>
                            <li>
                                <Link
                                    href="/about"
                                    className="text-zinc-600 transition-colors hover:text-blue-600 dark:text-zinc-400 dark:hover:text-blue-400"
                                >
                                    {t("nav.about")}
                                </Link>
                            </li>
                        </ul>
                    </div>
                </div>

                <div className="mt-8 border-t border-zinc-200 pt-6 dark:border-zinc-800">
                    <div className="flex flex-col items-center justify-between gap-4 sm:flex-row">
                        <p className="text-sm text-zinc-500 dark:text-zinc-500">{copy.copyright}</p>
                        <p className="max-w-md text-center text-xs text-zinc-400 dark:text-zinc-600 sm:text-right">
                            {copy.disclaimer}
                        </p>
                    </div>
                </div>

                {showCookieSettings && (
                    <CookieSettingsModal onClose={() => setShowCookieSettings(false)} />
                )}
            </div>
        </footer>
    );
}
