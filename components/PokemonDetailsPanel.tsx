"use client";

import { useMemo, useRef, useState, useCallback } from "react";
import Image from "next/image";

import { Badge } from "@/components/ui/badge";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogTitle,
} from "@/components/ui/dialog";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { detectSetRole } from "@/lib/builder/roles";
import { getAvailableRoles, getCompetitiveSetByRole } from "@/lib/competitive-sets";
import { useTranslation } from "@/lib/i18n";
import type {
    GeneratedTeamMember,
    PokemonAnalysis,
    TeamBuildPreset,
} from "@/lib/team-guide";
import {
    getAbilityDescription,
    getMoveData,
    getPokemonGeneration,
    getPokemonSpriteUrl,
    getTranslatedAbilityDesc,
    getTranslatedAbilityName,
    getTranslatedItemDesc,
    getTranslatedItemName,
    getTranslatedMoveDesc,
    getTranslatedMoveName,
    getTypeColor,
    MoveData,
    Role,
} from "@/lib/showdown-data";
import { ItemIcon } from "@/components/ItemIcon";
import { getStrategicRoleDescription, getStrategicRoleLabel } from "@/lib/strategic-role";

const ALGORITHM_PRESET_ID = "__algorithm__";

interface PresetOption {
    id: string;
    label: string;
}

type DetailedPokemon = GeneratedTeamMember & {
    moves?: Array<MoveData | string>;
    analysis?: PokemonAnalysis;
    buildPresets?: Record<string, TeamBuildPreset>;
};

interface PokemonDetailsDialogProps {
    pokemon: DetailedPokemon;
    item?: string;
    format?: string;
    onUpdate?: (newMon: DetailedPokemon) => void;
    open: boolean;
    onOpenChange: (open: boolean) => void;
}

function getMoveNames(moves?: Array<MoveData | string>) {
    return (moves ?? []).map((move) => (typeof move === "string" ? move : move.name));
}

function hydrateMoves(moves: string[]) {
    return moves.map((move) => getMoveData(move) ?? move);
}

function parseEvs(evsString?: string) {
    const evs = { hp: 0, atk: 0, def: 0, spa: 0, spd: 0, spe: 0 };
    const statMap: Record<string, keyof typeof evs> = { hp: "hp", atk: "atk", def: "def", spa: "spa", spd: "spd", spe: "spe" };

    for (const part of (evsString ?? "").split("/").map((segment) => segment.trim())) {
        const match = part.match(/^(\d+)\s+(HP|Atk|Def|SpA|SpD|Spe)$/i);
        if (!match) continue;

        const stat = statMap[match[2].toLowerCase()];
        if (!stat) continue;
        evs[stat] = Number(match[1]);
    }

    return evs;
}

function normalizeSetEvs(evs: Record<string, number>) {
    return {
        hp: evs.hp ?? 0,
        atk: evs.atk ?? 0,
        def: evs.def ?? 0,
        spa: evs.spa ?? 0,
        spd: evs.spd ?? 0,
        spe: evs.spe ?? 0,
    };
}

function formatEvs(evs: Record<string, number>) {
    const statMap: Record<string, string> = { hp: "HP", atk: "Atk", def: "Def", spa: "SpA", spd: "SpD", spe: "Spe" };
    return Object.entries(evs).filter((entry) => entry[1] > 0).map(([stat, value]) => `${value} ${statMap[stat] || stat}`).join(" / ") || "No investment";
}

function getRoleDescriptionKey(role: Role) {
    switch (role) {
        case "Sweeper":
            return "role.sweeper";
        case "Wall":
            return "role.wall";
        case "Tank":
            return "role.tank";
        default:
            return "role.support";
    }
}

function CategoryIcon({ category }: { category: string }) {
    const color =
        category === "Physical"
            ? "#e87530"
            : category === "Special"
                ? "#6890f0"
                : "#7c7c93";

    return (
        <span
            className="inline-block h-2.5 w-2.5 rounded-full"
            style={{ backgroundColor: color }}
            aria-hidden="true"
        />
    );
}

function translateCategory(category: string, tFn: (key: string) => string): string {
    const map: Record<string, string> = {
        Physical: "move.physical",
        Special: "move.special",
        Status: "move.status",
    };

    return tFn(map[category] || category);
}

