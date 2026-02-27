import { Role } from "@/lib/showdown-data";

export type TemplateId =
    | 'balanced' | 'offense' | 'bulkyoffense' | 'stall' | 'semistall'
    | 'weatheroffense' | 'rain' | 'sun' | 'sand'
    | 'trickroom' | 'voltturn' | 'hazardstack'
    | 'random';

export interface Template {
    label: string;
    roles: Role[];
    /** Abilities the lead/first mon MUST have (e.g. weather setters) */
    requiredAbilities?: string[];
    /** Moves the lead/first mon MUST know (e.g. Trick Room setters) */
    requiredMoves?: string[];
    /** Moves that teammates should prioritize having */
    preferredMoves?: string[];
    /** Abilities that teammates should prioritize having */
    preferredAbilities?: string[];
}

export const TEMPLATES: Record<TemplateId, Template> = {
    balanced: {
        label: "Balanced",
        roles: ['Sweeper', 'Sweeper', 'Wall', 'Wall', 'Tank', 'Support']
    },
    offense: {
        label: "Hyper Offense",
        roles: ['Sweeper', 'Sweeper', 'Sweeper', 'Sweeper', 'Sweeper', 'Support']
    },
    bulkyoffense: {
        label: "Bulky Offense",
        roles: ['Sweeper', 'Sweeper', 'Sweeper', 'Tank', 'Tank', 'Support']
    },
    voltturn: {
        label: "Volt-Turn",
        roles: ['Support', 'Sweeper', 'Sweeper', 'Wall', 'Tank', 'Sweeper'],
        preferredMoves: ['U-turn', 'Volt Switch', 'Flip Turn', 'Teleport']
    },
    trickroom: {
        label: "Trick Room",
        roles: ['Support', 'Sweeper', 'Sweeper', 'Sweeper', 'Sweeper', 'Wall'],
        requiredMoves: ['Trick Room']
    },
    rain: {
        label: "Rain",
        roles: ['Support', 'Sweeper', 'Sweeper', 'Sweeper', 'Tank', 'Support'],
        requiredAbilities: ['Drizzle'],
        preferredAbilities: ['Swift Swim', 'Rain Dish', 'Dry Skin', 'Hydration', 'Water Absorb', 'Storm Drain']
    },
    sun: {
        label: "Sun",
        roles: ['Support', 'Sweeper', 'Sweeper', 'Sweeper', 'Tank', 'Support'],
        requiredAbilities: ['Drought', 'Orichalcum Pulse'],
        preferredAbilities: ['Chlorophyll', 'Solar Power', 'Flower Gift', 'Protosynthesis']
    },
    sand: {
        label: "Sand",
        roles: ['Support', 'Sweeper', 'Sweeper', 'Sweeper', 'Wall', 'Support'],
        requiredAbilities: ['Sand Stream'],
        preferredAbilities: ['Sand Rush', 'Sand Force', 'Sand Veil']
    },
    weatheroffense: {
        label: "Weather Offense",
        roles: ['Support', 'Sweeper', 'Sweeper', 'Sweeper', 'Tank', 'Sweeper'],
        requiredAbilities: ['Drizzle', 'Drought', 'Sand Stream', 'Snow Warning', 'Orichalcum Pulse'],
        preferredAbilities: ['Swift Swim', 'Chlorophyll', 'Sand Rush', 'Slush Rush', 'Solar Power', 'Sand Force', 'Protosynthesis']
    },
    hazardstack: {
        label: "Hazard Stack",
        roles: ['Support', 'Support', 'Sweeper', 'Sweeper', 'Wall', 'Tank'],
        requiredMoves: ['Stealth Rock'],
        preferredMoves: ['Spikes', 'Toxic Spikes', 'Sticky Web', 'Ceaseless Edge']
    },
    semistall: {
        label: "Semi-Stall",
        roles: ['Wall', 'Wall', 'Wall', 'Tank', 'Support', 'Sweeper'],
        preferredMoves: ['Recover', 'Roost', 'Soft-Boiled', 'Slack Off', 'Stealth Rock', 'Toxic', 'Defog', 'Wish', 'Protect'],
        preferredAbilities: ['Regenerator', 'Unaware', 'Magic Bounce', 'Natural Cure']
    },
    stall: {
        label: "Stall",
        roles: ['Wall', 'Wall', 'Wall', 'Wall', 'Support', 'Support'],
        preferredMoves: ['Recover', 'Roost', 'Soft-Boiled', 'Slack Off', 'Stealth Rock', 'Spikes', 'Toxic', 'Defog', 'Wish', 'Protect', 'Heal Bell', 'Aromatherapy'],
        preferredAbilities: ['Unaware', 'Regenerator', 'Magic Bounce', 'Natural Cure', 'Purifying Salt']
    },
    random: {
        label: "Random",
        roles: []
    }
};
