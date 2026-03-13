"use client";

import { useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { useTranslation } from "@/lib/i18n";

export default function ContactPage() {
    const { t } = useTranslation();
    const [submitted, setSubmitted] = useState(false);

    return (
        <div className="min-h-screen bg-zinc-50 dark:bg-black font-sans">
            <main className="container mx-auto px-4 py-12 max-w-3xl">
                <h1 className="text-3xl font-bold tracking-tight text-zinc-900 dark:text-zinc-50 mb-2">
                    📬 Contact Us
                </h1>
                <p className="text-zinc-600 dark:text-zinc-400 mb-8">
                    Have a question, suggestion, or found a bug? We&apos;d love to hear from you.
                </p>

                <div className="space-y-6">
                    {/* Direct Contact */}
                    <Card className="bg-white dark:bg-zinc-900 border-zinc-200 dark:border-zinc-800">
                        <CardContent className="p-6">
                            <h2 className="text-xl font-semibold text-zinc-900 dark:text-zinc-100 mb-4">
                                Get in Touch
                            </h2>
                            <div className="space-y-4">
                                <div className="flex items-start gap-3">
                                    <span className="text-2xl" aria-hidden="true">📧</span>
                                    <div>
                                        <h3 className="font-medium text-zinc-900 dark:text-zinc-100">Email</h3>
                                        <a
                                            href="mailto:contact@poketeambuilder.com"
                                            className="text-blue-600 dark:text-blue-400 hover:underline"
                                        >
                                            contact@poketeambuilder.com
                                        </a>
                                        <p className="text-sm text-zinc-500 dark:text-zinc-400 mt-1">
                                            We typically respond within 48 hours.
                                        </p>
                                    </div>
                                </div>

                                <div className="flex items-start gap-3">
                                    <span className="text-2xl" aria-hidden="true">🐛</span>
                                    <div>
                                        <h3 className="font-medium text-zinc-900 dark:text-zinc-100">Bug Reports</h3>
                                        <p className="text-zinc-700 dark:text-zinc-300 text-sm">
                                            Found a bug or issue? Please report it through our{" "}
                                            <a
                                                href="https://github.com"
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="text-blue-600 dark:text-blue-400 hover:underline"
                                            >
                                                GitHub repository
                                            </a>{" "}
                                            or send us an email with details about what happened.
                                        </p>
                                    </div>
                                </div>

                                <div className="flex items-start gap-3">
                                    <span className="text-2xl" aria-hidden="true">💡</span>
                                    <div>
                                        <h3 className="font-medium text-zinc-900 dark:text-zinc-100">Feature Requests</h3>
                                        <p className="text-zinc-700 dark:text-zinc-300 text-sm">
                                            Have an idea for a new feature? We welcome suggestions! Send us an email describing your idea and how it would improve the tool.
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    {/* FAQ */}
                    <Card className="bg-white dark:bg-zinc-900 border-zinc-200 dark:border-zinc-800">
                        <CardContent className="p-6">
                            <h2 className="text-xl font-semibold text-zinc-900 dark:text-zinc-100 mb-4">
                                Frequently Asked Questions
                            </h2>
                            <div className="space-y-4">
                                <div>
                                    <h3 className="font-medium text-zinc-900 dark:text-zinc-100 mb-1">
                                        Is PokéTeamBuilder free to use?
                                    </h3>
                                    <p className="text-sm text-zinc-700 dark:text-zinc-300">
                                        Yes! PokéTeamBuilder is completely free to use. We are supported by ads and voluntary donations through Ko-fi.
                                    </p>
                                </div>
                                <div>
                                    <h3 className="font-medium text-zinc-900 dark:text-zinc-100 mb-1">
                                        Where does the competitive data come from?
                                    </h3>
                                    <p className="text-sm text-zinc-700 dark:text-zinc-300">
                                        We use publicly available usage statistics and competitive data from the Pokémon Showdown and Smogon communities to generate balanced, meta-relevant teams.
                                    </p>
                                </div>
                                <div>
                                    <h3 className="font-medium text-zinc-900 dark:text-zinc-100 mb-1">
                                        Can I export my team to Pokémon Showdown?
                                    </h3>
                                    <p className="text-sm text-zinc-700 dark:text-zinc-300">
                                        Yes! Every generated team includes a one-click export feature that copies the team in Pokémon Showdown format, ready to paste into the teambuilder.
                                    </p>
                                </div>
                                <div>
                                    <h3 className="font-medium text-zinc-900 dark:text-zinc-100 mb-1">
                                        Is my data saved anywhere?
                                    </h3>
                                    <p className="text-sm text-zinc-700 dark:text-zinc-300">
                                        Your teams and preferences are stored locally in your browser. We do not save any personal data on our servers. For more details, see our{" "}
                                        <Link href="/privacy" className="text-blue-600 dark:text-blue-400 hover:underline">
                                            Privacy Policy
                                        </Link>.
                                    </p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Support */}
                    <Card className="bg-gradient-to-br from-blue-50 to-cyan-50 dark:from-blue-950/30 dark:to-cyan-950/30 border-blue-200 dark:border-blue-800">
                        <CardContent className="p-6 text-center">
                            <h2 className="text-xl font-semibold text-zinc-900 dark:text-zinc-100 mb-2">
                                ☕ Support the Project
                            </h2>
                            <p className="text-zinc-700 dark:text-zinc-300 mb-4 text-sm">
                                PokéTeamBuilder is a community project built with love. If you find it useful, consider supporting us!
                            </p>
                            <div className="flex justify-center gap-4">
                                <Link href="/">
                                    <Button className="bg-blue-600 hover:bg-blue-700 text-white">
                                        🚀 Try the Generator
                                    </Button>
                                </Link>
                            </div>
                        </CardContent>
                    </Card>
                </div>

                <div className="mt-12 pt-6 border-t border-zinc-200 dark:border-zinc-800">
                    <Link href="/" className="text-blue-600 dark:text-blue-400 hover:underline text-sm">
                        ← Back to Home
                    </Link>
                </div>
            </main>
        </div>
    );
}
