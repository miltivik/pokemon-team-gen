import { NextRequest, NextResponse } from 'next/server';
import { FORMATS, FormatId, getGenFromFormat } from '@/config/formats';
import { getPokemonData, getAllPokemonNames, getPokemonRole, isLegendaryOrParadox, isAvailableInGen, getRandomMovesWithDetails, getMoveData, MoveData } from '@/lib/showdown-data';
import { getCompetitiveSet } from '@/lib/competitive-sets';
import { TEMPLATES, TemplateId } from '@/config/templates';
import { isAllowedInFormat, getSmogonTierKey } from '@/lib/format-rules';
import { getRecommendedItem, getRecommendedSet } from '@/lib/recommended-items';
import { getViablePool, weightedRandom, UsageMon } from '@/lib/viability';
import { getAnalysis } from '@/lib/poke-analysis';

/**
 * Builds a team member from a competitive set or falls back to random generation.
 * Returns the fully constructed team member object.
 */
function buildTeamMember(
    mon: any,
    smogonTier: string,
    usedItems: Set<string>,
    isVGC: boolean,
    isDoubles: boolean,
): any {
    // Try to get a dynamic competitive set from Smogon data
    const compSet = getCompetitiveSet(mon.name, smogonTier);

    if (compSet) {
        // Resolve moves from display names → MoveData objects
        const moves = compSet.moves
            .map(m => getMoveData(m))
            .filter((m): m is MoveData => m !== undefined);

        let item = compSet.item;

        // Item Clause for VGC/Doubles: no duplicate items
        if ((isVGC || isDoubles) && usedItems.has(item)) {
            const altSet = getCompetitiveSet(mon.name, smogonTier);
            if (altSet && !usedItems.has(altSet.item)) {
                item = altSet.item;
            } else {
                const fallbackItems = [
                    'Sitrus Berry', 'Lum Berry', 'Safety Goggles',
                    'Covert Cloak', 'Clear Amulet', 'Scope Lens',
                    'Sharp Beak', 'Expert Belt', 'Protective Pads',
                    'Wide Lens', 'Muscle Band', 'Wise Glasses'
                ];
                const available = fallbackItems.find(i => !usedItems.has(i));
                if (available) item = available;
            }
        }

        usedItems.add(item);

        return {
            ...mon,
            moves: moves.length >= 1 ? moves : getRandomMovesWithDetails(mon.name),
            item,
            ability: compSet.ability,
            evs: compSet.evs,
            nature: compSet.nature,
            teraType: compSet.teraType,
        };
    }

    // Fallback: random moves + recommended item
    const moves = getRandomMovesWithDetails(mon.name);
    let item = getRecommendedItem(mon.name, smogonTier);

    // Item Clause for VGC/Doubles: no duplicate items
    if ((isVGC || isDoubles) && usedItems.has(item)) {
        const altSet = getRecommendedSet(mon.name, smogonTier);
        if (altSet && !usedItems.has(altSet.item)) {
            item = altSet.item;
        } else {
            const fallbackItems = [
                'Sitrus Berry', 'Lum Berry', 'Safety Goggles',
                'Covert Cloak', 'Clear Amulet', 'Scope Lens',
                'Sharp Beak', 'Expert Belt', 'Protective Pads',
                'Wide Lens', 'Muscle Band', 'Wise Glasses'
            ];
            const available = fallbackItems.find(i => !usedItems.has(i));
            if (available) item = available;
        }
    }

    usedItems.add(item);
    return { ...mon, moves, item };
}

