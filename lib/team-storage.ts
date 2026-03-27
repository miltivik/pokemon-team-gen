import type { FormatId } from "@/config/formats";
import type { GamePhase } from "@/lib/dynamic-builder";
import type { PokedexEntry } from "@/lib/showdown-data";

export type GameplanData = { early: GamePhase; mid: GamePhase; late: GamePhase };

export interface TeamStorageSnapshot {
    team: PokedexEntry[];
    gameplan: GameplanData | null;
    gameplanI18n: Record<string, GameplanData> | null;
    format: FormatId;
    generationOptions: any;
}

const TEAM_STORAGE_KEY = "team-context-v1";
const SAVED_TEAMS_KEY = "saved-teams";

export const DEFAULT_TEAM_STATE: TeamStorageSnapshot = {
    team: [],
    gameplan: null,
    gameplanI18n: null,
    format: "gen9ou",
    generationOptions: null,
};

export function readStoredTeamState(): TeamStorageSnapshot {
    if (typeof window === "undefined") {
        return DEFAULT_TEAM_STATE;
    }

    try {
        const stored = window.sessionStorage.getItem(TEAM_STORAGE_KEY);
        if (!stored) {
            return DEFAULT_TEAM_STATE;
        }

        return {
            ...DEFAULT_TEAM_STATE,
            ...JSON.parse(stored),
        };
    } catch {
        return DEFAULT_TEAM_STATE;
    }
}

export function writeStoredTeamState(state: TeamStorageSnapshot) {
    if (typeof window === "undefined") {
        return;
    }

    window.sessionStorage.setItem(TEAM_STORAGE_KEY, JSON.stringify(state));
}

export function getSavedTeamsCount() {
    if (typeof window === "undefined") {
        return 0;
    }

    try {
        const stored = window.localStorage.getItem(SAVED_TEAMS_KEY);
        if (!stored) {
            return 0;
        }

        const parsed = JSON.parse(stored);
        return Array.isArray(parsed) ? parsed.length : 0;
    } catch {
        return 0;
    }
}
