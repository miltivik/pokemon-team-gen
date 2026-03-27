"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import type { FormatId } from "@/config/formats";
import type { PokedexEntry } from "@/lib/showdown-data";
import { DEFAULT_TEAM_STATE, readStoredTeamState, writeStoredTeamState, type GameplanData, type TeamStorageSnapshot } from "@/lib/team-storage";

interface TeamContextType {
    team: PokedexEntry[];
    setTeam: (team: PokedexEntry[]) => void;
    gameplan: GameplanData | null;
    setGameplan: (gameplan: GameplanData | null) => void;
    gameplanI18n: Record<string, GameplanData> | null;
    setGameplanI18n: (gameplan: Record<string, GameplanData> | null) => void;
    format: FormatId;
    setFormat: (format: FormatId) => void;
    generationOptions: any;
    setGenerationOptions: (options: any) => void;
    isHydrated: boolean;
    addTeam: (rawTeam: any[], rawGameplan?: any, rawGameplanI18n?: any, options?: any) => void;
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
        (team: PokedexEntry[]) => {
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

    const setFormat = useCallback(
        (format: FormatId) => {
            updateState((current) => ({ ...current, format }));
        },
        [updateState]
    );

    const setGenerationOptions = useCallback(
        (generationOptions: any) => {
            updateState((current) => ({ ...current, generationOptions }));
        },
        [updateState]
    );

    const addTeam = useCallback(
        (rawTeam: any[], rawGameplan?: any, rawGameplanI18n?: any, options?: any) => {
            updateState((current) => ({
                ...current,
                team: rawTeam as PokedexEntry[],
                gameplan: rawGameplan ?? current.gameplan,
                gameplanI18n: rawGameplanI18n ?? current.gameplanI18n,
                generationOptions: options ?? current.generationOptions,
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
            setGenerationOptions,
            setTeam,
            state.format,
            state.gameplan,
            state.gameplanI18n,
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
