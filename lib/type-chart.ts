/**
 * Pokémon Type Chart & Effectiveness Logic
 */

export type Type =
    | 'Normal' | 'Fire' | 'Water' | 'Electric' | 'Grass' | 'Ice'
    | 'Fighting' | 'Poison' | 'Ground' | 'Flying' | 'Psychic' | 'Bug'
    | 'Rock' | 'Ghost' | 'Dragon' | 'Steel' | 'Dark' | 'Fairy';

// 0: No Effect, 0.5: Not Very Effective, 1: Normal, 2: Super Effective
const TYPE_CHART: Record<string, Record<string, number>> = {
    Normal: { Rock: 0.5, Ghost: 0, Steel: 0.5 },
    Fire: { Fire: 0.5, Water: 0.5, Grass: 2, Ice: 2, Bug: 2, Rock: 0.5, Dragon: 0.5, Steel: 2 },
    Water: { Fire: 2, Water: 0.5, Grass: 0.5, Ground: 2, Rock: 2, Dragon: 0.5 },
    Electric: { Water: 2, Electric: 0.5, Grass: 0.5, Ground: 0, Flying: 2, Dragon: 0.5 },
    Grass: { Fire: 0.5, Water: 2, Grass: 0.5, Poison: 0.5, Ground: 2, Flying: 0.5, Bug: 0.5, Rock: 2, Dragon: 0.5, Steel: 0.5 },
    Ice: { Fire: 0.5, Water: 0.5, Grass: 2, Ice: 0.5, Ground: 2, Flying: 2, Dragon: 2, Steel: 0.5 },
    Fighting: { Normal: 2, Ice: 2, Poison: 0.5, Flying: 0.5, Psychic: 0.5, Bug: 0.5, Rock: 2, Ghost: 0, Dark: 2, Steel: 2, Fairy: 0.5 },
    Poison: { Grass: 2, Poison: 0.5, Ground: 0.5, Rock: 0.5, Ghost: 0.5, Steel: 0, Fairy: 2 },
    Ground: { Fire: 2, Electric: 2, Grass: 0.5, Poison: 2, Flying: 0, Bug: 0.5, Rock: 2, Steel: 2 },
    Flying: { Electric: 0.5, Grass: 2, Fighting: 2, Bug: 2, Rock: 0.5, Steel: 0.5 },
    Psychic: { Fighting: 2, Poison: 2, Psychic: 0.5, Dark: 0, Steel: 0.5 },
    Bug: { Fire: 0.5, Grass: 2, Fighting: 0.5, Poison: 0.5, Flying: 0.5, Psychic: 2, Ghost: 0.5, Dark: 2, Steel: 0.5, Fairy: 0.5 },
    Rock: { Fire: 2, Ice: 2, Fighting: 0.5, Ground: 0.5, Flying: 2, Bug: 2, Steel: 0.5 },
    Ghost: { Normal: 0, Psychic: 2, Ghost: 2, Dark: 0.5 },
    Dragon: { Dragon: 2, Steel: 0.5, Fairy: 0 },
    Steel: { Fire: 0.5, Water: 0.5, Electric: 0.5, Ice: 2, Rock: 2, Steel: 0.5, Fairy: 2 },
    Dark: { Fighting: 0.5, Psychic: 2, Ghost: 2, Dark: 0.5, Fairy: 0.5 },
    Fairy: { Fire: 0.5, Fighting: 2, Poison: 0.5, Dragon: 2, Dark: 2, Steel: 0.5 }
};

/**
 * Returns the damage multiplier for an attack type against a set of defender types.
 */
export function getEffectiveness(attackType: string, defenderTypes: string[]): number {
    let multiplier = 1;
    const attack = attackType.charAt(0).toUpperCase() + attackType.slice(1).toLowerCase();

    if (!TYPE_CHART[attack]) return 1;

    defenderTypes.forEach(t => {
        const def = t.charAt(0).toUpperCase() + t.slice(1).toLowerCase();
        const effectiveness = TYPE_CHART[attack][def];
        if (effectiveness !== undefined) {
            multiplier *= effectiveness;
        }
    });

    return multiplier;
}

/**
 * Returns a list of types that are super effective (>= 2x) against the given defender types.
 */
export function getWeaknesses(defenderTypes: string[]): string[] {
    const weaknesses: string[] = [];
    Object.keys(TYPE_CHART).forEach(attackType => {
        if (getEffectiveness(attackType, defenderTypes) >= 2) {
            weaknesses.push(attackType);
        }
    });
    return weaknesses;
}

/**
 * Returns a list of types that the defender resists (< 1x) or is immune to (0x).
 */
export function getResistances(defenderTypes: string[]): string[] {
    const resistances: string[] = [];
    Object.keys(TYPE_CHART).forEach(attackType => {
        const eff = getEffectiveness(attackType, defenderTypes);
        if (eff < 1) {
            resistances.push(attackType);
        }
    });
    return resistances;
}
