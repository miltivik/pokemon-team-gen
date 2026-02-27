import { generateDynamicTeam } from '../lib/dynamic-builder';
import { FormatId } from '../config/formats';
import { TemplateId } from '../config/templates';

async function runTests() {
    console.log("=========================================");
    console.log("   POKEMON TEAM GENERATION TEST SUITE    ");
    console.log("=========================================\n");

    const tests: { format: FormatId, template: TemplateId, fixedMembers?: string[] }[] = [
        { format: 'gen9ou', template: 'balanced' },
        { format: 'gen9ou', template: 'offense' },
        { format: 'gen9ou', template: 'stall', fixedMembers: ['blissey', 'skarmory'] },
        { format: 'gen9vgc2026f', template: 'balanced', fixedMembers: ['ogerpon'] },
        { format: 'gen8ou', template: 'balanced' }
    ];

    for (const test of tests) {
        console.log(`\n--- Testing Format: ${test.format} | Template: ${test.template} | Fixed: ${test.fixedMembers?.join(',') || 'None'} ---`);

        try {
            console.time('Generation Time');
            const result = await generateDynamicTeam({
                format: test.format,
                templateId: test.template,
                fixedMembers: test.fixedMembers,
                lang: 'en'
            });
            console.timeEnd('Generation Time');

            console.log("\nTEAM GENERATED:");
            result.team.forEach((mon, i) => {
                console.log(`  ${i + 1}. ${mon.name.padEnd(16)} | Role: ${mon.role.padEnd(12)} | Tera: ${mon.teraType || 'N/A'}`);
                console.log(`     Item: ${mon.item} | Ability: ${mon.ability}`);
                console.log(`     Moves: ${mon.moves.join(', ')}`);
                console.log(`     EVs: ${mon.evs}\n`);
            });

            if (result.team.length !== 6) {
                console.warn(`⚠️  WARNING: Team generated with ${result.team.length} members instead of 6.`);
            }

        } catch (error) {
            console.error(`❌ ERROR generating team for ${test.format}:`, error);
        }
    }

    console.log("\n=========================================");
    console.log("              TEST SUITE DONE            ");
    console.log("=========================================");
}

runTests();