function getBaseAnalysis(analysis?: PokemonAnalysis): PokemonAnalysis {
    return {
        role: analysis?.role,
        howToPlay: analysis?.howToPlay,
        evs: analysis?.evs ?? "252 HP / 252 Atk / 4 Def",
        nature: analysis?.nature ?? "Serious",
        checks: analysis?.checks ?? [],
        teammates: analysis?.teammates ?? [],
        synergyTip: analysis?.synergyTip,
        primaryFunction: analysis?.primaryFunction,
        summary: analysis?.summary,
        keyMoves: analysis?.keyMoves ?? [],
        preserve: analysis?.preserve ?? [],
        avoid: analysis?.avoid ?? [],
        entryPoints: analysis?.entryPoints ?? [],
        decisionRules: analysis?.decisionRules ?? [],
    };
}

function HoverInfo({ title, description, children }: { title: string; description?: string; children: React.ReactNode }) {
    const [open, setOpen] = useState(false);
    const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

    const handleEnter = useCallback(() => {
        if (!description) return;
        timerRef.current = setTimeout(() => setOpen(true), 250);
    }, [description]);

    const handleLeave = useCallback(() => {
        if (timerRef.current) clearTimeout(timerRef.current);
        setOpen(false);
    }, []);

    return (
        <div className="relative" onMouseEnter={handleEnter} onMouseLeave={handleLeave}>
            {children}
            {description && open && (
                <div className="absolute bottom-[calc(100%+8px)] left-0 z-50 w-72 rounded-xl bg-zinc-900 px-3 py-2 text-xs text-zinc-100 shadow-xl">
                    <div className="mb-1 font-semibold">{title}</div>
                    <div>{description}</div>
                </div>
            )}
        </div>
    );
}

