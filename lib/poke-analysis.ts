import { getPokemonData } from "@/lib/showdown-data";
import type { PokemonAnalysis } from "@/lib/team-guide";

export type { PokemonAnalysis } from "@/lib/team-guide";

export function getAnalysis(
  pokemonName: string,
  formatTier: string = "ou",
  teamMemberNames: string[] = []
): PokemonAnalysis {
  const pokemon = getPokemonData(pokemonName);
  const highSpeed = (pokemon?.baseStats.spe ?? 0) >= 100;
  const highOffense = Math.max(pokemon?.baseStats.atk ?? 0, pokemon?.baseStats.spa ?? 0) >= 110;
  const likelyRole = highSpeed && highOffense
    ? "Sweeper"
    : (pokemon?.baseStats.hp ?? 0) + (pokemon?.baseStats.def ?? 0) + (pokemon?.baseStats.spd ?? 0) >= 280
      ? "Wall"
      : "Support";
  const partner = teamMemberNames[0];

  return {
    role: likelyRole,
    howToPlay:
      likelyRole === "Sweeper"
        ? `${pokemonName} usually wants to preserve its HP for the turns where it can actually snowball or clean.`
        : likelyRole === "Wall"
          ? `${pokemonName} is usually more valuable when it is absorbing pressure and denying progress than when it is trading damage early.`
          : `${pokemonName} should usually be used to stabilize positioning and bring more explosive teammates into the right turns.`,
    evs: "252 HP / 252 Atk / 4 Def",
    nature: "Serious",
    checks: highSpeed
      ? ["Priority", "Bulky answers", "Status"]
      : ["Strong wallbreakers", "Repeated chip", "Setup users"],
    teammates: partner
      ? [{
        name: partner,
        isActive: true,
        reason: `${partner} helps ${pokemonName} reach the turns where it matters most.`,
      }]
      : [],
    synergyTip: partner
      ? {
        kind: "pairing",
        teammate: partner,
        headline: "Use this pairing with intent",
        detail: `${partner} is the most natural first partner to position with ${pokemonName} in this lineup.`,
      }
      : undefined,
    primaryFunction:
      likelyRole === "Sweeper"
        ? "Primary damage piece"
        : likelyRole === "Wall"
          ? "Defensive stabilizer"
          : "Support and positioning piece",
    summary:
      likelyRole === "Sweeper"
        ? `${pokemonName} should be preserved for the turns where its damage actually converts into a knockout chain.`
        : likelyRole === "Wall"
          ? `${pokemonName} is mainly here to keep the game stable and deny the opponent clean progress.`
          : `${pokemonName} gives the rest of the team safer entries and cleaner board states.`,
    keyMoves: [],
    preserve: ["Keep it healthy until you know which opposing piece it needs to answer."],
    avoid: ["Avoid trading it for low-value chip if another teammate can cover the same turn."],
    entryPoints: ["Bring it in through favorable positioning instead of forcing it into unnecessary damage."],
    decisionRules: [`In ${formatTier.toUpperCase()}, do not commit it unless the turn improves your board or your endgame map.`],
  };
}
