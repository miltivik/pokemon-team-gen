"use client";

import { useMemo } from "react";
import Image from "next/image";
import { getPokemonData, getRandomMovesWithDetails, getTypeColor, PokedexEntry, MoveData, getPokemonSpriteUrl, getTranslatedMoveName, getTranslatedItemName, getMoveData } from "../lib/showdown-data";
import { PokemonDetailsDialog } from "./PokemonDetailsDialog";
import { ItemIcon } from "./ItemIcon";
import { useTranslation } from "@/lib/i18n";
import { FormatId } from "@/config/formats";

const TYPE_BG_COLORS: Record<string, string> = {
    bug: '#92BC2C', dark: '#595761', dragon: '#0C69C8', electric: '#F2D94E',
    fairy: '#EE90E6', fighting: '#D3425F', fire: '#FBA54C', flying: '#A1BBEC',
    ghost: '#5F6DBC', grass: '#5FBD58', ground: '#DA7C4D', ice: '#75D0C1',
    normal: '#A0A29F', poison: '#B763CF', psychic: '#FA8581', rock: '#C9BB8A',
    steel: '#5695A3', water: '#539DDF',
};

interface PokemonCardProps {
    pokemon: PokedexEntry & { moves?: MoveData[] | string[] };
    format?: FormatId | string;
    onUpdate?: (newMon: PokedexEntry) => void;
}

