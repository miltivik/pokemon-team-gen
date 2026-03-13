"use client";

import Link from "next/link";

export default function VGC2026GuideArticle() {
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
                            <span className="px-2 py-0.5 bg-red-100 dark:bg-red-900/50 text-red-700 dark:text-red-300 rounded text-xs font-medium">VGC</span>
                            <span className="px-2 py-0.5 bg-yellow-100 dark:bg-yellow-900/50 text-yellow-700 dark:text-yellow-300 rounded text-xs font-medium">Tournament</span>
                        </div>
                        <h1 className="text-3xl font-bold tracking-tight text-zinc-900 dark:text-zinc-50 mb-3">
                            VGC 2026 Meta Guide: Top Strategies and Teams
                        </h1>
                        <p className="text-zinc-500 dark:text-zinc-400 text-sm">
                            March 5, 2026 · 9 min read
                        </p>
                    </header>

                    <div className="prose-custom space-y-6 text-zinc-700 dark:text-zinc-300 leading-relaxed">
                        <p className="text-lg">
                            VGC — the official Pokémon Video Game Championships format — is a doubles battle format that plays fundamentally differently from singles. With two Pokémon on the field at all times, positioning, speed control, and team preview strategy become even more critical. This guide covers the essential strategies, top Pokémon, and team archetypes you need to compete in VGC 2026.
                        </p>

                        <h2 className="text-2xl font-bold text-zinc-900 dark:text-zinc-100 mt-8 mb-4">
                            How VGC Differs From Singles
                        </h2>
                        <p>
                            If you are coming from Smogon singles, VGC requires a mental shift. Here are the key differences:
                        </p>
                        <ul className="list-disc pl-6 space-y-2 my-4">
                            <li><strong>Doubles Format:</strong> Two Pokémon on each side at all times. This means moves like Protect, spread attacks (such as Earthquake and Heat Wave), and redirection with Follow Me become essential.</li>
                            <li><strong>Bring 6, Pick 4:</strong> You bring a team of six, but only select four for each battle. This means your team needs to be flexible enough to handle multiple matchups by mixing and matching different combinations.</li>
                            <li><strong>Restricted Pokémon:</strong> The VGC ruleset typically allows a limited number of powerful legendaries. Understanding which restricted Pokémon define the format is crucial.</li>
                            <li><strong>Official Rules:</strong> The ban list and rules are set by The Pokémon Company, not by community consensus like Smogon.</li>
                        </ul>

                        <h2 className="text-2xl font-bold text-zinc-900 dark:text-zinc-100 mt-8 mb-4">
                            The Four Pillars of VGC Teambuilding
                        </h2>

                        <h3 className="text-xl font-semibold text-zinc-900 dark:text-zinc-100 mt-6 mb-3">
                            1. Speed Control
                        </h3>
                        <p>
                            In doubles, whoever moves first often wins. Speed control is the single most important strategic consideration. There are several ways to control speed:
                        </p>
                        <ul className="list-disc pl-6 space-y-2 my-4">
                            <li><strong>Trick Room:</strong> Reverses the speed order so slower Pokémon move first. Dedicated Trick Room teams often use Pokémon like Porygon2, Dusclops, or Uxie as setters alongside slow powerhouses like Torkoal or Glastrier.</li>
                            <li><strong>Tailwind:</strong> Doubles your team&apos;s Speed for four turns. Common setters include Whimsicott (with Prankster), Tornadus, and Murkrow.</li>
                            <li><strong>Icy Wind / Electroweb:</strong> Speed-lowering spread moves that shift the pace of battle in your favor. These are especially useful on balance teams.</li>
                            <li><strong>Thunder Wave / Scary Face:</strong> Single-target speed control for more targeted disruption.</li>
                        </ul>

                        <h3 className="text-xl font-semibold text-zinc-900 dark:text-zinc-100 mt-6 mb-3">
                            2. Protect and Positioning
                        </h3>
                        <p>
                            Protect is the single most important move in VGC. It serves multiple purposes: scouting what the opponent plans to do, keeping a Pokémon safe while its partner handles a threat, stalling Trick Room or Tailwind turns, and guaranteeing a safe switch. Almost every Pokémon in VGC should run Protect unless it has a very compelling reason not to (such as a Choice item).
                        </p>
                        <p>
                            Positioning — deciding what to bring, when to switch, and which Pokémon to target — separates good players from great ones. Always think one turn ahead: if my opponent uses Protect on their Incineroar, is my other attacker ready to handle their other Pokémon?
                        </p>

                        <h3 className="text-xl font-semibold text-zinc-900 dark:text-zinc-100 mt-6 mb-3">
                            3. Spread Moves vs. Single-Target
                        </h3>
                        <p>
                            In doubles, spread moves hit both opponents but deal 75% of their normal damage to each target. This trade-off is critical when building movesets. Popular spread moves include:
                        </p>
                        <ul className="list-disc pl-6 space-y-2 my-4">
                            <li><strong>Earthquake:</strong> Devastating Ground-type spread move. Be careful — it also hits your partner. Pair with a Flying-type or Levitate user.</li>
                            <li><strong>Heat Wave:</strong> Strong Fire-type spread. A staple on Pokémon like Charizard and Arcanine.</li>
                            <li><strong>Rock Slide:</strong> Has a 30% flinch chance on each target, making it a gambler&apos;s dream and an opponent&apos;s nightmare.</li>
                            <li><strong>Dazzling Gleam:</strong> Solid Fairy-type spread coverage.</li>
                        </ul>

                        <h3 className="text-xl font-semibold text-zinc-900 dark:text-zinc-100 mt-6 mb-3">
                            4. Redirection and Support
                        </h3>
                        <p>
                            Redirection moves like Follow Me and Rage Powder force all single-target attacks to hit the redirector, protecting its partner. This is invaluable for setting up Trick Room, landing a free Dragon Dance, or keeping a fragile sweeper alive. Top redirectors include Amoonguss (Rage Powder + Spore), Indeedee-F (Follow Me + Psychic Surge), and Clefairy (Follow Me + Friend Guard).
                        </p>

                        <h2 className="text-2xl font-bold text-zinc-900 dark:text-zinc-100 mt-8 mb-4">
                            Top VGC 2026 Pokémon
                        </h2>
                        <div className="space-y-4 my-6">
                            <div className="p-4 bg-white dark:bg-zinc-900 rounded-lg border border-zinc-200 dark:border-zinc-800">
                                <h4 className="font-semibold text-zinc-900 dark:text-zinc-100">🔥 Incineroar</h4>
                                <p className="text-sm mt-1">The king of VGC support. Intimidate to lower Attack, Fake Out for free turns, Parting Shot for pivoting. Appears on over 40% of teams in most formats.</p>
                            </div>
                            <div className="p-4 bg-white dark:bg-zinc-900 rounded-lg border border-zinc-200 dark:border-zinc-800">
                                <h4 className="font-semibold text-zinc-900 dark:text-zinc-100">🌿 Rillaboom</h4>
                                <p className="text-sm mt-1">Grassy Surge sets Grassy Terrain, weakening Earthquake and providing passive recovery. Grassy Glide gives it priority in terrain. One of the best offensive support Pokémon.</p>
                            </div>
                            <div className="p-4 bg-white dark:bg-zinc-900 rounded-lg border border-zinc-200 dark:border-zinc-800">
                                <h4 className="font-semibold text-zinc-900 dark:text-zinc-100">💨 Tornadus</h4>
                                <p className="text-sm mt-1">Prankster Tailwind, Taunt, and Rain Dance support. Flexible and fast, with access to Bleakwind Storm for offensive presence.</p>
                            </div>
                            <div className="p-4 bg-white dark:bg-zinc-900 rounded-lg border border-zinc-200 dark:border-zinc-800">
                                <h4 className="font-semibold text-zinc-900 dark:text-zinc-100">🍄 Amoonguss</h4>
                                <p className="text-sm mt-1">The ultimate Trick Room companion. Spore puts opponents to sleep, Rage Powder redirects attacks, and Regenerator keeps it healthy throughout the game.</p>
                            </div>
                            <div className="p-4 bg-white dark:bg-zinc-900 rounded-lg border border-zinc-200 dark:border-zinc-800">
                                <h4 className="font-semibold text-zinc-900 dark:text-zinc-100">🐉 Flutter Mane</h4>
                                <p className="text-sm mt-1">Blistering Speed and Special Attack make it one of the deadliest sweepers when it is available. Dazzling Gleam and Shadow Ball provide excellent spread coverage.</p>
                            </div>
                        </div>

                        <h2 className="text-2xl font-bold text-zinc-900 dark:text-zinc-100 mt-8 mb-4">
                            Team Archetypes
                        </h2>
                        <p>
                            VGC teams generally fall into one of these archetypes:
                        </p>
                        <ul className="list-disc pl-6 space-y-3 my-4">
                            <li><strong>Hyper Offense (Tailwind / Fast):</strong> Set Tailwind early and overwhelm opponents with powerful attacks before they can adjust. Requires good lead matchup knowledge.</li>
                            <li><strong>Trick Room:</strong> Build around slow, powerful Pokémon and reverse the speed order. Requires dedicated setters and slow sweepers.</li>
                            <li><strong>Goodstuffs / Balance:</strong> A flexible team of individually strong Pokémon that can handle a variety of matchups. The most common and versatile archetype.</li>
                            <li><strong>Weather:</strong> Sun, Rain, Sand, or Snow teams that leverage weather-boosted attacks and abilities. Sun (Torkoal + Eruption) and Rain (Pelipper + Swift Swim sweepers) are the most popular.</li>
                        </ul>

                        <h2 className="text-2xl font-bold text-zinc-900 dark:text-zinc-100 mt-8 mb-4">
                            Team Preview Strategy
                        </h2>
                        <p>
                            Unlike singles where you bring all six, VGC&apos;s bring-4 mechanic means team preview is a game within the game. Develop pick-4 plans for common opposing archetypes:
                        </p>
                        <ol className="list-decimal pl-6 space-y-2 my-4">
                            <li>Identify your win condition against their team</li>
                            <li>Choose two Pokémon that form your lead core</li>
                            <li>Pick two Pokémon that handle what you expect your opponent to bring in the back</li>
                            <li>Consider what your opponent is likely to lead and have a plan B</li>
                        </ol>

                        <div className="mt-10 p-6 bg-blue-50 dark:bg-blue-950/30 rounded-xl border border-blue-200 dark:border-blue-800">
                            <h3 className="font-semibold text-zinc-900 dark:text-zinc-100 mb-2">
                                🎮 Build Your VGC Team
                            </h3>
                            <p className="text-sm mb-4">
                                Our generator supports VGC formats and creates teams optimized for doubles play, including proper spread moves, Protect usage, and speed control.
                            </p>
                            <Link
                                href="/configurar"
                                className="inline-flex items-center gap-2 px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg transition-colors text-sm"
                            >
                                Generate a VGC Team →
                            </Link>
                        </div>
                    </div>
                </article>
            </main>
        </div>
    );
}
