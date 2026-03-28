"use client";

import { ThemeProvider } from "next-themes";
import { LanguageProvider } from "@/lib/i18n";
import { TeamProvider } from "@/lib/team-context";
import { Toaster } from "@/components/ui/sonner";

export function Providers({ children }: { children: React.ReactNode }) {
    return (
        <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
            <LanguageProvider>
                <TeamProvider>
                    {children}
                </TeamProvider>
                <Toaster position="bottom-center" richColors expand visibleToasts={3} />
            </LanguageProvider>
        </ThemeProvider>
    );
}
