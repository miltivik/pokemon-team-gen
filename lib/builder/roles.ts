import type { Role } from "@/lib/showdown-data";
import { toID } from "@/lib/utils";

interface SetLike {
  moves: string[];
  evs: {
    hp: number;
    atk: number;
    def: number;
    spa: number;
    spd: number;
    spe: number;
  };
}

const SUPPORT_MOVES = new Set([
  "trickroom",
  "tailwind",
  "stealthrock",
  "spikes",
  "toxicspikes",
  "stickyweb",
  "ceaselessedge",
  "defog",
  "rapidspin",
  "mortalspin",
  "courtchange",
  "lightscreen",
  "reflect",
  "auroraveil",
]);

const PIVOT_MOVES = new Set([
  "uturn",
  "voltswitch",
  "flipturn",
  "teleport",
  "partingshot",
  "chillyreception",
  "shedtail",
]);

const RECOVERY_MOVES = new Set([
  "recover",
  "roost",
  "softboiled",
  "slackoff",
  "morningsun",
  "moonlight",
  "synthesis",
  "shoreup",
  "wish",
  "strengthsap",
  "rest",
]);

const DEFENSIVE_UTILITY_MOVES = new Set([
  "protect",
  "toxic",
  "willowisp",
  "thunderwave",
  "leechseed",
  "haze",
  "encore",
  "taunt",
  "whirlwind",
  "roar",
  "knockoff",
]);

const SETUP_MOVES = new Set([
  "swordsdance",
  "dragondance",
  "nastyplot",
  "quiverdance",
  "bulkup",
  "calmmind",
  "agility",
  "shellsmash",
  "shiftgear",
  "trailblaze",
]);

function hasAnyMove(moveIds: Set<string>, candidates: Set<string>) {
  for (const moveId of candidates) {
    if (moveIds.has(moveId)) return true;
  }

  return false;
}

export function detectSetRole(set: SetLike): Role {
  const moveIds = new Set(set.moves.map((move) => toID(move)));
  const offensiveInvestment = set.evs.atk + set.evs.spa + set.evs.spe;
  const offensiveStats = set.evs.atk + set.evs.spa;
  const maxOffensiveInvestment = Math.max(set.evs.atk, set.evs.spa);
  const defensiveInvestment = set.evs.hp + set.evs.def + set.evs.spd;
  const hasRecovery = hasAnyMove(moveIds, RECOVERY_MOVES);
  const hasDefensiveUtility = hasAnyMove(moveIds, DEFENSIVE_UTILITY_MOVES);
  const hasSetup = hasAnyMove(moveIds, SETUP_MOVES);
  const hasStructuredSupport = hasAnyMove(moveIds, SUPPORT_MOVES);
  const hasRelevantPivot =
    hasAnyMove(moveIds, PIVOT_MOVES) &&
    (defensiveInvestment >= 180 || hasRecovery || hasDefensiveUtility);
  const isOffensiveSupportSet =
    (hasStructuredSupport || hasRelevantPivot) &&
    (hasSetup || maxOffensiveInvestment >= 180 || (set.evs.spe <= 52 && maxOffensiveInvestment >= 140));

  if ((hasStructuredSupport || hasRelevantPivot) && !isOffensiveSupportSet) return "Support";

  if (defensiveInvestment >= 300 && (hasRecovery || hasDefensiveUtility) && maxOffensiveInvestment < 140) {
    return "Wall";
  }

  if (
    hasSetup ||
    maxOffensiveInvestment >= 180 ||
    offensiveInvestment >= 420 ||
    (set.evs.spe >= 180 && maxOffensiveInvestment >= 160) ||
    (set.evs.spe <= 52 && offensiveStats >= 140)
  ) {
    return "Sweeper";
  }

  if (defensiveInvestment >= 240 && defensiveInvestment >= offensiveInvestment) {
    return "Tank";
  }

  if (defensiveInvestment >= offensiveInvestment) return "Tank";

  return "Sweeper";
}
