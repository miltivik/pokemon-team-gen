"use client";

import { useState, useRef, useCallback, useMemo } from "react";
import { X, Swords, Sparkles } from "lucide-react";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
} from "@/components/ui/dialog";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import Image from "next/image";
import { getTypeColor, getAbilityDescription, MoveData, PokedexEntry, getPokemonSpriteUrl, getPokemonGeneration, getTranslatedMoveName, getTranslatedAbilityName, getTranslatedAbilityDesc, getTranslatedItemName, getTranslatedMoveDesc, getMoveData, getTranslatedItemDesc } from "../lib/showdown-data";
import { getTypeTheme } from "@/components/ui/pokemon-type-colors";
import { ItemIcon } from "./ItemIcon";
import { PokemonAnalysis } from "@/lib/poke-analysis";
import { useTranslation } from "@/lib/i18n";
import { getAvailableRoles, getCompetitiveSetByRole } from "@/lib/competitive-sets";

const TYPE_BG_COLORS: Record<string, string> = {
    bug: '#92BC2C', dark: '#595761', dragon: '#0C69C8', electric: '#F2D94E',
    fairy: '#EE90E6', fighting: '#D3425F', fire: '#FBA54C', flying: '#A1BBEC',
    ghost: '#5F6DBC', grass: '#5FBD58', ground: '#DA7C4D', ice: '#75D0C1',
    normal: '#A0A29F', poison: '#B763CF', psychic: '#FA8581', rock: '#C9BB8A',
    steel: '#5695A3', water: '#539DDF',
};

function TypeIcon({ type, size = 16 }: { type: string; size?: number }) {
    const t = type.toLowerCase();
    const bg = TYPE_BG_COLORS[t] || '#999';
    return (
        <div style={{
            width: size, height: size, borderRadius: '50%', backgroundColor: bg,
            display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
        }}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={`/icons/types/${t}.svg`} alt={t} width={size * 0.6} height={size * 0.6} style={{ display: 'block' }} />
        </div>
    );
}

function translateCategory(category: string, tFn: (key: string) => string): string {
    const map: Record<string, string> = { Physical: 'move.physical', Special: 'move.special', Status: 'move.status' };
    return tFn(map[category] || category);
}

interface PokemonDetailsDialogProps {
    pokemon: PokedexEntry & {
        moves?: MoveData[] | string[];
        analysis?: PokemonAnalysis;
    };
    item?: string;
    format?: string;
    onUpdate?: (newMon: PokedexEntry & { moves?: MoveData[] | string[]; analysis?: PokemonAnalysis; item?: string; nature?: string; evs?: string }) => void;
    children: React.ReactNode;
}

const CATEGORY_COLORS: Record<string, string> = {
    Physical: '#e87530',
    Special: '#6890f0',
    Status: '#7c7c93',
};


function CategoryIcon({ category }: { category: string }) {
    const color = CATEGORY_COLORS[category] || '#9ca3af';
    if (category === 'Physical') {
        return (
            <svg width="20" height="20" viewBox="0 0 20 20" fill="none" style={{ flexShrink: 0 }}>
                <circle cx="10" cy="10" r="5" fill={color} />
                <circle cx="10" cy="10" r="3" fill="#fff" />
                <circle cx="10" cy="10" r="1.5" fill={color} />
                <path d="M10 0 L10 5 M10 15 L10 20 M0 10 L5 10 M15 10 L20 10 M2.93 2.93 L6.46 6.46 M13.54 13.54 L17.07 17.07 M17.07 2.93 L13.54 6.46 M6.46 13.54 L2.93 17.07" stroke={color} strokeWidth="1.5" />
            </svg>
        );
    }
    if (category === 'Special') {
        return (
            <svg width="20" height="20" viewBox="0 0 20 20" fill="none" style={{ flexShrink: 0 }}>
                <circle cx="10" cy="10" r="8" stroke={color} strokeWidth="1.5" fill="none" />
                <circle cx="10" cy="10" r="5" stroke={color} strokeWidth="1.5" fill="none" />
                <circle cx="10" cy="10" r="2.5" fill={color} />
            </svg>
        );
    }
    return (
        <svg width="20" height="20" viewBox="0 0 20 20" fill="none" style={{ flexShrink: 0 }}>
            <circle cx="10" cy="10" r="7" stroke={color} strokeWidth="1.5" fill="none" />
            <path d="M4 10 Q7 6, 10 10 Q13 14, 16 10" stroke={color} strokeWidth="1.5" fill="none" />
        </svg>
    );
}

