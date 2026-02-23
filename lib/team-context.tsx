"use client";

import { createContext, useContext, useState, ReactNode } from "react";
import { type PokedexEntry, getPokemonData } from "@/lib/showdown-data";
import { type GamePhase } from "@/lib/dynamic-builder";
import { type FormatId } from "@/config/formats";

type GameplanData = { early: GamePhase; mid: GamePhase; late: GamePhase };

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
    // Helper to add team with hydrated data
    addTeam: (rawTeam: any[], rawGameplan?: any, rawGameplanI18n?: any, options?: any) => void;
}

const TeamContext = createContext<TeamContextType | undefined>(undefined);

export function TeamProvider({ children }: { children: ReactNode }) {
    const [team, setTeam] = useState<PokedexEntry[]>([]);
    const [gameplan, setGameplan] = useState<GameplanData | null>(null);
    const [gameplanI18n, setGameplanI18n] = useState<Record<string, GameplanData> | null>(null);
    const [format, setFormat] = useState<FormatId>("gen9ou");
    const [generationOptions, setGenerationOptions] = useState<any>(null);

    const addTeam = (rawTeam: any[], rawGameplan?: any, rawGameplanI18n?: any, options?: any) => {
        const hydratedTeam = rawTeam.map((member: any) => {
            const staticData = getPokemonData(member.name);
            return {
                ...staticData,
                ...member,
            } as PokedexEntry;
        });

        setTeam(hydratedTeam);
        if (rawGameplan) {
            setGameplan(rawGameplan);
        }
        if (rawGameplanI18n) {
            setGameplanI18n(rawGameplanI18n);
        }
        if (options) {
            setGenerationOptions(options);
        }
    };

    return (
        <TeamContext.Provider
            value={{
                team,
                setTeam,
                gameplan,
                setGameplan,
                gameplanI18n,
                setGameplanI18n,
                format,
                setFormat,
                generationOptions,
                setGenerationOptions,
                addTeam,
            }}
        >
            {children}
        </TeamContext.Provider>
    );
}

export function useTeam() {
    const context = useContext(TeamContext);
    if (!context) {
        throw new Error("useTeam must be used within a TeamProvider");
    }
    return context;
}
