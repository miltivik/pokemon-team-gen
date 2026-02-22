
export type FormatId =
    // Gen 9
    | 'gen9ou'
    | 'gen9ubers'
    | 'gen9uu'
    | 'gen9ru'
    | 'gen9lc'
    | 'gen9monotype'
    | 'gen9doublesou'
    | 'gen9vgc2026f'
    // Gen 8
    | 'gen8ou'
    | 'gen8ubers'
    | 'gen8uu'
    | 'gen8lc'
    | 'gen8monotype'
    | 'gen8doublesou'
    // Gen 7
    | 'gen7ou'
    | 'gen7ubers'
    | 'gen7uu'
    | 'gen7lc'
    | 'gen7monotype'
    | 'gen7doublesou'
    // Gen 6
    | 'gen6ou'
    | 'gen6ubers'
    | 'gen6uu'
    | 'gen6lc'
    | 'gen6monotype'
    // Gen 5
    | 'gen5ou'
    | 'gen5ubers'
    | 'gen5uu'
    // Gen 4
    | 'gen4ou'
    | 'gen4ubers'
    | 'gen4uu'
    // Gen 3
    | 'gen3ou'
    | 'gen3ubers'
    // Gen 2
    | 'gen2ou'
    // Gen 1
    | 'gen1ou';

export type GameType = 'singles' | 'doubles';

export const FORMATS: Record<FormatId, {
    label: string;
    maxTeamSize: number;
    gameType: GameType;
}> = {
    // ── Gen 9 ──────────────────────────────────────
    gen9ou: { label: '[Gen 9] OU', maxTeamSize: 6, gameType: 'singles' },
    gen9ubers: { label: '[Gen 9] Ubers', maxTeamSize: 6, gameType: 'singles' },
    gen9uu: { label: '[Gen 9] UU', maxTeamSize: 6, gameType: 'singles' },
    gen9ru: { label: '[Gen 9] RU', maxTeamSize: 6, gameType: 'singles' },
    gen9lc: { label: '[Gen 9] LC', maxTeamSize: 6, gameType: 'singles' },
    gen9monotype: { label: '[Gen 9] Monotype', maxTeamSize: 6, gameType: 'singles' },
    gen9doublesou: { label: '[Gen 9] Doubles OU', maxTeamSize: 6, gameType: 'doubles' },
    gen9vgc2026f: { label: '[Gen 9] VGC 2026 Reg F', maxTeamSize: 4, gameType: 'doubles' },

    // ── Gen 8 ──────────────────────────────────────
    gen8ou: { label: '[Gen 8] OU', maxTeamSize: 6, gameType: 'singles' },
    gen8ubers: { label: '[Gen 8] Ubers', maxTeamSize: 6, gameType: 'singles' },
    gen8uu: { label: '[Gen 8] UU', maxTeamSize: 6, gameType: 'singles' },
    gen8lc: { label: '[Gen 8] LC', maxTeamSize: 6, gameType: 'singles' },
    gen8monotype: { label: '[Gen 8] Monotype', maxTeamSize: 6, gameType: 'singles' },
    gen8doublesou: { label: '[Gen 8] Doubles OU', maxTeamSize: 6, gameType: 'doubles' },

    // ── Gen 7 ──────────────────────────────────────
    gen7ou: { label: '[Gen 7] OU', maxTeamSize: 6, gameType: 'singles' },
    gen7ubers: { label: '[Gen 7] Ubers', maxTeamSize: 6, gameType: 'singles' },
    gen7uu: { label: '[Gen 7] UU', maxTeamSize: 6, gameType: 'singles' },
    gen7lc: { label: '[Gen 7] LC', maxTeamSize: 6, gameType: 'singles' },
    gen7monotype: { label: '[Gen 7] Monotype', maxTeamSize: 6, gameType: 'singles' },
    gen7doublesou: { label: '[Gen 7] Doubles OU', maxTeamSize: 6, gameType: 'doubles' },

    // ── Gen 6 ──────────────────────────────────────
    gen6ou: { label: '[Gen 6] OU', maxTeamSize: 6, gameType: 'singles' },
    gen6ubers: { label: '[Gen 6] Ubers', maxTeamSize: 6, gameType: 'singles' },
    gen6uu: { label: '[Gen 6] UU', maxTeamSize: 6, gameType: 'singles' },
    gen6lc: { label: '[Gen 6] LC', maxTeamSize: 6, gameType: 'singles' },
    gen6monotype: { label: '[Gen 6] Monotype', maxTeamSize: 6, gameType: 'singles' },

    // ── Gen 5 ──────────────────────────────────────
    gen5ou: { label: '[Gen 5] OU', maxTeamSize: 6, gameType: 'singles' },
    gen5ubers: { label: '[Gen 5] Ubers', maxTeamSize: 6, gameType: 'singles' },
    gen5uu: { label: '[Gen 5] UU', maxTeamSize: 6, gameType: 'singles' },

    // ── Gen 4 ──────────────────────────────────────
    gen4ou: { label: '[Gen 4] OU', maxTeamSize: 6, gameType: 'singles' },
    gen4ubers: { label: '[Gen 4] Ubers', maxTeamSize: 6, gameType: 'singles' },
    gen4uu: { label: '[Gen 4] UU', maxTeamSize: 6, gameType: 'singles' },

    // ── Gen 3 ──────────────────────────────────────
    gen3ou: { label: '[Gen 3] OU', maxTeamSize: 6, gameType: 'singles' },
    gen3ubers: { label: '[Gen 3] Ubers', maxTeamSize: 6, gameType: 'singles' },

    // ── Gen 2 ──────────────────────────────────────
    gen2ou: { label: '[Gen 2] OU', maxTeamSize: 6, gameType: 'singles' },

    // ── Gen 1 ──────────────────────────────────────
    gen1ou: { label: '[Gen 1] OU', maxTeamSize: 6, gameType: 'singles' },
};

export const CURRENT_VGC_FORMAT: FormatId = 'gen9vgc2026f';

/**
 * Extracts the generation number from a format ID.
 * e.g. 'gen4ou' → 4, 'gen9doublesou' → 9
 */
export function getGenFromFormat(formatId: FormatId): number {
    const match = formatId.match(/^gen(\d+)/);
    return match ? parseInt(match[1], 10) : 9;
}