function AbilityBadge({ abilityKey, ability, labels }: { abilityKey: string; ability: string; labels: { primary: string; secondary: string; hidden: string } }) {
    const [showTooltip, setShowTooltip] = useState(false);
    const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
    const { lang } = useTranslation();

    // Get translated name and description
    const displayName = getTranslatedAbilityName(ability, lang);
    const translatedDesc = getTranslatedAbilityDesc(ability, lang);
    const abilityInfo = getAbilityDescription(ability);

    // Use translated description if available in Spanish mode, otherwise fall back to English data
    const description = (lang === 'es' && translatedDesc) ? translatedDesc : abilityInfo.shortDesc || abilityInfo.desc;

    const handleMouseEnter = useCallback(() => {
        timerRef.current = setTimeout(() => setShowTooltip(true), 300);
    }, []);

    const handleMouseLeave = useCallback(() => {
        if (timerRef.current) clearTimeout(timerRef.current);
        setShowTooltip(false);
    }, []);

    return (
        <div
            className="relative px-3 py-2 rounded-lg border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900/50 cursor-help transition-colors hover:border-zinc-300 dark:hover:border-zinc-700"
            style={{ zIndex: showTooltip ? 30 : 1 }}
            onMouseEnter={handleMouseEnter}
            onMouseLeave={handleMouseLeave}
        >
            <div className="text-[13px] font-semibold leading-tight text-zinc-700 dark:text-zinc-200">{displayName}</div>
            <div className="text-[10px] text-zinc-400 font-medium uppercase tracking-[0.08em] mt-0.5">
                {abilityKey === 'H' ? labels.hidden : abilityKey === '0' ? labels.primary : labels.secondary}
            </div>
            {description && showTooltip && (
                <div
                    className="absolute bottom-[calc(100%+8px)] -left-1 w-[260px] p-3.5 rounded-xl bg-zinc-800 dark:bg-zinc-700 text-zinc-200 text-xs leading-relaxed shadow-xl z-[100] pointer-events-none"
                >
                    {description}
                    <div className="absolute -bottom-1.5 left-6 w-2.5 h-2.5 bg-zinc-800 dark:bg-zinc-700 rotate-45" />
                </div>
            )}
        </div>
    );
}

function ItemBadge({ item, label }: { item: string; label: string }) {
    const [showTooltip, setShowTooltip] = useState(false);
    const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
    const { lang } = useTranslation();

    const displayName = getTranslatedItemName(item, lang);
    const description = getTranslatedItemDesc(item, lang);

    const handleMouseEnter = useCallback(() => {
        timerRef.current = setTimeout(() => setShowTooltip(true), 300);
    }, []);

    const handleMouseLeave = useCallback(() => {
        if (timerRef.current) clearTimeout(timerRef.current);
        setShowTooltip(false);
    }, []);

    return (
        <div
            className="relative flex items-center gap-2.5 z-10"
            style={{ cursor: description ? 'help' : 'default', zIndex: showTooltip ? 30 : 1 }}
            onMouseEnter={handleMouseEnter}
            onMouseLeave={handleMouseLeave}
        >
            <ItemIcon item={item} size={28} />
            <div>
                <h4 className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider mb-0.5">{label}</h4>
                <div className="text-sm font-semibold text-zinc-700 dark:text-zinc-200">{displayName}</div>
            </div>
            {description && showTooltip && (
                <div className="absolute bottom-[calc(100%+8px)] -left-1 w-[280px] p-3.5 rounded-xl bg-zinc-800 dark:bg-zinc-700 text-zinc-200 text-xs leading-relaxed shadow-xl z-[100] pointer-events-none">
                    <div className="font-bold mb-1 text-amber-400 text-[11px] uppercase tracking-wider">{displayName}</div>
                    {description}
                    <div className="absolute -bottom-1.5 left-6 w-2.5 h-2.5 bg-zinc-800 dark:bg-zinc-700 rotate-45" />
                </div>
            )}
        </div>
    );
}

