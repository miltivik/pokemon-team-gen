"use client";

import { useMemo } from "react";
import Image from "next/image";
import type { PokedexEntry, MoveData } from "@/lib/showdown-data";
import { getMoveData, getProperMoveName } from "@/lib/showdown-data";
import type {
    GeneratedTeamMember,
    PokemonAnalysis,
    TeamBuildPreset,
} from "@/lib/team-guide";
import { getPokemonSummary } from "@/lib/pokemon-summary";
import { getPokemonSpriteUrl } from "@/lib/pokemon-sprites";
import { useTranslation } from "@/lib/i18n";
import { getStrategicRoleLabel } from "@/lib/strategic-role-label";
import { Info } from "lucide-react";
import { ItemIcon } from "./ItemIcon";

const TYPE_BG_COLORS: Record<string, string> = {
    bug: "#92BC2C",
    dark: "#595761",
    dragon: "#0C69C8",
    electric: "#F2D94E",
    fairy: "#EE90E6",
    fighting: "#D3425F",
    fire: "#FBA54C",
    flying: "#A1BBEC",
    ghost: "#5F6DBC",
    grass: "#5FBD58",
    ground: "#DA7C4D",
    ice: "#75D0C1",
    normal: "#A0A29F",
    poison: "#B763CF",
    psychic: "#FA8581",
    rock: "#C9BB8A",
    steel: "#5695A3",
    water: "#539DDF",
};

const EMPTY_STATS = { hp: 0, atk: 0, def: 0, spa: 0, spd: 0, spe: 0 };

type PokemonCardPokemon = Partial<GeneratedTeamMember> & Partial<PokedexEntry> & {
    name: string;
    moves?: Array<MoveData | string>;
    analysis?: PokemonAnalysis;
    selectedBuildPresetId?: string;
    buildPresets?: Record<string, TeamBuildPreset>;
};

interface PokemonCardProps {
    pokemon: PokemonCardPokemon;
    onSelect?: () => void;
    onPrefetchDetails?: () => void;
}

function getMoveName(move: MoveData | string) {
    if (typeof move !== "string") return move.name;
    const data = getMoveData(move);
    return data?.name ?? getProperMoveName(move);
}

function getMoveType(move: MoveData | string) {
    if (typeof move !== "string") return move.type;
    const data = getMoveData(move);
    return data?.type;
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
        case "hp":
            return "HP";
        case "atk":
            return "Atk";
        case "def":
            return "Def";
        case "spa":
            return "SpA";
        case "spd":
            return "SpD";
        case "spe":
            return "Spe";
        default:
            return name;
    }
}

