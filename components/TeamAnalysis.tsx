"use client";

import {
    AlertTriangle,
    BookOpenText,
    BrainCircuit,
    Crosshair,
    Gauge,
    Layers3,
    Shield,
    ShieldPlus,
    Sparkles,
    Swords,
    Target,
    TimerReset,
    Zap,
} from "lucide-react";
import { FORMATS, type FormatId } from "@/config/formats";
import { AdHero } from "@/components/monetization/Ads";
import { getPokemonSpriteUrl } from "@/lib/pokemon-sprites";
import { useTranslation } from "@/lib/i18n";
import type { GamePhase, GeneratedTeamMember, TeamGuideData } from "@/lib/team-guide";

interface TeamAnalysisProps {
    team: GeneratedTeamMember[];
    guide: TeamGuideData | null;
    format: FormatId;
    onGoHome: () => void;
}

interface GamePhaseCardProps {
    phase: GamePhase;
    title: string;
    description: string;
    color: "rose" | "blue" | "emerald";
    t: (key: string) => string;
}

const colorMap = {
    rose: {
        badge: "bg-rose-100 text-rose-700 dark:bg-rose-900/20 dark:text-rose-300",
        border: "border-rose-200/50 dark:border-rose-800/30",
        surface: "bg-rose-50/60 dark:bg-rose-900/10",
        icon: Target,
    },
    blue: {
        badge: "bg-blue-100 text-blue-700 dark:bg-blue-900/20 dark:text-blue-300",
        border: "border-blue-200/50 dark:border-blue-800/30",
        surface: "bg-blue-50/60 dark:bg-blue-900/10",
        icon: Layers3,
    },
    emerald: {
        badge: "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/20 dark:text-emerald-300",
        border: "border-emerald-200/50 dark:border-emerald-800/30",
        surface: "bg-emerald-50/60 dark:bg-emerald-900/10",
        icon: Zap,
    },
};

function SummaryChips({
    title,
    values,
    emptyLabel,
    icon: Icon,
}: {
    title: string;
    values: string[];
    emptyLabel: string;
    icon: typeof Gauge;
}) {
    const entries = values.length > 0 ? values : [emptyLabel];

    return (
        <div className="rounded-2xl border border-zinc-200 bg-white p-4 shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
            <div className="mb-3 flex items-center gap-2 text-xs font-bold uppercase tracking-[0.18em] text-zinc-500">
                <Icon className="h-4 w-4" />
                {title}
            </div>
            <div className="flex flex-wrap gap-2">
                {entries.map((value) => (
                    <span
                        key={value}
                        className="rounded-full bg-zinc-100 px-3 py-1 text-xs font-medium text-zinc-700 dark:bg-zinc-800 dark:text-zinc-300"
                    >
                        {value}
                    </span>
                ))}
            </div>
        </div>
    );
}

function CompactList({
    title,
    items,
    icon: Icon,
}: {
    title: string;
    items: string[];
    icon: typeof Gauge;
}) {
    if (items.length === 0) {
        return null;
    }

    return (
        <div className="rounded-2xl border border-zinc-100 bg-zinc-50 p-4 dark:border-zinc-800 dark:bg-zinc-950/50">
            <div className="mb-3 flex items-center gap-2 text-xs font-bold uppercase tracking-[0.18em] text-zinc-500">
                <Icon className="h-4 w-4" />
                {title}
            </div>
            <ul className="space-y-2">
                {items.map((item) => (
                    <li key={item} className="flex gap-2 text-sm leading-relaxed text-zinc-600 dark:text-zinc-400">
                        <span className="mt-[7px] h-1.5 w-1.5 flex-shrink-0 rounded-full bg-zinc-400" />
                        <span>{item}</span>
                    </li>
                ))}
            </ul>
        </div>
    );
}