export function PokemonDetailsDialog({ pokemon, item, format, onUpdate, children }: PokemonDetailsDialogProps) {
    const [open, setOpen] = useState(false);
    const { t, lang } = useTranslation();
    const stats = pokemon.baseStats || { hp: 0, atk: 0, def: 0, spa: 0, spd: 0, spe: 0 };
    const bst = Object.values(stats).reduce((a, b) => (a as number) + (b as number), 0);
    const analysis = (pokemon.analysis || {}) as Partial<PokemonAnalysis>;

    const availableRoles = useMemo(() => {
        if (!format) return [];
        return getAvailableRoles(pokemon.name, format);
    }, [pokemon.name, format]);

    const handleRoleChange = (roleName: string) => {
        if (!format || !onUpdate) return;
        const set = getCompetitiveSetByRole(pokemon.name, roleName, format);
        if (set) {
            const statMap: Record<string, string> = {
                hp: 'HP', atk: 'Atk', def: 'Def', spa: 'SpA', spd: 'SpD', spe: 'Spe'
            };
            const evsString = Object.entries(set.evs)
                .map(([stat, val]) => `${val} ${statMap[stat] || stat}`)
                .join(' / ');

            const updated = {
                ...pokemon,
                moves: set.moves,
                item: set.item,
                nature: set.nature,
                evs: evsString,
                analysis: {
                    ...pokemon.analysis,
                    role: roleName,
                    nature: set.nature,
                    evs: evsString,
                }
            };
            onUpdate(updated as unknown as Parameters<NonNullable<typeof onUpdate>>[0]);
        }
    };

    const primaryType = pokemon.types[0].toLowerCase();

    const theme = getTypeTheme(primaryType);

    const getStatColor = (value: number) => {
        if (value < 50) return "#ef4444";
        if (value < 80) return "#f97316";
        if (value < 100) return "#eab308";
        if (value < 130) return "#22c55e";
        return "#06b6d4";
    };

    const statLabels: Record<string, string> = {
        hp: "HP",
        atk: "ATK",
        def: "DEF",
        spa: "SP.ATK",
        spd: "SP.DEF",
        spe: "SPEED",
    };

    const getRoleDescription = () => {
        const { atk, spa, spe, def, spd, hp } = stats;
        if (spe > 100 && (atk > 100 || spa > 100)) return t("role.fastSweeper");
        if ((def > 100 && spd > 80) || (spd > 100 && def > 80)) return t("role.wallTank");
        if (hp > 100 && (def > 90 || spd > 90)) return t("role.bulkyPivot");
        if (spe < 60 && (atk > 100 || spa > 100)) return t("role.wallbreaker");
        if (atk > 80 && spa > 80) return t("role.mixedAttacker");
        return t("role.utility");
    };

    return (
        <>
            <div onClick={() => setOpen(true)}>
                {children}
            </div>
            {open && (
                <div
                    className="fixed inset-0 z-[9998] bg-black/80 backdrop-blur-sm"
                    onClick={() => setOpen(false)}
                    aria-hidden="true"
                />
            )}
            <Dialog open={open} onOpenChange={setOpen}>
                <DialogContent
                    modal={false}
                    className="border-0 shadow-2xl rounded-2xl bg-transparent"
                    style={{ width: '880px', maxWidth: '95vw', padding: 0, gap: 0, overflow: 'hidden', background: 'none' }}
                >
                    <DialogDescription className="sr-only">Details for {pokemon.name}</DialogDescription>

                    {/* HEADER */}
                    <div className="relative w-full"
                        style={{ minHeight: '140px', overflow: 'hidden', background: 'linear-gradient(135deg, rgba(24, 24, 27, 0.85) 0%, rgba(39, 39, 42, 0.85) 50%, rgba(24, 24, 27, 0.85) 100%)', backdropFilter: 'blur(10px)' }}>
                        {/* Type-colored gradient overlays */}
                        <div className={`absolute inset-0 bg-gradient-to-br ${theme.gradientFrom} to-transparent opacity-25`}
                            style={{ mixBlendMode: 'screen' }} />
                        <div className="absolute inset-0"
                            style={{ opacity: 0.04, backgroundImage: 'radial-gradient(#fff 1px, transparent 1px)', backgroundSize: '16px 16px' }} />

                        <div className="relative z-10 flex items-end gap-3 sm:gap-5 px-4 sm:px-7 pt-5 pb-4">
                            {/* Sprite */}
                            <div className="relative w-20 h-20 sm:w-28 sm:h-28 shrink-0 rounded-2xl bg-white/10 border-2 border-white/15 overflow-hidden">
                                <Image
                                    src={getPokemonSpriteUrl(pokemon)}
                                    alt={pokemon.name}
                                    fill
                                    className="object-contain drop-shadow-lg p-1 sm:p-1.5"
                                    unoptimized
                                />
                            </div>

                            {/* Info */}
                            <div style={{ flex: 1, minWidth: 0, paddingBottom: '4px' }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                                    <span style={{ fontFamily: 'monospace', color: 'rgba(255,255,255,0.4)', fontSize: '13px', fontWeight: 'bold', letterSpacing: '0.1em' }}>
                                        #{pokemon.num.toString().padStart(3, '0')}
                                    </span>
                                    <Badge variant="outline" className="border-white/20 text-white bg-white/10" style={{ fontSize: '10px', padding: '0 6px', height: '20px' }}>
                                        Gen {getPokemonGeneration(pokemon.name)}
                                    </Badge>
                                </div>
                                <DialogTitle style={{ fontSize: '28px', fontWeight: 900, color: 'white', letterSpacing: '-0.02em', lineHeight: 1, marginBottom: '8px', textTransform: 'capitalize' }}>
                                    {pokemon.name}
                                </DialogTitle>
                                <div style={{ display: 'flex', gap: '6px', alignItems: 'center' }}>
                                    {pokemon.types.map((type) => (
                                        <Badge
                                            key={type}
                                            className={`${getTypeColor(type.toLowerCase())} text-white border-0`}
                                            style={{ padding: '2px 10px', fontSize: '11px', fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase', display: 'flex', alignItems: 'center', gap: '5px' }}
                                        >
                                            <TypeIcon type={type} size={14} />
                                            {t(`type.${type.toLowerCase()}`)}
                                        </Badge>
                                    ))}

                                    <a
                                        href={`https://www.smogon.com/dex/sv/pokemon/${pokemon.name.toLowerCase().replace(/[^a-z0-9-]/g, '')}/`}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        onClick={(e) => e.stopPropagation()}
                                        className="ml-2 flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-white/10 hover:bg-white/20 border border-white/20 text-white text-[10px] font-bold uppercase tracking-wider transition-colors"
                                    >
                                        <span className="w-3.5 h-3.5 flex items-center justify-center bg-white/20 rounded-full">
                                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="w-2 h-2"><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6M15 3h6v6M10 14L21 3" /></svg>
                                        </span>
                                        {t("details.viewOnSmogon")}
                                    </a>
                                </div>
                            </div>

                            {/* BST */}
                            <div style={{ textAlign: 'right', flexShrink: 0, paddingBottom: '4px' }}>
                                <div style={{ fontSize: '10px', color: 'rgba(255,255,255,0.3)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.15em', marginBottom: '2px' }}>BST</div>
                                <div style={{ fontSize: '28px', fontWeight: 900, color: 'rgba(255,255,255,0.9)', fontVariantNumeric: 'tabular-nums', lineHeight: 1 }}>{bst}</div>
                            </div>
                        </div>
                    </div>

                    {/* BODY */}
                    <div className="flex-1 overflow-y-auto bg-zinc-50 dark:bg-zinc-950" style={{ maxHeight: 'calc(90vh - 140px)' }}>
                        <div className="p-4 sm:p-6 grid grid-cols-1 md:grid-cols-[5fr_7fr] gap-6">

                            {/* LEFT: Info + Stats */}
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>

                                {/* Analysis Section */}
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                                    {/* Role & Tactics */}
                                    <div className="relative p-4 pl-5 rounded-xl border border-zinc-200 dark:border-zinc-700/50 overflow-hidden bg-white dark:bg-zinc-800/50 shadow-sm">
                                        <div className={theme.bg} style={{ position: 'absolute', top: 0, left: 0, width: '4px', height: '100%', opacity: 0.7 }} />
                                        <div className="flex justify-between items-center mb-2">
                                            <h4 className="text-[11px] font-bold text-zinc-400 dark:text-zinc-500 uppercase tracking-widest">{t("details.strategicRole")}</h4>
                                            {availableRoles.length > 0 && onUpdate ? (
                                                <div className="relative">
                                                    <Select
                                                        value={availableRoles.includes(pokemon.analysis?.role || "") ? pokemon.analysis?.role : ""}
                                                        onValueChange={handleRoleChange}
                                                    >
                                                        <SelectTrigger
                                                            aria-label={t("details.strategicRole")}
                                                            className="h-8 w-auto min-w-[140px] text-xs font-bold border-zinc-300 dark:border-zinc-700 text-zinc-700 dark:text-zinc-300 uppercase bg-transparent px-3 shadow-none hover:bg-zinc-50 dark:hover:bg-zinc-800/50 focus:ring-2 focus:ring-blue-500 focus:ring-offset-1 cursor-pointer pointer-events-auto transition-colors"
                                                        >
                                                            <SelectValue placeholder={pokemon.analysis?.role ? t(pokemon.analysis.role) : getRoleDescription().split("—")[0].trim()}>
                                                                {availableRoles.includes(pokemon.analysis?.role || "") ? t(pokemon.analysis!.role!) : getRoleDescription().split("—")[0].trim()}
                                                            </SelectValue>
                                                        </SelectTrigger>
                                                        <SelectContent className="!z-[10001] max-h-[300px] overflow-y-auto bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 shadow-xl">
                                                            {availableRoles.map(r => (
                                                                <SelectItem key={r} value={r} className="text-sm cursor-pointer hover:bg-zinc-100 dark:hover:bg-zinc-700 px-3 py-2 focus:bg-zinc-100 dark:focus:bg-zinc-700">
                                                                    {t(r)}
                                                                </SelectItem>
                                                            ))}
                                                        </SelectContent>
                                                    </Select>
                                                </div>
                                            ) : (
                                                <Badge variant="outline" className="text-[10px] font-bold border-zinc-200 dark:border-zinc-700 text-zinc-500 dark:text-zinc-400 uppercase">
                                                    {pokemon.analysis?.role
                                                        ? t(pokemon.analysis.role)
                                                        : getRoleDescription().split("—")[0].trim()}
                                                </Badge>
                                            )}
                                        </div>
                                        <p className="text-[13px] leading-relaxed text-zinc-600 dark:text-zinc-300 font-medium mt-2">
                                            {t(pokemon.analysis?.howToPlay || getRoleDescription()).replace("Synergy Tip:", t("analysis.synergyTip") + ":")}
                                        </p>
                                    </div>

                                    {/* EVs & Nature */}
                                    <div className="p-4 rounded-xl border border-zinc-200 dark:border-zinc-700/50 bg-white dark:bg-zinc-800/50 shadow-sm">
                                        <h4 className="text-[11px] font-bold text-zinc-400 dark:text-zinc-500 uppercase tracking-widest mb-3">
                                            {t("details.recommendedBuild")}
                                        </h4>
                                        <div className="flex flex-col gap-2">
                                            <div className="flex items-center justify-between">
                                                <span className="text-xs font-semibold text-zinc-400">{t("details.nature")}</span>
                                                <span className="text-sm font-bold text-zinc-700 dark:text-zinc-200">
                                                    {pokemon.analysis?.nature ? t(`nature.${pokemon.analysis.nature.toLowerCase()}`) : t("nature.serious")}
                                                </span>
                                            </div>
                                            <div className="p-3 bg-zinc-50 dark:bg-zinc-900/50 rounded-lg border border-zinc-100 dark:border-zinc-800">
                                                <div className="text-[10px] font-bold text-zinc-400 mb-1.5 uppercase tracking-wider">{t("details.evs")}</div>
                                                <div className="text-xs font-mono font-bold text-zinc-700 dark:text-zinc-300">
                                                    {pokemon.analysis?.evs || "252 HP / 252 Atk / 4 Def"}
                                                </div>
                                            </div>
                                        </div>
                                    </div>


                                </div>

                                {/* Held Item */}
                                {item && (
                                    <div className="p-3 sm:p-4 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900/50">
                                        <ItemBadge item={item} label={t("details.heldItem")} />
                                    </div>
                                )}

                                {/* Abilities */}
                                <div className="p-3 sm:p-4 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900/50">
                                    <h4 className="text-[11px] font-bold text-zinc-400 dark:text-zinc-500 uppercase tracking-wider mb-2">{t("details.abilities")}</h4>
                                    <div className="flex flex-wrap gap-2">
                                        {Object.entries(pokemon.abilities).map(([key, ability]) => (
                                            <AbilityBadge key={key} abilityKey={key} ability={ability as string} labels={{ primary: t("details.primary"), secondary: t("details.secondary"), hidden: t("details.hidden") }} />
                                        ))}
                                    </div>
                                </div>

                                {/* Base Stats */}
                                <div className="p-4 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900/50">
                                    <h4 className="text-[11px] font-bold text-zinc-400 dark:text-zinc-500 uppercase tracking-wider mb-3.5">{t("details.baseStats")}</h4>
                                    <div className="flex flex-col gap-2.5">
                                        {Object.entries(stats).map(([key, value]) => (
                                            <div key={key} className="flex items-center gap-2">
                                                <span className="w-[52px] shrink-0 text-[11px] font-bold uppercase tracking-[0.05em] text-zinc-500 dark:text-zinc-400">
                                                    {statLabels[key] || key}
                                                </span>
                                                <div className="h-1.5 flex-1 bg-zinc-200 dark:bg-zinc-800 rounded-sm overflow-hidden">
                                                    <div className="h-full rounded-sm" style={{ width: `${Math.min((value as number) / 2.55, 100)}%`, background: getStatColor(value as number) }} />
                                                </div>
                                                <span className="w-8 text-right text-xs font-bold tabular-nums text-zinc-900 dark:text-zinc-100">
                                                    {value}
                                                </span>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>

                            {/* RIGHT COLUMN */}
                            <div className="flex flex-col gap-6">
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                    {pokemon.moves && pokemon.moves.map((rawMove: MoveData | string, index: number) => {
                                        // Hydrate move data if it's a string
                                        let move = rawMove;
                                        if (typeof rawMove === 'string') {
                                            const found = getMoveData(rawMove);
                                            if (found) {
                                                move = found;
                                            }
                                        }

                                        const isDetailed = typeof move !== 'string';
                                        const moveObj = isDetailed ? (move as MoveData) : null;
                                        const moveStr = !isDetailed ? (move as string) : null;
                                        const rawName = isDetailed ? moveObj!.name : moveStr!;

                                        if (rawName === 'Ghost' || rawName === 'Fantasma') return null;

                                        const moveName = getTranslatedMoveName(rawName, lang);
                                        const moveType = isDetailed ? moveObj!.type : 'Normal';
                                        const moveCategory = isDetailed ? moveObj!.category : null;

                                        return (
                                            <div key={index} className="p-3.5 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900/50 transition-shadow hover:shadow-md">

                                                {/* Move name + type dot */}
                                                <div className="flex items-center justify-between mb-2">
                                                    <span className="text-[15px] font-bold leading-tight text-zinc-900 dark:text-zinc-100">
                                                        {moveName}
                                                    </span>
                                                    <TypeIcon type={moveType} size={18} />
                                                </div>

                                                {isDetailed ? (
                                                    <>
                                                        <div className="flex flex-wrap items-center gap-1.5 mb-2.5">
                                                            {moveCategory && (
                                                                <CategoryIcon category={moveCategory} />
                                                            )}
                                                            <span className="text-[10px] font-bold uppercase tracking-wider text-zinc-400">
                                                                {translateCategory(moveCategory as string, t)}
                                                            </span>
                                                            <div className="w-px h-2.5 bg-zinc-200 dark:bg-zinc-700 mx-1 hidden sm:block" />
                                                            <span className="text-[11px] font-bold font-mono text-zinc-400 flex items-center gap-1">
                                                                PWR <span className="text-zinc-700 dark:text-zinc-300 text-[13px]">{moveObj!.basePower || '\u2014'}</span>
                                                            </span>
                                                            <span className="text-[11px] font-bold font-mono text-zinc-400 flex items-center gap-1 ml-1">
                                                                ACC <span className="text-zinc-700 dark:text-zinc-300 text-[13px]">{moveObj!.accuracy === true ? '\u2014' : moveObj!.accuracy + '%'}</span>
                                                            </span>
                                                            <span className="text-[11px] font-bold font-mono text-zinc-400 flex items-center gap-1 ml-1">
                                                                PP <span className="text-zinc-700 dark:text-zinc-300 text-[13px]">{moveObj!.pp || '\u2014'}</span>
                                                            </span>
                                                        </div>

                                                        {/* Description */}
                                                        <p className="text-xs leading-relaxed text-zinc-500 dark:text-zinc-400">
                                                            {getTranslatedMoveDesc(moveObj!.name, lang) || moveObj!.shortDesc || moveObj!.desc || t("details.noDesc")}
                                                        </p>
                                                    </>
                                                ) : (
                                                    <p className="text-[11px] italic text-zinc-400">{t("details.moveUnavailable")}</p>
                                                )}
                                            </div>
                                        );
                                    })}
                                </div>

                                {/* Synergies & Threats */}
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                    {/* Best Teammates */}
                                    <div className="p-4 rounded-xl border border-green-200 dark:border-green-900/30 bg-green-50/50 dark:bg-green-900/10">
                                        <h4 className="text-xs font-extrabold text-green-800 dark:text-green-500 uppercase tracking-wider mb-3">{t("details.bestTeammates")}</h4>
                                        <div className="flex flex-col gap-2.5">
                                            {(pokemon.analysis?.teammates || []).map(tm => typeof tm === 'string' ? (
                                                <div key={tm} className="flex items-center gap-2 text-[13px] font-semibold text-green-800 dark:text-green-400">
                                                    <span className="w-1.5 h-1.5 rounded-full bg-green-400 dark:bg-green-500 shrink-0" /> {tm}
                                                </div>
                                            ) : (
                                                <div key={tm.name} className={`px-2.5 py-2 rounded-lg border ${tm.isActive ? 'bg-indigo-50 dark:bg-indigo-900/20 border-indigo-200 dark:border-indigo-800/50' : 'bg-white dark:bg-zinc-900/50 border-zinc-200 dark:border-zinc-800'}`}>
                                                    <div className="flex items-center justify-between gap-2">
                                                        <div className="flex items-center gap-2 min-w-0">
                                                            <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${tm.isActive ? 'bg-indigo-500' : 'bg-green-400 dark:bg-green-500'}`} />
                                                            <span className={`text-[13px] font-bold ${tm.isActive ? 'text-indigo-700 dark:text-indigo-400' : 'text-green-800 dark:text-green-400'}`}>{tm.name}</span>
                                                        </div>
                                                        {tm.isActive && (
                                                            <span className="text-[9px] bg-indigo-100 dark:bg-indigo-900/50 text-indigo-700 dark:text-indigo-300 px-1.5 py-0.5 rounded font-extrabold tracking-wider shrink-0">{t("details.team")}</span>
                                                        )}
                                                    </div>
                                                    {tm.isActive && tm.reason && (
                                                        <div className="text-[11px] text-indigo-500 dark:text-indigo-400 italic mt-1.5 leading-snug">
                                                            {tm.reason.split(';')[0]}
                                                        </div>
                                                    )}
                                                </div>
                                            ))}
                                            {(!pokemon.analysis?.teammates || pokemon.analysis.teammates.length === 0) && (
                                                <div className="text-xs italic text-green-500 dark:text-green-600">
                                                    {t("details.noSynergies")}
                                                </div>
                                            )}
                                        </div>
                                    </div>

                                    {/* Checks & Counters */}
                                    <div className="p-4 rounded-xl border border-red-200 dark:border-red-900/30 bg-red-50/50 dark:bg-red-900/10">
                                        <h4 className="text-xs font-extrabold text-red-800 dark:text-red-500 uppercase tracking-wider mb-3">{t("details.threats")}</h4>
                                        <div className="flex flex-col gap-2.5">
                                            {(pokemon.analysis?.checks || [t("details.fasterThreats"), t("details.priority")]).map(c => (
                                                <div key={c} className="flex items-center gap-2 text-[13px] font-semibold text-red-800 dark:text-red-400">
                                                    <span className="w-1.5 h-1.5 rounded-full bg-red-400 dark:bg-red-500 shrink-0" /> {c}
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </DialogContent >
            </Dialog >
        </>
    );
}
