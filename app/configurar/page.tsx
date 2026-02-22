"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { TeamForm } from "@/components/TeamForm";
import { useTeam } from "@/lib/team-context";
import { FormatId, FORMATS } from "@/config/formats";
import { TemplateId, TEMPLATES } from "@/config/templates";
import { AdResponsive, AdBanner, AdInline } from "@/components/monetization/Ads";
import { useTranslation } from "@/lib/i18n";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { useEffect, useMemo } from "react";
import { analytics } from "@/lib/analytics";

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

export default function ConfigurarPage() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const { format, setFormat, addTeam, team } = useTeam();
    const { t } = useTranslation();

    // Read format and template from URL query parameters
    const initialFormat = useMemo(() => {
        const formatParam = searchParams.get("format");
        if (formatParam && isValidFormat(formatParam)) {
            return formatParam as FormatId;
        }
        return undefined;
    }, [searchParams]);

    const initialTemplate = useMemo(() => {
        const templateParam = searchParams.get("template");
        if (templateParam && isValidTemplate(templateParam)) {
            return templateParam as TemplateId;
        }
        return undefined;
    }, [searchParams]);

    const initialType = useMemo(() => {
        const tipoStr = searchParams.get("tipo");
        return tipoStr ? tipoStr.toLowerCase() : undefined;
    }, [searchParams]);

    // Apply URL format to context when initialFormat changes
    useEffect(() => {
        if (initialFormat) {
            setFormat(initialFormat);
        }
    }, [initialFormat, setFormat]);

    // Track page view
    useEffect(() => {
        analytics.viewConfigurar();
    }, []);

    const handleGenerate = (data: { team: any[]; gameplan?: any; gameplanI18n?: any, templateId?: string }) => {
        // Track team generation
        analytics.generateTeam(format, data.templateId || "balanced");
        // Add team to context
        addTeam(data.team, data.gameplan, data.gameplanI18n);
        // Navigate to team page
        router.push("/equipo");
    };

    return (
        <div className="min-h-screen bg-zinc-50 dark:bg-black font-sans">
            <main className="container mx-auto px-4 py-8 flex flex-col items-center gap-8">
                {/* Ad at top */}
                <section className="w-full flex justify-center">
                    <AdResponsive />
                </section>

                {/* Header */}
                <header className="text-center space-y-4">
                    <h1 className="text-3xl font-bold tracking-tight text-zinc-900 dark:text-zinc-50">
                        {t("form.title")}
                    </h1>
                    <p className="text-lg text-zinc-600 dark:text-zinc-400">
                        {t("form.description")}
                    </p>
                    {/* Show selected format badge if coming from URL */}
                    {initialFormat && (
                        <div className="flex justify-center gap-2">
                            <span className="px-3 py-1 bg-blue-600 text-white rounded-full text-sm font-medium">
                                {initialFormat.toUpperCase()}
                            </span>
                            {initialTemplate && (
                                <span className="px-3 py-1 bg-purple-600 text-white rounded-full text-sm font-medium">
                                    {initialTemplate}
                                </span>
                            )}
                        </div>
                    )}
                </header>

                {/* Ad Banner before form */}
                <section className="w-full flex justify-center py-4">
                    <AdBanner />
                </section>

                {/* Form */}
                <section className="w-full flex justify-center">
                    <TeamForm
                        key={initialFormat || 'default'}
                        onGenerate={handleGenerate}
                        format={format}
                        onFormatChange={setFormat}
                        initialFormat={initialFormat}
                        initialTemplate={initialTemplate}
                        initialType={initialType}
                    />
                </section>

                <AdInline />

                {/* Ad Banner after form */}
                <section className="w-full flex justify-center py-4">
                    <AdBanner />
                </section>

                {/* Link to previous team if exists */}
                {team.length > 0 && (
                    <div className="text-center pt-4">
                        <Link href="/equipo">
                            <Button variant="outline">
                                ← {t("app.viewPreviousTeam")}
                            </Button>
                        </Link>
                    </div>
                )}
            </main>
        </div>
    );
}
