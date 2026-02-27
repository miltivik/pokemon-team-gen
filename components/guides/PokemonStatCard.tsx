"use client";

import { useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { getPokemonSpriteUrl } from "@/lib/showdown-data";
import { CombinedPokemonData } from "@/lib/pikalytics";
import Image from "next/image";
import { ShieldAlert, Sparkles, Sword } from "lucide-react";

export function PokemonStatCard({ data, rank }: { data: CombinedPokemonData, rank: number }) {
    const spriteUrl = useMemo(() => getPokemonSpriteUrl(data.name), [data.name]);

    return (
        <Card className="bg-white dark:bg-zinc-900/90 border-zinc-200 dark:border-zinc-800 hover:border-blue-500/50 dark:hover:border-blue-500/50 transition-colors shadow-sm overflow-hidden group">
            <CardHeader className="pb-3 relative z-10 flex flex-row items-start justify-between">
                <div className="flex items-center gap-3">
                    <div className="w-12 h-12 relative flex-shrink-0 bg-zinc-100 dark:bg-zinc-800 rounded-full flex items-center justify-center border border-zinc-200 dark:border-zinc-700">
                        <Image
                            src={spriteUrl}
                            alt={data.name}
                            fill
                            className="object-contain scale-125"
                            sizes="48px"
                            onError={(e) => {
                                (e.target as HTMLImageElement).src = 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/0.png';
                            }}
                        />
                    </div>
                    <div>
                        <CardTitle className="text-lg font-bold capitalize">{data.name}</CardTitle>
                        <div className="flex gap-2 mt-1">
                            <Badge variant="secondary" className="bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300 text-xs px-1.5 py-0">
                                {data.usage.toFixed(2)}% Uso
                            </Badge>
                            {data.winRate !== null && (
                                <Badge variant="secondary" className={`text-xs px-1.5 py-0 ${data.winRate >= 50 ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300' : 'bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-300'}`}>
                                    {data.winRate.toFixed(2)}% WR
                                </Badge>
                            )}
                        </div>
                    </div>
                </div>
            </CardHeader>
            <CardContent className="space-y-3 relative z-10">

                {/* Ability & Item */}
                <div className="grid grid-cols-2 gap-2 text-sm pt-2 border-t border-zinc-100 dark:border-zinc-800/80">
                    <div>
                        <div className="flex items-center gap-1.5 text-zinc-500 dark:text-zinc-400 mb-1 text-xs uppercase font-semibold">
                            <Sparkles className="w-3 h-3" /> Habilidad
                        </div>
                        <span className="font-medium text-zinc-800 dark:text-zinc-200 capitalize truncate block cursor-help" title={data.topAbility || "N/A"}>
                            {data.topAbility || "N/A"}
                        </span>
                    </div>
                    <div>
                        <div className="flex items-center gap-1.5 text-zinc-500 dark:text-zinc-400 mb-1 text-xs uppercase font-semibold">
                            <ShieldAlert className="w-3 h-3" /> Objeto
                        </div>
                        <span className="font-medium text-zinc-800 dark:text-zinc-200 capitalize truncate block cursor-help" title={data.topItem || "N/A"}>
                            {data.topItem || "N/A"}
                        </span>
                    </div>
                </div>

                {/* Moveseta */}
                {data.topMoves.length > 0 && (
                    <div className="pt-2 border-t border-zinc-100 dark:border-zinc-800/80">
                        <div className="flex items-center gap-1.5 text-zinc-500 dark:text-zinc-400 mb-2 text-xs uppercase font-semibold">
                            <Sword className="w-3 h-3" /> Top Movimientos
                        </div>
                        <div className="flex flex-wrap gap-1.5">
                            {data.topMoves.slice(0, 4).map(move => (
                                <Badge key={move} variant="outline" className="bg-zinc-50 dark:bg-zinc-800/50 text-zinc-700 dark:text-zinc-300 font-normal capitalize">
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
