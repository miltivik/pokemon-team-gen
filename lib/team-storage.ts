import type { FormatId } from "@/config/formats";
import type { GamePhase, GeneratedTeamMember, TeamGuideData } from "@/lib/team-guide";
import { cloneGenerationOptions, type TeamGenerationOptions } from "@/lib/team-generation-options";

export type GameplanData = { early: GamePhase; mid: GamePhase; late: GamePhase };

export interface TeamStorageSnapshot {
    team: GeneratedTeamMember[];
    gameplan: GameplanData | null;
    gameplanI18n: Record<string, GameplanData> | null;
    teamGuide: TeamGuideData | null;
    teamGuideI18n: Record<string, TeamGuideData> | null;
    format: FormatId;
    generationOptions: TeamGenerationOptions | null;
}

export interface SavedTeamRecord {
    id: string;
    team: GeneratedTeamMember[];
    format: FormatId;
    createdAt: string;
    name?: string;
    generationOptions: TeamGenerationOptions | null;
}

const TEAM_STORAGE_KEY = "team-context-v2";
const SAVED_TEAMS_KEY = "saved-teams";
const SAVED_TEAMS_LIMIT = 50;
export const TEAM_PRESENCE_COOKIE_KEY = "ptg_has_team";

const EMPTY_BASE_STATS = {
    hp: 0,
    atk: 0,
    def: 0,
    spa: 0,
    spd: 0,
    spe: 0,
};

export const DEFAULT_TEAM_STATE: TeamStorageSnapshot = {
    team: [],
    gameplan: null,
    gameplanI18n: null,
    teamGuide: null,
    teamGuideI18n: null,
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
    document.cookie = state.team.length > 0
        ? `${TEAM_PRESENCE_COOKIE_KEY}=1; Path=/; SameSite=Lax`
        : `${TEAM_PRESENCE_COOKIE_KEY}=; Path=/; Max-Age=0; SameSite=Lax`;
}

function normalizeBaseStats(value: unknown) {
    if (!value || typeof value !== "object") {
        return EMPTY_BASE_STATS;
    }

    const stats = value as Record<string, unknown>;
    return {
        hp: typeof stats.hp === "number" ? stats.hp : 0,
        atk: typeof stats.atk === "number" ? stats.atk : 0,
        def: typeof stats.def === "number" ? stats.def : 0,
        spa: typeof stats.spa === "number" ? stats.spa : 0,
        spd: typeof stats.spd === "number" ? stats.spd : 0,
        spe: typeof stats.spe === "number" ? stats.spe : 0,
    };
}

function compactMoves(moves: unknown): string[] {
    if (!Array.isArray(moves)) {
        return [];
    }

    return moves
        .map((move) => {
            if (typeof move === "string") {
                return move;
            }

            if (move && typeof move === "object" && "name" in move) {
                const rawName = (move as { name?: unknown }).name;
                return typeof rawName === "string" ? rawName : "";
            }

            return "";
        })
        .filter(Boolean);
}

function compactTeamMember(member: unknown): GeneratedTeamMember | null {
    if (!member || typeof member !== "object") {
        return null;
    }

    const rawMember = member as Record<string, unknown>;
    const name = typeof rawMember.name === "string" ? rawMember.name.trim() : "";

    if (!name) {
        return null;
    }

    const types = Array.isArray(rawMember.types)
        ? rawMember.types.filter((type): type is string => typeof type === "string")
        : [];
    const abilities = rawMember.abilities && typeof rawMember.abilities === "object"
        ? Object.fromEntries(
            Object.entries(rawMember.abilities as Record<string, unknown>).filter(
                (entry): entry is [string, string] => typeof entry[1] === "string"
            )
        )
        : {};
    const role =
        rawMember.role === "Sweeper" ||
        rawMember.role === "Wall" ||
        rawMember.role === "Tank" ||
        rawMember.role === "Support"
            ? rawMember.role
            : "Support";

    return {
        num: typeof rawMember.num === "number" ? rawMember.num : 0,
        name,
        types,
        baseStats: normalizeBaseStats(rawMember.baseStats),
        abilities,
        item: typeof rawMember.item === "string" ? rawMember.item : "",
        ability: typeof rawMember.ability === "string" ? rawMember.ability : "",
        moves: compactMoves(rawMember.moves),
        nature: typeof rawMember.nature === "string" ? rawMember.nature : "Serious",
        evs: typeof rawMember.evs === "string" ? rawMember.evs : "",
        role,
        teraType: typeof rawMember.teraType === "string" ? rawMember.teraType : undefined,
        selectedBuildPresetId:
            typeof rawMember.selectedBuildPresetId === "string"
                ? rawMember.selectedBuildPresetId
                : undefined,
    };
}

