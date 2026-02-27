"use client";

import { useState, useEffect } from "react";
import { toast } from "sonner";
import { FORMATS, FormatId, getGenFromFormat } from "../config/formats";
import { TEMPLATES, TemplateId } from "../config/templates";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
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
import { PokemonCombobox } from "./PokemonCombobox";
import { useTranslation } from "@/lib/i18n";

interface TeamFormProps {
    onGenerate: (data: { team: any[]; gameplan?: any; gameplanI18n?: any; templateId?: string; options?: any }) => void;
    format: FormatId;
    onFormatChange: (format: FormatId) => void;
    isLoading?: boolean;
    initialFormat?: FormatId;
    initialTemplate?: TemplateId;
    initialType?: string;
}

const TYPE_KEYS = [
    "fire", "water", "grass", "electric", "psychic", "dragon",
    "ghost", "dark", "fairy", "normal", "fighting", "flying",
    "poison", "ground", "rock", "bug", "steel", "ice"
] as const;

export function TeamForm({ onGenerate, format, onFormatChange, isLoading: parentLoading, initialFormat, initialTemplate, initialType }: TeamFormProps) {
    const [type, setType] = useState("all");
    const [fixedPokemon, setFixedPokemon] = useState<string[]>([]);
    const [pokemonName, setPokemonName] = useState("");
    const [templateId, setTemplateId] = useState<TemplateId>("balanced");
    const [excludeLegendaries, setExcludeLegendaries] = useState(false);
    const [localLoading, setLocalLoading] = useState(false);
    const { t, lang } = useTranslation();

    // Apply initial values from props
    useEffect(() => {
        if (initialFormat && initialFormat !== format) {
            onFormatChange(initialFormat);
        }
    }, [initialFormat, format, onFormatChange]);

    useEffect(() => {
        if (initialTemplate && initialTemplate !== templateId) {
            setTemplateId(initialTemplate);
        }
    }, [initialTemplate, templateId]);

    useEffect(() => {
        if (initialType && initialType !== type) {
            setType(initialType);
        }
    }, [initialType, type]);

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
                templateId,
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
                <form onSubmit={handleSubmit} className="space-y-6">
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
                                    {Object.entries(TEMPLATES).map(([key]) => (
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
                                value={pokemonName}
                                onChange={(name) => {
                                    if (name && !fixedPokemon.includes(name) && fixedPokemon.length < 6) {
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
                        />
                        <Label htmlFor="legendary">{t("form.excludeLegendaries")}</Label>
                    </div>

                    <Button type="submit" disabled={isLoading} className="w-full bg-rose-600 hover:bg-rose-700 text-white font-bold">
                        {isLoading ? t("form.generating") : t("form.generate")}
                    </Button>
                </form>
            </CardContent>
        </Card>
    );
}
