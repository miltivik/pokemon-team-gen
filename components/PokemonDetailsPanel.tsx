"use client";

import { useEffect, useRef, useState, useCallback, useMemo } from "react";
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
import { useTranslation } from "@/lib/i18n";
import type {
    GeneratedTeamMember,
    PokemonAnalysis,
    TeamBuildPreset,
} from "@/lib/team-guide";
import { ItemIcon } from "@/components/ItemIcon";
import { STRATEGIC_ROLE_DESCRIPTION_KEYS, getStrategicRoleLabel } from "@/lib/strategic-role-label";

const ALGORITHM_PRESET_ID = "__algorithm__";

type Role = "Support" | "Wall" | "Tank" | "Sweeper";

interface MoveDetail {
    name: string;
    label: string;
    type: string;
    category: string;
    basePower: number | null;
    accuracy: number | true | null;
    pp: number;
    desc: string;
}

interface ItemDetail {
    name: string;
    label: string;
    desc: string;
}

interface AbilityDetail {
    slot: string;
    name: string;
    label: string;
    desc: string;
    selected: boolean;
}

interface PokemonDetailsResponse {
    generation: number;
    spriteUrl: string;
    item: ItemDetail | null;
    abilities: AbilityDetail[];
    moves: MoveDetail[];
    availableRolePresets: string[];
    smogonUrl: string;
    currentRole: Role;
    algorithmLabel: string;
}

interface PresetResponse {
    moves: string[];
    item: string;
    ability: string;
    nature: string;
    evs: string;
    teraType: string;
    role: Role;
}

interface PresetOption {
    id: string;
    label: string;
}

interface DetailsState {
    requestKey: string | null;
    data: PokemonDetailsResponse | null;
    error: string | null;
}

type DetailedPokemon = GeneratedTeamMember & {
    moves?: Array<{ name: string } | string>;
    analysis?: PokemonAnalysis;
    buildPresets?: Record<string, TeamBuildPreset>;
};

export interface PokemonDetailsDialogProps {
    pokemon: DetailedPokemon;
    item?: string;
    format?: string;
    onUpdate?: (newMon: DetailedPokemon) => void;
    open: boolean;
    onOpenChange: (open: boolean) => void;
}

const cache = new Map<string, Promise<PokemonDetailsResponse>>();

function isRole(value: string | undefined): value is Role {
    return value === "Support" || value === "Wall" || value === "Tank" || value === "Sweeper";
}

function serializeAbilities(abilities?: Record<string, string>): string {
    return Object.entries(abilities ?? {})
        .sort(([left], [right]) => left.localeCompare(right))
        .map(([slot, ability]) => `${slot}:${ability}`)
        .join(",");
}

function getCacheKey(
    name: string,
    format: string,
    lang: string,
    moves: string[],
    item?: string,
    ability?: string,
    abilities?: Record<string, string>,
    evs?: string,
    role?: Role
): string {
    return [
        name,
        format,
        lang,
        moves.join(","),
        item ?? "",
        ability ?? "",
        serializeAbilities(abilities),
        evs ?? "",
        role ?? "",
    ].join("|");
}

function fetchPokemonDetails(
    name: string,
    format: string,
    lang: "en" | "es",
    moves: string[],
    item?: string,
    ability?: string,
    evs?: string,
    role?: Role,
    pokemonAbilities?: Record<string, string>
): Promise<PokemonDetailsResponse> {
    const cacheKey = getCacheKey(name, format, lang, moves, item, ability, pokemonAbilities, evs, role);

    if (cache.has(cacheKey)) {
        return cache.get(cacheKey)!;
    }

    const promise = (async () => {
        const response = await fetch("/api/pokemon-details", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                name,
                format,
                lang,
                moves,
                item,
                ability,
                evs,
                role,
                abilities: pokemonAbilities,
            }),
        });

        if (!response.ok) {
            throw new Error("Failed to fetch pokemon details");
        }

        return response.json();
    })().catch((error) => {
        cache.delete(cacheKey);
        throw error;
    });

    cache.set(cacheKey, promise);
    return promise;
}

const presetCache = new Map<string, Promise<PresetResponse>>();

