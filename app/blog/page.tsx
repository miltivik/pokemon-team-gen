"use client";

import Link from "next/link";
import { useTranslation } from "@/lib/i18n";

const articles = [
    {
        slug: "best-pokemon-gen9-ou",
        title: "Top 10 Best Pokémon for Gen 9 OU in 2026",
        description: "A deep dive into the most dominant Pokémon in the Gen 9 OU metagame, including sets, counters, and teambuilding tips.",
        date: "March 10, 2026",
        readTime: "8 min read",
        emoji: "🏆",
        tags: ["Gen 9 OU", "Competitive", "Strategy"],
    },
    {
        slug: "how-to-build-competitive-team",
        title: "How to Build a Competitive Pokémon Team: Complete Guide",
        description: "Learn the fundamentals of teambuilding — from role compression to type coverage to speed tiers. Everything you need to build winning teams.",
        date: "March 8, 2026",
        readTime: "10 min read",
        emoji: "🧠",
        tags: ["Beginner", "Teambuilding", "Guide"],
    },
    {
        slug: "vgc-2026-guide",
        title: "VGC 2026 Meta Guide: Top Strategies and Teams",
        description: "The VGC doubles format demands a different approach. Learn about Trick Room, weather teams, and the top cores dominating tournament play.",
        date: "March 5, 2026",
        readTime: "9 min read",
        emoji: "🎮",
        tags: ["VGC", "Doubles", "Tournament"],
    },
];

export default function BlogPage() {
    const { t } = useTranslation();

    return (
        <div className="min-h-screen bg-zinc-50 dark:bg-black font-sans">
            <main className="container mx-auto px-4 py-12 max-w-4xl">
                <div className="mb-10">
                    <h1 className="text-3xl font-bold tracking-tight text-zinc-900 dark:text-zinc-50 mb-3">
                        📝 Blog & Guides
                    </h1>
                    <p className="text-zinc-600 dark:text-zinc-400 max-w-2xl">
                        In-depth articles about competitive Pokémon teambuilding, meta analysis, and strategy guides to help you improve your game.
                    </p>
                </div>

                <div className="space-y-6">
                    {articles.map((article) => (
                        <Link
                            key={article.slug}
                            href={`/blog/${article.slug}`}
                            className="block group"
                        >
                            <article className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl p-6 transition-all duration-200 hover:shadow-lg hover:border-blue-300 dark:hover:border-blue-700 hover:-translate-y-0.5">
                                <div className="flex items-start gap-4">
                                    <span className="text-3xl flex-shrink-0" aria-hidden="true">
                                        {article.emoji}
                                    </span>
                                    <div className="flex-1 min-w-0">
                                        <h2 className="text-xl font-semibold text-zinc-900 dark:text-zinc-100 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors mb-2">
                                            {article.title}
                                        </h2>
                                        <p className="text-zinc-600 dark:text-zinc-400 text-sm leading-relaxed mb-3">
                                            {article.description}
                                        </p>
                                        <div className="flex flex-wrap items-center gap-3 text-xs text-zinc-500 dark:text-zinc-500">
                                            <span>{article.date}</span>
                                            <span>·</span>
                                            <span>{article.readTime}</span>
                                            <span>·</span>
                                            <div className="flex gap-2">
                                                {article.tags.map((tag) => (
                                                    <span
                                                        key={tag}
                                                        className="px-2 py-0.5 bg-zinc-100 dark:bg-zinc-800 rounded text-zinc-600 dark:text-zinc-400"
                                                    >
                                                        {tag}
                                                    </span>
                                                ))}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </article>
                        </Link>
                    ))}
                </div>

                <div className="mt-12 p-6 bg-gradient-to-br from-blue-50 to-cyan-50 dark:from-blue-950/30 dark:to-cyan-950/30 rounded-xl border border-blue-200 dark:border-blue-800 text-center">
                    <h2 className="text-lg font-semibold text-zinc-900 dark:text-zinc-100 mb-2">
                        Want to try it yourself?
                    </h2>
                    <p className="text-sm text-zinc-600 dark:text-zinc-400 mb-4">
                        Generate a competitive team based on real usage statistics from the Pokémon Showdown metagame.
                    </p>
                    <Link
                        href="/configurar"
                        className="inline-flex items-center gap-2 px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg transition-colors"
                    >
                        🚀 Generate a Team
                    </Link>
                </div>
            </main>
        </div>
    );
}
