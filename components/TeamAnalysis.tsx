"use client";

import { useTranslation } from "@/lib/i18n";
import { type PokedexEntry, getPokemonData, getPokemonSpriteUrl } from "@/lib/showdown-data";
import { type GamePhase } from "@/lib/dynamic-builder";
import { getWeaknesses } from "@/lib/type-chart";
import { FormatId, FORMATS } from "@/config/formats";
import { AdResponsive, AdInline, AdBanner } from "@/components/monetization/Ads";

interface TeamAnalysisProps {
    team: PokedexEntry[];
    gameplan: { early: GamePhase; mid: GamePhase; late: GamePhase } | null;
    format: FormatId;
    onGoHome: () => void;
}

export function TeamAnalysis({ team, gameplan, format, onGoHome }: TeamAnalysisProps) {
    const { t } = useTranslation();

    if (team.length === 0 || !gameplan) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[60vh] gap-6">
                <div className="text-center space-y-3">
                    <div className="text-6xl">📊</div>
                    <h2 className="text-2xl font-bold dark:text-white">{t("analysis.title")}</h2>
                    <p className="text-zinc-500 dark:text-zinc-400 max-w-md">
                        {t("analysis.noTeam")}
                    </p>
                </div>
                <button
                    onClick={onGoHome}
                    className="px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg transition-colors"
                >
                    {t("analysis.goHome")}
                </button>
            </div>
        );
    }

    // Calculate team weaknesses
    const weaknessCounts: Record<string, number> = {};
    for (const mon of team) {
        const data = getPokemonData(mon.name);
        if (!data) continue;
        for (const w of getWeaknesses(data.types)) {
            weaknessCounts[w] = (weaknessCounts[w] || 0) + 1;
        }
    }
    const sortedWeaknesses = Object.entries(weaknessCounts)
        .sort((a, b) => b[1] - a[1])
        .filter(([, count]) => count >= 2);

    return (
        <div className="w-full max-w-5xl mx-auto space-y-10">
            {/* Header */}
            <div className="text-center space-y-2">
                <h2 className="text-3xl font-bold dark:text-white">{t("analysis.title")}</h2>
                <p className="text-zinc-500 dark:text-zinc-400">
                    {t("app.format")}: <span className="font-bold text-zinc-900 dark:text-zinc-200">{FORMATS[format].label}</span>
                </p>
            </div>

            {/* Ad Responsive after header - Analysis PV 1 */}
            <div className="w-full flex justify-center">
                <AdResponsive />
            </div>

            {/* Team Overview - Compact roster */}
            <section className="bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-200 dark:border-zinc-800 p-6 shadow-sm">
                <h3 className="text-lg font-bold dark:text-white mb-4 flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-blue-500" />
                    {t("analysis.teamRoles")}
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                    {team.map((mon, i) => {
                        const data = getPokemonData(mon.name);
                        return (
                            <div key={i} className="flex items-center gap-3 p-3 rounded-xl bg-zinc-50 dark:bg-zinc-800/50 border border-zinc-100 dark:border-zinc-800">
                                {/* eslint-disable-next-line @next/next/no-img-element */}
                                <img
                                    src={getPokemonSpriteUrl(data || { name: mon.name, num: 0 })}
                                    alt={mon.name}
                                    className="w-12 h-12 object-contain"
                                />
                                <div className="flex-1 min-w-0">
                                    <p className="font-bold text-sm dark:text-white truncate">{mon.name}</p>
                                    <p className="text-[11px] text-zinc-500 dark:text-zinc-400 truncate">
                                        {(mon as any).role || t("analysis.pokemonRole")}
                                    </p>
                                    <p className="text-[10px] text-zinc-400 dark:text-zinc-500 truncate">
                                        {((mon as any).moves || []).slice(0, 2).join(" / ")}
                                    </p>
                                </div>
                            </div>
                        );
                    })}
                </div>
            </section>

            {/* Detailed Strategy */}
            <section className="space-y-6">
                <h3 className="text-xl font-bold dark:text-white text-center">
                    {t("analysis.detailedStrategy")}
                </h3>

                {/* Early Game */}
                <GamePhaseCard
                    phase={gameplan.early}
                    title={t("analysis.earlyGame")}
                    description={t("analysis.earlyGameDesc")}
                    color="rose"
                    tips={[t("analysis.earlyTip1"), t("analysis.earlyTip2"), t("analysis.earlyTip3")]}
                    t={t}
                />

                {/* Mid Game */}
                <GamePhaseCard
                    phase={gameplan.mid}
                    title={t("analysis.midGame")}
                    description={t("analysis.midGameDesc")}
                    color="blue"
                    tips={[t("analysis.midTip1"), t("analysis.midTip2"), t("analysis.midTip3")]}
                    t={t}
                />

                {/* Late Game */}
                <GamePhaseCard
                    phase={gameplan.late}
                    title={t("analysis.lateGame")}
                    description={t("analysis.lateGameDesc")}
                    color="emerald"
                    tips={[t("analysis.lateTip1"), t("analysis.lateTip2"), t("analysis.lateTip3")]}
                    t={t}
                />
            </section>

            {/* Team Weaknesses */}
            {sortedWeaknesses.length > 0 && (
                <section className="bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-200 dark:border-zinc-800 p-6 shadow-sm">
                    <h3 className="text-lg font-bold dark:text-white mb-2 flex items-center gap-2">
                        <span className="w-2 h-2 rounded-full bg-red-500" />
                        {t("analysis.weaknesses")}
                    </h3>
                    <p className="text-sm text-zinc-500 dark:text-zinc-400 mb-4">{t("analysis.weaknessesDesc")}</p>
                    <div className="flex flex-wrap gap-2">
                        {sortedWeaknesses.map(([type, count]) => (
                            <span
                                key={type}
                                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-semibold bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-400 border border-red-200/50 dark:border-red-800/30"
                            >
                                {t(`type.${type.toLowerCase()}`)}
                                <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-red-100 dark:bg-red-900/40 text-red-600 dark:text-red-300">
                                    ×{count}
                                </span>
                            </span>
                        ))}
                    </div>
                </section>
            )}

            {/* General Matchup Tips */}
            <section className="bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-200 dark:border-zinc-800 p-6 shadow-sm">
                <h3 className="text-lg font-bold dark:text-white mb-4 flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-amber-500" />
                    {t("analysis.matchupTips")}
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {[
                        t("analysis.matchupTip1"),
                        t("analysis.matchupTip2"),
                        t("analysis.matchupTip3"),
                        t("analysis.matchupTip4"),
                    ].map((tip, i) => (
                        <div key={i} className="flex gap-3 p-3 rounded-xl bg-amber-50/50 dark:bg-amber-900/10 border border-amber-100 dark:border-amber-900/20">
                            <span className="text-amber-500 font-bold text-lg flex-shrink-0">💡</span>
                            <p className="text-sm text-zinc-700 dark:text-zinc-300 leading-relaxed">{tip}</p>
                        </div>
                    ))}
                </div>
            </section>
        </div>
    );
}