function fetchPresetDetails(name: string, format: string, presetId: string, signal?: AbortSignal): Promise<PresetResponse> {
    const cacheKey = `preset|${name}|${format}|${presetId}`;

    if (presetCache.has(cacheKey)) {
        return presetCache.get(cacheKey)!;
    }

    const promise = (async () => {
        const params = new URLSearchParams({ name, format, presetId });
        const response = await fetch(`/api/pokemon-details/preset?${params}`, { signal });

        if (!response.ok) {
            throw new Error("Failed to fetch preset");
        }

        return response.json();
    })().catch((error) => {
        presetCache.delete(cacheKey);
        throw error;
    });

    presetCache.set(cacheKey, promise);
    return promise;
}

function getMoveNames(moves?: Array<{ name: string } | string>) {
    return (moves ?? []).map((move) => (typeof move === "string" ? move : move.name));
}

function formatMoveName(move: string) {
    return move.replace(/[-_]+/g, " ").replace(/\b\w/g, (char) => char.toUpperCase());
}

function getStrategicRoleHowToPlay(
    role: string | undefined,
    t: (key: string) => string
): string | undefined {
    if (!role) return undefined;

    const key = role.startsWith("role.") ? role : STRATEGIC_ROLE_DESCRIPTION_KEYS[role];
    if (!key) return undefined;

    const descKey = `${key}.desc`;
    const desc = t(descKey);
    return desc === descKey ? undefined : desc;
}

function getAbilitySlotLabel(slot: string, lang: string) {
    switch (slot) {
        case "0":
            return lang === "es" ? "Principal" : "Primary";
        case "1":
            return lang === "es" ? "Secundaria" : "Secondary";
        case "H":
            return lang === "es" ? "Oculta" : "Hidden";
        case "S":
            return lang === "es" ? "Especial" : "Special";
        default:
            return slot;
    }
}

function getSelectedAbilityLabel(lang: string) {
    return lang === "es" ? "Elegida" : "Selected";
}

