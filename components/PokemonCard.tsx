"use client";

import { useMemo, useState } from "react";
import dynamic from "next/dynamic";
import Image from "next/image";
import type { PokedexEntry, MoveData } from "../lib/showdown-data";
import type {
    GeneratedTeamMember,
    PokemonAnalysis,
    TeamBuildPreset,
} from "@/lib/team-guide";
import { getPokemonSummary } from "@/lib/pokemon-summary";
import { getTranslatedItemLabel, getTranslatedMoveLabel } from "@/lib/pokemon-translations";
import { getPokemonSpriteUrl } from "@/lib/pokemon-sprites";
import { ItemIcon } from "./ItemIcon";
import { useTranslation } from "@/lib/i18n";
import type { FormatId } from "@/config/formats";
import { getStrategicRoleLabel } from "@/lib/strategic-role";

const LazyPokemonDetailsDialog = dynamic(
    () => import("./PokemonDetailsPanel").then((mod) => mod.PokemonDetailsDialog),
    { ssr: false }
);

const TYPE_BG_COLORS: Record<string, string> = {
    bug: "#92BC2C", dark: "#595761", dragon: "#0C69C8", electric: "#F2D94E",
    fairy: "#EE90E6", fighting: "#D3425F", fire: "#FBA54C", flying: "#A1BBEC",
    ghost: "#5F6DBC", grass: "#5FBD58", ground: "#DA7C4D", ice: "#75D0C1",
    normal: "#A0A29F", poison: "#B763CF", psychic: "#FA8581", rock: "#C9BB8A",
    steel: "#5695A3", water: "#539DDF",
};

const EMPTY_STATS = { hp: 0, atk: 0, def: 0, spa: 0, spd: 0, spe: 0 };

type PokemonCardPokemon = Partial<GeneratedTeamMember> & Partial<PokedexEntry> & {
    name: string;
    moves?: Array<MoveData | string>;
    analysis?: PokemonAnalysis;
    selectedBuildPresetId?: string;
    buildPresets?: Record<string, TeamBuildPreset>;
};

type PokemonCardDetailsPokemon = GeneratedTeamMember;

interface PokemonCardProps {
    pokemon: PokemonCardPokemon;
    format?: FormatId | string;
    onUpdate?: (newMon: PokemonCardDetailsPokemon) => void;
}

function getMoveName(move: MoveData | string) {
    return typeof move === "string" ? move : move.name;
}

function getMoveType(move: MoveData | string) {
    return typeof move === "string" ? undefined : move.type;
}

function getRole(stats: PokedexEntry["baseStats"]) {
    const { atk, spa, spe, def, spd } = stats;
    if (spe > 100 && (atk > 100 || spa > 100)) return "Sweeper";
    if (def > 100 || spd > 100) return "Wall";
    if (Math.abs(atk - spa) < 20 && (atk > 80 || spa > 80)) return "Mixed Attacker";
    if (atk > spa + 20) return "Physical Attacker";
    if (spa > atk + 20) return "Special Attacker";
    return "Utility / Balanced";
}

function getStatLabel(name: string) {
    switch (name) {
        case "hp": return "HP";
        case "atk": return "Atk";
        case "def": return "Def";
        case "spa": return "SpA";
        case "spd": return "SpD";
        case "spe": return "Spe";
        default: return name;
    }
}

