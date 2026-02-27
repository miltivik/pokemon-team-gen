import { SmogonDataSource } from './data-sources/smogon';
import { DexProvider, PokemonSpecies } from './data-sources/dex';
import { WeightedScoringEngine } from './builder/scoring';
import { SetOptimizer, OptimizedSet } from './builder/set-optimizer';
import { getGenFromFormat, FormatId } from '@/config/formats';
import { PokemonAnalysis, getAnalysis } from './poke-analysis';
import { TEMPLATES, TemplateId, Template } from '@/config/templates';
import { NormalizedSmogonData } from './data-sources/smogon';
import { toID } from './utils';

// Re-export interfaces for compatibility
export interface TeamMember {
    name: string;
    item: string;
    ability: string;
    moves: string[];
    evs: string;
    nature: string;
    role: string;
    teraType?: string;
    analysis?: PokemonAnalysis;
}

export interface GamePhase {
    summary: string;
    steps: string[];
    keyPokemon: string;
    threats: string[];
}

export interface DynamicTeamResponse {
    team: TeamMember[];
    gameplan: {
        early: GamePhase;
        mid: GamePhase;
        late: GamePhase;
    };
    gameplanI18n: {
        en: { early: GamePhase; mid: GamePhase; late: GamePhase };
        es: { early: GamePhase; mid: GamePhase; late: GamePhase };
    };
}

interface DynamicTeamOptions {
    format?: string;
    type?: string | null;
    excludeLegendaries?: boolean;
    fixedMembers?: string[] | null;
    templateId?: TemplateId;
    lang?: 'en' | 'es';
}

export async function generateDynamicTeam(options: DynamicTeamOptions = {}): Promise<DynamicTeamResponse> {
    const { format = 'gen9ou', type = null, excludeLegendaries = false, templateId = 'balanced', lang = 'en', fixedMembers } = options;

    // 1. Initialize Context
    const gen = getGenFromFormat(format as FormatId) || 9;
    let data = await SmogonDataSource.getStats(format);

    // Fallback if data is null (e.g. gen6monotype -> gen6ou)
    if (!data) {
        const fallbackFormat = `gen${gen}ou`;
        if (format !== fallbackFormat) {
            data = await SmogonDataSource.getStats(fallbackFormat);
        }
    }

    // Ultimate fallback if no data exists (create mock data based on Dex)
    const finalData: NormalizedSmogonData = data || generateMockData(format, gen);

    const template: Template | undefined = TEMPLATES[templateId as TemplateId];

    const team: TeamMember[] = [];
    const teamSpecies: PokemonSpecies[] = [];

    // Track assigned moves/abilities for template synergy
    const teamMoves = new Set<string>();
    const teamAbilities = new Set<string>();

    const engine = new WeightedScoringEngine(format, gen, finalData, {
        excludeLegendaries,
        requiredType: type,
        template,
        getTeamMoves: () => teamMoves,
        getTeamAbilities: () => teamAbilities
    });

    const optimizer = new SetOptimizer(finalData);

    // 2. Add Fixed Members
    if (fixedMembers && fixedMembers.length > 0) {
        for (const fixed of fixedMembers) {
            if (team.length >= 6) break;
            const species = DexProvider.getSpeciesForGen(fixed, gen);
            if (species) {
                const set = optimizer.optimize(species, teamSpecies, { template, teamMoves, teamAbilities });
                const member = convertToTeamMember(species, set);
                team.push(member);
                teamSpecies.push(species);
                set.moves.forEach(m => teamMoves.add(toID(m)));
                teamAbilities.add(toID(set.ability));
            }
        }
    }

    // 3. Build Team Loop
    while (team.length < 6) {
        let suggestions = engine.suggestMembers(teamSpecies, 25);
        if (suggestions.length === 0) break; // Should not happen with robust fallback

        const targetRole = template?.roles?.[team.length];
        if (targetRole) {
            const roleSuggestions = suggestions.filter(s => {
                const set = optimizer.optimize(s.species, teamSpecies, { template, teamMoves, teamAbilities });
                return detectRole(set.moves, set.evs) === targetRole;
            });
            if (roleSuggestions.length > 0) suggestions = roleSuggestions;
        }

        // Pick from top suggestions with weighted randomness to add variety
        const weights = suggestions.map((s, i) => s.score * Math.pow(0.6, i));
        const totalWeight = weights.reduce((a, b) => a + b, 0);
        let random = Math.random() * totalWeight;
        let selectedIndex = 0;

        for (let i = 0; i < weights.length; i++) {
            random -= weights[i];
            if (random <= 0) {
                selectedIndex = i;
                break;
            }
        }

        const best = suggestions[selectedIndex];

        // Optimize Set contextually
        const set = optimizer.optimize(best.species, teamSpecies, { template, teamMoves, teamAbilities });

        const member = convertToTeamMember(best.species, set);
        team.push(member);
        teamSpecies.push(best.species);

        // Update tracked moves/abilities
        set.moves.forEach(m => teamMoves.add(toID(m)));
        teamAbilities.add(toID(set.ability));
    }

    // 4. Generate Analysis & Gameplan (Legacy adaptation)
    for (const member of team) {
        // Simple analysis generation for now
        member.analysis = getAnalysis(member.name, format, team.map(m => m.name).filter(n => n !== member.name));
    }

    const gameplan = generateGameplan(team, templateId, lang);
    const gameplanEn = lang === 'en' ? gameplan : generateGameplan(team, templateId, 'en');
    const gameplanEs = lang === 'es' ? gameplan : generateGameplan(team, templateId, 'es');

    return {
        team,
        gameplan,
        gameplanI18n: {
            en: gameplanEn,
            es: gameplanEs
        }
    };
}