export async function POST(req: NextRequest) {
    try {
        const { format, tipo, fijo, excludeLegendaries, templateId } = await req.json() as {
            format: FormatId;
            tipo?: string | null;
            fijo?: string | null;
            excludeLegendaries?: boolean;
            templateId?: TemplateId;
        };

        // Derive generation from the selected format (e.g. 'gen4ou' → 4)
        const gen = getGenFromFormat(format);
        const smogonTier = getSmogonTierKey(format);
        const isVGC = format.includes('vgc');
        const isDoubles = FORMATS[format].gameType === 'doubles';

        const maxTeamSize = FORMATS[format].maxTeamSize;
        const newTeam: any[] = [];
        const usedItems = new Set<string>(); // Track items for Item Clause

        // 1. Add fixed pokemon (also gets competitive set now)
        if (fijo) {
            const data = getPokemonData(fijo);
            if (data) {
                const member = buildTeamMember(data, smogonTier, usedItems, isVGC, isDoubles);
                newTeam.push(member);
            }
        }

        // Prepare pool
        const viablePool = getViablePool(format);
        let pool: (string | UsageMon)[] = viablePool.length > 0 ? viablePool : getAllPokemonNames();

        // 2. Apply Filters to Pool
        pool = pool.filter(entry => {
            const name = typeof entry === 'string' ? entry : entry.name;
            const p = getPokemonData(name);
            if (!p) return false;

            // Type Filter
            if (tipo) {
                if (!p.types.some(t => t.toLowerCase() === tipo.toLowerCase())) return false;
            }

            // Generation Filter — only include Pokémon that existed in this gen
            if (!isAvailableInGen(name, gen)) return false;

            // Format/Tier Filter — only include Pokémon allowed in this format
            if (gen === 9) {
                if (!isAllowedInFormat(name, format)) return false;
            }

            // Legendary / Paradox Filter
            if (excludeLegendaries) {
                if (isLegendaryOrParadox(name)) return false;
            }

            return true;
        });

        // 3. Fill the rest based on Template or Random
        const templateIdSafe = templateId as TemplateId | undefined;
        const template = templateIdSafe && TEMPLATES[templateIdSafe] ? TEMPLATES[templateIdSafe] : TEMPLATES['balanced'];

        let attempts = 0;
        const MAX_ATTEMPTS = 1000;

        while (newTeam.length < maxTeamSize && attempts < MAX_ATTEMPTS) {
            attempts++;
            if (pool.length === 0) break;

            let candidateName = "";
            let roleNeeded: string | undefined = undefined;

            // Determine role needed based on team position
            if (newTeam.length < template.roles.length) {
                roleNeeded = template.roles[newTeam.length];
            }

            // Try to find a pokemon for this role if specified
            if (roleNeeded) {
                const rolePool = pool.filter(entry => {
                    const name = typeof entry === 'string' ? entry : entry.name;
                    return getPokemonRole(name) === roleNeeded;
                });
                if (rolePool.length > 0) {
                    candidateName = weightedRandom(rolePool);
                } else {
                    candidateName = weightedRandom(pool);
                }
            } else {
                candidateName = weightedRandom(pool);
            }

            const mon = getPokemonData(candidateName);

            // Avoid duplicates
            if (mon && !newTeam.some(p => p.name === mon.name)) {
                const member = buildTeamMember(mon, smogonTier, usedItems, isVGC, isDoubles);
                newTeam.push(member);
                // Remove from pool to avoid infinite loops
                pool = pool.filter(entry => {
                    const name = typeof entry === 'string' ? entry : entry.name;
                    return name !== candidateName;
                });
            } else {
                // If it's a duplicate or invalid, still remove it to avoid picking it again infinitely
                pool = pool.filter(entry => {
                    const name = typeof entry === 'string' ? entry : entry.name;
                    return name !== candidateName;
                });
            }
        }

        // 4. Second pass: Dynamic Analysis with full team context
        const finalTeamNames = newTeam.map(p => p.name);
        const finalTeam = newTeam.map(p => {
            const analysis = getAnalysis(p.name, smogonTier, finalTeamNames.filter(n => n !== p.name));
            return { ...p, analysis };
        });

        return NextResponse.json(finalTeam);
    } catch (error) {
        console.error('Error generating team:', error);
        return NextResponse.json({ error: 'Failed to generate team' }, { status: 500 });
    }
}
