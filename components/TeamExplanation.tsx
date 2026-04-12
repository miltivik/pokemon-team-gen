"use client";

import { Gauge, Shield, Sparkles, Swords, Target } from "lucide-react";
import { useTranslation } from "@/lib/i18n";
import type { GeneratedTeamMember, TeamGuideData } from "@/lib/team-guide";

interface TeamExplanationProps {
    team: GeneratedTeamMember[];
    format: string;
    guide: TeamGuideData | null;
}

function SummaryList({
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
    return (
        <div className="rounded-xl border border-zinc-100 bg-zinc-50 p-3 dark:border-zinc-800 dark:bg-zinc-950/50">
            <div className="mb-2 flex items-center gap-2 text-xs font-bold uppercase tracking-[0.18em] text-zinc-500">
                <Icon className="h-4 w-4" />
                {title}
            </div>
            <div className="flex flex-wrap gap-2">
                {(values.length > 0 ? values : [emptyLabel]).map((value) => (
                    <span
                        key={value}
                        className="rounded-full bg-white px-3 py-1 text-xs font-medium text-zinc-700 shadow-sm dark:bg-zinc-900 dark:text-zinc-300"
                    >
                        {value}
                    </span>
                ))}
            </div>
        </div>
    );
}

export function TeamExplanation({ team, format, guide }: TeamExplanationProps) {
    const { t } = useTranslation();

    if (!guide) {
        return null;
    }

    return (
        <div className="rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
            <div className="mb-6">
                <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-[0.18em] text-zinc-500">
                    <Gauge className="h-4 w-4" />
                    {t("analysis.quickGuide")}
                </div>
                <h3 className="mt-2 text-2xl font-bold dark:text-white">{guide.overview.identity}</h3>
                <p className="mt-3 text-sm leading-relaxed text-zinc-600 dark:text-zinc-300">
                    {guide.overview.identitySummary}
                </p>
                <p className="mt-3 text-sm leading-relaxed text-zinc-500 dark:text-zinc-400">
                    {guide.overview.planSummary}
                </p>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
                <SummaryList
                    title={t("analysis.speedControl")}
                    values={guide.overview.speedControl}
                    emptyLabel={t("analysis.noneDetected")}
                    icon={Gauge}
                />
                <SummaryList
                    title={t("analysis.winConditions")}
                    values={guide.overview.winConditions}
                    emptyLabel={t("analysis.noneDetected")}
                    icon={Target}
                />
                <SummaryList
                    title={t("analysis.hazards")}
                    values={guide.overview.hazards}
                    emptyLabel={t("analysis.noneDetected")}
                    icon={Sparkles}
                />
                <SummaryList
                    title={t("analysis.removal")}
                    values={guide.overview.removal}
                    emptyLabel={format.includes("vgc") ? t("analysis.notRelevant") : t("analysis.noneDetected")}
                    icon={Shield}
                />
            </div>

            <div className="mt-6">
                <div className="mb-3 flex items-center gap-2 text-xs font-bold uppercase tracking-[0.18em] text-zinc-500">
                    <Swords className="h-4 w-4" />
                    {t("analysis.teamRoles")}
                </div>
                <div className="grid gap-3 md:grid-cols-2">
                    {team.map((pokemon) => {
                        const memberGuide = guide.members.find((member) => member.name === pokemon.name);
                        if (!memberGuide) {
                            return null;
                        }

                        return (
                            <div
                                key={pokemon.name}
                                className="rounded-xl border border-zinc-100 bg-zinc-50 p-3 dark:border-zinc-800 dark:bg-zinc-950/50"
                            >
                                <div className="flex items-center justify-between gap-3">
                                    <div className="font-semibold dark:text-zinc-200">{pokemon.name}</div>
                                    <span className="rounded-full bg-blue-50 px-2.5 py-1 text-[11px] font-bold text-blue-700 dark:bg-blue-900/30 dark:text-blue-300">
                                        {memberGuide.primaryFunction}
                                    </span>
                                </div>
                                <p className="mt-2 text-sm leading-relaxed text-zinc-600 dark:text-zinc-400">
                                    {memberGuide.summary}
                                </p>
                            </div>
                        );
                    })}
                </div>
            </div>

            {guide.generalTips.length > 0 && (
                <div className="mt-6">
                    <div className="mb-3 flex items-center gap-2 text-xs font-bold uppercase tracking-[0.18em] text-zinc-500">
                        <Sparkles className="h-4 w-4" />
                        {t("analysis.quickTips")}
                    </div>
                    <div className="grid gap-2">
                        {guide.generalTips.slice(0, 3).map((tip) => (
                            <div
                                key={tip}
                                className="rounded-xl border border-zinc-100 bg-zinc-50 px-3 py-2 text-sm text-zinc-600 dark:border-zinc-800 dark:bg-zinc-950/50 dark:text-zinc-400"
                            >
                                {tip}
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
}
