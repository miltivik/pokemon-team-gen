"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { FolderKanban, History } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useTranslation } from "@/lib/i18n";
import { getSavedTeamsCount, readStoredTeamState } from "@/lib/team-storage";

function readQuickActionState() {
    const storedTeam = readStoredTeamState().team;

    return {
        hasStoredTeam: storedTeam.length > 0,
        savedTeamsCount: getSavedTeamsCount(),
    };
}

export function HomeQuickActions() {
    const { t, lang } = useTranslation();
    const [hasStoredTeam, setHasStoredTeam] = useState(false);
    const [savedTeamsCount, setSavedTeamsCount] = useState(0);

    useEffect(() => {
        const sync = () => {
            const next = readQuickActionState();
            setHasStoredTeam(next.hasStoredTeam);
            setSavedTeamsCount(next.savedTeamsCount);
        };

        sync();
        window.addEventListener("storage", sync);
        window.addEventListener("focus", sync);

        return () => {
            window.removeEventListener("storage", sync);
            window.removeEventListener("focus", sync);
        };
    }, []);

    if (!hasStoredTeam && savedTeamsCount === 0) {
        return null;
    }

    return (
        <div
            className="flex flex-wrap justify-center gap-3"
            role="group"
            aria-label={lang === "es" ? "Acciones rápidas" : "Quick actions"}
        >
            {hasStoredTeam && (
                <Link href="/equipo">
                    <Button
                        variant="outline"
                        size="sm"
                        className="gap-2 bg-white focus-visible:ring-2 focus-visible:ring-blue-400 focus-visible:ring-offset-2 dark:bg-zinc-900"
                    >
                        <History className="h-4 w-4" />
                        {t("app.viewPreviousTeam")}
                    </Button>
                </Link>
            )}
            {savedTeamsCount > 0 && (
                <Link href="/saved-teams">
                    <Button
                        variant="outline"
                        size="sm"
                        className="gap-2 bg-white focus-visible:ring-2 focus-visible:ring-blue-400 focus-visible:ring-offset-2 dark:bg-zinc-900"
                    >
                        <FolderKanban className="h-4 w-4" />
                        {t("nav.savedTeams")} ({savedTeamsCount})
                    </Button>
                </Link>
            )}
        </div>
    );
}