export function PokemonCard({ pokemon, format, onUpdate }: PokemonCardProps) {
    const [isDetailsOpen, setIsDetailsOpen] = useState(false);
    const [shouldLoadDetails, setShouldLoadDetails] = useState(false);
    const { t, lang } = useTranslation();
    const summary = getPokemonSummary(pokemon.name);

    const moves = useMemo(
        () => (pokemon.moves && pokemon.moves.length > 0 ? pokemon.moves : []),
        [pokemon.moves]
    );

    const displayData = useMemo(() => {
        const resolvedTypes = pokemon.types && pokemon.types.length > 0 ? pokemon.types : (summary?.types ?? []);
        const resolvedAbilities = pokemon.abilities && Object.keys(pokemon.abilities).length > 0
            ? pokemon.abilities
            : (summary?.abilities ?? {});

        return {
            ...pokemon,
            num: pokemon.num ?? summary?.num ?? 0,
            types: resolvedTypes,
            baseStats: pokemon.baseStats ?? summary?.baseStats ?? EMPTY_STATS,
            abilities: resolvedAbilities,
            moves,
        } as PokemonCardDetailsPokemon;
    }, [moves, pokemon, summary]);

    if (!summary && !pokemon.baseStats && (!pokemon.types || pokemon.types.length === 0)) {
        return (
            <div className="p-4 border rounded bg-zinc-50 dark:bg-zinc-900 border-red-200">
                <p className="text-red-500 font-bold">Unknown: {pokemon.name}</p>
            </div>
        );
    }

const displayImage = getPokemonSpriteUrl(displayData);
    const displayTypes = displayData.types || [];
    const stats = displayData.baseStats || EMPTY_STATS;
    const bst = Object.values(stats).reduce((a, b) => a + b, 0);
const currentRoleLabel =
        getStrategicRoleLabel(pokemon.analysis?.role, t) ||
        pokemon.role ||
        getRole(stats);

    const handleOpenDetails = () => {
        setShouldLoadDetails(true);
        setIsDetailsOpen(true);
    };

    return (
        <>
            <button
                type="button"
                aria-haspopup="dialog"
                aria-label={`Open details for ${pokemon.name}`}
                onClick={handleOpenDetails}
                className="relative group overflow-hidden rounded-lg border border-zinc-200 bg-white p-3 shadow-sm transition-all hover:shadow-md hover:scale-[1.02] hover:z-10 dark:border-zinc-800 dark:bg-zinc-900 flex flex-col h-full cursor-pointer text-left"
            >
                <div className="aspect-square relative mb-1 overflow-hidden rounded-md bg-zinc-100 dark:bg-zinc-800 shrink-0">
                    <Image
                        src={displayImage}
                        alt={pokemon.name}
                        fill
                        sizes="(max-width: 640px) 44vw, (max-width: 768px) 30vw, 220px"
                        className="object-contain p-2 transition-transform group-hover:scale-110"
                    />
                    <div className="absolute top-1 right-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        <span className="bg-blue-600 text-white text-[10px] px-1 py-0.5 rounded font-bold shadow-md">INFO</span>
                    </div>
                </div>

                <div className="space-y-1 flex-1 flex flex-col">
                    <div className="text-center">
                        <h3 className="text-base font-bold capitalize text-zinc-900 dark:text-zinc-50 leading-tight">
                            {pokemon.name}
                        </h3>
<div className="flex gap-1 justify-center items-center mt-1 text-[8px] font-bold uppercase tracking-widest">
                            <span className="bg-zinc-100 dark:bg-zinc-800 text-zinc-500 dark:text-zinc-400 px-1 py-0.5 rounded text-[7px]">BST {bst}</span>
                            <span className="bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 px-1 py-0.5 rounded text-[7px]">{currentRoleLabel}</span>
                        </div>
                    </div>

                    <div className="flex flex-wrap gap-1 justify-center">
                        {displayTypes.map((type) => (
                            <span
                                key={type}
                                className="px-1.5 py-0.5 text-[9px] font-bold rounded-full capitalize text-white shadow-sm"
                                style={{ backgroundColor: TYPE_BG_COLORS[type.toLowerCase()] || "#999" }}
                            >
                                {t(`type.${type.toLowerCase()}`)}
                            </span>
                        ))}
                    </div>

                    {pokemon.item && (
                        <div className="w-fit mx-auto flex items-center justify-center gap-1 text-[9px] text-zinc-600 dark:text-zinc-400 font-medium bg-amber-50 dark:bg-amber-900/20 border border-amber-200/50 dark:border-amber-800/30 rounded px-1 py-0.5">
                            <ItemIcon item={pokemon.item} size={12} />
                            <span className="truncate max-w-[70px]">{getTranslatedItemLabel(pokemon.item, lang)}</span>
                        </div>
                    )}

                    <div className="bg-zinc-100 dark:bg-zinc-950 rounded p-1.5 text-xs">
                        <p className="text-[9px] uppercase font-bold text-zinc-400 mb-0.5">Moves</p>
                        <div className="grid grid-cols-2 gap-0.5">
                            {moves.length > 0 ? moves.slice(0, 4).map((move, index) => {
                                const moveName = getMoveName(move);
                                if (moveName === "Ghost" || moveName === "Fantasma") return null;

                                const moveType = getMoveType(move);
                                const displayMoveName = getTranslatedMoveLabel(moveName, lang);

                                return (
                                    <div key={index} className="truncate text-zinc-700 dark:text-zinc-300 flex items-center gap-1 min-w-0 text-[10px]" title={displayMoveName}>
                                        {moveType ? (
                                            <span
                                                className="flex-shrink-0 rounded-full flex items-center justify-center"
                                                style={{ width: 16, height: 16, minWidth: 16, backgroundColor: TYPE_BG_COLORS[moveType.toLowerCase()] || "#999" }}
                                            >
                                                {/* eslint-disable-next-line @next/next/no-img-element */}
                                                <img src={`/icons/types/${moveType.toLowerCase()}.svg`} alt="" style={{ width: 10, height: 10, objectFit: "contain" }} />
                                            </span>
                                        ) : (
                                            <span className="w-1 h-1 rounded-full bg-zinc-400 flex-shrink-0"></span>
                                        )}
                                        <span className="truncate">{displayMoveName}</span>
                                    </div>
                                );
                            }) : (
                                <span className="col-span-2 text-[10px] text-zinc-500 dark:text-zinc-400">
                                    {t("details.moveUnavailable")}
                                </span>
                            )}
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-x-1 gap-y-0.5 text-[9px] mt-auto bg-zinc-50 dark:bg-zinc-800/50 p-1.5 rounded">
                        <div className="col-span-2 text-center text-zinc-400 text-[8px] mb-0.5 font-mono uppercase tracking-wider">
                            Base Stats
                        </div>
                        {Object.entries(stats).map(([key, value]) => (
                            <div key={key} className="flex justify-between items-center">
                                <span className="font-medium text-zinc-500 dark:text-zinc-400 uppercase text-[8px]">
                                    {getStatLabel(key)}
                                </span>
                                <span className="font-bold text-zinc-900 dark:text-zinc-200 tabular-nums text-[9px]">
                                    {value}
                                </span>
                            </div>
                        ))}
                    </div>
                </div>
            </button>

            {shouldLoadDetails && (
                <LazyPokemonDetailsDialog
                    pokemon={displayData}
                    item={pokemon.item}
                    format={format}
                    onUpdate={onUpdate}
                    open={isDetailsOpen}
                    onOpenChange={setIsDetailsOpen}
                />
            )}
        </>
    );
}