// ---- Sub-component for each game phase ----

const colorMap = {
    rose: {
        dot: "bg-rose-500",
        title: "text-rose-600 dark:text-rose-400",
        bg: "bg-rose-50 dark:bg-rose-900/10",
        border: "border-rose-200/50 dark:border-rose-800/30",
        bullet: "text-rose-400",
        tagBg: "bg-rose-50 dark:bg-rose-900/20",
        tagText: "text-rose-600 dark:text-rose-400",
        tagBorder: "border-rose-200/50 dark:border-rose-800/30",
        tipBg: "bg-rose-50/50 dark:bg-rose-900/10",
        tipBorder: "border-rose-100 dark:border-rose-900/20",
    },
    blue: {
        dot: "bg-blue-500",
        title: "text-blue-600 dark:text-blue-400",
        bg: "bg-blue-50 dark:bg-blue-900/10",
        border: "border-blue-200/50 dark:border-blue-800/30",
        bullet: "text-blue-400",
        tagBg: "bg-amber-50 dark:bg-amber-900/20",
        tagText: "text-amber-600 dark:text-amber-400",
        tagBorder: "border-amber-200/50 dark:border-amber-800/30",
        tipBg: "bg-blue-50/50 dark:bg-blue-900/10",
        tipBorder: "border-blue-100 dark:border-blue-900/20",
    },
    emerald: {
        dot: "bg-emerald-500",
        title: "text-emerald-600 dark:text-emerald-400",
        bg: "bg-emerald-50 dark:bg-emerald-900/10",
        border: "border-emerald-200/50 dark:border-emerald-800/30",
        bullet: "text-emerald-400",
        tagBg: "bg-red-50 dark:bg-red-900/20",
        tagText: "text-red-600 dark:text-red-400",
        tagBorder: "border-red-200/50 dark:border-red-800/30",
        tipBg: "bg-emerald-50/50 dark:bg-emerald-900/10",
        tipBorder: "border-emerald-100 dark:border-emerald-900/20",
    },
};

