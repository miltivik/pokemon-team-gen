/**
 * Pokémon Analysis Library
 * Aggregates Smogon sets data and hardcoded meta-knowledge to provide strategic depth.
 * Enhanced to support dynamic team-aware synergies.
 */

import setsData from '@/data/gen9-sets.json';
import { getWeaknesses, getResistances } from './type-chart';
import { getPokemonData } from './showdown-data';

const sets: Record<string, any> = setsData;

export interface PokemonAnalysis {
    role?: string;
    howToPlay?: string;
    evs: string;
    nature: string;
    checks: string[];
    teammates: {
        name: string;
        isActive: boolean;
        reason?: string;
        translationKey?: string;
        translationParams?: Record<string, string>;
    }[];
    synergyTip?: {
        key: string;
        params: Record<string, string>;
    };
}

/**
 * Meta-game knowledge with synergy explanations.
 */
const META_KNOWLEDGE: Record<string, {
    role: string;
    howToPlay: string;
    checks: string[];
    synergies: Record<string, string>; // Teammate name -> Why they work together
}> = {
    "Dragapult": {
        role: "role.meta.dragapult",
        howToPlay: "analysis.meta.dragapult.howToPlay",
        checks: ["Kingambit", "Ting-Lu", "Iron Treads"],
        synergies: {
            "Kingambit": "Kingambit covers Dragapult's Ghost and Dark weaknesses, while Dragapult can pivot Kingambit in safely.",
            "Great Tusk": "Great Tusk handles the physical walls that Dragapult struggles to break.",
            "Glimmora": "Provides Toxic Spikes that help Dragapult wear down its counters over time."
        }
    },
    "Great Tusk": {
        role: "role.meta.greatTusk",
        howToPlay: "analysis.meta.greatTusk.howToPlay",
        checks: ["Enamorus", "Iron Valiant", "Zapdos"],
        synergies: {
            "Gholdengo": "Form the 'Tusk-Ghold' core; Gholdengo prevents hazards from being defogged while Tusk removes enemy hazards.",
            "Slowking-Galar": "A perfect Regenerator core that covers each other's weaknesses beautifully.",
            "Kingambit": "Provides a strong offensive backbone that benefits from Tusk's hazard control."
        }
    },
    "Kingambit": {
        role: "role.meta.kingambit",
        howToPlay: "analysis.meta.kingambit.howToPlay",
        checks: ["Great Tusk", "Zamazenta", "Iron Valiant"],
        synergies: {
            "Gholdengo": "Gholdengo keeps hazards on the field, which Kingambit needs to secure KOs with Sucker Punch.",
            "Dragapult": "Dragapult's speed complements Kingambit's power; they can wear down shared checks like Great Tusk.",
            "Iron Moth": "Iron Moth destroys the Steel and Grass types that annoy Kingambit."
        }
    },
    "Gholdengo": {
        role: "role.meta.gholdengo",
        howToPlay: "analysis.meta.gholdengo.howToPlay",
        checks: ["Kingambit", "Roaring Moon", "Dragapult"],
        synergies: {
            "Great Tusk": "Tusk spins away hazards while Gholdengo blocks the enemy from doing the same. Essential for hazard stack teams.",
            "Glimmora": "Glimmora sets the hazards that Gholdengo is designed to protect.",
            "Samurott-Hisui": "Ceaseless Edge spikes are perfectly protected by Gholdengo's Good as Gold."
        }
    },
    "Zamazenta": {
        role: "role.meta.zamazenta",
        howToPlay: "analysis.meta.zamazenta.howToPlay",
        checks: ["Gholdengo", "Enamorus", "Skeledirge"],
        synergies: {
            "Slowking-Galar": "Chilly Reception allows Zamazenta to come in safely and start boosting.",
            "Kingambit": "Handles the Ghost types that Zamazenta's Fighting moves can't hit.",
            "Dragapult": "Provides speed and pivoting to bring Zamazenta into favorable matchups."
        }
    }
};

/**
 * Derives a human-readable EV string from the EV object.
 */
function formatEVs(evs: Record<string, number>): string {
    const parts = [];
    if (evs.hp) parts.push(`${evs.hp} HP`);
    if (evs.atk) parts.push(`${evs.atk} Atk`);
    if (evs.def) parts.push(`${evs.def} Def`);
    if (evs.spa) parts.push(`${evs.spa} SpA`);
    if (evs.spd) parts.push(`${evs.spd} SpD`);
    if (evs.spe) parts.push(`${evs.spe} Spe`);
    return parts.join(' / ') || 'No investment';
}

/**
 * Gets the strategic analysis for a Pokémon, considering current team members for synergies.
 */
