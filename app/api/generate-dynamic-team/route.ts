
import { NextRequest, NextResponse } from 'next/server';
import { generateDynamicTeam } from '@/lib/dynamic-builder';

export async function POST(req: NextRequest) {
    try {
        const body = await req.json();
        const { format = 'gen9ou', tipo, excludeLegendaries, fijo, fijos, templateId = 'balanced', lang = 'en' } = body;

        // Support both old string format and new array format
        let fixedMembers: string[] | null = null;
        if (Array.isArray(fijos) && fijos.length > 0) {
            fixedMembers = fijos;
        } else if (typeof fijo === 'string' && fijo.trim()) {
            fixedMembers = [fijo.trim()];
        }

        console.log(`Generating dynamic team for format: ${format}, type: ${tipo}, fixed: ${fixedMembers?.join(', ')}, template: ${templateId}, lang: ${lang}`);

        const result = await generateDynamicTeam({
            format,
            type: tipo,
            excludeLegendaries,
            fixedMembers,
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