function normalizeSavedTeamRecord(record: unknown): SavedTeamRecord | null {
    if (!record || typeof record !== "object") {
        return null;
    }

    const rawRecord = record as Record<string, unknown>;
    const team = Array.isArray(rawRecord.team)
        ? rawRecord.team
            .map((member) => compactTeamMember(member))
            .filter((member): member is GeneratedTeamMember => Boolean(member))
        : [];

    if (team.length === 0) {
        return null;
    }

    return {
        id:
            typeof rawRecord.id === "string" && rawRecord.id.trim().length > 0
                ? rawRecord.id
                : `${Date.now()}`,
        team,
        format:
            typeof rawRecord.format === "string"
                ? (rawRecord.format as FormatId)
                : "gen9ou",
        createdAt:
            typeof rawRecord.createdAt === "string" && rawRecord.createdAt.trim().length > 0
                ? rawRecord.createdAt
                : new Date().toISOString(),
        name:
            typeof rawRecord.name === "string" && rawRecord.name.trim().length > 0
                ? rawRecord.name.trim()
                : undefined,
        generationOptions: cloneGenerationOptions(
            (rawRecord.generationOptions as TeamGenerationOptions | null | undefined) ?? null
        ),
    };
}

export function readSavedTeamsFromStorage(): SavedTeamRecord[] {
    if (typeof window === "undefined") {
        return [];
    }

    try {
        const stored = window.localStorage.getItem(SAVED_TEAMS_KEY);
        if (!stored) {
            return [];
        }

        const parsed = JSON.parse(stored);
        if (!Array.isArray(parsed)) {
            return [];
        }

        return parsed
            .map((record) => normalizeSavedTeamRecord(record))
            .filter((record): record is SavedTeamRecord => Boolean(record))
            .sort((left, right) => {
                const leftTime = new Date(left.createdAt).getTime();
                const rightTime = new Date(right.createdAt).getTime();
                return rightTime - leftTime;
            });
    } catch {
        return [];
    }
}

export function writeSavedTeamsToStorage(teams: SavedTeamRecord[]) {
    if (typeof window === "undefined") {
        return;
    }

    const sanitizedTeams = teams
        .map((record) => normalizeSavedTeamRecord(record))
        .filter((record): record is SavedTeamRecord => Boolean(record))
        .slice(0, SAVED_TEAMS_LIMIT);

    window.localStorage.setItem(SAVED_TEAMS_KEY, JSON.stringify(sanitizedTeams));
}

export function saveTeamToSavedTeams(input: Pick<TeamStorageSnapshot, "team" | "format" | "generationOptions">) {
    if (typeof window === "undefined" || input.team.length === 0) {
        return null;
    }

    const nextRecord: SavedTeamRecord = {
        id: Date.now().toString(),
        team: input.team
            .map((member) => compactTeamMember(member))
            .filter((member): member is GeneratedTeamMember => Boolean(member)),
        format: input.format,
        createdAt: new Date().toISOString(),
        generationOptions: cloneGenerationOptions(input.generationOptions),
    };

    if (nextRecord.team.length === 0) {
        return null;
    }

    writeSavedTeamsToStorage([nextRecord, ...readSavedTeamsFromStorage()]);
    return nextRecord;
}

export function getSavedTeamsCount() {
    return readSavedTeamsFromStorage().length;
}
