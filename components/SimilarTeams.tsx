"use client";

import { useTranslation } from "@/lib/i18n";
import { Button } from "@/components/ui/button";
import Link from "next/link";

interface SimilarTeamsProps {
    format: string;
    teamTypes: string[];
}

// Template presets for similar teams
const SIMILAR_TEMPLATES = [
    { id: "balanced", label: "Balanced", description: "Mix of offensive and defensive Pokémon" },
    { id: "offense", label: "Hyper Offense", description: "Aggressive setup sweepers" },
    { id: "bulkyoffense", label: "Bulky Offense", description: "Offensive with defensive backbone" },
    { id: "hazardstack", label: "Hazard Stack", description: "Spikes and stealth rock focus" },
    { id: "rain", label: "Rain", description: "Drizzle + Swift Swim sweepers" },
    { id: "sun", label: "Sun", description: "Drought + Chlorophyll sweepers" },
    { id: "sand", label: "Sand", description: "Sandstorm + special defense boost" },
    { id: "screens", label: "Screens", description: "Light Screen + Reflect support" },
];

export function SimilarTeams({ format, teamTypes }: SimilarTeamsProps) {
    const { t } = useTranslation();

    // Get suggested templates based on current types
    const suggestedTemplates = SIMILAR_TEMPLATES.slice(0, 4);

    return (
        <div className="bg-white dark:bg-zinc-900 p-6 rounded-xl border border-zinc-200 dark:border-zinc-800 shadow-sm">
            <h3 className="text-xl font-bold dark:text-white mb-4">🔄 {t("similarTeams.title")}</h3>

            <p className="text-zinc-600 dark:text-zinc-300 mb-6">
                {t("similarTeams.description")}
            </p>

            {/* Similar team options */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-6">
                {suggestedTemplates.map((template) => (
                    <Link key={template.id} href={`/configurar?format=${format}&template=${template.id}`}>
                        <div className="p-4 bg-zinc-50 dark:bg-zinc-800 rounded-lg hover:bg-zinc-100 dark:hover:bg-zinc-700 transition-colors cursor-pointer border border-zinc-200 dark:border-zinc-700">
                            <h5 className="font-semibold dark:text-white">{template.label}</h5>
                            <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-1">{template.description}</p>
                        </div>
                    </Link>
                ))}
            </div>

            {/* Generate another button */}
            <div className="text-center">
                <Link href="/configurar">
                    <Button className="bg-blue-600 hover:bg-blue-700">
                        🎲 {t("similarTeams.generateAnother")}
                    </Button>
                </Link>
            </div>

            {/* Type-based suggestions */}
            {teamTypes.length > 0 && (
                <div className="mt-6 pt-6 border-t border-zinc-200 dark:border-zinc-700">
                    <h4 className="font-semibold dark:text-white mb-3">{t("similarTeams.basedOnTypes")}</h4>
                    <div className="flex flex-wrap gap-2">
                        {teamTypes.slice(0, 3).map((type) => (
                            <Link key={type} href={`/configurar?format=${format}&tipo=${type}`}>
                                <span className="px-3 py-1 bg-zinc-200 dark:bg-zinc-700 rounded-full text-sm dark:text-zinc-200 hover:bg-blue-500 hover:text-white transition-colors cursor-pointer">
                                    {type} Team
                                </span>
                            </Link>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
}
