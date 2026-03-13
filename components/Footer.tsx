"use client";

import Link from "next/link";
import { useTranslation } from "@/lib/i18n";

export function Footer() {
    const { t } = useTranslation();
    const currentYear = new Date().getFullYear();

    return (
        <footer className="w-full border-t border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 mt-auto">
            <div className="container mx-auto px-4 py-10">
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
                    {/* Brand */}
                    <div className="space-y-3">
                        <h3 className="font-bold text-zinc-900 dark:text-zinc-100">
                            ⚡ PokéTeamBuilder
                        </h3>
                        <p className="text-sm text-zinc-600 dark:text-zinc-400 leading-relaxed">
                            Generate competitive Pokémon teams based on real meta data. Built for the competitive Pokémon community.
                        </p>
                    </div>

                    {/* Tool */}
                    <div className="space-y-3">
                        <h4 className="text-sm font-semibold text-zinc-900 dark:text-zinc-100 uppercase tracking-wider">
                            Tool
                        </h4>
                        <ul className="space-y-2 text-sm">
                            <li>
                                <Link href="/configurar" className="text-zinc-600 dark:text-zinc-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors">
                                    Team Generator
                                </Link>
                            </li>
                            <li>
                                <Link href="/saved-teams" className="text-zinc-600 dark:text-zinc-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors">
                                    {t("nav.savedTeams")}
                                </Link>
                            </li>
                            <li>
                                <Link href="/tier-list" className="text-zinc-600 dark:text-zinc-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors">
                                    Tier List
                                </Link>
                            </li>
                        </ul>
                    </div>

                    {/* Guides */}
                    <div className="space-y-3">
                        <h4 className="text-sm font-semibold text-zinc-900 dark:text-zinc-100 uppercase tracking-wider">
                            {t("nav.guides")}
                        </h4>
                        <ul className="space-y-2 text-sm">
                            <li>
                                <Link href="/guides/gen9-ou" className="text-zinc-600 dark:text-zinc-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors">
                                    Gen 9 OU Guide
                                </Link>
                            </li>
                            <li>
                                <Link href="/guides/vgc" className="text-zinc-600 dark:text-zinc-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors">
                                    VGC Guide
                                </Link>
                            </li>
                            <li>
                                <Link href="/blog" className="text-zinc-600 dark:text-zinc-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors">
                                    Blog
                                </Link>
                            </li>
                        </ul>
                    </div>

                    {/* Legal */}
                    <div className="space-y-3">
                        <h4 className="text-sm font-semibold text-zinc-900 dark:text-zinc-100 uppercase tracking-wider">
                            Legal
                        </h4>
                        <ul className="space-y-2 text-sm">
                            <li>
                                <Link href="/privacy" className="text-zinc-600 dark:text-zinc-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors">
                                    Privacy Policy
                                </Link>
                            </li>
                            <li>
                                <Link href="/terms" className="text-zinc-600 dark:text-zinc-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors">
                                    Terms of Service
                                </Link>
                            </li>
                            <li>
                                <Link href="/contact" className="text-zinc-600 dark:text-zinc-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors">
                                    Contact
                                </Link>
                            </li>
                            <li>
                                <Link href="/about" className="text-zinc-600 dark:text-zinc-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors">
                                    {t("nav.about")}
                                </Link>
                            </li>
                        </ul>
                    </div>
                </div>

                {/* Bottom bar */}
                <div className="mt-8 pt-6 border-t border-zinc-200 dark:border-zinc-800">
                    <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
                        <p className="text-sm text-zinc-500 dark:text-zinc-500">
                            © {currentYear} PokéTeamBuilder. All rights reserved.
                        </p>
                        <p className="text-xs text-zinc-400 dark:text-zinc-600 text-center sm:text-right max-w-md">
                            Pokémon and all related names are trademarks of Nintendo, The Pokémon Company, and Game Freak. This is a fan-made tool, not affiliated with or endorsed by any of these companies.
                        </p>
                    </div>
                </div>
            </div>
        </footer>
    );
}