export function PokemonCard({ pokemon, format, onUpdate }: PokemonCardProps) {
    // If pokemon object is partial, try to fill from name, but prefer passed prop
    const name = pokemon.name;
    const data = getPokemonData(name); // fallback for static data not in instance
    const { t, lang } = useTranslation();

    // Merge instance data (like specific moves) with static data
    const displayData = { ...data, ...pokemon };

    // Stable random moves if not present (fallback) - pass to dialog
    const moves = useMemo(() => {
        if (pokemon.moves && pokemon.moves.length > 0) return pokemon.moves;
        return getRandomMovesWithDetails(name);
    }, [name, pokemon.moves]);

    // Include calculated moves in displayData for the dialog
    displayData.moves = moves;

    if (!data) return (
        <div className="p-4 border rounded bg-zinc-50 dark:bg-zinc-900 border-red-200">
            <p className="text-red-500 font-bold">Unknown: {name}</p>
        </div>
    );

    const displayImage = getPokemonSpriteUrl(displayData);
    const displayTypes = displayData.types || data.types;
    const stats = displayData.baseStats || data.baseStats;
    const bst = Object.values(stats).reduce((a: any, b: any) => a + b, 0);

    const getRole = () => {
        const { atk, spa, spe, def, spd } = stats;
        if (spe > 100 && (atk > 100 || spa > 100)) return 'Sweeper';
        if (def > 100 || spd > 100) return 'Wall';
        if (Math.abs(atk - spa) < 20 && (atk > 80 || spa > 80)) return 'Mixed Attacker';
        if (atk > spa + 20) return 'Physical Attacker';
        if (spa > atk + 20) return 'Special Attacker';
        return 'Utility / Balanced';
    };

    const getStatLabel = (name: string) => {
        switch (name) {
            case 'hp': return 'HP';
            case 'atk': return 'Atk';
            case 'def': return 'Def';
            case 'spa': return 'SpA';
            case 'spd': return 'SpD';
            case 'spe': return 'Spe';
            default: return name;
        }
    };

    return (
        <PokemonDetailsDialog pokemon={displayData} item={(pokemon as any).item} format={format} onUpdate={onUpdate}>
            <div className="relative group overflow-hidden rounded-xl border border-zinc-200 bg-white p-4 shadow-sm transition-all hover:shadow-lg hover:scale-105 hover:z-10 dark:border-zinc-800 dark:bg-zinc-900 flex flex-col h-full cursor-pointer hover:ring-2 hover:ring-blue-500/50">
                <div className="aspect-square relative mb-2 overflow-hidden rounded-lg bg-zinc-100 dark:bg-zinc-800 shrink-0">
                    <Image
                        src={displayImage}
                        alt={name}
                        fill
                        className="object-contain p-4 transition-transform group-hover:scale-110"
                        unoptimized
                    />
                    <div className="absolute top-1 right-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        <span className="bg-blue-600 text-white text-xs px-2 py-1 rounded font-bold shadow-md">INFO</span>
                    </div>
                </div>

                <div className="space-y-2 flex-1 flex flex-col">
                    <div className="text-center">
                        <h3 className="text-lg font-bold capitalize text-zinc-900 dark:text-zinc-50 leading-tight">
                            {data.name || name}
                        </h3>
                        <div className="flex gap-2 justify-center items-center mt-1 text-[10px] text-zinc-500 uppercase font-mono tracking-wider">
                            <span>BST: {bst}</span>
                            <span>•</span>
                            <span>{getRole()}</span>
                        </div>
                    </div>

                    <div className="flex flex-wrap gap-1.5 justify-center mb-1">
                        {displayTypes.map((type: string) => (
                            <span
                                key={type}
                                className={`px-2 py-0.5 text-[10px] font-bold rounded-full capitalize 
                    ${getTypeColor(type.toLowerCase())} text-white shadow-sm`}
                            >
                                {t(`type.${type.toLowerCase()}`)}
                            </span>
                        ))}
                    </div>

                    {/* Held Item */}
                    {(pokemon as any).item && (
                        <div className="flex items-center justify-center gap-1.5 text-[10px] text-zinc-600 dark:text-zinc-400 font-medium bg-amber-50 dark:bg-amber-900/20 border border-amber-200/50 dark:border-amber-800/30 rounded-md px-2 py-0.5">
                            <ItemIcon item={(pokemon as any).item} size={16} />
                            <span>{getTranslatedItemName((pokemon as any).item, lang)}</span>
                        </div>
                    )}

                    {/* Preview Moves (Simple List) */}
                    <div className="bg-zinc-100 dark:bg-zinc-950 rounded p-2 text-xs">
                        <p className="text-[10px] uppercase font-bold text-zinc-400 mb-1">Moves</p>
                        <div className="grid grid-cols-2 gap-1">
                            {moves.slice(0, 4).map((m: any, i: number) => {
                                const mName = typeof m === 'string' ? m : m.name;
                                if (mName === 'Ghost' || mName === 'Fantasma') return null;
                                const displayName = getTranslatedMoveName(mName, lang);
                                const moveType = typeof m !== 'string' ? m.type : getMoveData(m)?.type;
                                return (
                                    <div key={i} className="truncate text-zinc-700 dark:text-zinc-300 capitalize flex items-center gap-1" title={displayName}>
                                        {moveType ? (
                                            <span className="flex-shrink-0 rounded-full flex items-center justify-center"
                                                style={{ width: 20, height: 20, minWidth: 20, backgroundColor: TYPE_BG_COLORS[moveType.toLowerCase()] || '#999' }}>
                                                {/* eslint-disable-next-line @next/next/no-img-element */}
                                                <img src={`/icons/types/${moveType.toLowerCase()}.svg`} alt="" style={{ width: 12, height: 12, objectFit: 'contain' }} />
                                            </span>
                                        ) : (
                                            <span className="w-1.5 h-1.5 rounded-full bg-zinc-400 flex-shrink-0"></span>
                                        )}
                                        {displayName}
                                    </div>
                                );
                            })}
                        </div>
                    </div>

                    {/* Stats Grid */}
                    <div className="grid grid-cols-2 gap-x-2 gap-y-0.5 text-[10px] mt-auto bg-zinc-50 dark:bg-zinc-800/50 p-2 rounded-lg">
                        <div className="col-span-2 text-center text-zinc-400 text-[9px] mb-0.5 font-mono uppercase tracking-wider">
                            Base Stats
                        </div>
                        {Object.entries(stats).map(([key, value]) => (
                            <div key={key} className="flex justify-between items-center">
                                <span className="font-medium text-zinc-500 dark:text-zinc-400 uppercase">
                                    {getStatLabel(key)}
                                </span>
                                <span className="font-bold text-zinc-900 dark:text-zinc-200 tabular-nums">
                                    {value as number}
                                </span>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </PokemonDetailsDialog>
    );
}
