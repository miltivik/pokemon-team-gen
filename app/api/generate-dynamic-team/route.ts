
import { NextRequest, NextResponse } from 'next/server';
import { generateDynamicTeam } from '@/lib/dynamic-builder';
import { TemplateId } from '@/config/templates';
import { z } from 'zod';

const generateTeamSchema = z.object({
    format: z.string().optional().default('gen9ou'),
    tipo: z.string().nullable().optional(),
    fijo: z.string().nullable().optional(),
    fijos: z.array(z.string()).nullable().optional(),
    excludeLegendaries: z.boolean().optional().default(false),
    templateId: z.string().optional().default('balanced'),
    lang: z.enum(['en', 'es']).optional().default('en'),
});

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

        const { format, tipo, excludeLegendaries, fijo, fijos, templateId, lang } = parsed.data;

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
            templateId: templateId as TemplateId,
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
