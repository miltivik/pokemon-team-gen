"use client";

import { ThemeProvider } from "next-themes";
import { LanguageProvider } from "@/lib/i18n";
import { TeamProvider } from "@/lib/team-context";
import { Toaster } from "@/components/ui/sonner";

interface ProvidersProps {
    children: React.ReactNode;
    initialLang?: "en" | "es";
}

export function Providers({ children, initialLang }: ProvidersProps) {
    return (
        <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
            <LanguageProvider initialLang={initialLang}>
                <TeamProvider>
                    {children}
                </TeamProvider>
                <Toaster position="bottom-center" richColors expand visibleToasts={3} />
            </LanguageProvider>
        </ThemeProvider>
    );
}