function convertToTeamMember(species: PokemonSpecies, set: OptimizedSet): TeamMember {
    const statMap: Record<string, string> = {
        hp: 'HP', atk: 'Atk', def: 'Def', spa: 'SpA', spd: 'SpD', spe: 'Spe'
    };
    const evsStr = Object.entries(set.evs)
        .filter(([_, val]) => val > 0)
        .map(([stat, val]) => `${val} ${statMap[stat.toLowerCase()] || stat.toUpperCase()}`)
        .join(' / ');

    return {
        name: species.name,
        item: set.item,
        ability: set.ability,
        moves: set.moves,
        nature: set.nature,
        evs: evsStr,
        role: detectRole(set.moves, set.evs), // Helper below
        teraType: set.teraType || 'Stellar'
    };
}

function generateMockData(format: string, gen: number): NormalizedSmogonData {
    const data: NormalizedSmogonData = {
        meta: { format, totalBattles: 100 },
        pokemon: {}
    };

    const allSpecies = DexProvider.getAllSpecies();
    for (const species of allSpecies) {
        const mon = DexProvider.getSpeciesForGen(species.name, gen);
        if (!mon) continue;

        const isNFE = mon.evos && mon.evos.length > 0;
        if (isNFE) continue; // Skip NFE to make fallback better

        data.pokemon[toID(mon.name)] = {
            name: mon.name,
            usageRate: 0.1, // High enough to be considered
            teammates: {},
            moves: {},
            items: {},
            abilities: {},
            teraTypes: {},
            spreads: []
        };
    }
    return data;
}

function detectRole(moves: string[], evs: { hp: number, atk: number, spa: number, def: number, spd: number, spe: number }): string {
    const isOffensive = evs.atk > 150 || evs.spa > 150 || evs.spe > 150;
    const isDefensive = evs.hp > 150 || evs.def > 150 || evs.spd > 150;

    if (moves.some(m => ['Stealth Rock', 'Spikes', 'Toxic Spikes', 'Sticky Web', 'Defog', 'Rapid Spin'].includes(m))) return 'Support';

    if (isDefensive && !isOffensive) return 'Wall';
    if (isDefensive && isOffensive) return 'Tank';

    if (moves.some(m => ['Swords Dance', 'Dragon Dance', 'Nasty Plot', 'Quiver Dance', 'Shell Smash'].includes(m))) return 'Sweeper';
    if (evs.spe > 200 && (evs.atk > 200 || evs.spa > 200)) return 'Sweeper';

    if (evs.atk > 200 || evs.spa > 200) return 'Wallbreaker';

    return 'Pivot';
}

// --- Legacy Gameplan Generator (Simplified for brevity but functional) ---
// Note: In a full refactor, this would be moved to its own file.
function generateGameplan(team: TeamMember[], templateId: string, lang: 'en' | 'es'): { early: GamePhase; mid: GamePhase; late: GamePhase } {
    const es = lang === 'es';
    // Simplified logic for MVP
    return {
        early: {
            summary: es ? "Establece control temprano." : "Establish early control.",
            steps: [es ? "Coloca hazards si es posible." : "Set hazards if possible."],
            keyPokemon: team[0]?.name || "Lead",
            threats: []
        },
        mid: {
            summary: es ? "Mantén la presión y pivota." : "Maintain pressure and pivot.",
            steps: [es ? "Identifica la wincon rival." : "Identify opposing wincon."],
            keyPokemon: team[1]?.name || "Pivot",
            threats: []
        },
        late: {
            summary: es ? "Limpia con tu sweeper." : "Clean up with your sweeper.",
            steps: [es ? "Usa tu ventaja para cerrar." : "Use advantage to close."],
            keyPokemon: team[team.length - 1]?.name || "Sweeper",
            threats: []
        }
    };
}
