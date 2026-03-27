const COMMON_ITEMS = ["Leftovers", "Life Orb", "Choice Scarf", "Choice Band", "Choice Specs"];
const COMMON_NATURES = ["Adamant", "Jolly", "Modest", "Timid", "Bold", "Calm"];

export function getExportText(team: any[]): string {
    return team
        .map((pokemon: any) => {
            const item =
                pokemon.item || COMMON_ITEMS[Math.floor(Math.random() * COMMON_ITEMS.length)];
            const nature =
                pokemon.nature || COMMON_NATURES[Math.floor(Math.random() * COMMON_NATURES.length)];
            const ability = pokemon.ability || pokemon.abilities?.["0"] || "Pressure";

            let moveNames: string[] = [];
            if (pokemon.moves && pokemon.moves.length > 0 && typeof pokemon.moves[0] !== "string") {
                moveNames = pokemon.moves.map((move: any) => move.name);
            } else if (pokemon.moves && pokemon.moves.length > 0) {
                moveNames = pokemon.moves;
            } else {
                moveNames = ["Tackle"];
            }

            let evsText = "EVs: 252 Atk / 4 SpD / 252 Spe";
            if (pokemon.evs) {
                if (typeof pokemon.evs === "string") {
                    evsText = pokemon.evs ? `EVs: ${pokemon.evs}` : evsText;
                } else if (typeof pokemon.evs === "object") {
                    const evEntries = Object.entries(
                        pokemon.evs as Record<string, number>
                    ).filter(([, value]) => value > 0);

                    if (evEntries.length > 0) {
                        evsText =
                            "EVs: " +
                            evEntries
                                .map(([stat, value]) => {
                                    if (stat === "spa") return `${value} SpA`;
                                    if (stat === "spd") return `${value} SpD`;
                                    if (stat === "spe") return `${value} Spe`;
                                    if (stat === "atk") return `${value} Atk`;
                                    if (stat === "def") return `${value} Def`;
                                    return `${value} HP`;
                                })
                                .join(" / ");
                    }
                }
            }

            let teraText = "";
            if (pokemon.teraType) {
                teraText = `Tera Type: ${pokemon.teraType}\n`;
            } else if (pokemon.types && pokemon.types.length > 0) {
                teraText = `Tera Type: ${pokemon.types[0]}\n`;
            }

            return `${pokemon.name} @ ${item}
Ability: ${ability}
${teraText}${evsText}
${nature} Nature
${moveNames.map((move: string) => `- ${move}`).join("\n")}`;
        })
        .join("\n\n");
}
