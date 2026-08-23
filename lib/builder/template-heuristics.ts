import { Template, TemplateId, TEMPLATES } from "@/config/templates";
import { PokemonSpecies } from "@/lib/data-sources/dex";
import type { NormalizedMonData } from "@/lib/data-sources/smogon-types";
import { pokemonCanLearnMove } from "@/lib/pokemon-learnsets";
import { toID } from "@/lib/utils";

export const PIVOT_MOVES = [
  "U-turn",
  "Volt Switch",
  "Flip Turn",
  "Teleport",
  "Parting Shot",
  "Chilly Reception",
];

export const HAZARD_MOVES = [
  "Stealth Rock",
  "Spikes",
  "Toxic Spikes",
  "Sticky Web",
  "Ceaseless Edge",
];

export const STACKING_HAZARD_MOVES = [
  "Spikes",
  "Toxic Spikes",
  "Sticky Web",
  "Ceaseless Edge",
];

export const REMOVAL_MOVES = [
  "Defog",
  "Rapid Spin",
  "Mortal Spin",
  "Court Change",
];

export const SCREEN_MOVES = ["Reflect", "Light Screen", "Aurora Veil"];

export const SETUP_MOVES = [
  "Swords Dance",
  "Dragon Dance",
  "Nasty Plot",
  "Quiver Dance",
  "Bulk Up",
  "Calm Mind",
  "Agility",
  "Shell Smash",
  "Shift Gear",
  "Trailblaze",
  "Howl",
  "Curse",
];

export const RECOVERY_MOVES = [
  "Recover",
  "Roost",
  "Soft-Boiled",
  "Slack Off",
  "Moonlight",
  "Morning Sun",
  "Synthesis",
  "Shore Up",
  "Wish",
  "Strength Sap",
  "Rest",
  "Milk Drink",
  "Lunar Blessing",
];

export const STALL_PAYOFF_MOVES = [
  "Protect",
  "Toxic",
  "Will-O-Wisp",
  "Thunder Wave",
  "Leech Seed",
  "Wish",
  "Heal Bell",
  "Aromatherapy",
  "Haze",
  "Knock Off",
];

export const LEAD_PRESSURE_MOVES = [
  "Stealth Rock",
  "Spikes",
  "Sticky Web",
  "Taunt",
  "Reflect",
  "Light Screen",
  "Aurora Veil",
];

export const DOUBLES_SUPPORT_MOVES = [
  "Protect",
  "Helping Hand",
  "Follow Me",
  "Rage Powder",
  "Wide Guard",
  "Quick Guard",
  "Icy Wind",
  "Fake Out",
  "Taunt",
];

export const RAIN_PAYOFF_MOVES = [
  "Weather Ball",
  "Hurricane",
  "Thunder",
  "Flip Turn",
  "Protect",
  "Rain Dance",
];

export const SUN_PAYOFF_MOVES = [
  "Weather Ball",
  "Growth",
  "Solar Beam",
  "Morning Sun",
  "Protect",
  "Sunny Day",
];

export const SAND_PAYOFF_MOVES = [
  "Stealth Rock",
  "Protect",
  "Rock Slide",
  "Earthquake",
];

export const WEATHER_FLEX_MOVES = [
  "Weather Ball",
  "Hurricane",
  "Thunder",
  "Blizzard",
  "Protect",
];

export const VOLTTURN_ABILITY_IDS = [
  "regenerator",
  "intimidate",
  "static",
  "flamebody",
];

export const WEATHER_SETTER_ABILITY_IDS = [
  "drizzle",
  "drought",
  "sandstream",
  "snowwarning",
  "orichalcumpulse",
];

interface CandidateStatProfile {
  bulk: number;
  offense: number;
  maxOffense: number;
  speed: number;
}

const TEMPLATE_ID_BY_LABEL = new Map<string, TemplateId>();
for (const [templateId, candidate] of Object.entries(TEMPLATES)) {
  if (!TEMPLATE_ID_BY_LABEL.has(candidate.label)) {
    TEMPLATE_ID_BY_LABEL.set(candidate.label, templateId as TemplateId);
  }
}

const CANDIDATE_STAT_PROFILE_CACHE = new WeakMap<
  PokemonSpecies,
  CandidateStatProfile
>();

export function getTemplateId(template?: Template): TemplateId | null {
  if (!template) return null;
  return TEMPLATE_ID_BY_LABEL.get(template.label) ?? null;
}

export function hasAvailableMove(
  candidate: PokemonSpecies,
  stats: NormalizedMonData,
  moveName: string
) {
  const moveId = toID(moveName);
  return Boolean(stats.moves[moveId] || pokemonCanLearnMove(candidate.name, moveName));
}

export function countAvailableMoves(
  candidate: PokemonSpecies,
  stats: NormalizedMonData,
  moveNames: string[]
) {
  return moveNames.reduce((count, moveName) => {
    return count + (hasAvailableMove(candidate, stats, moveName) ? 1 : 0);
  }, 0);
}

export function teamHasAnyMove(teamMoves: Set<string>, moveNames: string[]) {
  return moveNames.some((moveName) => teamMoves.has(toID(moveName)));
}

export function getCandidateAbilityIds(
  candidate: PokemonSpecies,
  stats: NormalizedMonData
) {
  return new Set<string>([
    ...Object.keys(stats.abilities),
    ...Object.values(candidate.abilities).map(toID),
  ]);
}

export function teamHasAnyAbility(teamAbilities: Set<string>, abilityIds: string[]) {
  return abilityIds.some((abilityId) => teamAbilities.has(toID(abilityId)));
}

export function getCandidateStatProfile(candidate: PokemonSpecies) {
  const cached = CANDIDATE_STAT_PROFILE_CACHE.get(candidate);
  if (cached) return cached;

  const bulk =
    candidate.baseStats.hp + candidate.baseStats.def + candidate.baseStats.spd;
  const offense =
    candidate.baseStats.atk + candidate.baseStats.spa + candidate.baseStats.spe;
  const maxOffense = Math.max(candidate.baseStats.atk, candidate.baseStats.spa);

  const profile = {
    bulk,
    offense,
    maxOffense,
    speed: candidate.baseStats.spe,
  };
  CANDIDATE_STAT_PROFILE_CACHE.set(candidate, profile);
  return profile;
}

export function hasAnyType(candidate: PokemonSpecies, types: string[]) {
  const typeIds = new Set(candidate.types.map((type) => type.toLowerCase()));
  return types.some((type) => typeIds.has(type.toLowerCase()));
}
