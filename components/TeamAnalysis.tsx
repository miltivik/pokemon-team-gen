"use client";

import { FORMATS, FormatId } from "@/config/formats";
import { AdResponsive } from "@/components/monetization/Ads";
import { getPokemonSpriteUrl } from "@/lib/pokemon-sprites";
import { useTranslation } from "@/lib/i18n";
import type { GeneratedTeamMember, GamePhase, TeamGuideData } from "@/lib/team-guide";

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
    dot: "bg-rose-500",
    title: "text-rose-600 dark:text-rose-400",
    bg: "bg-rose-50 dark:bg-rose-900/10",
    border: "border-rose-200/50 dark:border-rose-800/30",
  },
  blue: {
    dot: "bg-blue-500",
    title: "text-blue-600 dark:text-blue-400",
    bg: "bg-blue-50 dark:bg-blue-900/10",
    border: "border-blue-200/50 dark:border-blue-800/30",
  },
  emerald: {
    dot: "bg-emerald-500",
    title: "text-emerald-600 dark:text-emerald-400",
    bg: "bg-emerald-50 dark:bg-emerald-900/10",
    border: "border-emerald-200/50 dark:border-emerald-800/30",
  },
};

function GuideList({
  title,
  values,
  emptyLabel,
}: {
  title: string;
  values: string[];
  emptyLabel: string;
}) {
  return (
    <div className="rounded-2xl border border-zinc-200 bg-white p-4 shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
      <div className="mb-3 text-xs font-bold uppercase tracking-[0.18em] text-zinc-500">
        {title}
      </div>
      <div className="flex flex-wrap gap-2">
        {(values.length > 0 ? values : [emptyLabel]).map((value) => (
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

function GamePhaseCard({ phase, title, description, color, t }: GamePhaseCardProps) {
  const styles = colorMap[color];

  return (
    <div className="overflow-hidden rounded-2xl border border-zinc-200 bg-white shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
      <div className={`border-b px-6 py-4 ${styles.bg} ${styles.border}`}>
        <div className="flex items-center gap-3">
          <span className={`h-3 w-3 rounded-full ${styles.dot}`} />
          <div>
            <h4 className={`text-lg font-bold ${styles.title}`}>{title}</h4>
            <p className="mt-0.5 text-sm leading-relaxed text-zinc-600 dark:text-zinc-400">
              {description}
            </p>
          </div>
        </div>
      </div>

      <div className="space-y-5 p-6">
        <div>
          <div className="mb-2 text-xs font-bold uppercase tracking-[0.18em] text-zinc-500">
            {t("analysis.summary")}
          </div>
          <p className="text-sm font-medium leading-relaxed text-zinc-700 dark:text-zinc-300">
            {phase.summary}
          </p>
        </div>

        <div className="grid gap-5 md:grid-cols-2">
          <div>
            <div className="mb-2 text-xs font-bold uppercase tracking-[0.18em] text-zinc-500">
              {t("analysis.objectives")}
            </div>
            <ul className="space-y-2">
              {phase.objectives.map((item) => (
                <li key={item} className="text-sm leading-relaxed text-zinc-600 dark:text-zinc-400">
                  {item}
                </li>
              ))}
            </ul>
          </div>

          <div>
            <div className="mb-2 text-xs font-bold uppercase tracking-[0.18em] text-zinc-500">
              {t("analysis.steps")}
            </div>
            <ol className="space-y-2">
              {phase.steps.map((step, index) => (
                <li key={step} className="flex gap-3 text-sm leading-relaxed text-zinc-600 dark:text-zinc-400">
                  <span className="inline-flex h-5 w-5 flex-shrink-0 items-center justify-center rounded-full bg-zinc-100 text-[11px] font-bold text-zinc-700 dark:bg-zinc-800 dark:text-zinc-300">
                    {index + 1}
                  </span>
                  <span>{step}</span>
                </li>
              ))}
            </ol>
          </div>
        </div>

        <div className="grid gap-5 md:grid-cols-3">
          <div>
            <div className="mb-2 text-xs font-bold uppercase tracking-[0.18em] text-zinc-500">
              {t("analysis.keyPokemon")}
            </div>
            <div className="rounded-xl border border-zinc-100 bg-zinc-50 px-3 py-2 text-sm font-semibold text-zinc-700 dark:border-zinc-800 dark:bg-zinc-950/50 dark:text-zinc-300">
              {phase.keyPokemon}
            </div>
          </div>
          <div>
            <div className="mb-2 text-xs font-bold uppercase tracking-[0.18em] text-zinc-500">
              {t("analysis.preserve")}
            </div>
            <ul className="space-y-2">
              {phase.preserve.map((item) => (
                <li key={item} className="text-sm leading-relaxed text-zinc-600 dark:text-zinc-400">
                  {item}
                </li>
              ))}
            </ul>
          </div>
          <div>
            <div className="mb-2 text-xs font-bold uppercase tracking-[0.18em] text-zinc-500">
              {t("analysis.avoid")}
            </div>
            <ul className="space-y-2">
              {phase.avoid.map((item) => (
                <li key={item} className="text-sm leading-relaxed text-zinc-600 dark:text-zinc-400">
                  {item}
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div>
          <div className="mb-2 text-xs font-bold uppercase tracking-[0.18em] text-zinc-500">
            {t("analysis.decisionRules")}
          </div>
          <div className="grid gap-2">
            {phase.decisionRules.map((rule) => (
              <div
                key={rule}
                className="rounded-xl border border-zinc-100 bg-zinc-50 px-3 py-2 text-sm text-zinc-600 dark:border-zinc-800 dark:bg-zinc-950/50 dark:text-zinc-400"
              >
                {rule}
              </div>
            ))}
          </div>
        </div>

        {phase.threats.length > 0 && (
          <div>
            <div className="mb-2 text-xs font-bold uppercase tracking-[0.18em] text-zinc-500">
              {t("analysis.threats")}
            </div>
            <div className="flex flex-wrap gap-2">
              {phase.threats.map((threat) => (
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
          <div className="text-6xl">INFO</div>
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
        <AdResponsive />
      </div>

      <section className="rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
        <div className="mb-4 flex items-center gap-2">
          <span className="h-2 w-2 rounded-full bg-blue-500" />
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
          <GuideList title={t("analysis.speedControl")} values={guide.overview.speedControl} emptyLabel={t("analysis.noneDetected")} />
          <GuideList title={t("analysis.winConditions")} values={guide.overview.winConditions} emptyLabel={t("analysis.noneDetected")} />
          <GuideList title={t("analysis.hazards")} values={guide.overview.hazards} emptyLabel={t("analysis.noneDetected")} />
          <GuideList title={t("analysis.removal")} values={guide.overview.removal} emptyLabel={format.includes("vgc") ? t("analysis.notRelevant") : t("analysis.noneDetected")} />
          <GuideList title={t("analysis.pivots")} values={guide.overview.pivots} emptyLabel={t("analysis.noneDetected")} />
          <GuideList title={t("analysis.weaknesses")} values={guide.overview.structuralWeaknesses} emptyLabel={t("analysis.noneDetected")} />
        </div>
      </section>

      <section className="space-y-4">
        <h3 className="text-xl font-bold text-center dark:text-white">{t("analysis.teamRoles")}</h3>
        <div className="grid gap-4 md:grid-cols-2">
          {team.map((pokemon) => {
            const memberGuide = guide.members.find((member) => member.name === pokemon.name);
            if (!memberGuide) return null;

            return (
              <div
                key={pokemon.name}
                className="rounded-2xl border border-zinc-200 bg-white p-5 shadow-sm dark:border-zinc-800 dark:bg-zinc-900"
              >
                <div className="flex items-start gap-3">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={getPokemonSpriteUrl(pokemon)}
                    alt={pokemon.name}
                    className="h-14 w-14 object-contain"
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
                  <div>
                    <div className="mb-2 text-xs font-bold uppercase tracking-[0.18em] text-zinc-500">
                      {t("analysis.pokemonMoves")}
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {memberGuide.keyMoves.map((move) => (
                        <span
                          key={move}
                          className="rounded-full bg-zinc-100 px-3 py-1 text-xs font-medium text-zinc-700 dark:bg-zinc-800 dark:text-zinc-300"
                        >
                          {move}
                        </span>
                      ))}
                    </div>
                  </div>
                  <div>
                    <div className="mb-2 text-xs font-bold uppercase tracking-[0.18em] text-zinc-500">
                      {t("analysis.preserve")}
                    </div>
                    <ul className="space-y-2">
                      {memberGuide.preserve.map((item) => (
                        <li key={item} className="text-sm leading-relaxed text-zinc-600 dark:text-zinc-400">
                          {item}
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>

                {memberGuide.synergyTip && (
                  <div className="mt-4 rounded-xl border border-emerald-100 bg-emerald-50 px-4 py-3 dark:border-emerald-900/30 dark:bg-emerald-900/10">
                    <div className="text-xs font-bold uppercase tracking-[0.18em] text-emerald-700 dark:text-emerald-400">
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
        <h3 className="text-center text-xl font-bold dark:text-white">{t("analysis.detailedStrategy")}</h3>
        <GamePhaseCard phase={guide.phases.early} title={t("analysis.earlyGame")} description={t("analysis.earlyGameDesc")} color="rose" t={t} />
        <GamePhaseCard phase={guide.phases.mid} title={t("analysis.midGame")} description={t("analysis.midGameDesc")} color="blue" t={t} />
        <GamePhaseCard phase={guide.phases.late} title={t("analysis.lateGame")} description={t("analysis.lateGameDesc")} color="emerald" t={t} />
      </section>

      <section className="rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
        <div className="mb-4 flex items-center gap-2">
          <span className="h-2 w-2 rounded-full bg-amber-500" />
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
                {matchup.tips.map((tip) => (
                  <li key={tip} className="text-sm leading-relaxed text-zinc-600 dark:text-zinc-400">
                    {tip}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </section>

      <section className="rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
        <div className="mb-4 flex items-center gap-2">
          <span className="h-2 w-2 rounded-full bg-emerald-500" />
          <h3 className="text-lg font-bold dark:text-white">{t("analysis.quickTips")}</h3>
        </div>
        <div className="grid gap-2">
          {guide.generalTips.map((tip) => (
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
