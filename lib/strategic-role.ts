import type { PokemonSpecies } from "@/lib/data-sources/dex";
import { HAZARD_MOVES, PIVOT_MOVES, REMOVAL_MOVES } from "@/lib/builder/template-heuristics";
import {
  STRATEGIC_ROLE_DESCRIPTION_KEYS,
  getStrategicRoleLabel,
} from "@/lib/strategic-role-label";
import { toID } from "@/lib/utils";

interface StrategicRoleInput {
  species?: Pick<PokemonSpecies, "baseStats">;
  moves?: string[];
  ability?: string;
  templateId?: string;
  broadRole?: string;
  otherTeamSpeeds?: number[];
}

export function inferPrimaryStrategicRole({
  species,
  moves = [],
  ability,
  templateId,
  broadRole,
  otherTeamSpeeds = [],
}: StrategicRoleInput): string | undefined {
  const moveIds = new Set(moves.map((move) => toID(move)));
  const hasMove = (moveName: string) => moveIds.has(toID(moveName));
  const speed = species?.baseStats?.spe ?? 0;
  const maxOffense = Math.max(
    species?.baseStats?.atk ?? 0,
    species?.baseStats?.spa ?? 0
  );
  const abilityId = toID(ability ?? "");
  const hasHazards = HAZARD_MOVES.some(hasMove);
  const hasPivotMove = PIVOT_MOVES.some(hasMove);
  const hasRemoval = REMOVAL_MOVES.some(hasMove);
  const averageOtherTeamSpeed =
    otherTeamSpeeds.length > 0
      ? otherTeamSpeeds.reduce((sum, value) => sum + value, 0) / otherTeamSpeeds.length
      : 0;
  const isRelativelyFastTrickRoomSetter =
    speed >= 55 || (otherTeamSpeeds.length > 0 && speed >= averageOtherTeamSpeed + 12);
  const hasSupportUtility =
    hasHazards ||
    hasPivotMove ||
    hasRemoval ||
    broadRole === "Support" ||
    broadRole === "Wall";
  const isDedicatedTrickRoomAbuser =
    templateId === "trickroom" &&
    speed <= 50 &&
    maxOffense >= 110 &&
    broadRole !== "Support";

  if (hasMove("Trick Room")) {
    if (hasSupportUtility || isRelativelyFastTrickRoomSetter) {
      return "Trick Room Setter";
    }

    if (isDedicatedTrickRoomAbuser) {
      return "Trick Room Sweeper";
    }

    return "Trick Room Setter";
  }

  if (hasMove("Tailwind")) {
    return "Tailwind Setter";
  }

  if (abilityId === "drizzle" || hasMove("Rain Dance")) {
    return "Rain Setter";
  }

  if (abilityId === "drought" || abilityId === "orichalcumpulse" || hasMove("Sunny Day")) {
    return "Sun Setter";
  }

  if (abilityId === "sandstream" || hasMove("Sandstorm")) {
    return "Sand Setter";
  }

  if (hasRemoval) {
    return "Hazard Control";
  }

  if (hasHazards) {
    if (speed >= 90 || hasMove("Taunt")) {
      return "Hazard Lead";
    }

    return "Hazard Setter";
  }

  if (hasPivotMove) {
    return "Pivot";
  }

  return broadRole;
}

export { getStrategicRoleLabel };

export function getStrategicRoleDescription(
  role: string | undefined,
  t: (key: string) => string
): string | undefined {
  if (!role) return undefined;

  const key = role.startsWith("role.")
    ? role
    : STRATEGIC_ROLE_DESCRIPTION_KEYS[role];

  return key ? t(key) : undefined;
}

export function getStrategicRoleHowToPlay(
  role: string | undefined,
  t: (key: string) => string
): string | undefined {
  if (!role) return undefined;

  const key = role.startsWith("role.")
    ? role
    : STRATEGIC_ROLE_DESCRIPTION_KEYS[role];

  if (!key) return undefined;

  const descKey = `${key}.desc`;
  const desc = t(descKey);

  // If translation falls back to the key itself, the description doesn't exist
  if (desc === descKey) return undefined;

  return desc;
}
