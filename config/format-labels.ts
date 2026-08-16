/**
 * Display map for the "core" Smogon format keys found in gen9-sets.json.
 *
 * Only formats listed here are shown on Pokemon profile pages. Gimmick/OM
 * formats present in the data (godlygift, stabmons, 1v1, inheritance,
 * almostanyability, mixandmega, partnersincrime, balancedhackmons, cap,
 * nfe...) are intentionally omitted to keep profiles focused on the
 * competitive formats the site targets.
 *
 * href deep-links to the team generator only for formats the site actually
 * supports (config/formats.ts FormatIds). VGC year formats and BSS have no
 * current equivalent, so they render as display-only pills.
 */
export interface CoreFormatInfo {
    label: string;
    href?: string;
    order: number;
}

export const CORE_FORMATS: Record<string, CoreFormatInfo> = {
    ou: { label: "Gen 9 OU", href: "/configurar?format=gen9ou", order: 1 },
    vgc2025: { label: "VGC 2025", order: 2 },
    vgc2024: { label: "VGC 2024", order: 3 },
    vgc2023: { label: "VGC 2023", order: 4 },
    uu: { label: "UU", href: "/configurar?format=gen9uu", order: 5 },
    ubers: { label: "Ubers", href: "/configurar?format=gen9ubers", order: 6 },
    ru: { label: "RU", href: "/configurar?format=gen9ru", order: 7 },
    nationaldex: { label: "National Dex", href: "/configurar?format=gen9nationaldex", order: 8 },
    nationaldexubers: { label: "National Dex Ubers", href: "/configurar?format=gen9nationaldexubers", order: 9 },
    nationaldexuu: { label: "National Dex UU", order: 10 },
    nationaldexru: { label: "National Dex RU", order: 11 },
    nationaldexmonotype: { label: "National Dex Monotype", order: 12 },
    nationaldexdoubles: { label: "National Dex Doubles", order: 13 },
    monotype: { label: "Monotype", href: "/configurar?format=gen9monotype", order: 14 },
    nu: { label: "NU", order: 15 },
    pu: { label: "PU", order: 16 },
    zu: { label: "ZU", order: 17 },
    ubersuu: { label: "Ubers UU", order: 18 },
    doublesou: { label: "Doubles OU", href: "/configurar?format=gen9doublesou", order: 19 },
    battlestadiumsingles: { label: "Battle Stadium Singles", order: 20 },
    lc: { label: "LC", href: "/configurar?format=gen9lc", order: 21 },
};
