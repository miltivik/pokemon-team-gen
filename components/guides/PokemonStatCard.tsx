"use client";

import Image from "next/image";
import { useMemo } from "react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useTranslation } from "@/lib/i18n";
import { formatPercentage } from "@/lib/format-percent";
import { getPokemonSpriteUrl } from "@/lib/pokemon-sprites";
import type { CombinedPokemonData } from "@/lib/pikalytics";
import { Package, Sparkles, Swords, Trophy } from "lucide-react";

interface PokemonStatCardProps {
    data: CombinedPokemonData;
    rank: number;
}

function getDisplayName(name: string | undefined, rank: number) {
    const trimmed = typeof name === "string" ? name.trim() : "";
    return trimmed || `#${rank}`;
}

export function PokemonStatCard({ data, rank }: PokemonStatCardProps) {
    const { lang } = useTranslation();
    const displayName = getDisplayName(data.name, rank);
    const spriteUrl = useMemo(() => getPokemonSpriteUrl(displayName, "sprite"), [displayName]);
    const copy = {
        usage: lang === "es" ? "Uso" : "Usage",
        winRate: "WR",
        ability: lang === "es" ? "Habilidad" : "Ability",
        item: lang === "es" ? "Objeto" : "Item",
        moves: lang === "es" ? "Movimientos" : "Moves",
    };

    return (
        <Card className="group overflow-hidden border-zinc-200 bg-white shadow-sm transition-colors hover:border-blue-500/40 dark:border-zinc-800 dark:bg-zinc-900/90 dark:hover:border-blue-500/40">
            <CardHeader className="relative z-10 flex flex-row items-start justify-between gap-3 pb-3">
                <div className="flex items-center gap-3">
                    <div className="relative flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-full border border-zinc-200 bg-zinc-100 dark:border-zinc-700 dark:bg-zinc-800">
                        <Image
                            src={spriteUrl}
                            alt={displayName}
                            fill
                            className="object-contain scale-125"
                            sizes="48px"
                        />
                    </div>
                    <div className="min-w-0">
                        <CardTitle className="truncate text-lg font-bold capitalize">
                            {displayName}
                        </CardTitle>
                        <div className="mt-1 flex flex-wrap gap-2">
                            <Badge
                                variant="secondary"
                                className="bg-blue-100 px-1.5 py-0 text-xs text-blue-800 dark:bg-blue-900/30 dark:text-blue-300"
                            >
                                {formatPercentage(data.usage)} {copy.usage}
                            </Badge>
                            {data.winRate !== null && (
                                <Badge
                                    variant="secondary"
                                    className={`px-1.5 py-0 text-xs ${
                                        data.winRate >= 50
                                            ? "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300"
                                            : "bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-300"
                                    }`}
                                >
                                    {formatPercentage(data.winRate)} {copy.winRate}
                                </Badge>
                            )}
                        </div>
                    </div>
                </div>
                <div className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-zinc-100 text-zinc-600 dark:bg-zinc-800 dark:text-zinc-300">
                    <Trophy className="h-4 w-4" />
                </div>
            </CardHeader>

            <CardContent className="relative z-10 space-y-3">
                <div className="grid grid-cols-2 gap-2 border-t border-zinc-100 pt-2 text-sm dark:border-zinc-800/80">
                    <div>
                        <div className="mb-1 flex items-center gap-1.5 text-xs font-semibold uppercase text-zinc-500 dark:text-zinc-400">
                            <Sparkles className="h-3 w-3" />
                            {copy.ability}
                        </div>
                        <span
                            className="block cursor-help truncate font-medium capitalize text-zinc-800 dark:text-zinc-200"
                            title={data.topAbility || "N/A"}
                        >
                            {data.topAbility || "N/A"}
                        </span>
                    </div>
                    <div>
                        <div className="mb-1 flex items-center gap-1.5 text-xs font-semibold uppercase text-zinc-500 dark:text-zinc-400">
                            <Package className="h-3 w-3" />
                            {copy.item}
                        </div>
                        <span
                            className="block cursor-help truncate font-medium capitalize text-zinc-800 dark:text-zinc-200"
                            title={data.topItem || "N/A"}
                        >
                            {data.topItem || "N/A"}
                        </span>
                    </div>
                </div>

                {data.topMoves.length > 0 && (
                    <div className="border-t border-zinc-100 pt-2 dark:border-zinc-800/80">
                        <div className="mb-2 flex items-center gap-1.5 text-xs font-semibold uppercase text-zinc-500 dark:text-zinc-400">
                            <Swords className="h-3 w-3" />
                            {copy.moves}
                        </div>
                        <div className="flex flex-wrap gap-1.5">
                            {data.topMoves.slice(0, 4).map((move) => (
                                <Badge
                                    key={move}
                                    variant="outline"
                                    className="bg-zinc-50 font-normal capitalize text-zinc-700 dark:bg-zinc-800/50 dark:text-zinc-300"
                                >
                                    {move}
                                </Badge>
                            ))}
                        </div>
                    </div>
                )}
            </CardContent>
        </Card>
    );
}
