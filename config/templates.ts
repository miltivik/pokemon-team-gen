import { FORMATS, FormatId, GameType, getGenFromFormat } from "@/config/formats";
import { Role } from "@/lib/showdown-data";

export type TemplateId =
    | 'balanced' | 'offense' | 'bulkyoffense' | 'stall' | 'semistall'
    | 'weatheroffense' | 'rain' | 'sun' | 'sand'
    | 'trickroom' | 'tailwind' | 'voltturn' | 'hazardstack'
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
    /** Compatible game types for the template */
    supportedGameTypes?: GameType[];
    /** Minimum generation where the template makes sense */
    minGen?: number;
    /** Internal archetype validation requirements */
    requiredCore?: string[];
    supportPackages?: string[];
    forbiddenPatterns?: string[];
}

export const TEMPLATES: Record<TemplateId, Template> = {
    balanced: {
        label: "Balanced",
        supportedGameTypes: ['singles', 'doubles'],
        roles: ['Sweeper', 'Sweeper', 'Wall', 'Wall', 'Tank', 'Support'],
        supportPackages: ['hazards', 'removal', 'pivoting', 'speed-control']
    },
    offense: {
        label: "Hyper Offense",
        supportedGameTypes: ['singles', 'doubles'],
        roles: ['Sweeper', 'Sweeper', 'Sweeper', 'Sweeper', 'Sweeper', 'Support'],
        supportPackages: ['setup', 'lead-pressure', 'screens-or-hazards'],
        forbiddenPatterns: ['passive-double-wall-core']
    },
    bulkyoffense: {
        label: "Bulky Offense",
        supportedGameTypes: ['singles', 'doubles'],
        roles: ['Sweeper', 'Sweeper', 'Sweeper', 'Tank', 'Tank', 'Support'],
        supportPackages: ['pivoting', 'midgame-bulk']
    },
    voltturn: {
        label: "Volt-Turn",
        supportedGameTypes: ['singles'],
        minGen: 4,
        roles: ['Support', 'Sweeper', 'Sweeper', 'Wall', 'Tank', 'Sweeper'],
        preferredMoves: ['U-turn', 'Volt Switch', 'Flip Turn', 'Teleport', 'Knock Off', 'Taunt'],
        preferredAbilities: ['Regenerator', 'Intimidate', 'Static', 'Flame Body'],
        requiredCore: ['pivot-core'],
        supportPackages: ['knock-off', 'pivoting']
    },
    trickroom: {
        label: "Trick Room",
        supportedGameTypes: ['singles', 'doubles'],
        minGen: 4,
        roles: ['Support', 'Sweeper', 'Sweeper', 'Sweeper', 'Sweeper', 'Wall'],
        requiredMoves: ['Trick Room'],
        requiredCore: ['trick-room-setter', 'slow-breakers'],
        supportPackages: ['protect', 'positioning'],
        forbiddenPatterns: ['fast-fragile-stack']
    },
    tailwind: {
        label: "Tailwind",
        supportedGameTypes: ['doubles'],
        minGen: 4,
        roles: ['Support', 'Sweeper', 'Sweeper', 'Support', 'Tank', 'Support'],
        requiredMoves: ['Tailwind'],
        preferredMoves: ['Protect', 'Taunt', 'Icy Wind', 'Helping Hand', 'Wide Guard', 'Follow Me'],
        preferredAbilities: ['Prankster', 'Wind Rider', 'Competitive', 'Defiant'],
        requiredCore: ['tailwind-setter', 'speed-abusers'],
        supportPackages: ['fake-out', 'redirection', 'protect']
    },
    rain: {
        label: "Rain",
        supportedGameTypes: ['singles', 'doubles'],
        minGen: 3,
        roles: ['Support', 'Sweeper', 'Sweeper', 'Sweeper', 'Tank', 'Support'],
        requiredAbilities: ['Drizzle'],
        preferredMoves: ['Protect', 'Weather Ball', 'Hurricane', 'Thunder', 'Flip Turn'],
        preferredAbilities: ['Swift Swim', 'Rain Dish', 'Dry Skin', 'Hydration', 'Water Absorb', 'Storm Drain'],
        requiredCore: ['rain-setter', 'rain-abusers'],
        supportPackages: ['pivoting', 'weather-control']
    },
    sun: {
        label: "Sun",
        supportedGameTypes: ['singles', 'doubles'],
        minGen: 3,
        roles: ['Support', 'Sweeper', 'Sweeper', 'Sweeper', 'Tank', 'Support'],
        requiredAbilities: ['Drought', 'Orichalcum Pulse'],
        preferredMoves: ['Protect', 'Weather Ball', 'Growth', 'Solar Beam', 'Morning Sun'],
        preferredAbilities: ['Chlorophyll', 'Solar Power', 'Flower Gift', 'Protosynthesis'],
        requiredCore: ['sun-setter', 'sun-abusers'],
        supportPackages: ['pivoting', 'weather-control']
    },
    sand: {
        label: "Sand",
        supportedGameTypes: ['singles', 'doubles'],
        minGen: 2,
        roles: ['Support', 'Sweeper', 'Sweeper', 'Sweeper', 'Wall', 'Support'],
        requiredAbilities: ['Sand Stream'],
        preferredMoves: ['Stealth Rock', 'Protect', 'Rock Slide', 'Earthquake'],
        preferredAbilities: ['Sand Rush', 'Sand Force', 'Sand Veil'],
        requiredCore: ['sand-setter', 'sand-abusers'],
        supportPackages: ['rocks', 'pivoting']
    },
    weatheroffense: {
        label: "Weather Offense",
        supportedGameTypes: ['singles', 'doubles'],
        minGen: 3,
        roles: ['Support', 'Sweeper', 'Sweeper', 'Sweeper', 'Tank', 'Sweeper'],
        requiredAbilities: ['Drizzle', 'Drought', 'Sand Stream', 'Snow Warning', 'Orichalcum Pulse'],
        preferredMoves: ['Protect', 'Weather Ball', 'Hurricane', 'Thunder', 'Blizzard'],
        preferredAbilities: ['Swift Swim', 'Chlorophyll', 'Sand Rush', 'Slush Rush', 'Solar Power', 'Sand Force', 'Protosynthesis'],
        requiredCore: ['weather-setter', 'weather-abusers'],
        supportPackages: ['weather-control', 'protect']
    },
    hazardstack: {
        label: "Hazard Stack",
        supportedGameTypes: ['singles'],
        minGen: 4,
        roles: ['Support', 'Support', 'Sweeper', 'Sweeper', 'Wall', 'Tank'],
        requiredMoves: ['Stealth Rock'],
        preferredMoves: ['Spikes', 'Toxic Spikes', 'Sticky Web', 'Ceaseless Edge', 'Knock Off', 'Taunt'],
        preferredAbilities: ['Good as Gold'],
        requiredCore: ['rocks', 'stacking-hazards'],
        supportPackages: ['spinblock', 'knock-off']
    },
    semistall: {
        label: "Semi-Stall",
        supportedGameTypes: ['singles'],
        roles: ['Wall', 'Wall', 'Wall', 'Tank', 'Support', 'Sweeper'],
        preferredMoves: ['Recover', 'Roost', 'Soft-Boiled', 'Slack Off', 'Stealth Rock', 'Toxic', 'Defog', 'Wish', 'Protect'],
        preferredAbilities: ['Regenerator', 'Unaware', 'Magic Bounce', 'Natural Cure'],
        requiredCore: ['recovery-backbone'],
        supportPackages: ['hazards', 'removal']
    },
    stall: {
        label: "Stall",
        supportedGameTypes: ['singles'],
        roles: ['Wall', 'Wall', 'Wall', 'Wall', 'Support', 'Support'],
        preferredMoves: ['Recover', 'Roost', 'Soft-Boiled', 'Slack Off', 'Stealth Rock', 'Spikes', 'Toxic', 'Defog', 'Wish', 'Protect', 'Heal Bell', 'Aromatherapy'],
        preferredAbilities: ['Unaware', 'Regenerator', 'Magic Bounce', 'Natural Cure', 'Purifying Salt'],
        requiredCore: ['recovery-backbone'],
        supportPackages: ['hazards', 'removal']
    },
    random: {
        label: "Random",
        supportedGameTypes: ['singles', 'doubles'],
        roles: []
    }
};

const ALL_TEMPLATE_IDS = Object.keys(TEMPLATES) as TemplateId[];

export function isTemplateCompatible(templateId: TemplateId, formatId: FormatId): boolean {
    const template = TEMPLATES[templateId];
    const format = FORMATS[formatId];

    if (!template || !format) return false;

    if (
        template.supportedGameTypes &&
        !template.supportedGameTypes.includes(format.gameType)
    ) {
        return false;
    }

    const generation = getGenFromFormat(formatId);
    if (template.minGen && generation < template.minGen) {
        return false;
    }

    return true;
}

export function getCompatibleTemplates(formatId: FormatId): TemplateId[] {
    return ALL_TEMPLATE_IDS.filter((templateId) =>
        isTemplateCompatible(templateId, formatId)
    );
}

export function sanitizeTemplateForFormat(
    templateId: TemplateId | undefined,
    formatId: FormatId
): TemplateId {
    if (templateId && isTemplateCompatible(templateId, formatId)) {
        return templateId;
    }

    const compatible = getCompatibleTemplates(formatId);
    return compatible.includes('balanced') ? 'balanced' : compatible[0] ?? 'random';
}
