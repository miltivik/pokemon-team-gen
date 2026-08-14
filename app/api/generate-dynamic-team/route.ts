
import { NextRequest, NextResponse } from 'next/server';
import { generateDynamicTeam } from '@/lib/dynamic-builder';
import { sanitizeTemplateForFormat, TemplateId } from '@/config/templates';
import { getMoveData, getPokemonData } from '@/lib/showdown-data';
import { z } from 'zod';
import { FormatId } from '@/config/formats';
import { resolveFixedMembers } from '@/lib/team-generation-options';

const generateTeamSchema = z.object({
    format: z.string().optional().default('gen9ou'),
    tipo: z.string().nullable().optional(),
    fijo: z.string().nullable().optional(),
    fijos: z.array(z.string()).nullable().optional(),
    fixedMembers: z.array(z.string()).nullable().optional(),
    excludeLegendaries: z.boolean().optional().default(false),
    templateId: z.string().optional().default('balanced'),
    lang: z.enum(['en', 'es']).optional().default('en'),
});

interface HydratableTeamMember {
    name: string;
    moves?: unknown[];
    num?: number;
    types?: string[];
    baseStats?: { hp: number; atk: number; def: number; spa: number; spd: number; spe: number };
    abilities?: Record<string, string>;
}

function hydrateTeamForClient(team: HydratableTeamMember[]) {
    return team.map((member) => {
        const pokemonData = getPokemonData(member.name);
        const moves = Array.isArray(member.moves)
            ? member.moves.map((move) => {
                if (typeof move !== 'string') {
                    return move;
                }

                return getMoveData(move) ?? move;
            })
            : [];

        return {
            ...pokemonData,
            ...member,
            num: member.num ?? pokemonData?.num ?? 0,
            types: member.types ?? pokemonData?.types ?? [],
            baseStats: member.baseStats ?? pokemonData?.baseStats ?? { hp: 0, atk: 0, def: 0, spa: 0, spd: 0, spe: 0 },
            abilities: member.abilities ?? pokemonData?.abilities ?? {},
            moves,
        };
    });
}

export async function POST(req: NextRequest) {
    try {
        const body = await req.json();
        const parsed = generateTeamSchema.safeParse(body);

        if (!parsed.success) {
            return NextResponse.json(
                { error: 'Invalid request data', details: parsed.error.issues },
                { status: 400 }
            );
        }

        const {
            format,
            tipo,
            excludeLegendaries,
            fijo,
            fijos,
            fixedMembers: canonicalFixedMembers,
            templateId,
            lang,
        } = parsed.data;
        const safeTemplateId = sanitizeTemplateForFormat(
            templateId as TemplateId | undefined,
            format as FormatId
        );

        const fixedMembers = resolveFixedMembers({
            fixedMembers: canonicalFixedMembers,
            fijos,
            fijo,
        });

        const result = await generateDynamicTeam({
            format,
            type: tipo,
            excludeLegendaries,
            fixedMembers,
            templateId: safeTemplateId,
            lang
        });

        return NextResponse.json({
            ...result,
            team: hydrateTeamForClient(result.team),
        });
    } catch (error) {
        console.error('Error generating dynamic team:', error);
        return NextResponse.json(
            { error: 'Failed to generate team. Please try again later.' },
            { status: 500 }
        );
    }
}