function GamePhaseCard({
    phase,
    title,
    description,
    color,
    tips,
    t,
}: {
    phase: GamePhase;
    title: string;
    description: string;
    color: "rose" | "blue" | "emerald";
    tips: string[];
    t: (key: string) => string;
}) {
    const c = colorMap[color];
    const keyData = getPokemonData(phase.keyPokemon);

    return (
        <div className="bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-200 dark:border-zinc-800 shadow-sm overflow-hidden">
            {/* Phase Header */}
            <div className={`px-6 py-4 ${c.bg} border-b ${c.border}`}>
                <div className="flex items-center gap-3">
                    <span className={`w-3 h-3 rounded-full ${c.dot} flex-shrink-0`} />
                    <div>
                        <h4 className={`font-bold text-lg ${c.title}`}>{title}</h4>
                        <p className="text-sm text-zinc-600 dark:text-zinc-400 mt-0.5 leading-relaxed">{description}</p>
                    </div>
                </div>
            </div>

            <div className="p-6 space-y-5">
                {/* Summary + Key Pokemon */}
                <div className="flex items-start gap-4">
                    {keyData && (
                        <div className="flex-shrink-0 flex flex-col items-center gap-1">
                            {/* eslint-disable-next-line @next/next/no-img-element */}
                            <img
                                src={getPokemonSpriteUrl(keyData)}
                                alt={phase.keyPokemon}
                                className="w-16 h-16 object-contain"
                            />
                            <span className="text-[10px] font-bold text-zinc-500 dark:text-zinc-400 uppercase tracking-wider">
                                {t("analysis.keyPokemon")}
                            </span>
                            <span className="text-xs font-bold dark:text-white">{phase.keyPokemon}</span>
                        </div>
                    )}
                    <div className="flex-1">
                        <p className="text-zinc-800 dark:text-zinc-200 font-semibold leading-relaxed">{phase.summary}</p>
                    </div>
                </div>

                {/* Action Plan */}
                {phase.steps.length > 0 && (
                    <div>
                        <h5 className="text-xs font-bold uppercase tracking-wider text-zinc-500 dark:text-zinc-400 mb-2">
                            {t("analysis.steps")}
                        </h5>
                        <ol className="space-y-2">
                            {phase.steps.map((step, i) => (
                                <li key={i} className="flex gap-3 items-start">
                                    <span className={`${c.bullet} font-bold text-sm mt-0.5 flex-shrink-0 w-5 h-5 rounded-full bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center text-[10px]`}>
                                        {i + 1}
                                    </span>
                                    <span className="text-sm text-zinc-700 dark:text-zinc-300 leading-relaxed">{step}</span>
                                </li>
                            ))}
                        </ol>
                    </div>
                )}

                {/* Threats */}
                {phase.threats.length > 0 && (
                    <div>
                        <h5 className="text-xs font-bold uppercase tracking-wider text-zinc-500 dark:text-zinc-400 mb-2">
                            {t("analysis.threats")}
                        </h5>
                        <div className="flex flex-wrap gap-1.5">
                            {phase.threats.map((threat, i) => (
                                <span
                                    key={i}
                                    className={`text-xs px-2.5 py-1 rounded-full ${c.tagBg} ${c.tagText} font-semibold border ${c.tagBorder}`}
                                >
                                    ⚠️ {threat}
                                </span>
                            ))}
                        </div>
                    </div>
                )}

                {/* Pro Tips */}
                <div>
                    <h5 className="text-xs font-bold uppercase tracking-wider text-zinc-500 dark:text-zinc-400 mb-2">
                        {t("analysis.tips")}
                    </h5>
                    <div className="space-y-2">
                        {tips.map((tip, i) => (
                            <div key={i} className={`flex gap-2.5 p-2.5 rounded-lg ${c.tipBg} border ${c.tipBorder}`}>
                                <span className="text-sm flex-shrink-0">💡</span>
                                <p className="text-xs text-zinc-600 dark:text-zinc-400 leading-relaxed">{tip}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
}
