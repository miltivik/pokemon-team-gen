"use client";

import { useTranslation } from "@/lib/i18n";
import { type PokedexEntry, getPokemonData } from "@/lib/showdown-data";

interface TeamExplanationProps {
    team: PokedexEntry[];
    format: string;
}

// Analyze team composition and roles
function analyzeTeamRoles(team: PokedexEntry[]): {
    roles: Record<string, string>;
    types: string[];
    synergies: string[];
    description: { typeCount: string; topCount: string; topType: string; styleKey: string; wallCount: string };
} {
    const roles: Record<string, string> = {};
    const types: string[] = [];
    const typeCount: Record<string, number> = {};

    team.forEach((pokemon) => {
        const data = getPokemonData(pokemon.name);
        if (!data) return;

        // Collect types
        data.types.forEach((t: string) => {
            types.push(t);
            typeCount[t] = (typeCount[t] || 0) + 1;
        });

        // Analyze role based on base stats
        const { baseStats } = data;
        const totalStats = baseStats.hp + baseStats.atk + baseStats.def + baseStats.spa + baseStats.spd + baseStats.spe;

        if (baseStats.spe >= 120 && (baseStats.atk >= 100 || baseStats.spa >= 100)) {
            roles[pokemon.name] = "Sweeper";
        } else if (baseStats.hp >= 100 && (baseStats.def >= 100 || baseStats.spd >= 100)) {
            roles[pokemon.name] = "Wall";
        } else if (baseStats.spe >= 90 && totalStats < 500) {
            roles[pokemon.name] = "Pivot";
        } else if (baseStats.atk >= 100 && baseStats.spe < 80) {
            roles[pokemon.name] = "Bulky Offense";
        } else if (baseStats.spa >= 100 && baseStats.spe < 80) {
            roles[pokemon.name] = "Special Sweeper";
        } else {
            roles[pokemon.name] = "Balance";
        }
    });

    // Find synergies (type combinations that work well together)
    const synergies: string[] = [];
    const uniqueTypes = Object.keys(typeCount);

    // Common synergies
    if (typeCount["Electric"] && typeCount["Ground"]) {
        synergies.push("teamExplanation.synergy.electricGround");
    }
    if (typeCount["Fire"] && typeCount["Grass"]) {
        synergies.push("teamExplanation.synergy.fireGrass");
    }
    if (typeCount["Dragon"] && typeCount["Fairy"]) {
        synergies.push("teamExplanation.synergy.dragonFairy");
    }
    if (typeCount["Steel"] && typeCount["Fairy"]) {
        synergies.push("teamExplanation.synergy.steelFairy");
    }

    // Generate description params (translated at render time)
    const topEntry = Object.entries(typeCount).sort((a, b) => b[1] - a[1])[0];
    const description = {
        typeCount: String(uniqueTypes.length),
        topCount: String(topEntry?.[1] || 0),
        topType: topEntry?.[0] || "",
        styleKey: Object.values(roles).filter(r => r === "Sweeper").length > 2
            ? "teamExplanation.offensivePressure"
            : "teamExplanation.balancedPlay",
        wallCount: String(Object.values(roles).filter(r => r === "Wall").length),
    };

    return { roles, types, synergies, description };
}

export function TeamExplanation({ team, format }: TeamExplanationProps) {
    const { t } = useTranslation();
    const analysis = analyzeTeamRoles(team);

    return (
        <div className="bg-white dark:bg-zinc-900 p-6 rounded-xl border border-zinc-200 dark:border-zinc-800 shadow-sm">
            <h3 className="text-xl font-bold dark:text-white mb-4">🎯 {t("teamExplanation.title")}</h3>

            <p className="text-zinc-600 dark:text-zinc-300 mb-6">
                {t("teamExplanation.desc", {
                    typeCount: analysis.description.typeCount,
                    topCount: analysis.description.topCount,
                    topType: t(`type.${analysis.description.topType.toLowerCase()}`),
                    style: t(analysis.description.styleKey),
                    wallCount: analysis.description.wallCount,
                })}
            </p>

            {/* Team Roles */}
            <div className="mb-6">
                <h4 className="font-semibold dark:text-white mb-3">{t("teamExplanation.roles")}</h4>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                    {team.map((pokemon) => {
                        const role = analysis.roles[pokemon.name] || "Balance";
                        const roleColors: Record<string, string> = {
                            "Sweeper": "bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400",
                            "Wall": "bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400",
                            "Pivot": "bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-400",
                            "Bulky Offense": "bg-orange-100 dark:bg-orange-900/30 text-orange-700 dark:text-orange-400",
                            "Special Sweeper": "bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-400",
                            "Balance": "bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400",
                        };

                        return (
                            <div key={pokemon.name} className="flex items-center justify-between p-2 bg-zinc-50 dark:bg-zinc-800 rounded-lg">
                                <span className="text-sm font-medium dark:text-zinc-200 capitalize">{pokemon.name}</span>
                                <span className={`text-xs px-2 py-0.5 rounded-full ${roleColors[role] || roleColors["Balance"]}`}>
                                    {t(`teamExplanation.roleTypes.${role.toLowerCase().replace(" ", "")}`) || role}
                                </span>
                            </div>
                        );
                    })}
                </div>
            </div>

            {/* Type Coverage */}
            <div className="mb-6">
                <h4 className="font-semibold dark:text-white mb-3">{t("teamExplanation.typeCoverage")}</h4>
                <div className="flex flex-wrap gap-2">
                    {Object.entries(
                        team.reduce((acc, p) => {
                            const data = getPokemonData(p.name);
                            if (data) {
                                data.types.forEach((t: string) => {
                                    acc[t] = (acc[t] || 0) + 1;
                                });
                            }
                            return acc;
                        }, {} as Record<string, number>)
                    ).sort((a, b) => b[1] - a[1]).map(([type, count]) => (
                        <span
                            key={type}
                            className="px-3 py-1 bg-zinc-200 dark:bg-zinc-700 rounded-full text-sm dark:text-zinc-200"
                        >
                            {t(`type.${type.toLowerCase()}`)} ({count})
                        </span>
                    ))}
                </div>
            </div>

            {/* Synergies */}
            {analysis.synergies.length > 0 && (
                <div>
                    <h4 className="font-semibold dark:text-white mb-3">{t("teamExplanation.synergies")}</h4>
                    <ul className="space-y-2">
                        {analysis.synergies.map((synergy, i) => (
                            <li key={i} className="text-sm text-zinc-600 dark:text-zinc-400 flex items-center gap-2">
                                <span className="text-green-500">✓</span>
                                {t(synergy)}
                            </li>
                        ))}
                    </ul>
                </div>
            )}
        </div>
    );
}
