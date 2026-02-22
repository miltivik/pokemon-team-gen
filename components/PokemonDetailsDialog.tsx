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
    onUpdate?: (newMon: any) => void;
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
            style={{
                position: 'relative',
                padding: '8px 12px',
                borderRadius: '8px',
                border: '1px solid #e5e7eb',
                background: 'white',
                cursor: 'help',
                transition: 'border-color 0.2s',
                zIndex: showTooltip ? 30 : 1 // Elevate the badge when hovered
            }}
            onMouseEnter={handleMouseEnter}
            onMouseLeave={handleMouseLeave}
        >
            <div style={{ fontSize: '13px', fontWeight: 600, lineHeight: 1.2, color: '#374151' }}>{displayName}</div>
            <div style={{ fontSize: '10px', color: '#9ca3af', fontWeight: 500, textTransform: 'uppercase', letterSpacing: '0.08em' }}>
                {abilityKey === 'H' ? labels.hidden : abilityKey === '0' ? labels.primary : labels.secondary}
            </div>
            {description && showTooltip && (
                <div
                    style={{
                        position: 'absolute', bottom: 'calc(100% + 8px)', left: '-4px', // Shift slightly left to look balanced
                        width: '260px', padding: '12px 14px', borderRadius: '10px',
                        background: '#1f2937', color: '#e5e7eb', fontSize: '12px', lineHeight: 1.5,
                        boxShadow: '0 8px 30px rgba(0,0,0,0.3)', zIndex: 100, // Very high z-index
                        pointerEvents: 'none',
                    }}>
                    {description}
                    <div style={{
                        position: 'absolute', bottom: '-5px', left: '24px', // Align arrow with left side of badge
                        transform: 'rotate(45deg)', width: '10px', height: '10px', background: '#1f2937'
                    }} />
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
            style={{
                position: 'relative',
                display: 'flex',
                alignItems: 'center',
                gap: '10px',
                cursor: description ? 'help' : 'default',
                zIndex: showTooltip ? 30 : 1,
            }}
            onMouseEnter={handleMouseEnter}
            onMouseLeave={handleMouseLeave}
        >
            <ItemIcon item={item} size={28} />
            <div>
                <h4 style={{ fontSize: '10px', fontWeight: 700, color: '#9ca3af', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '2px' }}>{label}</h4>
                <div style={{ fontSize: '14px', fontWeight: 600, color: '#374151' }}>{displayName}</div>
            </div>
            {description && showTooltip && (
                <div
                    style={{
                        position: 'absolute', bottom: 'calc(100% + 8px)', left: '-4px',
                        width: '280px', padding: '12px 14px', borderRadius: '10px',
                        background: '#1f2937', color: '#e5e7eb', fontSize: '12px', lineHeight: 1.5,
                        boxShadow: '0 8px 30px rgba(0,0,0,0.3)', zIndex: 100,
                        pointerEvents: 'none',
                    }}>
                    <div style={{ fontWeight: 700, marginBottom: '4px', color: '#fbbf24', fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>{displayName}</div>
                    {description}
                    <div style={{
                        position: 'absolute', bottom: '-5px', left: '24px',
                        transform: 'rotate(45deg)', width: '10px', height: '10px', background: '#1f2937'
                    }} />
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
    const analysis = (pokemon.analysis || {}) as any;

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
                analysis: {
                    ...pokemon.analysis,
                    role: roleName,
                    nature: set.nature,
                    evs: evsString,
                }
            };
            onUpdate(updated);
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

                        <div style={{ position: 'relative', zIndex: 10, display: 'flex', alignItems: 'flex-end', gap: '20px', padding: '20px 28px 16px' }}>
                            {/* Sprite */}
                            <div style={{ position: 'relative', width: '112px', height: '112px', flexShrink: 0, borderRadius: '16px', background: 'rgba(255,255,255,0.1)', border: '2px solid rgba(255,255,255,0.15)', overflow: 'hidden' }}>
                                <Image
                                    src={getPokemonSpriteUrl(pokemon)}
                                    alt={pokemon.name}
                                    fill
                                    className="object-contain drop-shadow-lg"
                                    style={{ padding: '6px' }}
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
                                <div style={{ display: 'flex', gap: '6px' }}>
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
                    <div style={{ flex: 1, overflowY: 'auto', maxHeight: 'calc(90vh - 140px)', background: '#fafafa' }}>
                        <div style={{ padding: '24px', display: 'grid', gridTemplateColumns: '5fr 7fr', gap: '24px' }}>

                            {/* LEFT: Info + Stats */}
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>

                                {/* Analysis Section */}
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                                    {/* Role & Tactics */}
                                    <div style={{ position: 'relative', padding: '16px', paddingLeft: '20px', borderRadius: '12px', border: '1px solid #e5e7eb', overflow: 'hidden', background: 'white' }}>
                                        <div className={theme.bg} style={{ position: 'absolute', top: 0, left: 0, width: '4px', height: '100%', opacity: 0.7 }} />
                                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                                            <h4 style={{ fontSize: '11px', fontWeight: 700, color: '#9ca3af', textTransform: 'uppercase', letterSpacing: '0.1em' }}>{t("details.strategicRole")}</h4>
                                            {availableRoles.length > 0 && onUpdate ? (
                                                <div className="relative">
                                                    <Select
                                                        value={availableRoles.includes(pokemon.analysis?.role || "") ? pokemon.analysis?.role : ""}
                                                        onValueChange={handleRoleChange}
                                                    >
                                                        <SelectTrigger
                                                            aria-label={t("details.strategicRole")}
                                                            className="h-8 w-auto min-w-[140px] text-xs font-bold border-zinc-300 text-zinc-700 uppercase bg-transparent px-3 shadow-none hover:bg-zinc-50 focus:ring-2 focus:ring-blue-500 focus:ring-offset-1 cursor-pointer pointer-events-auto transition-colors"
                                                        >
                                                            <SelectValue placeholder={pokemon.analysis?.role || getRoleDescription().split("—")[0].trim()}>
                                                                {availableRoles.includes(pokemon.analysis?.role || "") ? pokemon.analysis?.role : getRoleDescription().split("—")[0].trim()}
                                                            </SelectValue>
                                                        </SelectTrigger>
                                                        <SelectContent className="!z-[10001] max-h-[300px] overflow-y-auto bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 shadow-xl">
                                                            {availableRoles.map(r => (
                                                                <SelectItem key={r} value={r} className="text-sm cursor-pointer hover:bg-zinc-100 dark:hover:bg-zinc-700 px-3 py-2 focus:bg-zinc-100 dark:focus:bg-zinc-700">
                                                                    {r}
                                                                </SelectItem>
                                                            ))}
                                                        </SelectContent>
                                                    </Select>
                                                </div>
                                            ) : (
                                                <Badge variant="outline" className="text-[10px] font-bold border-zinc-200 text-zinc-500 uppercase">
                                                    {pokemon.analysis?.role
                                                        ? t(pokemon.analysis.role)
                                                        : getRoleDescription().split("—")[0].trim()}
                                                </Badge>
                                            )}
                                        </div>
                                        <p style={{ fontSize: '13px', lineHeight: 1.6, color: '#4b5563', fontWeight: 500 }}>
                                            {t(pokemon.analysis?.howToPlay || getRoleDescription()).replace("Synergy Tip:", t("analysis.synergyTip") + ":")}
                                        </p>
                                    </div>

                                    {/* EVs & Nature */}
                                    <div style={{ padding: '16px', borderRadius: '12px', border: '1px solid #e5e7eb', background: 'white' }}>
                                        <h4 style={{ fontSize: '11px', fontWeight: 700, color: '#9ca3af', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '10px' }}>{t("details.recommendedBuild")}</h4>
                                        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                                            <div className="flex items-center justify-between">
                                                <span className="text-xs font-semibold text-zinc-400">{t("details.nature")}</span>
                                                <span className="text-sm font-bold text-zinc-700">{pokemon.analysis?.nature ? t(`nature.${pokemon.analysis.nature.toLowerCase()}`) : t("nature.serious")}</span>
                                            </div>
                                            <div style={{ padding: '10px', background: '#f8fafc', borderRadius: '8px', border: '1px solid #f1f5f9' }}>
                                                <div className="text-[10px] font-bold text-zinc-400 mb-1 uppercase tracking-wider">{t("details.evs")}</div>
                                                <div className="text-xs font-mono font-bold text-indigo-600">
                                                    {pokemon.analysis?.evs || "252 HP / 252 Atk / 4 Def"}
                                                </div>
                                            </div>
                                        </div>
                                    </div>


                                </div>

                                {/* Held Item */}
                                {item && (
                                    <div style={{ padding: '12px 16px', borderRadius: '12px', border: '1px solid #e5e7eb', background: 'white' }}>
                                        <ItemBadge item={item} label={t("details.heldItem")} />
                                    </div>
                                )}

                                {/* Abilities */}
                                <div>
                                    <h4 style={{ fontSize: '11px', fontWeight: 700, color: '#9ca3af', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '8px' }}>{t("details.abilities")}</h4>
                                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                                        {Object.entries(pokemon.abilities).map(([key, ability]) => (
                                            <AbilityBadge key={key} abilityKey={key} ability={ability as string} labels={{ primary: t("details.primary"), secondary: t("details.secondary"), hidden: t("details.hidden") }} />
                                        ))}
                                    </div>
                                </div>

                                {/* Base Stats */}
                                <div style={{ padding: '16px', borderRadius: '12px', border: '1px solid #e5e7eb', background: 'white' }}>
                                    <h4 style={{ fontSize: '11px', fontWeight: 700, color: '#9ca3af', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '14px' }}>{t("details.baseStats")}</h4>
                                    <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                                        {Object.entries(stats).map(([key, value]) => (
                                            <div key={key} style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                                <span style={{ width: '52px', fontSize: '11px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em', flexShrink: 0, color: '#6b7280' }}>
                                                    {statLabels[key] || key}
                                                </span>
                                                <div style={{ height: '6px', flex: 1, background: '#e5e7eb', borderRadius: '3px', overflow: 'hidden' }}>
                                                    <div style={{ height: '100%', width: `${Math.min((value as number) / 2.55, 100)}%`, background: getStatColor(value as number), borderRadius: '3px' }} />
                                                </div>
                                                <span style={{ width: '30px', textAlign: 'right', fontSize: '12px', fontWeight: 700, fontVariantNumeric: 'tabular-nums', color: '#111827' }}>
                                                    {value}
                                                </span>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>

                            {/* RIGHT COLUMN */}
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
                                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                                    {pokemon.moves && pokemon.moves.map((rawMove: any, index: number) => {
                                        // Hydrate move data if it's a string
                                        let move = rawMove;
                                        if (typeof rawMove === 'string') {
                                            const found = getMoveData(rawMove);
                                            if (found) {
                                                move = found;
                                            }
                                        }

                                        const isDetailed = typeof move !== 'string';
                                        const rawName = isDetailed ? move.name : move;

                                        if (rawName === 'Ghost' || rawName === 'Fantasma') return null;

                                        const moveName = getTranslatedMoveName(rawName, lang);
                                        const moveType = isDetailed ? move.type : 'Normal';
                                        const moveCategory = isDetailed ? move.category : null;

                                        return (
                                            <div key={index}
                                                style={{ padding: '14px', borderRadius: '12px', border: '1px solid #e5e7eb', background: 'white', transition: 'box-shadow 0.2s' }}
                                                className="hover:shadow-md">

                                                {/* Move name + type dot */}
                                                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
                                                    <span style={{ fontSize: '15px', fontWeight: 700, lineHeight: 1.2, color: '#1f2937' }}>
                                                        {moveName}
                                                    </span>
                                                    <TypeIcon type={moveType} size={18} />
                                                </div>

                                                {isDetailed ? (
                                                    <>
                                                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '8px' }}>
                                                            {moveCategory && (
                                                                <CategoryIcon category={moveCategory} />
                                                            )}
                                                            <span style={{ fontSize: '10px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em', color: '#9ca3af' }}>
                                                                {translateCategory(moveCategory, t)}
                                                            </span>
                                                            <div style={{ width: '1px', height: '10px', background: '#e5e7eb' }} />
                                                            <span style={{ fontSize: '10px', fontWeight: 700, fontFamily: 'monospace', color: '#9ca3af' }}>
                                                                PWR <span style={{ color: '#4b5563' }}>{move.basePower || '\u2014'}</span>
                                                            </span>
                                                            <span style={{ fontSize: '10px', fontWeight: 700, fontFamily: 'monospace', color: '#9ca3af' }}>
                                                                ACC <span style={{ color: '#4b5563' }}>{move.accuracy === true ? '\u2014' : move.accuracy + '%'}</span>
                                                            </span>
                                                            <span style={{ fontSize: '10px', fontWeight: 700, fontFamily: 'monospace', color: '#9ca3af' }}>
                                                                PP <span style={{ color: '#4b5563' }}>{move.pp || '\u2014'}</span>
                                                            </span>
                                                        </div>

                                                        {/* Description */}
                                                        <p style={{ fontSize: '12px', lineHeight: 1.5, color: '#6b7280' }}>
                                                            {getTranslatedMoveDesc(move.name, lang) || move.shortDesc || move.desc || t("details.noDesc")}
                                                        </p>
                                                    </>
                                                ) : (
                                                    <p style={{ fontSize: '11px', fontStyle: 'italic', color: '#9ca3af' }}>{t("details.moveUnavailable")}</p>
                                                )}
                                            </div>
                                        );
                                    })}
                                </div>

                                {/* Synergies & Threats */}
                                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                                    {/* Best Teammates */}
                                    <div style={{ padding: '16px', borderRadius: '14px', border: '1px solid #d1fae5', background: '#f0fdf4' }}>
                                        <h4 style={{ fontSize: '12px', fontWeight: 800, color: '#166534', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '12px' }}>{t("details.bestTeammates")}</h4>
                                        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                                            {(pokemon.analysis?.teammates || []).map(tm => typeof tm === 'string' ? (
                                                <div key={tm} style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13px', fontWeight: 600, color: '#166534' }}>
                                                    <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#34d399', flexShrink: 0 }} /> {tm}
                                                </div>
                                            ) : (
                                                <div key={tm.name} style={{ padding: '8px 10px', borderRadius: '8px', background: tm.isActive ? '#eef2ff' : 'white', border: `1px solid ${tm.isActive ? '#c7d2fe' : '#e5e7eb'}` }}>
                                                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '8px' }}>
                                                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', minWidth: 0 }}>
                                                            <span style={{ width: '7px', height: '7px', borderRadius: '50%', background: tm.isActive ? '#6366f1' : '#34d399', flexShrink: 0 }} />
                                                            <span style={{ fontSize: '13px', fontWeight: 700, color: '#166534' }}>{tm.name}</span>
                                                        </div>
                                                        {tm.isActive && (
                                                            <span style={{ fontSize: '9px', background: '#e0e7ff', color: '#4338ca', padding: '2px 6px', borderRadius: '4px', fontWeight: 800, letterSpacing: '0.03em', flexShrink: 0 }}>{t("details.team")}</span>
                                                        )}
                                                    </div>
                                                    {tm.isActive && tm.reason && (
                                                        <div style={{ fontSize: '11px', color: '#6366f1', fontStyle: 'italic', marginTop: '4px', paddingLeft: '15px', lineHeight: 1.4 }}>
                                                            {tm.reason.split(';')[0]}
                                                        </div>
                                                    )}
                                                </div>
                                            ))}
                                            {(!pokemon.analysis?.teammates || pokemon.analysis.teammates.length === 0) && (
                                                <div style={{ fontSize: '12px', fontStyle: 'italic', color: '#6ee7b7' }}>
                                                    {t("details.noSynergies")}
                                                </div>
                                            )}
                                        </div>
                                    </div>

                                    {/* Checks & Counters */}
                                    <div style={{ padding: '16px', borderRadius: '14px', border: '1px solid #fecaca', background: '#fef2f2' }}>
                                        <h4 style={{ fontSize: '12px', fontWeight: 800, color: '#991b1b', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '12px' }}>{t("details.threats")}</h4>
                                        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                                            {(pokemon.analysis?.checks || [t("details.fasterThreats"), t("details.priority")]).map(c => (
                                                <div key={c} style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13px', fontWeight: 600, color: '#991b1b' }}>
                                                    <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#f87171', flexShrink: 0 }} /> {c}
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
