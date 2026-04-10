const GEN_MAP: Record<string, string> = {
    gen9: "sv",
    gen8: "ss",
    gen7: "sm",
    gen6: "xy",
    gen5: "bw",
    gen4: "dp",
    gen3: "rs",
    gen2: "gs",
    gen1: "rb",
};

export function getSmogonUrl(pokemonName: string, format: string = "gen9ou"): string {
    const normalizedName = pokemonName
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/^-|-$/g, "");

    const genKey = Object.keys(GEN_MAP).find((g) => format.toLowerCase().startsWith(g));
    const gen = genKey ? GEN_MAP[genKey] : "sv";

    return `https://www.smogon.com/dex/${gen}/pokemon/${normalizedName}/`;
}