function buildFallbackDetails(
    pokemon: DetailedPokemon,
    requestedRole: Role,
    t: (key: string) => string,
    displayItem?: string
): PokemonDetailsResponse {
    const moveNames = getMoveNames(pokemon.moves);
    const spriteUrl = pokemon.name ? `/sprites/${pokemon.name.toLowerCase()}.png` : "";

    return {
        generation: 0,
        spriteUrl,
        item: displayItem
            ? {
                name: displayItem,
                label: displayItem,
                desc: "",
            }
            : null,
        abilities: Object.entries(pokemon.abilities ?? {}).map(([slot, ability]) => ({
            slot,
            name: ability,
            label: ability,
            desc: "",
            selected: ability === pokemon.ability,
        })),
        moves: moveNames.map((moveName) => {
            return {
                name: moveName,
                label: formatMoveName(moveName),
                type: "Normal",
                category: "Status",
                basePower: null,
                accuracy: null,
                pp: 0,
                desc: "",
            };
        }),
        availableRolePresets: [],
        smogonUrl: "",
        currentRole: requestedRole,
        algorithmLabel: t("details.algorithmRecommendation"),
    };
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
    const timerRef = useRef<ReturnType<typeof setTimeout> | null>( null);

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

function DetailsSkeleton() {
    return (
        <div className="space-y-6 p-6">
            <div className="flex items-start gap-4">
                <div className="h-20 w-20 animate-pulse rounded-xl bg-zinc-200 dark:bg-zinc-800" />
                <div className="space-y-2">
                    <div className="h-6 w-32 animate-pulse rounded bg-zinc-200 dark:bg-zinc-800" />
                    <div className="flex gap-2">
                        <div className="h-5 w-16 animate-pulse rounded-full bg-zinc-200 dark:bg-zinc-800" />
                        <div className="h-5 w-16 animate-pulse rounded-full bg-zinc-200 dark:bg-zinc-800" />
                    </div>
                </div>
            </div>
            <div className="space-y-4">
                <div className="h-24 animate-pulse rounded-xl bg-zinc-200 dark:bg-zinc-800" />
                <div className="h-32 animate-pulse rounded-xl bg-zinc-200 dark:bg-zinc-800" />
            </div>
        </div>
    );
}

function getTypeColorClass(type: string): string {
    const colors: Record<string, string> = {
        normal: 'bg-zinc-400',
        fire: 'bg-orange-500',
        water: 'bg-blue-500',
        grass: 'bg-green-500',
        electric: 'bg-yellow-400',
        ice: 'bg-cyan-300',
        fighting: 'bg-red-600',
        poison: 'bg-purple-500',
        ground: 'bg-amber-600',
        flying: 'bg-indigo-300',
        psychic: 'bg-pink-500',
        bug: 'bg-lime-500',
        rock: 'bg-stone-500',
        ghost: 'bg-purple-700',
        dragon: 'bg-violet-600',
        steel: 'bg-slate-400',
        fairy: 'bg-pink-300',
        dark: 'bg-zinc-700',
    };
    return colors[type.toLowerCase()] || 'bg-zinc-400';
}

export function PokemonDetailsDialog({ pokemon, item, format, onUpdate, open, onOpenChange }: PokemonDetailsDialogProps) {
    const { t, lang } = useTranslation();
    const [detailsState, setDetailsState] = useState<DetailsState>({
        requestKey: null,
        data: null,
        error: null,
    });
    const presetAbortControllerRef = useRef<AbortController | null>(null);

    const displayItem = pokemon.item || item;
    const moveNames = useMemo(() => getMoveNames(pokemon.moves), [pokemon.moves]);
    const displayEvs = pokemon.analysis?.evs || pokemon.evs || "252 HP / 252 Atk / 4 Def";
    const displayNature = pokemon.analysis?.nature || pokemon.nature;
    const requestedRole = isRole(pokemon.role) ? pokemon.role : "Support";
    const requestKey = useMemo(
        () => getCacheKey(pokemon.name, format || "", lang, moveNames, displayItem, pokemon.ability, pokemon.abilities as Record<string, string> | undefined, displayEvs, requestedRole),
        [pokemon.name, format, lang, moveNames, displayItem, pokemon.ability, pokemon.abilities, displayEvs, requestedRole]
    );


    const fallbackDetails = useMemo(
        () => buildFallbackDetails(pokemon, requestedRole, t, displayItem),
        [pokemon, requestedRole, t, displayItem]
    );
    const currentDetails = detailsState.requestKey === requestKey ? detailsState.data : null;
    const currentError = detailsState.requestKey === requestKey ? detailsState.error : null;
    const activeDetails = currentDetails ?? fallbackDetails;
    const loading = open && currentDetails === null && currentError === null;
    const currentRole = currentDetails?.currentRole ?? requestedRole;
    const availableRolePresets = useMemo(
        () => currentDetails?.availableRolePresets ?? [],
        [currentDetails?.availableRolePresets]
    );

    const algorithmPreset = useMemo<TeamBuildPreset>(() => {
        const rawLabel = activeDetails.algorithmLabel || t("details.algorithmRecommendation");
        const strategicRoleLabel = rawLabel.startsWith("role.") ? t(rawLabel) : rawLabel;
        return pokemon.buildPresets?.[ALGORITHM_PRESET_ID] ?? {
            id: ALGORITHM_PRESET_ID,
            label: strategicRoleLabel,
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
    }, [activeDetails.algorithmLabel, currentRole, displayEvs, displayItem, displayNature, moveNames, pokemon.ability, pokemon.analysis?.howToPlay, pokemon.analysis?.role, pokemon.buildPresets, pokemon.teraType, t]);

    const inferredStrategicRole = pokemon.analysis?.primaryFunction || pokemon.analysis?.role || currentRole;
    const inferredStrategicRoleLabel = getStrategicRoleLabel(inferredStrategicRole, t);
    const strategicRoleHowToPlay = getStrategicRoleHowToPlay(inferredStrategicRole, t);

    const memberSummary =
        pokemon.analysis?.summary ||
        pokemon.analysis?.howToPlay ||
        strategicRoleHowToPlay ||
        t(getRoleDescriptionKey(currentRole));

    const preserveTips = pokemon.analysis?.preserve ?? [];
    const avoidTips = pokemon.analysis?.avoid ?? [];
    const entryPoints = pokemon.analysis?.entryPoints ?? [];
    const decisionRules = pokemon.analysis?.decisionRules ?? [];
    const primaryFunctionLabel =
        pokemon.analysis?.primaryFunction ||
        (activeDetails.algorithmLabel?.startsWith("role.") ? t(activeDetails.algorithmLabel) : activeDetails.algorithmLabel) ||
        inferredStrategicRoleLabel ||
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
                const label = rolePreset.startsWith("role.") ? t(rolePreset) : rolePreset;
                options.set(rolePreset, {
                    id: rolePreset,
                    label,
                });
            }
        });

        return Array.from(options.values());
    }, [algorithmPreset.label, availableRolePresets, pokemon.buildPresets, t]);

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
            : selectedPresetId === ALGORITHM_PRESET_ID
                ? strategicRoleHowToPlay || activeDetails.algorithmLabel || memberSummary
                : memberSummary;

    useEffect(() => {
        if (!open) {
            return;
        }

        let ignore = false;
        const langParam = lang === "en" ? "en" : "es";

        fetchPokemonDetails(
            pokemon.name,
            format || "",
            langParam,
            moveNames,
            displayItem,
            pokemon.ability,
            displayEvs,
            requestedRole,
            pokemon.abilities as Record<string, string> | undefined
        )
            .then((data) => {
                if (!ignore) {
                    setDetailsState({
                        requestKey,
                        data,
                        error: null,
                    });
                }
            })
            .catch(() => {
                if (ignore) return;
                setDetailsState({
                    requestKey,
                    data: null,
                    error: lang === "es" ? "No se pudieron cargar los detalles completos." : "Could not load full details.",
                });
            });

        return () => {
            ignore = true;
        };
    }, [open, requestKey, pokemon.name, format, lang, moveNames, displayItem, pokemon.ability, displayEvs, requestedRole, pokemon.abilities]);

    const applyPreset = useCallback((presetId: string) => {
        if (!onUpdate) return;

        const basePresets: Record<string, TeamBuildPreset> = {
            ...(pokemon.buildPresets ?? {}),
            [ALGORITHM_PRESET_ID]: pokemon.buildPresets?.[ALGORITHM_PRESET_ID] ?? algorithmPreset,
        };

        if (presetId === ALGORITHM_PRESET_ID) {
            const preset = basePresets[ALGORITHM_PRESET_ID];
            onUpdate({
                ...pokemon,
                moves: preset.moves,
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
                    howToPlay: preset.analysisHowToPlay ?? pokemon.analysis?.howToPlay,
                    summary: preset.analysisHowToPlay ?? pokemon.analysis?.summary,
                },
            });
            return;
        }

        if (basePresets[presetId]) {
            const preset = basePresets[presetId];
            onUpdate({
                ...pokemon,
                moves: preset.moves,
                item: preset.item ?? pokemon.item,
                nature: preset.nature ?? pokemon.nature,
                evs: preset.evs ?? pokemon.evs,
                ability: preset.ability ?? pokemon.ability,
                teraType: preset.teraType ?? pokemon.teraType,
                role: preset.role ?? currentRole,
                selectedBuildPresetId: presetId,
                buildPresets: basePresets,
                analysis: {
                    ...getBaseAnalysis(pokemon.analysis),
                    role: preset.analysisRole ?? preset.label,
                    nature: preset.nature ?? displayNature ?? "Serious",
                    evs: preset.evs ?? displayEvs,
                    howToPlay: preset.analysisHowToPlay ?? pokemon.analysis?.howToPlay,
                    summary: preset.analysisHowToPlay ?? pokemon.analysis?.summary,
                },
            });
            return;
        }

        if (!format) return;

        presetAbortControllerRef.current?.abort();
        const abortController = new AbortController();
        presetAbortControllerRef.current = abortController;

        fetchPresetDetails(pokemon.name, format, presetId, abortController.signal)
            .then((presetSet) => {
                if (abortController.signal.aborted) return;

                const presetRole = presetSet.role || currentRole;

                onUpdate({
                    ...pokemon,
                    moves: presetSet.moves,
                    item: presetSet.item ?? pokemon.item,
                    nature: presetSet.nature ?? pokemon.nature,
                    evs: presetSet.evs,
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
                            evs: presetSet.evs,
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
                        evs: presetSet.evs,
                        howToPlay: pokemon.analysis?.howToPlay,
                        summary: pokemon.analysis?.summary,
                    },
                });
            })
            .catch((err) => {
                if (err.name === "AbortError") return;
                console.error("Failed to fetch preset:", err);
            });
    }, [onUpdate, pokemon, algorithmPreset, currentRole, displayNature, displayEvs, format]);

    const stats = pokemon.baseStats || { hp: 0, atk: 0, def: 0, spa: 0, spd: 0, spe: 0 };
    const bst = Object.values(stats).reduce((sum, value) => sum + value, 0);
    const spriteUrl = activeDetails.spriteUrl || `/sprites/${pokemon.name.toLowerCase()}.png`;

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-5xl border-zinc-200 bg-zinc-50 p-0 text-zinc-950 dark:border-zinc-800 dark:bg-zinc-950 dark:text-zinc-50">
                <DialogTitle className="sr-only">{pokemon.name}</DialogTitle>
                <DialogDescription className="sr-only">Details for {pokemon.name}</DialogDescription>

                <div className="relative overflow-hidden rounded-t-xl bg-zinc-900 px-6 py-5 text-white">
                    <div className="absolute inset-0 opacity-20" style={{ backgroundImage: "radial-gradient(#fff 1px, transparent 1px)", backgroundSize: "16px 16px" }} />
                    {loading ? (
                        <div className="relative flex items-start justify-between gap-4">
                            <div className="flex items-start gap-4">
                                <div className="h-20 w-20 animate-pulse rounded-xl bg-white/10" />
                                <div className="space-y-2">
                                    <div className="h-4 w-24 animate-pulse rounded bg-white/20" />
                                    <div className="h-8 w-40 animate-pulse rounded bg-white/20" />
                                </div>
                            </div>
                            <div className="h-16 w-16 animate-pulse rounded bg-white/10" />
                        </div>
                    ) : (
                        <div className="relative flex items-start justify-between gap-4">
                            <div className="flex items-start gap-4">
                                <div className="relative h-20 w-20 rounded-xl border border-white/15 bg-white/10">
                                    <Image
                                        src={spriteUrl}
                                        alt={pokemon.name}
                                        fill
                                        sizes="80px"
                                        className="object-contain p-1.5"
                                    />
                                </div>
                                <div>
                                    <div className="mb-1 flex items-center gap-2 text-xs text-white/60">
                                        <span>#{String(pokemon.num ?? 0).padStart(3, "0")}</span>
                                        <Badge variant="outline" className="border-white/20 bg-white/10 text-white">
                                            Gen {activeDetails.generation || "?"}
                                        </Badge>
                                    </div>
                                    <h2 className="mb-2 text-3xl font-black capitalize">{pokemon.name}</h2>
                                    <div className="flex flex-wrap gap-2">
                                        {(pokemon.types || []).map((type) => (
                                            <Badge key={type} className={`${getTypeColorClass(type)} border-0 text-white`}>
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
                    )}
                </div>

                {loading ? (
                    <DetailsSkeleton />
                ) : (
                    <div className="grid gap-6 p-6 md:grid-cols-[1.05fr,1fr]">
                        <div className="space-y-4">
                            {currentError ? (
                                <div className="rounded-2xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-900 shadow-sm dark:border-amber-900/40 dark:bg-amber-950/30 dark:text-amber-200">
                                    {currentError}
                                </div>
                            ) : null}

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
                                        <Badge variant="outline">{selectedPresetId === ALGORITHM_PRESET_ID ? algorithmPreset.label : selectedPresetId.startsWith("role.") ? t(selectedPresetId) : selectedPresetId}</Badge>
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

                            {activeDetails.item && (
                                <div className="rounded-2xl border border-zinc-200 bg-white p-4 shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
                                    <HoverInfo title={activeDetails.item.label} description={activeDetails.item.desc}>
                                        <div className="flex items-center gap-3">
                                            <ItemIcon item={activeDetails.item.name} size={28} />
                                            <div>
                                                <div className="text-[11px] font-bold uppercase tracking-[0.15em] text-zinc-500">{t("details.heldItem")}</div>
                                                <div className="text-sm font-semibold">{activeDetails.item.label}</div>
                                            </div>
                                        </div>
                                    </HoverInfo>
                                </div>
                            )}

                            {activeDetails.smogonUrl ? (
                                <a
                                    href={activeDetails.smogonUrl}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="flex items-center justify-center gap-2 rounded-2xl border border-violet-200 bg-violet-50 p-4 shadow-sm transition-colors hover:bg-violet-100 dark:border-violet-900/30 dark:bg-violet-900/10 dark:hover:bg-violet-900/20"
                                >
                                    <svg className="h-5 w-5 text-violet-600 dark:text-violet-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                                    </svg>
                                    <span className="text-sm font-bold text-violet-700 dark:text-violet-300">
                                        {lang === "es" ? "Ver en Smogon" : "View on Smogon"}
                                    </span>
                                </a>
                            ) : null}

                            <div className="rounded-2xl border border-zinc-200 bg-white p-4 shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
                                <h4 className="mb-3 text-xs font-bold uppercase tracking-[0.18em] text-zinc-500">{t("details.abilities")}</h4>
                                <div className="flex flex-wrap gap-2">
                                    {activeDetails.abilities.map((ability) => (
                                        <HoverInfo
                                            key={ability.slot}
                                            title={ability.label}
                                            description={ability.desc}
                                        >
                                            <div
                                                className={`rounded-xl border px-3 py-2 text-sm transition-colors ${
                                                    ability.selected
                                                        ? "border-sky-400 bg-sky-50 text-sky-950 shadow-sm dark:border-sky-500/70 dark:bg-sky-500/10 dark:text-sky-100"
                                                        : "border-zinc-200 bg-zinc-50 text-zinc-900 dark:border-zinc-800 dark:bg-zinc-950/50 dark:text-zinc-100"
                                                }`}
                                            >
                                                <div className="flex items-start justify-between gap-3">
                                                    <div className="min-w-0">
                                                        <div
                                                            className={`text-[10px] font-bold uppercase tracking-[0.18em] ${
                                                                ability.selected ? "text-sky-700 dark:text-sky-300" : "text-zinc-500"
                                                            }`}
                                                        >
                                                            {getAbilitySlotLabel(ability.slot, lang)}
                                                        </div>
                                                        <div className="truncate font-semibold">
                                                            {ability.label}
                                                        </div>
                                                    </div>
                                                    {ability.selected ? (
                                                        <span className="rounded-full border border-sky-300 bg-white/80 px-2 py-0.5 text-[10px] font-bold uppercase tracking-[0.14em] text-sky-700 dark:border-sky-400/40 dark:bg-sky-950/70 dark:text-sky-200">
                                                            {getSelectedAbilityLabel(lang)}
                                                        </span>
                                                    ) : null}
                                                </div>
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
                                {activeDetails.moves.map((move, index) => {
                                    if (move.name === "Ghost" || move.label === "Ghost") return null;

                                    return (
                                        <div key={`${move.name}-${index}`} className="rounded-2xl border border-zinc-200 bg-white p-4 shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
                                            <div className="mb-2 flex items-start justify-between gap-2">
                                                <div className="text-base font-bold">{move.label}</div>
                                                <Badge className={`${getTypeColorClass(move.type)} border-0 text-white`}>
                                                    {move.type}
                                                </Badge>
                                            </div>
                                            <div className="mb-2 flex flex-wrap items-center gap-2 text-xs font-semibold text-zinc-500">
                                                <CategoryIcon category={move.category} />
                                                <span>{translateCategory(move.category, t)}</span>
                                                <span>PWR {move.basePower ?? "—"}</span>
                                                <span>ACC {move.accuracy === true ? "—" : `${move.accuracy}%`}</span>
                                                <span>PP {move.pp || "—"}</span>
                                            </div>
                                            <p className="text-xs leading-relaxed text-zinc-600 dark:text-zinc-400">
                                                {move.desc || t("details.noDesc")}
                                            </p>
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
                )}
            </DialogContent>
        </Dialog>
    );
}