export function PokemonDetailsDialog({ pokemon, item, format, onUpdate, open, onOpenChange }: PokemonDetailsDialogProps) {
    const { t, lang } = useTranslation();
    const stats = pokemon.baseStats || { hp: 0, atk: 0, def: 0, spa: 0, spd: 0, spe: 0 };
    const bst = Object.values(stats).reduce((sum, value) => sum + value, 0);
    const displayItem = pokemon.item || item;
    const displayEvs = pokemon.analysis?.evs || pokemon.evs || "252 HP / 252 Atk / 4 Def";
    const displayNature = pokemon.analysis?.nature || pokemon.nature;
    const moveNames = useMemo(() => getMoveNames(pokemon.moves), [pokemon.moves]);

    const currentRole = useMemo<Role>(() => {
        if (pokemon.role === "Support" || pokemon.role === "Wall" || pokemon.role === "Tank" || pokemon.role === "Sweeper") {
            return pokemon.role;
        }

        return detectSetRole({ moves: moveNames, evs: parseEvs(displayEvs) });
    }, [displayEvs, moveNames, pokemon.role]);

    const availableRolePresets = useMemo(() => (format ? getAvailableRoles(pokemon.name, format) : []), [format, pokemon.name]);

    const algorithmPreset = useMemo<TeamBuildPreset>(() => {
        const strategicRoleLabel = getStrategicRoleLabel(pokemon.analysis?.role, t);
        return pokemon.buildPresets?.[ALGORITHM_PRESET_ID] ?? {
            id: ALGORITHM_PRESET_ID,
            label: strategicRoleLabel ?? t("details.algorithmRecommendation"),
            source: "algorithm",
            moves: moveNames,
            item: displayItem,
            nature: displayNature,
            evs: displayEvs,
            ability: pokemon.ability,
            teraType: pokemon.teraType,
            role: currentRole,
            analysisRole: pokemon.analysis?.role,
            analysisHowToPlay: pokemon.analysis?.howToPlay,
        };
    }, [currentRole, displayEvs, displayItem, displayNature, moveNames, pokemon.ability, pokemon.analysis?.howToPlay, pokemon.analysis?.role, pokemon.buildPresets, pokemon.teraType, t]);

    const memberSummary =
        pokemon.analysis?.summary ||
        pokemon.analysis?.howToPlay ||
        getStrategicRoleDescription(pokemon.analysis?.role, t) ||
        t(getRoleDescriptionKey(currentRole));
    const preserveTips = pokemon.analysis?.preserve ?? [];
    const avoidTips = pokemon.analysis?.avoid ?? [];
    const entryPoints = pokemon.analysis?.entryPoints ?? [];
    const decisionRules = pokemon.analysis?.decisionRules ?? [];
    const primaryFunctionLabel =
        pokemon.analysis?.primaryFunction ||
        getStrategicRoleLabel(pokemon.analysis?.role, t) ||
        t(getRoleDescriptionKey(currentRole));

    const presetOptions = useMemo<PresetOption[]>(() => {
        const options = new Map<string, PresetOption>();
        options.set(ALGORITHM_PRESET_ID, {
            id: ALGORITHM_PRESET_ID,
            label: algorithmPreset.label,
        });

        Object.values(pokemon.buildPresets ?? {}).forEach((preset) => {
            if (!preset?.id || preset.id === ALGORITHM_PRESET_ID) return;
            options.set(preset.id, {
                id: preset.id,
                label: preset.label || preset.id,
            });
        });

        availableRolePresets.forEach((rolePreset) => {
            if (!options.has(rolePreset)) {
                options.set(rolePreset, {
                    id: rolePreset,
                    label: rolePreset,
                });
            }
        });

        return Array.from(options.values());
    }, [algorithmPreset.label, availableRolePresets, pokemon.buildPresets]);

    const presetOptionIds = useMemo(
        () => new Set(presetOptions.map((preset) => preset.id)),
        [presetOptions]
    );

    const selectedPresetId = useMemo(() => {
        if (pokemon.selectedBuildPresetId && presetOptionIds.has(pokemon.selectedBuildPresetId)) {
            return pokemon.selectedBuildPresetId;
        }

        if (pokemon.analysis?.role && presetOptionIds.has(pokemon.analysis.role)) {
            return pokemon.analysis.role;
        }

        return ALGORITHM_PRESET_ID;
    }, [pokemon.analysis, pokemon.selectedBuildPresetId, presetOptionIds]);

    const strategicDescription =
        selectedPresetId === ALGORITHM_PRESET_ID && pokemon.analysis?.howToPlay
            ? t(pokemon.analysis.howToPlay).replace("Synergy Tip:", `${t("analysis.synergyTip")}:`)
            : (
                selectedPresetId === ALGORITHM_PRESET_ID
                    ? getStrategicRoleDescription(pokemon.analysis?.role, t)
                    : undefined
            ) ?? t(getRoleDescriptionKey(currentRole));

    const applyPreset = (presetId: string) => {
        if (!onUpdate) return;

        const basePresets: Record<string, TeamBuildPreset> = {
            ...(pokemon.buildPresets ?? {}),
            [ALGORITHM_PRESET_ID]: pokemon.buildPresets?.[ALGORITHM_PRESET_ID] ?? algorithmPreset,
        };

        if (presetId === ALGORITHM_PRESET_ID) {
            const preset = basePresets[ALGORITHM_PRESET_ID];
            onUpdate({
                ...pokemon,
                moves: hydrateMoves(preset.moves),
                item: preset.item ?? pokemon.item,
                nature: preset.nature ?? pokemon.nature,
                evs: preset.evs ?? pokemon.evs,
                ability: preset.ability ?? pokemon.ability,
                teraType: preset.teraType,
                role: preset.role ?? currentRole,
                selectedBuildPresetId: ALGORITHM_PRESET_ID,
                buildPresets: basePresets,
                analysis: {
                    ...getBaseAnalysis(pokemon.analysis),
                    role: preset.analysisRole,
                    nature: preset.nature ?? displayNature ?? "Serious",
                    evs: preset.evs ?? displayEvs,
                    howToPlay: preset.analysisHowToPlay,
                    summary: preset.analysisHowToPlay ?? pokemon.analysis?.summary,
                },
            });
            return;
        }

        if (basePresets[presetId]) {
            const preset = basePresets[presetId];
            onUpdate({
                ...pokemon,
                moves: hydrateMoves(preset.moves),
                item: preset.item ?? pokemon.item,
                nature: preset.nature ?? pokemon.nature,
                evs: preset.evs ?? pokemon.evs,
                ability: preset.ability ?? pokemon.ability,
                teraType: preset.teraType ?? pokemon.teraType,
                role: preset.role ?? detectSetRole({ moves: preset.moves, evs: parseEvs(preset.evs) }),
                selectedBuildPresetId: presetId,
                buildPresets: basePresets,
                analysis: {
                    ...getBaseAnalysis(pokemon.analysis),
                    role: preset.analysisRole ?? preset.label,
                    nature: preset.nature ?? displayNature ?? "Serious",
                    evs: preset.evs ?? displayEvs,
                    howToPlay: preset.analysisHowToPlay,
                    summary: preset.analysisHowToPlay ?? pokemon.analysis?.summary,
                },
            });
            return;
        }

        if (!format) return;
        const presetSet = getCompetitiveSetByRole(pokemon.name, presetId, format);
        if (!presetSet) return;

        const presetEvs = formatEvs(presetSet.evs);
        const presetRole = detectSetRole({
            moves: presetSet.moves,
            evs: normalizeSetEvs(presetSet.evs),
        });

        onUpdate({
            ...pokemon,
            moves: hydrateMoves(presetSet.moves),
            item: presetSet.item ?? pokemon.item,
            nature: presetSet.nature ?? pokemon.nature,
            evs: presetEvs,
            ability: presetSet.ability ?? pokemon.ability,
            teraType: presetSet.teraType ?? pokemon.teraType,
            role: presetRole,
            selectedBuildPresetId: presetId,
            buildPresets: {
                ...basePresets,
                [presetId]: {
                    id: presetId,
                    label: presetId,
                    source: "competitive",
                    moves: presetSet.moves,
                    item: presetSet.item,
                    nature: presetSet.nature,
                    evs: presetEvs,
                    ability: presetSet.ability ?? pokemon.ability,
                    teraType: presetSet.teraType ?? pokemon.teraType,
                    role: presetRole,
                    analysisRole: presetId,
                },
            },
            analysis: {
                ...getBaseAnalysis(pokemon.analysis),
                role: presetId,
                nature: presetSet.nature,
                evs: presetEvs,
                howToPlay: undefined,
                summary: undefined,
            },
        });
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-5xl border-zinc-200 bg-zinc-50 p-0 text-zinc-950 dark:border-zinc-800 dark:bg-zinc-950 dark:text-zinc-50">
                <DialogDescription className="sr-only">Details for {pokemon.name}</DialogDescription>

                <div className="relative overflow-hidden rounded-t-xl bg-zinc-900 px-6 py-5 text-white">
                    <div className="absolute inset-0 opacity-20" style={{ backgroundImage: "radial-gradient(#fff 1px, transparent 1px)", backgroundSize: "16px 16px" }} />
                    <div className="relative flex items-start justify-between gap-4">
                        <div className="flex items-start gap-4">
                            <div className="relative h-20 w-20 rounded-xl border border-white/15 bg-white/10">
                                <Image src={getPokemonSpriteUrl(pokemon)} alt={pokemon.name} fill className="object-contain p-1.5" unoptimized />
                            </div>
                            <div>
                                <div className="mb-1 flex items-center gap-2 text-xs text-white/60">
                                    <span>#{String(pokemon.num ?? 0).padStart(3, "0")}</span>
                                    <Badge variant="outline" className="border-white/20 bg-white/10 text-white">Gen {getPokemonGeneration(pokemon.name)}</Badge>
                                </div>
                                <DialogTitle className="mb-2 text-3xl font-black capitalize">{pokemon.name}</DialogTitle>
                                <div className="flex flex-wrap gap-2">
                                    {(pokemon.types || []).map((type) => (
                                        <Badge key={type} className={`${getTypeColor(type.toLowerCase())} border-0 text-white`}>
                                            {t(`type.${type.toLowerCase()}`)}
                                        </Badge>
                                    ))}
                                </div>
                            </div>
                        </div>
                        <div className="pr-8 text-right">
                            <div className="text-xs font-semibold uppercase tracking-[0.2em] text-white/50">BST</div>
                            <div className="text-5xl font-black leading-none">{bst}</div>
                        </div>
                    </div>
                </div>

                <div className="grid gap-6 p-6 md:grid-cols-[1.05fr,1fr]">
                    <div className="space-y-4">
                        <div className="rounded-2xl border border-zinc-200 bg-white p-4 shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
                            <div className="mb-3 flex items-center justify-between gap-3">
                                <h4 className="text-xs font-bold uppercase tracking-[0.18em] text-zinc-500">{t("details.strategicRole")}</h4>
                                {presetOptions.length > 1 && onUpdate ? (
                                    <Select value={selectedPresetId} onValueChange={applyPreset}>
                                        <SelectTrigger className="h-9 min-w-[180px] border-zinc-300 text-xs font-bold uppercase dark:border-zinc-700">
                                            <SelectValue placeholder={algorithmPreset.label} />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {presetOptions.map((preset) => (
                                                <SelectItem key={preset.id} value={preset.id}>{preset.label}</SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                ) : (
                                    <Badge variant="outline">{selectedPresetId === ALGORITHM_PRESET_ID ? algorithmPreset.label : selectedPresetId}</Badge>
                                )}
                            </div>
                            <p className="text-sm font-medium leading-relaxed text-zinc-700 dark:text-zinc-300">{strategicDescription}</p>
                        </div>

                        <div className="rounded-2xl border border-zinc-200 bg-white p-4 shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
                            <div className="mb-3 text-xs font-bold uppercase tracking-[0.18em] text-zinc-500">{t("analysis.quickGuide")}</div>
                            <div className="mb-3">
                                <Badge className="border-0 bg-blue-50 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300">
                                    {primaryFunctionLabel}
                                </Badge>
                            </div>
                            <p className="text-sm leading-relaxed text-zinc-700 dark:text-zinc-300">{memberSummary}</p>
                        </div>

                        <div className="rounded-2xl border border-zinc-200 bg-white p-4 shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
                            <h4 className="mb-3 text-xs font-bold uppercase tracking-[0.18em] text-zinc-500">{t("details.recommendedBuild")}</h4>
                            <div className="mb-3 flex items-center justify-between gap-3">
                                <span className="text-xs font-semibold text-zinc-500">{t("details.nature")}</span>
                                <span className="text-sm font-bold">{displayNature ? t(`nature.${displayNature.toLowerCase()}`) : t("nature.serious")}</span>
                            </div>
                            <div className="rounded-xl border border-zinc-100 bg-zinc-50 p-3 dark:border-zinc-800 dark:bg-zinc-950/50">
                                <div className="mb-1 text-[11px] font-bold uppercase tracking-[0.15em] text-zinc-500">{t("details.evs")}</div>
                                <div className="font-mono text-sm font-bold">{displayEvs}</div>
                            </div>
                        </div>

                        {displayItem && (
                            <div className="rounded-2xl border border-zinc-200 bg-white p-4 shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
                                <HoverInfo title={getTranslatedItemName(displayItem, lang)} description={getTranslatedItemDesc(displayItem, lang)}>
                                    <div className="flex items-center gap-3">
                                        <ItemIcon item={displayItem} size={28} />
                                        <div>
                                            <div className="text-[11px] font-bold uppercase tracking-[0.15em] text-zinc-500">{t("details.heldItem")}</div>
                                            <div className="text-sm font-semibold">{getTranslatedItemName(displayItem, lang)}</div>
                                        </div>
                                    </div>
                                </HoverInfo>
                            </div>
                        )}

                        <div className="rounded-2xl border border-zinc-200 bg-white p-4 shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
                            <h4 className="mb-3 text-xs font-bold uppercase tracking-[0.18em] text-zinc-500">{t("details.abilities")}</h4>
                            <div className="flex flex-wrap gap-2">
                                {Object.entries(pokemon.abilities || {}).map(([slot, ability]) => (
                                    <HoverInfo
                                        key={slot}
                                        title={getTranslatedAbilityName(ability, lang)}
                                        description={getTranslatedAbilityDesc(ability, lang) || getAbilityDescription(ability).shortDesc || getAbilityDescription(ability).desc}
                                    >
                                        <div className="rounded-xl border border-zinc-200 bg-zinc-50 px-3 py-2 text-sm font-semibold dark:border-zinc-800 dark:bg-zinc-950/50">
                                            {getTranslatedAbilityName(ability, lang)}
                                        </div>
                                    </HoverInfo>
                                ))}
                            </div>
                        </div>

                        {(entryPoints.length > 0 || decisionRules.length > 0) && (
                            <div className="grid gap-4 sm:grid-cols-2">
                                {entryPoints.length > 0 && (
                                    <div className="rounded-2xl border border-zinc-200 bg-white p-4 shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
                                        <h4 className="mb-3 text-xs font-bold uppercase tracking-[0.18em] text-zinc-500">{t("details.entryPoints")}</h4>
                                        <div className="space-y-2">
                                            {entryPoints.map((tip, index) => (
                                                <div key={`${tip}-${index}`} className="text-sm leading-relaxed text-zinc-700 dark:text-zinc-300">
                                                    {tip}
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}

                                {decisionRules.length > 0 && (
                                    <div className="rounded-2xl border border-zinc-200 bg-white p-4 shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
                                        <h4 className="mb-3 text-xs font-bold uppercase tracking-[0.18em] text-zinc-500">{t("analysis.decisionRules")}</h4>
                                        <div className="space-y-2">
                                            {decisionRules.map((tip, index) => (
                                                <div key={`${tip}-${index}`} className="text-sm leading-relaxed text-zinc-700 dark:text-zinc-300">
                                                    {tip}
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}
                            </div>
                        )}
                    </div>

                    <div className="space-y-4">
                        <div className="grid gap-3 sm:grid-cols-2">
                            {(pokemon.moves || []).map((rawMove, index) => {
                                const move = typeof rawMove === "string" ? getMoveData(rawMove) ?? rawMove : rawMove;
                                const moveName = typeof move === "string" ? move : move.name;
                                if (moveName === "Ghost" || moveName === "Fantasma") return null;

                                        return (
                                            <div key={`${moveName}-${index}`} className="rounded-2xl border border-zinc-200 bg-white p-4 shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
                                                <div className="mb-2 flex items-start justify-between gap-2">
                                                    <div className="text-base font-bold">{getTranslatedMoveName(moveName, lang)}</div>
                                                    {typeof move !== "string" && (
                                                        <Badge className={`${getTypeColor(move.type.toLowerCase())} border-0 text-white`}>
                                                            {move.type}
                                                        </Badge>
                                                    )}
                                                </div>
                                        {typeof move !== "string" ? (
                                            <>
                                                <div className="mb-2 flex flex-wrap items-center gap-2 text-xs font-semibold text-zinc-500">
                                                    <CategoryIcon category={move.category} />
                                                    <span>{translateCategory(move.category, t)}</span>
                                                    <span>PWR {move.basePower || "—"}</span>
                                                    <span>ACC {move.accuracy === true ? "—" : `${move.accuracy}%`}</span>
                                                    <span>PP {move.pp || "—"}</span>
                                                </div>
                                                <p className="text-xs leading-relaxed text-zinc-600 dark:text-zinc-400">
                                                    {getTranslatedMoveDesc(move.name, lang) || move.shortDesc || move.desc || t("details.noDesc")}
                                                </p>
                                            </>
                                        ) : (
                                            <p className="text-xs italic text-zinc-500">{t("details.moveUnavailable")}</p>
                                        )}
                                    </div>
                                );
                            })}
                        </div>

                        <div className="rounded-2xl border border-zinc-200 bg-white p-4 shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
                            <h4 className="mb-3 text-xs font-bold uppercase tracking-[0.18em] text-zinc-500">{t("details.baseStats")}</h4>
                            <div className="space-y-2">
                                {Object.entries(stats).map(([stat, value]) => (
                                    <div key={stat} className="flex items-center gap-2">
                                        <span className="w-12 text-[11px] font-bold uppercase text-zinc-500">{stat}</span>
                                        <div className="h-2 flex-1 overflow-hidden rounded-full bg-zinc-200 dark:bg-zinc-800">
                                            <div className="h-full rounded-full bg-blue-500" style={{ width: `${Math.min(value / 2.55, 100)}%` }} />
                                        </div>
                                        <span className="w-8 text-right text-xs font-bold">{value}</span>
                                    </div>
                                ))}
                            </div>
                        </div>

                        <div className="grid gap-4 sm:grid-cols-2">
                            <div className="rounded-2xl border border-blue-200 bg-blue-50 p-4 dark:border-blue-900/30 dark:bg-blue-900/10">
                                <h4 className="mb-3 text-xs font-extrabold uppercase tracking-[0.18em] text-blue-700 dark:text-blue-400">{t("analysis.preserve")}</h4>
                                <div className="space-y-2">
                                    {preserveTips.map((tip, index) => (
                                        <div key={`${tip}-${index}`} className="text-sm leading-relaxed text-blue-800 dark:text-blue-300">{tip}</div>
                                    ))}
                                    {preserveTips.length === 0 && (
                                        <div className="text-xs italic text-blue-700/80 dark:text-blue-500">{t("analysis.noneDetected")}</div>
                                    )}
                                </div>
                            </div>

                            <div className="rounded-2xl border border-amber-200 bg-amber-50 p-4 dark:border-amber-900/30 dark:bg-amber-900/10">
                                <h4 className="mb-3 text-xs font-extrabold uppercase tracking-[0.18em] text-amber-700 dark:text-amber-400">{t("analysis.avoid")}</h4>
                                <div className="space-y-2">
                                    {avoidTips.map((tip, index) => (
                                        <div key={`${tip}-${index}`} className="text-sm leading-relaxed text-amber-800 dark:text-amber-300">{tip}</div>
                                    ))}
                                    {avoidTips.length === 0 && (
                                        <div className="text-xs italic text-amber-700/80 dark:text-amber-500">{t("analysis.noneDetected")}</div>
                                    )}
                                </div>
                            </div>
                        </div>

                        <div className="grid gap-4 sm:grid-cols-2">
                            <div className="rounded-2xl border border-green-200 bg-green-50 p-4 dark:border-green-900/30 dark:bg-green-900/10">
                                <h4 className="mb-3 text-xs font-extrabold uppercase tracking-[0.18em] text-green-700 dark:text-green-400">{t("details.bestTeammates")}</h4>
                                <div className="space-y-2">
                                    {(pokemon.analysis?.teammates || []).map((tm, index) => typeof tm === "string" ? (
                                        <div key={`${tm}-${index}`} className="text-sm font-semibold text-green-700 dark:text-green-400">{tm}</div>
                                    ) : (
                                        <div key={`${tm.name}-${tm.reason ?? "teammate"}-${index}`} className="rounded-xl border border-white/60 bg-white/80 px-3 py-2 text-sm dark:border-zinc-800 dark:bg-zinc-900/50">
                                            <div className="font-semibold">{tm.name}</div>
                                            {tm.reason && <div className="mt-1 text-xs text-zinc-600 dark:text-zinc-400">{tm.reason.split(";")[0]}</div>}
                                        </div>
                                    ))}
                                    {(!pokemon.analysis?.teammates || pokemon.analysis.teammates.length === 0) && (
                                        <div className="text-xs italic text-green-700/80 dark:text-green-500">{t("details.noSynergies")}</div>
                                    )}
                                </div>
                            </div>

                            <div className="rounded-2xl border border-red-200 bg-red-50 p-4 dark:border-red-900/30 dark:bg-red-900/10">
                                <h4 className="mb-3 text-xs font-extrabold uppercase tracking-[0.18em] text-red-700 dark:text-red-400">{t("details.threats")}</h4>
                                <div className="space-y-2">
                                    {(pokemon.analysis?.checks || [t("details.fasterThreats"), t("details.priority")]).map((check, index) => (
                                        <div key={`${check}-${index}`} className="text-sm font-semibold text-red-700 dark:text-red-400">{check}</div>
                                    ))}
                                </div>
                            </div>
                        </div>

                        {pokemon.analysis?.synergyTip && (
                            <div className="rounded-2xl border border-emerald-200 bg-emerald-50 p-4 dark:border-emerald-900/30 dark:bg-emerald-900/10">
                                <h4 className="mb-2 text-xs font-extrabold uppercase tracking-[0.18em] text-emerald-700 dark:text-emerald-400">
                                    {t("analysis.synergyTip")}
                                </h4>
                                <div className="text-sm font-semibold text-emerald-800 dark:text-emerald-300">
                                    {pokemon.analysis.synergyTip.headline}
                                </div>
                                <div className="mt-1 text-sm leading-relaxed text-emerald-700 dark:text-emerald-400">
                                    {pokemon.analysis.synergyTip.detail}
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    );
}