export function PokemonCard({ pokemon, onSelect, onPrefetchDetails }: PokemonCardProps) {
    const { t } = useTranslation();
    const summary = getPokemonSummary(pokemon.name);

    const displayData = useMemo(() => {
        const resolvedMoves = pokemon.moves && pokemon.moves.length > 0 ? pokemon.moves : [];
        const resolvedTypes =
            pokemon.types && pokemon.types.length > 0 ? pokemon.types : summary?.types ?? [];
        const resolvedAbilities =
            pokemon.abilities && Object.keys(pokemon.abilities).length > 0
                ? pokemon.abilities
                : summary?.abilities ?? {};

        return {
            ...pokemon,
            num: pokemon.num ?? summary?.num ?? 0,
            types: resolvedTypes,
            baseStats: pokemon.baseStats ?? summary?.baseStats ?? EMPTY_STATS,
            abilities: resolvedAbilities,
            moves: resolvedMoves,
        };
    }, [pokemon, summary]);

    if (!summary && !pokemon.baseStats && (!pokemon.types || pokemon.types.length === 0)) {
        return (
            <div className="rounded border border-red-200 bg-zinc-50 p-4 dark:bg-zinc-900">
                <p className="font-bold text-red-500">Unknown: {pokemon.name}</p>
            </div>
        );
    }

    const displayImage = getPokemonSpriteUrl(displayData);
    const displayTypes = (displayData.types || []).filter(
        (type): type is string => typeof type === "string" && type.length > 0
    );
    const stats = displayData.baseStats || EMPTY_STATS;
    const moves = displayData.moves || [];
    const bst = Object.values(stats).reduce((sum, value) => sum + value, 0);
    const currentRoleLabel =
        getStrategicRoleLabel(pokemon.analysis?.role, t) || pokemon.role || getRole(stats);

    return (
        <button
            type="button"
            aria-haspopup="dialog"
            aria-label={`Open details for ${pokemon.name}`}
            onClick={onSelect}
            onFocus={onPrefetchDetails}
            onPointerEnter={onPrefetchDetails}
            className="group relative flex h-full cursor-pointer flex-col overflow-hidden rounded-lg border border-zinc-200 bg-white p-3 text-left shadow-sm transition-all hover:z-10 hover:scale-[1.02] hover:shadow-md dark:border-zinc-800 dark:bg-zinc-900"
        >
            <div className="relative mb-1 aspect-square shrink-0 overflow-hidden rounded-md bg-zinc-100 dark:bg-zinc-800">
                <Image
                    src={displayImage}
                    alt={pokemon.name}
                    fill
                    sizes="(max-width: 640px) 44vw, (max-width: 768px) 30vw, 220px"
                    className="object-contain p-2 transition-transform group-hover:scale-110"
                />
                <div className="absolute right-1 top-1 opacity-0 transition-opacity group-hover:opacity-100">
                    <span className="inline-flex rounded bg-blue-600 px-1 py-0.5 text-[10px] font-bold text-white shadow-md">
                        <Info className="h-3 w-3" />
                    </span>
                </div>
            </div>

            <div className="flex flex-1 flex-col space-y-1">
                <div className="text-center">
                    <h3 className="text-base font-bold capitalize leading-tight text-zinc-900 dark:text-zinc-50">
                        {pokemon.name}
                    </h3>
                    <div className="mt-1 flex items-center justify-center gap-1 text-[8px] font-bold uppercase tracking-widest">
                        <span className="rounded bg-zinc-100 px-1 py-0.5 text-[7px] text-zinc-500 dark:bg-zinc-800 dark:text-zinc-400">
                            BST {bst}
                        </span>
                        <span className="rounded bg-blue-50 px-1 py-0.5 text-[7px] text-blue-600 dark:bg-blue-900/30 dark:text-blue-400">
                            {currentRoleLabel}
                        </span>
                    </div>
                </div>

                <div className="flex flex-wrap justify-center gap-1">
                    {displayTypes.map((type) => (
                        <span
                            key={type}
                            className="rounded-full px-1.5 py-0.5 text-[9px] font-bold capitalize text-white shadow-sm"
                            style={{ backgroundColor: TYPE_BG_COLORS[type.toLowerCase()] || "#999" }}
                        >
                            {t(`type.${type.toLowerCase()}`)}
                        </span>
                    ))}
                </div>

                {pokemon.item && (
                    <div className="mx-auto flex w-fit items-center justify-center gap-1 rounded border border-amber-200/50 bg-amber-50 px-1 py-0.5 text-[9px] font-medium text-zinc-600 dark:border-amber-800/30 dark:bg-amber-900/20 dark:text-zinc-400">
                        <ItemIcon item={pokemon.item} size={12} />
                        <span className="max-w-[70px] truncate">
                            {pokemon.item}
                        </span>
                    </div>
                )}

                <div className="rounded bg-zinc-100 p-1.5 text-xs dark:bg-zinc-950">
                    <p className="mb-0.5 text-[9px] font-bold uppercase text-zinc-400">
                        {t("analysis.pokemonMoves")}
                    </p>
                    <div className="grid grid-cols-2 gap-0.5">
                        {moves.length > 0 ? (
                            moves.slice(0, 4).map((move, index) => {
                                const moveName = getMoveName(move);
                                if (moveName === "Ghost" || moveName === "Fantasma") return null;

                                const moveType = getMoveType(move);

                                return (
                                    <div
                                        key={`${moveName}-${index}`}
                                        className="flex min-w-0 items-center gap-1 truncate text-[10px] text-zinc-700 dark:text-zinc-300"
                                        title={moveName}
                                    >
                                        {moveType ? (
                                            <span
                                                className="flex h-4 w-4 min-w-4 flex-shrink-0 items-center justify-center rounded-full"
                                                style={{
                                                    backgroundColor:
                                                        TYPE_BG_COLORS[moveType.toLowerCase()] || "#999",
                                                }}
                                            >
                                                <Image
                                                    src={`/icons/types/${moveType.toLowerCase()}.svg`}
                                                    alt=""
                                                    width={10}
                                                    height={10}
                                                    className="object-contain"
                                                />
                                            </span>
                                        ) : (
                                            <span className="h-1 w-1 flex-shrink-0 rounded-full bg-zinc-400" />
                                        )}
                                        <span className="truncate">{moveName}</span>
                                    </div>
                                );
                            })
                        ) : (
                            <span className="col-span-2 text-[10px] text-zinc-500 dark:text-zinc-400">
                                {t("details.moveUnavailable")}
                            </span>
                        )}
                    </div>
                </div>

                <div className="mt-auto grid grid-cols-2 gap-x-1 gap-y-0.5 rounded bg-zinc-50 p-1.5 text-[9px] dark:bg-zinc-800/50">
                    <div className="col-span-2 mb-0.5 text-center font-mono text-[8px] uppercase tracking-wider text-zinc-400">
                        {t("details.baseStats")}
                    </div>
                    {Object.entries(stats).map(([key, value]) => (
                        <div key={key} className="flex items-center justify-between">
                            <span className="text-[8px] font-medium uppercase text-zinc-500 dark:text-zinc-400">
                                {getStatLabel(key)}
                            </span>
                            <span className="text-[9px] font-bold tabular-nums text-zinc-900 dark:text-zinc-200">
                                {value}
                            </span>
                        </div>
                    ))}
                </div>
            </div>
        </button>
    );
}
