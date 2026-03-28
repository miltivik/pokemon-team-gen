"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import type { FormatId } from "@/config/formats";
import { DEFAULT_TEAM_STATE, readStoredTeamState, writeStoredTeamState, type GameplanData, type TeamStorageSnapshot } from "@/lib/team-storage";
import {
    cloneGenerationOptions,
    getGenerationOptionsFormat,
    type TeamGenerationOptions,
} from "@/lib/team-generation-options";
import type { GeneratedTeamMember, TeamGuideData } from "@/lib/team-guide";

interface TeamContextType {
    team: GeneratedTeamMember[];
    setTeam: (team: GeneratedTeamMember[]) => void;
    gameplan: GameplanData | null;
    setGameplan: (gameplan: GameplanData | null) => void;
    gameplanI18n: Record<string, GameplanData> | null;
    setGameplanI18n: (gameplan: Record<string, GameplanData> | null) => void;
    teamGuide: TeamGuideData | null;
    setTeamGuide: (teamGuide: TeamGuideData | null) => void;
    teamGuideI18n: Record<string, TeamGuideData> | null;
    setTeamGuideI18n: (teamGuide: Record<string, TeamGuideData> | null) => void;
    format: FormatId;
    setFormat: (format: FormatId) => void;
    generationOptions: TeamGenerationOptions | null;
    setGenerationOptions: (options: TeamGenerationOptions | null) => void;
    isHydrated: boolean;
    addTeam: (
        rawTeam: GeneratedTeamMember[],
        rawGameplan?: GameplanData | null,
        rawGameplanI18n?: Record<string, GameplanData> | null,
        rawTeamGuide?: TeamGuideData | null,
        rawTeamGuideI18n?: Record<string, TeamGuideData> | null,
        options?: TeamGenerationOptions | null
    ) => void;
}

const TeamContext = createContext<TeamContextType | undefined>(undefined);

export function TeamProvider({ children }: { children: ReactNode }) {
    const [state, setState] = useState<TeamStorageSnapshot>(DEFAULT_TEAM_STATE);
    const [isHydrated, setIsHydrated] = useState(false);
    const stateRef = useRef<TeamStorageSnapshot>(DEFAULT_TEAM_STATE);

    const commitState = useCallback((nextState: TeamStorageSnapshot) => {
        stateRef.current = nextState;
        writeStoredTeamState(nextState);
        setState(nextState);
    }, []);

    useEffect(() => {
        const storedState = readStoredTeamState();
        stateRef.current = storedState;
        // This hydration step intentionally replays sessionStorage after mount.
        // eslint-disable-next-line react-hooks/set-state-in-effect
        setState(storedState);
        setIsHydrated(true);
    }, []);

    const updateState = useCallback(
        (updater: (current: TeamStorageSnapshot) => TeamStorageSnapshot) => {
            const nextState = updater(stateRef.current);
            commitState(nextState);
        },
        [commitState]
    );

    const setTeam = useCallback(
        (team: GeneratedTeamMember[]) => {
            updateState((current) => ({ ...current, team }));
        },
        [updateState]
    );

    const setGameplan = useCallback(
        (gameplan: GameplanData | null) => {
            updateState((current) => ({ ...current, gameplan }));
        },
        [updateState]
    );

    const setGameplanI18n = useCallback(
        (gameplanI18n: Record<string, GameplanData> | null) => {
            updateState((current) => ({ ...current, gameplanI18n }));
        },
        [updateState]
    );

    const setTeamGuide = useCallback(
        (teamGuide: TeamGuideData | null) => {
            updateState((current) => ({ ...current, teamGuide }));
        },
        [updateState]
    );

    const setTeamGuideI18n = useCallback(
        (teamGuideI18n: Record<string, TeamGuideData> | null) => {
            updateState((current) => ({ ...current, teamGuideI18n }));
        },
        [updateState]
    );

    const setFormat = useCallback(
        (format: FormatId) => {
            updateState((current) => ({ ...current, format }));
        },
        [updateState]
    );

    const setGenerationOptions = useCallback(
        (generationOptions: TeamGenerationOptions | null) => {
            updateState((current) => ({
                ...current,
                generationOptions: cloneGenerationOptions(generationOptions),
            }));
        },
        [updateState]
    );

    const addTeam = useCallback(
        (
            rawTeam: GeneratedTeamMember[],
            rawGameplan?: GameplanData | null,
            rawGameplanI18n?: Record<string, GameplanData> | null,
            rawTeamGuide?: TeamGuideData | null,
            rawTeamGuideI18n?: Record<string, TeamGuideData> | null,
            options?: TeamGenerationOptions | null
        ) => {
            updateState((current) => ({
                ...current,
                team: rawTeam,
                gameplan: rawGameplan ?? current.gameplan,
                gameplanI18n: rawGameplanI18n ?? current.gameplanI18n,
                teamGuide: rawTeamGuide ?? current.teamGuide,
                teamGuideI18n: rawTeamGuideI18n ?? current.teamGuideI18n,
                format:
                    getGenerationOptionsFormat(
                        cloneGenerationOptions(options) ?? current.generationOptions
                    ) ?? current.format,
                generationOptions:
                    cloneGenerationOptions(options) ?? current.generationOptions,
            }));
        },
        [updateState]
    );

    const value = useMemo(
        () => ({
            team: state.team,
            setTeam,
            gameplan: state.gameplan,
            setGameplan,
            gameplanI18n: state.gameplanI18n,
            setGameplanI18n,
            teamGuide: state.teamGuide,
            setTeamGuide,
            teamGuideI18n: state.teamGuideI18n,
            setTeamGuideI18n,
            format: state.format,
            setFormat,
            generationOptions: state.generationOptions,
            setGenerationOptions,
            isHydrated,
            addTeam,
        }),
        [
            addTeam,
            isHydrated,
            setFormat,
            setGameplan,
            setGameplanI18n,
            setTeamGuide,
            setTeamGuideI18n,
            setGenerationOptions,
            setTeam,
            state.format,
            state.gameplan,
            state.gameplanI18n,
            state.teamGuide,
            state.teamGuideI18n,
            state.generationOptions,
            state.team,
        ]
    );

    return (
        <TeamContext.Provider value={value}>{children}</TeamContext.Provider>
    );
}

export function useTeam() {
    const context = useContext(TeamContext);
    if (!context) {
        throw new Error("useTeam must be used within a TeamProvider");
    }
    return context;
}
