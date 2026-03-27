"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
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
    const { t } = useTranslation();
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
        <div className="flex flex-wrap gap-3 justify-center" role="group" aria-label="Quick actions">
            {hasStoredTeam && (
                <Link href="/equipo">
                    <Button
                        variant="outline"
                        size="sm"
                        className="bg-white dark:bg-zinc-900 focus-visible:ring-2 focus-visible:ring-blue-400 focus-visible:ring-offset-2"
                    >
                        <span aria-hidden="true">📋</span> {t("app.viewPreviousTeam")}
                    </Button>
                </Link>
            )}
            {savedTeamsCount > 0 && (
                <Link href="/saved-teams">
                    <Button
                        variant="outline"
                        size="sm"
                        className="bg-white dark:bg-zinc-900 focus-visible:ring-2 focus-visible:ring-blue-400 focus-visible:ring-offset-2"
                    >
                        <span aria-hidden="true">📁</span> {t("nav.savedTeams")} ({savedTeamsCount})
                    </Button>
                </Link>
            )}
        </div>
    );
}
