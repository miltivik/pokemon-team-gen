"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useMemo } from "react";
import { TeamForm } from "@/components/TeamForm";
import { ConfigurarPageSkeleton } from "@/components/page-skeletons";
import { AdBanner, AdHero, AdInline } from "@/components/monetization/Ads";
import { Button } from "@/components/ui/button";
import { FORMATS, FormatId } from "@/config/formats";
import {
    TemplateId,
    TEMPLATES,
    isTemplateCompatible,
    sanitizeTemplateForFormat,
} from "@/config/templates";
import { analytics } from "@/lib/analytics";
import { useTranslation } from "@/lib/i18n";
import { useTeam } from "@/lib/team-context";
import type { GameplanData } from "@/lib/team-storage";
import {
    cloneGenerationOptions,
    getGenerationOptionsFixedMembers,
    getGenerationOptionsFormat,
    getGenerationOptionsType,
    type TeamGenerationOptions,
} from "@/lib/team-generation-options";
import type { GeneratedTeamMember, TeamGuideData } from "@/lib/team-guide";

// Valid format IDs from config
const VALID_FORMATS = Object.keys(FORMATS) as FormatId[];
// Valid template IDs from config
const VALID_TEMPLATES = Object.keys(TEMPLATES) as TemplateId[];

function isValidFormat(format: string): format is FormatId {
    return VALID_FORMATS.includes(format as FormatId);
}

function isValidTemplate(template: string): template is TemplateId {
    return VALID_TEMPLATES.includes(template as TemplateId);
}

interface TeamGenerationResult {
    team: GeneratedTeamMember[];
    gameplan?: GameplanData | null;
    gameplanI18n?: Record<string, GameplanData> | null;
    teamGuide?: TeamGuideData | null;
    teamGuideI18n?: Record<string, TeamGuideData> | null;
    templateId?: string;
    options?: TeamGenerationOptions | null;
}

export default function ConfigurarPageClient() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const { format, setFormat, addTeam, team, isHydrated, generationOptions } = useTeam();
    const { t } = useTranslation();
    const storedGenerationOptions = useMemo(
        () => cloneGenerationOptions(generationOptions),
        [generationOptions]
    );

    // Read format and template from URL query parameters
    const initialFormat = useMemo(() => {
        const formatParam = searchParams.get("format");
        if (formatParam && isValidFormat(formatParam)) {
            return formatParam as FormatId;
        }

        return getGenerationOptionsFormat(storedGenerationOptions);
    }, [searchParams, storedGenerationOptions]);

    const initialTemplate = useMemo(() => {
        const templateParam = searchParams.get("template");
        const resolvedFormat = initialFormat ?? format;

        if (
            templateParam &&
            isValidTemplate(templateParam) &&
            isTemplateCompatible(templateParam, resolvedFormat)
        ) {
            return sanitizeTemplateForFormat(templateParam, resolvedFormat);
        }

        if (templateParam && isValidTemplate(templateParam) && !searchParams.get("format")) {
            return templateParam as TemplateId;
        }

        const storedTemplate = storedGenerationOptions?.templateId;
        if (
            storedTemplate &&
            isValidTemplate(storedTemplate) &&
            isTemplateCompatible(storedTemplate, resolvedFormat)
        ) {
            return sanitizeTemplateForFormat(storedTemplate, resolvedFormat);
        }

        return undefined;
    }, [format, initialFormat, searchParams, storedGenerationOptions]);

    const initialType = useMemo(() => {
        const tipoStr = searchParams.get("tipo");
        return tipoStr ? tipoStr.toLowerCase() : getGenerationOptionsType(storedGenerationOptions);
    }, [searchParams, storedGenerationOptions]);

    const initialExcludeLegendaries = useMemo(
        () => storedGenerationOptions?.excludeLegendaries ?? false,
        [storedGenerationOptions]
    );

    const initialFixedPokemon = useMemo(() => {
        const fixedMembers = getGenerationOptionsFixedMembers(storedGenerationOptions);
        const maxMembers = FORMATS[initialFormat ?? format].maxTeamSize;
        return fixedMembers.slice(0, maxMembers);
    }, [format, initialFormat, storedGenerationOptions]);

    const formSeedKey = useMemo(
        () =>
            JSON.stringify({
                format: initialFormat ?? format,
                template: initialTemplate ?? "balanced",
                type: initialType ?? "all",
                excludeLegendaries: initialExcludeLegendaries,
                fixedPokemon: initialFixedPokemon,
            }),
        [
            format,
            initialExcludeLegendaries,
            initialFixedPokemon,
            initialFormat,
            initialTemplate,
            initialType,
        ]
    );

    // Apply URL format to context when initialFormat changes
    useEffect(() => {
        if (isHydrated && initialFormat) {
            setFormat(initialFormat);
        }
    }, [initialFormat, isHydrated, setFormat]);

    // Track page view
    useEffect(() => {
        analytics.viewConfigurar();
    }, []);

    const handleGenerate = (data: TeamGenerationResult) => {
        analytics.generateTeam(data.options?.format || format, data.templateId || "balanced");
        addTeam(
            data.team,
            data.gameplan,
            data.gameplanI18n,
            data.teamGuide,
            data.teamGuideI18n,
            data.options
        );
        router.push("/equipo");
    };

    if (!isHydrated) {
        return (
            <ConfigurarPageSkeleton
                title={t("form.title")}
                description={t("form.description")}
            />
        );
    }

    return (
        <div className="min-h-screen bg-zinc-50 dark:bg-black font-sans">
            <main className="container mx-auto flex flex-col items-center gap-8 px-4 py-8">
                <header className="flex min-h-28 flex-col items-center justify-center space-y-4 text-center">
                    <h1 className="text-3xl font-bold tracking-tight text-zinc-900 dark:text-zinc-50">
                        {t("form.title")}
                    </h1>
                    <p className="text-lg text-zinc-600 dark:text-zinc-400">
                        {t("form.description")}
                    </p>
                    <div className="flex min-h-8 items-center justify-center gap-2">
                        {initialFormat && (
                            <span className="rounded-full bg-blue-600 px-3 py-1 text-sm font-medium text-white">
                                {initialFormat.toUpperCase()}
                            </span>
                        )}
                        {initialTemplate && (
                            <span className="rounded-full bg-purple-600 px-3 py-1 text-sm font-medium text-white">
                                {initialTemplate}
                            </span>
                        )}
                    </div>
                </header>

                <section className="w-full flex justify-center">
                    <AdHero />
                </section>

                <section className="w-full flex justify-center py-4">
                    <AdBanner />
                </section>

                <section className="w-full flex justify-center">
                    <TeamForm
                        key={formSeedKey}
                        onGenerate={handleGenerate}
                        format={format}
                        onFormatChange={setFormat}
                        initialTemplate={initialTemplate}
                        initialType={initialType}
                        initialExcludeLegendaries={initialExcludeLegendaries}
                        initialFixedPokemon={initialFixedPokemon}
                    />
                </section>

                <AdInline />

                <section className="w-full flex justify-center py-4">
                    <AdBanner />
                </section>

                <div className="flex min-h-14 w-full items-start justify-center pt-4">
                    {team.length > 0 ? (
                        <Link href="/equipo">
                            <Button variant="outline">
                                <span aria-hidden="true">&larr;</span> {t("app.viewPreviousTeam")}
                            </Button>
                        </Link>
                    ) : (
                        <div aria-hidden="true" className="h-10" />
                    )}
                </div>
            </main>
        </div>
    );
}
