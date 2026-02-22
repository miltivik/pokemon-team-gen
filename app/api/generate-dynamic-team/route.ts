
import { NextRequest, NextResponse } from 'next/server';
import { generateDynamicTeam } from '@/lib/dynamic-builder';

export async function POST(req: NextRequest) {
    try {
        const body = await req.json();
        const { format = 'gen9ou', tipo, excludeLegendaries, fijo, templateId = 'balanced', lang = 'en' } = body;

        console.log(`Generating dynamic team for format: ${format}, type: ${tipo}, fixed: ${fijo}, template: ${templateId}, lang: ${lang}`);

        const result = await generateDynamicTeam({
            format,
            type: tipo,
            excludeLegendaries,
            fixedMember: fijo,
            templateId,
            lang
        });

        return NextResponse.json(result);
    } catch (error) {
        console.error('Error generating dynamic team:', error);
        return NextResponse.json(
            { error: 'Failed to generate team. Please try again later.' },
            { status: 500 }
        );
    }
}
