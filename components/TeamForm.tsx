"use client";

import { useState, useEffect } from "react";
import dynamic from "next/dynamic";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";
import { FORMATS, FormatId, getGenFromFormat } from "../config/formats";
import {
    TemplateId,
    getCompatibleTemplates,
    sanitizeTemplateForFormat,
} from "../config/templates";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Card, CardContent } from "@/components/ui/card";
import { useTranslation } from "@/lib/i18n";
import { getCanonicalSpeciesId, getCanonicalSpeciesName } from "@/lib/pokemon-forms";
import type { GameplanData } from "@/lib/team-storage";
import type { TeamGenerationOptions } from "@/lib/team-generation-options";
import type { GeneratedTeamMember, TeamGuideData } from "@/lib/team-guide";

interface TeamGenerationResult {
    team: GeneratedTeamMember[];
    gameplan?: GameplanData | null;
    gameplanI18n?: Record<string, GameplanData> | null;
    teamGuide?: TeamGuideData | null;
    teamGuideI18n?: Record<string, TeamGuideData> | null;
    templateId?: string;
    options?: TeamGenerationOptions | null;
}

interface TeamFormProps {
    onGenerate: (data: TeamGenerationResult) => void;
    format: FormatId;
    onFormatChange: (format: FormatId) => void;
    isLoading?: boolean;
    initialTemplate?: TemplateId;
    initialType?: string;
    initialExcludeLegendaries?: boolean;
    initialFixedPokemon?: string[];
}

const TYPE_KEYS = [
    "fire", "water", "grass", "electric", "psychic", "dragon",
    "ghost", "dark", "fairy", "normal", "fighting", "flying",
    "poison", "ground", "rock", "bug", "steel", "ice"
] as const;

const PokemonCombobox = dynamic(
    () => import("./PokemonCombobox").then((module) => module.PokemonCombobox),
    {
        ssr: false,
        loading: () => (
            <div
                aria-hidden="true"
                className="h-10 w-full rounded-md border border-input bg-background"
            />
        ),
    }
);