function GamePhaseCard({ phase, title, description, color, t }: GamePhaseCardProps) {
    const styles = colorMap[color];
    const PhaseIcon = styles.icon;

    return (
        <div className="overflow-hidden rounded-2xl border border-zinc-200 bg-white shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
            <div className={`border-b px-5 py-4 ${styles.surface} ${styles.border}`}>
                <div className="flex items-start gap-3">
                    <div className={`inline-flex h-10 w-10 items-center justify-center rounded-xl ${styles.badge}`}>
                        <PhaseIcon className="h-5 w-5" />
                    </div>
                    <div>
                        <h4 className="text-lg font-bold text-zinc-900 dark:text-white">{title}</h4>
                        <p className="mt-1 text-sm leading-relaxed text-zinc-600 dark:text-zinc-400">
                            {description}
                        </p>
                    </div>
                </div>
            </div>

            <div className="space-y-4 p-5">
                <div className="rounded-2xl border border-zinc-100 bg-zinc-50 p-4 dark:border-zinc-800 dark:bg-zinc-950/50">
                    <div className="mb-2 flex items-center gap-2 text-xs font-bold uppercase tracking-[0.18em] text-zinc-500">
                        <BookOpenText className="h-4 w-4" />
                        {t("analysis.summary")}
                    </div>
                    <p className="text-sm font-medium leading-relaxed text-zinc-700 dark:text-zinc-300">
                        {phase.summary}
                    </p>
                </div>

                <div className="grid gap-4 md:grid-cols-2">
                    <CompactList title={t("analysis.objectives")} items={phase.objectives.slice(0, 3)} icon={Target} />
                    <CompactList title={t("analysis.steps")} items={phase.steps.slice(0, 3)} icon={Layers3} />
                </div>

                <div className="grid gap-4 md:grid-cols-3">
                    <SummaryChips
                        title={t("analysis.keyPokemon")}
                        values={phase.keyPokemon ? [phase.keyPokemon] : []}
                        emptyLabel={t("analysis.noneDetected")}
                        icon={Crosshair}
                    />
                    <SummaryChips
                        title={t("analysis.preserve")}
                        values={phase.preserve.slice(0, 2)}
                        emptyLabel={t("analysis.noneDetected")}
                        icon={ShieldPlus}
                    />
                    <SummaryChips
                        title={t("analysis.avoid")}
                        values={phase.avoid.slice(0, 2)}
                        emptyLabel={t("analysis.noneDetected")}
                        icon={AlertTriangle}
                    />
                </div>

                {phase.decisionRules.length > 0 && (
                    <CompactList
                        title={t("analysis.decisionRules")}
                        items={phase.decisionRules.slice(0, 2)}
                        icon={BrainCircuit}
                    />
                )}

                {phase.threats.length > 0 && (
                    <div>
                        <div className="mb-2 flex items-center gap-2 text-xs font-bold uppercase tracking-[0.18em] text-zinc-500">
                            <AlertTriangle className="h-4 w-4" />
                            {t("analysis.threats")}
                        </div>
                        <div className="flex flex-wrap gap-2">
                            {phase.threats.slice(0, 4).map((threat) => (
                                <span
                                    key={threat}
                                    className="rounded-full bg-red-50 px-3 py-1 text-xs font-semibold text-red-700 dark:bg-red-900/20 dark:text-red-300"
                                >
                                    {threat}
                                </span>
                            ))}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}

export function TeamAnalysis({ team, guide, format, onGoHome }: TeamAnalysisProps) {
    const { t } = useTranslation();

    if (team.length === 0 || !guide) {
        return (
            <div className="flex min-h-[60vh] flex-col items-center justify-center gap-6">
                <div className="space-y-3 text-center">
                    <div className="mx-auto inline-flex h-16 w-16 items-center justify-center rounded-2xl bg-blue-100 text-blue-700 dark:bg-blue-900/20 dark:text-blue-300">
                        <BookOpenText className="h-8 w-8" />
                    </div>
                    <h2 className="text-2xl font-bold dark:text-white">{t("analysis.title")}</h2>
                    <p className="max-w-md text-zinc-500 dark:text-zinc-400">{t("analysis.noTeam")}</p>
                </div>
                <button
                    onClick={onGoHome}
                    className="rounded-lg bg-blue-600 px-6 py-2.5 font-semibold text-white transition-colors hover:bg-blue-700"
                >
                    {t("analysis.goHome")}
                </button>
            </div>
        );
    }

    return (
        <div className="mx-auto w-full max-w-5xl space-y-10">
            <div className="space-y-2 text-center">
                <h2 className="text-3xl font-bold dark:text-white">{t("analysis.title")}</h2>
                <p className="text-zinc-500 dark:text-zinc-400">
                    {t("app.format")}:{" "}
                    <span className="font-bold text-zinc-900 dark:text-zinc-200">
                        {FORMATS[format].label}
                    </span>
                </p>
            </div>

            <div className="flex w-full justify-center">
                <AdHero />
            </div>

            <section className="rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
                <div className="mb-4 flex items-center gap-2">
                    <Gauge className="h-5 w-5 text-blue-500" />
                    <h3 className="text-lg font-bold dark:text-white">{t("analysis.overview")}</h3>
                </div>
                <h4 className="text-2xl font-bold dark:text-white">{guide.overview.identity}</h4>
                <p className="mt-3 text-sm leading-relaxed text-zinc-600 dark:text-zinc-300">
                    {guide.overview.identitySummary}
                </p>
                <p className="mt-3 text-sm leading-relaxed text-zinc-500 dark:text-zinc-400">
                    {guide.overview.planSummary}
                </p>

                <div className="mt-6 grid gap-4 md:grid-cols-2">
                    <SummaryChips
                        title={t("analysis.speedControl")}
                        values={guide.overview.speedControl}
                        emptyLabel={t("analysis.noneDetected")}
                        icon={Zap}
                    />
                    <SummaryChips
                        title={t("analysis.winConditions")}
                        values={guide.overview.winConditions}
                        emptyLabel={t("analysis.noneDetected")}
                        icon={Target}
                    />
                    <SummaryChips
                        title={t("analysis.hazards")}
                        values={guide.overview.hazards}
                        emptyLabel={t("analysis.noneDetected")}
                        icon={AlertTriangle}
                    />
                    <SummaryChips
                        title={t("analysis.removal")}
                        values={guide.overview.removal}
                        emptyLabel={format.includes("vgc") ? t("analysis.notRelevant") : t("analysis.noneDetected")}
                        icon={Shield}
                    />
                    <SummaryChips
                        title={t("analysis.pivots")}
                        values={guide.overview.pivots}
                        emptyLabel={t("analysis.noneDetected")}
                        icon={Layers3}
                    />
                    <SummaryChips
                        title={t("analysis.weaknesses")}
                        values={guide.overview.structuralWeaknesses}
                        emptyLabel={t("analysis.noneDetected")}
                        icon={AlertTriangle}
                    />
                </div>
            </section>

            <section className="space-y-4">
                <div className="flex items-center justify-center gap-2">
                    <Swords className="h-5 w-5 text-violet-500" />
                    <h3 className="text-center text-xl font-bold dark:text-white">
                        {t("analysis.teamRoles")}
                    </h3>
                </div>
                <div className="grid gap-4 md:grid-cols-2">
                    {team.map((pokemon) => {
                        const memberGuide = guide.members.find((member) => member.name === pokemon.name);
                        if (!memberGuide) {
                            return null;
                        }

                        return (
                            <div
                                key={pokemon.name}
                                className="rounded-2xl border border-zinc-200 bg-white p-5 shadow-sm dark:border-zinc-800 dark:bg-zinc-900"
                            >
                                <div className="flex items-start gap-3">
                                    {/* eslint-disable-next-line @next/next/no-img-element */}
                                    <img
                                        src={getPokemonSpriteUrl(pokemon, "sprite")}
                                        alt={pokemon.name}
                                        className="h-14 w-14 object-contain"
                                        loading="lazy"
                                        decoding="async"
                                    />
                                    <div className="min-w-0 flex-1">
                                        <div className="flex flex-wrap items-center gap-2">
                                            <div className="text-lg font-bold dark:text-white">{pokemon.name}</div>
                                            <span className="rounded-full bg-blue-50 px-2.5 py-1 text-[11px] font-bold text-blue-700 dark:bg-blue-900/30 dark:text-blue-300">
                                                {memberGuide.primaryFunction}
                                            </span>
                                        </div>
                                        <p className="mt-2 text-sm leading-relaxed text-zinc-600 dark:text-zinc-400">
                                            {memberGuide.summary}
                                        </p>
                                    </div>
                                </div>

                                <div className="mt-4 grid gap-4 md:grid-cols-2">
                                    <SummaryChips
                                        title={t("analysis.pokemonMoves")}
                                        values={memberGuide.keyMoves.slice(0, 3)}
                                        emptyLabel={t("analysis.noneDetected")}
                                        icon={Swords}
                                    />
                                    <SummaryChips
                                        title={t("analysis.preserve")}
                                        values={memberGuide.preserve.slice(0, 2)}
                                        emptyLabel={t("analysis.noneDetected")}
                                        icon={ShieldPlus}
                                    />
                                </div>

                                {memberGuide.synergyTip && (
                                    <div className="mt-4 rounded-xl border border-emerald-100 bg-emerald-50 px-4 py-3 dark:border-emerald-900/30 dark:bg-emerald-900/10">
                                        <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-[0.18em] text-emerald-700 dark:text-emerald-400">
                                            <Sparkles className="h-4 w-4" />
                                            {t("analysis.synergyTip")}
                                        </div>
                                        <div className="mt-1 text-sm font-semibold text-emerald-800 dark:text-emerald-300">
                                            {memberGuide.synergyTip.headline}
                                        </div>
                                        <div className="mt-1 text-sm leading-relaxed text-emerald-700 dark:text-emerald-400">
                                            {memberGuide.synergyTip.detail}
                                        </div>
                                    </div>
                                )}
                            </div>
                        );
                    })}
                </div>
            </section>

            <section className="space-y-6">
                <div className="flex items-center justify-center gap-2">
                    <TimerReset className="h-5 w-5 text-emerald-500" />
                    <h3 className="text-center text-xl font-bold dark:text-white">
                        {t("analysis.detailedStrategy")}
                    </h3>
                </div>
                <GamePhaseCard
                    phase={guide.phases.early}
                    title={t("analysis.earlyGame")}
                    description={t("analysis.earlyGameDesc")}
                    color="rose"
                    t={t}
                />
                <GamePhaseCard
                    phase={guide.phases.mid}
                    title={t("analysis.midGame")}
                    description={t("analysis.midGameDesc")}
                    color="blue"
                    t={t}
                />
                <GamePhaseCard
                    phase={guide.phases.late}
                    title={t("analysis.lateGame")}
                    description={t("analysis.lateGameDesc")}
                    color="emerald"
                    t={t}
                />
            </section>

            <section className="rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
                <div className="mb-4 flex items-center gap-2">
                    <Crosshair className="h-5 w-5 text-amber-500" />
                    <h3 className="text-lg font-bold dark:text-white">{t("analysis.matchupTips")}</h3>
                </div>
                <div className="grid gap-4 md:grid-cols-2">
                    {guide.matchups.map((matchup) => (
                        <div
                            key={matchup.title}
                            className="rounded-2xl border border-zinc-100 bg-zinc-50 p-4 dark:border-zinc-800 dark:bg-zinc-950/50"
                        >
                            <div className="text-base font-bold dark:text-white">{matchup.title}</div>
                            <p className="mt-2 text-sm leading-relaxed text-zinc-600 dark:text-zinc-400">
                                {matchup.summary}
                            </p>
                            {matchup.keyPokemon && (
                                <div className="mt-3 text-xs font-semibold uppercase tracking-[0.18em] text-zinc-500">
                                    {t("analysis.keyPokemon")}: {matchup.keyPokemon}
                                </div>
                            )}
                            <ul className="mt-3 space-y-2">
                                {matchup.tips.slice(0, 3).map((tip) => (
                                    <li
                                        key={tip}
                                        className="flex gap-2 text-sm leading-relaxed text-zinc-600 dark:text-zinc-400"
                                    >
                                        <span className="mt-[7px] h-1.5 w-1.5 flex-shrink-0 rounded-full bg-zinc-400" />
                                        <span>{tip}</span>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    ))}
                </div>
            </section>

            <section className="rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
                <div className="mb-4 flex items-center gap-2">
                    <Sparkles className="h-5 w-5 text-emerald-500" />
                    <h3 className="text-lg font-bold dark:text-white">{t("analysis.quickTips")}</h3>
                </div>
                <div className="grid gap-2">
                    {guide.generalTips.slice(0, 4).map((tip) => (
                        <div
                            key={tip}
                            className="rounded-xl border border-zinc-100 bg-zinc-50 px-3 py-2 text-sm leading-relaxed text-zinc-600 dark:border-zinc-800 dark:bg-zinc-950/50 dark:text-zinc-400"
                        >
                            {tip}
                        </div>
                    ))}
                </div>
            </section>
        </div>
    );
}
