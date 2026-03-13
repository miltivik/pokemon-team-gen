"use client";

import Link from "next/link";

export default function HowToBuildCompetitiveTeamArticle() {
    return (
        <div className="min-h-screen bg-zinc-50 dark:bg-black font-sans">
            <main className="container mx-auto px-4 py-12 max-w-3xl">
                <div className="mb-8">
                    <Link href="/blog" className="text-blue-600 dark:text-blue-400 hover:underline text-sm">
                        ← Back to Blog
                    </Link>
                </div>

                <article>
                    <header className="mb-8">
                        <div className="flex gap-2 mb-3">
                            <span className="px-2 py-0.5 bg-green-100 dark:bg-green-900/50 text-green-700 dark:text-green-300 rounded text-xs font-medium">Beginner</span>
                            <span className="px-2 py-0.5 bg-purple-100 dark:bg-purple-900/50 text-purple-700 dark:text-purple-300 rounded text-xs font-medium">Teambuilding</span>
                        </div>
                        <h1 className="text-3xl font-bold tracking-tight text-zinc-900 dark:text-zinc-50 mb-3">
                            How to Build a Competitive Pokémon Team: Complete Guide
                        </h1>
                        <p className="text-zinc-500 dark:text-zinc-400 text-sm">
                            March 8, 2026 · 10 min read
                        </p>
                    </header>

                    <div className="prose-custom space-y-6 text-zinc-700 dark:text-zinc-300 leading-relaxed">
                        <p className="text-lg">
                            Building a competitive Pokémon team can feel overwhelming. Hundreds of Pokémon, thousands of moves, abilities, items, EVs, natures — where do you even start? This guide breaks down the teambuilding process into manageable steps that will have you creating solid teams in no time, whether you are playing on Pokémon Showdown or in-game.
                        </p>

                        <h2 className="text-2xl font-bold text-zinc-900 dark:text-zinc-100 mt-8 mb-4">
                            Step 1: Choose Your Format
                        </h2>
                        <p>
                            The first decision is which format you want to play. Each format has different rules, ban lists, and strategies:
                        </p>
                        <ul className="list-disc pl-6 space-y-2 my-4">
                            <li><strong>OU (Overused):</strong> The most popular Smogon singles format. 6v6 with a ban list that removes the most broken Pokémon.</li>
                            <li><strong>VGC (Video Game Championships):</strong> The official doubles format used in tournaments. Bring 6, pick 4 each battle.</li>
                            <li><strong>UU, RU, NU:</strong> Lower-tier formats that ban the most popular Pokémon from the tier above, creating unique metagames.</li>
                            <li><strong>Monotype:</strong> All six Pokémon must share a type. A creative and challenging format.</li>
                        </ul>
                        <p>
                            For beginners, we recommend starting with OU. It has the most resources, guides, and sample teams available. Once you understand the fundamentals, branching into other formats becomes much easier.
                        </p>

                        <h2 className="text-2xl font-bold text-zinc-900 dark:text-zinc-100 mt-8 mb-4">
                            Step 2: Start With a Core
                        </h2>
                        <p>
                            Never build a team by randomly picking six Pokémon you like. Instead, start with a <strong>core</strong> — two or three Pokémon that work well together and cover each other&apos;s weaknesses. There are two main types of cores:
                        </p>
                        <ul className="list-disc pl-6 space-y-3 my-4">
                            <li><strong>Offensive Cores:</strong> Two attackers that cover each other&apos;s resists. For example, a Water-type paired with a Ground-type — Water handles Fire-types that threaten Ground, while Ground handles Electric-types that threaten Water.</li>
                            <li><strong>Defensive Cores:</strong> Two walls that handle different categories of attackers. A physically defensive Pokémon paired with a specially defensive one creates a solid defensive backbone.</li>
                        </ul>
                        <p>
                            A classic example is the Fire-Water-Grass core. These three types resist each other&apos;s weaknesses, creating a triangle of defensive synergy. Modern equivalents include Steel-Fairy-Dragon and Ground-Flying-Water cores.
                        </p>

                        <h2 className="text-2xl font-bold text-zinc-900 dark:text-zinc-100 mt-8 mb-4">
                            Step 3: Understand Team Roles
                        </h2>
                        <p>
                            Every competitive team needs Pokémon that fill specific roles. Not every team needs every role, but understanding them helps you identify gaps:
                        </p>
                        <div className="my-6 space-y-4">
                            <div className="p-4 bg-white dark:bg-zinc-900 rounded-lg border border-zinc-200 dark:border-zinc-800">
                                <h3 className="font-semibold text-zinc-900 dark:text-zinc-100 mb-1">🗡️ Wallbreaker</h3>
                                <p className="text-sm">A high-power attacker designed to punch through defensive Pokémon. Examples: Iron Valiant, Roaring Moon.</p>
                            </div>
                            <div className="p-4 bg-white dark:bg-zinc-900 rounded-lg border border-zinc-200 dark:border-zinc-800">
                                <h3 className="font-semibold text-zinc-900 dark:text-zinc-100 mb-1">⚡ Revenge Killer</h3>
                                <p className="text-sm">A fast Pokémon (often holding Choice Scarf) that comes in after a KO to take out weakened threats. Examples: Dragapult, Scarf Iron Valiant.</p>
                            </div>
                            <div className="p-4 bg-white dark:bg-zinc-900 rounded-lg border border-zinc-200 dark:border-zinc-800">
                                <h3 className="font-semibold text-zinc-900 dark:text-zinc-100 mb-1">🛡️ Defensive Pivot</h3>
                                <p className="text-sm">A bulky Pokémon that absorbs hits and pivots out with U-turn or Teleport. Examples: Slowking-Galar, Landorus-T.</p>
                            </div>
                            <div className="p-4 bg-white dark:bg-zinc-900 rounded-lg border border-zinc-200 dark:border-zinc-800">
                                <h3 className="font-semibold text-zinc-900 dark:text-zinc-100 mb-1">🏗️ Hazard Setter/Remover</h3>
                                <p className="text-sm">Stealth Rock, Spikes, and Toxic Spikes are crucial. You need a setter and a remover (Rapid Spin or Defog). Example: Great Tusk does both.</p>
                            </div>
                            <div className="p-4 bg-white dark:bg-zinc-900 rounded-lg border border-zinc-200 dark:border-zinc-800">
                                <h3 className="font-semibold text-zinc-900 dark:text-zinc-100 mb-1">🧹 Sweeper / Win Condition</h3>
                                <p className="text-sm">The Pokémon that closes out the game after checks are removed. Often a setup sweeper with Swords Dance or Dragon Dance. Example: Kingambit.</p>
                            </div>
                        </div>

                        <h2 className="text-2xl font-bold text-zinc-900 dark:text-zinc-100 mt-8 mb-4">
                            Step 4: Type Coverage and Resistances
                        </h2>
                        <p>
                            After selecting your initial core and identifying roles, check your team&apos;s type chart. You want to ensure:
                        </p>
                        <ol className="list-decimal pl-6 space-y-2 my-4">
                            <li>No more than two Pokémon share a common weakness (e.g., don&apos;t have three Pokémon weak to Ground)</li>
                            <li>Every common attacking type (Fire, Water, Ground, Electric, Fighting, Fairy) has at least one resist on your team</li>
                            <li>You have at least one answer to the top 5 most-used Pokémon in your tier</li>
                        </ol>
                        <p>
                            A simple way to check coverage: look at the top 10 Pokémon in the tier and ask &quot;what on my team handles this?&quot; If you can&apos;t answer that question for two or more threats, you have a teambuilding hole.
                        </p>

                        <h2 className="text-2xl font-bold text-zinc-900 dark:text-zinc-100 mt-8 mb-4">
                            Step 5: Speed Tiers and Priority
                        </h2>
                        <p>
                            Speed is everything in competitive Pokémon. Knowing which Pokémon outspeed which is critical for predicting outcomes. Key benchmarks in Gen 9 OU include:
                        </p>
                        <ul className="list-disc pl-6 space-y-2 my-4">
                            <li>142 base Speed (Dragapult) — outspeeds almost everything unboosted</li>
                            <li>130 base Speed (Iron Valiant w/ Booster Energy) — threatening speed tier</li>
                            <li>100 base Speed — a common benchmark for Choice Scarf users</li>
                            <li>Priority moves like Sucker Punch, Aqua Jet, and Ice Shard bypass Speed entirely</li>
                        </ul>
                        <p>
                            Include at least one Pokémon with priority or one Choice Scarf user to prevent faster threats from sweeping your entire team.
                        </p>

                        <h2 className="text-2xl font-bold text-zinc-900 dark:text-zinc-100 mt-8 mb-4">
                            Step 6: Test and Iterate
                        </h2>
                        <p>
                            No team is perfect on the first try. Play 10-15 games on the Pokémon Showdown ladder and take notes:
                        </p>
                        <ul className="list-disc pl-6 space-y-2 my-4">
                            <li>Which Pokémon consistently perform well?</li>
                            <li>Which Pokémon feel useless or are always sitting on the bench?</li>
                            <li>What opposing Pokémon or strategies consistently beat you?</li>
                            <li>Are there any type matchups your team simply cannot win?</li>
                        </ul>
                        <p>
                            Replace underperforming Pokémon with answers to what you keep losing to. Competitive teambuilding is an iterative process — even top players constantly tweak their teams.
                        </p>

                        <h2 className="text-2xl font-bold text-zinc-900 dark:text-zinc-100 mt-8 mb-4">
                            Common Beginner Mistakes
                        </h2>
                        <ul className="list-disc pl-6 space-y-3 my-4">
                            <li><strong>All offensive, no defensive:</strong> Having six attackers with no bulk means any faster team sweeps you. Include at least one or two defensive Pokémon.</li>
                            <li><strong>No hazard control:</strong> Ignoring Stealth Rock means your team takes chip damage every switch, losing games through attrition.</li>
                            <li><strong>Overlapping coverage:</strong> If three of your Pokémon run Earthquake, you are wasting moveslots. Diversify your coverage.</li>
                            <li><strong>Ignoring team preview:</strong> In competitive play, you see your opponent&apos;s team before battle. Build with the assumption that your opponent will also optimize their leads.</li>
                        </ul>

                        <div className="mt-10 p-6 bg-blue-50 dark:bg-blue-950/30 rounded-xl border border-blue-200 dark:border-blue-800">
                            <h3 className="font-semibold text-zinc-900 dark:text-zinc-100 mb-2">
                                🚀 Skip the Hard Part
                            </h3>
                            <p className="text-sm mb-4">
                                Our team generator uses real usage data from thousands of battles to create balanced, competitive teams. It handles type coverage, role distribution, and moveset optimization automatically.
                            </p>
                            <Link
                                href="/configurar"
                                className="inline-flex items-center gap-2 px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg transition-colors text-sm"
                            >
                                Generate My Team →
                            </Link>
                        </div>
                    </div>
                </article>
            </main>
        </div>
    );
}