export function TeamForm({
    onGenerate,
    format,
    onFormatChange,
    isLoading: parentLoading,
    initialTemplate,
    initialType,
    initialExcludeLegendaries = false,
    initialFixedPokemon = [],
}: TeamFormProps) {
    const [type, setType] = useState(initialType ?? "all");
    const [fixedPokemon, setFixedPokemon] = useState<string[]>(
        initialFixedPokemon.slice(0, FORMATS[format].maxTeamSize)
    );
    const [pokemonName, setPokemonName] = useState("");
    const [templateId, setTemplateId] = useState<TemplateId>(
        sanitizeTemplateForFormat(initialTemplate ?? "balanced", format)
    );
    const [excludeLegendaries, setExcludeLegendaries] = useState(initialExcludeLegendaries);
    const [localLoading, setLocalLoading] = useState(false);
    const { t, lang } = useTranslation();
    const maxFixedMembers = FORMATS[format].maxTeamSize;
    const compatibleTemplates = getCompatibleTemplates(format);

    useEffect(() => {
        setFixedPokemon((current) => current.slice(0, maxFixedMembers));
    }, [maxFixedMembers]);

    useEffect(() => {
        setTemplateId((current) => sanitizeTemplateForFormat(current, format));
    }, [format]);

    const isLoading = parentLoading || localLoading;

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        // Validate: if monotype format, user must select a specific type
        const isMonotypeFormat = format.includes('monotype');
        if (isMonotypeFormat && (!type || type === 'all')) {
            toast.warning(t("form.monotypeRequiresType"), {
                description: t("form.monotypeRequiresTypeDesc"),
                duration: 5000,
            });
            return;
        }

        setLocalLoading(true);
        try {
            const requestBody = {
                format,
                tipo: type === 'all' ? null : (type || null),
                fijos: fixedPokemon.length > 0 ? fixedPokemon : null,
                excludeLegendaries,
                templateId: sanitizeTemplateForFormat(templateId, format),
                lang
            };

            const response = await fetch('/api/generate-dynamic-team', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(requestBody),
            });

            if (!response.ok) throw new Error('Generation failed');

            const data = await response.json();
            // Pass the options so we can regenerate the team later
            data.options = requestBody;
            onGenerate(data);
        } catch (error) {
            console.error(error);
            toast.error(t("form.error"), {
                description: t("form.errorDesc"),
                duration: 5000,
            });
        } finally {
            setLocalLoading(false);
        }
    };

    return (
        <Card className="w-full max-w-2xl bg-white dark:bg-zinc-900 border-zinc-200 dark:border-zinc-800 shadow-sm pt-6">
            <CardContent>
                <form onSubmit={handleSubmit} className="space-y-6" aria-busy={isLoading}>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-2">
                            <Label htmlFor="format">{t("form.format")}</Label>
                            <Select value={format} onValueChange={(val) => onFormatChange(val as FormatId)}>
                                <SelectTrigger id="format">
                                    <SelectValue placeholder={t("form.formatPlaceholder")} />
                                </SelectTrigger>
                                <SelectContent>
                                    {(() => {
                                        const grouped: Record<number, [string, typeof FORMATS[FormatId]][]> = {};
                                        Object.entries(FORMATS).forEach(([key, value]) => {
                                            const gen = getGenFromFormat(key as FormatId);
                                            if (!grouped[gen]) grouped[gen] = [];
                                            grouped[gen].push([key, value]);
                                        });
                                        return Object.keys(grouped)
                                            .map(Number)
                                            .sort((a, b) => b - a)
                                            .map(gen => (
                                                <div key={gen}>
                                                    <div className="px-2 py-1.5 text-xs font-semibold text-muted-foreground">
                                                        {t("form.generation")} {gen}
                                                    </div>
                                                    {grouped[gen].map(([key, value]) => (
                                                        <SelectItem key={key} value={key}>
                                                            {value.label}
                                                        </SelectItem>
                                                    ))}
                                                </div>
                                            ));
                                    })()}
                                </SelectContent>
                            </Select>
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="template">{t("form.teamStyle")}</Label>
                            <Select value={templateId} onValueChange={(val) => setTemplateId(val as TemplateId)}>
                                <SelectTrigger id="template">
                                    <SelectValue placeholder={t("form.stylePlaceholder")} />
                                </SelectTrigger>
                                <SelectContent>
                                    {compatibleTemplates.map((key) => (
                                        <SelectItem key={key} value={key}>
                                            {t(`template.${key}`)}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>



                        <div className="space-y-2">
                            <Label htmlFor="type">{t("form.type")}</Label>
                            <Select value={type} onValueChange={setType}>
                                <SelectTrigger id="type">
                                    <SelectValue placeholder={t("form.allTypes")} />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all">{t("form.allTypes")}</SelectItem>
                                    {TYPE_KEYS.map(typeKey => (
                                        <SelectItem key={typeKey} value={typeKey}>
                                            {t(`type.${typeKey}`)}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="pokemon">{t("form.fixedMember")}</Label>
                            <PokemonCombobox
                                id="pokemon"
                                value={pokemonName}
                                onChange={(name) => {
                                    if (!name) {
                                        setPokemonName("");
                                        return;
                                    }

                                    if (fixedPokemon.includes(name)) {
                                        setPokemonName("");
                                        return;
                                    }

                                    const selectedCanonicalId = getCanonicalSpeciesId(name);
                                    const conflictingFixed = fixedPokemon.find(
                                        (member) => getCanonicalSpeciesId(member) === selectedCanonicalId
                                    );

                                    if (conflictingFixed) {
                                        toast.warning(t("form.duplicateFormBlocked"), {
                                            description: t("form.duplicateFormBlockedDesc")
                                                .replace("{selected}", name)
                                                .replace("{kept}", conflictingFixed)
                                                .replace(
                                                    "{family}",
                                                    getCanonicalSpeciesName(name)
                                                ),
                                            duration: 5000,
                                        });
                                        setPokemonName("");
                                        return;
                                    }

                                    if (fixedPokemon.length < maxFixedMembers) {
                                        setFixedPokemon([...fixedPokemon, name]);
                                    }
                                    setPokemonName("");
                                }}
                                placeholder={t("form.fixedPlaceholder")}
                            />
                            {fixedPokemon.length > 0 && (
                                <div className="flex flex-wrap gap-2 mt-2">
                                    {fixedPokemon.map(name => (
                                        <div key={name} className="flex items-center gap-1 bg-zinc-100 dark:bg-zinc-800 text-sm px-2 py-1 rounded-md border border-zinc-200 dark:border-zinc-700">
                                            <span>{name}</span>
                                            <button
                                                type="button"
                                                onClick={() => setFixedPokemon(fixedPokemon.filter(p => p !== name))}
                                                className="text-muted-foreground hover:text-foreground hover:bg-zinc-200 dark:hover:bg-zinc-700 rounded-full p-0.5"
                                            >
                                                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 6 6 18" /><path d="m6 6 12 12" /></svg>
                                            </button>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>

                    <div className="flex items-center space-x-2">
                        <Switch
                            id="legendary"
                            checked={excludeLegendaries}
                            onCheckedChange={setExcludeLegendaries}
                            className="!h-6 !w-11"
                        />
                        <Label htmlFor="legendary">{t("form.excludeLegendaries")}</Label>
                    </div>

                    <Button type="submit" disabled={isLoading} className="min-h-11 w-full bg-rose-600 font-bold text-white hover:bg-rose-700">
                        {isLoading && (
                            <Loader2 className="mr-2 inline-block h-4 w-4 animate-spin" aria-hidden="true" />
                        )}
                        {isLoading ? t("form.generating") : t("form.generate")}
                    </Button>
                    {isLoading && (
                        <p role="status" className="text-center text-sm text-zinc-600 dark:text-zinc-400">
                            {t("form.generating")}
                        </p>
                    )}
                </form>
            </CardContent>
        </Card>
    );
}