export function getAnalysis(pokemonName: string, formatTier: string = 'ou', teamMemberNames: string[] = []): PokemonAnalysis {
    const metaInfo = META_KNOWLEDGE[pokemonName];
    const pokemonSets = sets[pokemonName];

    // Find the best set available for this Pokémon
    let bestSet: any = null;
    let setName: string = "Standard Set";

    if (pokemonSets) {
        const tierData = pokemonSets[formatTier] || pokemonSets['ou'] || Object.values(pokemonSets)[0];
        if (tierData) {
            const setNames = Object.keys(tierData);
            setName = setNames[0];
            bestSet = tierData[setName];
        }
    }

    const evs = bestSet?.evs ? formatEVs(bestSet.evs) : "252 HP / 252 Atk / 4 Def";
    const natureObj = bestSet?.nature;
    const nature = Array.isArray(natureObj) ? natureObj[0] : (natureObj || "Serious");

    // Algorithmic Synergy Detection
    const algorithmicTeammates = teamMemberNames.map((teammateName) => {
        const tObj: {
            name: string;
            isActive: boolean;
            reason?: string;
            translationKey?: string;
            translationParams?: Record<string, string>;
        } | null = null;

        // Priority to hardcoded meta-knowledge
        if (metaInfo?.synergies?.[teammateName]) {
            return {
                name: teammateName,
                isActive: true,
                reason: metaInfo.synergies[teammateName]
            };
        }

        // Fallback: Calculate synergy algorithmically
        const synergy = calculateSynergy(pokemonName, teammateName);
        if (synergy) {
            return {
                name: teammateName,
                isActive: true,
                ...synergy // Spreads translationKey and translationParams
            };
        }

        return null;
    }).filter(t => t !== null) as PokemonAnalysis['teammates'];

    // Merge hardcoded suggestions (that are NOT in the team) with active algorithmic ones
    // We want to show:
    // 1. Active teammates with synergies (Top priority)
    // 2. Hardcoded recommendations that are missing (to guide the user)

    const activeNames = new Set(algorithmicTeammates.map(t => t.name));
    const hardcodedSuggestions = (metaInfo?.synergies ? Object.keys(metaInfo.synergies) : [])
        .filter(name => !activeNames.has(name)) // Don't duplicate if already active
        .map(name => ({
            name,
            isActive: false,
            reason: metaInfo?.synergies?.[name]
        }));

    const teammates: PokemonAnalysis['teammates'] = [...algorithmicTeammates, ...hardcodedSuggestions];

    // Dynamic "How to Play" if strong synergy found
    let dynamicHowToPlay = metaInfo?.howToPlay;
    let synergyTip = undefined;

    const activeSynergy = teammates.find(t => t.isActive && (t.reason || t.translationKey));

    if (activeSynergy) {
        // Construct the tip structure
        synergyTip = {
            key: "analysis.synergy.tip",
            params: {
                teammate: activeSynergy.name,
                reason: activeSynergy.translationKey
                    ? `__t_${activeSynergy.translationKey}` // Hacky marker for nested translation in UI? Or just use valid params?
                    // actually we can't easily nest translations this way in simple t(). 
                    // Better approach: The UI should handle constructing the sentence.
                    // But we passed a full sentence in "reason" before.
                    // Let's pass the raw key/params to the Tip builder.
                    : (activeSynergy.reason || "complement its strengths"), // Fallback for hardcoded strings
                howToPlay: dynamicHowToPlay
            }
        };

        // If it's a structured key, we pass the separate parts to be assembled by the UI
        if (activeSynergy.translationKey) {
            synergyTip = {
                key: "analysis.synergy.tip",
                params: {
                    teammate: activeSynergy.name,
                    reason: `__key__${activeSynergy.translationKey}`, // We'll detect this in UI
                    howToPlay: dynamicHowToPlay,
                    ...activeSynergy.translationParams // Merge specific params like {type}
                }
            };
        }
    }

    const defaultChecks = ["Unaware Pokémon", "Faster Threats", "Strong Priority"];
    const checks = metaInfo?.checks || defaultChecks;
    const finalRole = metaInfo?.role || (setName !== "Standard Set" ? setName : undefined);

    return {
        role: finalRole,
        howToPlay: dynamicHowToPlay,
        evs: evs,
        nature: nature,
        checks: checks,
        teammates: teammates.slice(0, 6), // Limit to 6 to avoid UI clutter
        synergyTip: synergyTip
    };
}

/**
 * Calculates synergy between two Pokémon based on Types and Stats.
 * Returns a translation key object.
 */
function calculateSynergy(targetName: string, teammateName: string): { translationKey: string; translationParams: Record<string, string> } | null {
    const target = getPokemonData(targetName);
    const teammate = getPokemonData(teammateName);

    if (!target || !teammate) return null;

    // 1. Defensive Synergy: Teammate resists target's weaknesses
    const targetWeaknesses = getWeaknesses(target.types);
    const teammateResistances = getResistances(teammate.types);

    // Find weaknesses that the teammate resists
    const coveredWeaknesses = targetWeaknesses.filter(w => teammateResistances.includes(w));

    if (coveredWeaknesses.length > 0) {
        const typeCovered = coveredWeaknesses[0];
        return {
            translationKey: "analysis.synergy.resists",
            translationParams: { teammate: teammateName, type: typeCovered, target: targetName }
        };
    }

    // 2. Offensive Complement: Physical vs Special
    // Simple heuristic: Atk > SpA + 20 is Physical, SpA > Atk + 20 is Special
    const tAtk = target.baseStats.atk;
    const tSpA = target.baseStats.spa;
    const tmAtk = teammate.baseStats.atk;
    const tmSpA = teammate.baseStats.spa;

    const targetIsPhysical = tAtk > tSpA + 20;
    const targetIsSpecial = tSpA > tAtk + 20;
    const teammateIsPhysical = tmAtk > tmSpA + 20;
    const teammateIsSpecial = tmSpA > tmAtk + 20;

    if (targetIsPhysical && teammateIsSpecial) {
        return {
            translationKey: "analysis.synergy.specialComplement",
            translationParams: { teammate: teammateName, target: targetName }
        };
    }
    if (targetIsSpecial && teammateIsPhysical) {
        return {
            translationKey: "analysis.synergy.physicalComplement",
            translationParams: { teammate: teammateName, target: targetName }
        };
    }

    // 3. Speed Control (Fast + Slow/Bulky)
    const tSpe = target.baseStats.spe;
    const tmSpe = teammate.baseStats.spe;
    if (tSpe > 100 && tmSpe < 60) {
        return {
            translationKey: "analysis.synergy.bulkyPivot",
            translationParams: { teammate: teammateName, target: targetName }
        };
    }

    return null;
}
